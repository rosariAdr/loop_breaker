// Z04 / Z06 — Recettes d'artisanat
// ALCHEMY_RECIPES : 6 potions craftables chez l'alchimiste (sortie = consommable).
// MASTER_RECIPES  : 5 pièces Rare/Epic craftables chez le maître forgeron.

// Chaque recette d'alchimie produit un consommable (output) depuis des ingrédients.
export const ALCHEMY_RECIPES = [
  {
    id: 'hp_potion_small',
    output: 'hp_potion_small',
    name: 'Small HP Potion',
    ingredients: { briar_thorn: 2 },
    gold: 8,
  },
  {
    id: 'mana_potion_small',
    output: 'mana_potion_small',
    name: 'Small Mana Potion',
    ingredients: { bat_wing: 2 },
    gold: 8,
  },
  {
    id: 'hp_potion_medium',
    output: 'hp_potion_medium',
    name: 'Medium HP Potion',
    ingredients: { briar_thorn: 3, wolf_pelt: 1 },
    gold: 18,
  },
  {
    id: 'stamina_ration',
    output: 'stamina_ration',
    name: 'Stamina Ration',
    ingredients: { wolf_pelt: 2, briar_thorn: 1 },
    gold: 16,
  },
  {
    id: 'elixir_minor',
    output: 'elixir_minor',
    name: 'Minor Elixir',
    ingredients: { ectoplasm: 2, bat_wing: 2 },
    gold: 30,
  },
  {
    id: 'antidote_basic',
    output: 'antidote_basic',
    name: 'Basic Antidote',
    ingredients: { plague_herb: 2 },
    gold: 12,
  },
]

// Recettes du maître forgeron : pièces de haute rareté (le mini-jeu peut encore
// améliorer la rareté via CRF04).
export const MASTER_RECIPES = [
  {
    id: 'master_serpent_dagger',
    templateId: 'serpent_dagger',
    rarity: 'rare',
    name: 'Serpent Dagger (Rare)',
    ingredients: { serpent_scale: 5, void_fang: 1 },
    gold: 120,
  },
  {
    id: 'master_cursed_greaves',
    templateId: 'cursed_greaves',
    rarity: 'rare',
    name: 'Cursed Greaves (Rare)',
    ingredients: { grimstone: 4, troll_blood: 2 },
    gold: 130,
  },
  {
    id: 'master_wraith_crown',
    templateId: 'wraith_crown',
    rarity: 'epic',
    name: 'Wraith Crown (Epic)',
    ingredients: { ancient_bone: 4, wraith_essence: 2 },
    gold: 300,
  },
  {
    id: 'master_bone_plate',
    templateId: 'bone_plate',
    rarity: 'epic',
    name: 'Bone Plate (Epic)',
    ingredients: { ancient_bone: 4, colossus_marrow: 2 },
    gold: 320,
  },
  {
    id: 'master_bone_staff',
    templateId: 'bone_staff',
    rarity: 'epic',
    name: 'Bone Staff (Epic)',
    ingredients: { ancient_bone: 4, wraith_essence: 2, cursed_gem: 1 },
    gold: 350,
  },
]
