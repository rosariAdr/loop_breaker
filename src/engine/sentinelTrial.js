export const EMPTY_TRIAL = { active: false, wins: 0, completed: 0 }

// One resolved manual battle counts once, irrespective of the number of enemies.
export function resolveSentinelTrial(trial, outcome, monsterIds) {
  if (!trial.active) return { trial, orbs: 0 }
  const sentinelOnly = monsterIds.length > 0 && monsterIds.every((id) => id === 'graven_sentinel')
  if (outcome !== 'victory' || !sentinelOnly) return { trial: { ...trial, wins: 0 }, orbs: 0 }
  const wins = trial.wins + 1
  if (wins < 2) return { trial: { ...trial, wins }, orbs: 0 }
  return { trial: { active: false, wins: 0, completed: trial.completed + 1 }, orbs: 1 }
}
