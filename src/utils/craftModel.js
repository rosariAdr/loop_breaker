// v1.42 batch 5 — Logique PURE du craft : modèle de qualité HYBRIDE + découverte (CRAFT-G2).
// Aucune UI, aucun mini-jeu, aucun accès au store : fonctions déterministes et testables.
//
// MODÈLE DE QUALITÉ HYBRIDE (décision v1.42 batch 5) — un SEUL chemin de qualité :
//   1. rareté de BASE = tirage dans la `rarityTable` de la combinaison (CRAFT-RARITY01,
//      rollBaseRarity) ;
//   2. BUMPS BORNÉS ±1 : la Concentration (chance = concentration/150, STA03) et le bonus
//      d'outil ajoutent chacun AU PLUS +1 cran ; le palier du mini-jeu ajoute ses crans ;
//   3. clamp : jamais sous la base, jamais au-dessus du plafond du lieu (CRAFT-LOC01).
// Ce modèle remplace l'ancienne formule MULTIPLICATIVE (CRAFT-G3, `craftedRarity` plus bas,
// conservée pour compat/tests mais NON utilisée comme chemin de qualité). Le cœur de bump
// est PARTAGÉ avec utils/crafting.js (applyRarityBumps) → resolveCraftOutcome (STA03) et
// resolveCraftedRarity (hybride) convergent sur la même implémentation.
//
// CRAFT-G2 (§ TASKS.md v1.42) — mécanique de découverte :
//   N slots libres pour assembler des ingrédients ; en cas de SUCCÈS la recette est apprise ;
//   en cas d'ÉCHEC on PERD 50 % des ingrédients engagés (arrondi bas, par type).

import { RARITY_TIERS } from '../data/equipment'
import { findRecipeByIngredients } from '../data/craftRecipes'
import { applyRarityBumps, tierRarityBump, rollConcentrationBump } from './crafting'

export const CONCENTRATION_MAX = 150

// ── Modèle de qualité HYBRIDE (chemin de qualité UNIQUE) ──────────────────────────

/**
 * Bump borné (0 ou 1) conféré par un outil de craft (CRAFT-TOOL01, câblage batch 6).
 * Tout outil qui améliore la qualité vaut AU PLUS +1 cran (borné) ; toolBonus ≤ 1 = aucun.
 * @param {number} toolBonus multiplicateur/indice d'outil (défaut 1 = aucun outil)
 * @returns {0|1}
 */
export function toolRarityBump(toolBonus = 1) {
  return (toolBonus ?? 1) > 1 ? 1 : 0
}

/**
 * CHEMIN DE QUALITÉ HYBRIDE UNIQUE — résout la rareté craftée d'une combinaison.
 *
 * base = rollBaseRarity(rarityTable) [ou baseRarity direct si fourni],
 * puis bumps BORNÉS : palier mini-jeu (tierRarityBump) + Concentration (±1, rollConcentrationBump)
 * + outil (±1, toolRarityBump), le tout clampé par applyRarityBumps (jamais sous la base,
 * jamais au-dessus du plafond du lieu).
 *
 * @param {object} p
 * @param {Record<string,number>} [p.rarityTable] table de rareté de la combinaison (CRAFT-RARITY01)
 * @param {string} [p.baseRarity] rareté de base explicite (prioritaire sur rarityTable si fournie)
 * @param {string} [p.tier] palier du mini-jeu ('perfect'|'good'|'neutral'|…) — défaut aucun bump
 * @param {number} [p.concentration=0] Concentration du héros (0..150) → chance d'un bump ±1
 * @param {number} [p.toolBonus=1] indice d'outil → bump borné ±1
 * @param {string} [p.locationCapRarity] plafond de rareté du lieu (CRAFT-LOC01)
 * @param {() => number} [p.rng=Math.random] RNG injecté (roll de base + bump Concentration)
 * @returns {string|null} rareté craftée, ou null si aucune base tirable
 */
export function resolveCraftedRarity({
  rarityTable,
  baseRarity,
  tier,
  concentration = 0,
  toolBonus = 1,
  locationCapRarity,
  rng = Math.random,
} = {}) {
  const base = baseRarity ?? rollBaseRarity(rarityTable, rng)
  if (base == null) return null
  const bumps =
    tierRarityBump(tier) + rollConcentrationBump(concentration, rng) + toolRarityBump(toolBonus)
  return applyRarityBumps({ baseRarity: base, bumps, locationCapRarity })
}

