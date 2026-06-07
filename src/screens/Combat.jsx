import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'
import { RESOURCES } from '../data/resources'
import { MONSTERS } from '../data/monsters'
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
  getScaledSkillCost,
  tickStatusEffects,
  applyStatusEffect,
  getEffectiveStats,
  canHeal,
  getStatSacrifice,
} from '../engine/combat'
import { getMalacharPhase, getCryptKeeperEnrage, rollCursedStrike, CURSED_STRIKE_EFFECT } from '../engine/bossMechanics'
import { hasGluttony, isGluttonyReady, rollGluttonyProc, GLUTTONY_STATS } from '../engine/gluttony'

// B05 — icône + libellé par type d'effet de statut (cf. DESIGN.md §B05-SPEC)
const STATUS_META = {
  poison:           { icon: '🟢', label: 'Poison' },
  burn:             { icon: '🔥', label: 'Burn' },
  stun:             { icon: '💫', label: 'Stun' },
  slow:             { icon: '🐌', label: 'Slow' },
  defense_break:    { icon: '🛡️', label: 'Defense Break' },
  atk_down:         { icon: '⬇️', label: 'Attack Down' },
  max_hp_reduction: { icon: '💔', label: 'Max HP Down' },
  all_stats_down:   { icon: '🌀', label: 'All Stats Down' },
}

// B05 — construit l'instance d'effet à appliquer depuis le template d'un skill,
// en intégrant les bonus de niveau (tickDamageBonus, etc.).
function buildStatusEffectInstance(statusEffect, level = 1, levelBonuses = {}) {
  const bonus = levelBonuses[level] ?? {}
  return {
    id: `${statusEffect.type}_${Date.now()}_${Math.random()}`,
    type: statusEffect.type,
    duration: statusEffect.duration + (bonus.durationBonus ?? 0),
    ...(statusEffect.tickDamage != null && {
      tickDamage: statusEffect.tickDamage + (bonus.tickDamageBonus ?? 0),
    }),
    ...(statusEffect.reduction != null && {
      reduction: statusEffect.reduction + (bonus.reductionBonus ?? 0),
    }),
  }
}

// B05 — petite rangée d'icônes d'effets actifs (cartes ennemi/héros)
function StatusIcons({ effects = [] }) {
  if (!effects || effects.length === 0) return null
  return (
    <div className="flex gap-1 justify-center" data-testid="status-icons">
      {effects.map(e => {
        const meta = STATUS_META[e.type] ?? { icon: '❓', label: e.type }
        return (
          <span
            key={e.id ?? e.type}
            title={`${meta.label} · ${e.duration} turn${e.duration > 1 ? 's' : ''}`}
            style={{ fontSize: '0.8rem', lineHeight: 1 }}
          >
            {meta.icon}
            <span style={{ fontSize: '0.55rem', color: '#8a7a6a', marginLeft: '1px' }}>{e.duration}</span>
          </span>
        )
      })}
    </div>
  )
}
import { calcEquippedStatBonuses } from '../data/equipment'
import { applyDebuffsToStats } from '../utils/debuffs'

// Emoji par type de monstre
const MONSTER_EMOJI = {
  ashwood_wolf:     '🐺',
  // MON01 — bestiaire de surface refondu
  thicket_hare:     '🐇',
  tuskmaw_boar:     '🐗',
  old_oakheart:     '🌳',
  mire_slime:       '🫧',
  fenrot_devourer:  '🐊',
  graven_sentinel:  '⚔️',
  hill_slime:       '🟩',
  russet_fox:       '🦊',
  knoll_goblin:     '👺',
  thunderhoof:      '🦬',
  // anciens (réserve / supprimés — fallback conservé)
  rotting_shambler: '🧟',
  gloom_bat:        '🦇',
  marsh_serpent:    '🐍',
  briar_wraith:     '👻',
  bog_shambler:     '🧌',
  stone_golem:      '🗿',
  hollow_knight:    '🤺',
  ruin_specter:     '💀',
  barrow_wight:     '☠️',
  grave_knight:     '⚔️',
  soul_harvester:   '👁️',
  cursed_warlord:   '👹',
  bone_colossus:    '🦴',
  grimstone_troll:  '🧌',
  cursed_sentinel:  '🛡️',
  abyssal_hound:    '🐕',
  wyvern_scout:     '🐉',
  plague_monk:      '☣️',
  iron_wraith:      '⚙️',
  hollow_crypt_boss:'💀',
  forsaken_citadel_boss: '👑',
  malachar:         '😈',
  default:          '👹',
}

// Gradient d'arène par spot de chasse
const ARENA_BACKGROUNDS = {
  ashenvale_forest: 'radial-gradient(ellipse at 50% 0%, #0a1208 0%, #070d08 60%, #050808 100%)',
  thornmarsh:       'radial-gradient(ellipse at 50% 0%, #08100e 0%, #060c0a 60%, #060808 100%)',
  crumbled_ruins:   'radial-gradient(ellipse at 50% 0%, #100a12 0%, #0c0810 60%, #080808 100%)',
  wildmere_hills:   'radial-gradient(ellipse at 50% 0%, #0a1008 0%, #081008 60%, #060806 100%)',
  blighted_road:    'radial-gradient(ellipse at 50% 0%, #160808 0%, #100606 60%, #080606 100%)',
  grimspire:        'radial-gradient(ellipse at 50% 0%, #100812 0%, #0c0810 60%, #080608 100%)',
  default:          'radial-gradient(ellipse at 50% 0%, #0a0810 0%, #080808 60%, #060608 100%)',
}

const RANK_BADGE = {
  elite:      { label: 'ELITE',      color: '#ffb84d', bg: '#2a1400', border: '#6a3800' },
  boss:       { label: 'BOSS',       color: '#e080ff', bg: '#200828', border: '#602090' },
  demon_lord: { label: 'DEMON LORD', color: '#ff5050', bg: '#2a0808', border: '#882020' },
}

// ── Portrait monstre : charge /monsters/<id>.png, fallback emoji si manquant ──
// Les images doivent être dans `public/monsters/<monsterId>.png`
// Format conseillé : 512×512 PNG, fond transparent, style fantasy joyeuse aventure
// Héros en combat : sprite idle animé (repli emoji si asset manquant)
function HeroBattleSprite({ size = 88 }) {
  const [frame, setFrame] = useState(0)
  const [errored, setErrored] = useState(false)
  useEffect(() => {
    if (errored) return undefined
    const id = setInterval(() => setFrame(f => (f + 1) % 18), 110)
    return () => clearInterval(id)
  }, [errored])
  if (errored) return <span style={{ fontSize: '2.8rem' }}>⚔️</span>
  return (
    <img
      src={`/sprites/hero/idle/${String(frame).padStart(2, '0')}.png`}
      alt="" draggable={false} onError={() => setErrored(true)}
      style={{ height: `${size}px`, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.6))', pointerEvents: 'none', userSelect: 'none' }}
    />
  )
}

