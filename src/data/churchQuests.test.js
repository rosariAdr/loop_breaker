// CHQ01 — Quêtes de l'église : rotation 3 jours + récompenses tokens + consommables (sans gold).
import { describe, it, expect, beforeEach } from 'vitest'
import {
  CHURCH_QUESTS,
  getActiveChurchQuests,
  churchRotationBlock,
  CHURCH_ACTIVE_COUNT,
  CHURCH_ROTATION_DAYS,
} from './churchQuests'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('CHQ01 — rotation du pool de quêtes', () => {
  it('expose un pool de quêtes (≥ 4)', () => {
    expect(Object.keys(CHURCH_QUESTS).length).toBeGreaterThanOrEqual(4)
  })

  it('le bloc de rotation change tous les 3 jours', () => {
    expect(churchRotationBlock(1)).toBe(0)
    expect(churchRotationBlock(2)).toBe(0)
    expect(churchRotationBlock(3)).toBe(1)
    expect(churchRotationBlock(5)).toBe(1)
    expect(churchRotationBlock(6)).toBe(2)
    expect(CHURCH_ROTATION_DAYS).toBe(3)
  })

  it('propose CHURCH_ACTIVE_COUNT quêtes par fenêtre', () => {
    const q = getActiveChurchQuests(1)
    expect(q.length).toBe(CHURCH_ACTIVE_COUNT)
  })

  it('même journée → même sélection (déterministe)', () => {
    expect(getActiveChurchQuests(1).map((q) => q.id)).toEqual(
      getActiveChurchQuests(2).map((q) => q.id),
    )
  })

  it("la sélection change d'un bloc à l'autre", () => {
    const block0 = getActiveChurchQuests(1).map((q) => q.id)
    const block1 = getActiveChurchQuests(3).map((q) => q.id)
    expect(block0).not.toEqual(block1)
  })

  it("aucune quête d'église ne récompense de l'or", () => {
    for (const q of Object.values(CHURCH_QUESTS)) {
      expect(q.reward.gold ?? 0).toBe(0)
      expect(q.reward.consumables || q.reward.reputationTokens).toBeTruthy()
    }
  })
})

describe('CHQ01 — récompense via completeQuest (tokens + consommables, sans or)', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it("compléter une quête d'église octroie tokens + consommables et PAS d'or", () => {
    const quest = CHURCH_QUESTS.church_thin_the_pack // 5 ashwood_wolf → 1 token + 3 stamina_ration
    const goldBefore = store().hero.inventory.gold
    const tokensBefore = store().hero.reputationTokens
    const rationBefore = store().hero.inventory.consumables.stamina_ration ?? 0

    // accepte + remplit l'objectif
    store().startQuest(quest.id)
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { ...s.world.monsterKillCounts, ashwood_wolf: 5 } },
    }))
    expect(store().isQuestComplete(quest.id)).toBe(true)

    store().completeQuest(quest.id)

    expect(store().hero.inventory.gold).toBe(goldBefore) // jamais d'or
    expect(store().hero.reputationTokens).toBe(tokensBefore + 1)
    expect(store().hero.inventory.consumables.stamina_ration).toBe(rationBefore + 3)
    expect(store().world.completedQuests).toContain(quest.id)
  })

  it("une quête d'église est résolue par le registre (startQuest/isQuestComplete)", () => {
    const quest = CHURCH_QUESTS.church_purge_slimes
    store().startQuest(quest.id)
    expect(store().world.activeQuests).toContain(quest.id)
    expect(store().isQuestComplete(quest.id)).toBe(false)
  })
})
