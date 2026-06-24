// QSV2-TIMED01 — quêtes chronométrées : snapshot acceptedDay, compte à rebours, expiration.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { getQuestById, questDaysLeft, isQuestExpired } from '../data/quests'

const s = () => useGameStore.getState()
const setDay = (d) => useGameStore.setState((st) => ({ world: { ...st.world, dayCount: d } }))

beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('QSV2-TIMED01 — quêtes chronométrées', () => {
  const tid = 'vq_greywatch_patrol_ashenvale_forest' // patrouille de village (deadlineDays: 4)

  it('la patrouille de village porte une deadlineDays', () => {
    expect(getQuestById(tid)?.deadlineDays).toBe(4)
  })

  it('snapshot acceptedDay + daysLeft décroît avec dayCount', () => {
    setDay(2)
    s().startQuest(tid)
    expect(s().world.activeQuests).toContain(tid)
    expect(s().world.questProgress[tid].acceptedDay).toBe(2)
    const q = getQuestById(tid)
    expect(questDaysLeft(q, s().world)).toBe(4)
    setDay(5)
    expect(questDaysLeft(q, s().world)).toBe(1) // 4 - (5 - 2)
    expect(isQuestExpired(q, s().world)).toBe(false)
  })

  it('expire après l’échéance et est retirée par pruneExpiredQuests (re-pool)', () => {
    setDay(1)
    s().startQuest(tid)
    setDay(7) // 4 - (7 - 1) = -2 < 0
    expect(isQuestExpired(getQuestById(tid), s().world)).toBe(true)
    s().pruneExpiredQuests()
    expect(s().world.activeQuests).not.toContain(tid)
    expect(s().world.questProgress[tid]).toBeUndefined()
  })

  it('ne touche pas les quêtes non chronométrées', () => {
    s().startQuest('first_blood') // pas de deadline
    setDay(50)
    s().pruneExpiredQuests()
    expect(s().world.activeQuests).toContain('first_blood')
  })
})
