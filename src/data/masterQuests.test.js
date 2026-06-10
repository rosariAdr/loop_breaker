// ACA04 — Quêtes de level-up de skill : objectif skill_levelup + récompenses (gold + aura/conc/skill).
import { describe, it, expect, beforeEach } from 'vitest'
import { MASTER_QUESTS } from './masterQuests'
import { heroSkillLevels } from './quests'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('ACA04 — heroSkillLevels', () => {
  it('agrège le niveau le plus élevé par skillId (équipé + réserve)', () => {
    const hero = {
      activeSkills: [{ skillId: 'cleave', level: 2 }],
      passiveSkills: [{ skillId: 'veterans_resolve', level: 1 }],
      divineSkill: null,
      inventory: { manaStones: [{ skillId: 'cleave', level: 3 }] },
    }
    const map = heroSkillLevels(hero)
    expect(map.cleave).toBe(3) // garde le max
    expect(map.veterans_resolve).toBe(1)
  })
})

describe('ACA04 — objectif skill_levelup', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it("chaque quête de maître cible un skill_levelup et récompense de l'or", () => {
    for (const q of Object.values(MASTER_QUESTS)) {
      expect(q.objectives[0].type).toBe('skill_levelup')
      expect(q.objectives[0].targetLevel).toBeGreaterThanOrEqual(2)
      expect(q.reward.gold).toBeGreaterThan(0)
    }
  })

  it("isQuestComplete = false tant que le skill n'a pas atteint le niveau", () => {
    const q = MASTER_QUESTS.master_sharpen_strike // counter_strike Lv2
    store().startQuest(q.id)
    expect(store().isQuestComplete(q.id)).toBe(false)
    // skill au niveau 1 → toujours incomplet
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'counter_strike', level: 1, xp: 0 }] },
    }))
    expect(store().isQuestComplete(q.id)).toBe(false)
    // niveau 2 → complet
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'counter_strike', level: 2, xp: 0 }] },
    }))
    expect(store().isQuestComplete(q.id)).toBe(true)
  })

  it('récompense Aura : completeQuest octroie gold + Aura', () => {
    const q = MASTER_QUESTS.master_sharpen_strike // gold 80 + aura 5
    const goldBefore = store().hero.inventory.gold
    const auraBefore = store().hero.aura ?? 0
    store().startQuest(q.id)
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'counter_strike', level: 2, xp: 0 }] },
    }))
    store().completeQuest(q.id)
    expect(store().hero.inventory.gold).toBe(goldBefore + 80)
    expect(store().hero.aura).toBe(auraBefore + 5)
  })

  it('récompense Concentration : completeQuest octroie gold + Concentration', () => {
    const q = MASTER_QUESTS.master_focus_cleave // gold 100 + concentration 5
    const concBefore = store().hero.concentration ?? 0
    store().startQuest(q.id)
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'cleave', level: 2, xp: 0 }] },
    }))
    store().completeQuest(q.id)
    expect(store().hero.concentration).toBe(concBefore + 5)
  })
})
