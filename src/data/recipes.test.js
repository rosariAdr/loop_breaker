// Z04 / Z06 — Tests d'intégrité des recettes
import { describe, it, expect } from 'vitest'
import { ALCHEMY_RECIPES, MASTER_RECIPES, LEATHER_RECIPES, COOKING_RECIPES } from './recipes'
import { RESOURCES } from './resources'
import { EQUIPMENT_TEMPLATES, RARITY_TIERS } from './equipment'

// RES-G2 — Intégrité référentielle globale de TOUTES les recettes du jeu.
// Cinq systèmes de craft coexistent :
//   1. ALCHEMY_RECIPES     (alchimiste, sortie = consommable)
//   2. MASTER_RECIPES      (maître forgeron, sortie = pièce Rare/Epic)
//   3. EQUIPMENT_TEMPLATES[*].craftRecipes (forgeron, craft par rareté)
//   4. LEATHER_RECIPES     (DROP-FIX01 — cuir, sortie = templateId)
//   5. COOKING_RECIPES     (DROP-FIX01 — cuisine, sortie = consommable)
// Tout id d'ingrédient/sortie doit exister dans RESOURCES/EQUIPMENT_TEMPLATES, et le
// tag `uses:['craft']` d'une ressource doit être VRAI ssi elle sert d'ingrédient.

// Recettes à sortie = templateId (forme MASTER) et à sortie = consommable (forme ALCHEMY).
const TEMPLATE_RECIPES = [...MASTER_RECIPES, ...LEATHER_RECIPES]
const OUTPUT_RECIPES = [...ALCHEMY_RECIPES, ...COOKING_RECIPES]

// Tous les ids d'ingrédients de craft, tous systèmes confondus.
function allCraftIngredientIds() {
  const ids = new Set()
  for (const r of [...OUTPUT_RECIPES, ...TEMPLATE_RECIPES]) {
    for (const id of Object.keys(r.ingredients)) ids.add(id)
  }
  for (const t of Object.values(EQUIPMENT_TEMPLATES)) {
    for (const rec of Object.values(t.craftRecipes ?? {})) {
      for (const id of Object.keys(rec.ingredients ?? {})) ids.add(id)
    }
  }
  return ids
}

describe('RES-G2 — Intégrité référentielle globale des recettes', () => {
  const craftIds = allCraftIngredientIds()

  it('aucun ingrédient de craft (3 systèmes) ne référence un id absent de RESOURCES', () => {
    for (const id of craftIds) {
      expect(RESOURCES[id], `ingrédient ${id} absent de RESOURCES`).toBeDefined()
    }
  })

  it('chaque craftRecipe d’équipement cible un templateId existant', () => {
    for (const [tid, t] of Object.entries(EQUIPMENT_TEMPLATES)) {
      for (const rar of Object.keys(t.craftRecipes ?? {})) {
        expect(RARITY_TIERS, `${tid} rareté ${rar}`).toContain(rar)
      }
    }
  })

  it("toute ressource ingrédient déclare 'craft' dans uses[] (tag non menteur)", () => {
    for (const id of craftIds) {
      const r = RESOURCES[id]
      expect(r.uses, `${id}.uses`).toBeDefined()
      expect(r.uses.includes('craft'), `${id} est ingrédient mais uses=${JSON.stringify(r.uses)}`).toBe(
        true,
      )
    }
  })

  it("toute ressource taguée 'craft' est réellement ingrédient d’au moins une recette (pas de tag mort)", () => {
    for (const r of Object.values(RESOURCES)) {
      if (r.isConsumable) continue
      if (!(r.uses ?? []).includes('craft')) continue
      expect(craftIds.has(r.id), `${r.id} tagué 'craft' mais utilisé par aucune recette`).toBe(true)
    }
  })

  it('chaque recette à sortie templateId (MASTER + LEATHER) cible un template existant', () => {
    for (const r of TEMPLATE_RECIPES) {
      expect(EQUIPMENT_TEMPLATES[r.templateId], `template ${r.templateId}`).toBeDefined()
      expect(RARITY_TIERS, `${r.id} rareté ${r.rarity}`).toContain(r.rarity)
    }
  })

  it('chaque recette à sortie consommable (ALCHEMY + COOKING) produit un consommable existant', () => {
    for (const r of OUTPUT_RECIPES) {
      expect(RESOURCES[r.output], `output ${r.output}`).toBeDefined()
      expect(RESOURCES[r.output].isConsumable, `${r.output} consommable`).toBe(true)
    }
  })

  it('toutes les recettes ont un id unique et un coût en or positif', () => {
    const all = [...OUTPUT_RECIPES, ...TEMPLATE_RECIPES]
    const ids = all.map((r) => r.id)
    expect(new Set(ids).size, 'ids de recette non uniques').toBe(ids.length)
    for (const r of all) expect(r.gold, `${r.id}.gold`).toBeGreaterThan(0)
  })
})

describe('Z04 — ALCHEMY_RECIPES', () => {
  it('contient 6 recettes', () => {
    expect(ALCHEMY_RECIPES).toHaveLength(6)
  })
  it('chaque sortie est un consommable existant', () => {
    ALCHEMY_RECIPES.forEach((r) => {
      expect(RESOURCES[r.output], `output ${r.output}`).toBeDefined()
      expect(RESOURCES[r.output].isConsumable, `${r.output} consommable`).toBe(true)
    })
  })
  it('chaque ingrédient référence une ressource existante', () => {
    ALCHEMY_RECIPES.forEach((r) => {
      Object.keys(r.ingredients).forEach((id) => {
        expect(RESOURCES[id], `ingredient ${id}`).toBeDefined()
      })
    })
  })
  it('chaque recette a un coût en or positif', () => {
    ALCHEMY_RECIPES.forEach((r) => expect(r.gold).toBeGreaterThan(0))
  })
})

describe('Z06 — MASTER_RECIPES', () => {
  it('contient 5 recettes', () => {
    expect(MASTER_RECIPES).toHaveLength(5)
  })
  it('chaque templateId existe et la rareté est Rare ou Epic', () => {
    MASTER_RECIPES.forEach((r) => {
      expect(EQUIPMENT_TEMPLATES[r.templateId], `template ${r.templateId}`).toBeDefined()
      expect(['rare', 'epic']).toContain(r.rarity)
      expect(RARITY_TIERS).toContain(r.rarity)
    })
  })
  it('chaque ingrédient référence une ressource existante', () => {
    MASTER_RECIPES.forEach((r) => {
      Object.keys(r.ingredients).forEach((id) => {
        expect(RESOURCES[id], `ingredient ${id}`).toBeDefined()
      })
    })
  })
})
