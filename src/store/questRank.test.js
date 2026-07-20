// FIX-QRANK01 — points de rang d'aventurier (compteur dédié rankPoints, échelle 10 paliers).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { getQuestById, questRankPoints, defaultQuestRankPoints } from '../data/quests'
import { getRankInfo } from '../data/ranks'
import { QUEST_BALANCE } from '../data/questBalance'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('FIX-QRANK01 — points de rang', () => {
  it('questRankPoints : overlay QUEST_BALANCE prioritaire, sinon reward.rankPoints', () => {
    expect(questRankPoints(getQuestById('mq01_waking'))).toBe(QUEST_BALANCE.mq01_waking.rankPoints)
    expect(questRankPoints({ id: 'inconnu', reward: { rankPoints: 4 } })).toBe(4)
  })

  it('défaut par tier (quêtes de village) : easy 1 / medium 3 / hard 5', () => {
    expect(defaultQuestRankPoints({ difficultyTier: 'easy', objectives: [{ type: 'kill' }] })).toBe(
      1,
    )
    expect(defaultQuestRankPoints({ difficultyTier: 'mid', objectives: [{ type: 'kill' }] })).toBe(
      3,
    )
    expect(defaultQuestRankPoints({ difficultyTier: 'hard', objectives: [{ type: 'kill' }] })).toBe(
      5,
    )
  })

  it('visites → 0 point (INUTILE)', () => {
    expect(
      defaultQuestRankPoints({ difficultyTier: 'hard', objectives: [{ type: 'visit' }] }),
    ).toBe(0)
  })

  it('compléter une quête (1ère fois) octroie les rankPoints pleins + fait avancer le rang', () => {
    const before = s().hero.rankPoints ?? 0
    s().startQuest('mq01_waking')
    useGameStore.setState((st) => ({
      world: { ...st.world, monsterKillCounts: { ...st.world.monsterKillCounts, ashwood_wolf: 5 } },
    }))
    s().completeQuest('mq01_waking')
    const gain = questRankPoints(getQuestById('mq01_waking'))
    expect(s().hero.rankPoints).toBe(before + gain)
    expect(getRankInfo(s().hero.rankPoints).label).toBe('Aluminium')
  })

  it('re-complétion → rankPoints réduits (×0.25)', () => {
    useGameStore.setState((st) => ({
      world: {
        ...st.world,
        completedQuests: ['nc_thunderhoof_elite'],
        activeQuests: ['nc_thunderhoof_elite'],
      },
    }))
    const before = s().hero.rankPoints ?? 0
    s().completeQuest('nc_thunderhoof_elite')
    const expected = Math.round(questRankPoints(getQuestById('nc_thunderhoof_elite')) * 0.25) // 5 → 1
    expect(s().hero.rankPoints).toBe(before + expected)
  })

  it('intégrité : tout id de QUEST_BALANCE résout via getQuestById', () => {
    for (const id of Object.keys(QUEST_BALANCE)) {
      expect(getQuestById(id), `${id} introuvable`).toBeTruthy()
    }
  })
})
