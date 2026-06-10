// CRF06 — L'antidote soigne les debuffs (CRF01), y compris permanents.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { RESOURCES } from '../data/resources'

const store = () => useGameStore.getState()

describe('CRF06 — antidote / cure des debuffs', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('antidote_basic déclare bien cureDebuffs', () => {
    expect(RESOURCES.antidote_basic.effect.cureDebuffs).toBe(true)
  })

  it('cureHeroDebuffs retire tous les debuffs actifs (temp + permanents) et renvoie le compte', () => {
    store().addHeroDebuff('poisoned', 7, false)
    store().addHeroDebuff('burnt_hands', 0, true) // permanent
    expect(store().hero.activeDebuffs.length).toBe(2)
    const cured = store().cureHeroDebuffs()
    expect(cured).toBe(2)
    expect(store().hero.activeDebuffs).toHaveLength(0)
  })

  it('cureHeroDebuffs sans debuff → renvoie 0', () => {
    expect(store().cureHeroDebuffs()).toBe(0)
  })
})
