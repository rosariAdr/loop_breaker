// WorldMap — TRV01 : clic node = entrer (courant) / voyager (adjacent) / bloqué
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import WorldMap from './WorldMap'
import { useGameStore } from '../store/gameStore'

const clickNode = (name) => {
  const node = screen.getByText(name).closest('.wm-node')
  fireEvent.click(node)
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'world_map',
    world: { ...s.world, currentNode: 'ironhaven', tickCount: 0 },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('WorldMap — TRV01 déplacement', () => {
  it('clic sur un node adjacent → voyage (+3 tics, currentNode maj, reste sur la carte)', () => {
    render(<WorldMap />)
    clickNode('Millhaven') // adjacent à Ironhaven
    const st = useGameStore.getState()
    expect(st.world.currentNode).toBe('millhaven')
    expect(st.world.tickCount).toBe(3)
    expect(st.currentScreen).toBe('world_map') // on n'entre PAS dans la zone
  })

  it('clic sur un node non adjacent → bloqué (aucun voyage)', () => {
    render(<WorldMap />)
    clickNode('Greywatch') // non adjacent à Ironhaven
    const st = useGameStore.getState()
    expect(st.world.currentNode).toBe('ironhaven')
    expect(st.world.tickCount).toBe(0)
  })

  it('clic sur le node courant → entre dans la zone', () => {
    render(<WorldMap />)
    clickNode('Ironhaven') // node courant (ville)
    expect(useGameStore.getState().currentScreen).toBe('safe_zone')
  })
})
