// SKL-PASS — Tests des modificateurs de passifs.
import { describe, it, expect } from 'vitest'
import { getPassiveModifiers, MAX_DAMAGE_REDUCTION, PASSIVE_XP_PER_HIT } from './passives'

describe('getPassiveModifiers', () => {
  it('liste vide → 0', () => {
    expect(getPassiveModifiers([])).toEqual({ maxHpBonus: 0, damageReduction: 0 })
    expect(getPassiveModifiers()).toEqual({ maxHpBonus: 0, damageReduction: 0 })
  })

  it("Veteran's Resolve (maxHpBonus) — lv1 = 0.20, lv3 = 0.40", () => {
    expect(getPassiveModifiers([{ skillId: 'veterans_resolve', level: 1 }]).maxHpBonus).toBeCloseTo(0.20)
    expect(getPassiveModifiers([{ skillId: 'veterans_resolve', level: 3 }]).maxHpBonus).toBeCloseTo(0.40)
  })

  it('Stone Skin (damageReduction) — lv1 = 0.10, lv3 = 0.26', () => {
    expect(getPassiveModifiers([{ skillId: 'stone_skin', level: 1 }]).damageReduction).toBeCloseTo(0.10)
    expect(getPassiveModifiers([{ skillId: 'stone_skin', level: 3 }]).damageReduction).toBeCloseTo(0.26)
  })

  it('nouveaux passifs MON01 (stoneskin / thick_hide / mossy_hide)', () => {
    expect(getPassiveModifiers([{ skillId: 'stoneskin', level: 1 }]).damageReduction).toBeCloseTo(0.12)
    expect(getPassiveModifiers([{ skillId: 'thick_hide', level: 1 }]).damageReduction).toBeCloseTo(0.08)
    expect(getPassiveModifiers([{ skillId: 'mossy_hide', level: 1 }]).maxHpBonus).toBeCloseTo(0.12)
  })

  it('cumul de plusieurs passifs', () => {
    const mods = getPassiveModifiers([
      { skillId: 'veterans_resolve', level: 1 }, // maxHp 0.20
      { skillId: 'stone_skin', level: 1 },        // dr 0.10
      { skillId: 'thick_hide', level: 1 },        // dr 0.08
    ])
    expect(mods.maxHpBonus).toBeCloseTo(0.20)
    expect(mods.damageReduction).toBeCloseTo(0.18)
  })

  it('réduction de dégâts plafonnée à MAX_DAMAGE_REDUCTION', () => {
    const mods = getPassiveModifiers([
      { skillId: 'stone_skin', level: 3 },   // 0.26
      { skillId: 'stoneskin', level: 3 },    // 0.24
      { skillId: 'thick_hide', level: 3 },   // 0.20
      { skillId: 'caustic_coat', level: 3 }, // 0.17
    ])
    expect(mods.damageReduction).toBe(MAX_DAMAGE_REDUCTION)
  })

  it('ignore les ids inconnus / les skills actifs', () => {
    expect(getPassiveModifiers([{ skillId: 'nope', level: 1 }])).toEqual({ maxHpBonus: 0, damageReduction: 0 })
    expect(getPassiveModifiers([{ skillId: 'savage_bite', level: 1 }])).toEqual({ maxHpBonus: 0, damageReduction: 0 })
  })

  it('PASSIVE_XP_PER_HIT exporté', () => {
    expect(PASSIVE_XP_PER_HIT).toBeGreaterThan(0)
  })
})
