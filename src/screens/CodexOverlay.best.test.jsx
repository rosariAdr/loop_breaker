// BEST01/BEST02 — Codex : badge de maîtrise + lore selon les paliers persistants.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import CodexOverlay from './CodexOverlay'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('BEST01/02 — Codex maîtrise', () => {
  it('100 kills cumulés → « Mastered » + lore révélé', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, bestiaryKills: { ashwood_wolf: 100 } } }))
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-mastery-ashwood_wolf').textContent).toMatch(/Mastered/)
    expect(screen.getByTestId('codex-lore-ashwood_wolf')).toBeInTheDocument()
  })

  it('10 kills → Bestiary Lv 1, pas encore de lore', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, bestiaryKills: { ashwood_wolf: 10 } } }))
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-mastery-ashwood_wolf').textContent).toMatch(/Lv 1/)
    expect(screen.queryByTestId('codex-lore-ashwood_wolf')).toBeNull()
  })
})
