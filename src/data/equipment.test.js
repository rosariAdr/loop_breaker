// Z03 — Tests canCraft (logique pilotant l'affichage des recettes forge)
import { describe, it, expect } from 'vitest'
import { canCraft, createEquipmentInstance, EQUIPMENT_TEMPLATES, RARITY_CONFIG } from './equipment'

describe('Z03 — canCraft', () => {
  it("true si toutes les ressources sont présentes en quantité suffisante", () => {
    // iron_sword common : rusted_iron x3
    expect(canCraft('iron_sword', 'common', { rusted_iron: 3 })).toBe(true)
    expect(canCraft('iron_sword', 'common', { rusted_iron: 10 })).toBe(true)
  })

  it("false si une ressource manque", () => {
    expect(canCraft('iron_sword', 'common', { rusted_iron: 2 })).toBe(false)
    expect(canCraft('iron_sword', 'common', {})).toBe(false)
  })

  it("false pour un template inconnu", () => {
    expect(canCraft('nonexistent', 'common', { rusted_iron: 99 })).toBe(false)
  })

  it("false pour une rareté sans recette", () => {
    // mythic/ex n'ont pas de recette pour iron_sword
    expect(canCraft('iron_sword', 'mythic', { rusted_iron: 99 })).toBe(false)
  })

  it("vérifie TOUS les ingrédients (recette multi-ingrédients)", () => {
    // iron_sword rare : rusted_iron x5 + cursed_steel x1
    expect(canCraft('iron_sword', 'rare', { rusted_iron: 5, cursed_steel: 1 })).toBe(true)
    expect(canCraft('iron_sword', 'rare', { rusted_iron: 5 })).toBe(false)  // manque cursed_steel
    expect(canCraft('iron_sword', 'rare', { cursed_steel: 1 })).toBe(false) // manque rusted_iron
  })
})

describe('Z03 — createEquipmentInstance (cohérence craft)', () => {
  it("crée une instance avec instanceId unique", () => {
    const a = createEquipmentInstance('iron_sword', 'common')
    const b = createEquipmentInstance('iron_sword', 'common')
    expect(a.instanceId).not.toBe(b.instanceId)
  })

  it("applique le multiplicateur de rareté aux stats", () => {
    const common = createEquipmentInstance('iron_sword', 'common')
    const rare = createEquipmentInstance('iron_sword', 'rare')
    expect(rare.stats.strength).toBeGreaterThan(common.stats.strength)
  })

  it("inclut slot, rarity, name", () => {
    const item = createEquipmentInstance('iron_sword', 'common')
    expect(item.slot).toBe('weapon')
    expect(item.rarity).toBe('common')
    expect(item.name).toContain('Iron Sword')
  })
})

describe('Z03 — Données EQUIPMENT_TEMPLATES', () => {
  it("chaque template a slot, baseStats, craftRecipes", () => {
    for (const [id, t] of Object.entries(EQUIPMENT_TEMPLATES)) {
      expect(t.slot, `${id} missing slot`).toBeDefined()
      expect(t.baseStats, `${id} missing baseStats`).toBeDefined()
      expect(t.craftRecipes, `${id} missing craftRecipes`).toBeDefined()
    }
  })

  it("RARITY_CONFIG a un mult croissant par tier", () => {
    expect(RARITY_CONFIG.rare.mult).toBeGreaterThan(RARITY_CONFIG.common.mult)
    expect(RARITY_CONFIG.epic.mult).toBeGreaterThan(RARITY_CONFIG.rare.mult)
  })
})
