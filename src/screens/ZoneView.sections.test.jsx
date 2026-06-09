// ZoneView — sections de la zone principale (Dungeon / Demon Lord / Idle Log)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import ZoneView from './ZoneView'
import { useGameStore } from '../store/gameStore'
import { ZONES } from '../data/zones'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('ZoneView — sections', () => {
  it('affiche la section Dungeon sur la zone principale (pas un spot)', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: null } }))
    render(<ZoneView />)
    expect(screen.getByText('Dungeon')).toBeInTheDocument()
  })

  it('affiche la section Demon Lord si la zone en a une', () => {
    // Trouver une zone avec un demonLord
    const zoneId = Object.keys(ZONES).find((z) => ZONES[z].demonLord)
    expect(zoneId).toBeTruthy()
    useGameStore.setState((s) => ({ world: { ...s.world, currentZone: zoneId, currentHuntingSpot: null } }))
    render(<ZoneView />)
    expect(screen.getByText('Demon Lord')).toBeInTheDocument()
  })

  it('affiche le journal Idle', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' } }))
    render(<ZoneView />)
    expect(screen.getByText('Idle Log')).toBeInTheDocument()
  })
})
