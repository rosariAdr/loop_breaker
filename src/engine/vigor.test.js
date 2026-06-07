// STA01 — Tests du système de Vigueur (Fatigue).
import { describe, it, expect, beforeEach } from 'vitest'
import { getVigorMalus, applyVigorMalus, applyVigorCost, craftFailMultiplier, VIGOR_MAX } from './vigor'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('STA01 — paliers de malus', () => {
  it('≥ 70 → aucun malus', () => {
    expect(getVigorMalus(100).mult).toEqual({})
    expect(getVigorMalus(70).tier).toBe('fresh')
    expect(getVigorMalus(70).craftFailMult).toBe(1)
  })
  it('50–69 → −10% ATK (strength)', () => {
    const m = getVigorMalus(60)
    expect(m.mult).toEqual({ strength: 0.90 })
    expect(m.tier).toBe('tired')
  })
  it('30–49 → −15% ATK + AGI', () => {
    expect(getVigorMalus(40).mult).toEqual({ strength: 0.85, agility: 0.85 })
  })
  it('< 30 → −35% toutes stats + craft fail ×4', () => {
    const m = getVigorMalus(20)
    expect(m.tier).toBe('exhausted')
    expect(m.craftFailMult).toBe(4)
    expect(Object.keys(m.mult)).toHaveLength(5)
  })
})

describe('STA01 — application', () => {
  it('applyVigorMalus réduit les bonnes stats', () => {
    expect(applyVigorMalus({ strength: 20, agility: 20, def: 10 }, 60)).toEqual({ strength: 18, agility: 20, def: 10 })
    expect(applyVigorMalus({ strength: 20 }, 100)).toEqual({ strength: 20 }) // pas de malus
  })
  it('applyVigorCost clampe entre 0 et 100', () => {
    expect(applyVigorCost(100, 3)).toBe(97)
    expect(applyVigorCost(2, 5)).toBe(0)
    expect(applyVigorCost(undefined, 3)).toBe(VIGOR_MAX - 3)
  })
  it('craftFailMultiplier = 4 si épuisé', () => {
    expect(craftFailMultiplier(20)).toBe(4)
    expect(craftFailMultiplier(80)).toBe(1)
  })
})

describe('STA01 — store (coûts & restauration)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('héros démarre à 100 de vigueur', () => {
    expect(store().hero.vigor).toBe(100)
  })
  it('spendVigor / restoreVigor', () => {
    store().spendVigor(30)
    expect(store().hero.vigor).toBe(70)
    store().restoreVigor()
    expect(store().hero.vigor).toBe(100)
  })
  it('un combat coûte 3 de vigueur', () => {
    store().startCombat([{ id: 'w', monsterId: 'ashwood_wolf', name: 'W', stats: { hp: 10, atk: 5, def: 1, spd: 5 }, currentHp: 10, rank: 'common', expReward: 5 }])
    expect(store().hero.vigor).toBe(97)
  })
  it('un voyage coûte 1 de vigueur', () => {
    store().travelTo('millhaven')
    expect(store().hero.vigor).toBe(99)
  })
  it('dormir restaure la vigueur à 100', () => {
    store().spendVigor(50)
    store().sleep()
    expect(store().hero.vigor).toBe(100)
  })
})
