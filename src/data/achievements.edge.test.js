// ACH01 / META-ACHIEVE02 — edge & branch coverage for
// getAchievementStats (defaults + countCompleteSets), newlyUnlocked (no-meta),
// getClosestAchievement (no-meta, all-earned, current/pct clamping).
// Targets uncovered branches at achievements.js lines 145, 154-163.
import { describe, it, expect } from 'vitest'
import {
  ACHIEVEMENTS,
  getAchievementStats,
  newlyUnlocked,
  getClosestAchievement,
} from './achievements'

const ALL_IDS = Object.keys(ACHIEVEMENTS)

describe('getAchievementStats — numeric defaults on empty/minimal state', () => {
  it('getAchievementStats({}) returns numeric defaults for every metric (no throw)', () => {
    const s = getAchievementStats({})
    expect(s.totalKills).toBe(0)
    expect(s.questsCompleted).toBe(0)
    expect(s.daysSurvived).toBe(1) // dayCount ?? 1
    expect(s.runs).toBe(1) // runNumber ?? 1
    expect(s.demonLordKills).toBe(0)
    expect(s.deaths).toBe(0)
    expect(s.completeSets).toBe(0)
    // Every metric must be a finite number.
    for (const v of Object.values(s)) {
      expect(typeof v).toBe('number')
      expect(Number.isFinite(v)).toBe(true)
    }
  })

  it('getAchievementStats with a minimal-but-present state returns numbers', () => {
    const s = getAchievementStats({ world: {}, meta: {}, hero: {} })
    expect(s).toMatchObject({
      totalKills: 0,
      questsCompleted: 0,
      daysSurvived: 1,
      runs: 1,
      demonLordKills: 0,
      deaths: 0,
      completeSets: 0,
    })
  })

  it('sums monsterKillCounts and demonLordKills object into totals', () => {
    const s = getAchievementStats({
      world: {
        monsterKillCounts: { goblin: 3, orc: 7 },
        completedQuests: ['q1', 'q2'],
        dayCount: 12,
      },
      meta: { demonLordKills: { a: 2, b: 4 }, totalDeaths: 5 },
      hero: { runNumber: 4 },
    })
    expect(s.totalKills).toBe(10)
    expect(s.questsCompleted).toBe(2)
    expect(s.daysSurvived).toBe(12)
    expect(s.runs).toBe(4)
    expect(s.demonLordKills).toBe(6) // object → summed
    expect(s.deaths).toBe(5)
  })

  it('treats a numeric demonLordKills directly (non-object branch)', () => {
    const s = getAchievementStats({ meta: { demonLordKills: 7 } })
    expect(s.demonLordKills).toBe(7)
  })
})

describe('countCompleteSets via equipped — set edge cases', () => {
  it('no equipped / empty → 0', () => {
    expect(getAchievementStats({ hero: {} }).completeSets).toBe(0)
    expect(getAchievementStats({ hero: { equipped: {} } }).completeSets).toBe(0)
  })

  it('exactly 2 pieces of a set → 0 (below the ≥3 threshold)', () => {
    const s = getAchievementStats({
      hero: { equipped: { a: { set: 'iron' }, b: { set: 'iron' } } },
    })
    expect(s.completeSets).toBe(0)
  })

  it('exactly 3 pieces of a set → 1', () => {
    const s = getAchievementStats({
      hero: {
        equipped: { a: { set: 'iron' }, b: { set: 'iron' }, c: { set: 'iron' } },
      },
    })
    expect(s.completeSets).toBe(1)
  })

  it('mixed sets: one complete (≥3), one incomplete (2), and set-less items ignored', () => {
    const s = getAchievementStats({
      hero: {
        equipped: {
          a: { set: 'iron' },
          b: { set: 'iron' },
          c: { set: 'iron' }, // iron = 3 → counts
          d: { set: 'gold' },
          e: { set: 'gold' }, // gold = 2 → does not count
          f: {}, // no set → ignored
          g: null, // nullish item → ignored (item?.set)
        },
      },
    })
    expect(s.completeSets).toBe(1)
  })

  it('two full sets → 2', () => {
    const s = getAchievementStats({
      hero: {
        equipped: {
          a: { set: 'iron' },
          b: { set: 'iron' },
          c: { set: 'iron' },
          d: { set: 'gold' },
          e: { set: 'gold' },
          f: { set: 'gold' },
        },
      },
    })
    expect(s.completeSets).toBe(2)
  })
})