function MonsterPortrait({ monsterId, fallbackEmoji, size = 120 }) {
  const [errored, setErrored] = useState(false)
  if (errored || !monsterId) {
    return (
      <span style={{ fontSize: `${Math.round(size * 0.55)}px`, lineHeight: 1 }}>
        {fallbackEmoji ?? '👹'}
      </span>
    )
  }
  return (
    <img
      src={`/monsters/${monsterId}.png`}
      alt=""
      onError={() => setErrored(true)}
      draggable={false}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  )
}

export default function Combat() {
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
  const equippedStats = { ...hero.stats }
  Object.entries(equipBonuses).forEach(([stat, bonus]) => {
    if (stat in equippedStats) equippedStats[stat] = (equippedStats[stat] ?? 0) + bonus
  })
  // CRF01 — les debuffs passifs réduisent les stats de combat
  const effectiveBaseStats = applyDebuffsToStats(equippedStats, hero.activeDebuffs ?? [])

  const [enemies, setEnemies] = useState(activeCombat?.enemies ?? [])
  const [heroStats, setHeroStats] = useState(effectiveBaseStats)
  const [heroSkills, setHeroSkills] = useState(
    hero.activeSkills.map(s => ({ ...s, currentCooldown: 0 }))
  )
  const [heroEffects, setHeroEffects] = useState([]) // B05 — effets de statut sur le héros
  const [phase, setPhase] = useState('player')
  const [result, setResult] = useState(null)
  const [selectedAction, setSelectedAction] = useState('attack')
  const [log, setLog] = useState([])
  const [loot, setLoot] = useState([])
  const [isBoss, setIsBoss] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedTargetId, setSelectedTargetId] = useState(null)
  const [heroHitFlash, setHeroHitFlash] = useState(false)
  const [turnCount, setTurnCount] = useState(1)
  const [animatingEnemyId, setAnimatingEnemyId] = useState(null) // id ennemi qui reçoit un coup
  const [animatingHero, setAnimatingHero] = useState(false)      // héros qui reçoit un coup
  const [heroAttackAnim, setHeroAttackAnim] = useState(false)    // B13 — héros qui lance une attaque/skill
  const [attackingEnemyId, setAttackingEnemyId] = useState(null) // B02 — ennemi qui frappe
  const [floatingNumbers, setFloatingNumbers] = useState([])     // B07 — [{id, targetId, amount, type}]
  // B08 — stats de combat pour le résumé
  const [combatStats, setCombatStats] = useState({ dmgDealt: 0, dmgTaken: 0, manaSpent: 0, kills: 0 })

  const bossStateRef = useRef({ enraged: false, lastPhase: 1 }) // BSS01/03
  const assassinatedRef = useRef(new Set()) // GLT02 — ennemis tués en 1 coup depuis HP max
  const resolvedRef = useRef(false) // garde anti-double résolution (victoire/défaite)
  const [gluttonyChoice, setGluttonyChoice] = useState(null) // GLT02 — { monsterId } pour le modal de choix
  const heroStatsRef = useRef(heroStats)
  // Mise à jour du ref hors render (évite l'erreur ESLint react-hooks/refs)
  useEffect(() => { heroStatsRef.current = heroStats }, [heroStats])

  const addLog = useCallback((text, type = 'info') => {
    setLog(prev => [{ text, type, id: Date.now() + Math.random() }, ...prev].slice(0, 25))
  }, [])

  // B07 — push un nombre flottant, auto-cleanup après 800ms
  const pushFloatingNumber = useCallback((targetId, amount, type = 'damage') => {
    const id = Date.now() + Math.random()
    setFloatingNumbers(prev => [...prev, { id, targetId, amount, type }])
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 800)
  }, [])

  // S04 — Notif level-up de skill : afficher floating + log, puis clear
  useEffect(() => {
    if (!recentSkillLevelUps || recentSkillLevelUps.length === 0) return
    recentSkillLevelUps.forEach((entry) => {
      // Le floating number affiche "✦ Lv X" sur le héros
      const id = Date.now() + Math.random()
      setFloatingNumbers(prev => [...prev, { id, targetId: 'hero', amount: `Lv ${entry.toLevel}`, type: 'levelup' }])
      setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 1100)
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
    setIsBoss(initial.some(e => ['boss', 'demon_lord', 'elite'].includes(e.rank)))
    setSelectedTargetId(initial[0]?.id ?? null)
    recordCombatEntry()
    addLog(`Battle begins! (${initial.length} ${initial.length > 1 ? 'enemies' : 'enemy'})`, 'system')
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const finishCombat = useCallback((outcome, cause = 'Unknown enemy') => {
    if (resolvedRef.current) return
    resolvedRef.current = true
    const finalStats = heroStatsRef.current
    try {
      useGameStore.setState(state => ({
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
  }, [addLog])

  const handleVictory = useCallback((defeatedEnemies) => {
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
      setCombatStats(s => ({ ...s, kills: defeatedEnemies.length }))  // B08
      const allLoot = []
      defeatedEnemies.forEach(e => {
        const drops = calcDrops(e.monsterId, heroStatsRef.current.chance)
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
      useGameStore.setState(state => ({
        hero: { ...state.hero, stats: { ...state.hero.stats, hp: finalStats.hp, mana: finalStats.mana } },
      }))
      // GLT01/GLT02 — Gluttony : absorption sur kill si passif équipé + prêt (cooldown 5j)
      if (hasGluttony(hero.passiveSkills) && isGluttonyReady(world.dayCount, meta?.gluttonyLastUsed)) {
        const assassinated = defeatedEnemies.find(e => assassinatedRef.current.has(e.id))
        if (assassinated) {
          addLog('Gluttony stirs — an assassination! Choose what to devour.', 'gluttony')
          setGluttonyChoice({ monsterId: assassinated.monsterId }) // GLT02 — choix du joueur
        } else if (rollGluttonyProc()) {
          absorbGluttony({ monsterId: defeatedEnemies[0].monsterId }) // GLT01 — stat aléatoire
        }
      }
      assassinatedRef.current.clear()

      divineCall = checkAwakeningConditions(
        { ...hero, battleLog: [...(hero.battleLog ?? []), { type: 'victory', day: world.dayCount }] },
        world
      )
    } catch (err) {
      // On ne bloque JAMAIS le joueur : on logge et on termine quand même le combat.
      console.error('[Combat] Échec de distribution des récompenses de victoire — combat terminé malgré tout :', err)
    }
    setResult('victory')
    setPhase('result')
    if (divineCall) setTimeout(() => triggerDivineCall(divineCall), 1500)
  }, [addLog, addResource, addGold, addSkillToInventory, recordKill, gainExp, triggerDivineCall, hero, world, meta, absorbGluttony])

  // Filet de sécurité anti-combat-bloqué : si on se retrouve au tour du joueur
  // (non animé) avec TOUS les ennemis vaincus — ex. course entre les setTimeout du
  // combat — déclencher la victoire au lieu de rester coincé. Idempotent (resolvedRef).
  useEffect(() => {
    if (phase === 'player' && !isAnimating && enemies.length > 0
        && enemies.every(isDefeated) && !resolvedRef.current) {
      const t = setTimeout(() => handleVictory(enemies), 0)
      return () => clearTimeout(t)
    }
    return undefined
  }, [phase, isAnimating, enemies, handleVictory])

  const enemyTurn = useCallback((aliveEnemies) => {
    // B05 — tick des effets de statut (DoT + stun) au début du tour ennemi
    const ticked = aliveEnemies.map(enemy => {
      const { newStats, remainingEffects, log, flags } = tickStatusEffects(
        { hp: enemy.currentHp }, enemy.activeEffects ?? []
      )
      const dotDmg = enemy.currentHp - newStats.hp
      if (dotDmg > 0) {
        pushFloatingNumber(enemy.id, dotDmg, 'skill')
        log.forEach(l => addLog(`${enemy.name}: ${l.text}`, 'skill'))
      }
      return { ...enemy, currentHp: newStats.hp, activeEffects: remainingEffects, _skipTurn: flags.skipTurn }
    })

    // Reflète HP + effets décrémentés dans l'état
    setEnemies(prev => prev.map(e => {
      const t = ticked.find(x => x.id === e.id)
      return t ? { ...e, currentHp: t.currentHp, activeEffects: t.activeEffects } : e
    }))

    const survivors = ticked.filter(e => !isDefeated(e))

    // Tous les ennemis tués par le DoT → victoire directe
    if (survivors.length === 0) {
      setTimeout(() => handleVictory(aliveEnemies), 300)
      return
    }

    // Retour au tour du héros : tick de ses propres effets (DoT)
    const goToPlayer = () => {
      setHeroEffects(prevFx => {
        const { newStats, remainingEffects, log } = tickStatusEffects(
          { hp: heroStatsRef.current.hp }, prevFx
        )
        const dotDmg = heroStatsRef.current.hp - newStats.hp
        if (dotDmg > 0) {
          setHeroStats(p => ({ ...p, hp: Math.max(0, p.hp - dotDmg) }))
          pushFloatingNumber('hero', dotDmg, 'damage')
          log.forEach(l => addLog(l.text, 'skill'))
        }
        return remainingEffects
      })
      setTurnCount(t => t + 1)
      setPhase('player')
    }

    survivors.forEach((enemy, i) => {
      const isLast = i === survivors.length - 1
      setTimeout(() => {
        // B05 — stun : l'ennemi saute son tour
        if (enemy._skipTurn) {
          addLog(`${enemy.name} is stunned and skips its turn!`, 'skill')
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
              setHeroStats(prev => {
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
              setHeroEffects(prev => applyStatusEffect(prev, { ...CURSED_STRIKE_EFFECT, id: `curse_${Date.now()}_${i}` }))
              addLog(`${enemy.name} lands a Cursed Strike — your Strength is weakened!`, 'skill')
            }
          }
        }
        addLog(action.log, 'enemy')
        // B02 — flash sur l'ennemi qui attaque
        setAttackingEnemyId(enemy.id)
        setTimeout(() => setAttackingEnemyId(null), 400)
        // B07 — dégâts flottants sur le héros
        pushFloatingNumber('hero', dmg, 'damage')
        // B08 — track les dégâts pris
        setCombatStats(s => ({ ...s, dmgTaken: s.dmgTaken + dmg }))
        setHeroStats(prev => {
          const newHp = Math.max(0, prev.hp - dmg)
          if (newHp <= 0) setTimeout(() => finishCombat('defeat', enemy.name), 300)
          return { ...prev, hp: newHp }
        })
        setHeroHitFlash(true)
        setAnimatingHero(true)
        setTimeout(() => { setHeroHitFlash(false); setAnimatingHero(false) }, 400)
        if (isLast) setTimeout(goToPlayer, 400)
      }, i * 500)
    })
  }, [addLog, finishCombat, pushFloatingNumber, handleVictory])

  const afterPlayerAction = useCallback((currentEnemies) => {
    const alive = currentEnemies.filter(e => !isDefeated(e))
    setHeroSkills(prev => prev.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) })))
    if (alive.length === 0) {
      setTimeout(() => handleVictory(currentEnemies), 200)
      return
    }
    setSelectedTargetId(prev => {
      const targetAlive = alive.find(e => e.id === prev)
      return targetAlive ? prev : alive[0].id
    })
    setPhase('enemy')
    setTimeout(() => enemyTurn(alive), 600)
  }, [enemyTurn, handleVictory])

  const handleAttack = () => {
    if (phase !== 'player' || isAnimating) return
    const aliveEnemies = enemies.filter(e => !isDefeated(e))
    if (aliveEnemies.length === 0) return
    const target = aliveEnemies.find(e => e.id === selectedTargetId) ?? aliveEnemies[0]
    // B05 — DEF effective (defense_break / all_stats_down réduisent la défense)
    const targetEff = getEffectiveStats(target.stats, target.activeEffects ?? [])
    // BSS02 — la Force du héros est réduite par les debuffs actifs (ex. Cursed Strike)
    const heroEff = getEffectiveStats(heroStats, heroEffects)
    const dmg = calcBaseDamage(heroEff.strength, targetEff.def)
    setIsAnimating(true)
    setAnimatingEnemyId(target.id)
    setHeroAttackAnim(true)                                             // B13
    setTimeout(() => setHeroAttackAnim(false), 320)                     // B13 — reset après l'anim 300ms
    pushFloatingNumber(target.id, dmg, 'damage')                        // B07
    setCombatStats(s => ({ ...s, dmgDealt: s.dmgDealt + dmg }))         // B08
    // GLT02 — assassinat : kill en 1 coup depuis HP max
    if (target.currentHp >= target.stats.hp && target.currentHp - dmg <= 0) {
      assassinatedRef.current.add(target.id)
    }
    setTimeout(() => {
      const updatedEnemies = enemies.map(e =>
        e.id === target.id ? { ...e, currentHp: Math.max(0, e.currentHp - dmg) } : e
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
    const aliveEnemies = enemies.filter(e => !isDefeated(e))
    if (aliveEnemies.length === 0) return
    const skillTarget = aliveEnemies.find(e => e.id === selectedTargetId) ?? aliveEnemies[0]
    setIsAnimating(true)
    setHeroAttackAnim(true)                                             // B13
    setTimeout(() => setHeroAttackAnim(false), 320)
    setHeroStats(applySkillCost(skill, heroStats))
    // B10 — sacrifice de stat : log + persistance au store si permanent
    // (le sacrifice temporaire se récupère automatiquement au combat suivant,
    //  car heroStats est ré-initialisé depuis le store à chaque combat)
    const sacrifice = getStatSacrifice(template)
    if (sacrifice) {
      addLog(`${template.name} — sacrificed ${sacrifice.amount} ${sacrifice.stat.toUpperCase()}${sacrifice.permanent ? ' (permanent)' : ''}!`, 'enemy')
      if (sacrifice.permanent) {
        useGameStore.setState(state => ({
          hero: {
            ...state.hero,
            stats: {
              ...state.hero.stats,
              [sacrifice.stat]: Math.max(0, (state.hero.stats[sacrifice.stat] ?? 0) - sacrifice.amount),
            },
          },
        }))
      }
    }
    // B08 — track la mana dépensée
    setCombatStats(s => ({ ...s, manaSpent: s.manaSpent + (template.cost?.mana ?? 0) }))
    if (template.effect?.damage) {
      const dmg = calcSkillDamage(skill, heroStats, skill.level)
      const isAoe = template.effect.aoe
      // B07 — nombre flottant sur chaque cible touchée
      if (isAoe) {
        enemies.filter(e => !isDefeated(e)).forEach(e => pushFloatingNumber(e.id, dmg, 'skill'))
      } else {
        pushFloatingNumber(skillTarget.id, dmg, 'skill')
      }
      // B08 — dégâts infligés (×N si AoE)
      const totalDmgDealt = isAoe
        ? dmg * enemies.filter(e => !isDefeated(e)).length
        : dmg
      setCombatStats(s => ({ ...s, dmgDealt: s.dmgDealt + totalDmgDealt }))
      // GLT02 — assassinat au skill mono-cible : kill en 1 coup depuis HP max
      if (!isAoe && skillTarget.currentHp >= skillTarget.stats.hp && skillTarget.currentHp - dmg <= 0) {
        assassinatedRef.current.add(skillTarget.id)
      }
      const statusEffect = template.effect.statusEffect  // B05 — peut être absent
      setTimeout(() => {
        const updatedEnemies = enemies.map(e => {
          if (isDefeated(e)) return e
          if (!isAoe && e.id !== skillTarget.id) return e
          let updated = { ...e, currentHp: Math.max(0, e.currentHp - dmg) }
          // B05 — applique le statut aux cibles encore vivantes
          if (statusEffect && !isDefeated(updated)) {
            const inst = buildStatusEffectInstance(statusEffect, skill.level, template.levelBonuses ?? {})
            updated = { ...updated, activeEffects: applyStatusEffect(updated.activeEffects ?? [], inst) }
          }
          return updated
        })
        setEnemies(updatedEnemies)
        addLog(`${template.name} hits ${isAoe ? 'all enemies' : skillTarget.name} for ${dmg} damage!`, 'skill')
        if (statusEffect) {
          const meta = STATUS_META[statusEffect.type]
          addLog(`${isAoe ? 'Enemies' : skillTarget.name} afflicted: ${meta?.label ?? statusEffect.type}!`, 'skill')
        }
        setHeroSkills(prev => prev.map(s =>
          s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s
        ))
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
        setHeroStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }))
        pushFloatingNumber('hero', healAmt, 'heal')  // B07 — flottant de soin
        addLog(`${template.name} restores ${healAmt} HP!`, 'heal')
      }
      setHeroSkills(prev => prev.map(s =>
        s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s
      ))
      gainSkillXp(skill.skillId, 1)
      setIsAnimating(false)
      afterPlayerAction(enemies)
    } else if (template.effect?.selfBuff) {
      addLog(`${template.name} activated!`, 'skill')
      setHeroSkills(prev => prev.map(s =>
        s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s
      ))
      gainSkillXp(skill.skillId, 1)
      setIsAnimating(false)
      afterPlayerAction(enemies)
    } else if (template.effect?.statusEffect) {
      // B05 — skill de pur debuff (sans dégâts), ex. abyss_howl / forsaken_curse
      const debuff = template.effect.statusEffect
      const isAoe = template.effect.aoe
      const updatedEnemies = enemies.map(e => {
        if (isDefeated(e)) return e
        if (!isAoe && e.id !== skillTarget.id) return e
        const inst = buildStatusEffectInstance(debuff, skill.level, template.levelBonuses ?? {})
        return { ...e, activeEffects: applyStatusEffect(e.activeEffects ?? [], inst) }
      })
      setEnemies(updatedEnemies)
      const meta = STATUS_META[debuff.type]
      addLog(`${template.name} — ${isAoe ? 'all enemies' : skillTarget.name} afflicted: ${meta?.label ?? debuff.type}!`, 'skill')
      setHeroSkills(prev => prev.map(s =>
        s.skillId === skill.skillId ? { ...s, currentCooldown: template.cooldown } : s
      ))
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
      setHeroStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }))
      pushFloatingNumber('hero', healAmt, 'heal')  // B07
      addLog(`Used ${res.name} — restored ${healAmt} HP.`, 'heal')
    } else if (res.effect.type === 'mana_restore_percent') {
      const manaAmt = Math.round(heroStats.maxMana * res.effect.value)
      setHeroStats(prev => ({ ...prev, mana: Math.min(prev.maxMana, prev.mana + manaAmt) }))
      pushFloatingNumber('hero', manaAmt, 'mana')  // B07
      addLog(`Used ${res.name} — restored ${manaAmt} Mana.`, 'mana')
    } else if (res.effect.type === 'restore_both') {
      // Z02 — restaure HP + Mana en une fois
      const healAmt = Math.round(heroStats.maxHp * res.effect.value)
      const manaAmt = Math.round(heroStats.maxMana * res.effect.value)
      setHeroStats(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healAmt),
        mana: Math.min(prev.maxMana, prev.mana + manaAmt),
      }))
      pushFloatingNumber('hero', healAmt, 'heal')  // B07
      addLog(`Used ${res.name} — restored ${healAmt} HP & ${manaAmt} Mana.`, 'heal')
    }
    useGameStore.setState(state => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          consumables: { ...state.hero.inventory.consumables, [resourceId]: Math.max(0, owned - 1) },
        },
      },
    }))
    afterPlayerAction(enemies)
  }

  const handleFlee = () => {
    if (isBoss || phase !== 'player') return
    const fleeChance = 0.50 + (heroStats.agility - 10) * 0.02
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

  if (!activeCombat) return null

  const consumableItems = Object.entries(hero.inventory.consumables).filter(([, qty]) => qty > 0)
  const arenaBg = ARENA_BACKGROUNDS[world.currentHuntingSpot] ?? ARENA_BACKGROUNDS[world.currentZone] ?? ARENA_BACKGROUNDS.default

  return (
    <div
      className="flex flex-col select-none"
      style={{ minHeight: 'calc(100vh - 48px)', background: arenaBg }}
    >
      {/* ── Arène ── */}
      <div className="flex flex-col flex-1">

        {/* Zone ennemis — haut, centré */}
        <div className="flex justify-center items-end gap-10 px-8 pt-6 pb-4" style={{ minHeight: '200px' }}>
          {enemies.map(enemy => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              isSelected={selectedTargetId === enemy.id}
              isHit={animatingEnemyId === enemy.id}
              isAttacking={attackingEnemyId === enemy.id}
              floatingNumbers={floatingNumbers.filter(n => n.targetId === enemy.id)}
              onSelect={() => !isDefeated(enemy) && phase === 'player' && setSelectedTargetId(enemy.id)}
            />
          ))}
        </div>

        {/* Séparateur VS centré */}
        <div className="flex items-center px-8 gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #3a2020)' }} />
          <PhaseIndicator phase={phase} turnCount={turnCount} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #3a2020)' }} />
        </div>

        {/* Zone héros — bas de l'arène, centré */}
        <div className="flex justify-center px-8 pt-4 pb-3">
          <HeroCard
            heroStats={heroStats}
            heroName={hero.name}
            deity={hero.deity}
            hitFlash={heroHitFlash}
            isAnimHit={animatingHero}
            isAttacking={heroAttackAnim}
            floatingNumbers={floatingNumbers.filter(n => n.targetId === 'hero')}
            heroEffects={heroEffects}
          />
        </div>
      </div>

      {/* ── Panneau d'actions ── */}
      {phase === 'player' && result === null && (
        <ActionPanel
          selectedAction={selectedAction}
          onSelectAction={setSelectedAction}
          onAttack={handleAttack}
          onFlee={handleFlee}
          heroSkills={heroSkills}
          heroStats={heroStats}
          onUseSkill={handleUseSkill}
          consumables={consumableItems}
          onUseItem={handleUseItem}
          isBoss={isBoss}
          isAnimating={isAnimating}
        />
      )}

      {/* ── Résultat ── */}
      {phase === 'result' && (
        <ResultPanel result={result} loot={loot} combatStats={combatStats} onLeave={handleLeave} />
      )}

      {/* GLT02 — choix de la stat à dévorer (assassinat) */}
      {gluttonyChoice && (
        <GluttonyChoiceModal
          monsterId={gluttonyChoice.monsterId}
          onChoose={(stat) => {
            absorbGluttony({ monsterId: gluttonyChoice.monsterId, stat })
            setGluttonyChoice(null)
          }}
        />
      )}

      {/* ── Log de combat ── */}
      <CombatLog log={log} />
    </div>
  )
}

