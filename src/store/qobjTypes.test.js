// QOBJ-TYPES01 — nouveaux types d'objectifs non-combat : pray / accept_deed / equip /
// craft filtré par outputKind. Tests de tracking (incrément du compteur persisté) + de
// complétion (delta depuis l'acceptation, ou check d'état pour equip).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { QUESTS } from '../data/quests'
import { createEquipmentInstance } from '../data/equipment'
import { normalizeSave } from './migrations'

const store = () => useGameStore.getState()

// Quête jetable injectée dans QUESTS (résolue par getQuestById → startQuest fonctionne).
function injectQuest(id, objectives) {
  QUESTS[id] = {
    id,
    name: id,
    giverNpc: 'greywatch_elder',
    flavorText: '',
    objectives,
    reward: {},
  }
}

describe('QOBJ-TYPES01 — pray', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('prayAtChurch incrémente le compteur persisté meta.prayCount', () => {
    expect(store().meta.prayCount ?? 0).toBe(0)
    store().prayAtChurch()
    expect(store().meta.prayCount).toBe(1)
    store().prayAtChurch()
    expect(store().meta.prayCount).toBe(2)
  })

  it("complétée au DELTA depuis l'acceptation (les prières antérieures ne comptent pas)", () => {
    injectQuest('__pray_test', [{ id: 'p', type: 'pray', count: 1, label: 'Pray once' }])
    // prière AVANT acceptation : ne doit pas remplir la quête (baseline figée à l'acceptation)
    store().prayAtChurch()
    store().startQuest('__pray_test')
    expect(store().isQuestComplete('__pray_test')).toBe(false)
    store().prayAtChurch()
    expect(store().isQuestComplete('__pray_test')).toBe(true)
    delete QUESTS.__pray_test
  })
})

describe('QOBJ-TYPES01 — accept_deed', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('accepter un acte de dévotion (church deed) incrémente meta.deedsAccepted', () => {
    expect(store().meta.deedsAccepted ?? 0).toBe(0)
    store().startQuest('church_thin_the_pack') // vrai id dans CHURCH_QUESTS
    expect(store().meta.deedsAccepted).toBe(1)
  })

  it("accepter une quête NON-église n'incrémente pas le compteur", () => {
    injectQuest('__plain_test', [{ id: 'p', type: 'pray', count: 1, label: 'x' }])
    store().startQuest('__plain_test')
    expect(store().meta.deedsAccepted ?? 0).toBe(0)
    delete QUESTS.__plain_test
  })

  it("complétée quand un church deed est accepté après l'acceptation (delta)", () => {
    injectQuest('__deed_test', [{ id: 'd', type: 'accept_deed', count: 1, label: 'Accept a deed' }])
    store().startQuest('__deed_test')
    expect(store().isQuestComplete('__deed_test')).toBe(false)
    store().startQuest('church_thin_the_pack')
    expect(store().isQuestComplete('__deed_test')).toBe(true)
    delete QUESTS.__deed_test
  })
})

describe("QOBJ-TYPES01 — equip (check d'état)", () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('complétée quand une arme est portée (défaut = weapon)', () => {
    injectQuest('__equip_test', [{ id: 'e', type: 'equip', label: 'Equip a weapon' }])
    store().startQuest('__equip_test')
    expect(store().isQuestComplete('__equip_test')).toBe(false)
    const item = createEquipmentInstance('iron_sword', 'common')
    store().addEquipmentToInventory(item)
    store().equipItem(item.instanceId)
    expect(store().isQuestComplete('__equip_test')).toBe(true)
    delete QUESTS.__equip_test
  })

  it("category filtre par slot : un casque ne satisfait pas un objectif d'arme", () => {
    injectQuest('__equip_weapon', [{ id: 'e', type: 'equip', label: 'Equip a weapon' }])
    store().startQuest('__equip_weapon')
    const helm = createEquipmentInstance('iron_helm', 'common')
    store().addEquipmentToInventory(helm)
    store().equipItem(helm.instanceId)
    // casque porté mais l'objectif vise une arme (défaut) → toujours incomplet
    expect(store().isQuestComplete('__equip_weapon')).toBe(false)

    injectQuest('__equip_helm', [
      { id: 'e', type: 'equip', category: 'helmet', label: 'Equip a helmet' },
    ])
    store().startQuest('__equip_helm')
    // le casque déjà porté satisfait l'objectif category:helmet (check d'état, pas de delta)
    expect(store().isQuestComplete('__equip_helm')).toBe(true)
    delete QUESTS.__equip_weapon
    delete QUESTS.__equip_helm
  })
})

describe('QOBJ-TYPES01 — craft filtré par outputKind', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('incrementCraftCount(kind) alimente craftCount ET craftCountByKind', () => {
    store().incrementCraftCount('consumable')
    expect(store().meta.craftCount).toBe(1)
    expect(store().meta.craftCountByKind.consumable).toBe(1)
    store().incrementCraftCount('equipment')
    expect(store().meta.craftCount).toBe(2)
    expect(store().meta.craftCountByKind.equipment).toBe(1)
    expect(store().meta.craftCountByKind.consumable).toBe(1)
  })

  it('seuls les crafts du bon kind complètent une quête outputKind', () => {
    injectQuest('__craftkind_test', [
      { id: 'c', type: 'craft', count: 1, outputKind: 'consumable', label: 'Brew a potion' },
    ])
    store().startQuest('__craftkind_test')
    store().incrementCraftCount('equipment') // mauvais kind
    expect(store().isQuestComplete('__craftkind_test')).toBe(false)
    store().incrementCraftCount('consumable') // bon kind
    expect(store().isQuestComplete('__craftkind_test')).toBe(true)
    delete QUESTS.__craftkind_test
  })
})

describe('QOBJ-TYPES01 — migration / backfill des compteurs', () => {
  it('normalizeSave rétablit les compteurs manquants sur une vieille save', () => {
    const old = { hero: {}, world: {}, meta: { craftCount: 5 } }
    const migrated = normalizeSave(old)
    expect(migrated.meta.craftCount).toBe(5) // préservé
    expect(migrated.meta.craftCountByKind).toEqual({})
    expect(migrated.meta.prayCount).toBe(0)
    expect(migrated.meta.deedsAccepted).toBe(0)
  })

  it('normalizeSave coerce un craftCountByKind malformé en objet', () => {
    const migrated = normalizeSave({ hero: {}, world: {}, meta: { craftCountByKind: 'oops' } })
    expect(migrated.meta.craftCountByKind).toEqual({})
  })
})
