// FIX-ALDRIC01 — réconciliation Aldric, option (a) décidée 2026-07-19 :
// Sir Aldric est 100 % Greywatch (donneur de quêtes + maître martial, data canonique) ;
// le bâtiment `knight_trainer` de MILLHAVEN passe à un PNJ dédié : Dame Roswyn.
// Régressions pinnées : plus aucune surface Millhaven ne présente Aldric, le panneau ne
// liste plus ses quêtes Greywatch (elles restent sur le board de Greywatch), la data
// canonique d'Aldric ne bouge pas, le dialogue du bâtiment est celui de Roswyn.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SafeZone from '../SafeZone'
import KnightTrainerPanel from './KnightTrainerPanel'
import { useGameStore } from '../../store/gameStore'
import { QUEST_NPCS } from '../../data/quests'
import { MASTERS } from '../../data/masters'
import { BUILDING_DIALOGUE_ID, getDialogue } from '../../data/dialogues'

const enterMillhaven = () => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: {
      ...s.world,
      currentZone: 'ashenvale',
      currentLocation: 'millhaven',
      currentHuntingSpot: null,
      tickCount: 12, // midi → bâtiments ouverts (BLD01)
    },
  }))
  localStorage.clear()
}

beforeEach(enterMillhaven)
afterEach(cleanup)

describe('FIX-ALDRIC01 — le knight_trainer de Millhaven est Dame Roswyn', () => {
  it('la tuile + l’overlay présentent Dame Roswyn, plus AUCUN « Sir Aldric » à Millhaven', () => {
    render(<SafeZone />)
    expect(screen.queryByText(/Sir Aldric/)).toBeNull() // tuile renommée
    fireEvent.click(screen.getAllByText(/Knight Trainer/)[0])
    expect(screen.getAllByText(/Dame Roswyn/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Sir Aldric/)).toBeNull() // overlay aussi
  })

  it('le panneau ne liste plus les quêtes Greywatch d’Aldric (elles restent au board de Greywatch)', () => {
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.queryByText('Boar Trouble')).toBeNull()
    expect(screen.queryByText('Proof of Worth')).toBeNull()
    // l'onglet par défaut est Techniques (l'onglet Quêtes a disparu)
    expect(screen.queryByText('📜 Quests')).toBeNull()
    expect(screen.getByText('Power Strike')).toBeInTheDocument()
  })

  it('data canonique intacte : Aldric (donneur + maître martial) reste à Greywatch', () => {
    expect(QUEST_NPCS.sir_aldric.location).toBe('greywatch')
    expect(MASTERS.sir_aldric.location).toBe('greywatch')
  })

  it('le dialogue du bâtiment est celui de Roswyn (plus knight_aldric)', () => {
    expect(BUILDING_DIALOGUE_ID.knight_trainer).toBe('knight_roswyn')
    expect(getDialogue('knight_roswyn')).toBeTruthy()
  })
})
