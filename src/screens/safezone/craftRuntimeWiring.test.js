// v1.42 batch 6 — Câblage RUNTIME du chemin de qualité HYBRIDE dans les panneaux de craft.
//
// Prouve que la donnée que les panneaux (Blacksmith/MasterSmith) lisent dans la source
// unifiée alimente correctement resolveHybridCraftOutcome : la rareté craftée provient de la
// `rarityTable` de la combinaison choisie (CRAFT-RARITY01), plus le palier du mini-jeu et la
// Concentration (STA03), au lieu d'une rareté de base FIXE. Les échecs (raté/catastrophe) ne
// produisent aucun objet et portent la sévérité de debuff attendue.
import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_FORGE_RECIPES,
  getRecipeById,
  getCombinationByRarity,
  getRecipesByProfession,
} from '../../data/craftRecipes'
import { resolveHybridCraftOutcome } from '../../utils/craftModel'
import { EQUIPMENT_TEMPLATES, createEquipmentInstance } from '../../data/equipment'

// Reproduit le lookup exact du BlacksmithPanel : forge_<templateId> → combinaison de rareté.
function blacksmithCombination(templateId, rarity) {
  const forge = getRecipeById(`forge_${templateId}`, TEMPLATE_FORGE_RECIPES)
  return getCombinationByRarity(forge, rarity)
}

// Reproduit la source du MasterSmithPanel : recettes `master_*` (profession blacksmith).
const MASTER_RECIPES = getRecipesByProfession('blacksmith').filter((r) => r.id.startsWith('master_'))

describe('BlacksmithPanel — rareté depuis la rarityTable de la combinaison forge_<template>', () => {
  it('chaque rareté craftable d’un template expose une combinaison forge avec rarityTable', () => {
    for (const [tid, tpl] of Object.entries(EQUIPMENT_TEMPLATES)) {
      for (const rarity of Object.keys(tpl.craftRecipes ?? {})) {
        const combo = blacksmithCombination(tid, rarity)
        expect(combo, `${tid}.${rarity} combinaison forge absente`).toBeDefined()
        // Mono-rareté legacy : la table reflète exactement la rareté sélectionnée.
        expect(combo.rarityTable, `${tid}.${rarity} rarityTable`).toEqual({ [rarity]: 100 })
      }
    }
  })

  it('palier neutre + concentration 0 → rareté = rareté sélectionnée (pas de bump)', () => {
    const combo = blacksmithCombination('iron_sword', 'rare')
    const outcome = resolveHybridCraftOutcome({
      tier: 'neutral',
      rarityTable: combo.rarityTable,
      baseRarity: 'rare',
      concentration: 0,
      rng: () => 0.0,
    })
    expect(outcome).toMatchObject({ success: true, rarity: 'rare' })
    // L'objet produit est bien instanciable à cette rareté.
    expect(createEquipmentInstance('iron_sword', outcome.rarity).rarity).toBe('rare')
  })

  it('parfait + concentration 150 montent la rareté au-dessus de la sélection', () => {
    const combo = blacksmithCombination('iron_sword', 'common')
    const outcome = resolveHybridCraftOutcome({
      tier: 'perfect', // +2
      rarityTable: combo.rarityTable,
      baseRarity: 'common',
      concentration: 150, // +1 garanti
      rng: () => 0.0,
    })
    // common +3 → legendary (aucun plafond de lieu câblé pour l'instant).
    expect(outcome).toMatchObject({ success: true, rarity: 'legendary' })
  })

  it('raté/catastrophe → aucun objet, sévérité de debuff correcte', () => {
    const combo = blacksmithCombination('iron_sword', 'common')
    const fail = resolveHybridCraftOutcome({ tier: 'fail', rarityTable: combo.rarityTable })
    expect(fail).toMatchObject({ success: false, rarity: null, permanentDebuff: false })
    const cata = resolveHybridCraftOutcome({ tier: 'catastrophe', rarityTable: combo.rarityTable })
    expect(cata).toMatchObject({ success: false, rarity: null, permanentDebuff: true })
  })
})

describe('MasterSmithPanel — rareté depuis la rarityTable de la combinaison master_*', () => {
  it('les 5 recettes maître ciblent un template existant et une combinaison Rare/Epic', () => {
    expect(MASTER_RECIPES).toHaveLength(5)
    for (const r of MASTER_RECIPES) {
      expect(EQUIPMENT_TEMPLATES[r.output], `template ${r.output}`).toBeDefined()
      const combo = r.combinations[0]
      expect(['rare', 'epic']).toContain(combo.rarity)
      expect(combo.rarityTable).toEqual({ [combo.rarity]: 100 })
    }
  })

  it('palier neutre → rareté fixe de la recette ; parfait → +2 crans', () => {
    const r = MASTER_RECIPES.find((x) => x.id === 'master_serpent_dagger') // rare
    const combo = r.combinations[0]
    const neutral = resolveHybridCraftOutcome({
      tier: 'neutral',
      rarityTable: combo.rarityTable,
      baseRarity: combo.rarity,
      rng: () => 0.0,
    })
    expect(neutral.rarity).toBe('rare')
    const perfect = resolveHybridCraftOutcome({
      tier: 'perfect', // +2
      rarityTable: combo.rarityTable,
      baseRarity: combo.rarity,
      concentration: 0,
      rng: () => 0.0,
    })
    // RARITY_TIERS = [common, rare, epic, legendary, …] → rare(idx1) +2 = legendary(idx3).
    expect(perfect.rarity).toBe('legendary')
    expect(createEquipmentInstance(r.output, perfect.rarity).rarity).toBe('legendary')
  })
})
