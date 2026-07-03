// META-ACHIEVE02 — écran de consultation des accomplissements.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import AchievementsOverlay from './AchievementsOverlay'
import { useGameStore } from '../store/gameStore'
import { ACHIEVEMENTS } from '../data/achievements'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('META-ACHIEVE02 — écran de consultation', () => {
  it('liste tous les accomplissements avec progression', () => {
    render(<AchievementsOverlay />)
    for (const a of Object.values(ACHIEVEMENTS)) {
      expect(screen.getByTestId(`ach-${a.id}`)).toBeInTheDocument()
    }
  })

  it('marque un accomplissement débloqué (✓)', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, achievements: ['first_blood'] } }))
    render(<AchievementsOverlay />)
    expect(screen.getByTestId('ach-done-first_blood')).toBeInTheDocument()
  })
})
