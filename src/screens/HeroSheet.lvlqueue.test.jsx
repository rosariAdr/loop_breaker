// FIX-LVLQUEUE01 — HeroSheet : badge « N points à attribuer » + attribution en 1 clic des
// points de stat différés (« Do it later » du modal de level-up).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ currentScreen: 'hero_sheet' })
  localStorage.clear()
})
afterEach(cleanup)

describe('FIX-LVLQUEUE01 — HeroSheet : attribution des points différés', () => {
  it('aucun point en attente → pas de badge', () => {
    render(<HeroSheet />)
    expect(screen.queryByTestId('pending-stat-points')).toBeNull()
  })

  it('points en attente → badge affiché avec le compte', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, pendingStatPoints: 3 } }))
    render(<HeroSheet />)
    expect(screen.getByTestId('pending-stat-points')).toBeInTheDocument()
    expect(screen.getByTestId('pending-points-count').textContent).toBe('3')
  })

  it('cliquer « +1 Strength » attribue le point et décrémente le compte', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, pendingStatPoints: 2 } }))
    const str = useGameStore.getState().hero.stats.strength
    render(<HeroSheet />)
    fireEvent.click(screen.getByTestId('assign-point-strength'))
    expect(useGameStore.getState().hero.stats.strength).toBe(str + 1)
    expect(useGameStore.getState().hero.pendingStatPoints).toBe(1)
    expect(screen.getByTestId('pending-points-count').textContent).toBe('1')
  })

  it('épuiser les points fait disparaître le badge', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, pendingStatPoints: 1 } }))
    render(<HeroSheet />)
    fireEvent.click(screen.getByTestId('assign-point-def'))
    expect(screen.queryByTestId('pending-stat-points')).toBeNull()
  })
})
