// B6 — la chaîne principale (MQ-CHAIN01) est surfacée sur le board de son Doyen,
// gated par le chaînage : c'est ce qui rend le départ verrouillé (START02) jouable.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import QuestBoard from './QuestBoard'
import { useGameStore } from '../store/gameStore'

const atGreywatch = () =>
  useGameStore.setState((s) => ({
    hero: { ...s.hero, heroNamed: true, name: 'Tester' },
    world: { ...s.world, currentLocation: 'greywatch', currentNode: 'greywatch' },
  }))

beforeEach(() => {
  useGameStore.getState().resetGame()
  atGreywatch()
  localStorage.clear()
})
afterEach(cleanup)

describe('B6 — board de Greywatch (Doyen)', () => {
  it('affiche le premier palier (mq01) au départ', () => {
    render(<QuestBoard />)
    expect(screen.getByText('The Waking')).toBeInTheDocument()
  })

  it('mq02 n’apparaît qu’après mq01 (chaînage)', () => {
    const { rerender } = render(<QuestBoard />)
    expect(screen.queryByText('The Road to Millhaven')).toBeNull()

    useGameStore.getState().startQuest('mq01_waking')
    useGameStore.getState().completeQuest('mq01_waking')
    rerender(<QuestBoard />)
    expect(screen.getByText('The Road to Millhaven')).toBeInTheDocument()
  })
})
