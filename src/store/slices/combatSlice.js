// REFAC01 — Slice « combat » du store (extrait de gameStore.js, comportement inchangé).
import { IDLE_MASTERY_KILLS } from './idleSlice'
import { VIGOR_COST, VIGOR_MAX, applyVigorCost } from '../../engine/vigor'
import { getQuestById } from '../../data/quests'
import { completedBestiaryZones, ZONE_BESTIARY } from '../../data/bestiary'
import { useToastStore } from '../toastStore'

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
      // BEST01 — compteur de bestiaire PERSISTANT (méta, cumulé entre runs).
      meta: {
        ...state.meta,
        bestiaryKills: {
          ...(state.meta.bestiaryKills ?? {}),
          [monsterId]: ((state.meta.bestiaryKills ?? {})[monsterId] ?? 0) + 1,
        },
      },
    }))
    // ONB01/TUT02 — au passage du seuil de maîtrise, tip « idle unlocked » (one-shot ;
    // déduplication + respect du réglage tutoriel gérés par triggerHint).
    if (before + 1 >= IDLE_MASTERY_KILLS) get().triggerHint('idle_unlock')

    // QTOAST01 — pop-up de progrès pour les quêtes ACTIVES dont un objectif kill cible ce
    // monstre (combat + idle). Progresse 1..N puis « done » à l'exact ; pas de spam après.
    const st = get()
    for (const id of st.world.activeQuests ?? []) {
      const q = getQuestById(id)
      const obj = q?.objectives?.find((o) => o.type === 'kill' && o.monsterId === monsterId)
      if (!obj) continue
      const baseKill = st.world.questProgress?.[id]?.baseKills?.[monsterId] ?? 0
      const raw = (st.world.monsterKillCounts?.[monsterId] ?? 0) - baseKill
      if (raw > obj.count) continue // déjà accompli → pas de spam
      const done = raw === obj.count
      useToastStore.getState().addToast(
        `${done ? '✓ ' : ''}${q.name}: ${obj.label} ${raw}/${obj.count}`,
        'quest',
        done ? 4000 : 3200, // FIX-QTOAST-DUR01 — un poil plus persistant (+1 s)
      )
    }
    // BURN01 — un kill compte comme une action « combat » pour le burnout de monotonie.
    get().logAction('combat')
    // BEST03 — complétion du bestiaire d'une zone → titre dédié (awardTitle dédoublonne).
    for (const zone of completedBestiaryZones(get().meta.bestiaryKills)) {
      get().awardTitle(ZONE_BESTIARY[zone].titleId)
    }
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
