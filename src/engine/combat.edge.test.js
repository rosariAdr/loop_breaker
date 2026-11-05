import { describe, it, expect } from 'vitest'
import { calcHpPercent, calcExpGain, applyExpGain } from './combat'

describe('calcHpPercent', () => {
  it('reads maxHp from stats.maxHp for a normal ratio', () => {
    expect(calcHpPercent({ currentHp: 50, stats: { maxHp: 100 } })).toBe(0.5)
  })

  it('returns exactly 0.5 at exact half', () => {
    expect(calcHpPercent({ currentHp: 30, stats: { maxHp: 60 } })).toBe(0.5)
  })

  it('falls back to stats.hp when maxHp is absent', () => {
    expect(calcHpPercent({ currentHp: 25, stats: { hp: 100 } })).toBe(0.25)
  })

  it('prefers stats.maxHp over stats.hp when both present', () => {
    expect(calcHpPercent({ currentHp: 40, stats: { maxHp: 200, hp: 80 } })).toBe(0.2)
  })

  it('falls back to 1 when neither maxHp nor hp is present (empty stats)', () => {
    // maxHp resolves to 1 → currentHp/1 clamped to [0,1]
    expect(calcHpPercent({ currentHp: 1, stats: {} })).toBe(1)
    expect(calcHpPercent({ currentHp: 0.4, stats: {} })).toBe(0.4)
  })

  it('falls back to 1 when stats is undefined', () => {
    expect(calcHpPercent({ currentHp: 0.75 })).toBe(0.75)
    expect(calcHpPercent({ currentHp: 5 })).toBe(1)
  })

  it('clamps to 1 when currentHp exceeds maxHp', () => {
    expect(calcHpPercent({ currentHp: 150, stats: { maxHp: 100 } })).toBe(1)
  })

  it('clamps to 0 when currentHp is negative', () => {
    expect(calcHpPercent({ currentHp: -20, stats: { maxHp: 100 } })).toBe(0)
  })

  it('returns 0 at exactly zero HP', () => {
    expect(calcHpPercent({ currentHp: 0, stats: { maxHp: 100 } })).toBe(0)
  })

  it('returns 1 when currentHp equals maxHp', () => {
    expect(calcHpPercent({ currentHp: 100, stats: { maxHp: 100 } })).toBe(1)
  })
})

describe('calcExpGain', () => {
  it('sums expReward across enemies', () => {
    expect(calcExpGain([{ expReward: 10 }, { expReward: 8 }])).toBe(18)
  })

  it('treats an enemy missing expReward as 0', () => {
    expect(calcExpGain([{ expReward: 10 }, {}, { expReward: 5 }])).toBe(15)
  })

  it('treats undefined expReward as 0', () => {
    expect(calcExpGain([{ expReward: undefined }, { expReward: 7 }])).toBe(7)
  })

  it('returns 0 for an empty array', () => {
    expect(calcExpGain([])).toBe(0)
  })

  it('returns 0 when all enemies lack expReward', () => {
    expect(calcExpGain([{}, {}, {}])).toBe(0)
  })

  it('handles a single enemy', () => {
    expect(calcExpGain([{ expReward: 42 }])).toBe(42)
  })
})

describe('applyExpGain', () => {
  const heroStats = {
    maxHp: 100,
    maxMana: 50,
    strength: 20,
    intelligence: 30,
    def: 10,
  }

  it('no level-up path when newExp < expToNext', () => {
    const result = applyExpGain(heroStats, 10, 100, 20)
    expect(result).toEqual({ levelUp: false, newExp: 30, newExpToNext: 100 })
    expect(result.statBonuses).toBeUndefined()
  })

  it('no level-up with zero gain stays below threshold', () => {
    const result = applyExpGain(heroStats, 50, 100, 0)
    expect(result).toEqual({ levelUp: false, newExp: 50, newExpToNext: 100 })
  })

  it('levels up on the exact-equality boundary (newExp === expToNext)', () => {
    const result = applyExpGain(heroStats, 90, 100, 10)
    expect(result.levelUp).toBe(true)
    // overflow = 100 - 100 = 0
    expect(result.newExp).toBe(0)
    expect(result.newExpToNext).toBe(150) // Math.round(100 * 1.5)
    expect(result.statBonuses).toEqual({
      maxHp: 10, // round(100 * 0.1)
      maxMana: 5, // round(50 * 0.1)
      strength: 1, // round(20 * 0.05)
      intelligence: 2, // round(30 * 0.05) = round(1.5) = 2
      def: 1, // round(10 * 0.05) = round(0.5) = 1
    })
  })

  it('levels up with overflow when newExp > expToNext', () => {
    const result = applyExpGain(heroStats, 90, 100, 30)
    expect(result.levelUp).toBe(true)
    expect(result.newExp).toBe(20) // 120 - 100
    expect(result.newExpToNext).toBe(150)
    expect(result.statBonuses).toEqual({
      maxHp: 10,
      maxMana: 5,
      strength: 1,
      intelligence: 2,
      def: 1,
    })
  })

  it('rounds newExpToNext for a non-clean threshold', () => {
    // Math.round(101 * 1.5) = Math.round(151.5) = 152
    const result = applyExpGain(heroStats, 100, 101, 5)
    expect(result.levelUp).toBe(true)
    expect(result.newExpToNext).toBe(152)
  })

  it('rounds stat bonuses to nearest integer', () => {
    const oddStats = {
      maxHp: 155, // round(15.5) = 16
      maxMana: 45, // round(4.5) = 5
      strength: 33, // round(1.65) = 2
      intelligence: 27, // round(1.35) = 1
      def: 19, // round(0.95) = 1
    }
    const result = applyExpGain(oddStats, 0, 10, 10)
    expect(result.levelUp).toBe(true)
    expect(result.statBonuses).toEqual({
      maxHp: 16,
      maxMana: 5,
      strength: 2,
      intelligence: 1,
      def: 1,
    })
  })
})
