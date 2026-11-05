// REFAC01 — Slice « combat » du store (extrait de gameStore.js, comportement inchangé).
import { resolveSentinelTrial, EMPTY_TRIAL } from '../../engine/sentinelTrial'
import { campaignGate } from '../../data/campaignProgression'
import { IDLE_MASTERY_KILLS } from './idleSlice'
import { VIGOR_COST, VIGOR_MAX, applyVigorCost } from '../../engine/vigor'
import { getQuestById } from '../../data/quests'
import { completedBestiaryZones, ZONE_BESTIARY } from '../../data/bestiary'
import { useToastStore } from '../toastStore'

export const createCombatSlice = (set, get) => ({
  recordManualBattle: (outcome) => {
    const state = get()
    const combat = state.activeCombat
    if (!combat || combat.campaignRecorded) return
    const ids = combat.enemies.map((e) => e.monsterId)
    const resolution = resolveSentinelTrial(state.world.sentinelTrial ?? EMPTY_TRIAL, outcome, ids)
    const events = new Set(state.world.campaignEvents ?? [])
    if (outcome === 'victory') {
      if (ids.includes('hollow_crypt_boss')) events.add('crypt_cleared')
      if (ids.includes('forsaken_citadel_boss')) events.add('citadel_cleared')
      if (ids.includes('malachar')) events.add('malachar_defeated')
    }
    set((s) => ({
      activeCombat: { ...s.activeCombat, campaignRecorded: true },
      world: { ...s.world, sentinelTrial: resolution.trial, campaignEvents: [...events] },
      hero: {
        ...s.hero,
        inventory: {
          ...s.hero.inventory,
          resources: {
            ...s.hero.inventory.resources,
            sentinel_orb: (s.hero.inventory.resources.sentinel_orb ?? 0) + resolution.orbs,
          },
        },
      },
    }))
    if (resolution.orbs)
      useToastStore
        .getState()
        .addToast(
          'Sentinel Trial complete — +1 Sentinel Orb. Start another trial to earn more.',
          'quest',
        )
    else if (state.world.sentinelTrial?.active)
      useToastStore
        .getState()
        .addToast(
          resolution.trial.wins
            ? 'Sentinel Trial: 1/2 victories. Resting is allowed.'
            : 'Sentinel Trial: streak reset (defeat, retreat or another enemy).',
          'quest',
        )
  },

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
    // QA01 — la propagation (bestiaire, quêtes, burnout, titres, hint) est partagée avec
    // les kills IDLE : elle NE touche PAS monsterKillCounts (déjà incrémenté par l'appelant).
    get().propagateKills(monsterId, 1)
  },

  // QA01 — Propagation d'un ou plusieurs kills vers tous les systèmes en aval, SANS toucher
  // `world.monsterKillCounts` (l'appelant l'a déjà incrémenté). Appelé par recordKill (combat)
  // ET par l'idle (processIdleTick + applyOfflineProgress) pour garantir que le bestiaire,
  // les toasts de quête, le burnout et les titres de zone comptent AUSSI les kills idle.
  propagateKills: (monsterId, count = 1) => {
    if (count <= 0) return
    const before = ((get().world.monsterKillCounts ?? {})[monsterId] || 0) - count
    // BEST01 — compteur de bestiaire PERSISTANT (méta, cumulé entre runs).
    set((state) => ({
      meta: {
        ...state.meta,
        bestiaryKills: {
          ...(state.meta.bestiaryKills ?? {}),
          [monsterId]: ((state.meta.bestiaryKills ?? {})[monsterId] ?? 0) + count,
        },
      },
    }))
    // ONB01/TUT02 — au passage du seuil de maîtrise, tip « idle unlocked » (one-shot ;
    // déduplication + respect du réglage tutoriel gérés par triggerHint).
    if (before < IDLE_MASTERY_KILLS && before + count >= IDLE_MASTERY_KILLS)
      get().triggerHint('idle_unlock')

    // Start the second part only when the preceding objective has been met.
    for (const id of get().world.activeQuests) {
      const quest = getQuestById(id)
      for (const obj of quest?.objectives ?? []) {
        if (!obj.afterObjective) continue
        const previous = quest.objectives.find((o) => o.id === obj.afterObjective)
        const progress = get().world.questProgress[id]
        if (progress?.orderedReady?.[obj.id]) continue
        if (
          (get().world.monsterKillCounts[previous.monsterId] ?? 0) -
            (progress?.baseKills?.[previous.monsterId] ?? 0) >=
          previous.count
        ) {
          set((s) => ({
            world: {
              ...s.world,
              questProgress: {
                ...s.world.questProgress,
                [id]: {
                  ...progress,
                  orderedReady: { ...progress?.orderedReady, [obj.id]: true },
                  baseKills: {
                    ...progress?.baseKills,
                    [obj.monsterId]: s.world.monsterKillCounts[obj.monsterId] ?? 0,
                  },
                },
              },
            },
          }))
        }
      }
    }

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
  startCombat: (enemies) => {
    if (
      enemies.some(
        (e) =>
          !campaignGate(
            e.monsterId === 'hollow_crypt_boss'
              ? 'crypt'
              : e.monsterId === 'forsaken_citadel_boss'
                ? 'forsaken_citadel'
                : e.monsterId,
            get().world,
          ),
      )
    )
      return false
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
    }))
    return true
  },

  endCombat: (result) => {
    get().recordManualBattle(result)
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
    })
  },

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
