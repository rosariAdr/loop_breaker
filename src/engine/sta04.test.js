// STA04 — Atténuation de la Fatigue par l'Aura (combat) et la Concentration (craft).
import { describe, it, expect } from 'vitest'
import { combatFatigueBuffer, craftFatigueBuffer, applyVigorMalus } from './vigor'

describe('STA04 — tampons aux paliers', () => {
  it('combatFatigueBuffer (Aura) : 50% à 100, 70% à 200, 85% à 300', () => {
    expect(combatFatigueBuffer(0)).toBe(0)
    expect(combatFatigueBuffer(100)).toBeCloseTo(0.50)
    expect(combatFatigueBuffer(200)).toBeCloseTo(0.70)
    expect(combatFatigueBuffer(300)).toBeCloseTo(0.85)
    expect(combatFatigueBuffer(400)).toBeCloseTo(0.85) // plafonné
  })
  it('craftFatigueBuffer (Concentration) : 70% à 100, 85% à 200, 100% à 300', () => {
    expect(craftFatigueBuffer(100)).toBeCloseTo(0.70)
    expect(craftFatigueBuffer(200)).toBeCloseTo(0.85)
    expect(craftFatigueBuffer(300)).toBeCloseTo(1.00)
  })
  it('interpolation entre paliers (150 → entre 50% et 70%)', () => {
    expect(combatFatigueBuffer(150)).toBeCloseTo(0.60)
  })
})

describe('STA04 — applyVigorMalus avec buffer', () => {
  it('buffer 0 = malus plein ; buffer 1 = aucun malus', () => {
    expect(applyVigorMalus({ strength: 20 }, 40, 0).strength).toBe(17) // 20×0.85
    expect(applyVigorMalus({ strength: 20 }, 40, 1).strength).toBe(20) // malus annulé
  })
  it('buffer partiel réduit la pénalité', () => {
    const full = applyVigorMalus({ strength: 20 }, 40, 0).strength
    const buffered = applyVigorMalus({ strength: 20 }, 40, 0.5).strength
    expect(buffered).toBeGreaterThan(full)
    expect(buffered).toBeLessThanOrEqual(20)
  })
})
