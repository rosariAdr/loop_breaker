// v1.42 batch 6 — CRAFT-UNIFY01 : la source unifiée (compat shims RETIRÉS).
// Prouve que (1) la vue exhaustive ALL_CRAFT_RECIPES est bien formée, et que (2) les
// accesseurs par profession/rareté servent correctement les 5 systèmes historiques depuis
// la source unifiée (les consommateurs lisent CRAFT_RECIPES directement, plus de shims).
import { describe, it, expect } from 'vitest'
import {
  CRAFT_RECIPES,
  ALL_CRAFT_RECIPES,
  TEMPLATE_FORGE_RECIPES,
  getRecipesByProfession,
  getCombinationByRarity,
  findRecipeByIngredients,
} from './craftRecipes'
import { RESOURCES } from './resources'
import { EQUIPMENT_TEMPLATES, RARITY_TIERS } from './equipment'

// Regroupements par système (préfixe d'id + profession) — remplacent les anciens shims.
const ALCHEMY_RECIPES = getRecipesByProfession('alchemist').filter((r) => r.id.startsWith('alchemy_'))
const MASTER_RECIPES = getRecipesByProfession('blacksmith').filter((r) => r.id.startsWith('master_'))
const LEATHER_RECIPES = getRecipesByProfession('leatherworker').filter((r) =>
  r.id.startsWith('leather_'),
)
const COOKING_RECIPES = getRecipesByProfession('cook').filter((r) => r.id.startsWith('cook_'))

const outputExists = (id) =>
  Boolean(EQUIPMENT_TEMPLATES[id]) || Boolean(RESOURCES[id]?.isConsumable)

