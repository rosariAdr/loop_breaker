// Q04 (visit) / Q05 (craft) — nouveaux types d'objectifs de quête.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { QUESTS } from '../data/quests'

const store = () => useGameStore.getState()

describe("Q04 — quêtes d'exploration (visit)", () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('complétée quand le spot ciblé a été visité', () => {
    QUESTS.__visit_test = {
      id: '__visit_test',
      name: 'Explore',
      objectives: [{ id: 'v', type: 'visit', spotId: 'thornmarsh', label: 'Visit the Thornmarsh' }],
      reward: {},
    }
    expect(store().isQuestComplete('__visit_test')).toBe(false)
    store().recordVisit('thornmarsh')
    expect(store().isQuestComplete('__visit_test')).toBe(true)
    delete QUESTS.__visit_test
  })

  it('recordVisit déduplique', () => {
    store().recordVisit('thornmarsh')
    store().recordVisit('thornmarsh')
    expect(store().world.visitedSpots.filter((s) => s === 'thornmarsh')).toHaveLength(1)
  })
})

describe('Q05 — quêtes de craft', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('complétée quand assez de crafts effectués', () => {
    QUESTS.__craft_test = {
      id: '__craft_test',
      name: 'Artisan',
      objectives: [{ id: 'c', type: 'craft', count: 2, label: 'Craft 2 items' }],
      reward: {},
    }
    expect(store().isQuestComplete('__craft_test')).toBe(false)
    store().incrementCraftCount()
    expect(store().isQuestComplete('__craft_test')).toBe(false)
    store().incrementCraftCount()
    expect(store().isQuestComplete('__craft_test')).toBe(true)
    delete QUESTS.__craft_test
  })
})
