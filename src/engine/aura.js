// STA02 — Aura : multiplicateur de dégâts passif permanent.
//
// DÉCIDÉ : +(X/2)% de dégâts par point d'Aura (sans plafond). Déblocage : 15 skills
// utilisés en < 4 jours (OU entraînement chez un maître — TRA01). À l'unlock : 15 d'Aura.
// Gain : +1 Aura tous les 10 skills utilisés.

export const AURA = {
  dmgPerPoint: 0.005,      // +0.5% de dégâts / point (= X/2 %)
  unlockUses: 15,          // 15 skills…
  unlockWindowDays: 4,     // …en moins de 4 jours
  startValue: 15,          // Aura de départ à l'unlock
  gainPerUses: 10,         // +1 Aura tous les 10 skills utilisés
}

/** Nombre d'événements (jours) dans la fenêtre glissante des `windowDays` derniers jours. */
export function countWithinDays(dayLog, currentDay, windowDays) {
  return (dayLog ?? []).filter((d) => currentDay - d < windowDays).length
}

/** Multiplicateur de dégâts dû à l'Aura (1 si non débloquée). */
export function auraDamageMult(aura) {
  return 1 + Math.max(0, aura ?? 0) * AURA.dmgPerPoint
}
