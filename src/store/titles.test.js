// TITLE-G1 / TITLE-BUF01 — titre actif unique + statBuffs.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { getTitleStatBuffs, TITLES } from '../data/titles'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('TITLE — titre actif + buffs', () => {
  it('getTitleStatBuffs : buffs du titre, {} si inconnu/null', () => {
    expect(getTitleStatBuffs('demon_lord_slayer')).toEqual(TITLES.demon_lord_slayer.statBuffs)
    expect(getTitleStatBuffs('nope')).toEqual({})
    expect(getTitleStatBuffs(null)).toEqual({})
  })

  it('setActiveTitle : seul un titre GAGNÉ peut être activé ; null désactive', () => {
    s().setActiveTitle('demon_lord_slayer')
    expect(s().meta.activeTitle).toBe(null) // pas gagné → refusé
    s().awardTitle('demon_lord_slayer')
    s().setActiveTitle('demon_lord_slayer')
    expect(s().meta.activeTitle).toBe('demon_lord_slayer')
    s().setActiveTitle(null)
    expect(s().meta.activeTitle).toBe(null)
  })

  it('chaque titre porte des statBuffs', () => {
    for (const t of Object.values(TITLES)) {
      expect(t.statBuffs && Object.keys(t.statBuffs).length).toBeTruthy()
    }
  })
})
