// CRF04 — Résolution d'un craft selon le score du mini-jeu (alchimie CRF02 / forge CRF03).
// Logique pure et testable. Barème commun :
//   parfait     → rareté +2
//   bon         → rareté +1
//   neutre      → rareté de base
//   raté        → pas d'objet + debuff 7 jours
//   catastrophe → pas d'objet + debuff 7 jours sévère + 1 debuff PERMANENT

import { RARITY_TIERS } from '../data/equipment'

export const CRAFT_TIERS = ['catastrophe', 'fail', 'neutral', 'good', 'perfect']

/**
 * Précision d'une frappe selon la distance au centre de la zone cible.
 * 1 = plein centre, 0 = au bord (ou au-delà) de la demi-largeur.
 * @param {number} cursorPct position 0–100
 * @param {number} targetCenter centre de la zone 0–100
 * @param {number} halfWidth demi-largeur tolérée
 */
export function hitAccuracy(cursorPct, targetCenter, halfWidth) {
  if (halfWidth <= 0) return cursorPct === targetCenter ? 1 : 0
  const dist = Math.abs(cursorPct - targetCenter)
  return Math.max(0, 1 - dist / halfWidth)
}

/**
 * Z04 — Quantité produite par un craft d'alchimie selon le palier.
 * parfait 3, bon 2, neutre 1, raté/catastrophe 0 (potion ratée + debuff).
 */
export function alchemyQuantity(tier) {
  switch (tier) {
    case 'perfect':
      return 3
    case 'good':
      return 2
    case 'neutral':
      return 1
    default:
      return 0
  }
}

/** Moyenne d'une liste de précisions [0..1] (0 si liste vide). */
export function averageAccuracy(accuracies) {
  if (!accuracies || accuracies.length === 0) return 0
  return accuracies.reduce((a, b) => a + b, 0) / accuracies.length
}

/** Décale une rareté de `steps` crans dans RARITY_TIERS (clampé aux bornes). */
export function bumpRarity(rarity, steps) {
  const i = RARITY_TIERS.indexOf(rarity)
  if (i < 0) return rarity
  const j = Math.max(0, Math.min(RARITY_TIERS.length - 1, i + steps))
  return RARITY_TIERS[j]
}

/**
 * Convertit une précision de mini-jeu [0..1] en palier de craft.
 * Zones : ≥0.95 parfait, ≥0.75 bon, ≥0.45 neutre, ≥0.15 raté, sinon catastrophe.
 */
export function scoreToTier(accuracy) {
  if (accuracy >= 0.95) return 'perfect'
  if (accuracy >= 0.75) return 'good'
  if (accuracy >= 0.45) return 'neutral'
  if (accuracy >= 0.15) return 'fail'
  return 'catastrophe'
}

/**
 * Résout l'issue d'un craft.
 * Retourne :
 *  - succès  : { success: true, rarity, tier }
 *  - échec   : { success: false, rarity: null, tier, severity: 'fail'|'catastrophe' }
 * La sévérité indique au caller quel debuff appliquer (et si permanent).
 */
// STA03 — `extraBump` ajoute des crans de rareté (bonus Concentration). Défaut 0 = inchangé.
export function resolveCraftOutcome(baseRarity, tier, extraBump = 0) {
  switch (tier) {
    case 'perfect':
      return { success: true, tier, rarity: bumpRarity(baseRarity, 2 + extraBump) }
    case 'good':
      return { success: true, tier, rarity: bumpRarity(baseRarity, 1 + extraBump) }
    case 'neutral':
      return { success: true, tier, rarity: bumpRarity(baseRarity, extraBump) }
    case 'fail':
      return { success: false, tier, rarity: null, severity: 'fail', permanentDebuff: false }
    case 'catastrophe':
      return { success: false, tier, rarity: null, severity: 'catastrophe', permanentDebuff: true }
    default:
      return { success: true, tier: 'neutral', rarity: bumpRarity(baseRarity, extraBump) }
  }
}

// STA03 — Concentration (0-150). Gain par craft selon le tier du mini-jeu : +5 / +2 / +1.
export const CONCENTRATION_MAX = 150
export function concentrationGain(tier) {
  return tier === 'perfect' ? 5 : tier === 'good' ? 2 : tier === 'neutral' ? 1 : 0
}
// Chance d'un cran de rareté supérieur = concentration/150 (≥150 → garanti).
export function concentrationBumpChance(concentration) {
  return Math.min(1, Math.max(0, (concentration ?? 0) / CONCENTRATION_MAX))
}
export function rollConcentrationBump(concentration, rng = Math.random) {
  return rng() < concentrationBumpChance(concentration) ? 1 : 0
}
