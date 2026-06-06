// PostMortem — sélection de l'héritage + passage à la boutique
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PostMortem from './PostMortem'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    meta: {
      ...s.meta,
      firstDeathSeen: true, // pas de hint pour ce test
      lastRunSummary: {
        cause: 'Stone Golem',
        zone: 'ashenvale',
        day: 5,
        level: 3,
        skills: [],
        stats: { strength: 11, agility: 10, intelligence: 8, chance: 5, def: 5 },
        totalKills: 12,
        reputationTokens: 4,
      },
    },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('PostMortem — héritage', () => {
  it('le bouton "Enter the Gods\' Shop" est inactif tant qu\'aucune stat choisie', () => {
    render(<PostMortem />)
    const btn = screen.getByText(/Enter the Gods' Shop/).closest('button')
    expect(btn.disabled).toBe(true)
  })

  it('choisir une stat active le bouton', () => {
    render(<PostMortem />)
    fireEvent.click(screen.getByRole('button', { name: /strength/i }))
    const btn = screen.getByText(/Enter the Gods' Shop/).closest('button')
    expect(btn.disabled).toBe(false)
  })

  it('stat choisie + Enter → confirmInheritance → écran gods_shop', () => {
    render(<PostMortem />)
    fireEvent.click(screen.getByRole('button', { name: /agility/i }))
    fireEvent.click(screen.getByText(/Enter the Gods' Shop/))
    const st = useGameStore.getState()
    expect(st.currentScreen).toBe('gods_shop')
    expect(st.meta.pendingInheritance?.stat).toBe('agility')
  })
})
