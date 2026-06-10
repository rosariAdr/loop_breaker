// STA03 — Tests de la Concentration (qualité de craft).
import { describe, it, expect, beforeEach } from 'vitest'
import {
  concentrationGain,
  concentrationBumpChance,
  rollConcentrationBump,
  resolveCraftOutcome,
} from './crafting'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('STA03 — gain & chance', () => {
  it('concentrationGain par tier : +5 / +2 / +1 / 0', () => {
    expect(concentrationGain('perfect')).toBe(5)
    expect(concentrationGain('good')).toBe(2)
    expect(concentrationGain('neutral')).toBe(1)
    expect(concentrationGain('fail')).toBe(0)
  })
  it('concentrationBumpChance = concentration/150 (plafonné à 1)', () => {
    expect(concentrationBumpChance(0)).toBe(0)
    expect(concentrationBumpChance(75)).toBeCloseTo(0.5)
    expect(concentrationBumpChance(150)).toBe(1)
    expect(concentrationBumpChance(300)).toBe(1)
  })
  it('rollConcentrationBump : déterministe via rng injecté', () => {
    expect(rollConcentrationBump(150, () => 0.99)).toBe(1) // 150 → garanti
    expect(rollConcentrationBump(75, () => 0.4)).toBe(1) // 0.4 < 0.5
    expect(rollConcentrationBump(75, () => 0.6)).toBe(0) // 0.6 ≥ 0.5
    expect(rollConcentrationBump(0, () => 0)).toBe(0)
  })
})

describe('STA03 — resolveCraftOutcome extraBump', () => {
  it('extraBump ajoute des crans de rareté', () => {
    expect(resolveCraftOutcome('common', 'neutral', 0).rarity).toBe('common')
    expect(resolveCraftOutcome('common', 'neutral', 1).rarity).not.toBe('common')
    // sans extraBump, comportement d'origine inchangé
    expect(resolveCraftOutcome('common', 'perfect').success).toBe(true)
  })
})

describe('STA03 — store gainConcentration', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })
  it('ajoute et plafonne à 150', () => {
    store().gainConcentration(5)
    expect(store().hero.concentration).toBe(5)
    store().gainConcentration(200)
    expect(store().hero.concentration).toBe(150)
  })
})
