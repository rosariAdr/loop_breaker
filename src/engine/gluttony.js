// GLT01-04 — Skill Gluttony (passif interdit).
// Sur kill : 10% de chance (cooldown 5 jours) d'absorber définitivement une
// fraction de la puissance du monstre dans une stat aléatoire du héros.
// Assassinat (kill en 1 action depuis HP max) → garanti + le joueur choisit la stat.
// Boosts cumulés dans meta.permanentStatBoosts ; appliqués à chaque run.

export const GLUTTONY_STATS = ['strength', 'agility', 'intelligence', 'def', 'chance']
export const GLUTTONY_PROC_CHANCE = 0.1
export const GLUTTONY_COOLDOWN_DAYS = 5

/** Proc passif (10%). */
export function rollGluttonyProc(rng = Math.random) {
  return rng() < GLUTTONY_PROC_CHANCE
}

/** Stat aléatoire absorbée (proc passif). */
export function pickGluttonyStat(rng = Math.random) {
  return GLUTTONY_STATS[Math.floor(rng() * GLUTTONY_STATS.length)]
}

/** Montant absorbé = 10% de la puissance (atk) du monstre, min 1. */
export function gluttonyAbsorbAmount(monster) {
  const power = monster?.baseStats?.atk ?? 5
  return Math.max(1, Math.round(power * 0.1))
}

/** Gluttony prête si jamais utilisée ou cooldown écoulé. */
export function isGluttonyReady(currentDay, lastUsedDay, cooldown = GLUTTONY_COOLDOWN_DAYS) {
  if (lastUsedDay == null) return true
  return currentDay - lastUsedDay >= cooldown
}

/** Jours restants avant que Gluttony soit de nouveau prête (0 si prête). */
export function gluttonyDaysRemaining(currentDay, lastUsedDay, cooldown = GLUTTONY_COOLDOWN_DAYS) {
  if (lastUsedDay == null) return 0
  return Math.max(0, cooldown - (currentDay - lastUsedDay))
}

/** Vrai si le héros a le passif Gluttony équipé. */
export function hasGluttony(passiveSkills = []) {
  return passiveSkills.some((s) => s.skillId === 'gluttony')
}
