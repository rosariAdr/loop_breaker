// IDLE-OFF — Tests d'intégration store (applyOfflineProgress / clearOfflineSummary)
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { IDLE_TICK_MS } from '../engine/offlineProgress'

describe('IDLE-OFF — applyOfflineProgress (store)', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('crédite gold + kills + récap quand l\'idle était actif', () => {
    const now = 1_000_000
    useGameStore.setState((s) => ({
      world: { ...s.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      meta: { ...s.meta, lastSeen: now - 100 * IDLE_TICK_MS },
    }))
    const goldBefore = useGameStore.getState().hero.inventory.gold
    const killsBefore = useGameStore.getState().world.monsterKillCounts.ashwood_wolf || 0

    useGameStore.getState().applyOfflineProgress(now)

    const st = useGameStore.getState()
    expect(st.hero.inventory.gold).toBeGreaterThan(goldBefore)
    expect(st.world.monsterKillCounts.ashwood_wolf).toBe(killsBefore + 100)
    expect(st.meta.offlineSummary).toBeTruthy()
    expect(st.meta.offlineSummary.kills).toBe(100)
    expect(st.meta.offlineSummary.monsterName).toBe('Ashwood Wolf')
  })

  it('met à jour lastSeen pour éviter le double-comptage', () => {
    const now = 2_000_000
    useGameStore.setState((s) => ({
      world: { ...s.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      meta: { ...s.meta, lastSeen: now - 50 * IDLE_TICK_MS },
    }))
    useGameStore.getState().applyOfflineProgress(now)
    expect(useGameStore.getState().meta.lastSeen).toBe(now)
    // un 2e appel immédiat ne crédite plus rien
    const killsAfter1 = useGameStore.getState().world.monsterKillCounts.ashwood_wolf
    useGameStore.getState().applyOfflineProgress(now)
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(killsAfter1)
  })

  it('no-op si l\'idle n\'était pas actif', () => {
    const now = 1_000_000
    useGameStore.setState((s) => ({
      world: { ...s.world, isIdleActive: false },
      meta: { ...s.meta, lastSeen: now - 100 * IDLE_TICK_MS },
    }))
    useGameStore.getState().applyOfflineProgress(now)
    expect(useGameStore.getState().meta.offlineSummary).toBeNull()
  })

  it('clearOfflineSummary efface le récap', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, offlineSummary: { kills: 5 } } }))
    useGameStore.getState().clearOfflineSummary()
    expect(useGameStore.getState().meta.offlineSummary).toBeNull()
  })
})
