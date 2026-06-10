// COV80 — interactions WorldMap (survol/tooltip, clic donjon, route maudite/QTE) pour
// couvrir les handlers onHover / onCrypt / enterBlighted / QTE.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import WorldMap from './WorldMap'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'world_map',
    world: { ...s.world, currentNode: 'ironhaven', tickCount: 0 },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('WorldMap — interactions (COV80)', () => {
  it('survol d’un node (mouseEnter/Leave) et clic du donjon ne crashent pas', () => {
    const { container } = render(<WorldMap />)
    const nodes = container.querySelectorAll('.wm-node')
    expect(nodes.length).toBeGreaterThan(0)
    fireEvent.mouseEnter(nodes[0])
    fireEvent.mouseLeave(nodes[0])
    // clic sur le donjon (marqueur « ? ») → découverte
    const dungeon = container.querySelector('.wm-node.dungeon')
    if (dungeon) fireEvent.click(dungeon)
    expect(container.querySelector('.wm-node')).not.toBeNull()
  })

  it('route maudite débloquée (niveau ≥ 3) : le chip est cliquable (couvre enterBlighted/QTE)', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, level: 5 } }))
    const { container } = render(<WorldMap />)
    const blighted = container.querySelector('.wm-blighted')
    expect(blighted).not.toBeNull()
    fireEvent.click(blighted) // → setQteOpen(true) : couvre le handler sans crash
    expect(container.querySelector('.wm-blighted')).not.toBeNull()
  })

  it('la légende UX-MAPCLARITY01 est présente', () => {
    render(<WorldMap />)
    expect(screen.getByTestId('wm-legend')).toBeInTheDocument()
  })
})
