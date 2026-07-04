// v1.42 batch 6 — Tests de la logique PURE du craft.
// La formule MULTIPLICATIVE (CRAFT-G3, craftedRarity/qualityMultiplier) a été RETIRÉE :
// le chemin de qualité unique est HYBRIDE (rollBaseRarity + bumps bornés). On y ajoute le
// point d'entrée RUNTIME resolveHybridCraftOutcome (échec/catastrophe + rareté hybride).
// CRAFT-G2 : découverte — N slots libres ; succès → recette apprise ; échec → perte 50 %.
import { describe, it, expect } from 'vitest'
import {
  rollBaseRarity,
  discoveryLossOnFail,
  attemptDiscovery,
  resolveHybridCraftOutcome,
  CONCENTRATION_MAX,
} from './craftModel'

describe('batch 6 — resolveHybridCraftOutcome (issue de craft runtime)', () => {
  it('raté → pas d’objet, debuff non permanent', () => {
    const o = resolveHybridCraftOutcome({ tier: 'fail', rarityTable: { common: 100 } })
    expect(o).toMatchObject({ success: false, rarity: null, severity: 'fail', permanentDebuff: false })
  })

  it('catastrophe → pas d’objet, debuff permanent', () => {
    const o = resolveHybridCraftOutcome({ tier: 'catastrophe', rarityTable: { common: 100 } })
    expect(o).toMatchObject({
      success: false,
      rarity: null,
      severity: 'catastrophe',
      permanentDebuff: true,
    })
  })

  it('neutre → rareté tirée dans la rarityTable, sans bump', () => {
    const o = resolveHybridCraftOutcome({
      tier: 'neutral',
      rarityTable: { common: 80, rare: 20 },
      rng: () => 0.0,
    })
    expect(o).toMatchObject({ success: true, tier: 'neutral', rarity: 'common' })
  })

  it('palier + Concentration montent la rareté depuis la table, bornés par le plafond', () => {
    // base rare (rng bas), perfect(+2) + conc 150(+1) = +3 → viserait ex ; plafond epic → epic.
    const o = resolveHybridCraftOutcome({
      tier: 'perfect',
      rarityTable: { rare: 100 },
      concentration: 150,
      locationCapRarity: 'epic',
      rng: () => 0.0,
    })
    expect(o).toMatchObject({ success: true, tier: 'perfect', rarity: 'epic' })
  })

  it('baseRarity explicite prime sur la rarityTable', () => {
    const o = resolveHybridCraftOutcome({
      tier: 'neutral',
      baseRarity: 'epic',
      rarityTable: { common: 100 },
    })
    expect(o.rarity).toBe('epic')
  })

  it('CONCENTRATION_MAX = 150', () => {
    expect(CONCENTRATION_MAX).toBe(150)
  })
})

describe('CRAFT-RARITY01 — rollBaseRarity (tirage pondéré, rng injecté)', () => {
  it('table à une seule rareté → toujours cette rareté', () => {
    expect(rollBaseRarity({ common: 100 }, () => 0.99)).toBe('common')
  })
  it('respecte les poids (rng déterministe)', () => {
    const table = { common: 80, rare: 20 }
    expect(rollBaseRarity(table, () => 0.0)).toBe('common') // début de plage
    expect(rollBaseRarity(table, () => 0.9)).toBe('rare') // fin de plage (0.9×100=90 > 80)
  })
  it('ignore les poids ≤ 0', () => {
    expect(rollBaseRarity({ common: 0, rare: 10 }, () => 0.5)).toBe('rare')
  })
  it('table vide → null', () => {
    expect(rollBaseRarity({}, () => 0.5)).toBeNull()
    expect(rollBaseRarity({ common: 0 }, () => 0.5)).toBeNull()
  })
})

describe('CRAFT-G2 — discoveryLossOnFail (perte 50 %, arrondi bas)', () => {
  it('perd la moitié de chaque ingrédient (floor)', () => {
    expect(discoveryLossOnFail({ rusted_iron: 4, wolf_fang: 3 })).toEqual({
      rusted_iron: 2,
      wolf_fang: 1, // floor(1.5)
    })
  })
  it('1 unité → perte 0 (floor(0.5))', () => {
    expect(discoveryLossOnFail({ rusted_iron: 1 })).toEqual({ rusted_iron: 0 })
  })
})

describe('CRAFT-G2 — attemptDiscovery', () => {
  // craft_hunters_grips (known:false) a une combinaison { hare_pelt:3, wolf_fang:2 }.
  const goodMix = { hare_pelt: 3, wolf_fang: 2 }

  it('assemblage vide → reason empty, rien de perdu', () => {
    const r = attemptDiscovery({ ingredients: {}, freeSlots: 4 })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('empty')
    expect(r.lost).toEqual({})
  })

  it('trop de types d’ingrédients pour les slots → invalide, rien de perdu', () => {
    const r = attemptDiscovery({ ingredients: goodMix, freeSlots: 1 })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('too_many_ingredients')
    expect(r.lost).toEqual({})
  })

  it('correspondance découvrable + succès du jet → recette apprise, aucun ingrédient perdu', () => {
    const r = attemptDiscovery({ ingredients: goodMix, freeSlots: 4, rng: () => 0.0, successChance: 1 })
    expect(r.success).toBe(true)
    expect(r.reason).toBe('learned')
    expect(r.learnedRecipeId).toBe('craft_hunters_grips')
    expect(r.output).toBe('hunters_grips')
    expect(r.lost).toEqual({})
  })

  it('correspondance mais jet raté → échec + perte 50 %', () => {
    const r = attemptDiscovery({
      ingredients: goodMix,
      freeSlots: 4,
      rng: () => 0.99,
      successChance: 0.5,
    })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('roll_failed')
    expect(r.lost).toEqual({ hare_pelt: 1, wolf_fang: 1 })
  })

  it('mélange sans correspondance → échec no_match + perte 50 %', () => {
    const r = attemptDiscovery({ ingredients: { rusted_iron: 4 }, freeSlots: 4 })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('no_match')
    expect(r.lost).toEqual({ rusted_iron: 2 })
  })

  it('une recette connue d’entrée (known:true) n’est pas redécouvrable → no_match', () => {
    // craft_leather_gloves est known:true, combinaison { wolf_pelt:2, hare_pelt:2 }.
    const r = attemptDiscovery({ ingredients: { wolf_pelt: 2, hare_pelt: 2 }, freeSlots: 4 })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('no_match')
  })

  it('une recette déjà apprise par le héros n’est pas redécouverte → no_match', () => {
    const r = attemptDiscovery({
      ingredients: goodMix,
      freeSlots: 4,
      knownRecipeIds: ['craft_hunters_grips'],
      rng: () => 0.0,
    })
    expect(r.success).toBe(false)
    expect(r.reason).toBe('no_match')
  })

  it('fonction pure : ne mute pas l’objet ingredients', () => {
    const mix = { ...goodMix }
    attemptDiscovery({ ingredients: mix, freeSlots: 4, rng: () => 0.99 })
    expect(mix).toEqual(goodMix)
  })
})