// ── CRAFT-G3 (LEGACY, non utilisé comme chemin de qualité) — formule multiplicative ──
// Conservée pour compat & tests batch 4. Le chemin de qualité RÉEL est resolveCraftedRarity.

/**
 * Multiplicateur de qualité issu de la Concentration et du bonus d'outil.
 *   mult = (1 + Concentration/150) × toolBonus
 * @param {number} concentration 0..150 (clampé)
 * @param {number} toolBonus multiplicateur d'outil (défaut 1 = aucun outil)
 * @returns {number} multiplicateur ≥ 0
 */
export function qualityMultiplier(concentration = 0, toolBonus = 1) {
  const conc = Math.min(CONCENTRATION_MAX, Math.max(0, concentration ?? 0))
  const tool = Math.max(0, toolBonus ?? 1)
  return (1 + conc / CONCENTRATION_MAX) * tool
}

/** Rang 1-based d'une rareté (common=1 … exx=7). 0 si rareté inconnue. */
function rarityRank(rarity) {
  const i = RARITY_TIERS.indexOf(rarity)
  return i < 0 ? 0 : i + 1
}
/** Rareté correspondant à un rang 1-based (clampé aux bornes de RARITY_TIERS). */
function rarityFromRank(rank) {
  const clamped = Math.max(1, Math.min(RARITY_TIERS.length, rank))
  return RARITY_TIERS[clamped - 1]
}

/**
 * @deprecated CRAFT-G3 (LEGACY) — formule MULTIPLICATIVE de rareté. N'est PLUS le chemin de
 * qualité du jeu (remplacée par le modèle hybride resolveCraftedRarity). Conservée pour ne
 * pas casser les tests batch 4 ; à retirer une fois ces tests migrés (batch 6).
 *
 * Rareté craftée pondérée par la qualité, bornée par le plafond du lieu.
 * On travaille sur le RANG 1-based de la rareté (common=1) pour que le multiplicateur
 * ait un sens même sur du common (base × mult), puis on arrondit et on clampe :
 *   rankOut = floor( rankBase × (1 + Concentration/150) × toolBonus )
 * borné à [rankBase, rangDuPlafond] — la qualité ne fait jamais REDESCENDRE sous la base,
 * et ne dépasse jamais le plafond de rareté du lieu (locationCapRarity).
 *
 * @param {object} p
 * @param {string} p.baseRarity  rareté de base de la combinaison (ex. 'common')
 * @param {number} [p.concentration=0] Concentration du héros (0..150)
 * @param {number} [p.toolBonus=1] multiplicateur d'outil (CRAFT-TOOL01, batch 5)
 * @param {string} [p.locationCapRarity] plafond de rareté du lieu (CRAFT-LOC01). Absent =
 *                 borne haute de RARITY_TIERS (aucun plafond).
 * @returns {string} rareté résultante ∈ RARITY_TIERS
 */
export function craftedRarity({
  baseRarity,
  concentration = 0,
  toolBonus = 1,
  locationCapRarity,
} = {}) {
  const baseRank = rarityRank(baseRarity)
  if (baseRank === 0) return baseRarity // rareté inconnue : renvoyée telle quelle
  const capRank = locationCapRarity ? rarityRank(locationCapRarity) : RARITY_TIERS.length
  const scaled = Math.floor(baseRank * qualityMultiplier(concentration, toolBonus))
  // Jamais sous la base, jamais au-dessus du plafond du lieu (lui-même ≥ base ? sinon la
  // base l'emporte pour ne pas produire une rareté négative — cap incohérent = borne base).
  const upper = Math.max(baseRank, capRank || RARITY_TIERS.length)
  const rankOut = Math.max(baseRank, Math.min(upper, scaled))
  return rarityFromRank(rankOut)
}

/**
 * CRAFT-RARITY01 — tire une rareté de base dans une table de poids { rarity: weight }.
 * Fonction pure via rng injecté (défaut Math.random). Poids ≤0 ignorés.
 * @param {Record<string,number>} rarityTable
 * @param {() => number} [rng]
 * @returns {string|null} rareté tirée, ou null si table vide.
 */
export function rollBaseRarity(rarityTable, rng = Math.random) {
  const entries = Object.entries(rarityTable ?? {}).filter(([, w]) => w > 0)
  if (entries.length === 0) return null
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = rng() * total
  for (const [rarity, w] of entries) {
    roll -= w
    if (roll < 0) return rarity
  }
  return entries[entries.length - 1][0] // garde-fou d'arrondi
}

