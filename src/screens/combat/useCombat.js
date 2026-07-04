import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { SKILLS } from '../../data/skills'
import { RESOURCES } from '../../data/resources'
import {
  calcBaseDamage,
  calcSkillDamage,
  canUseSkill,
  applySkillCost,
  calcDrops,
  calcExpGain,
  enemyAI,
  isDefeated,
  checkAwakeningConditions,
  tickStatusEffects,
  applyStatusEffect,
  getEffectiveStats,
  canHeal,
  getStatSacrifice,
  rollStatusProc,
} from '../../engine/combat'
import {
  getMalacharPhase,
  getCryptKeeperEnrage,
  rollCursedStrike,
  CURSED_STRIKE_EFFECT,
} from '../../engine/bossMechanics'
import { hasGluttony, isGluttonyReady, rollGluttonyProc } from '../../engine/gluttony'
import { getPassiveModifiers, PASSIVE_XP_PER_HIT } from '../../engine/passives'
import { applyVigorMalus, combatFatigueBuffer } from '../../engine/vigor'
import { auraDamageMult } from '../../engine/aura'
import { getBurnoutMalus } from '../../data/burnout'
import { bestiaryDamageBonus } from '../../data/bestiary'
import { getSkillVfx } from '../../engine/skillVfx'
import { calcEquippedStatBonuses } from '../../data/equipment'
import { getTitleStatBuffs } from '../../data/titles'
import { applyDebuffsToStats } from '../../utils/debuffs'
import { STATUS_META, ARENA_BACKGROUNDS, buildStatusEffectInstance } from './constants'

