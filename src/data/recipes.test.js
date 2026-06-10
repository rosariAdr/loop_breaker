// Z04 / Z06 — Tests d'intégrité des recettes
import { describe, it, expect } from 'vitest'
import { ALCHEMY_RECIPES, MASTER_RECIPES } from './recipes'
import { RESOURCES } from './resources'
import { EQUIPMENT_TEMPLATES, RARITY_TIERS } from './equipment'

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
