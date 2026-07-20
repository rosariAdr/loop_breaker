// FIX-QXP01 — les quêtes octroient de l'XP de héros (plein la 1ʳᵉ fois, réduit sur re-complétion).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { getQuestById, questXpReward, defaultQuestXp, QUEST_XP_REPEAT_MULT } from '../data/quests'

const s = () => useGameStore.getState()

beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('FIX-QXP01 — XP de quête', () => {
  it("questXpReward : reward.xp prioritaire, sinon défaut dérivé de l'or (plancher 10)", () => {
    expect(questXpReward({ reward: { xp: 123, gold: 50 } })).toBe(123)
    expect(defaultQuestXp({ reward: { gold: 50 } })).toBe(30) // max(10, round(50*0.6))
    expect(defaultQuestXp({ reward: {} })).toBe(10)
    expect(questXpReward({ reward: { gold: 50 } })).toBe(30)
  })

  it("compléter une quête (1ère fois) octroie l'XP plein au héros", () => {
    const quest = getQuestById('mq01_waking') // QSV2-DROPDUP01 — ex-first_blood
    s().startQuest('mq01_waking')
    useGameStore.setState((st) => ({
      world: { ...st.world, monsterKillCounts: { ...st.world.monsterKillCounts, ashwood_wolf: 5 } },
    }))
    const before = { exp: s().hero.exp, level: s().hero.level }
    s().completeQuest('mq01_waking')
    const gain = questXpReward(quest)
    if (s().hero.level === before.level) {
      expect(s().hero.exp).toBe(before.exp + gain)
    } else {
      expect(s().hero.level).toBeGreaterThan(before.level) // a level-up (XP absorbée)
    }
  })

  it('re-complétion (déjà dans completedQuests) → XP réduite (×MULT)', () => {
    const quest = getQuestById('mq01_waking')
    useGameStore.setState((st) => ({
      world: {
        ...st.world,
        completedQuests: ['mq01_waking'],
        activeQuests: ['mq01_waking'],
        monsterKillCounts: { ...st.world.monsterKillCounts, ashwood_wolf: 5 },
      },
    }))
    const before = { exp: s().hero.exp, level: s().hero.level }
    s().completeQuest('mq01_waking')
    const expected = Math.round(questXpReward(quest) * QUEST_XP_REPEAT_MULT)
    if (s().hero.level === before.level) {
      expect(s().hero.exp).toBe(before.exp + expected)
    } else {
      expect(s().hero.level).toBeGreaterThan(before.level)
    }
  })
})
