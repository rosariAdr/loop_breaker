import { describe, it, expect } from 'vitest'
import { RANK_TIERS, getRankInfo, nextRankLabel } from './ranks'

describe('nextRankLabel', () => {
  it('returns the next tier label for a mid-ladder tier', () => {
    // gold is idx 5, next is platinum (idx 6)
    expect(nextRankLabel('gold')).toBe('Platinum')
  })

  it('returns the next tier label for the first tier', () => {
    // aluminium is idx 0, next is iron (idx 1)
    expect(nextRankLabel('aluminium')).toBe('Iron')
  })

  it('returns the next tier label for the second-to-last tier', () => {
    // diamond is idx 8, next is supreme (idx 9)
    expect(nextRankLabel('diamond')).toBe('Supreme')
  })

  it("returns '???' for the top tier id (no next tier)", () => {
    expect(nextRankLabel('supreme')).toBe('???')
  })

  it('returns the FIRST tier label for an UNKNOWN id (findIndex -1 → index 0)', () => {
    // unknown → findIndex returns -1, idx+1 = 0 → RANK_TIERS[0].label
    expect(nextRankLabel('this-id-does-not-exist')).toBe('Aluminium')
    expect(nextRankLabel('this-id-does-not-exist')).toBe(RANK_TIERS[0].label)
  })

  it('returns the FIRST tier label for undefined/null id (findIndex -1)', () => {
    expect(nextRankLabel(undefined)).toBe('Aluminium')
    expect(nextRankLabel(null)).toBe('Aluminium')
  })

  it('walks the whole ladder consistently', () => {
    for (let i = 0; i < RANK_TIERS.length - 1; i++) {
      expect(nextRankLabel(RANK_TIERS[i].id)).toBe(RANK_TIERS[i + 1].label)
    }
    // last tier → '???'
    expect(nextRankLabel(RANK_TIERS[RANK_TIERS.length - 1].id)).toBe('???')
  })
})

describe('getRankInfo', () => {
  it('points 0 → first tier, isMax false', () => {
    const info = getRankInfo(0)
    expect(info.tier).toBe('aluminium')
    expect(info.label).toBe('Aluminium')
    expect(info.color).toBe('#b8b8c0')
    expect(info.isMax).toBe(false)
    expect(info.pointsInTier).toBe(0)
    expect(info.pointsNeededInTier).toBe(10)
    expect(info.pctToNext).toBe(0)
  })

  it('negative points clamp to first tier', () => {
    const info = getRankInfo(-500)
    expect(info.tier).toBe('aluminium')
    expect(info.isMax).toBe(false)
    // clamped to 0: pointsInTier = 0 - 0 = 0
    expect(info.pointsInTier).toBe(0)
    expect(info.pctToNext).toBe(0)
  })

  it('null/undefined points treated as 0 → first tier', () => {
    const nullInfo = getRankInfo(null)
    expect(nullInfo.tier).toBe('aluminium')
    expect(nullInfo.pointsInTier).toBe(0)
    expect(nullInfo.pctToNext).toBe(0)

    const undefInfo = getRankInfo(undefined)
    expect(undefInfo.tier).toBe('aluminium')
    expect(undefInfo.pointsInTier).toBe(0)
    expect(undefInfo.pctToNext).toBe(0)
  })

  it('points at the exact top threshold → isMax true, no div-by-zero', () => {
    const info = getRankInfo(350)
    expect(info.tier).toBe('supreme')
    expect(info.label).toBe('Supreme')
    expect(info.isMax).toBe(true)
    expect(info.pointsNeededInTier).toBe(0)
    // pctToNext is forced to 1 when isMax (avoids 0/0 = NaN)
    expect(info.pctToNext).toBe(1)
    expect(Number.isNaN(info.pctToNext)).toBe(false)
    // pointsInTier = 350 - 350 = 0
    expect(info.pointsInTier).toBe(0)
  })

  it('enormous points → isMax true with pctToNext = 1', () => {
    const info = getRankInfo(1e9)
    expect(info.tier).toBe('supreme')
    expect(info.isMax).toBe(true)
    expect(info.pointsNeededInTier).toBe(0)
    expect(info.pctToNext).toBe(1)
    expect(Number.isNaN(info.pctToNext)).toBe(false)
    expect(info.pointsInTier).toBe(1e9 - 350)
  })

  it('mid value → pointsInTier + pointsNeededInTier + pctToNext consistent', () => {
    // 80 falls in orichalcum (threshold 70, nextAt 100)
    const info = getRankInfo(80)
    expect(info.tier).toBe('orichalcum')
    expect(info.label).toBe('Orichalcum')
    expect(info.isMax).toBe(false)
    expect(info.pointsInTier).toBe(80 - 70) // 10
    expect(info.pointsNeededInTier).toBe(100 - 70) // 30
    expect(info.pctToNext).toBeCloseTo(10 / 30)
    // pct is a valid ratio in [0, 1]
    expect(info.pctToNext).toBeGreaterThanOrEqual(0)
    expect(info.pctToNext).toBeLessThanOrEqual(1)
    // internal consistency: pointsInTier / pointsNeededInTier === pctToNext
    expect(info.pointsInTier / info.pointsNeededInTier).toBe(info.pctToNext)
  })

  it('value exactly on a mid threshold picks that tier with pctToNext 0', () => {
    // 100 is exactly gold's threshold
    const info = getRankInfo(100)
    expect(info.tier).toBe('gold')
    expect(info.isMax).toBe(false)
    expect(info.pointsInTier).toBe(0)
    expect(info.pointsNeededInTier).toBe(140 - 100) // 40
    expect(info.pctToNext).toBe(0)
  })

  it('value one below a threshold stays in the lower tier near full pct', () => {
    // 9 is still in aluminium (threshold 0, nextAt 10)
    const info = getRankInfo(9)
    expect(info.tier).toBe('aluminium')
    expect(info.pointsInTier).toBe(9)
    expect(info.pointsNeededInTier).toBe(10)
    expect(info.pctToNext).toBeCloseTo(0.9)
    expect(info.pctToNext).toBeLessThan(1)
  })

  it('exposes retro-compat aliases equal to the point fields', () => {
    const info = getRankInfo(80)
    expect(info.tokensInTier).toBe(info.pointsInTier)
    expect(info.tokensNeededInTier).toBe(info.pointsNeededInTier)
  })

  it('retro-compat aliases hold at the max tier too', () => {
    const info = getRankInfo(1000)
    expect(info.isMax).toBe(true)
    expect(info.tokensInTier).toBe(info.pointsInTier)
    expect(info.tokensNeededInTier).toBe(info.pointsNeededInTier)
    expect(info.tokensNeededInTier).toBe(0)
  })

  it('pctToNext is always within [0, 1] and never NaN across the whole ladder', () => {
    const samples = [-100, 0, 5, 10, 24, 25, 44, 69, 99, 139, 189, 259, 349, 350, 5000]
    for (const s of samples) {
      const info = getRankInfo(s)
      expect(Number.isNaN(info.pctToNext)).toBe(false)
      expect(info.pctToNext).toBeGreaterThanOrEqual(0)
      expect(info.pctToNext).toBeLessThanOrEqual(1)
    }
  })

  it('selects the correct tier for a value just at each threshold boundary', () => {
    for (const tier of RANK_TIERS) {
      const info = getRankInfo(tier.threshold)
      expect(info.tier).toBe(tier.id)
      expect(info.label).toBe(tier.label)
    }
  })
})
