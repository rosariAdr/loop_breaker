// REFAC01 — Slice « meta » du store (extrait de gameStore.js, comportement inchangé).
import { ACHIEVEMENTS, newlyUnlocked } from '../../data/achievements'
import { DEITIES, applyDeityBlessing } from '../../data/deities'
import { MONSTERS } from '../../data/monsters'
import { TITLES } from '../../data/titles'
import { gluttonyAbsorbAmount, pickGluttonyStat } from '../../engine/gluttony'
import { INITIAL_HERO, INITIAL_WORLD } from '../initialState'
import { useToastStore } from '../toastStore'

export const createMetaSlice = (set) => ({
  setScreen: (screen) => set({ currentScreen: screen }),

  // GLT01/GLT02/GLT04 — Gluttony absorbe une stat (proc passif aléatoire ou assassinat choisi)
  absorbGluttony: ({ monsterId, stat = null }) =>
    set((state) => {
      const monster = MONSTERS[monsterId]
      if (!monster) return state
      const chosenStat = stat ?? pickGluttonyStat()
      const amount = gluttonyAbsorbAmount(monster)
      useToastStore
        .getState()
        .addToast(
          `Gluttony — Absorbed +${amount} ${chosenStat.toUpperCase()} from ${monster.name}`,
          'gluttony',
        )
      return {
        hero: {
          ...state.hero,
          stats: {
            ...state.hero.stats,
            [chosenStat]: (state.hero.stats[chosenStat] ?? 0) + amount,
          },
        },
        meta: {
          ...state.meta,
          permanentStatBoosts: {
            ...(state.meta.permanentStatBoosts ?? {}),
            [chosenStat]: ((state.meta.permanentStatBoosts ?? {})[chosenStat] ?? 0) + amount,
          },
          gluttonyLastUsed: state.world.dayCount,
        },
      }
    }),

  // M01 — Attribue un titre permanent (dédup, persistant entre runs). Toast si nouveau.
  awardTitle: (titleId) =>
    set((state) => {
      if (!TITLES[titleId]) return state
      const earned = state.meta.titlesEarned ?? []
      if (earned.includes(titleId)) return state
      useToastStore.getState().addToast(`Title earned: ${TITLES[titleId].name}`, 'info')
      return { meta: { ...state.meta, titlesEarned: [...earned, titleId] } }
    }),

  // ACH01 — Évalue les accomplissements ; débloque les nouveaux, applique leurs bonus de
  // stat (permanents, comme Gluttony) + toast. Appelé après kill / quête / mort / demon lord.
  checkAchievements: () =>
    set((state) => {
      const newly = newlyUnlocked(state)
      if (newly.length === 0) return state
      const newStats = { ...state.hero.stats }
      const permBoosts = { ...(state.meta.permanentStatBoosts ?? {}) }
      newly.forEach((ach) => {
        const r = ach.reward ?? {}
        if (r.stat && typeof newStats[r.stat.name] === 'number') {
          newStats[r.stat.name] += r.stat.amount
          permBoosts[r.stat.name] = (permBoosts[r.stat.name] ?? 0) + r.stat.amount
        }
        useToastStore
          .getState()
          .addToast(`🏆 Achievement: ${ACHIEVEMENTS[ach.id].name}!`, 'levelup', 4000)
      })
      return {
        hero: { ...state.hero, stats: newStats },
        meta: {
          ...state.meta,
          achievements: [...(state.meta.achievements ?? []), ...newly.map((a) => a.id)],
          permanentStatBoosts: permBoosts,
        },
      }
    }),

  // Q05 — incrémente le compteur de crafts réussis (pour les quêtes de craft)
  incrementCraftCount: () =>
    set((state) => ({ meta: { ...state.meta, craftCount: (state.meta.craftCount ?? 0) + 1 } })),

  // ── Système divin ─────────────────────────────────────────────────────────
  triggerDivineCall: (deityId) =>
    set({ pendingDivineCall: { deityId }, currentScreen: 'divine_call' }),

  acceptDeity: (deityId, chosenSkillId) =>
    set((state) => {
      const divineSkill = { skillId: chosenSkillId, level: 1, xp: 0 }
      const alreadyIn = state.hero.activeSkills.some((s) => s.skillId === chosenSkillId)
      const newActiveSkills = alreadyIn
        ? state.hero.activeSkills
        : [...state.hero.activeSkills, divineSkill]

      // DV08 — appliquer la bénédiction passive aux stats (ex: Ignareth +15% strength)
      const newStats = applyDeityBlessing(state.hero.stats, deityId)
      const blessing = DEITIES[deityId]?.blessing ?? null

      return {
        hero: {
          ...state.hero,
          deity: deityId,
          deityBlessing: blessing,
          divineSkill,
          activeSkills: newActiveSkills,
          stats: newStats,
        },
        meta: {
          ...state.meta,
          divineBonds: { ...state.meta.divineBonds, medieval_fantasy: deityId },
        },
        pendingDivineCall: null,
        currentScreen: 'world_map',
      }
    }),

  // DV07 — Refuser la divinité = run solo (flag pour le bonus T11 à la transmigration)
  refuseDeity: () =>
    set((state) => ({
      pendingDivineCall: null,
      currentScreen: 'world_map',
      hero: { ...state.hero, soloRun: true },
    })),

  // ── Mort & transmigration ─────────────────────────────────────────────────
  heroDeath: (cause = 'Unknown enemy') =>
    set((state) => {
      const { hero, world } = state
      const summary = {
        cause,
        zone: world.currentZone,
        day: world.dayCount,
        level: hero.level,
        skills: [...hero.activeSkills, ...hero.passiveSkills],
        stats: { ...hero.stats },
        totalKills: Object.values(world.monsterKillCounts).reduce((a, b) => a + b, 0),
        reputationTokens: hero.reputationTokens,
      }

      return {
        meta: {
          ...state.meta,
          totalDeaths: state.meta.totalDeaths + 1,
          lastRunSummary: summary,
          totalRepTokensEarned: state.meta.totalRepTokensEarned + hero.reputationTokens,
        },
        activeCombat: null,
        currentScreen: 'post_mortem',
      }
    }),

  // TUT03 — Marque le hint de transmigration comme vu (1ère mort)
  markFirstDeathSeen: () => set((state) => ({ meta: { ...state.meta, firstDeathSeen: true } })),

  // Confirmer l'héritage et passer à la boutique des dieux
  confirmInheritance: (chosenStat, chosenActiveSkill, chosenPassiveSkill) =>
    set((state) => ({
      meta: {
        ...state.meta,
        pendingInheritance: {
          stat: chosenStat,
          activeSkill: chosenActiveSkill,
          passiveSkill: chosenPassiveSkill,
          bonuses: [],
        },
      },
      currentScreen: 'gods_shop',
    })),

  // Appliquer la renaissance après la boutique des dieux
  // shopPurchases : {
  //   extraSkills?:    [{ type: 'active'|'passive', ... }],   // T07 — slot bonus skill
  //   rankRestored?:   boolean,                                // T06 — restaure 80% des rep tokens
  //   bonusStatSlot?:  boolean,                                // T08 — +1 stat random
  //   bonusStat?:      string,                                 // T08 — stat précise (override random)
  //   skillLevelUps?:  number,                                 // T09 — N levels sur skills hérités
  // }
  applyTransmigration: (shopPurchases = {}) =>
    set((state) => {
      const { pendingInheritance } = state.meta
      if (!pendingInheritance) return state

      // Stats de base + héritage de stat (TRM01)
      const newStats = { ...INITIAL_HERO.stats }
      if (pendingInheritance.stat) {
        const stat = pendingInheritance.stat
        const base = INITIAL_HERO.stats[stat] ?? 0
        // TRM01 — « ramener davantage » : 40% de la valeur ATTEINTE pendant le run
        // (lastRunSummary), avec plancher = base (jamais sous la stat de départ).
        const runValue = state.meta.lastRunSummary?.stats?.[stat] ?? base
        newStats[stat] = Math.max(base, Math.round(runValue * 0.4))
      }
      newStats.hp = newStats.maxHp = 100
      newStats.mana = newStats.maxMana = 60

      // GLT01 — réapplique les boosts permanents de Gluttony (cumulés entre runs)
      Object.entries(state.meta.permanentStatBoosts ?? {}).forEach(([stat, amt]) => {
        if (stat in newStats) newStats[stat] = (newStats[stat] ?? 0) + amt
      })

      // T08 — stat bonus (slot supplémentaire)
      if (shopPurchases.bonusStatSlot) {
        const statKeys = ['strength', 'agility', 'intelligence', 'chance', 'def']
        const bonusStat =
          shopPurchases.bonusStat ?? statKeys[Math.floor(Math.random() * statKeys.length)]
        if (statKeys.includes(bonusStat)) {
          newStats[bonusStat] = (newStats[bonusStat] ?? 0) + 1
        }
      }

      // T11 + DV07 — Compensation solo : run précédent sans divinité OU refus explicite
      const wasSolo = !state.hero.deity || state.hero.soloRun === true
      const soloLevelBonus = wasSolo ? 1 : 0

      // T09 — Skill level ups boutique (au-dessus du niveau actuel)
      const skillLevelUps = Math.max(0, shopPurchases.skillLevelUps ?? 0)

      // Construire les skills hérités avec bonus T09 + T11
      const applyLevelBonus = (skill) => {
        if (!skill) return null
        const bonus = soloLevelBonus + skillLevelUps
        return { ...skill, level: Math.min(3, (skill.level ?? 1) + bonus) }
      }

      const inheritedActive = pendingInheritance.activeSkill
        ? [{ ...applyLevelBonus(pendingInheritance.activeSkill), currentCooldown: 0 }]
        : []
      const inheritedPassive = pendingInheritance.passiveSkill
        ? [applyLevelBonus(pendingInheritance.passiveSkill)]
        : []

      // T07 — bonus skill slot (normaliser au format { skillId, level, xp, currentCooldown? })
      const extraSkills = shopPurchases.extraSkills ?? []
      const normalizeSkill = (s, isActive) => ({
        skillId: s.skillId,
        level: s.level ?? 1,
        xp: s.xp ?? 0,
        ...(isActive ? { currentCooldown: 0 } : {}),
      })
      const extraActive = extraSkills
        .filter((s) => s.type === 'active')
        .map((s) => normalizeSkill(s, true))
      const extraPassive = extraSkills
        .filter((s) => s.type === 'passive')
        .map((s) => normalizeSkill(s, false))
      const allActive = [...inheritedActive, ...extraActive]
      const allPassive = [...inheritedPassive, ...extraPassive]

      // T06 — Rank restoration : 80% des rep tokens du run précédent
      const restoredTokens = shopPurchases.rankRestored
        ? Math.round((state.hero.reputationTokens ?? 0) * 0.8)
        : 0

      // T04 + W02 — Malachar resurrection counter
      // Incrémenté à CHAQUE transmigration tant que Malachar est défait.
      // Quand le counter atteint 4 → Malachar respawn (reset counter + flag defeated)
      const RESURRECTION_CYCLES = 4
      const wasDemonLordDefeated = state.world.demonLordDefeated
      let newCounter = state.world.demonLordResurrectionCounter ?? 0
      let nextDemonLordDefeated = wasDemonLordDefeated
      let nextDungeons = { ...INITIAL_WORLD.dungeons }

      if (wasDemonLordDefeated) {
        newCounter += 1
        if (newCounter >= RESURRECTION_CYCLES) {
          // Malachar respawn
          newCounter = 0
          nextDemonLordDefeated = false
          // Le donjon grimspire est aussi reset (cleared → false)
          nextDungeons = {
            ...nextDungeons,
            grimspire: { ...nextDungeons.grimspire, cleared: false, discovered: false },
          }
        }
      } else {
        newCounter = 0 // pas de défaite encore : counter à 0
      }

      return {
        hero: {
          ...INITIAL_HERO,
          stats: newStats,
          activeSkills: allActive,
          passiveSkills: allPassive,
          runNumber: state.hero.runNumber + 1,
          deathCount: state.hero.deathCount + 1,
          reputationTokens: restoredTokens,
          // heroNamed : on garde le nom — pas la peine de retaper à chaque run
          name: state.hero.name,
          heroNamed: state.hero.heroNamed,
        },
        world: {
          ...INITIAL_WORLD,
          dungeons: nextDungeons,
          // T04 — Malachar resurrection counter persiste à travers le nouveau monde
          demonLordDefeated: nextDemonLordDefeated,
          demonLordResurrectionCounter: newCounter,
        },
        meta: {
          ...state.meta,
          pendingInheritance: null,
          // W03 — Flag malacharDefeatedThisRun reset après transmigration (consommé)
          malacharDefeatedThisRun: false,
        },
        currentScreen: 'world_map',
        pendingLevelUp: 0,
        recentSkillLevelUps: [],
      }
    }),

  // SET01 — modifier un réglage joueur
  setSetting: (key, value) =>
    set((s) => ({ meta: { ...s.meta, settings: { ...(s.meta.settings ?? {}), [key]: value } } })),
})
