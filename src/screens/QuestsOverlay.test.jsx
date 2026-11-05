// UI-QUESTS — Tests de l'overlay de suivi des quêtes actives.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import QuestsOverlay from './QuestsOverlay'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('UI-QUESTS — overlay de suivi', () => {
  // QSV2-DROPDUP01 — fixture : mq01_waking (5× ashwood_wolf) remplace first_blood (retirée).
  it('liste les quêtes actives (nom + objectif)', () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, activeQuests: ['mq01_waking'], monsterKillCounts: { ashwood_wolf: 2 } },
    }))
    render(<QuestsOverlay />)
    expect(
      within(screen.getByTestId('quest-mq01_waking')).getByText(/The Hunting Journal/),
    ).toBeInTheDocument()
    // progression 2/5 affichée
    expect(screen.getByText('Master the Ashwood Wolves (5 victories)')).toBeInTheDocument()
    expect(screen.getByText('2/5')).toBeInTheDocument()
  })

  it('affiche une barre de progression par objectif', () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, activeQuests: ['mq01_waking'], monsterKillCounts: { ashwood_wolf: 2 } },
    }))
    render(<QuestsOverlay />)
    const bar = screen.getByRole('progressbar', { name: /The Hunting Journal|Ashwood/i })
    expect(bar).toBeInTheDocument()
    expect(bar.getAttribute('aria-valuenow')).toBe('2')
    expect(bar.getAttribute('aria-valuemax')).toBe('5')
  })

  it('quête complétable → badge « Ready to turn in »', () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, activeQuests: ['mq01_waking'], monsterKillCounts: { ashwood_wolf: 5 } },
    }))
    render(<QuestsOverlay />)
    expect(screen.getByText(/✓ Ready to turn in/i)).toBeInTheDocument()
  })

  it('aucune quête active → message vide', () => {
    useGameStore.setState((s) => ({ world: { ...s.world, activeQuests: [] } }))
    render(<QuestsOverlay />)
    expect(screen.getByText(/No active quests/i)).toBeInTheDocument()
  })

  it('objectif de type level utilise le niveau du héros', () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, activeQuests: ['proof_of_worth'] },
      hero: { ...s.hero, level: 2 },
    }))
    render(<QuestsOverlay />)
    expect(screen.getByText('Reach Level 3')).toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })
})
