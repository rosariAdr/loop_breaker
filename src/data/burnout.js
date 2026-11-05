// BURN01/BURN02/BURN-G1 — Burnout de monotonie : répéter le même type d'action sans variété
// use le héros. Fenêtre glissante 4 jours ; ≥6 actions du même type sans variété → malus −10%
// sur l'Aura (sur-combat) ou la Concentration (sur-craft), 1 jour ; exempt dès ≥2 activités
// distinctes dans la fenêtre. N'alimente PAS la Fatigue (axes séparés).
export const BURNOUT = {
  windowDays: 4,
  threshold: 6, // ≥6 actions du même type sans variété
  malus: 0.1, // −10%
  durationDays: 1,
}
export const ACTION_TYPES = ['combat', 'craft', 'rest', 'collect', 'travel']
// Quel stat est pénalisé selon le type sur-représenté.
const ACTION_STAT = { combat: 'aura', craft: 'concentration' }

// BURN01 — compte les actions par type dans la fenêtre glissante.
export function actionCountsInWindow(
  actionLog = [],
  currentDay = 1,
  windowDays = BURNOUT.windowDays,
) {
  const counts = {}
  for (const a of actionLog) {
    if (currentDay - (a.day ?? 0) < windowDays) counts[a.type] = (counts[a.type] ?? 0) + 1
  }
  return counts
}

// BURN02/BURN-G1 — évalue le burnout : un seul type d'activité présent ET ≥ seuil.
// Retourne { type, stat, malus, day } ou null (exempt dès ≥2 activités distinctes).
export function evaluateBurnout(actionLog = [], currentDay = 1) {
  const counts = actionCountsInWindow(actionLog, currentDay)
  if (Object.keys(counts).length >= 2) return null // variété → exempt
  for (const [type, n] of Object.entries(counts)) {
    const stat = ACTION_STAT[type]
    if (stat && n >= BURNOUT.threshold) return { type, stat, malus: BURNOUT.malus, day: currentDay }
  }
  return null
}

// BURN01 — ajoute une action au journal (borné à la fenêtre) + recalcule le burnout.
export function appendAction(world, type) {
  const day = world?.dayCount ?? 1
  const log = [...(world?.actionLog ?? []), { type, day }]
    .filter((a) => day - (a.day ?? 0) < BURNOUT.windowDays)
    .slice(-200)
  return { actionLog: log, burnout: evaluateBurnout(log, day) }
}

// Malus courant pour un stat donné (0 si pas de burnout de ce type, ou expiré au-delà de la durée).
export function getBurnoutMalus(world, stat) {
  const b = world?.burnout
  if (!b || b.stat !== stat) return 0
  if ((world?.dayCount ?? 1) - (b.day ?? 0) >= BURNOUT.durationDays) return 0 // expiré
  return b.malus
}
