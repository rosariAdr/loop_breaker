// v1.42 batch 5 — SOURCE DE VÉRITÉ UNIQUE de TOUTES les recettes de craft du jeu.
//
// Ce fichier a d'abord porté (batch 4) le modèle de découverte (CRAFT-*). Batch 5 y
// UNIFIE les cinq systèmes de recettes qui coexistaient auparavant :
//   1. ALCHEMY_RECIPES     (alchimiste — sortie = consommable)          → data/recipes.js
//   2. MASTER_RECIPES      (maître forgeron — pièce Rare/Epic)          → data/recipes.js
//   3. EQUIPMENT_TEMPLATES[*].craftRecipes (forge par rareté)           → data/equipment.js
//   4. LEATHER_RECIPES     (cordonnier — cuir → templateId)             → data/recipes.js
//   5. COOKING_RECIPES     (cuisine — gibier → consommable)             → data/recipes.js
// Chaque système est désormais UNIFIÉ dans CRAFT_RECIPES / ALL_CRAFT_RECIPES. Batch 6 a
// retiré les compat shims (ALCHEMY/MASTER/LEATHER/COOKING_RECIPES) : tous les consommateurs
// (panneaux de craft, tests) lisent la source unifiée directement (filtre par profession /
// sortie via les accesseurs plus bas). data/recipes.js n'existe plus.
//
// Tickets couverts (§ TASKS.md v1.42) :
//   • CRAFT-KNOWN01 — chaque recette est CONNUE (`known:true`) ou DÉCOUVRABLE (`known:false`).
//   • CRAFT-MULTI01 — une recette cible UN objet (`output`) via PLUSIEURS `combinations[]`.
//   • CRAFT-RARITY01 — chaque COMBINAISON porte sa `rarityTable` ({ rarity: poids }).
//   • CRAFT-UNIFY01 — migration des 5 systèmes ci-dessus dans la forme unifiée.
//
// Forme d'une recette :
//   {
//     id: string,                     // identifiant unique de la recette
//     output: string,                 // templateId d'équipement OU id de consommable produit
//     outputKind: 'equipment'|'consumable', // nature de `output` (pour dériver les shims)
//     profession: 'blacksmith'|'leatherworker'|'jeweler'|'alchemist'|'cook',
//     name?: string,                  // libellé legacy (recettes de bâtiment) — optionnel
//     known: boolean,                 // CRAFT-KNOWN01 (true = débloquée d'entrée)
//     combinations: [                 // CRAFT-MULTI01 (≥1 combinaison valide)
//       {
//         id: string,                 // id unique de la combinaison (tous recipes confondus)
//         ingredients: { resId: qty },
//         gold: number,               // coût en or de cette combinaison
//         rarityTable: { rarity: weight }, // CRAFT-RARITY01 (poids relatifs, somme libre)
//         rarity?: string,            // rareté FIXE d'une combinaison legacy (mono-rareté)
//       },
//     ],
//   }

import { EQUIPMENT_TEMPLATES } from './equipment'

export const CRAFT_PROFESSIONS = ['blacksmith', 'leatherworker', 'jeweler', 'alchemist', 'cook']

