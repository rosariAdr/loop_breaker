// SLOT01 — Migration save 4 → 9 slots d'équipement.
import { describe, it, expect } from 'vitest'
import { runMigrations, normalizeSave } from './migrations'
import { SAVE_VERSION } from './initialState'

const NINE_SLOTS = [
  'weapon',
  'offhand',
  'helmet',
  'armor',
  'gloves',
  'boots',
  'amulet',
  'ring1',
  'ring2',
]

describe('SLOT01 — SAVE_VERSION bumpé à 3', () => {
  it('SAVE_VERSION === 3', () => {
    expect(SAVE_VERSION).toBe(3)
  })
})

describe('SLOT01 — migration des slots d’équipement', () => {
  it('une save v2 (4 slots) reçoit les 9 slots, sans perdre les pièces portées', () => {
    const sword = { instanceId: 'sw', slot: 'weapon', stats: { strength: 5 } }
    const save = {
      saveVersion: 2,
      hero: { equipped: { weapon: sword, helmet: null, armor: null, boots: null } },
      world: {},
      meta: {},
    }
    const out = runMigrations(save)
    for (const s of NINE_SLOTS) expect(s in out.hero.equipped).toBe(true)
    expect(out.hero.equipped.weapon).toEqual(sword) // pièce préservée
    expect(out.hero.equipped.amulet).toBeNull()
    expect(out.hero.equipped.ring1).toBeNull()
    expect(out.hero.equipped.ring2).toBeNull()
    expect(out.hero.equipped.offhand).toBeNull()
    expect(out.saveVersion).toBe(3)
  })

  it('une save legacy v1 (sans saveVersion) monte jusqu’à 9 slots', () => {
    const save = { hero: { name: 'X', equipped: { weapon: null } }, world: {}, meta: {} }
    const out = runMigrations(save)
    for (const s of NINE_SLOTS) expect(s in out.hero.equipped).toBe(true)
    expect(out.saveVersion).toBe(3)
  })

  it('normalizeSave backfill les 9 slots même sur une save v3 écrite avant l’ajout', () => {
    const save = {
      saveVersion: 3,
      hero: { equipped: { weapon: null, helmet: null, armor: null, boots: null } },
      world: {},
      meta: {},
    }
    const out = normalizeSave(save)
    for (const s of NINE_SLOTS) expect(s in out.hero.equipped).toBe(true)
  })

  it('migration idempotente : rejouer runMigrations ne casse pas les slots', () => {
    const save = { saveVersion: 2, hero: { equipped: { weapon: null } }, world: {}, meta: {} }
    const once = runMigrations(save)
    const twice = runMigrations(once)
    for (const s of NINE_SLOTS) expect(s in twice.hero.equipped).toBe(true)
    expect(twice.saveVersion).toBe(3)
  })
})
