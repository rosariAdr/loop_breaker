// META-ACHIEVE02 — pool élargi + métrique completeSets.
import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS, getAchievementStats, newlyUnlocked } from './achievements'

describe('META-ACHIEVE02 — pool élargi', () => {
  it('contient les nouveaux succès proposés', () => {
    for (const id of [
      'slayer_supreme',
      'demon_lord_hunter',
      'long_hauler',
      'quest_legend',
      'set_collector',
    ]) {
      expect(ACHIEVEMENTS[id]).toBeDefined()
      expect(ACHIEVEMENTS[id].reward?.stat).toBeDefined()
    }
  })

  it('completeSets : compte les sets de ≥3 pièces équipées', () => {
    const three = {
      hero: { equipped: { a: { set: 'iron' }, b: { set: 'iron' }, c: { set: 'iron' } } },
    }
    expect(getAchievementStats(three).completeSets).toBe(1)
    const two = { hero: { equipped: { a: { set: 'iron' }, b: { set: 'iron' } } } }
    expect(getAchievementStats(two).completeSets).toBe(0)
    expect(getAchievementStats({}).completeSets).toBe(0)
  })

  it('newlyUnlocked débloque « Slayer Supreme » à 1000 kills', () => {
    const state = {
      world: { monsterKillCounts: { x: 1000 } },
      meta: { achievements: [] },
      hero: {},
    }
    expect(newlyUnlocked(state).map((a) => a.id)).toContain('slayer_supreme')
  })
})
