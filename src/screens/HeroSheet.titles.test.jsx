// TITLE-DISP01 / TITLE-G1 — HeroSheet : titre actif au-dessus du nom + chips cliquables + buff.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'hero_sheet',
    meta: { ...s.meta, titlesEarned: ['demon_lord_slayer'], activeTitle: null },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('TITLE-DISP01 / TITLE-G1 — HeroSheet', () => {
  it('aucun titre actif au départ', () => {
    render(<HeroSheet />)
    expect(screen.queryByTestId('active-title')).toBeNull()
  })

  it('cliquer un chip active le titre : affiché au-dessus du nom + buff +2 STR reflété', () => {
    render(<HeroSheet />)
    fireEvent.click(screen.getByTestId('title-chip-demon_lord_slayer'))
    const at = screen.getByTestId('active-title')
    expect(at.textContent).toContain('Demon Lord Slayer')
    const row = screen.getByText('Strength').closest('.attr-row')
    expect(within(row).getByText(/\(\+2\)/)).toBeInTheDocument() // statBuffs.strength = 2
  })

  it('re-cliquer le titre actif le désactive', () => {
    render(<HeroSheet />)
    fireEvent.click(screen.getByTestId('title-chip-demon_lord_slayer'))
    expect(screen.getByTestId('active-title')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('title-chip-demon_lord_slayer'))
    expect(screen.queryByTestId('active-title')).toBeNull()
  })
})
