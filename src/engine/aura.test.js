// STA02 — Tests de l'Aura.
import { describe, it, expect, beforeEach } from 'vitest'
import { countWithinDays, auraDamageMult, AURA } from './aura'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('STA02 — helpers', () => {
  it('countWithinDays = fenêtre glissante', () => {
    expect(countWithinDays([1, 1, 2, 3], 4, 4)).toBe(4) // tous < 4 jours
    expect(countWithinDays([1, 1, 1], 6, 4)).toBe(0)    // 6-1=5 ≥ 4
    expect(countWithinDays([], 5, 4)).toBe(0)
  })
  it('auraDamageMult = 1 + 0.5%/point', () => {
    expect(auraDamageMult(0)).toBe(1)
    expect(auraDamageMult(20)).toBeCloseTo(1.1)
    expect(auraDamageMult(15)).toBeCloseTo(1.075)
  })
})

describe('STA02 — recordSkillUse (déblocage + gain)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('Aura se débloque à 15 skills en <4 jours (= 15 d\'Aura)', () => {
    expect(store().hero.aura).toBe(0)
    for (let i = 0; i < 14; i++) store().recordSkillUse()
    expect(store().hero.aura).toBe(0) // pas encore
    store().recordSkillUse() // 15e
    expect(store().hero.aura).toBe(AURA.startValue) // 15
  })

  it('+1 Aura tous les 10 skills après déblocage', () => {
    for (let i = 0; i < 15; i++) store().recordSkillUse() // unlock → 15
    expect(store().hero.aura).toBe(15)
    for (let i = 0; i < 5; i++) store().recordSkillUse() // total 20 → +1
    expect(store().hero.aura).toBe(16)
  })

  it('grantAura (entraînement maître) ajoute directement', () => {
    store().grantAura(15)
    expect(store().hero.aura).toBe(15)
  })
})
