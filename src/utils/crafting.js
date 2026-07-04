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

// ── Cœur PARTAGÉ du modèle de qualité HYBRIDE (v1.42 batch 5) ─────────────────────
// Un SEUL chemin de qualité pour tout le craft. La rareté de base (issue d'une rarityTable
// ou d'une recette mono-rareté) reçoit des BUMPS BORNÉS (crans entiers), puis on clampe :
//   • jamais SOUS la base (la qualité n'abaisse pas la rareté) ;
//   • jamais AU-DESSUS du plafond du lieu (locationCapRarity, CRAFT-LOC01), s'il est fourni
//     ET cohérent (≥ base) ; un plafond incohérent (< base) est ignoré au profit de la base ;
//   • toujours dans les bornes de RARITY_TIERS.
// Ce cœur est appelé par resolveCraftOutcome (STA03) ET par craftModel.resolveCraftedRarity
// (modèle hybride) → un seul et unique modèle de qualité, plus de formules concurrentes.

/**
 * Nombre de crans de rareté conférés par le PALIER du mini-jeu (STA03/CRF04).
 * parfait +2, bon +1, neutre 0 (les ratés ne produisent pas d'objet, gérés à part).
 */
export function tierRarityBump(tier) {
  if (tier === 'perfect') return 2
  if (tier === 'good') return 1
  return 0
}

/**
 * Applique des bumps de rareté bornés à une rareté de base, sous plafond de lieu.
 * @param {object} p
 * @param {string} p.baseRarity rareté de base (∈ RARITY_TIERS, sinon renvoyée telle quelle)
 * @param {number} [p.bumps=0] somme des crans à ajouter (peut être négative → clampée à base)
 * @param {string} [p.locationCapRarity] plafond de rareté du lieu (CRAFT-LOC01)
 * @returns {string} rareté résultante
 */
export function applyRarityBumps({ baseRarity, bumps = 0, locationCapRarity } = {}) {
  const baseIdx = RARITY_TIERS.indexOf(baseRarity)
  if (baseIdx < 0) return baseRarity // rareté inconnue : renvoyée telle quelle
  const capIdx = locationCapRarity ? RARITY_TIERS.indexOf(locationCapRarity) : -1
  // Plafond effectif : le cap du lieu s'il est ≥ base, sinon la borne haute des tiers.
  const upperIdx = capIdx >= baseIdx ? capIdx : RARITY_TIERS.length - 1
  const targetIdx = baseIdx + bumps
  const clamped = Math.max(baseIdx, Math.min(upperIdx, targetIdx))
  return RARITY_TIERS[clamped]
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
// Route désormais par le cœur hybride PARTAGÉ applyRarityBumps (un seul modèle de qualité).
// Le plafond de lieu peut être passé (CRAFT-LOC01) ; absent = aucun plafond.
export function resolveCraftOutcome(baseRarity, tier, extraBump = 0, locationCapRarity) {
  if (tier === 'fail') {
    return { success: false, tier, rarity: null, severity: 'fail', permanentDebuff: false }
  }
  if (tier === 'catastrophe') {
    return { success: false, tier, rarity: null, severity: 'catastrophe', permanentDebuff: true }
  }
  const resolvedTier = tier === 'perfect' || tier === 'good' || tier === 'neutral' ? tier : 'neutral'
  const bumps = tierRarityBump(resolvedTier) + extraBump
  return {
    success: true,
    tier: resolvedTier,
    rarity: applyRarityBumps({ baseRarity, bumps, locationCapRarity }),
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
