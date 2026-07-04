// v1.42 batch 4 — Tests du modèle de données craft.
// Couvre CRAFT-KNOWN01 (known vs découvrable), CRAFT-MULTI01 (combinaisons multiples),
// CRAFT-RARITY01 (table de rareté par combinaison) + intégrité référentielle.
import { describe, it, expect } from 'vitest'
import {
  CRAFT_RECIPES,
  CRAFT_PROFESSIONS,
  getKnownRecipes,
  getDiscoverableRecipes,
  getRecipeById,
  findRecipeByIngredients,
  getCombinations,
} from './craftRecipes'
import { RESOURCES } from './resources'
import { EQUIPMENT_TEMPLATES, RARITY_TIERS } from './equipment'

// Un output est valide s'il désigne un template d'équipement OU un consommable existant.
const outputExists = (id) =>
  Boolean(EQUIPMENT_TEMPLATES[id]) || Boolean(RESOURCES[id]?.isConsumable)

describe('CRAFT-* — forme & intégrité des recettes', () => {
  it('chaque recette a id, output valide, profession connue, known booléen, ≥1 combinaison', () => {
    for (const r of CRAFT_RECIPES) {
      expect(r.id, 'id').toBeTypeOf('string')
      expect(outputExists(r.output), `${r.id} output ${r.output} introuvable`).toBe(true)
      expect(CRAFT_PROFESSIONS, `${r.id} profession`).toContain(r.profession)
      expect(typeof r.known, `${r.id}.known`).toBe('boolean')
      expect(Array.isArray(r.combinations) && r.combinations.length >= 1, `${r.id}.combinations`).toBe(
        true,
      )
    }
  })

  it('ids de recette uniques', () => {
    const ids = CRAFT_RECIPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ids de combinaison uniques (tous recipes confondus)', () => {
    const ids = CRAFT_RECIPES.flatMap((r) => r.combinations.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque ingrédient de combinaison existe dans RESOURCES et est tagué craft', () => {
    for (const r of CRAFT_RECIPES) {
      for (const c of r.combinations) {
        for (const [resId, qty] of Object.entries(c.ingredients)) {
          const res = RESOURCES[resId]
          expect(res, `${c.id} → ingrédient ${resId} absent`).toBeDefined()
          expect(res.uses.includes('craft'), `${resId} non tagué craft`).toBe(true)
          expect(qty, `${c.id} → ${resId} qty`).toBeGreaterThan(0)
        }
        expect(c.gold, `${c.id}.gold`).toBeGreaterThan(0)
      }
    }
  })
})

describe('CRAFT-RARITY01 — table de rareté par combinaison', () => {
  it('chaque combinaison porte une rarityTable non vide de raretés valides à poids positif', () => {
    for (const r of CRAFT_RECIPES) {
      for (const c of r.combinations) {
        const entries = Object.entries(c.rarityTable ?? {})
        expect(entries.length, `${c.id} rarityTable vide`).toBeGreaterThan(0)
        for (const [rarity, weight] of entries) {
          expect(RARITY_TIERS, `${c.id} rareté ${rarity}`).toContain(rarity)
          expect(weight, `${c.id} → ${rarity} poids`).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('CRAFT-KNOWN01 — connu vs découvrable', () => {
  it('getKnownRecipes ne retourne que des known:true', () => {
    for (const r of getKnownRecipes()) expect(r.known).toBe(true)
  })
  it('getDiscoverableRecipes ne retourne que des known:false', () => {
    for (const r of getDiscoverableRecipes()) expect(r.known).toBe(false)
  })
  it('la partition known/découvrable couvre toutes les recettes sans doublon', () => {
    expect(getKnownRecipes().length + getDiscoverableRecipes().length).toBe(CRAFT_RECIPES.length)
  })
  it('il existe au moins une recette de chaque type', () => {
    expect(getKnownRecipes().length).toBeGreaterThan(0)
    expect(getDiscoverableRecipes().length).toBeGreaterThan(0)
  })
})

describe('CRAFT-MULTI01 — plusieurs combinaisons → même objet', () => {
  it('au moins une recette a ≥2 combinaisons distinctes visant le même output', () => {
    const multi = CRAFT_RECIPES.filter((r) => r.combinations.length >= 2)
    expect(multi.length).toBeGreaterThan(0)
  })

  it('findRecipeByIngredients matche une combinaison exacte (ordre/format indifférent)', () => {
    // iron_band a une combinaison scrap { rusted_iron:3, wolf_fang:1 }.
    const m = findRecipeByIngredients({ wolf_fang: 1, rusted_iron: 3 })
    expect(m).not.toBeNull()
    expect(m.recipe.id).toBe('craft_iron_band')
    expect(m.combination.id).toBe('iron_band__scrap')
  })

  it('les deux combinaisons d’un même objet sont toutes deux retrouvables', () => {
    const a = findRecipeByIngredients({ rusted_iron: 3, wolf_fang: 1 })
    const b = findRecipeByIngredients({ cursed_steel: 2, warlord_crest: 1 })
    expect(a.recipe.id).toBe('craft_iron_band')
    expect(b.recipe.id).toBe('craft_iron_band')
    expect(a.combination.id).not.toBe(b.combination.id)
  })

  it('un mélange inconnu → null', () => {
    expect(findRecipeByIngredients({ rusted_iron: 99 })).toBeNull()
    expect(findRecipeByIngredients({})).toBeNull()
  })

  it('une quantité qui ne matche pas exactement → null', () => {
    expect(findRecipeByIngredients({ rusted_iron: 2, wolf_fang: 1 })).toBeNull()
  })

  it('getCombinations / getRecipeById cohérents', () => {
    expect(getRecipeById('craft_iron_band').output).toBe('iron_band')
    expect(getCombinations('craft_iron_band')).toHaveLength(2)
    expect(getCombinations('inexistant')).toEqual([])
  })
})
