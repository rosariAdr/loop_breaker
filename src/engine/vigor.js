// STA01 — Vigueur (Fatigue). Jauge 0-100 : 100 = frais, décroît avec l'effort.
//
// Coûts décidés : −3 par combat, −1 par unité de distance (voyage), −3 par craft.
// Restaurée à 100 en dormant à l'auberge. Une action ratée/usante ajoute +40 de Fatigue
// (= −40 de vigueur). Paliers de malus appliqués aux stats de combat.

export const VIGOR_MAX = 100
export const VIGOR_COST = { combat: 3, distance: 1, craft: 3, failedCraft: 40 }

/**
 * Modificateurs de stats selon la vigueur (paliers).
 * - ≥ 70 : aucun malus.
 * - 50–69 : −10% ATK (strength).
 * - 30–49 : −15% ATK + AGI (strength, agility).
 * - < 30  : −35% toutes les stats + risque d'échec craft ×4.
 * @returns {{ mult: Record<string,number>, craftFailMult: number, tier: string }}
 */
export function getVigorMalus(vigor) {
  const v = Math.max(0, Math.min(VIGOR_MAX, vigor ?? VIGOR_MAX))
  if (v >= 70) return { mult: {}, craftFailMult: 1, tier: 'fresh' }
  if (v >= 50) return { mult: { strength: 0.90 }, craftFailMult: 1, tier: 'tired' }
  if (v >= 30) return { mult: { strength: 0.85, agility: 0.85 }, craftFailMult: 1, tier: 'weary' }
  const all = 0.65
  return { mult: { strength: all, agility: all, intelligence: all, chance: all, def: all }, craftFailMult: 4, tier: 'exhausted' }
}

/**
 * Applique les multiplicateurs de malus de vigueur à un objet de stats.
 * STA04 — `buffer` (0-1) atténue la PÉNALITÉ (ex. buffer 0.5 = malus réduit de moitié).
 */
export function applyVigorMalus(stats, vigor, buffer = 0) {
  const { mult } = getVigorMalus(vigor)
  if (Object.keys(mult).length === 0) return stats
  const b = Math.max(0, Math.min(1, buffer))
  const out = { ...stats }
  for (const [k, m] of Object.entries(mult)) {
    const buffered = 1 - (1 - m) * (1 - b) // réduit la pénalité (1-m) de `buffer`%
    if (typeof out[k] === 'number') out[k] = Math.max(0, Math.round(out[k] * buffered))
  }
  return out
}

// STA04 — Tampons d'atténuation de la Fatigue. Interpolation linéaire sur les paliers décidés.
function bufferAt(value, p100, p200, p300) {
  const v = Math.max(0, value ?? 0)
  if (v >= 300) return p300
  if (v >= 200) return p200 + (p300 - p200) * (v - 200) / 100
  if (v >= 100) return p100 + (p200 - p100) * (v - 100) / 100
  return p100 * v / 100
}
/** Aura tamponne le malus de Fatigue en COMBAT : 50% à 100, 70% à 200, 85% à 300. */
export function combatFatigueBuffer(aura) { return bufferAt(aura, 0.50, 0.70, 0.85) }
/** Concentration tamponne le malus de Fatigue au CRAFT : 70% à 100, 85% à 200, 100% à 300. */
export function craftFatigueBuffer(concentration) { return bufferAt(concentration, 0.70, 0.85, 1.00) }

/** Multiplicateur de risque d'échec de craft (4 si épuisé). */
export function craftFailMultiplier(vigor) {
  return getVigorMalus(vigor).craftFailMult
}

/** Retranche un coût de vigueur (clampé 0-100). */
export function applyVigorCost(vigor, amount) {
  return Math.max(0, Math.min(VIGOR_MAX, (vigor ?? VIGOR_MAX) - amount))
}