export const CRAFT_RECIPES = [
  // ── Bijoutier (BIJOU01) — connu d'entrée : anneau de base ────────────────────
  {
    id: 'craft_iron_band',
    output: 'iron_band',
    outputKind: 'equipment',
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
    outputKind: 'equipment',
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
    outputKind: 'equipment',
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
    outputKind: 'equipment',
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
    outputKind: 'consumable',
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

  // ════════════════════════════════════════════════════════════════════════════
  // CRAFT-UNIFY01 — Recettes migrées depuis les 5 systèmes historiques.
  // Chaque combinaison mono-rareté legacy porte `rarity` (rareté fixe) + une
  // `rarityTable` équivalente ({ <rarity>: 100 }) pour le modèle hybride.
  // ════════════════════════════════════════════════════════════════════════════

  // ── ALCHEMY_RECIPES (data/recipes.js) — alchimiste, sortie = consommable ─────
  {
    id: 'alchemy_hp_potion_small',
    output: 'hp_potion_small',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Small HP Potion',
    known: true,
    combinations: [
      {
        id: 'alchemy_hp_potion_small__briar',
        ingredients: { briar_thorn: 2 },
        gold: 8,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'alchemy_mana_potion_small',
    output: 'mana_potion_small',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Small Mana Potion',
    known: true,
    combinations: [
      {
        id: 'alchemy_mana_potion_small__bat',
        ingredients: { bat_wing: 2 },
        gold: 8,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'alchemy_hp_potion_medium',
    output: 'hp_potion_medium',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Medium HP Potion',
    known: true,
    combinations: [
      {
        id: 'alchemy_hp_potion_medium__briar',
        ingredients: { briar_thorn: 3, wolf_pelt: 1 },
        gold: 18,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'alchemy_stamina_ration',
    output: 'stamina_ration',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Stamina Ration',
    known: true,
    combinations: [
      {
        id: 'alchemy_stamina_ration__wolf',
        ingredients: { wolf_pelt: 2, briar_thorn: 1 },
        gold: 16,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'alchemy_elixir_minor',
    output: 'elixir_minor',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Minor Elixir',
    known: true,
    combinations: [
      {
        id: 'alchemy_elixir_minor__ecto',
        ingredients: { ectoplasm: 2, bat_wing: 2 },
        gold: 30,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'alchemy_antidote_basic',
    output: 'antidote_basic',
    outputKind: 'consumable',
    profession: 'alchemist',
    name: 'Basic Antidote',
    known: true,
    combinations: [
      {
        id: 'alchemy_antidote_basic__plague',
        ingredients: { plague_herb: 2 },
        gold: 12,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },

  // ── MASTER_RECIPES (data/recipes.js) — maître forgeron, pièce Rare/Epic ──────
  {
    id: 'master_serpent_dagger',
    output: 'serpent_dagger',
    outputKind: 'equipment',
    profession: 'blacksmith',
    name: 'Serpent Dagger (Rare)',
    known: true,
    combinations: [
      {
        id: 'master_serpent_dagger__rare',
        ingredients: { serpent_scale: 5, void_fang: 1 },
        gold: 120,
        rarity: 'rare',
        rarityTable: { rare: 100 },
      },
    ],
  },
  {
    id: 'master_cursed_greaves',
    output: 'cursed_greaves',
    outputKind: 'equipment',
    profession: 'blacksmith',
    name: 'Cursed Greaves (Rare)',
    known: true,
    combinations: [
      {
        id: 'master_cursed_greaves__rare',
        ingredients: { grimstone: 4, troll_blood: 2 },
        gold: 130,
        rarity: 'rare',
        rarityTable: { rare: 100 },
      },
    ],
  },
  {
    id: 'master_wraith_crown',
    output: 'wraith_crown',
    outputKind: 'equipment',
    profession: 'blacksmith',
    name: 'Wraith Crown (Epic)',
    known: true,
    combinations: [
      {
        id: 'master_wraith_crown__epic',
        ingredients: { ancient_bone: 4, wraith_essence: 2 },
        gold: 300,
        rarity: 'epic',
        rarityTable: { epic: 100 },
      },
    ],
  },
  {
    id: 'master_bone_plate',
    output: 'bone_plate',
    outputKind: 'equipment',
    profession: 'blacksmith',
    name: 'Bone Plate (Epic)',
    known: true,
    combinations: [
      {
        id: 'master_bone_plate__epic',
        ingredients: { ancient_bone: 4, colossus_marrow: 2 },
        gold: 320,
        rarity: 'epic',
        rarityTable: { epic: 100 },
      },
    ],
  },
  {
    id: 'master_bone_staff',
    output: 'bone_staff',
    outputKind: 'equipment',
    profession: 'blacksmith',
    name: 'Bone Staff (Epic)',
    known: true,
    combinations: [
      {
        id: 'master_bone_staff__epic',
        ingredients: { ancient_bone: 4, wraith_essence: 2, cursed_gem: 1 },
        gold: 350,
        rarity: 'epic',
        rarityTable: { epic: 100 },
      },
    ],
  },

  // ── LEATHER_RECIPES (data/recipes.js) — cordonnier, cuir → templateId ────────
  {
    id: 'leather_hare_armor',
    output: 'leather_armor',
    outputKind: 'equipment',
    profession: 'leatherworker',
    name: 'Leather Armor (Hare & Fox)',
    known: true,
    combinations: [
      {
        id: 'leather_hare_armor__common',
        ingredients: { hare_pelt: 3, fox_pelt: 2 },
        gold: 24,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'leather_swift_boots',
    output: 'swift_boots',
    outputKind: 'equipment',
    profession: 'leatherworker',
    name: 'Swift Boots (Fox-lined)',
    known: true,
    combinations: [
      {
        id: 'leather_swift_boots__common',
        ingredients: { fox_pelt: 2, hare_pelt: 1 },
        gold: 18,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'leather_beast_armor',
    output: 'leather_armor',
    outputKind: 'equipment',
    profession: 'leatherworker',
    name: 'Beast-Hide Armor',
    known: true,
    combinations: [
      {
        id: 'leather_beast_armor__rare',
        ingredients: { beast_hide: 3, boar_hide: 2 },
        gold: 90,
        rarity: 'rare',
        rarityTable: { rare: 100 },
      },
    ],
  },

  // ── COOKING_RECIPES (data/recipes.js) — cuisine, gibier → consommable ────────
  {
    id: 'cook_boar_ration',
    output: 'stamina_ration',
    outputKind: 'consumable',
    profession: 'cook',
    name: 'Roast Boar Ration',
    known: true,
    combinations: [
      {
        id: 'cook_boar_ration__mix',
        ingredients: { boar_tusk: 2, hare_pelt: 1 },
        gold: 10,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
  {
    id: 'cook_game_stew',
    output: 'hp_potion_small',
    outputKind: 'consumable',
    profession: 'cook',
    name: 'Wild Game Stew',
    known: true,
    combinations: [
      {
        id: 'cook_game_stew__mix',
        ingredients: { fox_pelt: 1, hare_pelt: 1 },
        gold: 8,
        rarity: 'common',
        rarityTable: { common: 100 },
      },
    ],
  },
]

// ── EQUIPMENT_TEMPLATES[*].craftRecipes (data/equipment.js) ───────────────────────
// La forge par rareté vit dans les templates (source structurelle profonde : `canCraft`,
// `createEquipmentInstance` → sellPrice, panneau Blacksmith). CRAFT-UNIFY01 la RÉFLÈTE dans
// la source unifiée sous forme de recettes dérivées (une par template forgeable), pour que
// CRAFT_RECIPES reste la vue unique sans dupliquer/écraser la donnée des templates.
// La rareté de chaque combinaison EST la clé de rareté du template (mono-rareté).
function deriveTemplateForgeRecipes() {
  const out = []
  for (const [templateId, tpl] of Object.entries(EQUIPMENT_TEMPLATES)) {
    const byRarity = tpl.craftRecipes ?? {}
    const combinations = []
    for (const [rarity, rec] of Object.entries(byRarity)) {
      if (!rec?.ingredients) continue
      combinations.push({
        id: `forge_${templateId}__${rarity}`,
        ingredients: rec.ingredients,
        gold: rec.gold,
        rarity,
        rarityTable: { [rarity]: 100 },
      })
    }
    if (combinations.length === 0) continue // pièces non craftables (armes d'élite)
    out.push({
      id: `forge_${templateId}`,
      output: templateId,
      outputKind: 'equipment',
      profession: 'blacksmith',
      name: tpl.name,
      known: true,
      combinations,
    })
  }
  return out
}

// Recettes de forge par template, dérivées des EQUIPMENT_TEMPLATES.
export const TEMPLATE_FORGE_RECIPES = deriveTemplateForgeRecipes()

// La source de vérité complète = recettes portées ici + forge par template dérivée.
// (CRAFT_RECIPES reste la liste « éditée à la main » utilisée par la découverte/les tests
// batch 4 ; ALL_CRAFT_RECIPES est la vue exhaustive des 5 systèmes.)
export const ALL_CRAFT_RECIPES = [...CRAFT_RECIPES, ...TEMPLATE_FORGE_RECIPES]

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

// ── Accesseurs par profession / sortie (v1.42 batch 6 — consommateurs sur la source unifiée) ──
// Les panneaux de craft (Alchemy/MasterSmith/…) lisent désormais DIRECTEMENT la source
// unifiée via ces filtres (plus de compat shims). `ALL_CRAFT_RECIPES` = vue exhaustive.

/** Recettes d'une profession donnée (dans la table fournie, défaut = vue exhaustive). */
export function getRecipesByProfession(profession, recipes = ALL_CRAFT_RECIPES) {
  return recipes.filter((r) => r.profession === profession)
}

/**
 * Retrouve, dans une recette, la combinaison portant une rareté FIXE donnée (mono-rareté
 * legacy : `combination.rarity === rarity`). Sert aux panneaux qui craftent à rareté fixe
 * (maître forgeron) ou par palier de rareté (forge par template).
 * @returns {object | undefined} la combinaison, ou undefined si absente.
 */
export function getCombinationByRarity(recipe, rarity) {
  return recipe?.combinations?.find((c) => c.rarity === rarity)
}
