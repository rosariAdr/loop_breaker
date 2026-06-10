// Q09 — Tests des récompenses de quête variées (équipement / ressources / stat)
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { QUESTS } from '../data/quests'

const runQuest = (reward) => {
  QUESTS.__q09_test = { id: '__q09_test', name: 'Q09 Test', objectives: [], reward }
  useGameStore.setState((s) => ({
    world: { ...s.world, activeQuests: ['__q09_test'], completedQuests: [] },
  }))
  useGameStore.getState().completeQuest('__q09_test')
  delete QUESTS.__q09_test
}

describe('Q09 — récompenses de quête variées', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it("équipement → ajouté à l'inventaire + badge loot", () => {
    runQuest({ equipment: { templateId: 'iron_sword', rarity: 'common' } })
    expect(useGameStore.getState().hero.inventory.equipment.length).toBe(1)
    expect(useGameStore.getState().unseenLoot).toBe(true)
  })

  it('ressources → ajoutées au sac', () => {
    runQuest({ resources: { wolf_pelt: 3 } })
    expect(useGameStore.getState().hero.inventory.resources.wolf_pelt).toBe(3)
  })

  it('stat → applique le boost à la stat courante', () => {
    const before = useGameStore.getState().hero.stats.strength
    runQuest({ stat: { name: 'strength', amount: 5 } })
    expect(useGameStore.getState().hero.stats.strength).toBe(before + 5)
  })

  it('rétro-compat : gold + tokens toujours crédités', () => {
    const gBefore = useGameStore.getState().hero.inventory.gold
    const tBefore = useGameStore.getState().hero.reputationTokens
    runQuest({ gold: 50, reputationTokens: 2 })
    expect(useGameStore.getState().hero.inventory.gold).toBe(gBefore + 50)
    expect(useGameStore.getState().hero.reputationTokens).toBe(tBefore + 2)
  })

  it('quête marquée complétée', () => {
    runQuest({ gold: 10 })
    expect(useGameStore.getState().world.completedQuests).toContain('__q09_test')
  })
})
