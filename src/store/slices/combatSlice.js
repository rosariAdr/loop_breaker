// REFAC01 — Slice « combat » du store (extrait de gameStore.js, comportement inchangé).
import { IDLE_MASTERY_KILLS } from './idleSlice'
import { VIGOR_COST, VIGOR_MAX, applyVigorCost } from '../../engine/vigor'

export const createCombatSlice = (set, get) => ({
  // ── Kill count & idle ─────────────────────────────────────────────────────
  recordKill: (monsterId) => {
    // Accès défensif : monsterKillCounts peut être absent d'une vieille save.
    const before = (get().world.monsterKillCounts ?? {})[monsterId] || 0
    set((state) => ({
      world: {
        ...state.world,
        monsterKillCounts: {
          ...state.world.monsterKillCounts,
          [monsterId]: before + 1,
        },
      },
    }))
    // ONB01/TUT02 — au passage du seuil de maîtrise, tip « idle unlocked » (one-shot ;
    // déduplication + respect du réglage tutoriel gérés par triggerHint).
    if (before + 1 >= IDLE_MASTERY_KILLS) get().triggerHint('idle_unlock')
  },

  // ── Combat ────────────────────────────────────────────────────────────────
  startCombat: (enemies) =>
    set((state) => ({
      activeCombat: {
        enemies,
        turn: 0,
        log: [],
        phase: 'player',
        isOver: false,
        result: null, // 'victory' | 'defeat' | 'fled'
      },
      currentScreen: 'combat',
      // STA01 — un combat coûte de la vigueur
      hero: {
        ...state.hero,
        vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, VIGOR_COST.combat),
      },
    })),

  endCombat: (result) =>
    set((state) => {
      // Enregistrer dans le battleLog pour les conditions d'éveil
      // DV04 — hpPercent à la fin du combat (pour Voltaris : victoires sous 30% HP)
      const hpPercent = state.hero.stats.hp / state.hero.stats.maxHp
      const entry = {
        type: result,
        day: state.world.dayCount,
        turn: state.world.tickCount,
        hpPercent,
      }
      const newBattleLog = [...state.hero.battleLog, entry].slice(-100)

      return {
        activeCombat: null,
        currentScreen: 'world_map',
        hero: { ...state.hero, battleLog: newBattleLog },
      }
    }),

  addCombatLog: (message, type = 'info') =>
    set((state) => {
      if (!state.activeCombat) return state
      const newLog = [...state.activeCombat.log, { message, type }].slice(-20)
      return { activeCombat: { ...state.activeCombat, log: newLog } }
    }),

  // ── Enregistrer l'entrée en combat (pour Sylvara) ─────────────────────────
  recordCombatEntry: () =>
    set((state) => {
      const hpPercent = state.hero.stats.hp / state.hero.stats.maxHp
      const entry = { hpPercent, day: state.world.dayCount }
      const newLog = [...state.hero.combatEntryLog, entry].slice(-20)
      return { hero: { ...state.hero, combatEntryLog: newLog } }
    }),
})
