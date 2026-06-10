// QSV2-LOCALITY01 / QSV2-TURNIN01 — disponibilité au lieu émetteur, rendu au lieu émetteur OU en ville.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuestBoard from './QuestBoard'
import { useGameStore } from '../store/gameStore'
import { QUESTS, getQuestIssuer } from '../data/quests'
import { ZONES } from '../data/zones'

const cityId = ZONES.ashenvale.city.id // 'ironhaven'
const ironhavenQuest = Object.values(QUESTS).find((q) => getQuestIssuer(q) === cityId)
const greywatchQuest = Object.values(QUESTS).find((q) => getQuestIssuer(q) === 'greywatch')

const setLocation = (locationId) =>
  useGameStore.setState((s) => ({
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: locationId },
  }))

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

describe('QSV2-LOCALITY01 — disponibilité au seul lieu émetteur', () => {
  it('les données contiennent bien une quête émise par Ironhaven et une par Greywatch', () => {
    expect(ironhavenQuest).toBeTruthy()
    expect(greywatchQuest).toBeTruthy()
  })

  it("une quête d'Ironhaven est disponible à Ironhaven, pas une quête de Greywatch", () => {
    setLocation(cityId)
    render(<QuestBoard />)
    expect(screen.getByText(ironhavenQuest.name)).toBeInTheDocument()
    expect(screen.queryByText(greywatchQuest.name)).not.toBeInTheDocument()
  })
})

describe('QSV2-TURNIN01 — rendu au lieu émetteur OU en ville', () => {
  it('une quête active de Greywatch est visible en VILLE (rendu universel)', () => {
    useGameStore.getState().startQuest(greywatchQuest.id)
    setLocation(cityId) // Ironhaven = ville
    render(<QuestBoard />)
    expect(screen.getByText(greywatchQuest.name)).toBeInTheDocument()
  })

  it("la même quête active n'est PAS visible dans un autre village (Millhaven)", () => {
    useGameStore.getState().startQuest(greywatchQuest.id)
    setLocation('millhaven')
    render(<QuestBoard />)
    expect(screen.queryByText(greywatchQuest.name)).not.toBeInTheDocument()
  })
})

describe('QB-LAYOUT01 — board pleine largeur (grille)', () => {
  it('rend les quêtes dans une grille .qb-grid, sans contrainte max-w-2xl', () => {
    setLocation(cityId)
    const { container } = render(<QuestBoard />)
    expect(container.querySelector('.qb-grid')).not.toBeNull()
    expect(container.querySelector('.max-w-2xl')).toBeNull()
  })
})
