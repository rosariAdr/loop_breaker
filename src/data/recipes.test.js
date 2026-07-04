// Z04 / Z06 — Tests d'intégrité des recettes (source unifiée, v1.42 batch 6).
//
// Les compat shims (ALCHEMY/MASTER/LEATHER/COOKING_RECIPES) ont été retirés : ce fichier lit
// désormais la SOURCE UNIFIÉE data/craftRecipes.js (ALL_CRAFT_RECIPES) directement et
// regroupe les recettes par profession/préfixe pour reproduire les 5 systèmes historiques.
import { describe, it, expect } from 'vitest'
import { ALL_CRAFT_RECIPES, getRecipesByProfession } from './craftRecipes'
import { RESOURCES } from './resources'
import { EQUIPMENT_TEMPLATES, RARITY_TIERS } from './equipment'

// RES-G2 — Intégrité référentielle globale de TOUTES les recettes du jeu.
// Cinq systèmes de craft coexistent, tous UNIFIÉS dans ALL_CRAFT_RECIPES :
//   1. alchemy_* (alchimiste, sortie = consommable)
//   2. master_*  (maître forgeron, sortie = pièce Rare/Epic)
//   3. forge_*   (forgeron, craft par rareté, dérivé des EQUIPMENT_TEMPLATES)
//   4. leather_* (cordonnier, sortie = templateId)
//   5. cook_*    (cuisine, sortie = consommable)
// Tout id d'ingrédient/sortie doit exister dans RESOURCES/EQUIPMENT_TEMPLATES, et le
// tag `uses:['craft']` d'une ressource doit être VRAI ssi elle sert d'ingrédient.

// Regroupements par système (préfixe d'id + profession).
const ALCHEMY_RECIPES = getRecipesByProfession('alchemist').filter((r) => r.id.startsWith('alchemy_'))
const MASTER_RECIPES = getRecipesByProfession('blacksmith').filter((r) => r.id.startsWith('master_'))
const LEATHER_RECIPES = getRecipesByProfession('leatherworker').filter((r) =>
  r.id.startsWith('leather_'),
)
const COOKING_RECIPES = getRecipesByProfession('cook').filter((r) => r.id.startsWith('cook_'))

// Recettes à sortie = templateId (MASTER + LEATHER) et à sortie = consommable (ALCHEMY + COOKING).
const TEMPLATE_RECIPES = [...MASTER_RECIPES, ...LEATHER_RECIPES]
const OUTPUT_RECIPES = [...ALCHEMY_RECIPES, ...COOKING_RECIPES]

// Tous les ids d'ingrédients de craft, tous systèmes confondus (via les combinaisons).
function allCraftIngredientIds() {
  const ids = new Set()
  for (const r of ALL_CRAFT_RECIPES) {
    for (const c of r.combinations) {
      for (const id of Object.keys(c.ingredients)) ids.add(id)
    }
  }
  return ids
}

describe('RES-G2 — Intégrité référentielle globale des recettes', () => {
  const craftIds = allCraftIngredientIds()

  it('aucun ingrédient de craft ne référence un id absent de RESOURCES', () => {
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
      expect(EQUIPMENT_TEMPLATES[r.output], `template ${r.output}`).toBeDefined()
      for (const c of r.combinations) {
        expect(RARITY_TIERS, `${r.id} rareté ${c.rarity}`).toContain(c.rarity)
      }
    }
  })

  it('chaque recette à sortie consommable (ALCHEMY + COOKING) produit un consommable existant', () => {
    for (const r of OUTPUT_RECIPES) {
      expect(RESOURCES[r.output], `output ${r.output}`).toBeDefined()
      expect(RESOURCES[r.output].isConsumable, `${r.output} consommable`).toBe(true)
    }
  })

  it('toutes les recettes ont un id unique et un coût en or positif par combinaison', () => {
    const ids = ALL_CRAFT_RECIPES.map((r) => r.id)
    expect(new Set(ids).size, 'ids de recette non uniques').toBe(ids.length)
    for (const r of ALL_CRAFT_RECIPES) {
      for (const c of r.combinations) expect(c.gold, `${c.id}.gold`).toBeGreaterThan(0)
    }
  })
})

describe('Z04 — recettes alchimie (alchemy_*)', () => {
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
      r.combinations.forEach((c) => {
        Object.keys(c.ingredients).forEach((id) => {
          expect(RESOURCES[id], `ingredient ${id}`).toBeDefined()
        })
      })
    })
  })
  it('chaque combinaison a un coût en or positif', () => {
    ALCHEMY_RECIPES.forEach((r) =>
      r.combinations.forEach((c) => expect(c.gold).toBeGreaterThan(0)),
    )
  })
})

describe('Z06 — recettes maître forgeron (master_*)', () => {
  it('contient 5 recettes', () => {
    expect(MASTER_RECIPES).toHaveLength(5)
  })
  it('chaque templateId existe et la rareté est Rare ou Epic', () => {
    MASTER_RECIPES.forEach((r) => {
      expect(EQUIPMENT_TEMPLATES[r.output], `template ${r.output}`).toBeDefined()
      r.combinations.forEach((c) => {
        expect(['rare', 'epic']).toContain(c.rarity)
        expect(RARITY_TIERS).toContain(c.rarity)
      })
    })
  })
  it('chaque ingrédient référence une ressource existante', () => {
    MASTER_RECIPES.forEach((r) => {
      r.combinations.forEach((c) => {
        Object.keys(c.ingredients).forEach((id) => {
          expect(RESOURCES[id], `ingredient ${id}`).toBeDefined()
        })
      })
    })
  })
})
