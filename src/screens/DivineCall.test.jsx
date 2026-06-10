// DV03 — Tests fidélité inter-run (bannière de reconnaissance) + flow DivineCall
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DivineCall from './DivineCall'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
})

afterEach(cleanup)

describe('DivineCall — flow de base', () => {
  it('ne rend rien sans pendingDivineCall', () => {
    render(<DivineCall />)
    expect(screen.queryByText(/Accept/)).toBeNull()
  })

  it('affiche le dieu invoqué (Ignareth)', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    render(<DivineCall />)
    expect(screen.getByText('Ignareth')).toBeInTheDocument()
    expect(screen.getByText('Accept')).toBeInTheDocument()
  })

  it('affiche Voltaris correctement (DV04 intégration)', () => {
    useGameStore.getState().triggerDivineCall('voltaris')
    render(<DivineCall />)
    expect(screen.getByText('Voltaris')).toBeInTheDocument()
  })
})

describe('DV03 — Fidélité inter-run', () => {
  it('PAS de bannière de reconnaissance si jamais lié', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    render(<DivineCall />)
    expect(screen.queryByTestId('returning-deity-banner')).toBeNull()
  })

  it('affiche la bannière si déjà lié dans cet univers', () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, divineBonds: { medieval_fantasy: 'ignareth' } },
    }))
    useGameStore.getState().triggerDivineCall('ignareth')
    render(<DivineCall />)
    expect(screen.getByTestId('returning-deity-banner')).toBeInTheDocument()
    expect(screen.getByText(/Ignareth remembers you/)).toBeInTheDocument()
  })

  it('PAS de bannière si lié à un AUTRE dieu', () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, divineBonds: { medieval_fantasy: 'sylvara' } },
    }))
    useGameStore.getState().triggerDivineCall('ignareth')
    render(<DivineCall />)
    expect(screen.queryByTestId('returning-deity-banner')).toBeNull()
  })
})

describe('DV07 — Refus depuis DivineCall', () => {
  it('le bouton Refuse → confirm → Walk alone lève soloRun', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    render(<DivineCall />)
    fireEvent.click(screen.getByText('Refuse'))
    fireEvent.click(screen.getByText('Walk alone'))
    expect(useGameStore.getState().hero.soloRun).toBe(true)
    expect(useGameStore.getState().pendingDivineCall).toBeNull()
  })
})
