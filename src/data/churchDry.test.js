// FIX-CHURCH-DRY01 — l'église ne s'assèche plus : pool minimum garanti (CHQ-LOC02) + actes
// de dévotion répétables par bloc de rotation (world.churchDeeds).
import { describe, it, expect } from 'vitest'
import {
  getActiveChurchQuests,
  getAvailableChurchDeeds,
  churchRotationBlock,
  CHURCH_ACTIVE_COUNT,
  CHURCH_QUESTS,
} from './churchQuests'
import { useGameStore } from '../store/gameStore'

describe('FIX-CHURCH-DRY01 — pool minimum + répétabilité', () => {
  it('CHQ-LOC02 : Greywatch (1 seul spot voisin) propose quand même CHURCH_ACTIVE_COUNT deeds distincts', () => {
    const deeds = getActiveChurchQuests(1, CHURCH_ACTIVE_COUNT, 'greywatch')
    expect(deeds.length).toBe(CHURCH_ACTIVE_COUNT)
    expect(new Set(deeds.map((q) => q.id)).size).toBe(CHURCH_ACTIVE_COUNT)
  })

  it('répétabilité : accompli au bloc courant = exclu ; accompli à un bloc antérieur = de nouveau proposé', () => {
    const day = 1
    const block = churchRotationBlock(day)
    const [first] = getActiveChurchQuests(day, CHURCH_ACTIVE_COUNT, 'greywatch')

    const excluded = getAvailableChurchDeeds({
      dayCount: day,
      location: 'greywatch',
      churchDeeds: { [first.id]: block },
    })
    expect(excluded.map((q) => q.id)).not.toContain(first.id)

    const reoffered = getAvailableChurchDeeds({
      dayCount: day,
      location: 'greywatch',
      churchDeeds: { [first.id]: block - 1 }, // accompli à un bloc passé → redevient proposable
    })
    expect(reoffered.map((q) => q.id)).toContain(first.id)
  })

  it('un deed déjà accepté (activeQuests) est exclu des disponibles', () => {
    const [first] = getActiveChurchQuests(1, CHURCH_ACTIVE_COUNT, 'greywatch')
    const avail = getAvailableChurchDeeds({
      dayCount: 1,
      location: 'greywatch',
      activeQuests: [first.id],
    })
    expect(avail.map((q) => q.id)).not.toContain(first.id)
  })
})

describe('FIX-CHURCH-DRY01 — store : churchDeeds stampé à la complétion', () => {
  const s = () => useGameStore.getState()
  it('compléter un acte stampe churchDeeds[id] = bloc courant, sans doublon dans completedQuests', () => {
    s().resetGame()
    localStorage.clear()
    const quest = CHURCH_QUESTS.church_thin_the_pack // 5 ashwood_wolf
    s().startQuest(quest.id)
    useGameStore.setState((st) => ({
      world: { ...st.world, monsterKillCounts: { ...st.world.monsterKillCounts, ashwood_wolf: 5 } },
    }))
    s().completeQuest(quest.id)

    expect(s().world.churchDeeds[quest.id]).toBe(churchRotationBlock(s().world.dayCount))
    expect(s().world.completedQuests.filter((id) => id === quest.id)).toHaveLength(1)
  })
})