// ── CRAFT-G2 — mécanique de découverte ───────────────────────────────────────────

/**
 * Perte à l'échec d'une découverte : 50 % de chaque ingrédient engagé (arrondi BAS).
 * @param {Record<string,number>} ingredients
 * @returns {Record<string,number>} quantité PERDUE par ingrédient (≥0).
 */
export function discoveryLossOnFail(ingredients) {
  const lost = {}
  for (const [id, qty] of Object.entries(ingredients ?? {})) {
    lost[id] = Math.floor((qty ?? 0) * 0.5)
  }
  return lost
}

/**
 * CRAFT-G2 — résout une tentative de découverte (assemblage libre d'ingrédients).
 *
 * Règles :
 *  - `freeSlots` borne le nombre de TYPES d'ingrédients assemblables (N slots libres).
 *    Dépasser ce nombre => tentative invalide (rien n'est consommé/perdu).
 *  - Les ingrédients assemblés sont comparés aux combinaisons DÉCOUVRABLES du jeu
 *    (recette `known:false` non encore apprise) via findRecipeByIngredients.
 *    • Correspondance + succès du jet (rng < successChance) => recette APPRISE
 *      (learnedRecipeId), objet produit, aucun ingrédient perdu.
 *    • Correspondance mais jet raté => ÉCHEC : perte de 50 % des ingrédients.
 *    • Aucune correspondance => ÉCHEC (assemblage sans issue) : perte de 50 %.
 *  - Une recette déjà connue (dans `knownRecipeIds`) n'est PAS « redécouverte » : la
 *    correspondance est ignorée et l'assemblage échoue comme un mélange inconnu.
 *
 * Fonction pure : ne mute rien, ne touche pas au store. Le caller applique le résultat
 * (retirer `lost`, ajouter l'objet, marquer la recette apprise).
 *
 * @param {object} p
 * @param {Record<string,number>} p.ingredients ingrédients assemblés { resId: qty }
 * @param {number} p.freeSlots nombre de slots d'assemblage disponibles (types max)
 * @param {string[]} [p.knownRecipeIds=[]] ids de recettes déjà connues du héros
 * @param {number} [p.successChance=1] proba de succès si l'assemblage correspond (0..1)
 * @param {() => number} [p.rng=Math.random]
 * @param {Array} [p.recipes] table de recettes (défaut = CRAFT_RECIPES via findRecipeByIngredients)
 * @returns {{
 *   success: boolean,
 *   reason: 'learned'|'roll_failed'|'no_match'|'too_many_ingredients'|'empty',
 *   learnedRecipeId: string|null,
 *   output: string|null,
 *   lost: Record<string,number>,   // ingrédients perdus (vide si succès ou tentative invalide)
 * }}
 */
export function attemptDiscovery({
  ingredients,
  freeSlots,
  knownRecipeIds = [],
  successChance = 1,
  rng = Math.random,
  recipes,
} = {}) {
  const entries = Object.entries(ingredients ?? {}).filter(([, q]) => q > 0)
  const empty = { success: false, learnedRecipeId: null, output: null, lost: {} }

  if (entries.length === 0) return { ...empty, reason: 'empty' }
  // N slots libres : trop de types d'ingrédients → tentative invalide (rien de perdu).
  if (entries.length > freeSlots) return { ...empty, reason: 'too_many_ingredients' }

  const clean = Object.fromEntries(entries)
  const match = findRecipeByIngredients(clean, recipes)
  const known = new Set(knownRecipeIds)

  // Pas de correspondance, ou recette déjà connue (pas de redécouverte) → échec + perte 50 %.
  if (!match || match.recipe.known || known.has(match.recipe.id)) {
    return {
      success: false,
      reason: 'no_match',
      learnedRecipeId: null,
      output: null,
      lost: discoveryLossOnFail(clean),
    }
  }

  // Correspondance sur une recette découvrable : jet de succès.
  if (rng() < successChance) {
    return {
      success: true,
      reason: 'learned',
      learnedRecipeId: match.recipe.id,
      output: match.recipe.output,
      lost: {},
    }
  }
  // Jet raté : perte de 50 % des ingrédients.
  return {
    success: false,
    reason: 'roll_failed',
    learnedRecipeId: null,
    output: null,
    lost: discoveryLossOnFail(clean),
  }
}
