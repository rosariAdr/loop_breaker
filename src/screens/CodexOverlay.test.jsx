// CODEX01 — Tests du bestiaire (révélation progressive)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import CodexOverlay from './CodexOverlay'
import { useGameStore } from '../store/gameStore'

const setKills = (n) =>
  useGameStore.setState((s) => ({ world: { ...s.world, monsterKillCounts: { ashwood_wolf: n } } }))

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('CODEX01 — bestiaire', () => {
  it('monstre non tué → ??? Undiscovered', () => {
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-ashwood_wolf').textContent).toMatch(/Undiscovered/)
  })

  it('après 1 kill : nom révélé, stats encore cachées', () => {
    setKills(1)
    render(<CodexOverlay />)
    const card = screen.getByTestId('codex-ashwood_wolf')
    expect(card.textContent).toMatch(/Ashwood Wolf/)
    expect(card.textContent).toMatch(/Defeat 3 to reveal/)
  })

  it('après 3 kills : stats révélées', () => {
    setKills(3)
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-ashwood_wolf').textContent).toMatch(/HP \d+/)
  })

  it('skill masqué (████) avant 5 kills', () => {
    setKills(3)
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-skill-ashwood_wolf').textContent).toMatch(/█/)
  })

  it('skill révélé après 5 kills', () => {
    setKills(5)
    render(<CodexOverlay />)
    expect(screen.getByTestId('codex-skill-ashwood_wolf').textContent).toMatch(/Savage Bite/)
  })
})
