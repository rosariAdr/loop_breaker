import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { readyQuest } from '../test/questFixtures'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('main quest access and guaranteed rewards', () => {
  it('only the first mission is initially available', () => {
    expect(s().isMainQuestAvailable('mq01_waking')).toBe(true)
    expect(s().isMainQuestAvailable('mq02_millhaven_road')).toBe(false)
  })
  it('five wolf victories and a turn-in open the second mission and idle', () => {
    s().startQuest('mq01_waking')
    for (let n = 0; n < 5; n++) s().recordKill('ashwood_wolf')
    s().completeQuest('mq01_waking')
    expect(s().world.idleUnlocked).toBe(true)
    expect(s().isMainQuestAvailable('mq02_millhaven_road')).toBe(true)
  })
  it('Oakheart victory opens Millhaven without consuming rare resources', () => {
    readyQuest('mq02_millhaven_road')
    s().addResource('earth_crystal', 3)
    s().completeQuest('mq02_millhaven_road')
    expect(s().world.unlockedNodes).toContain('millhaven')
    expect(s().hero.inventory.resources.earth_crystal).toBe(3)
    expect(
      s().hero.inventory.equipment.find((e) => e.templateId === 'oakheart_branch')?.rarity,
    ).toBe('rare')
  })
  it('the reconnaissance briefing opens both destinations before visiting them', () => {
    useGameStore.setState((st) => ({
      world: { ...st.world, completedQuests: ['mq02_millhaven_road'] },
    }))
    s().startQuest('mq03_new_horizons')
    expect(s().world.unlockedNodes).toEqual(
      expect.arrayContaining(['wildmere_hills', 'crumbled_ruins']),
    )
    expect(s().isQuestComplete('mq03_new_horizons')).toBe(false)
    s().recordVisit('crumbled_ruins')
    s().completeQuest('mq03_new_horizons')
    expect(s().world.completedQuests).toContain('mq03_new_horizons')
  })
  it('cannot obtain the same main-quest weapon twice', () => {
    readyQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    expect(
      s().hero.inventory.equipment.filter((e) => e.templateId === 'oakheart_branch'),
    ).toHaveLength(1)
  })
  it('accepting the elite mission teaches deterministic progression', () => {
    readyQuest('mq02_millhaven_road')
    expect(s().meta.seenHints).toContain('mq_elite_turnin')
  })
})
