// Z04 / Z06 / DROP-FIX01 — Recettes d'artisanat (COMPAT SHIM, v1.42 batch 5).
//
// CRAFT-UNIFY01 — Ce fichier ne porte PLUS la donnée des recettes : la SOURCE DE VÉRITÉ
// unique est désormais data/craftRecipes.js. Les quatre exports historiques
// (ALCHEMY_RECIPES / MASTER_RECIPES / LEATHER_RECIPES / COOKING_RECIPES) sont réexportés
// tels quels depuis la source unifiée, où ils sont DÉRIVÉS des recettes `CRAFT_RECIPES`.
//
// Les consommateurs actuels (screens/SafeZone.jsx, store, tests) continuent d'importer
// depuis `../data/recipes` sans modification. Le rewire de ces imports vers craftRecipes.js
// puis le retrait de ce shim sont prévus en batch 6.
//
//   ALCHEMY_RECIPES  : 6 potions craftables chez l'alchimiste (sortie = consommable).
//   MASTER_RECIPES   : 5 pièces Rare/Epic craftables chez le maître forgeron.
//   LEATHER_RECIPES  : atelier de cuir (pelts → armures/bottes). Sortie = templateId.
//   COOKING_RECIPES  : cuisine (gibier → rations). Sortie = consommable.

export {
  ALCHEMY_RECIPES,
  MASTER_RECIPES,
  LEATHER_RECIPES,
  COOKING_RECIPES,
} from './craftRecipes'
