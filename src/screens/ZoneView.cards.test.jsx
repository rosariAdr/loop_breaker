// ZoneView — ZV-CARDS01 : bloc de stats des cartes monstres masquable (off par défaut)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ZoneView from './ZoneView'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('ZoneView — ZV-CARDS01 (stats masquables)', () => {
  it('stats masquées par défaut, affichées après le toggle « Show stats »', () => {
    const { container } = render(<ZoneView />)
    expect(container.querySelector('.mcard-stats')).toBeNull() // off par défaut
    fireEvent.click(screen.getByTestId('zv-stats-toggle'))
    expect(container.querySelector('.mcard-stats')).not.toBeNull() // visible après toggle
  })
})

describe('PERF-IMG01 — lazy-loading des sprites de monstres', () => {
  it('les sprites de monstres ont loading="lazy"', () => {
    const { container } = render(<ZoneView />)
    const sprite = container.querySelector('img.ms-img')
    expect(sprite).not.toBeNull()
    expect(sprite.getAttribute('loading')).toBe('lazy')
  })
})
