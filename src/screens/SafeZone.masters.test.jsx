// MST04 — UI maître dans le panneau Académie (Ironhaven) : état d'engagement, scoping à
// la localité, grisage + tooltip des quêtes verrouillées, visibilité du seul maître engagé.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'
import {
  getItinerantMasterForDay,
  getItinerantHostForDay,
  ITINERANT_ROTATION_DAYS,
  MASTERS,
} from '../data/masters'
import { MASTER_QUESTS } from '../data/masterQuests'

// v1.43 (DÉCISION #3) — un dayCount où l'itinérant `masterId` est de passage À IRONHAVEN
// (l'itinérant surface désormais dans UNE SEULE agglo, son hôte du bloc). On cherche donc un
// jour où il est l'itinérant du bloc ET où Ironhaven est l'agglo-hôte.
const dayForItinerantAtIronhaven = (masterId) => {
  for (let d = 0; d < ITINERANT_ROTATION_DAYS * 6 * 4; d++) {
    if (getItinerantMasterForDay(d).id === masterId && getItinerantHostForDay(d) === 'ironhaven') {
      return d
    }
  }
  throw new Error(`no day where ${masterId} hosts at ironhaven`)
}

const openAcademy = () => {
  render(<SafeZone />)
  fireEvent.click(screen.getAllByText('Academy of Magic')[0]) // dialogue PNJ
  fireEvent.click(screen.getByText(/Enter the Academy/))
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'ironhaven', tickCount: 12 },
    hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 5000 } },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('MST04 — panneau Académie : état & scoping', () => {
  it('affiche « No master » tant qu’aucun maître n’est engagé', () => {
    openAcademy()
    expect(screen.getByTestId('master-state').textContent).toMatch(/No master/i)
  })

  it('scope aux maîtres d’Ironhaven : montre l’initiation de Vael ET de Bulgar, pas celle d’Aldric', () => {
    openAcademy()
    const board = screen.getByTestId('master-quests')
    expect(within(board).getByText(/The Archmagister’s Test/)).toBeTruthy() // Vael
    expect(within(board).getByText(/The Iron Pit/)).toBeTruthy() // Bulgar
    expect(within(board).queryByText(/The Knight’s Trial/)).toBeNull() // Aldric (Greywatch)
    expect(within(board).queryByText(/The Court Mage’s Wager/)).toBeNull() // Elyndra (Millhaven)
  })

  it('grise (🔒 + tooltip) les quêtes de skill tant que non initié', () => {
    openAcademy()
    const board = screen.getByTestId('master-quests')
    const locks = within(board).getAllByTestId('quest-locked')
    expect(locks.length).toBeGreaterThan(0)
    expect(locks[0].getAttribute('title')).toMatch(/initiation/i)
  })

  it('affiche « Master: … » et ne montre QUE le maître engagé une fois initié', () => {
    useGameStore.getState().setMaster('academy_master') // engagé chez Vael
    openAcademy()
    expect(screen.getByTestId('master-state').textContent).toMatch(/Master:.*Vael/)
    const board = screen.getByTestId('master-quests')
    // quêtes de Vael visibles, celles de Bulgar masquées
    expect(within(board).getByText(/Channel the Gust/)).toBeTruthy() // pool de Vael
    expect(within(board).queryByText(/No Retreat/)).toBeNull() // pool de Bulgar
    // plus aucune quête verrouillée (le pool de Vael est déverrouillé)
    expect(within(board).queryAllByTestId('quest-locked').length).toBe(0)
  })
})

// MST08 / v1.43 (DÉCISION #3) — l'itinérant de passage surface au board de l'Académie
// UNIQUEMENT les jours où Ironhaven est son agglo-hôte du bloc (single-location).
describe('MST08 — maître itinérant de passage (à son agglo-hôte)', () => {
  const setDay = (dayCount) =>
    useGameStore.setState((s) => ({ world: { ...s.world, dayCount } }))

  it('affiche l’initiation de l’itinérant de FEU (Pyra) le jour où il visite Ironhaven', () => {
    setDay(dayForItinerantAtIronhaven('flame_wanderer'))
    openAcademy()
    const board = screen.getByTestId('master-quests')
    const pyraInit = MASTER_QUESTS[MASTERS.flame_wanderer.initiationQuestId].name
    expect(within(board).getByText(new RegExp(pyraInit.slice(0, 12)))).toBeTruthy()
    // l'itinérant d'un AUTRE bloc (glace) n'est pas là ce jour-là
    const kairaInit = MASTER_QUESTS[MASTERS.frost_wanderer.initiationQuestId].name
    expect(within(board).queryByText(new RegExp(kairaInit.slice(0, 12)))).toBeNull()
  })

  it('affiche l’initiation de l’itinérant de GLACE (Kaira) le jour où il visite Ironhaven', () => {
    setDay(dayForItinerantAtIronhaven('frost_wanderer'))
    openAcademy()
    const board = screen.getByTestId('master-quests')
    const kairaInit = MASTER_QUESTS[MASTERS.frost_wanderer.initiationQuestId].name
    expect(within(board).getByText(new RegExp(kairaInit.slice(0, 12)))).toBeTruthy()
  })

  it('n’affiche PAS l’itinérant du bloc à Ironhaven quand une AUTRE agglo est l’hôte', () => {
    // jour 0 : bloc 0 → combo 0 → maître 0 (Pyra) à l’hôte index 0 (Greywatch), pas Ironhaven
    setDay(0)
    openAcademy()
    // seuls les maîtres FIXES d’Ironhaven (Vael/Bulgar) sont surfacés ; pas d’itinérant
    const board = screen.getByTestId('master-quests')
    const pyraInit = MASTER_QUESTS[MASTERS.flame_wanderer.initiationQuestId].name
    expect(within(board).queryByText(new RegExp(pyraInit.slice(0, 12)))).toBeNull()
  })
})
