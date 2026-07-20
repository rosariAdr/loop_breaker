// FIX-HSBARS01 — Hero Sheet : largeurs de barres homogènes par famille + Aura/Concentration
// RATTACHÉES à la grille des attributs (même gabarit `.attr-row`, plus de VitalBar pleine
// largeur décalée). jsdom ne calcule pas la mise en page → on pinne la STRUCTURE : la classe
// et l'emplacement des barres, le gabarit à largeur fixe (`.ar-val`/`.ar-ticks`) et l'état
// verrouillé (barre floutée `.ar-locked` + 🔒 + « ??? »).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ currentScreen: 'hero_sheet' })
  localStorage.clear()
})
afterEach(cleanup)

describe('FIX-HSBARS01 — Aura/Concentration dans la grille des attributs', () => {
  it('Aura & Concentration sont des `.attr-row` DANS `.attr-grid` (plus de VitalBar `.hvb`)', () => {
    render(<HeroSheet />)
    const grid = document.querySelector('.attr-grid')
    for (const stat of ['aura', 'concentration']) {
      const row = screen.getByTestId(`vital-${stat}`)
      expect(row.classList.contains('attr-row')).toBe(true)
      expect(row.classList.contains('hvb')).toBe(false)
      expect(grid.contains(row)).toBe(true) // rattachées à la grille (à la suite des 5 stats)
    }
  })

  it('même gabarit que les 5 attributs (grille = 7 lignes `.attr-row`)', () => {
    render(<HeroSheet />)
    const rows = document.querySelectorAll('.attr-grid .attr-row')
    expect(rows.length).toBe(7) // STR/AGI/INT/CHANCE/DEF + Aura + Concentration
    // chaque ligne porte le gabarit à largeur fixe (valeur + zone de repères)
    for (const row of rows) {
      expect(row.querySelector('.ar-bar')).toBeTruthy()
      expect(row.querySelector('.ar-val')).toBeTruthy()
      expect(row.querySelector('.ar-ticks')).toBeTruthy()
    }
  })
})

describe('FIX-HSBARS01 — état verrouillé conservé (HSV2-03)', () => {
  it('verrouillées (0) → `.ar-locked` + « ??? » + 🔒', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, aura: 0, concentration: 0 } }))
    render(<HeroSheet />)
    for (const stat of ['aura', 'concentration']) {
      const row = screen.getByTestId(`vital-${stat}`)
      expect(row.classList.contains('ar-locked')).toBe(true)
      expect(within(row).getByText('???')).toBeInTheDocument()
      expect(within(row).getByText('🔒')).toBeInTheDocument()
    }
  })

  it('débloquées → nom réel + valeur numérique, plus de verrou', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, aura: 5, concentration: 40 } }))
    render(<HeroSheet />)
    const aura = screen.getByTestId('vital-aura')
    expect(aura.classList.contains('ar-locked')).toBe(false)
    expect(within(aura).getByText('Aura')).toBeInTheDocument()
    expect(within(aura).queryByText('🔒')).toBeNull()
    const conc = screen.getByTestId('vital-concentration')
    expect(within(conc).getByText('Concentration')).toBeInTheDocument()
    expect(within(conc).getByText('40')).toBeInTheDocument()
  })
})

describe('FIX-HSBARS01 — famille des vitales homogène (HP/Mana/Vigor/Exp)', () => {
  it('les 4 vitales partagent le gabarit `.hvb` (label + `.hvb-bar` + val, largeurs fixes CSS)', () => {
    render(<HeroSheet />)
    for (const v of ['hp', 'mana', 'vigor', 'experience']) {
      const row = screen.getByTestId(`vital-${v}`)
      expect(row.classList.contains('hvb')).toBe(true)
      expect(row.querySelector('.hvb-bar')).toBeTruthy()
    }
  })
})