// ── GLT02 — Modal de choix Gluttony (assassinat) ──────────────────────────────
function GluttonyChoiceModal({ monsterId, onChoose }) {
  const monster = MONSTERS[monsterId]
  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="gluttony-choice"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div className="w-full max-w-sm mx-4 rounded-xl p-6 anim-pop" style={{ background: '#120808', border: '1px solid #6a3020' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#e08060', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
          👹 Gluttony — Assassination!
        </p>
        <p style={{ color: '#9a7060', fontSize: '0.8rem', marginBottom: '1.1rem' }}>
          You devour the essence of {monster?.name ?? 'the slain foe'}. Choose a stat to absorb — permanently.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GLUTTONY_STATS.map(stat => (
            <button
              key={stat}
              data-testid={`gluttony-stat-${stat}`}
              onClick={() => onChoose(stat)}
              className="py-2.5 rounded text-sm transition-all hover:opacity-90"
              style={{ fontFamily: 'Cinzel, serif', background: '#1a0c08', color: '#e0a070', border: '1px solid #6a3020', textTransform: 'capitalize' }}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Indicateur de phase ────────────────────────────────────────────────────────
function PhaseIndicator({ phase, turnCount }) {
  const isEnemy = phase === 'enemy'
  return (
    <div
      className="flex items-center gap-2.5 px-5 py-2 rounded-full"
      style={{
        background: isEnemy ? '#1c0808' : '#081408',
        border: `1px solid ${isEnemy ? '#5a1c1c' : '#1c4a1c'}`,
        boxShadow: isEnemy ? '0 0 16px rgba(192,48,48,0.15)' : '0 0 16px rgba(48,192,48,0.12)',
        transition: 'all 0.3s ease',
        minWidth: '160px',
        justifyContent: 'center',
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: isEnemy ? '#e04040' : '#40d060',
          boxShadow: isEnemy ? '0 0 8px #e04040' : '0 0 8px #40d060',
          animation: 'pulse 1.2s infinite',
        }}
      />
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '0.78rem',
        color: isEnemy ? '#e06050' : '#60d070',
        letterSpacing: '0.08em',
      }}>
        {isEnemy ? 'Enemy Turn' : 'Your Turn'}
        <span style={{ color: isEnemy ? '#6a3028' : '#2a6038', marginLeft: '6px', fontSize: '0.7rem' }}>
          T{turnCount}
        </span>
      </span>
    </div>
  )
}

// ── Carte ennemi ──────────────────────────────────────────────────────────────
function EnemyCard({ enemy, isSelected, isHit, isAttacking, floatingNumbers = [], onSelect }) {
  const hpPct = Math.max(0, Math.min(1, enemy.currentHp / enemy.stats.hp))
  const dead = isDefeated(enemy)
  const rankBadge = RANK_BADGE[enemy.rank]
  const emoji = MONSTER_EMOJI[enemy.monsterId] ?? MONSTER_EMOJI.default

  return (
    <div
      className={`flex flex-col items-center gap-2.5 transition-all duration-300 relative${isHit ? ' anim-shake' : ''}${isAttacking ? ' anim-flash' : ''}`}
      style={{ opacity: dead ? 0.22 : 1, cursor: dead ? 'default' : 'pointer' }}
      onClick={onSelect}
    >
      {/* B07 — Nombres flottants (dégâts) */}
      <FloatingNumbers numbers={floatingNumbers} />
      {/* Indicateur ciblage */}
      {isSelected && !dead && (
        <p style={{
          color: '#d4af70',
          fontSize: '0.65rem',
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.1em',
          textShadow: '0 0 8px #d4af7080',
        }}>
          ▼ TARGET
        </p>
      )}

      {/* Portrait — 128px, badge en overlay */}
      <div className="relative">
        <div
          className="flex items-center justify-center transition-all duration-200 overflow-hidden"
          style={{
            // CMB-ICON — sprite ennemi ×2 (128 → 256, le conteneur a overflow-hidden donc
            // doubler aussi le cadre, sinon le portrait agrandi serait rogné).
            width: '256px',
            height: '256px',
            fontSize: '8rem',
            borderRadius: '20px',
            background: isSelected && !dead
              ? 'radial-gradient(circle, #2c1010 0%, #180808 100%)'
              : 'radial-gradient(circle, #1a0a0a 0%, #0f0606 100%)',
            border: `2px solid ${dead ? '#2a1010' : isSelected ? '#d4af70' : '#4a2018'}`,
            boxShadow: isSelected && !dead
              ? '0 0 22px rgba(212,175,112,0.3), inset 0 0 24px rgba(0,0,0,0.5)'
              : 'inset 0 0 24px rgba(0,0,0,0.5)',
            filter: dead ? 'grayscale(1) brightness(0.35)' : 'none',
          }}
        >
          {dead ? (
            <span>💀</span>
          ) : (
            <MonsterPortrait monsterId={enemy.monsterId} fallbackEmoji={emoji} size={240} />
          )}
        </div>

        {/* Badge de rang en overlay — haut gauche */}
        {rankBadge && !dead && (
          <div
            className="absolute px-1.5 py-0.5 rounded"
            style={{
              top: '-6px',
              left: '-6px',
              background: rankBadge.bg,
              border: `1px solid ${rankBadge.border}`,
              fontSize: '0.58rem',
              color: rankBadge.color,
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {rankBadge.label}
          </div>
        )}
      </div>

      {/* Infos ennemi */}
      <div className="text-center" style={{ minWidth: '140px' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          color: dead ? '#3a2a1a' : '#c0a070',
          fontSize: '0.85rem',
          marginBottom: '6px',
        }}>
          {enemy.name}
        </p>

        {/* Barre HP — plus épaisse */}
        <div className="flex items-center gap-1.5 justify-center">
          <div
            className="rounded overflow-hidden"
            style={{ width: '110px', height: '10px', background: '#1a0a0a' }}
          >
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${hpPct * 100}%`,
                background: hpPct > 0.5 ? '#40c060' : hpPct > 0.25 ? '#c0b040' : '#c03030',
                boxShadow: hpPct > 0 ? `0 0 6px ${hpPct > 0.5 ? '#40c060' : hpPct > 0.25 ? '#c0b040' : '#c03030'}90` : 'none',
              }}
            />
          </div>
          <span style={{ color: '#6a4a3a', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
            {Math.max(0, enemy.currentHp)}/{enemy.stats.hp}
          </span>
        </div>

        {/* B05 — effets de statut actifs */}
        {!dead && (enemy.activeEffects?.length > 0) && (
          <div className="mt-1.5">
            <StatusIcons effects={enemy.activeEffects} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Carte héros ───────────────────────────────────────────────────────────────
function HeroCard({ heroStats, heroName, deity, hitFlash, isAnimHit, isAttacking, floatingNumbers = [], heroEffects = [] }) {
  // B13 — anim-hero-attack lors d'une attaque ; prend le pas sur anim-flash si actif
  const animClass = isAttacking ? ' anim-hero-attack' : isAnimHit ? ' anim-flash' : ''
  return (
    <div className={`flex items-center gap-6 relative${animClass}`}>
      {/* B07 — Nombres flottants (dégâts reçus / soins) */}
      <FloatingNumbers numbers={floatingNumbers} />
      {/* Portrait — 96px */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '96px',
          height: '96px',
          fontSize: '2.8rem',
          borderRadius: '12px',
          background: hitFlash
            ? 'radial-gradient(circle, #3c0808 0%, #1c0404 100%)'
            : 'radial-gradient(circle, #101c08 0%, #081008 100%)',
          border: `2px solid ${hitFlash ? '#d04040' : '#2a4018'}`,
          boxShadow: hitFlash
            ? '0 0 20px rgba(210,64,64,0.6)'
            : '0 0 12px rgba(0,0,0,0.5)',
          transition: 'all 0.15s ease',
        }}
      >
        <HeroBattleSprite />
      </div>

      {/* Stats */}
      <div style={{ minWidth: '220px' }}>
        <div className="flex items-center gap-2 mb-3">
          <p style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '0.95rem' }}>
            {heroName}
          </p>
          {deity && (
            <span style={{ color: '#c084fc', fontSize: '0.75rem' }}>✦ {deity}</span>
          )}
          {/* B05 — effets de statut sur le héros */}
          {heroEffects?.length > 0 && <StatusIcons effects={heroEffects} />}
        </div>
        <StatBar
          value={heroStats.hp}
          max={heroStats.maxHp}
          color={hitFlash ? '#ff3030' : '#c03838'}
          label="HP"
          width={200}
          flash={hitFlash}
        />
        <StatBar
          value={heroStats.mana}
          max={heroStats.maxMana}
          color="#3060d0"
          label="MP"
          width={200}
        />
      </div>
    </div>
  )
}

// ── B08 — Stat de combat (résumé) ────────────────────────────────────────────
function CombatStat({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      <div className="flex flex-col items-start leading-tight">
        <span style={{ color: '#5a4a3a', fontSize: '0.58rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>
      </div>
    </div>
  )
}

// ── B07 — Nombres flottants ──────────────────────────────────────────────────
const FLOATING_COLORS = {
  damage:  { color: '#ff6040', prefix: '-' },
  skill:   { color: '#c084fc', prefix: '-' },
  heal:    { color: '#40d080', prefix: '+' },
  mana:    { color: '#40a0f0', prefix: '+' },
  levelup: { color: '#f0c040', prefix: '✦ ' }, // S04
}

function FloatingNumbers({ numbers }) {
  if (!numbers || numbers.length === 0) return null
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {numbers.map((n, i) => {
        const style = FLOATING_COLORS[n.type] ?? FLOATING_COLORS.damage
        return (
          <span
            key={n.id}
            className="absolute anim-float"
            style={{
              top: '10%',
              left: `${42 + (i % 3) * 8}%`,  // légère offset pour éviter l'overlap
              fontFamily: 'Cinzel, serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: style.color,
              textShadow: `0 0 6px ${style.color}80, 0 2px 4px #000`,
              whiteSpace: 'nowrap',
            }}
          >
            {style.prefix}{n.amount}
          </span>
        )
      })}
    </div>
  )
}

