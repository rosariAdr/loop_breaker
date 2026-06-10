// T02 — Transition animée de transmigration entre la boutique et la renaissance.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GodsShop from './GodsShop'
import { useGameStore } from '../store/gameStore'

const seedPendingInheritance = () => {
  // Simule une mort + choix d'héritage → pendingInheritance posé, écran gods_shop
  useGameStore.setState((s) => ({
    meta: {
      ...s.meta,
      lastRunSummary: {
        stats: { strength: 12 },
        reputationTokens: 3,
        skills: [],
        level: 5,
        day: 4,
        zone: 'ashenvale',
        totalKills: 10,
        cause: 'test',
      },
      pendingInheritance: { stat: 'strength', activeSkill: null, passiveSkill: null, bonuses: [] },
    },
    currentScreen: 'gods_shop',
  }))
}

describe('T02 — écran de transition de renaissance', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
    seedPendingInheritance()
  })

  it('cliquer « Transmigrate → » affiche la transition animée sans encore renaître', () => {
    render(<GodsShop />)
    fireEvent.click(screen.getByText(/Transmigrate/))
    // overlay de transition présent
    expect(screen.getByTestId('rebirth-transition')).toBeInTheDocument()
    expect(screen.getByText('Reborn')).toBeInTheDocument()
    // la transmigration n'est PAS encore appliquée (toujours sur gods_shop)
    expect(useGameStore.getState().currentScreen).toBe('gods_shop')
  })

  it('affiche le numéro du prochain run', () => {
    const next = (useGameStore.getState().hero.runNumber ?? 0) + 1
    render(<GodsShop />)
    fireEvent.click(screen.getByText(/Transmigrate/))
    expect(screen.getByText(`Run ${next}`)).toBeInTheDocument()
  })

  it('« Begin Anew → » applique la transmigration et renvoie à world_map', () => {
    const runBefore = useGameStore.getState().hero.runNumber ?? 0
    render(<GodsShop />)
    fireEvent.click(screen.getByText(/Transmigrate/))
    fireEvent.click(screen.getByTestId('rebirth-continue'))
    const state = useGameStore.getState()
    expect(state.currentScreen).toBe('world_map')
    expect(state.meta.pendingInheritance).toBeNull()
    expect(state.hero.runNumber).toBe(runBefore + 1)
  })
})
