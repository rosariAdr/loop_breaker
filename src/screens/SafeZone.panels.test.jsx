// COV80 — Smoke tests des panneaux de bâtiments (ville) : ouvrir chaque bâtiment et
// entrer dans son panneau fonctionnel sans crash. Couvre une large part de SafeZone.jsx.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    // Ironhaven = ville (tous les bâtiments à panneau) ; midi → bâtiments ouverts.
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'ironhaven', tickCount: 12 },
    // un peu d'or + un skill en réserve pour que les boutiques aient du contenu à rendre
    hero: {
      ...s.hero,
      inventory: { ...s.hero.inventory, gold: 5000 },
    },
  }))
  localStorage.clear()
})
afterEach(cleanup)

const PANELS = [
  { building: 'church', name: 'Church of the Old Gods', cta: /Enter the Church/ },
  { building: 'merchant', name: "Merchant's Stall", cta: /Browse the wares/ },
  { building: 'alchemy', name: 'Alchemy Workshop', cta: /Enter the lab/ },
  { building: 'blacksmith', name: "Blacksmith's Forge", cta: /To the forge/ },
  { building: 'academy', name: 'Academy of Magic', cta: /Enter the Academy/ },
]

describe('SafeZone — panneaux de bâtiments (smoke, COV80)', () => {
  PANELS.forEach(({ building, name, cta }) => {
    it(`ouvre et entre dans le panneau « ${building} » sans crash`, () => {
      render(<SafeZone />)
      fireEvent.click(screen.getAllByText(name)[0]) // ouvre le dialogue PNJ
      fireEvent.click(screen.getByText(cta)) // entre dans le panneau
      expect(document.querySelector('.npc-panel-host')).not.toBeNull()
    })
  })

  it('l’auberge : « Rest » exécute le repos inline et avance le jour', () => {
    render(<SafeZone />)
    const dayBefore = useGameStore.getState().world.dayCount
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    fireEvent.click(screen.getByText(/Rest at the Inn/))
    expect(useGameStore.getState().world.dayCount).toBe(dayBefore + 1)
  })

  it('la guilde : ouvre les informateurs', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Adventurers' Guild/)[0])
    fireEvent.click(screen.getByText(/Informants/))
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
  })

  it('Talk : ouvre l’arbre de dialogue PNJ (auberge)', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/The Hearth Inn/)[0])
    fireEvent.click(screen.getByText(/^Talk$|Talk/))
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
  })
})

describe('SafeZone — panneaux de village (knight_trainer / master_smith)', () => {
  beforeEach(() => {
    useGameStore.setState((s) => ({
      currentScreen: 'safe_zone',
      // Millhaven (village) a knight_trainer ; on force master_smith via generatedVillages.
      world: {
        ...s.world,
        currentZone: 'ashenvale',
        currentLocation: 'millhaven',
        tickCount: 12,
        generatedVillages: { millhaven: { buildings: ['master_smith'] } },
      },
    }))
  })

  it('ouvre le panneau du maître d’armes (knight_trainer)', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Knight Trainer/)[0])
    fireEvent.click(screen.getByText(/Train with Aldric/))
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
  })

  it('ouvre le panneau du maître forgeron (master_smith)', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Master Smith/)[0])
    fireEvent.click(screen.getByText(/Master forge/))
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
  })
})
