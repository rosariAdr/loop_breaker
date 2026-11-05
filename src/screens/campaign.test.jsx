import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useGameStore } from '../store/gameStore'
import CampaignPanel from '../components/CampaignPanel'
import CampaignInteractions from '../components/CampaignInteractions'
import QuestBoard from './QuestBoard'
import WorldMap from './WorldMap'
import ZoneView from './ZoneView'
import { MAIN_QUEST_ORDER } from '../data/mainQuests'

const s = () => useGameStore.getState()
const world = (patch) => useGameStore.setState((st) => ({ world: { ...st.world, ...patch } }))
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})
afterEach(() => vi.useRealTimers())

describe('campaign UI', () => {
  it('keeps the next giver visible between missions and shows the ending', () => {
    world({ completedQuests: MAIN_QUEST_ORDER.slice(0, 2) })
    const { rerender } = render(<CampaignPanel />)
    expect(screen.getByTestId('campaign-next')).toHaveTextContent('millhaven')
    expect(screen.getByTestId('campaign-next')).toHaveTextContent('New Horizons')
    act(() => world({ completedQuests: [...MAIN_QUEST_ORDER] }))
    rerender(<CampaignPanel />)
    expect(screen.getByTestId('campaign-complete')).toHaveTextContent('campaign complete')
  })
  it('shows optional chains only after their prerequisites', () => {
    world({
      currentLocation: 'millhaven',
      currentNode: 'millhaven',
      completedQuests: MAIN_QUEST_ORDER.slice(0, 3),
    })
    render(<QuestBoard />)
    expect(screen.getByText('The Abandoned Convoy')).toBeInTheDocument()
    expect(screen.queryByText('The Wagons Return')).not.toBeInTheDocument()
    expect(screen.getByText('The Faded Boundaries')).toBeInTheDocument()
  })
  it('lets the player activate the Sentinel Trial at the ruins', () => {
    world({
      currentHuntingSpot: 'crumbled_ruins',
      activeQuests: ['mq06_beyond_marsh'],
      completedQuests: MAIN_QUEST_ORDER.slice(0, 5),
    })
    render(<CampaignInteractions />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Sentinel Trial' }))
    expect(screen.getByText(/0\/2 victories/)).toBeInTheDocument()
    act(() => {
      s().startCombat([{ monsterId: 'graven_sentinel' }])
      s().recordManualBattle('victory')
      s().endCombat('victory')
    })
    expect(screen.getByText(/1\/2 victories/)).toBeInTheDocument()
  })
  it('makes inscriptions interactive and exposes their discovered text', () => {
    world({ currentHuntingSpot: 'crumbled_ruins', activeQuests: ['sq_guardian_1'] })
    render(<CampaignInteractions />)
    fireEvent.click(screen.getByRole('button', { name: 'Read the western boundary stone' }))
    expect(screen.getByText(/first stone marks a patrol route/)).toBeInTheDocument()
    expect(s().world.campaignEvents).toContain('boundary_west')
  })
  it('completes the report conversation from the board', () => {
    world({ currentLocation: 'ironhaven', completedQuests: MAIN_QUEST_ORDER.slice(0, 4) })
    s().setScreen('quest_board')
    s().startQuest('mq05_iron_city')
    render(<QuestBoard />)
    fireEvent.click(screen.getByRole('button', { name: /Discuss the report/ }))
    expect(s().isQuestComplete('mq05_iron_city')).toBe(true)
  })
  it('does not advertise idle before the journal is returned', () => {
    world({ currentHuntingSpot: 'ashenvale_forest', monsterKillCounts: { ashwood_wolf: 5 } })
    render(<ZoneView />)
    expect(screen.queryByRole('button', { name: '▶ Idle' })).not.toBeInTheDocument()
    expect(screen.getByText(/Mastered — return Moira/)).toBeInTheDocument()
  })
  it('crosses the road through the real QTE and records the crossing', () => {
    vi.useFakeTimers()
    world({
      currentNode: 'ironhaven',
      currentLocation: 'ironhaven',
      completedQuests: MAIN_QUEST_ORDER.slice(0, 8),
    })
    render(<WorldMap />)
    fireEvent.click(screen.getByText('Cross the road'))
    expect(screen.getByText(/Time your dash/)).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(5100))
    expect(s().world.campaignEvents).toContain('road_crossed')
    expect(s().world.currentZone).toBe('blighted_road')
  })
  it('opens the crypt boss fight from the map after its gate', () => {
    world({
      currentNode: 'ironhaven',
      currentLocation: 'ironhaven',
      completedQuests: MAIN_QUEST_ORDER.slice(0, 7),
      dungeons: {
        ...s().world.dungeons,
        ashenvale: { ...s().world.dungeons.ashenvale, discovered: true },
      },
    })
    const { unmount } = render(<WorldMap />)
    fireEvent.click(screen.getByText('The Hollow Crypt'))
    expect(s().currentScreen).toBe('zone_view')
    unmount()
    render(<ZoneView />)
    fireEvent.click(screen.getByText('The Hollow Crypt'))
    expect(s().activeCombat.enemies[0].monsterId).toBe('hollow_crypt_boss')
  })
})
