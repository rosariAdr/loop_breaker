// STA01b — Fatigue finalisée : +40 sur échec, craft-fail ×4 sous 30, debuff « fatigue » retiré.
import { describe, it, expect } from 'vitest'
import { VIGOR_COST, getVigorMalus, craftFailMultiplier } from './vigor'
import { DEBUFFS, getDebuff } from '../data/debuffs'

describe('STA01b — Fatigue', () => {
  it('+40 Fatigue sur échec (failedCraft)', () => {
    expect(VIGOR_COST.failedCraft).toBe(40)
  })

  it('craft-fail ×4 sous 30 vigueur, ×1 au-dessus', () => {
    expect(craftFailMultiplier(29)).toBe(4)
    expect(getVigorMalus(29).craftFailMult).toBe(4)
    expect(craftFailMultiplier(30)).toBe(1)
    expect(craftFailMultiplier(100)).toBe(1)
  })

  it('debuff « fatigue » dormant retiré (renommé Sluggish, sans doublon de la Vigueur)', () => {
    expect(DEBUFFS.fatigue).toBeUndefined()
    expect(getDebuff('sluggish')?.name).toBe('Sluggish')
    expect(getDebuff('sluggish')?.stat).toBe('agility')
  })
})
