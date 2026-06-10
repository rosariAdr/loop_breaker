// WorldMap v1.1 — WM-LEVEL01 (niveau sous les noms de spots) + UX-MAPCLARITY01 (légende)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import WorldMap from './WorldMap'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'world_map',
    world: { ...s.world, currentNode: 'ironhaven' },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('WorldMap — WM-LEVEL01 (niveau sous les spots)', () => {
  it('affiche un sous-label « Lv X–Y » sous au moins un spot de chasse', () => {
    const { container } = render(<WorldMap />)
    const sub = container.querySelector('.wm-sub')
    expect(sub).not.toBeNull()
    expect(sub.textContent).toMatch(/Lv \d/)
  })
})

describe('WorldMap — UX-MAPCLARITY01 (légende)', () => {
  it('affiche la légende de la carte (verrouillé / fog / donjon)', () => {
    render(<WorldMap />)
    const legend = screen.getByTestId('wm-legend')
    expect(legend).toBeInTheDocument()
    expect(legend.textContent).toMatch(/Locked/)
    expect(legend.textContent).toMatch(/Fog/)
  })
})
