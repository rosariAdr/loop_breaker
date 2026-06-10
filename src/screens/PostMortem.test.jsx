// COV80 — smoke test du PostMortem (rendu du résumé de run + sélection d'héritage).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import PostMortem from './PostMortem'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  useGameStore.setState((s) => ({
    currentScreen: 'post_mortem',
    hero: {
      ...s.hero,
      activeSkills: [{ skillId: 'power_strike', level: 2, xp: 0 }],
      passiveSkills: [],
      level: 4,
    },
    meta: {
      ...s.meta,
      lastRunSummary: {
        cause: 'Slain by a wolf',
        zone: 'ashenvale',
        day: 5,
        level: 4,
        skills: [{ skillId: 'power_strike', level: 2 }],
        stats: {
          hp: 0,
          maxHp: 120,
          mana: 0,
          maxMana: 60,
          strength: 12,
          agility: 11,
          intelligence: 8,
          chance: 5,
          def: 6,
        },
        totalKills: 23,
        reputationTokens: 3,
      },
    },
  }))
})
afterEach(cleanup)

describe('PostMortem — rendu du résumé de run (COV80)', () => {
  it('rend l’écran (pas null) quand un résumé de run est présent', () => {
    const { container } = render(<PostMortem />)
    expect(container.firstChild).not.toBeNull()
  })

  it('retourne null sans résumé de run', () => {
    useGameStore.setState((s) => ({ meta: { ...s.meta, lastRunSummary: null } }))
    const { container } = render(<PostMortem />)
    expect(container.firstChild).toBeNull()
  })
})
