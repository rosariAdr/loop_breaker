// SKL-PASS — Tests d'intégration combat : effets des passifs + XP passif.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import Combat from './Combat'
import { useGameStore } from '../store/gameStore'
import { PASSIVE_XP_PER_HIT } from '../engine/passives'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('SKL-PASS — effets des passifs en combat', () => {
  it("Veteran's Resolve équipé → PV max +20% en combat (200 → 240)", () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        stats: { ...s.hero.stats, hp: 100, maxHp: 200 },
        passiveSkills: [{ skillId: 'veterans_resolve', level: 1, xp: 0 }],
      },
    }))
    useGameStore.getState().startCombat([{
      id: 'w0', monsterId: 'ashwood_wolf', name: 'Wolf',
      stats: { hp: 100, atk: 5, def: 4, spd: 10 }, currentHp: 100, rank: 'common', expReward: 15,
    }])
    render(<Combat />)
    // La barre HP affiche value/max → 100/240
    expect(screen.getByText('100/240')).toBeInTheDocument()
  })

  it('un passif équipé gagne de l\'XP à chaque coup encaissé', async () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        stats: { ...s.hero.stats, strength: 5, def: 0, hp: 500, maxHp: 500 },
        passiveSkills: [{ skillId: 'stone_skin', level: 1, xp: 0 }],
      },
    }))
    // Ennemi costaud (survit au coup du héros) et qui frappe fort (XP passif garanti)
    useGameStore.getState().startCombat([{
      id: 'w0', monsterId: 'ashwood_wolf', name: 'Wolf',
      stats: { hp: 500, atk: 30, def: 4, spd: 10 }, currentHp: 500, rank: 'common', expReward: 15,
    }])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(2500) // anim joueur + tour ennemi complet (le héros encaisse)
    })
    const passive = useGameStore.getState().hero.passiveSkills.find((p) => p.skillId === 'stone_skin')
    expect(passive.xp).toBeGreaterThanOrEqual(PASSIVE_XP_PER_HIT)
  })

  it('sans passif équipé → aucun gain d\'XP passif, combat normal', async () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, strength: 5, def: 0, hp: 500, maxHp: 500 }, passiveSkills: [] },
    }))
    useGameStore.getState().startCombat([{
      id: 'w0', monsterId: 'ashwood_wolf', name: 'Wolf',
      stats: { hp: 500, atk: 30, def: 4, spd: 10 }, currentHp: 500, rank: 'common', expReward: 15,
    }])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(2500)
    })
    expect(useGameStore.getState().hero.passiveSkills).toEqual([])
    expect(screen.getByText('Wolf')).toBeInTheDocument()
  })
})
