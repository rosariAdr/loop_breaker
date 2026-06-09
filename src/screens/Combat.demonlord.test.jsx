// DEMON-FIGHT — combat réel contre le Demon Lord (Malachar) + déclenchement de sa défaite.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import Combat from './Combat'
import { useGameStore } from '../store/gameStore'
import { generateEnemies } from '../engine/combat'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('DEMON-FIGHT', () => {
  it('generateEnemies(malachar) → un seul ennemi de rang demon_lord', () => {
    const enemies = generateEnemies('malachar', 'grimspire', 1)
    expect(enemies).toHaveLength(1)
    expect(enemies[0].rank).toBe('demon_lord')
    expect(enemies[0].monsterId).toBe('malachar')
  })

  it('victoire sur le Demon Lord → demonLordDefeated + bannière W03 + récompense W01 (+200 tokens)', async () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, strength: 9999, hp: 500, maxHp: 500 }, reputationTokens: 0 },
    }))
    // Malachar à 1 PV pour un one-shot déterministe (rang demon_lord conservé)
    useGameStore.getState().startCombat([{
      id: 'malachar_0', monsterId: 'malachar', name: 'Malachar the Undying',
      rank: 'demon_lord', stats: { hp: 1, atk: 5, def: 0, spd: 14 }, currentHp: 1, expReward: 5000,
    }])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    const st = useGameStore.getState()
    expect(st.world.demonLordDefeated).toBe(true)
    expect(st.meta.malacharDefeatedThisRun).toBe(true)
    expect(st.hero.reputationTokens).toBe(200) // W01
  })

  it('un combat normal (non demon_lord) ne marque PAS le Demon Lord vaincu', async () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, stats: { ...s.hero.stats, strength: 9999 } } }))
    useGameStore.getState().startCombat([{
      id: 'w0', monsterId: 'ashwood_wolf', name: 'Wolf',
      rank: 'common', stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1, expReward: 15,
    }])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    expect(useGameStore.getState().world.demonLordDefeated).toBe(false)
  })
})
