// HS-STATPERK01 — paliers de stats data-driven.
import { describe, it, expect } from 'vitest'
import {
  STAT_MILESTONE_STEP,
  STAT_MILESTONES,
  milestonesFor,
  getStatMilestoneBonuses,
} from './statMilestones'

describe('HS-STATPERK01 — STAT_MILESTONES', () => {
  it('palier tous les 35 points', () => {
    expect(STAT_MILESTONE_STEP).toBe(35)
  })

  it('milestonesFor : 0/34 → 0, 35 → 1, 80 → 2, négatif/undefined → 0', () => {
    expect(milestonesFor(0)).toBe(0)
    expect(milestonesFor(34)).toBe(0)
    expect(milestonesFor(35)).toBe(1)
    expect(milestonesFor(80)).toBe(2)
    expect(milestonesFor(-5)).toBe(0)
    expect(milestonesFor(undefined)).toBe(0)
  })

  it('bonus cumulés par attribut', () => {
    const b = getStatMilestoneBonuses({
      strength: 70,
      intelligence: 35,
      agility: 105,
      chance: 70,
      def: 35,
    })
    expect(b.physDmg).toBeCloseTo(0.06)
    expect(b.magicDmg).toBeCloseTo(0.03)
    expect(b.evasion).toBeCloseTo(0.09)
    expect(b.luck).toBeCloseTo(0.04)
    expect(b.reduction).toBeCloseTo(0.03)
  })

  it('stats vides → tous bonus à 0', () => {
    const b = getStatMilestoneBonuses({})
    expect(Object.values(b).every((v) => v === 0)).toBe(true)
  })

  it('les 5 attributs ont un palier défini (per + label)', () => {
    for (const k of ['strength', 'agility', 'intelligence', 'chance', 'def']) {
      expect(STAT_MILESTONES[k].per).toBeGreaterThan(0)
      expect(STAT_MILESTONES[k].label).toBeTruthy()
    }
  })
})
