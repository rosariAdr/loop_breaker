// ACH01 — Accomplissements à bonus permanents (méta, persistants entre runs).
// Conditions dérivées de compteurs déjà existants. Récompenses = boost de stat permanent
// (réappliqué à chaque run via meta.permanentStatBoosts, comme Gluttony).

export const ACHIEVEMENTS = {
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    desc: 'Defeat your first monster.',
    metric: 'totalKills',
    target: 1,
    reward: { stat: { name: 'strength', amount: 1 } },
  },
  monster_hunter: {
    id: 'monster_hunter',
    name: 'Monster Hunter',
    desc: 'Defeat 50 monsters.',
    metric: 'totalKills',
    target: 50,
    reward: { stat: { name: 'strength', amount: 2 } },
  },
  exterminator: {
    id: 'exterminator',
    name: 'Exterminator',
    desc: 'Defeat 250 monsters.',
    metric: 'totalKills',
    target: 250,
    reward: { stat: { name: 'strength', amount: 3 } },
  },
  questmaster: {
    id: 'questmaster',
    name: 'Questmaster',
    desc: 'Complete 5 quests.',
    metric: 'questsCompleted',
    target: 5,
    reward: { stat: { name: 'chance', amount: 1 } },
  },
  survivor: {
    id: 'survivor',
    name: 'Survivor',
    desc: 'Survive to day 15.',
    metric: 'daysSurvived',
    target: 15,
    reward: { stat: { name: 'def', amount: 2 } },
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    desc: 'Reach your 5th run.',
    metric: 'runs',
    target: 5,
    reward: { stat: { name: 'agility', amount: 2 } },
  },
  demon_slayer: {
    id: 'demon_slayer',
    name: 'Demon Slayer',
    desc: 'Defeat a Demon Lord.',
    metric: 'demonLordKills',
    target: 1,
    reward: { stat: { name: 'strength', amount: 5 } },
  },
  unbreakable: {
    id: 'unbreakable',
    name: 'Unbreakable',
    desc: 'Die 10 times — and keep going.',
    metric: 'deaths',
    target: 10,
    reward: { stat: { name: 'def', amount: 2 } },
  },

  // META-ACHIEVE02 — pool élargi (bonus méta façon ACH01).
  slayer_supreme: {
    id: 'slayer_supreme',
    name: 'Slayer Supreme',
    desc: 'Defeat 1000 monsters.',
    metric: 'totalKills',
    target: 1000,
    reward: { stat: { name: 'strength', amount: 5 } },
  },
  demon_lord_hunter: {
    id: 'demon_lord_hunter',
    name: 'Demon Lord Hunter',
    desc: 'Defeat 10 Demon Lords.',
    metric: 'demonLordKills',
    target: 10,
    reward: { stat: { name: 'strength', amount: 8 } },
  },
  long_hauler: {
    id: 'long_hauler',
    name: 'Long Hauler',
    desc: 'Survive to day 30.',
    metric: 'daysSurvived',
    target: 30,
    reward: { stat: { name: 'def', amount: 3 } },
  },
  quest_legend: {
    id: 'quest_legend',
    name: 'Quest Legend',
    desc: 'Complete 50 quests.',
    metric: 'questsCompleted',
    target: 50,
    reward: { stat: { name: 'chance', amount: 3 } },
  },
  set_collector: {
    id: 'set_collector',
    name: 'Set Collector',
    desc: 'Complete a full equipment set.',
    metric: 'completeSets',
    target: 1,
    reward: { stat: { name: 'def', amount: 3 } },
  },
}

// META-ACHIEVE02 — nb de sets d'équipement complets (≥3 pièces partageant un `set`).
function countCompleteSets(equipped = {}) {
  const counts = {}
  for (const item of Object.values(equipped)) {
    if (item?.set) counts[item.set] = (counts[item.set] ?? 0) + 1
  }
  return Object.values(counts).filter((n) => n >= 3).length
}

/** Compteurs courants utilisés par les conditions (dérivés de l'état). */
export function getAchievementStats(state) {
  const w = state.world ?? {}
  const m = state.meta ?? {}
  const dl =
    typeof m.demonLordKills === 'object'
      ? Object.values(m.demonLordKills).reduce((a, b) => a + b, 0)
      : (m.demonLordKills ?? 0)
  return {
    totalKills: Object.values(w.monsterKillCounts ?? {}).reduce((a, b) => a + b, 0),
    questsCompleted: (w.completedQuests ?? []).length,
    daysSurvived: w.dayCount ?? 1,
    runs: state.hero?.runNumber ?? 1,
    demonLordKills: dl,
    deaths: m.totalDeaths ?? 0,
    completeSets: countCompleteSets(state.hero?.equipped),
  }
}

/** Liste des accomplissements nouvellement remplis (non encore débloqués). */
export function newlyUnlocked(state) {
  const stats = getAchievementStats(state)
  const have = state.meta?.achievements ?? []
  return Object.values(ACHIEVEMENTS).filter(
    (a) => !have.includes(a.id) && stats[a.metric] >= a.target,
  )
}

/** Accomplissement non débloqué dont on est le PLUS proche (max progress/target). */
export function getClosestAchievement(state) {
  const stats = getAchievementStats(state)
  const have = state.meta?.achievements ?? []
  const pending = Object.values(ACHIEVEMENTS)
    .filter((a) => !have.includes(a.id))
    .map((a) => ({
      ...a,
      current: Math.min(stats[a.metric] ?? 0, a.target),
      pct: a.target > 0 ? Math.min(1, (stats[a.metric] ?? 0) / a.target) : 0,
    }))
    .sort((x, y) => y.pct - x.pct)
  return pending[0] ?? null
}
