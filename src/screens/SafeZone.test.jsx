// SafeZone — village parchemin + dialogue PNJ (IMM01)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: {
      ...s.world,
      currentZone: 'ashenvale',
      currentLocation: 'millhaven',
      currentHuntingSpot: null,
    },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('SafeZone — village', () => {
  it('affiche le nom du village et ses bâtiments', () => {
    render(<SafeZone />)
    expect(screen.getByText('Millhaven')).toBeInTheDocument()
    expect(screen.getAllByText(/The Hearth Inn/).length).toBeGreaterThanOrEqual(1)
  })

  it('clic sur un bâtiment ouvre le dialogue PNJ (Marta)', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(screen.getByText(/Rest at the Inn/)).toBeInTheDocument()
  })
})

describe('SafeZone — IMM01 actions inline', () => {
  it('"Rest at the Inn" exécute le repos en place (pas de 2e fenêtre) et avance le jour', () => {
    render(<SafeZone />)
    const dayBefore = useGameStore.getState().world.dayCount

    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    fireEvent.click(screen.getByText(/Rest at the Inn/))

    // jour avancé + HP/MP restaurés (sleep)
    expect(useGameStore.getState().world.dayCount).toBe(dayBefore + 1)
    // feedback affiché dans le dialogue, pas de modale .lb-modal
    expect(screen.getByText(/You rest by the hearth/)).toBeInTheDocument()
    expect(document.querySelector('.lb-modal')).toBeNull()
  })

  it('"Leave" ferme le dialogue PNJ', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    expect(screen.getByText('Marta')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Leave/))
    expect(screen.queryByText('Marta')).toBeNull()
  })
})

describe('SafeZone — ville : Académie (ACA05)', () => {
  beforeEach(() => {
    // Ironhaven = ville d'Ashenvale (isCity). academy est dans city.buildings.
    useGameStore.setState((s) => ({
      world: { ...s.world, currentLocation: 'ironhaven', tickCount: 12 }, // midi → bâtiments ouverts
    }))
  })

  it("l'Académie est visible en ville (régression ACA05 : BLD_POS.academy manquait)", () => {
    render(<SafeZone />)
    expect(screen.getAllByText(/Academy of Magic/).length).toBeGreaterThanOrEqual(1)
  })

  it("cliquer l'Académie ouvre le PNJ puis l'AcademyPanel", () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Academy of Magic/)[0])
    // Dialogue PNJ : Archmagus Oren + CTA d'entrée
    expect(screen.getByText('Archmagus Oren')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Enter the Academy/))
    // AcademyPanel (ACA01-04) ouvert
    expect(screen.getByText(/Learn a skill/)).toBeInTheDocument()
  })
})

describe("SafeZone — WAIT01 (action « Wait » à l'auberge)", () => {
  it("Wait ouvre un sélecteur, avance l'heure et ne restaure PAS la vigueur", () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, vigor: 50 } })) // tickCount 0 (reset)
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    fireEvent.click(screen.getByText(/Wait/)) // bouton Wait (seul « Wait » avant ouverture)
    const select = screen.getByTestId('wait-hour')
    fireEvent.change(select, { target: { value: '15' } })
    fireEvent.click(screen.getByText(/Confirm/))
    expect(useGameStore.getState().world.tickCount).toBe(15)
    expect(useGameStore.getState().hero.vigor).toBe(50) // pas de repos
    expect(screen.getByText(/You wait/)).toBeInTheDocument()
  })
})

describe('SafeZone — VIL-FACADE01 (façades en grand)', () => {
  it('un bâtiment avec asset (Inn) est rendu en façade (.bld-facade), sans cadre', () => {
    const { container } = render(<SafeZone />)
    expect(container.querySelector('.bld-facade')).not.toBeNull()
  })
})
