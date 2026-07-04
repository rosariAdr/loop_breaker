// v1.42 batch 4 — Modèle de données du craft (couche DATA, sans UI ni mini-jeu).
//
// Regroupe trois tickets décidés dans TASKS.md (§ v1.42) :
//   • CRAFT-KNOWN01 — chaque recette est soit CONNUE (`known:true`, débloquée d'entrée par
//     grade/livre), soit DÉCOUVRABLE (`known:false`, apprise en assemblant librement — CRAFT-G2).
//   • CRAFT-MULTI01 — une recette cible UN objet (`output`) atteignable par PLUSIEURS
//     combinaisons d'ingrédients (`combinations[]`). Chaque combinaison est une entrée
//     autonome (ingrédients + coût or + table de rareté).
//   • CRAFT-RARITY01 — chaque COMBINAISON porte sa propre table de qualité (`rarityTable` :
//     { rarity: poids }). Deux combinaisons du même objet peuvent viser des raretés
//     différentes (recette « pauvre » vs recette « noble »).
//
// Ce fichier est la SOURCE DE VÉRITÉ des recettes du nouveau système. Il ne remplace pas
// EQUIPMENT_TEMPLATES.craftRecipes (forge par rareté, historique) ni MASTER/LEATHER/ALCHEMY
// (recettes de bâtiment existantes) — il les complète pour le craft de découverte (CRAFT-G2)
// et la pondération de qualité (CRAFT-G3, cf. utils/craftModel.js). Le câblage aux bâtiments
// de métier (forge/cordonnier/bijoutier/cuisine) et aux mini-jeux arrive en batch 5.
//
// Forme d'une recette :
//   {
//     id: string,                     // identifiant unique de la recette
//     output: string,                 // templateId d'équipement OU id de consommable produit
//     profession: 'blacksmith'|'leatherworker'|'jeweler'|'alchemist'|'cook',
//     known: boolean,                 // CRAFT-KNOWN01 (true = débloquée d'entrée)
//     combinations: [                 // CRAFT-MULTI01 (≥1 combinaison valide)
//       {
//         id: string,                 // id unique de la combinaison (dans la recette)
//         ingredients: { resId: qty },
//         gold: number,               // coût en or de cette combinaison
//         rarityTable: { rarity: weight }, // CRAFT-RARITY01 (poids relatifs, somme libre)
//       },
//     ],
//   }

export const CRAFT_PROFESSIONS = ['blacksmith', 'leatherworker', 'jeweler', 'alchemist', 'cook']

