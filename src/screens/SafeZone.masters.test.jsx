// MST04 — UI maître dans le panneau Académie (Ironhaven) : état d'engagement, scoping à
// la localité, grisage + tooltip des quêtes verrouillées, visibilité du seul maître engagé.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'

const openAcademy = () => {
  render(<SafeZone />)
  fireEvent.click(screen.getAllByText('Academy of Magic')[0]) // dialogue PNJ
  fireEvent.click(screen.getByText(/Enter the Academy/))
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'ironhaven', tickCount: 12 },
    hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 5000 } },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('MST04 — panneau Académie : état & scoping', () => {
  it('affiche « No master » tant qu’aucun maître n’est engagé', () => {
    openAcademy()
    expect(screen.getByTestId('master-state').textContent).toMatch(/No master/i)
  })

  it('scope aux maîtres d’Ironhaven : montre l’initiation de Vael ET de Bulgar, pas celle d’Aldric', () => {
    openAcademy()
    const board = screen.getByTestId('master-quests')
    expect(within(board).getByText(/The Archmagister’s Test/)).toBeTruthy() // Vael
    expect(within(board).getByText(/The Iron Pit/)).toBeTruthy() // Bulgar
    expect(within(board).queryByText(/The Knight’s Trial/)).toBeNull() // Aldric (Greywatch)
    expect(within(board).queryByText(/The Court Mage’s Wager/)).toBeNull() // Elyndra (Millhaven)
  })

  it('grise (🔒 + tooltip) les quêtes de skill tant que non initié', () => {
    openAcademy()
    const board = screen.getByTestId('master-quests')
    const locks = within(board).getAllByTestId('quest-locked')
    expect(locks.length).toBeGreaterThan(0)
    expect(locks[0].getAttribute('title')).toMatch(/initiation/i)
  })

  it('affiche « Master: … » et ne montre QUE le maître engagé une fois initié', () => {
    useGameStore.getState().setMaster('academy_master') // engagé chez Vael
    openAcademy()
    expect(screen.getByTestId('master-state').textContent).toMatch(/Master:.*Vael/)
    const board = screen.getByTestId('master-quests')
    // quêtes de Vael visibles, celles de Bulgar masquées
    expect(within(board).getByText(/Channel the Gust/)).toBeTruthy() // pool de Vael
    expect(within(board).queryByText(/No Retreat/)).toBeNull() // pool de Bulgar
    // plus aucune quête verrouillée (le pool de Vael est déverrouillé)
    expect(within(board).queryAllByTestId('quest-locked').length).toBe(0)
  })
})