describe('CRAFT-UNIFY01 — vue exhaustive ALL_CRAFT_RECIPES', () => {
  it('contient les recettes éditées + la forge par template dérivée', () => {
    expect(ALL_CRAFT_RECIPES.length).toBe(CRAFT_RECIPES.length + TEMPLATE_FORGE_RECIPES.length)
  })

  it('chaque recette a id, output valide, outputKind, ≥1 combinaison, known booléen', () => {
    for (const r of ALL_CRAFT_RECIPES) {
      expect(r.id, 'id').toBeTypeOf('string')
      expect(outputExists(r.output), `${r.id} output ${r.output} introuvable`).toBe(true)
      expect(['equipment', 'consumable'], `${r.id}.outputKind`).toContain(r.outputKind)
      expect(typeof r.known, `${r.id}.known`).toBe('boolean')
      expect(r.combinations.length, `${r.id}.combinations`).toBeGreaterThanOrEqual(1)
    }
  })

  it('ids de recette uniques dans la vue exhaustive', () => {
    const ids = ALL_CRAFT_RECIPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ids de combinaison uniques dans la vue exhaustive', () => {
    const ids = ALL_CRAFT_RECIPES.flatMap((r) => r.combinations.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque combinaison porte une rarityTable valide (raretés connues, poids > 0)', () => {
    for (const r of ALL_CRAFT_RECIPES) {
      for (const c of r.combinations) {
        const entries = Object.entries(c.rarityTable ?? {})
        expect(entries.length, `${c.id} rarityTable vide`).toBeGreaterThan(0)
        for (const [rarity, w] of entries) {
          expect(RARITY_TIERS, `${c.id} rareté ${rarity}`).toContain(rarity)
          expect(w, `${c.id} poids`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('chaque ingrédient de combinaison existe et est tagué craft', () => {
    for (const r of ALL_CRAFT_RECIPES) {
      for (const c of r.combinations) {
        for (const [resId, qty] of Object.entries(c.ingredients)) {
          expect(RESOURCES[resId], `${c.id} → ${resId} absent`).toBeDefined()
          expect(RESOURCES[resId].uses.includes('craft'), `${resId} non tagué craft`).toBe(true)
          expect(qty, `${c.id} → ${resId} qty`).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('CRAFT-UNIFY01 — forge par template dérivée des EQUIPMENT_TEMPLATES', () => {
  it('un template craftable ⟺ une recette forge_<templateId> avec 1 combinaison par rareté', () => {
    const craftableTemplates = Object.entries(EQUIPMENT_TEMPLATES).filter(
      ([, t]) => Object.keys(t.craftRecipes ?? {}).length > 0,
    )
    expect(TEMPLATE_FORGE_RECIPES.length).toBe(craftableTemplates.length)
    for (const [tid, tpl] of craftableTemplates) {
      const rec = TEMPLATE_FORGE_RECIPES.find((r) => r.output === tid)
      expect(rec, `recette forge de ${tid} absente`).toBeDefined()
      const rarities = Object.keys(tpl.craftRecipes)
      expect(rec.combinations.map((c) => c.rarity).sort()).toEqual([...rarities].sort())
      for (const c of rec.combinations) {
        const src = tpl.craftRecipes[c.rarity]
        expect(c.ingredients, `${tid}.${c.rarity} ingredients`).toBe(src.ingredients)
        expect(c.gold, `${tid}.${c.rarity} gold`).toBe(src.gold)
      }
    }
  })

  it('les armes d’élite non craftables (craftRecipes vides) n’ont pas de recette forge', () => {
    for (const eliteId of ['oakheart_branch', 'thunderhoof_maul', 'graven_edge']) {
      expect(TEMPLATE_FORGE_RECIPES.find((r) => r.output === eliteId)).toBeUndefined()
    }
  })
})

describe('CRAFT-UNIFY01 — accès par profession/rareté sur la source unifiée', () => {
  it('alchimiste : 6 recettes `alchemy_*`, sortie = consommable existant', () => {
    expect(ALCHEMY_RECIPES).toHaveLength(6)
    for (const r of ALCHEMY_RECIPES) {
      const unified = CRAFT_RECIPES.find((u) => u.id === r.id)
      expect(unified, `source unifiée de ${r.id}`).toBe(r)
      expect(RESOURCES[r.output]?.isConsumable, `${r.output}`).toBe(true)
    }
  })

  it('maître forgeron : 5 recettes `master_*`, sortie = templateId Rare/Epic', () => {
    expect(MASTER_RECIPES).toHaveLength(5)
    for (const r of MASTER_RECIPES) {
      expect(EQUIPMENT_TEMPLATES[r.output], `template ${r.output}`).toBeDefined()
      const combo = r.combinations[0]
      expect(['rare', 'epic']).toContain(combo.rarity)
      // getCombinationByRarity retrouve bien la combinaison à rareté fixe.
      expect(getCombinationByRarity(r, combo.rarity)).toBe(combo)
    }
  })

  it('cordonnier : 3 recettes `leather_*` cuir → templateId existant', () => {
    expect(LEATHER_RECIPES).toHaveLength(3)
    for (const r of LEATHER_RECIPES) {
      expect(EQUIPMENT_TEMPLATES[r.output]).toBeDefined()
      for (const c of r.combinations) expect(RARITY_TIERS).toContain(c.rarity)
    }
  })

  it('cuisine : 2 recettes `cook_*` → consommable existant', () => {
    expect(COOKING_RECIPES).toHaveLength(2)
    for (const r of COOKING_RECIPES) {
      expect(RESOURCES[r.output]?.isConsumable, `${r.output}`).toBe(true)
    }
  })

  it('toutes ces recettes ont un id, et chaque combinaison un coût en or positif + des ingrédients', () => {
    for (const r of [...ALCHEMY_RECIPES, ...MASTER_RECIPES, ...LEATHER_RECIPES, ...COOKING_RECIPES]) {
      expect(r.id).toBeTypeOf('string')
      for (const c of r.combinations) {
        expect(c.gold).toBeGreaterThan(0)
        expect(Object.keys(c.ingredients).length).toBeGreaterThan(0)
      }
    }
  })
})

describe('CRAFT-UNIFY01 — non-régression découverte (findRecipeByIngredients inchangé)', () => {
  it('la table par défaut reste CRAFT_RECIPES (les combinaisons batch 4 priment)', () => {
    const m = findRecipeByIngredients({ rusted_iron: 3, wolf_fang: 1 })
    expect(m?.recipe.id).toBe('craft_iron_band')
    expect(m?.combination.id).toBe('iron_band__scrap')
  })
})