export const CRAFT_RECIPES = [
  // ── Bijoutier (BIJOU01) — connu d'entrée : anneau de base ────────────────────
  {
    id: 'craft_iron_band',
    output: 'iron_band',
    profession: 'jeweler',
    known: true, // recette de base, débloquée d'entrée
    combinations: [
      // Combinaison « pauvre » : métal brut → surtout common, un peu de rare.
      {
        id: 'iron_band__scrap',
        ingredients: { rusted_iron: 3, wolf_fang: 1 },
        gold: 24,
        rarityTable: { common: 80, rare: 20 },
      },
      // Combinaison « noble » : acier maudit → vise le rare/epic (CRAFT-MULTI01/RARITY01).
      {
        id: 'iron_band__cursed',
        ingredients: { cursed_steel: 2, warlord_crest: 1 },
        gold: 100,
        rarityTable: { rare: 70, epic: 30 },
      },
    ],
  },

  // ── Bijoutier — DÉCOUVRABLE : amulette porte-bonheur ─────────────────────────
  {
    id: 'craft_band_of_fortune',
    output: 'band_of_fortune',
    profession: 'jeweler',
    known: false, // à découvrir via CRAFT-G2 (assemblage libre)
    combinations: [
      {
        id: 'band_of_fortune__lucky',
        ingredients: { stone_shard: 3, wolf_fang: 2 },
        gold: 22,
        rarityTable: { common: 70, rare: 30 },
      },
      {
        id: 'band_of_fortune__verdant',
        ingredients: { grimstone: 3, verdant_ichor: 1 },
        gold: 96,
        rarityTable: { rare: 60, epic: 40 },
      },
    ],
  },

  // ── Cordonnier (LEAT01) — connu d'entrée : gants de cuir ─────────────────────
  {
    id: 'craft_leather_gloves',
    output: 'leather_gloves',
    profession: 'leatherworker',
    known: true,
    combinations: [
      {
        id: 'leather_gloves__pelts',
        ingredients: { wolf_pelt: 2, hare_pelt: 2 },
        gold: 22,
        rarityTable: { common: 85, rare: 15 },
      },
      {
        id: 'leather_gloves__beast',
        ingredients: { beast_hide: 3, wyvern_scale: 2 },
        gold: 90,
        rarityTable: { rare: 50, epic: 50 },
      },
    ],
  },

  // ── Cordonnier — DÉCOUVRABLE : gants de chasseur ─────────────────────────────
  {
    id: 'craft_hunters_grips',
    output: 'hunters_grips',
    profession: 'leatherworker',
    known: false,
    combinations: [
      {
        id: 'hunters_grips__hare',
        ingredients: { hare_pelt: 3, wolf_fang: 2 },
        gold: 20,
        rarityTable: { common: 75, rare: 25 },
      },
      {
        id: 'hunters_grips__warpaint',
        ingredients: { boar_hide: 2, serpent_scale: 3, goblin_warpaint: 1 },
        gold: 82,
        rarityTable: { rare: 65, epic: 35 },
      },
    ],
  },

  // ── Alchimiste — connu d'entrée : potion de soin (recette multi) ─────────────
  {
    id: 'craft_hp_potion_small',
    output: 'hp_potion_small',
    profession: 'alchemist',
    known: true,
    combinations: [
      {
        id: 'hp_potion_small__briar',
        ingredients: { briar_thorn: 2 },
        gold: 8,
        rarityTable: { common: 100 },
      },
      {
        id: 'hp_potion_small__stew',
        ingredients: { fox_pelt: 1, hare_pelt: 1 },
        gold: 8,
        rarityTable: { common: 100 },
      },
    ],
  },
]

// ── Accesseurs (CRAFT-KNOWN01 / CRAFT-MULTI01) ───────────────────────────────────

/** Recettes connues (débloquées d'entrée). */
export function getKnownRecipes(recipes = CRAFT_RECIPES) {
  return recipes.filter((r) => r.known)
}

/** Recettes à découvrir (assemblage libre, CRAFT-G2). */
export function getDiscoverableRecipes(recipes = CRAFT_RECIPES) {
  return recipes.filter((r) => !r.known)
}

/** Recette par id (ou undefined). */
export function getRecipeById(id, recipes = CRAFT_RECIPES) {
  return recipes.find((r) => r.id === id)
}

/**
 * CRAFT-MULTI01 — retrouve la recette + la combinaison dont les ingrédients correspondent
 * EXACTEMENT à `ingredients` (mêmes clés, mêmes quantités). Sert au craft de découverte
 * (l'assemblage libre du joueur est comparé aux combinaisons connues du jeu).
 * @param {Record<string,number>} ingredients
 * @returns {{ recipe, combination } | null}
 */
export function findRecipeByIngredients(ingredients, recipes = CRAFT_RECIPES) {
  const norm = (obj) =>
    Object.entries(obj)
      .filter(([, q]) => q > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
  const target = norm(ingredients ?? {})
  if (!target) return null
  for (const recipe of recipes) {
    for (const combination of recipe.combinations) {
      if (norm(combination.ingredients) === target) return { recipe, combination }
    }
  }
  return null
}

/** Toutes les combinaisons d'une recette qui produisent son `output`. */
export function getCombinations(recipeId, recipes = CRAFT_RECIPES) {
  return getRecipeById(recipeId, recipes)?.combinations ?? []
}
