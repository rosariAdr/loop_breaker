// SLOT01 — Tests des 9 slots, de la résolution de slot et des règles d'armes.
import { describe, it, expect } from 'vitest'
import {
  EQUIP_SLOTS,
  RING_SLOTS,
  resolveEquipSlot,
  equipInSlot,
} from './equipment'

// Fabriques d'instances minimales (on ne teste ici que la logique de placement).
const mk = (over = {}) => ({ instanceId: over.instanceId ?? Math.random().toString(36), stats: {}, ...over })
const weapon1h = (o) => mk({ slot: 'weapon', ...o })
const weapon2h = (o) => mk({ slot: 'weapon', twoHanded: true, ...o })
const offhand = (o) => mk({ slot: 'offhand', ...o })
const ring = (o) => mk({ slot: 'ring', ...o })
const helmet = (o) => mk({ slot: 'helmet', ...o })
const emptyEquipped = () => Object.fromEntries(EQUIP_SLOTS.map((s) => [s, null]))

describe('SLOT01 — constantes de slots', () => {
  it('9 clés d’équipement, dans l’ordre canonique', () => {
    expect(EQUIP_SLOTS).toEqual([
      'weapon',
      'offhand',
      'helmet',
      'armor',
      'gloves',
      'boots',
      'amulet',
      'ring1',
      'ring2',
    ])
    expect(EQUIP_SLOTS).toHaveLength(9)
    expect(RING_SLOTS).toEqual(['ring1', 'ring2'])
  })
})

describe('SLOT01 — resolveEquipSlot', () => {
  it('mappe une catégorie homonyme sur son slot', () => {
    expect(resolveEquipSlot(helmet(), emptyEquipped())).toBe('helmet')
    expect(resolveEquipSlot(weapon1h(), emptyEquipped())).toBe('weapon')
    expect(resolveEquipSlot(offhand(), emptyEquipped())).toBe('offhand')
  })

  it('une bague va dans la première bague libre (ring1 puis ring2)', () => {
    const eq = emptyEquipped()
    expect(resolveEquipSlot(ring(), eq)).toBe('ring1')
    eq.ring1 = ring()
    expect(resolveEquipSlot(ring(), eq)).toBe('ring2')
  })

  it('deux bagues pleines → remplace ring1', () => {
    const eq = emptyEquipped()
    eq.ring1 = ring()
    eq.ring2 = ring()
    expect(resolveEquipSlot(ring(), eq)).toBe('ring1')
  })

  it('catégorie inconnue → null', () => {
    expect(resolveEquipSlot(mk({ slot: 'trinket' }), emptyEquipped())).toBeNull()
    expect(resolveEquipSlot(null, emptyEquipped())).toBeNull()
  })
})

describe('SLOT01 — equipInSlot : règles d’armes 1 main / 2 mains / offhand', () => {
  it('équipe une arme 1 main sans toucher l’offhand', () => {
    const w = weapon1h({ instanceId: 'w1' })
    const { equipped, unequipped } = equipInSlot(w, emptyEquipped())
    expect(equipped.weapon).toBe(w)
    expect(equipped.offhand).toBeNull()
    expect(unequipped).toEqual([])
  })

  it('une arme 2 mains occupe weapon et vide/libère l’offhand', () => {
    const eq = emptyEquipped()
    const shield = offhand({ instanceId: 'sh' })
    eq.offhand = shield
    const maul = weapon2h({ instanceId: 'm' })
    const { equipped, unequipped } = equipInSlot(maul, eq)
    expect(equipped.weapon).toBe(maul)
    expect(equipped.offhand).toBeNull() // offhand libérée par la 2 mains
    expect(unequipped).toContain(shield) // l’ancien offhand retourne au sac
  })

  it('équiper un offhand alors qu’une arme 2 mains est portée libère la 2 mains', () => {
    const eq = emptyEquipped()
    const maul = weapon2h({ instanceId: 'm' })
    eq.weapon = maul
    const shield = offhand({ instanceId: 'sh' })
    const { equipped, unequipped } = equipInSlot(shield, eq)
    expect(equipped.offhand).toBe(shield)
    expect(equipped.weapon).toBeNull() // la 2 mains a lâché son emprise
    expect(unequipped).toContain(maul)
  })

  it('remplacer une pièce dans un slot occupé renvoie l’ancienne au sac', () => {
    const eq = emptyEquipped()
    const oldHelm = helmet({ instanceId: 'h1' })
    eq.helmet = oldHelm
    const newHelm = helmet({ instanceId: 'h2' })
    const { equipped, unequipped } = equipInSlot(newHelm, eq)
    expect(equipped.helmet).toBe(newHelm)
    expect(unequipped).toEqual([oldHelm])
  })

  it('une 1 main remplace une 2 mains sans consommer l’offhand vide', () => {
    const eq = emptyEquipped()
    const maul = weapon2h({ instanceId: 'm' })
    eq.weapon = maul
    const sword = weapon1h({ instanceId: 's' })
    const { equipped, unequipped } = equipInSlot(sword, eq)
    expect(equipped.weapon).toBe(sword)
    expect(unequipped).toEqual([maul])
    expect(equipped.offhand).toBeNull()
  })

  it('deux bagues se logent dans ring1 puis ring2 (via equipInSlot)', () => {
    let eq = emptyEquipped()
    const r1 = ring({ instanceId: 'r1' })
    const r2 = ring({ instanceId: 'r2' })
    ;({ equipped: eq } = equipInSlot(r1, eq))
    ;({ equipped: eq } = equipInSlot(r2, eq))
    expect(eq.ring1).toBe(r1)
    expect(eq.ring2).toBe(r2)
  })

  it('ne mute pas l’objet equipped source (fonction pure)', () => {
    const eq = emptyEquipped()
    equipInSlot(helmet({ instanceId: 'h' }), eq)
    expect(eq.helmet).toBeNull()
  })
})
