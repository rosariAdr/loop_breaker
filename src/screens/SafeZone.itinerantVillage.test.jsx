// MST08 / v1.43 (DÉCISION #3) — surfaçage du maître ITINÉRANT sur les tableaux de maître
// LOCAUX des VILLAGES (plus seulement l'Académie des villes) :
//   • Millhaven : PNJ-maître dédié (KnightTrainer / Sir Aldric) → board dans son panneau.
//   • Greywatch (village sans PNJ-maître) : repli communautaire sur le tableau de l'Église.
// L'itinérant ne surface qu'À SON agglo-hôte du bloc (single-location), initiation via
// l'engagement run-scopé (setMaster) inchangée.
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

// Un dayCount où l'itinérant du bloc a pour agglo-hôte `host`.
const dayHostingAt = (host) => {
  for (let d = 0; d < ITINERANT_ROTATION_DAYS * 6 * 4; d++) {
    if (getItinerantHostForDay(d) === host) return d
  }
  throw new Error(`no day where itinerant hosts at ${host}`)
}

const enterVillage = (location, dayCount) => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: {
      ...s.world,
      currentZone: 'ashenvale',
      currentLocation: location,
      currentHuntingSpot: null,
      tickCount: 12, // midi → bâtiments ouverts
      dayCount,
    },
    hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 5000 } },
  }))
  localStorage.clear()
}

// Nom d'initiation attendu de l'itinérant hôte ce jour-là (12 premiers caractères → regex).
const hostInitRegex = (dayCount) => {
  const master = getItinerantMasterForDay(dayCount)
  const name = MASTER_QUESTS[master.initiationQuestId].name
  return new RegExp(name.slice(0, 12))
}

afterEach(cleanup)

describe('MST08 / v1.43 — Millhaven (KnightTrainer) surface l’itinérant hôte', () => {
  const day = dayHostingAt('millhaven')

  beforeEach(() => enterVillage('millhaven', day))

  it('le board de Sir Aldric affiche les Trials of Mastery de l’itinérant de passage', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Sir Aldric/)[0]) // tuile → PNJ
    fireEvent.click(screen.getByText(/Train with Aldric/)) // entre dans le panneau
    const board = screen.getByTestId('master-quests')
    expect(within(board).getByText(hostInitRegex(day))).toBeTruthy()
  })
})

describe('MST08 / v1.43 — Greywatch (Église, repli) surface l’itinérant hôte', () => {
  const day = dayHostingAt('greywatch')

  beforeEach(() => enterVillage('greywatch', day))

  it('le tableau de l’Église affiche les Trials of Mastery de l’itinérant de passage', () => {
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Church of the Old Gods/)[0]) // tuile → PNJ
    const board = screen.getByTestId('master-quests')
    expect(within(board).getByText(hostInitRegex(day))).toBeTruthy()
  })

  it('un jour où Greywatch N’EST PAS l’hôte : l’itinérant de passage ne surface PAS', () => {
    // cherche un jour où l'hôte n'est PAS greywatch (l'itinérant est ailleurs ce bloc)
    let d = 0
    while (getItinerantHostForDay(d) === 'greywatch') d++
    enterVillage('greywatch', d)
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Church of the Old Gods/)[0])
    // le board peut exister (maître FIXE Aldric à Greywatch), mais l'initiation de
    // l'itinérant du bloc n'y apparaît pas (single-location : il est à une autre agglo).
    const itinInit = MASTER_QUESTS[getItinerantMasterForDay(d).initiationQuestId].name
    const board = screen.queryByTestId('master-quests')
    if (board) {
      expect(within(board).queryByText(new RegExp(itinInit.slice(0, 12)))).toBeNull()
    }
  })
})

describe('MST08 / v1.43 — pas de double surfaçage à l’Église quand un board dédié existe', () => {
  it('à Millhaven, l’Église ne rend PAS de board maître (KnightTrainer s’en charge)', () => {
    const day = dayHostingAt('millhaven')
    enterVillage('millhaven', day)
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText(/Church of the Old Gods/)[0])
    // le repli Église est désactivé là où un PNJ-maître dédié existe (hasDedicatedMasterBoard)
    expect(screen.queryByTestId('master-quests')).toBeNull()
  })
})
