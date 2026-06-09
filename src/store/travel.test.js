// TRV01/TRV03 — Tests de l'action de voyage (store)
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('TRV — travelTo', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('currentNode vaut ironhaven par défaut', () => {
    expect(useGameStore.getState().world.currentNode).toBe('ironhaven')
  })

  it('déplace currentNode et avance le temps de 3 tics', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, tickCount: 5, dayCount: 1, currentNode: 'ironhaven' } }))
    useGameStore.getState().travelTo('millhaven')
    const w = useGameStore.getState().world
    expect(w.currentNode).toBe('millhaven')
    expect(w.tickCount).toBe(8)
    expect(w.dayCount).toBe(1)
  })

  it('gère le rollover de jour (>24 tics)', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, tickCount: 23, dayCount: 2 } }))
    useGameStore.getState().travelTo('thornmarsh')
    const w = useGameStore.getState().world
    expect(w.tickCount).toBe(2) // 23 + 3 = 26 → 26 % 24
    expect(w.dayCount).toBe(3) // + floor(26 / 24)
  })

  it('ne crédite PAS de kills/gold (pas d\'idle pendant le voyage)', () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, tickCount: 0, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
    }))
    const goldBefore = useGameStore.getState().hero.inventory.gold
    const killsBefore = Object.values(useGameStore.getState().world.monsterKillCounts).reduce((a, b) => a + b, 0)

    useGameStore.getState().travelTo('millhaven')

    expect(useGameStore.getState().hero.inventory.gold).toBe(goldBefore)
    const killsAfter = Object.values(useGameStore.getState().world.monsterKillCounts).reduce((a, b) => a + b, 0)
    expect(killsAfter).toBe(killsBefore)
  })

  it('le coût en tics est paramétrable', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, tickCount: 0 } }))
    useGameStore.getState().travelTo('millhaven', 5)
    expect(useGameStore.getState().world.tickCount).toBe(5)
  })
})
