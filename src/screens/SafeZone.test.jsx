// SafeZone — village parchemin + dialogue PNJ (IMM01)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'millhaven', currentHuntingSpot: null },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('SafeZone — village', () => {
  it('affiche le nom du village et ses bâtiments', () => {
    render(<SafeZone />)
    expect(screen.getByText('Millhaven')).toBeInTheDocument()
    expect(screen.getAllByText(/The Hearth Inn/).length).toBeGreaterThanOrEqual(1)
  })

  it('clic sur un bâtiment ouvre le dialogue PNJ (Marta)', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(screen.getByText(/Rest at the Inn/)).toBeInTheDocument()
  })
})

describe('SafeZone — IMM01 actions inline', () => {
  it('"Rest at the Inn" exécute le repos en place (pas de 2e fenêtre) et avance le jour', () => {
    render(<SafeZone />)
    const dayBefore = useGameStore.getState().world.dayCount

    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    fireEvent.click(screen.getByText(/Rest at the Inn/))

    // jour avancé + HP/MP restaurés (sleep)
    expect(useGameStore.getState().world.dayCount).toBe(dayBefore + 1)
    // feedback affiché dans le dialogue, pas de modale .lb-modal
    expect(screen.getByText(/You rest by the hearth/)).toBeInTheDocument()
    expect(document.querySelector('.lb-modal')).toBeNull()
  })

  it('"Leave" ferme le dialogue PNJ', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    expect(screen.getByText('Marta')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Leave/))
    expect(screen.queryByText('Marta')).toBeNull()
  })
})
