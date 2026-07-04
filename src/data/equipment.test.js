// Z03 — Tests canCraft (logique pilotant l'affichage des recettes forge)
import { describe, it, expect } from 'vitest'
import {
  canCraft,
  createEquipmentInstance,
  resolveEquipSlot,
  equipInSlot,
  EQUIP_SLOTS,
  EQUIPMENT_TEMPLATES,
  RARITY_CONFIG,
} from './equipment'

describe('Z03 — canCraft', () => {
  it('true si toutes les ressources sont présentes en quantité suffisante', () => {
    // iron_sword common : rusted_iron x3
    expect(canCraft('iron_sword', 'common', { rusted_iron: 3 })).toBe(true)
    expect(canCraft('iron_sword', 'common', { rusted_iron: 10 })).toBe(true)
  })

  it('false si une ressource manque', () => {
    expect(canCraft('iron_sword', 'common', { rusted_iron: 2 })).toBe(false)
    expect(canCraft('iron_sword', 'common', {})).toBe(false)
  })

  it('false pour un template inconnu', () => {
    expect(canCraft('nonexistent', 'common', { rusted_iron: 99 })).toBe(false)
  })

  it('false pour une rareté sans recette', () => {
    // mythic/ex n'ont pas de recette pour iron_sword
    expect(canCraft('iron_sword', 'mythic', { rusted_iron: 99 })).toBe(false)
  })

  it('vérifie TOUS les ingrédients (recette multi-ingrédients)', () => {
    // iron_sword rare : rusted_iron x5 + cursed_steel x1
    expect(canCraft('iron_sword', 'rare', { rusted_iron: 5, cursed_steel: 1 })).toBe(true)
    expect(canCraft('iron_sword', 'rare', { rusted_iron: 5 })).toBe(false) // manque cursed_steel
    expect(canCraft('iron_sword', 'rare', { cursed_steel: 1 })).toBe(false) // manque rusted_iron
  })
})

describe('Z03 — createEquipmentInstance (cohérence craft)', () => {
  it('crée une instance avec instanceId unique', () => {
    const a = createEquipmentInstance('iron_sword', 'common')
    const b = createEquipmentInstance('iron_sword', 'common')
    expect(a.instanceId).not.toBe(b.instanceId)
  })

  it('applique le multiplicateur de rareté aux stats', () => {
    const common = createEquipmentInstance('iron_sword', 'common')
    const rare = createEquipmentInstance('iron_sword', 'rare')
    expect(rare.stats.strength).toBeGreaterThan(common.stats.strength)
  })

  it('inclut slot, rarity, name', () => {
    const item = createEquipmentInstance('iron_sword', 'common')
    expect(item.slot).toBe('weapon')
    expect(item.rarity).toBe('common')
    expect(item.name).toContain('Iron Sword')
  })
})

describe('Z03 — Données EQUIPMENT_TEMPLATES', () => {
  it('chaque template a slot, baseStats, craftRecipes', () => {
    for (const [id, t] of Object.entries(EQUIPMENT_TEMPLATES)) {
      expect(t.slot, `${id} missing slot`).toBeDefined()
      expect(t.baseStats, `${id} missing baseStats`).toBeDefined()
      expect(t.craftRecipes, `${id} missing craftRecipes`).toBeDefined()
    }
  })

  it('RARITY_CONFIG a un mult croissant par tier', () => {
    expect(RARITY_CONFIG.rare.mult).toBeGreaterThan(RARITY_CONFIG.common.mult)
    expect(RARITY_CONFIG.epic.mult).toBeGreaterThan(RARITY_CONFIG.rare.mult)
  })
})

// BIJOU01 / LEAT01 (v1.42 batch 4) — templates des nouveaux slots (amulette/bague/gants).
describe('BIJOU01/LEAT01 — templates amulette / bague / gants', () => {
  const NEW_GLOVES = ['leather_gloves', 'spectral_grips', 'hunters_grips']
  const NEW_AMULETS = ['iron_pendant', 'wraith_locket', 'serpent_charm']
  const NEW_RINGS = ['iron_band', 'wraith_signet', 'band_of_fortune']

  it('les gants existent, slot=gloves, material=leather, baseStats non vides', () => {
    for (const id of NEW_GLOVES) {
      const t = EQUIPMENT_TEMPLATES[id]
      expect(t, id).toBeDefined()
      expect(t.slot).toBe('gloves')
      expect(t.material).toBe('leather')
      expect(Object.keys(t.baseStats).length).toBeGreaterThan(0)
      expect(Object.keys(t.craftRecipes).length).toBeGreaterThan(0)
    }
  })

  it('les amulettes existent, slot=amulet, material=metal', () => {
    for (const id of NEW_AMULETS) {
      const t = EQUIPMENT_TEMPLATES[id]
      expect(t, id).toBeDefined()
      expect(t.slot).toBe('amulet')
      expect(t.material).toBe('metal')
    }
  })

  it('les bagues existent, slot=ring, material=metal', () => {
    for (const id of NEW_RINGS) {
      const t = EQUIPMENT_TEMPLATES[id]
      expect(t, id).toBeDefined()
      expect(t.slot).toBe('ring')
      expect(t.material).toBe('metal')
    }
  })

  it('chaque nouveau template s’instancie et se résout dans le bon slot porté', () => {
    const empty = Object.fromEntries(EQUIP_SLOTS.map((s) => [s, null]))
    // gants → gloves ; amulette → amulet ; bague → ring1 (1ère libre).
    expect(resolveEquipSlot(createEquipmentInstance('leather_gloves', 'common'), empty)).toBe('gloves')
    expect(resolveEquipSlot(createEquipmentInstance('iron_pendant', 'common'), empty)).toBe('amulet')
    expect(resolveEquipSlot(createEquipmentInstance('iron_band', 'common'), empty)).toBe('ring1')
  })

  it('deux bagues craftées se logent dans ring1 puis ring2', () => {
    let eq = Object.fromEntries(EQUIP_SLOTS.map((s) => [s, null]))
    ;({ equipped: eq } = equipInSlot(createEquipmentInstance('iron_band', 'common'), eq))
    ;({ equipped: eq } = equipInSlot(createEquipmentInstance('band_of_fortune', 'rare'), eq))
    expect(eq.ring1?.templateId).toBe('iron_band')
    expect(eq.ring2?.templateId).toBe('band_of_fortune')
  })

  it('les pièces de set portent bien leur tag set (extension vers 9 pièces)', () => {
    expect(createEquipmentInstance('leather_gloves', 'common').set).toBe('iron_vanguard')
    expect(createEquipmentInstance('iron_pendant', 'common').set).toBe('iron_vanguard')
    expect(createEquipmentInstance('iron_band', 'common').set).toBe('iron_vanguard')
    expect(createEquipmentInstance('spectral_grips', 'common').set).toBe('wraithbound')
    expect(createEquipmentInstance('wraith_locket', 'common').set).toBe('wraithbound')
    expect(createEquipmentInstance('wraith_signet', 'common').set).toBe('wraithbound')
    // pièces hors set : pas de tag.
    expect(createEquipmentInstance('hunters_grips', 'common').set).toBeUndefined()
    expect(createEquipmentInstance('serpent_charm', 'common').set).toBeUndefined()
    expect(createEquipmentInstance('band_of_fortune', 'common').set).toBeUndefined()
  })

  it('canCraft fonctionne sur une recette de bijou (iron_band common)', () => {
    expect(canCraft('iron_band', 'common', { rusted_iron: 3, wolf_fang: 1 })).toBe(true)
    expect(canCraft('iron_band', 'common', { rusted_iron: 3 })).toBe(false)
  })
})
