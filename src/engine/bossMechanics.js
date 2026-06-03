// BSS01 / BSS02 / BSS03 — Mécaniques de boss (logique pure, testable).
// Version allégée : voir TASKS.md (BSS01b/BSS02b) pour la fidélité complète
// (invocation de 2 entités, cycle d'armure 3 tours) laissée en backlog.

/**
 * BSS03 — Malachar : 3 phases selon le %HP restant.
 *  P1 (>60%)  : normal
 *  P2 (≤60%)  : Rage (+50% ATK, immunité soins)
 *  P3 (≤30%)  : Soul Drain (15% maxHP du héros/tour) en plus de la Rage
 */
export function getMalacharPhase(hpPercent) {
  if (hpPercent <= 0.30) {
    return { phase: 3, atkMult: 1.5, soulDrainPct: 0.15, healImmune: true, label: 'Soul Drain' }
  }
  if (hpPercent <= 0.60) {
    return { phase: 2, atkMult: 1.5, soulDrainPct: 0, healImmune: true, label: 'Rage' }
  }
  return { phase: 1, atkMult: 1.0, soulDrainPct: 0, healImmune: false, label: 'Normal' }
}

/**
 * BSS01 — Crypt Keeper (léger) : enrage unique déclenché à ≤50% HP,
 * stand-in de l'invocation de Skeleton Adds (la vraie invocation = BSS01b).
 * Retourne { trigger: nouvellement déclenché ce tour, atkMult }.
 */
export function getCryptKeeperEnrage(hpPercent, alreadyEnraged) {
  if (!alreadyEnraged && hpPercent <= 0.5) {
    return { trigger: true, atkMult: 1.4 }
  }
  return { trigger: false, atkMult: alreadyEnraged ? 1.4 : 1.0 }
}

/** BSS02 — Lord of the Forsaken (léger) : effet appliqué par Cursed Strike. */
export const CURSED_STRIKE_EFFECT = { type: 'atk_down', duration: 2, reduction: 0.20 }

/** BSS02 — tirage de Cursed Strike (STR−20%) à l'attaque du boss. */
export function rollCursedStrike(chance, rng = Math.random) {
  return rng() < chance
}

/**
 * Aiguille vers la bonne mécanique selon le type déclaré sur le boss.
 * Retourne null si le monstre n'a pas de mécanique.
 */
export function getBossMechanicType(enemy) {
  return enemy?.bossMechanics?.type ?? null
}
