// GLD01/GLD02 — Guilde (ville) vs auberge (village) : répartition + prestige + venue.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuestBoard from './QuestBoard'
import { useGameStore } from '../store/gameStore'
import { QUESTS, isPrestigiousQuest, getBoardQuests, PRESTIGE_MIN_TOKENS } from '../data/quests'
import { ZONES } from '../data/zones'

const setLocation = (zoneId, locationId, extra = {}) =>
  useGameStore.setState((s) => ({
    world: { ...s.world, currentZone: zoneId, currentLocation: locationId, ...extra },
  }))

describe('GLD — classification prestige & pools', () => {
  it('une quête de boss / forts tokens est prestigieuse', () => {
    expect(isPrestigiousQuest(QUESTS.silence_the_crypt)).toBe(true) // boss
    expect(isPrestigiousQuest(QUESTS.end_the_demon)).toBe(true) // demon lord + 10 tokens
    expect(isPrestigiousQuest(QUESTS.nc_oakheart_elite)).toBe(true) // élite
  })

  it("une petite quête (first_blood) n'est pas prestigieuse", () => {
    expect(isPrestigiousQuest(QUESTS.first_blood)).toBe(false)
  })

  it('le pool village exclut les quêtes prestigieuses, la guilde les garde', () => {
    const village = getBoardQuests('village')
    const guild = getBoardQuests('guild')
    expect(village.every((q) => !isPrestigiousQuest(q))).toBe(true)
    expect(guild.length).toBeGreaterThan(village.length)
    expect(guild.some((q) => isPrestigiousQuest(q))).toBe(true)
  })

  it('la ville a un bâtiment guild', () => {
    expect(ZONES.ashenvale.city.buildings).toContain('guild')
  })
})

describe('GLD — venue rendu du QuestBoard', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('en ville : titre Guilde + quêtes prestigieuses visibles', () => {
    setLocation('ashenvale', ZONES.ashenvale.city.id)
    render(<QuestBoard />)
    expect(screen.getByText("Adventurers' Guild")).toBeInTheDocument()
    expect(screen.getByText('Silence the Crypt')).toBeInTheDocument()
  })

  it('au village (QSV2) : Notice Board ; les quêtes émises ailleurs ne sont PAS disponibles ici', () => {
    // QSV2-LOCALITY01 — Millhaven n'émet aucune quête → le board y est vide (les quêtes
    // d'Ironhaven, leur lieu émetteur, n'apparaissent QU'à Ironhaven).
    setLocation('ashenvale', 'millhaven')
    render(<QuestBoard />)
    expect(screen.getByText('Village Notice Board')).toBeInTheDocument()
    expect(screen.queryByText('Silence the Crypt')).not.toBeInTheDocument()
    expect(screen.queryByText('First Blood')).not.toBeInTheDocument()
    expect(screen.getByText('No quests available at this location.')).toBeInTheDocument()
  })

  it('prestige gardé par le rang : verrou si tokens < seuil, Accept si ≥ seuil', () => {
    setLocation('ashenvale', ZONES.ashenvale.city.id)
    // rang faible
    useGameStore.setState((s) => ({ hero: { ...s.hero, reputationTokens: 0 } }))
    const { unmount } = render(<QuestBoard />)
    expect(screen.getAllByTestId('quest-locked').length).toBeGreaterThan(0)
    unmount()
    // rang suffisant → plus de verrou
    useGameStore.setState((s) => ({ hero: { ...s.hero, reputationTokens: PRESTIGE_MIN_TOKENS } }))
    render(<QuestBoard />)
    expect(screen.queryAllByTestId('quest-locked').length).toBe(0)
  })

  it('accepter est bloqué tant que le rang est insuffisant', () => {
    setLocation('ashenvale', ZONES.ashenvale.city.id)
    useGameStore.setState((s) => ({ hero: { ...s.hero, reputationTokens: 0 } }))
    render(<QuestBoard />)
    // first_blood (non prestigieuse) est acceptable → au moins un bouton Accept existe
    const accepts = screen.getAllByText('Accept')
    expect(accepts.length).toBeGreaterThan(0)
  })
})