function StatBar({ value, max, color, label, width = 160, flash = false }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const isLow = pct < 0.25
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{
        color: '#6a5a4a',
        fontSize: '0.7rem',
        width: '20px',
        fontFamily: 'Cinzel, serif',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div className="rounded overflow-hidden flex-shrink-0" style={{ width, height: '10px', background: '#1a1410' }}>
        <div
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${pct * 100}%`,
            background: flash && label === 'HP' ? '#ff2020' : isLow && label === 'HP' ? '#ff3030' : color,
            boxShadow: pct > 0 ? `0 0 8px ${color}70` : 'none',
          }}
        />
      </div>
      <span style={{
        color: isLow && label === 'HP' ? '#c06060' : '#6a5a4a',
        fontSize: '0.7rem',
        minWidth: '58px',
        flexShrink: 0,
      }}>
        {value}/{max}
      </span>
    </div>
  )
}

// ── Panneau d'actions ─────────────────────────────────────────────────────────
function ActionPanel({
  selectedAction, onSelectAction, onAttack, onFlee,
  heroSkills, heroStats, onUseSkill,
  consumables, onUseItem,
  isBoss, isAnimating,
}) {
  const tabs = [
    { id: 'attack', icon: '⚔️', label: 'Attack' },
    { id: 'skills', icon: '✨', label: 'Skills' },
    { id: 'items',  icon: '🧪', label: 'Items' },
    { id: 'flee',   icon: '🏃', label: 'Flee', disabled: isBoss },
  ]

  return (
    <div
      className="mx-4 mb-2 rounded-xl overflow-hidden"
      style={{ background: '#080608', border: '1px solid #2a1818' }}
    >
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#2a1818' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onSelectAction(tab.id)}
            disabled={tab.disabled}
            // B11 — tooltip explicite quand Flee est désactivé sur un boss
            title={tab.disabled && tab.id === 'flee' ? 'Cannot flee from a boss' : undefined}
            className="flex-1 py-3 flex items-center justify-center gap-2 transition-colors"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              background: selectedAction === tab.id ? '#160e0a' : 'transparent',
              color: tab.disabled ? '#2a2018' : selectedAction === tab.id ? '#d4af70' : '#6a5a4a',
              borderBottom: selectedAction === tab.id ? '2px solid #d4af70' : '2px solid transparent',
              letterSpacing: '0.05em',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-5" style={{ minHeight: '80px' }}>
        {selectedAction === 'attack' && (
          <button
            onClick={onAttack}
            disabled={isAnimating}
            className="px-10 py-3 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.95rem',
              background: isAnimating ? '#100c08' : '#1c1208',
              color: isAnimating ? '#4a3a2a' : '#d4af70',
              border: `1px solid ${isAnimating ? '#2a2018' : '#5a3820'}`,
              letterSpacing: '0.07em',
            }}
          >
            ⚔️ Basic Attack
          </button>
        )}

        {selectedAction === 'skills' && (
          <div className="flex flex-wrap gap-3">
            {heroSkills.length === 0 && (
              <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
                No active skills equipped.
              </p>
            )}
            {heroSkills.map(skill => {
              const template = SKILLS[skill.skillId]
              if (!template || template.type !== 'active') return null
              const usable = canUseSkill(skill, heroStats) && !isAnimating
              const onCD = skill.currentCooldown > 0
              // S07 — coût scalé au niveau (lecture des stats affichées)
              const scaledCost = getScaledSkillCost(template, skill.level)
              const sacrifice = getStatSacrifice(template)  // B10
              return (
                <button
                  key={skill.skillId}
                  onClick={() => onUseSkill(skill)}
                  disabled={!usable}
                  className="relative px-4 py-2.5 rounded-lg text-left transition-all hover:opacity-90 overflow-hidden"
                  style={{
                    background: onCD ? '#0a0808' : usable ? '#100a1c' : '#0a0808',
                    color: onCD ? '#3a2848' : usable ? '#c084fc' : '#3a2848',
                    border: `1px solid ${onCD ? '#1c1428' : usable ? '#5a40b0' : '#1c1428'}`,
                    cursor: usable ? 'pointer' : 'not-allowed',
                    minWidth: '140px',
                  }}
                >
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.88rem', marginBottom: '3px' }}>
                    {template.name}
                  </p>
                  <p style={{ color: usable ? '#7060a8' : '#2a1838', fontSize: '0.72rem' }}>
                    Lv{skill.level}
                    {scaledCost.mana > 0 && ` · ${scaledCost.mana}MP`}
                    {scaledCost.hp > 0 && ` · ${scaledCost.hp}HP`}
                    {/* B10 — sacrifice de stat */}
                    {sacrifice && (
                      <span style={{ color: '#e08040' }}>
                        {` · −${sacrifice.amount} ${sacrifice.stat.slice(0, 3).toUpperCase()}`}
                      </span>
                    )}
                  </p>
                  {/* S05 — Cooldown overlay : grand compteur centré */}
                  {onCD && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        background: 'rgba(8, 6, 12, 0.78)',
                        backdropFilter: 'grayscale(0.7)',
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '1.6rem',
                          fontWeight: 700,
                          color: '#806080',
                          textShadow: '0 0 6px rgba(128,96,128,0.4)',
                          lineHeight: 1,
                        }}>
                          {skill.currentCooldown}
                        </span>
                        <span style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '0.55rem',
                          color: '#5a4868',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          {skill.currentCooldown === 1 ? 'turn' : 'turns'}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {selectedAction === 'items' && (
          <div className="flex flex-wrap gap-3">
            {consumables.length === 0 && (
              <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
                No consumables in bag.
              </p>
            )}
            {consumables.map(([id, qty]) => {
              const res = RESOURCES[id]
              if (!res) return null
              return (
                <button
                  key={id}
                  onClick={() => onUseItem(id)}
                  disabled={isAnimating}
                  className="px-4 py-2.5 rounded-lg text-left transition-all hover:opacity-90"
                  style={{
                    background: '#0e1a08',
                    color: '#80c040',
                    border: '1px solid #3a5828',
                    minWidth: '140px',
                  }}
                >
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.88rem', marginBottom: '3px' }}>
                    {res.name}
                  </p>
                  <p style={{ color: '#507040', fontSize: '0.72rem' }}>×{qty}</p>
                </button>
              )
            })}
          </div>
        )}

        {selectedAction === 'flee' && !isBoss && (
          <button
            onClick={onFlee}
            disabled={isAnimating}
            className="px-10 py-3 rounded-lg transition-all hover:opacity-90"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.95rem',
              background: '#120808',
              color: '#c06040',
              border: '1px solid #4a2818',
            }}
          >
            🏃 Attempt to flee (50%)
          </button>
        )}

        {selectedAction === 'flee' && isBoss && (
          <p style={{ color: '#4a3028', fontSize: '0.85rem', fontStyle: 'italic', padding: '4px 0' }}>
            You cannot flee from this encounter.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Résultat — pleine largeur, dramatique ─────────────────────────────────────
function ResultPanel({ result, loot, combatStats, onLeave }) {
  const isVictory = result === 'victory'
  const isFled = result === 'fled'

  const colors = isVictory
    ? { bg: '#071508', border: '#2a5018', bannerBg: 'linear-gradient(90deg, #091c08, #0f2810, #091c08)', bannerBorder: '#2a5018', text: '#80e040', icon: '⚔️', label: 'Victory!' }
    : isFled
    ? { bg: '#080f08', border: '#1c3020', bannerBg: 'linear-gradient(90deg, #080f08, #0c1808, #080f08)', bannerBorder: '#1c3020', text: '#60a060', icon: '🏃', label: 'Escaped!' }
    : { bg: '#150808', border: '#602020', bannerBg: 'linear-gradient(90deg, #1a0808, #220a0a, #1a0808)', bannerBorder: '#602020', text: '#e04040', icon: '💀', label: 'Defeated...' }

  return (
    <div
      className="mx-4 mb-2 rounded-xl overflow-hidden anim-pop"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {/* Banner — pleine largeur */}
      <div
        className="px-8 py-4 flex items-center justify-center gap-4"
        style={{
          background: colors.bannerBg,
          borderBottom: `1px solid ${colors.bannerBorder}`,
        }}
      >
        <span style={{ fontSize: '2rem' }}>{colors.icon}</span>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '1.4rem',
          letterSpacing: '0.1em',
          color: colors.text,
          textShadow: `0 0 20px ${colors.text}60`,
        }}>
          {colors.label}
        </p>
        <span style={{ fontSize: '2rem' }}>{colors.icon}</span>
      </div>

      {/* Loot */}
      {loot.length > 0 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 justify-center">
          {loot.map((item, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: item.type === 'skill' ? '#1a0f28' : item.type === 'gold' ? '#1c1408' : item.type === 'xp' ? '#08182a' : '#0f1808',
                color: item.type === 'skill' ? '#c084fc' : item.type === 'gold' ? '#d4af70' : item.type === 'xp' ? '#60d0ff' : '#80c040',
                border: `1px solid ${item.type === 'skill' ? '#4030a8' : item.type === 'gold' ? '#5a4010' : item.type === 'xp' ? '#1060b0' : '#304820'}`,
                fontFamily: 'Cinzel, serif',
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
      )}

      {/* B08 — Stats de combat */}
      {combatStats && isVictory && (
        <div className="px-6 py-2 flex justify-center gap-5" style={{ borderTop: `1px solid ${colors.bannerBorder}40` }}>
          <CombatStat icon="⚔️" label="Dealt"  value={combatStats.dmgDealt}  color="#d4af70" />
          <CombatStat icon="💥" label="Taken"  value={combatStats.dmgTaken}  color="#c06060" />
          <CombatStat icon="✨" label="Mana"   value={combatStats.manaSpent} color="#60a0f0" />
          <CombatStat icon="💀" label="Kills"  value={combatStats.kills}    color="#a080c0" />
        </div>
      )}

      <div className="px-6 pb-5 flex justify-center">
        <button
          onClick={onLeave}
          className="px-8 py-2.5 rounded-lg text-sm transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: '#1a1410',
            color: '#d4af70',
            border: '1px solid #3a2818',
            letterSpacing: '0.05em',
          }}
        >
          ← Continue
        </button>
      </div>
    </div>
  )
}

// ── Log de combat ─────────────────────────────────────────────────────────────
function CombatLog({ log }) {
  const LOG_COLORS = {
    victory: '#80d040',
    defeat:  '#e04040',
    player:  '#d4af70',
    enemy:   '#d06040',
    skill:   '#c084fc',
    heal:    '#40c880',
    drop:    '#f0d060',
    mana:    '#40a0f0',
    system:  '#708070',
    info:    '#6a5a4a',
    levelup: '#f0c040',  // S04
  }

  return (
    <div
      className="mx-4 mb-3 rounded-xl overflow-hidden"
      style={{ background: '#05050a', border: '1px solid #181428' }}
    >
      <div
        className="px-3 py-1 border-b"
        style={{ borderColor: '#181428', background: '#080810' }}
      >
        <span style={{
          color: '#3a3058',
          fontSize: '0.62rem',
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Combat Log
        </span>
      </div>
      <div className="px-4 py-2.5 overflow-y-auto" style={{ maxHeight: '160px' }}>
        {log.length === 0 && (
          <p style={{ color: '#2a2038', fontSize: '0.82rem', fontStyle: 'italic' }}>Awaiting action...</p>
        )}
        {log.map((entry, i) => (
          <p
            key={entry.id}
            style={{
              fontSize: '0.82rem',
              color: LOG_COLORS[entry.type] ?? LOG_COLORS.info,
              marginBottom: '0.25rem',
              opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.08),
              lineHeight: '1.4',
              transition: 'opacity 0.3s ease',
            }}
          >
            {entry.text}
          </p>
        ))}
      </div>
    </div>
  )
}