// REFAC03 — hook de logique de combat extrait de Combat.jsx.
// Comportement identique : tout l'état, les refs, les effets et les handlers y sont
// déplacés tels quels. Le composant Combat ne fait plus que consommer ce hook et
// composer les sous-composants de présentation.
export function useCombat() {
  const {
    hero,
    world,
    activeCombat,
    endCombat,
    recordKill,
    addResource,
    addGold,
    addSkillToInventory,
    gainSkillXp,
    gainExp,
    triggerDivineCall,
    recordCombatEntry,
    recentSkillLevelUps,
    clearSkillLevelUp,
    meta,
    absorbGluttony,
  } = useGameStore()

  const equipBonuses = calcEquippedStatBonuses(hero.equipped ?? {})
  // TITLE-BUF01 — buffs du titre actif appliqués à la même couche que l'équipement.
  const titleBuffs = getTitleStatBuffs(meta?.activeTitle)
  const equippedStats = { ...hero.stats }
  Object.entries(equipBonuses).forEach(([stat, bonus]) => {
    if (stat in equippedStats) equippedStats[stat] = (equippedStats[stat] ?? 0) + bonus
  })
  Object.entries(titleBuffs).forEach(([stat, bonus]) => {
    if (stat in equippedStats) equippedStats[stat] = (equippedStats[stat] ?? 0) + bonus
  })
  // CRF01 — les debuffs passifs réduisent les stats de combat
  const debuffedStats = applyDebuffsToStats(equippedStats, hero.activeDebuffs ?? [])
  // STA01 — la Fatigue (vigueur basse) réduit les stats de combat ; STA04 — l'Aura atténue ce malus
  const effectiveBaseStats = applyVigorMalus(
    debuffedStats,
    hero.vigor,
    combatFatigueBuffer(hero.aura),
  )
  // SKL-PASS — les passifs équipés boostent les PV max en combat (ex. Veteran's Resolve +20%)
  const passiveMods = getPassiveModifiers(hero.passiveSkills)
  const combatBaseStats =
    passiveMods.maxHpBonus > 0
      ? {
          ...effectiveBaseStats,
          maxHp: Math.round(effectiveBaseStats.maxHp * (1 + passiveMods.maxHpBonus)),
        }
      : effectiveBaseStats

  const [enemies, setEnemies] = useState(activeCombat?.enemies ?? [])
  const [heroStats, setHeroStats] = useState(combatBaseStats)
  const [heroSkills, setHeroSkills] = useState(
    hero.activeSkills.map((s) => ({ ...s, currentCooldown: 0 })),
  )
  const [heroEffects, setHeroEffects] = useState([]) // B05 — effets de statut sur le héros
  const [phase, setPhase] = useState('player')
  const [result, setResult] = useState(null)
  const [confirmEscape, setConfirmEscape] = useState(false) // CMB-ESCAPE01 — filet anti-blocage
  const [selectedAction, setSelectedAction] = useState('attack')
  const [log, setLog] = useState([])
  const [loot, setLoot] = useState([])
  const [isBoss, setIsBoss] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedTargetId, setSelectedTargetId] = useState(null)
  const [heroHitFlash, setHeroHitFlash] = useState(false)
  const [turnCount, setTurnCount] = useState(1)
  const [animatingEnemyId, setAnimatingEnemyId] = useState(null) // id ennemi qui reçoit un coup
  const [animatingHero, setAnimatingHero] = useState(false) // héros qui reçoit un coup
  const [skillFx, setSkillFx] = useState(null) // ANIM02 — VFX skill en cours : { targetIds, element, color, mode, aoe, heavy }
  const [arenaSkillShake, setArenaSkillShake] = useState(false) // ANIM02 — secousse d'arène (gros skill / AoE)
  const [heroAttackAnim, setHeroAttackAnim] = useState(false) // B13 — héros qui lance une attaque/skill
  const [attackingEnemyId, setAttackingEnemyId] = useState(null) // B02 — ennemi qui frappe
  const [floatingNumbers, setFloatingNumbers] = useState([]) // B07 — [{id, targetId, amount, type}]
  // B08 — stats de combat pour le résumé
  const [combatStats, setCombatStats] = useState({
    dmgDealt: 0,
    dmgTaken: 0,
    manaSpent: 0,
    kills: 0,
  })

  const bossStateRef = useRef({ enraged: false, lastPhase: 1 }) // BSS01/03
  const assassinatedRef = useRef(new Set()) // GLT02 — ennemis tués en 1 coup depuis HP max
  const resolvedRef = useRef(false) // garde anti-double résolution (victoire/défaite)
  const [gluttonyChoice, setGluttonyChoice] = useState(null) // GLT02 — { monsterId } pour le modal de choix
  const heroStatsRef = useRef(heroStats)
  // Mise à jour du ref hors render (évite l'erreur ESLint react-hooks/refs)
  useEffect(() => {
    heroStatsRef.current = heroStats
  }, [heroStats])

  const addLog = useCallback((text, type = 'info') => {
    setLog((prev) => [{ text, type, id: Date.now() + Math.random() }, ...prev].slice(0, 25))
  }, [])

  // B07 — push un nombre flottant, auto-cleanup après 800ms
  const pushFloatingNumber = useCallback((targetId, amount, type = 'damage') => {
    const id = Date.now() + Math.random()
    setFloatingNumbers((prev) => [...prev, { id, targetId, amount, type }])
    setTimeout(() => setFloatingNumbers((prev) => prev.filter((n) => n.id !== id)), 800)
  }, [])

  // S04 — Notif level-up de skill : afficher floating + log, puis clear
  useEffect(() => {
    if (!recentSkillLevelUps || recentSkillLevelUps.length === 0) return
    recentSkillLevelUps.forEach((entry) => {
      // Le floating number affiche "✦ Lv X" sur le héros
      const id = Date.now() + Math.random()
      setFloatingNumbers((prev) => [
        ...prev,
        { id, targetId: 'hero', amount: `Lv ${entry.toLevel}`, type: 'levelup' },
      ])
      setTimeout(() => setFloatingNumbers((prev) => prev.filter((n) => n.id !== id)), 1100)
      // Log
      const skillName = SKILLS[entry.skillId]?.name ?? entry.skillId
      addLog(`✦ ${skillName} → Lv ${entry.toLevel}!`, 'levelup')
      // Clear l'entrée du store
      clearSkillLevelUp(entry.id)
    })
  }, [recentSkillLevelUps, clearSkillLevelUp, addLog])

  // Initialisation au mount du combat — sync activeCombat → state local
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!activeCombat) return
    resolvedRef.current = false
    const initial = activeCombat.enemies
    setEnemies(initial)
    setIsBoss(initial.some((e) => ['boss', 'demon_lord', 'elite'].includes(e.rank)))
    setSelectedTargetId(initial[0]?.id ?? null)
    recordCombatEntry()
    addLog(
      `Battle begins! (${initial.length} ${initial.length > 1 ? 'enemies' : 'enemy'})`,
      'system',
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const finishCombat = useCallback(
    (outcome, cause = 'Unknown enemy') => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      const finalStats = heroStatsRef.current
      try {
        useGameStore.setState((state) => ({
          hero: {
            ...state.hero,
            stats: { ...state.hero.stats, hp: finalStats.hp, mana: finalStats.mana },
          },
        }))
      } catch (err) {
        // CMB-WIN-FIX — ne jamais bloquer la résolution du combat sur une erreur d'état.
        console.error('[Combat] Échec de sauvegarde des PV/PM en fin de combat :', err)
      }
      if (outcome === 'defeat') {
        addLog('You have fallen...', 'defeat')
        setTimeout(() => useGameStore.getState().heroDeath(cause), 1000)
        return
      }
      setResult(outcome)
      setPhase('result')
    },
    [addLog],
  )

  const handleVictory = useCallback(
    (defeatedEnemies) => {
      if (resolvedRef.current) return // évite double-comptage si déclenché plusieurs fois
      resolvedRef.current = true
      addLog('Victory!', 'victory')
      // CMB-WIN-FIX — Robustesse : TOUTE la distribution de récompenses est encapsulée
      // dans un try/catch. Auparavant, si une seule récompense throwait (save corrompue,
      // id de monstre/ressource manquant, champ non migré…), handleVictory s'interrompait
      // APRÈS avoir loggé « Victory! » mais AVANT setPhase('result') → le joueur restait
      // bloqué sur l'écran de combat, et resolvedRef (déjà true) neutralisait le filet de
      // sécurité. On garantit désormais que la transition vers le ResultPanel a TOUJOURS lieu.
      let divineCall = null
      try {
        setCombatStats((s) => ({ ...s, kills: defeatedEnemies.length })) // B08
        const allLoot = []
        defeatedEnemies.forEach((e) => {
          const drops = calcDrops(
            e.monsterId,
            heroStatsRef.current.chance,
            meta?.bestiaryKills?.[e.monsterId] ?? 0,
          )
          drops.resources.forEach(({ id, qty }) => {
            addResource(id, qty)
            const res = RESOURCES[id]
            if (res) allLoot.push({ type: 'resource', name: `${qty}× ${res.name}` })
          })
          if (drops.gold > 0) {
            addGold(drops.gold)
            allLoot.push({ type: 'gold', name: `${drops.gold}g` })
          }
          if (drops.skillDrop) {
            const skillData = { skillId: drops.skillDrop, level: 1, xp: 0 }
            addSkillToInventory(skillData)
            const template = SKILLS[drops.skillDrop]
            allLoot.push({ type: 'skill', name: template?.name ?? drops.skillDrop })
            addLog(`✦ Skill acquired: ${template?.name}!`, 'drop')
          }
          recordKill(e.monsterId)
        })
        const totalXp = calcExpGain(defeatedEnemies)
        if (totalXp > 0) {
          gainExp(totalXp)
          allLoot.push({ type: 'xp', name: `+${totalXp} XP` })
        }
        setLoot(allLoot)
        const finalStats = heroStatsRef.current
        useGameStore.setState((state) => ({
          hero: {
            ...state.hero,
            stats: { ...state.hero.stats, hp: finalStats.hp, mana: finalStats.mana },
          },
        }))
        // GLT01/GLT02 — Gluttony : absorption sur kill si passif équipé + prêt (cooldown 5j)
        if (
          hasGluttony(hero.passiveSkills) &&
          isGluttonyReady(world.dayCount, meta?.gluttonyLastUsed)
        ) {
          const assassinated = defeatedEnemies.find((e) => assassinatedRef.current.has(e.id))
          if (assassinated) {
            addLog('Gluttony stirs — an assassination! Choose what to devour.', 'gluttony')
            setGluttonyChoice({ monsterId: assassinated.monsterId }) // GLT02 — choix du joueur
          } else if (rollGluttonyProc()) {
            absorbGluttony({ monsterId: defeatedEnemies[0].monsterId }) // GLT01 — stat aléatoire
          }
        }
        assassinatedRef.current.clear()

        // DEMON-FIGHT — victoire sur le Demon Lord (Malachar) → déclenche la défaite du
        // Demon Lord (W01 +200 tokens, M02 compteur, W03 bannière, titres + warp ville),
        // en réutilisant la logique éprouvée de clearDungeon('grimspire').
        if (defeatedEnemies.some((e) => e.rank === 'demon_lord')) {
          useGameStore.getState().clearDungeon('grimspire')
        }
        // ACH01 — réévalue les accomplissements (kills, demon lord, jours, runs…)
        useGameStore.getState().checkAchievements()

        divineCall = checkAwakeningConditions(
          {
            ...hero,
            battleLog: [...(hero.battleLog ?? []), { type: 'victory', day: world.dayCount }],
          },
          world,
        )
      } catch (err) {
        // On ne bloque JAMAIS le joueur : on logge et on termine quand même le combat.
        console.error(
          '[Combat] Échec de distribution des récompenses de victoire — combat terminé malgré tout :',
          err,
        )
      }
      setResult('victory')
      setPhase('result')
      if (divineCall) setTimeout(() => triggerDivineCall(divineCall), 1500)
    },
    [
      addLog,
      addResource,
      addGold,
      addSkillToInventory,
      recordKill,
      gainExp,
      triggerDivineCall,
      hero,
      world,
      meta,
      absorbGluttony,
    ],
  )

  // Filet de sécurité anti-combat-bloqué : si on se retrouve au tour du joueur
  // (non animé) avec TOUS les ennemis vaincus — ex. course entre les setTimeout du
  // combat — déclencher la victoire au lieu de rester coincé. Idempotent (resolvedRef).
  useEffect(() => {
    if (
      phase === 'player' &&
      !isAnimating &&
      enemies.length > 0 &&
      enemies.every(isDefeated) &&
      !resolvedRef.current
    ) {
      const t = setTimeout(() => handleVictory(enemies), 0)
      return () => clearTimeout(t)
    }
    return undefined
  }, [phase, isAnimating, enemies, handleVictory])

  const enemyTurn = useCallback(
    (aliveEnemies) => {
      // B05 — tick des effets de statut (DoT + stun) au début du tour ennemi
      const ticked = aliveEnemies.map((enemy) => {
        const { newStats, remainingEffects, log, flags } = tickStatusEffects(
          { hp: enemy.currentHp },
          enemy.activeEffects ?? [],
        )
        const dotDmg = enemy.currentHp - newStats.hp
        if (dotDmg > 0) {
          pushFloatingNumber(enemy.id, dotDmg, 'skill')
          log.forEach((l) => addLog(`${enemy.name}: ${l.text}`, 'skill'))
        }
        // SKD-ICE01/FROZEN — `frozen` réutilise le saute-tour de `stun` : on retient
        // le type de contrôle actif pour un log fidèle (« frozen solid » vs « stunned »).
        const skipType = (enemy.activeEffects ?? []).find((e) =>
          ['stun', 'frozen'].includes(e.type),
        )?.type
        return {
          ...enemy,
          currentHp: newStats.hp,
          activeEffects: remainingEffects,
          _skipTurn: flags.skipTurn,
          _skipType: skipType,
        }
      })

      // Reflète HP + effets décrémentés dans l'état
      setEnemies((prev) =>
        prev.map((e) => {
          const t = ticked.find((x) => x.id === e.id)
          return t ? { ...e, currentHp: t.currentHp, activeEffects: t.activeEffects } : e
        }),
      )

      const survivors = ticked.filter((e) => !isDefeated(e))

      // Tous les ennemis tués par le DoT → victoire directe
      if (survivors.length === 0) {
        setTimeout(() => handleVictory(aliveEnemies), 300)
        return
      }

      // Retour au tour du héros : tick de ses propres effets (DoT)
      const goToPlayer = () => {
        setHeroEffects((prevFx) => {
          const { newStats, remainingEffects, log } = tickStatusEffects(
            { hp: heroStatsRef.current.hp },
            prevFx,
          )
          const dotDmg = heroStatsRef.current.hp - newStats.hp
          if (dotDmg > 0) {
            setHeroStats((p) => ({ ...p, hp: Math.max(0, p.hp - dotDmg) }))
            pushFloatingNumber('hero', dotDmg, 'damage')
            log.forEach((l) => addLog(l.text, 'skill'))
          }
          return remainingEffects
        })
        setTurnCount((t) => t + 1)
        setPhase('player')
      }

      survivors.forEach((enemy, i) => {
        const isLast = i === survivors.length - 1
        setTimeout(() => {
          // B05 / SKD-ICE01 — stun ou frozen : l'ennemi saute son tour (même code path)
          if (enemy._skipTurn) {
            const reason = enemy._skipType === 'frozen' ? 'is frozen solid' : 'is stunned'
            addLog(`${enemy.name} ${reason} and skips its turn!`, 'skill')
            if (isLast) setTimeout(goToPlayer, 400)
            return
          }
          // B05 — stats effectives (atk_down / all_stats_down réduisent l'attaque)
          const enemyEff = getEffectiveStats(enemy.stats, enemy.activeEffects ?? [])
          const action = enemyAI({ ...enemy, stats: enemyEff }, heroStatsRef.current)
          if (!action) {
            if (isLast) setTimeout(goToPlayer, 400)
            return
          }
          // BSS01/02/03 — mécaniques de boss : module les dégâts, soul drain, debuffs
          let dmg = action.damage
          const mech = enemy.bossMechanics
          if (mech) {
            const hpPct = enemy.currentHp / enemy.stats.hp
            if (mech.type === 'phases') {
              const ph = getMalacharPhase(hpPct)
              if (ph.phase !== bossStateRef.current.lastPhase) {
                addLog(`⚠ ${enemy.name} enters Phase ${ph.phase} — ${ph.label}!`, 'skill')
                bossStateRef.current.lastPhase = ph.phase
              }
              dmg = Math.round(dmg * ph.atkMult)
              if (ph.soulDrainPct > 0) {
                const drain = Math.round(heroStatsRef.current.maxHp * ph.soulDrainPct)
                pushFloatingNumber('hero', drain, 'damage')
                addLog(`${enemy.name} drains ${drain} HP with Soul Drain!`, 'skill')
                setHeroStats((prev) => {
                  const hp = Math.max(0, prev.hp - drain)
                  if (hp <= 0) setTimeout(() => finishCombat('defeat', enemy.name), 300)
                  return { ...prev, hp }
                })
              }
            } else if (mech.type === 'enrage') {
              const en = getCryptKeeperEnrage(hpPct, bossStateRef.current.enraged)
              if (en.trigger) {
                bossStateRef.current.enraged = true
                addLog(`⚠ ${enemy.name} summons skeletal minions and enrages!`, 'skill')
              }
              dmg = Math.round(dmg * en.atkMult)
            } else if (mech.type === 'cursed_strike') {
              if (rollCursedStrike(mech.chance)) {
                setHeroEffects((prev) =>
                  applyStatusEffect(prev, {
                    ...CURSED_STRIKE_EFFECT,
                    id: `curse_${Date.now()}_${i}`,
                  }),
                )
                addLog(`${enemy.name} lands a Cursed Strike — your Strength is weakened!`, 'skill')
              }
            }
          }
          // SKL-PASS — réduction de dégâts des passifs équipés (Stone Skin, Thick Hide, Stoneskin…)
          const pMods = getPassiveModifiers(useGameStore.getState().hero.passiveSkills)
          if (pMods.damageReduction > 0)
            dmg = Math.max(0, Math.round(dmg * (1 - pMods.damageReduction)))
          // Log reconstruit avec les dégâts FINAUX (cohérent avec réduction + mécaniques de boss)
          addLog(`${enemy.name} attacks for ${dmg} damage!`, 'enemy')
          // B02 — flash sur l'ennemi qui attaque
          setAttackingEnemyId(enemy.id)
          setTimeout(() => setAttackingEnemyId(null), 400)
          // B07 — dégâts flottants sur le héros
          pushFloatingNumber('hero', dmg, 'damage')
          // B08 — track les dégâts pris
          setCombatStats((s) => ({ ...s, dmgTaken: s.dmgTaken + dmg }))
          setHeroStats((prev) => {
            const newHp = Math.max(0, prev.hp - dmg)
            if (newHp <= 0) setTimeout(() => finishCombat('defeat', enemy.name), 300)
            return { ...prev, hp: newHp }
          })
          // SKL-PASS — chaque passif équipé gagne de l'XP à chaque coup encaissé (impact passif)
          if (dmg > 0) {
            const ps = useGameStore.getState().hero.passiveSkills
            ps.forEach((p) => useGameStore.getState().gainSkillXp(p.skillId, PASSIVE_XP_PER_HIT))
          }
          setHeroHitFlash(true)
          setAnimatingHero(true)
          setTimeout(() => {
            setHeroHitFlash(false)
            setAnimatingHero(false)
          }, 400)
          if (isLast) setTimeout(goToPlayer, 400)
        }, i * 500)
      })
    },
    [addLog, finishCombat, pushFloatingNumber, handleVictory],
  )

  const afterPlayerAction = useCallback(
    (currentEnemies) => {
      const alive = currentEnemies.filter((e) => !isDefeated(e))
      setHeroSkills((prev) =>
        prev.map((s) => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })),
      )
      if (alive.length === 0) {
        setTimeout(() => handleVictory(currentEnemies), 200)
        return
      }
      setSelectedTargetId((prev) => {
        const targetAlive = alive.find((e) => e.id === prev)
        return targetAlive ? prev : alive[0].id
      })
      setPhase('enemy')
      setTimeout(() => enemyTurn(alive), 600)
    },
    [enemyTurn, handleVictory],
  )

  const handleAttack = () => {
    if (phase !== 'player' || isAnimating) return
    const aliveEnemies = enemies.filter((e) => !isDefeated(e))
    if (aliveEnemies.length === 0) return
    const target = aliveEnemies.find((e) => e.id === selectedTargetId) ?? aliveEnemies[0]
    // B05 — DEF effective (defense_break / all_stats_down réduisent la défense)
    const targetEff = getEffectiveStats(target.stats, target.activeEffects ?? [])
    // BSS02 — la Force du héros est réduite par les debuffs actifs (ex. Cursed Strike)
    const heroEff = getEffectiveStats(heroStats, heroEffects)
    const dmg = calcBaseDamage(heroEff.strength, targetEff.def)
    setIsAnimating(true)
    setAnimatingEnemyId(target.id)
    setHeroAttackAnim(true) // B13
    setTimeout(() => setHeroAttackAnim(false), 320) // B13 — reset après l'anim 300ms
    pushFloatingNumber(target.id, dmg, 'damage') // B07
    setCombatStats((s) => ({ ...s, dmgDealt: s.dmgDealt + dmg })) // B08
    // GLT02 — assassinat : kill en 1 coup depuis HP max
    if (target.currentHp >= target.stats.hp && target.currentHp - dmg <= 0) {
      assassinatedRef.current.add(target.id)
    }
    setTimeout(() => {
      const updatedEnemies = enemies.map((e) =>
        e.id === target.id ? { ...e, currentHp: Math.max(0, e.currentHp - dmg) } : e,
      )
      setEnemies(updatedEnemies)
      addLog(`You strike ${target.name} for ${dmg} damage.`, 'player')
      setIsAnimating(false)
      setAnimatingEnemyId(null)
      afterPlayerAction(updatedEnemies)
    }, 300)
  }

  const handleUseSkill = (skill) => {
    if (phase !== 'player' || isAnimating) return
    if (!canUseSkill(skill, heroStats)) return
    const template = SKILLS[skill.skillId]
    if (!template) return
    const aliveEnemies = enemies.filter((e) => !isDefeated(e))
    if (aliveEnemies.length === 0) return
    const skillTarget = aliveEnemies.find((e) => e.id === selectedTargetId) ?? aliveEnemies[0]
    setIsAnimating(true)
    setHeroAttackAnim(true) // B13
    setTimeout(() => setHeroAttackAnim(false), 320)
    setHeroStats(applySkillCost(skill, heroStats))
    // B10 — sacrifice de stat : log + persistance au store si permanent
    // (le sacrifice temporaire se récupère automatiquement au combat suivant,
    //  car heroStats est ré-initialisé depuis le store à chaque combat)
    const sacrifice = getStatSacrifice(template)
    if (sacrifice) {
      addLog(
        `${template.name} — sacrificed ${sacrifice.amount} ${sacrifice.stat.toUpperCase()}${sacrifice.permanent ? ' (permanent)' : ''}!`,
        'enemy',
      )
      if (sacrifice.permanent) {
        useGameStore.setState((state) => ({
          hero: {
            ...state.hero,
            stats: {
              ...state.hero.stats,
              [sacrifice.stat]: Math.max(
                0,
                (state.hero.stats[sacrifice.stat] ?? 0) - sacrifice.amount,
              ),
            },
          },
        }))
      }
    }
    // B08 — track la mana dépensée
    setCombatStats((s) => ({ ...s, manaSpent: s.manaSpent + (template.cost?.mana ?? 0) }))
    // STA02 — chaque usage de skill compte pour l'Aura (déblocage + gain)
    useGameStore.getState().recordSkillUse()
    if (template.effect?.damage) {
      // STA02 — l'Aura multiplie les dégâts des skills (+0.5%/point)
      // BEST01 — bonus de dégâts contre l'espèce ciblée (+5% à 10 kills, +10% à 50+).
      const speciesBonus =
        1 + bestiaryDamageBonus(meta?.bestiaryKills?.[skillTarget?.monsterId] ?? 0)
      const dmg = Math.round(
        calcSkillDamage(skill, heroStats, skill.level) *
          auraDamageMult((hero.aura ?? 0) * (1 - getBurnoutMalus(world, 'aura'))) *
          speciesBonus,
      )
      const isAoe = template.effect.aoe
      // ANIM02 — VFX propre au skill : projectile/frappe teinté par l'élément, flash sur la/les cible(s)
      const vfx = getSkillVfx(template)
      const fxTargetIds = isAoe ? aliveEnemies.map((e) => e.id) : [skillTarget.id]
      setSkillFx({ targetIds: fxTargetIds, ...vfx })
      setAnimatingEnemyId(skillTarget.id)
      if (vfx.heavy || isAoe) {
        setArenaSkillShake(true)
        setTimeout(() => setArenaSkillShake(false), 360)
      }
      setTimeout(() => {
        setSkillFx(null)
        setAnimatingEnemyId(null)
      }, 520)
      // B07 — nombre flottant sur chaque cible touchée
      if (isAoe) {
        enemies.filter((e) => !isDefeated(e)).forEach((e) => pushFloatingNumber(e.id, dmg, 'skill'))
      } else {
        pushFloatingNumber(skillTarget.id, dmg, 'skill')
      }
      // B08 — dégâts infligés (×N si AoE)
      const totalDmgDealt = isAoe ? dmg * enemies.filter((e) => !isDefeated(e)).length : dmg
      setCombatStats((s) => ({ ...s, dmgDealt: s.dmgDealt + totalDmgDealt }))
      // GLT02 — assassinat au skill mono-cible : kill en 1 coup depuis HP max
      if (
        !isAoe &&
        skillTarget.currentHp >= skillTarget.stats.hp &&
        skillTarget.currentHp - dmg <= 0
      ) {
        assassinatedRef.current.add(skillTarget.id)
      }
      const statusEffect = template.effect.statusEffect // B05 — peut être absent
      // SKD-ICE01/FROZEN — proc probabiliste (ex. frostbite → frozen 35%). Un seul
      // tirage par activation (partagé par toutes les cibles AoE) : évite le chain-lock.
      const statusProcs = rollStatusProc(statusEffect)
      setTimeout(() => {
        const updatedEnemies = enemies.map((e) => {
          if (isDefeated(e)) return e
          if (!isAoe && e.id !== skillTarget.id) return e
          let updated = { ...e, currentHp: Math.max(0, e.currentHp - dmg) }
          // B05 — applique le statut aux cibles encore vivantes (si le proc a réussi)
          if (statusEffect && statusProcs && !isDefeated(updated)) {
            const inst = buildStatusEffectInstance(
              statusEffect,
              skill.level,
              template.levelBonuses ?? {},
            )
            updated = {
              ...updated,
              activeEffects: applyStatusEffect(updated.activeEffects ?? [], inst),
            }
          }
          return updated
        })
        setEnemies(updatedEnemies)
        addLog(
          `${template.name} hits ${isAoe ? 'all enemies' : skillTarget.name} for ${dmg} damage!`,
          'skill',
        )
        if (statusEffect && statusProcs) {
          const meta = STATUS_META[statusEffect.type]
          addLog(
            `${isAoe ? 'Enemies' : skillTarget.name} afflicted: ${meta?.label ?? statusEffect.type}!`,
            'skill',
          )
        }
        setHeroSkills((prev) =>
          prev.map((s) =>
            s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s,
          ),
        )
        gainSkillXp(skill.skillId, 1)
        setIsAnimating(false)
        afterPlayerAction(updatedEnemies)
      }, 300)
    } else if (template.effect?.heal) {
      // B05 — un burn actif empêche les soins
      if (!canHeal(heroEffects)) {
        addLog('The flames prevent healing!', 'enemy')
      } else {
        const healAmt = Math.round(heroStats.maxHp * template.effect.heal.value)
        setHeroStats((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }))
        pushFloatingNumber('hero', healAmt, 'heal') // B07 — flottant de soin
        addLog(`${template.name} restores ${healAmt} HP!`, 'heal')
      }
      setHeroSkills((prev) =>
        prev.map((s) =>
          s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s,
        ),
      )
      gainSkillXp(skill.skillId, 1)
      setIsAnimating(false)
      afterPlayerAction(enemies)
    } else if (template.effect?.selfBuff) {
      addLog(`${template.name} activated!`, 'skill')
      setHeroSkills((prev) =>
        prev.map((s) =>
          s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s,
        ),
      )
      gainSkillXp(skill.skillId, 1)
      setIsAnimating(false)
      afterPlayerAction(enemies)
    } else if (template.effect?.statusEffect) {
      // B05 — skill de pur debuff (sans dégâts), ex. abyss_howl / forsaken_curse
      const debuff = template.effect.statusEffect
      const isAoe = template.effect.aoe
      // SKD-ICE01/FROZEN — proc probabiliste (un seul tirage, partagé par les cibles AoE).
      const debuffProcs = rollStatusProc(debuff)
      const updatedEnemies = debuffProcs
        ? enemies.map((e) => {
            if (isDefeated(e)) return e
            if (!isAoe && e.id !== skillTarget.id) return e
            const inst = buildStatusEffectInstance(debuff, skill.level, template.levelBonuses ?? {})
            return { ...e, activeEffects: applyStatusEffect(e.activeEffects ?? [], inst) }
          })
        : enemies
      setEnemies(updatedEnemies)
      const meta = STATUS_META[debuff.type]
      addLog(
        debuffProcs
          ? `${template.name} — ${isAoe ? 'all enemies' : skillTarget.name} afflicted: ${meta?.label ?? debuff.type}!`
          : `${template.name} — ${isAoe ? 'the enemies resist' : `${skillTarget.name} resists`} the ${meta?.label ?? debuff.type}!`,
        'skill',
      )
      setHeroSkills((prev) =>
        prev.map((s) =>
          s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s,
        ),
      )
      gainSkillXp(skill.skillId, 1)
      setIsAnimating(false)
      afterPlayerAction(updatedEnemies)
    }
  }

  const handleUseItem = (resourceId) => {
    if (phase !== 'player' || isAnimating) return
    const res = RESOURCES[resourceId]
    if (!res?.effect) return
    const owned = hero.inventory.consumables[resourceId] || 0
    if (owned <= 0) return
    if (res.effect.type === 'heal_percent') {
      const healAmt = Math.round(heroStats.maxHp * res.effect.value)
      setHeroStats((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }))
      pushFloatingNumber('hero', healAmt, 'heal') // B07
      addLog(`Used ${res.name} — restored ${healAmt} HP.`, 'heal')
    } else if (res.effect.type === 'mana_restore_percent') {
      const manaAmt = Math.round(heroStats.maxMana * res.effect.value)
      setHeroStats((prev) => ({ ...prev, mana: Math.min(prev.maxMana, prev.mana + manaAmt) }))
      pushFloatingNumber('hero', manaAmt, 'mana') // B07
      addLog(`Used ${res.name} — restored ${manaAmt} Mana.`, 'mana')
    } else if (res.effect.type === 'restore_both') {
      // Z02 — restaure HP + Mana en une fois
      const healAmt = Math.round(heroStats.maxHp * res.effect.value)
      const manaAmt = Math.round(heroStats.maxMana * res.effect.value)
      setHeroStats((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healAmt),
        mana: Math.min(prev.maxMana, prev.mana + manaAmt),
      }))
      pushFloatingNumber('hero', healAmt, 'heal') // B07
      addLog(`Used ${res.name} — restored ${healAmt} HP & ${manaAmt} Mana.`, 'heal')
    }
    useGameStore.setState((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          consumables: {
            ...state.hero.inventory.consumables,
            [resourceId]: Math.max(0, owned - 1),
          },
        },
      },
    }))
    // CRF06 — l'antidote (cureDebuffs) soigne les debuffs actifs (CRF01), y compris permanents.
    if (res.effect.cureDebuffs) {
      const cured = useGameStore.getState().cureHeroDebuffs()
      if (cured > 0) addLog(`${res.name} cured your ailments (${cured} cleared).`, 'heal')
    }
    afterPlayerAction(enemies)
  }

  const handleFlee = () => {
    if (isBoss || phase !== 'player') return
    const fleeChance = 0.5 + (heroStats.agility - 10) * 0.02
    if (Math.random() < fleeChance) {
      addLog('You successfully flee!', 'system')
      finishCombat('fled')
    } else {
      addLog('Failed to flee!', 'system')
      afterPlayerAction(enemies)
    }
  }

  const handleLeave = () => {
    endCombat(result)
    // CMB-WIN — après une VICTOIRE, revenir à l'écran de zone (la liste des monstres)
    // si on combattait dans un spot de chasse. Fuite/mort gardent leur flux (world_map / post-mortem).
    if (result === 'victory' && world.currentHuntingSpot) {
      useGameStore.getState().setScreen('zone_view')
    }
  }

  const consumableItems = Object.entries(hero.inventory.consumables).filter(([, qty]) => qty > 0)
  const arenaBg =
    ARENA_BACKGROUNDS[world.currentHuntingSpot] ??
    ARENA_BACKGROUNDS[world.currentZone] ??
    ARENA_BACKGROUNDS.default

  return {
    // store-derived
    hero,
    world,
    meta,
    activeCombat,
    absorbGluttony,
    // state
    enemies,
    heroStats,
    heroSkills,
    heroEffects,
    phase,
    result,
    confirmEscape,
    setConfirmEscape,
    selectedAction,
    setSelectedAction,
    log,
    loot,
    isBoss,
    isAnimating,
    selectedTargetId,
    setSelectedTargetId,
    heroHitFlash,
    turnCount,
    animatingEnemyId,
    animatingHero,
    skillFx,
    arenaSkillShake,
    heroAttackAnim,
    attackingEnemyId,
    floatingNumbers,
    combatStats,
    gluttonyChoice,
    setGluttonyChoice,
    // derived
    consumableItems,
    arenaBg,
    // handlers
    handleAttack,
    handleUseSkill,
    handleUseItem,
    handleFlee,
    handleLeave,
    handleVictory,
  }
}
