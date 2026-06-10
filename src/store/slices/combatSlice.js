// REFAC01 — Slice « combat » du store (extrait de gameStore.js, comportement inchangé).
import { MONSTERS } from '../../data/monsters'
import { VIGOR_COST, VIGOR_MAX, applyVigorCost } from '../../engine/vigor'
import { useToastStore } from '../toastStore'

export const createCombatSlice = (set) => ({
  // ── Kill count & idle ─────────────────────────────────────────────────────
  recordKill: (monsterId) =>
    set((state) => {
      const current = (state.world.monsterKillCounts ?? {})[monsterId] || 0
      const newCount = current + 1

      // TUT02 — Hint idle unlock : 1ère fois qu'un mob atteint 5 kills (seuil idle)
      // Accès défensif : `seenHints` peut être absent d'une vieille save → ?? []
      // (sinon `.includes` throwait et bloquait l'incrément du compteur de kills).
      const currentHints = state.meta.seenHints ?? []
      let newSeenHints = currentHints
      if (newCount >= 5 && !currentHints.includes('idle_unlock')) {
        const monsterName = MONSTERS[monsterId]?.name ?? monsterId
        useToastStore
          .getState()
          .addToast(
            `Idle combat unlocked for ${monsterName}! Toggle it from the zone view.`,
            'info',
            4000,
          )
        newSeenHints = [...currentHints, 'idle_unlock']
      }

      return {
        world: {
          ...state.world,
          monsterKillCounts: {
            ...state.world.monsterKillCounts,
            [monsterId]: newCount,
          },
        },
        meta: { ...state.meta, seenHints: newSeenHints },
      }
    }),

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
