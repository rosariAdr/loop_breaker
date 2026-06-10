// UX globale v1.1 — VIG01 (topbar vigueur) + UX-LEAVE-CONFIRM01 + UX-EMPTYSTATES01
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from '../App'
import ZoneView from './ZoneView'
import HeroSheet from './HeroSheet'
import QuestsOverlay from './QuestsOverlay'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})
afterEach(cleanup)

describe('VIG01 — vigueur dans la topbar', () => {
  it('affiche le meter de vigueur (lecture seule)', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, vigor: 73 }, currentScreen: 'world_map' }))
    render(<App />)
    expect(screen.getByText('Vig')).toBeInTheDocument()
    expect(screen.getByText('73/100')).toBeInTheDocument()
  })
})

describe('UX-LEAVE-CONFIRM01 — quitter la Blighted Road', () => {
  it('« ← Map » depuis la Blighted Road demande confirmation', () => {
    useGameStore.setState((s) => ({
      currentScreen: 'zone_view',
      world: { ...s.world, currentZone: 'blighted_road', currentHuntingSpot: null },
    }))
    render(<ZoneView />)
    fireEvent.click(screen.getByText(/← Map/))
    expect(screen.getByText(/Leave the Blighted Road/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Stay')) // annuler
    expect(screen.queryByText(/Leave the Blighted Road/)).toBeNull()
    expect(useGameStore.getState().currentScreen).toBe('zone_view')
  })

  it('zone normale : « ← Map » quitte directement (pas de confirmation)', () => {
    useGameStore.setState((s) => ({
      currentScreen: 'zone_view',
      world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' },
    }))
    render(<ZoneView />)
    fireEvent.click(screen.getByText(/← Map/))
    expect(useGameStore.getState().currentScreen).toBe('world_map')
  })
})

describe('UX-EMPTYSTATES01 — états vides clairs', () => {
  it('HeroSheet : message quand aucun skill actif équipé', () => {
    useGameStore.setState({ currentScreen: 'hero_sheet' })
    render(<HeroSheet />)
    expect(screen.getByText(/No active skills equipped/)).toBeInTheDocument()
  })

  it('QuestsOverlay : message quand aucune quête active', () => {
    render(<QuestsOverlay />)
    expect(screen.getByText(/No active quests/)).toBeInTheDocument()
  })
})

describe('PERF-SPLIT01 — écrans lourds en lazy + Suspense', () => {
  it('l’écran lazy Combat se charge via Suspense (chunk séparé)', async () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, hp: 500, maxHp: 500 } },
    }))
    useGameStore.getState().startCombat([
      {
        id: 'w',
        monsterId: 'ashwood_wolf',
        name: 'W',
        stats: { hp: 80, atk: 5, def: 4, spd: 10 },
        currentHp: 80,
        rank: 'common',
        expReward: 15,
      },
    ])
    render(<App />)
    // Combat est importé en lazy → résolu de façon asynchrone via Suspense
    expect(await screen.findByText(/Basic Attack/i)).toBeInTheDocument()
  })
})
