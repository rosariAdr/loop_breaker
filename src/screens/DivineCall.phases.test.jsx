// DivineCall — flow des 3 phases (message → choix skill / refus)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import DivineCall from './DivineCall'
import { useGameStore } from '../store/gameStore'
import { DEITIES } from '../data/deities'
import { SKILLS } from '../data/skills'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ pendingDivineCall: { deityId: 'ignareth' } })
  localStorage.clear()
})
afterEach(cleanup)

describe('DivineCall — phases', () => {
  it('phase message : nom du dieu + Accept/Refuse', () => {
    render(<DivineCall />)
    expect(screen.getByText('Ignareth')).toBeInTheDocument()
    expect(screen.getByText('Accept')).toBeInTheDocument()
    expect(screen.getByText('Refuse')).toBeInTheDocument()
  })

  it('Accept → phase choix de skill (options + Receive)', () => {
    render(<DivineCall />)
    fireEvent.click(screen.getByText('Accept'))
    const opts = DEITIES.ignareth.divineSkillOptions
    expect(screen.getByText(SKILLS[opts[0]].name)).toBeInTheDocument()
    expect(screen.getByText(/Receive/)).toBeInTheDocument()
  })

  it('choisir un skill puis Receive → acceptDeity (hero.deity = ignareth)', () => {
    render(<DivineCall />)
    fireEvent.click(screen.getByText('Accept'))
    const opts = DEITIES.ignareth.divineSkillOptions
    fireEvent.click(screen.getByText(SKILLS[opts[0]].name))
    fireEvent.click(screen.getByText(/Receive/))
    expect(useGameStore.getState().hero.deity).toBe('ignareth')
  })

  it('Refuse → confirmation ; Walk alone clôt l\'appel', () => {
    render(<DivineCall />)
    fireEvent.click(screen.getByText('Refuse'))
    expect(screen.getByText('Walk alone')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Walk alone'))
    expect(useGameStore.getState().pendingDivineCall).toBeNull()
  })

  it('Refuse → ← Back revient au message', () => {
    render(<DivineCall />)
    fireEvent.click(screen.getByText('Refuse'))
    fireEvent.click(screen.getByText('← Back'))
    expect(screen.getByText('Accept')).toBeInTheDocument()
  })
})
