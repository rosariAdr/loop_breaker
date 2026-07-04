// v1.42 batch 4 — Tests de la logique PURE du craft.
// CRAFT-G3 : rareté = base × (1 + Concentration/150) × toolBonus, bornée par le plafond du lieu.
// CRAFT-G2 : découverte — N slots libres ; succès → recette apprise ; échec → perte 50 %.
import { describe, it, expect } from 'vitest'
import {
  qualityMultiplier,
  craftedRarity,
  rollBaseRarity,
  discoveryLossOnFail,
  attemptDiscovery,
  CONCENTRATION_MAX,
} from './craftModel'
import { RARITY_TIERS } from '../data/equipment'

describe('CRAFT-G3 — qualityMultiplier', () => {
  it('sans concentration ni outil → 1', () => {
    expect(qualityMultiplier(0, 1)).toBe(1)
  })
  it('Concentration 150 → ×2 (1 + 150/150)', () => {
    expect(qualityMultiplier(150, 1)).toBe(2)
  })
  it('Concentration 75 → ×1.5', () => {
    expect(qualityMultiplier(75, 1)).toBeCloseTo(1.5)
  })
  it('le bonus d’outil multiplie', () => {
    expect(qualityMultiplier(150, 1.25)).toBeCloseTo(2.5)
  })
  it('clampe la Concentration à [0, 150]', () => {
    expect(qualityMultiplier(-50, 1)).toBe(1)
    expect(qualityMultiplier(999, 1)).toBe(2)
  })
})

describe('CRAFT-G3 — craftedRarity (formule bornée par le plafond du lieu)', () => {
  it('base seule (mult 1) → rareté inchangée', () => {
    expect(craftedRarity({ baseRarity: 'common' })).toBe('common')
    expect(craftedRarity({ baseRarity: 'rare' })).toBe('rare')
  })

  it('Concentration max double le RANG : common(1) → rare(2)', () => {
    // floor(1 × 2) = 2 → RARITY_TIERS[1] = 'rare'
    expect(craftedRarity({ baseRarity: 'common', concentration: 150 })).toBe('rare')
  })

  it('rare(2) × 2 → epic(4) sans plafond', () => {
    // floor(2 × 2) = 4 → RARITY_TIERS[3] = 'legendary'
    expect(craftedRarity({ baseRarity: 'rare', concentration: 150 })).toBe('legendary')
  })

  it('le plafond du lieu borne la rareté (locationCapRarity)', () => {
    // common × 2 viserait 'rare', mais plafond 'common' → reste 'common'.
    expect(
      craftedRarity({ baseRarity: 'common', concentration: 150, locationCapRarity: 'common' }),
    ).toBe('common')
    // rare × 2 viserait 'legendary', plafond 'epic' → clampé à 'epic'.
    expect(
      craftedRarity({ baseRarity: 'rare', concentration: 150, locationCapRarity: 'epic' }),
    ).toBe('epic')
  })

  it('le bonus d’outil pousse la rareté plus haut', () => {
    // common(1) × (1+150/150) × 2 = 4 → 'legendary' (sans plafond).
    expect(craftedRarity({ baseRarity: 'common', concentration: 150, toolBonus: 2 })).toBe(
      'legendary',
    )
  })

  it('ne descend jamais sous la base même avec un plafond incohérent (< base)', () => {
    // base 'epic', plafond 'common' (incohérent) → la base l’emporte.
    expect(craftedRarity({ baseRarity: 'epic', locationCapRarity: 'common' })).toBe('epic')
  })

  it('clampe à la borne haute de RARITY_TIERS (exx)', () => {
    const top = RARITY_TIERS[RARITY_TIERS.length - 1]
    expect(
      craftedRarity({ baseRarity: top, concentration: 150, toolBonus: 5 }),
    ).toBe(top)
  })

  it('rareté inconnue renvoyée telle quelle', () => {
    expect(craftedRarity({ baseRarity: 'ultra' })).toBe('ultra')
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
