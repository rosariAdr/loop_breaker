// ACH01 — Tests du système d'accomplissements.
import { describe, it, expect, beforeEach } from 'vitest'
import { ACHIEVEMENTS, getAchievementStats, newlyUnlocked, getClosestAchievement } from './achievements'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('ACH01 — helpers', () => {
  it('getAchievementStats agrège les compteurs', () => {
    const stats = getAchievementStats({
      world: { monsterKillCounts: { a: 3, b: 2 }, completedQuests: ['q1'], dayCount: 7 },
      hero: { runNumber: 2 },
      meta: { demonLordKills: { medieval_fantasy: 1 }, totalDeaths: 4 },
    })
    expect(stats.totalKills).toBe(5)
    expect(stats.questsCompleted).toBe(1)
    expect(stats.daysSurvived).toBe(7)
    expect(stats.runs).toBe(2)
    expect(stats.demonLordKills).toBe(1)
    expect(stats.deaths).toBe(4)
  })

  it('newlyUnlocked = conditions remplies non encore débloquées', () => {
    const state = { world: { monsterKillCounts: { a: 1 } }, hero: { runNumber: 1 }, meta: { achievements: [] } }
    const newly = newlyUnlocked(state)
    expect(newly.map((a) => a.id)).toContain('first_blood')
    // déjà débloqué → exclu
    const state2 = { ...state, meta: { achievements: ['first_blood'] } }
    expect(newlyUnlocked(state2).map((a) => a.id)).not.toContain('first_blood')
  })

  it('getClosestAchievement = celui dont on est le plus proche', () => {
    const state = { world: { monsterKillCounts: { a: 40 } }, hero: { runNumber: 1 }, meta: { achievements: ['first_blood'] } }
    const closest = getClosestAchievement(state)
    // 40/50 (monster_hunter) = 0.8 → le plus proche
    expect(closest.id).toBe('monster_hunter')
    expect(closest.current).toBe(40)
    expect(closest.pct).toBeCloseTo(0.8)
  })
})

describe('ACH01 — checkAchievements (store)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('débloque First Blood au 1er kill + applique le bonus de stat permanent', () => {
    const base = store().hero.stats.strength
    useGameStore.setState((s) => ({ world: { ...s.world, monsterKillCounts: { ashwood_wolf: 1 } } }))
    store().checkAchievements()
    expect(store().meta.achievements).toContain('first_blood')
    expect(store().hero.stats.strength).toBe(base + 1)
    expect(store().meta.permanentStatBoosts.strength).toBe(1)
  })

  it('ne re-débloque pas un accomplissement déjà obtenu', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, monsterKillCounts: { ashwood_wolf: 1 } } }))
    store().checkAchievements()
    const str1 = store().hero.stats.strength
    store().checkAchievements() // 2e appel
    expect(store().hero.stats.strength).toBe(str1) // pas de double bonus
    expect(store().meta.achievements.filter((a) => a === 'first_blood')).toHaveLength(1)
  })

  it('demon_slayer débloqué après un demon lord kill', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, demonLordKills: { medieval_fantasy: 1 } } }))
    store().checkAchievements()
    expect(store().meta.achievements).toContain('demon_slayer')
  })
})