describe('newlyUnlocked — no-meta default branch (line 145)', () => {
  it('state with NO meta still works (have ?? []) — returns metrics ≥ target', () => {
    // No meta key at all → `state.meta?.achievements ?? []` → []
    const state = { world: { monsterKillCounts: { x: 1 } }, hero: {} }
    const ids = newlyUnlocked(state).map((a) => a.id)
    expect(ids).toContain('first_blood') // totalKills 1 >= 1
    // Nothing else should qualify at 1 kill / day 1 / run 1.
    expect(ids).not.toContain('monster_hunter')
    expect(ids).not.toContain('survivor')
  })

  it('completely empty state ({}) → returns [] (no metric meets target)', () => {
    expect(newlyUnlocked({})).toEqual([])
  })

  it('returns only achievements whose metric ≥ target and not already earned', () => {
    const state = {
      world: { monsterKillCounts: { x: 50 } }, // first_blood + monster_hunter
      meta: { achievements: ['first_blood'] }, // already earned → excluded
      hero: {},
    }
    const ids = newlyUnlocked(state).map((a) => a.id)
    expect(ids).toContain('monster_hunter') // 50 >= 50, not earned
    expect(ids).not.toContain('first_blood') // already earned → excluded
    expect(ids).not.toContain('exterminator') // 50 < 250
  })

  it('an achievement exactly at target is unlocked (boundary ≥)', () => {
    const state = {
      world: { dayCount: 15 }, // survivor target 15
      meta: { achievements: [] },
      hero: {},
    }
    expect(newlyUnlocked(state).map((a) => a.id)).toContain('survivor')
  })

  it('everything already earned → returns []', () => {
    const state = {
      world: {
        monsterKillCounts: { x: 100000 },
        completedQuests: Array(100).fill('q'),
        dayCount: 999,
      },
      meta: { achievements: [...ALL_IDS], totalDeaths: 999, demonLordKills: 999 },
      hero: { runNumber: 999, equipped: { a: { set: 's' }, b: { set: 's' }, c: { set: 's' } } },
    }
    expect(newlyUnlocked(state)).toEqual([])
  })
})

describe('getClosestAchievement — no-meta, all-earned, clamping (lines 154-163)', () => {
  it('state with NO meta → have defaults to [] and a pending is returned', () => {
    const state = { world: {}, hero: {} }
    const closest = getClosestAchievement(state)
    expect(closest).not.toBeNull()
    expect(ALL_IDS).toContain(closest.id)
  })

  it('returns the pending achievement with the HIGHEST pct', () => {
    // Drive daysSurvived toward survivor (target 15): 14/15 ≈ 0.933 pct,
    // higher than any 0/target metric (0) and higher than first_blood if 0 kills.
    const state = {
      world: { dayCount: 14 }, // survivor 14/15
      meta: { achievements: [] },
      hero: {},
    }
    const closest = getClosestAchievement(state)
    expect(closest.id).toBe('survivor')
    expect(closest.pct).toBeCloseTo(14 / 15, 5)
    expect(closest.current).toBe(14)
  })

  it('current is clamped to target and pct clamped to 1 when metric exceeds target', () => {
    // 40 kills exceeds first_blood (1) and monster_hunter (50 not reached).
    // Overshoot first_blood: current clamps to 1, pct clamps to 1.
    const state = {
      world: { monsterKillCounts: { x: 40 } },
      meta: { achievements: [] },
      hero: {},
    }
    const closest = getClosestAchievement(state)
    // first_blood is fully satisfied (pct 1) → it's the closest (highest pct).
    expect(closest.id).toBe('first_blood')
    expect(closest.pct).toBe(1) // Math.min(1, 40/1) → clamped
    expect(closest.current).toBe(1) // Math.min(40, 1) → clamped to target
  })

  it('metric exactly at target → pct 1, current === target', () => {
    const state = {
      world: { monsterKillCounts: { x: 1 } },
      meta: { achievements: [] },
      hero: {},
    }
    const closest = getClosestAchievement(state)
    expect(closest.id).toBe('first_blood')
    expect(closest.pct).toBe(1)
    expect(closest.current).toBe(1)
  })

  it('when ALL achievements are earned → returns null', () => {
    const state = {
      world: {},
      meta: { achievements: [...ALL_IDS] },
      hero: {},
    }
    expect(getClosestAchievement(state)).toBeNull()
  })

  it('completely empty state ({}) → returns a pending achievement, current 0 for zero-progress metrics', () => {
    const closest = getClosestAchievement({})
    expect(closest).not.toBeNull()
    // All numeric-progress metrics default; pct must be within [0,1].
    expect(closest.pct).toBeGreaterThanOrEqual(0)
    expect(closest.pct).toBeLessThanOrEqual(1)
    // current never exceeds target.
    expect(closest.current).toBeLessThanOrEqual(closest.target)
  })

  it('pct is always within [0,1] and current within [0,target] for the returned entry', () => {
    const state = {
      world: { monsterKillCounts: { x: 9999 }, dayCount: 7, completedQuests: ['a', 'b', 'c'] },
      meta: { achievements: [], totalDeaths: 3 },
      hero: { runNumber: 2 },
    }
    const closest = getClosestAchievement(state)
    expect(closest.pct).toBeGreaterThanOrEqual(0)
    expect(closest.pct).toBeLessThanOrEqual(1)
    expect(closest.current).toBeGreaterThanOrEqual(0)
    expect(closest.current).toBeLessThanOrEqual(closest.target)
  })
})
