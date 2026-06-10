// FIX-QUESTSNAP01 — la progression d'une quête est comptée DEPUIS l'acceptation (delta),
// pas sur le cumul à vie. Une quête déjà « remplie » en cumulé n'est plus instantanément rendable.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { QUESTS } from '../data/quests'

const killQuest = Object.values(QUESTS).find(
  (q) => q.objectives.length === 1 && q.objectives[0].type === 'kill',
)

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

describe('FIX-QUESTSNAP01 — snapshot de progression à l’acceptation', () => {
  it('startQuest fige un snapshot des compteurs cumulés', () => {
    const obj = killQuest.objectives[0]
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { [obj.monsterId]: obj.count + 7 } },
    }))
    useGameStore.getState().startQuest(killQuest.id)
    const snap = useGameStore.getState().world.questProgress[killQuest.id]
    expect(snap.baseKills[obj.monsterId]).toBe(obj.count + 7)
  })

  it('une quête déjà remplie en cumulé n’est PAS instantanément complétable', () => {
    const obj = killQuest.objectives[0]
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { [obj.monsterId]: obj.count + 7 } },
    }))
    useGameStore.getState().startQuest(killQuest.id)
    expect(useGameStore.getState().isQuestComplete(killQuest.id)).toBe(false)
  })

  it('seuls les kills APRÈS acceptation comptent (delta)', () => {
    const obj = killQuest.objectives[0]
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { [obj.monsterId]: 7 } },
    }))
    useGameStore.getState().startQuest(killQuest.id)
    // (count - 1) kills depuis l'acceptation → pas encore complète
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { [obj.monsterId]: 7 + obj.count - 1 } },
    }))
    expect(useGameStore.getState().isQuestComplete(killQuest.id)).toBe(false)
    // 1 kill de plus → complète
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { [obj.monsterId]: 7 + obj.count } },
    }))
    expect(useGameStore.getState().isQuestComplete(killQuest.id)).toBe(true)
  })
})
