// CODEX01 — Tests du bestiaire (révélation progressive)
// ONB03 — onglet « Rules » (codex des règles)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import CodexOverlay from './CodexOverlay'
import { useGameStore } from '../store/gameStore'
import { CODEX_RULES } from '../data/codexRules'

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

describe('ONB03 — onglet Rules (codex des règles)', () => {
  it('démarre sur le bestiaire (pas de panneau Rules)', () => {
    render(<CodexOverlay />)
    expect(screen.queryByTestId('codex-rules')).toBeNull()
  })

  it('cliquer « Rules » affiche toutes les sections de règles', () => {
    render(<CodexOverlay />)
    fireEvent.click(screen.getByTestId('codex-tab-rules'))
    const panel = screen.getByTestId('codex-rules')
    expect(panel).toBeInTheDocument()
    for (const r of CODEX_RULES) {
      expect(screen.getByTestId(`codex-rule-${r.id}`)).toBeInTheDocument()
    }
    // contenus clés attendus
    expect(panel.textContent).toMatch(/Transmigration/)
    expect(panel.textContent).toMatch(/Vigor/)
  })

  it('revenir sur « Bestiary » masque le panneau Rules', () => {
    render(<CodexOverlay />)
    fireEvent.click(screen.getByTestId('codex-tab-rules'))
    fireEvent.click(screen.getByTestId('codex-tab-bestiary'))
    expect(screen.queryByTestId('codex-rules')).toBeNull()
  })
})
