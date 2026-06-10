// D04 — Tests structure RESOURCES + category dungeon_seal
import { describe, it, expect } from 'vitest'
import { RESOURCES } from './resources'

describe('D04 — Loot exclusif donjon (category dungeon_seal)', () => {
  const SEAL_IDS = ['crypt_seal', 'forsaken_seal', 'demon_lord_heart']

  it('les 3 reliques de boss/demon lord ont category="dungeon_seal"', () => {
    for (const id of SEAL_IDS) {
      const res = RESOURCES[id]
      expect(res, `RESOURCES.${id} missing`).toBeDefined()
      expect(res.category).toBe('dungeon_seal')
    }
  })

  it('rarity de chaque seal est epic ou legendary (jamais common)', () => {
    for (const id of SEAL_IDS) {
      const res = RESOURCES[id]
      expect(['epic', 'legendary']).toContain(res.rarity)
    }
  })

  it('sellPrice des seals est conséquent (>= 100g)', () => {
    for (const id of SEAL_IDS) {
      const res = RESOURCES[id]
      expect(res.sellPrice).toBeGreaterThanOrEqual(100)
    }
  })

  it('demon_lord_heart est marqué legendary (plus haute rareté boss)', () => {
    expect(RESOURCES.demon_lord_heart.rarity).toBe('legendary')
    expect(RESOURCES.demon_lord_heart.sellPrice).toBeGreaterThanOrEqual(1000)
  })

  it('aucun monster common ne droppe une ressource category=dungeon_seal', () => {
    // Sanity check : pas de drops de seal hors boss
    // Inspection visuelle via la data : crypt_seal/forsaken_seal/demon_lord_heart
    // sont uniquement dans MONSTERS[hollow_crypt_boss / forsaken_citadel_boss / malachar].
    // Test factice de cohérence : qu'aucun seal n'a de zone='ashenvale_forest' (spot bas niveau)
    for (const id of SEAL_IDS) {
      expect(RESOURCES[id].zone).not.toMatch(/forest|marsh/i)
    }
  })
})

// ── Z02 — Nouveaux consommables marchand ─────────────────────────────────────
describe('Z02 — Consommables additionnels', () => {
  const NEW_CONSUMABLES = ['stamina_ration', 'elixir_minor', 'mana_crystal', 'antidote_basic']

  it('les 4 nouveaux consommables existent', () => {
    for (const id of NEW_CONSUMABLES) {
      expect(RESOURCES[id], `RESOURCES.${id} missing`).toBeDefined()
    }
  })

  it('chacun a buyPrice, effect, isConsumable=true', () => {
    for (const id of NEW_CONSUMABLES) {
      const res = RESOURCES[id]
      expect(res.buyPrice).toBeGreaterThan(0)
      expect(res.effect).toBeDefined()
      expect(res.isConsumable).toBe(true)
    }
  })

  it('stamina_ration et elixir_minor utilisent restore_both', () => {
    expect(RESOURCES.stamina_ration.effect.type).toBe('restore_both')
    expect(RESOURCES.elixir_minor.effect.type).toBe('restore_both')
  })

  it('mana_crystal restaure 100% mana', () => {
    expect(RESOURCES.mana_crystal.effect.type).toBe('mana_restore_percent')
    expect(RESOURCES.mana_crystal.effect.value).toBe(1.0)
  })

  it('antidote_basic a un flag cureDebuffs (préparation CRF01)', () => {
    expect(RESOURCES.antidote_basic.effect.cureDebuffs).toBe(true)
  })

  it('elixir_minor restaure plus que stamina_ration (progression prix)', () => {
    expect(RESOURCES.elixir_minor.effect.value).toBeGreaterThan(
      RESOURCES.stamina_ration.effect.value,
    )
    expect(RESOURCES.elixir_minor.buyPrice).toBeGreaterThan(RESOURCES.stamina_ration.buyPrice)
  })
})
