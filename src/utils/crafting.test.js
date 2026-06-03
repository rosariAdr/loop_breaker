// CRF04 — Tests résolution de craft
import { describe, it, expect } from 'vitest'
import { bumpRarity, scoreToTier, resolveCraftOutcome, hitAccuracy, averageAccuracy, alchemyQuantity } from './crafting'

describe('Z04 — alchemyQuantity', () => {
  it('mappe le palier à la quantité produite', () => {
    expect(alchemyQuantity('perfect')).toBe(3)
    expect(alchemyQuantity('good')).toBe(2)
    expect(alchemyQuantity('neutral')).toBe(1)
    expect(alchemyQuantity('fail')).toBe(0)
    expect(alchemyQuantity('catastrophe')).toBe(0)
  })
})

describe('CRF02/03 — hitAccuracy / averageAccuracy', () => {
  it('plein centre = 1', () => {
    expect(hitAccuracy(50, 50, 10)).toBe(1)
  })
  it('au bord de la demi-largeur = 0', () => {
    expect(hitAccuracy(60, 50, 10)).toBe(0)
    expect(hitAccuracy(40, 50, 10)).toBe(0)
  })
  it('à mi-distance = 0.5', () => {
    expect(hitAccuracy(55, 50, 10)).toBeCloseTo(0.5)
  })
  it('au-delà de la zone = 0 (jamais négatif)', () => {
    expect(hitAccuracy(90, 50, 10)).toBe(0)
  })
  it('moyenne de plusieurs frappes', () => {
    expect(averageAccuracy([1, 0.5, 0])).toBeCloseTo(0.5)
    expect(averageAccuracy([])).toBe(0)
  })
})

describe('CRF04 — bumpRarity', () => {
  it('monte de N crans', () => {
    expect(bumpRarity('common', 1)).toBe('rare')
    expect(bumpRarity('common', 2)).toBe('epic')
    expect(bumpRarity('rare', 2)).toBe('legendary')
  })
  it('clampe à la borne haute (exx)', () => {
    expect(bumpRarity('exx', 2)).toBe('exx')
    expect(bumpRarity('ex', 2)).toBe('exx')
  })
  it('0 cran = inchangé', () => {
    expect(bumpRarity('epic', 0)).toBe('epic')
  })
  it('rareté inconnue → inchangée', () => {
    expect(bumpRarity('bogus', 2)).toBe('bogus')
  })
})

describe('CRF04 — scoreToTier', () => {
  it('mappe la précision au bon palier', () => {
    expect(scoreToTier(1.0)).toBe('perfect')
    expect(scoreToTier(0.96)).toBe('perfect')
    expect(scoreToTier(0.80)).toBe('good')
    expect(scoreToTier(0.50)).toBe('neutral')
    expect(scoreToTier(0.20)).toBe('fail')
    expect(scoreToTier(0.05)).toBe('catastrophe')
  })
})

describe('CRF04 — resolveCraftOutcome', () => {
  it('parfait → rareté +2', () => {
    expect(resolveCraftOutcome('common', 'perfect')).toMatchObject({ success: true, rarity: 'epic' })
  })
  it('bon → rareté +1', () => {
    expect(resolveCraftOutcome('common', 'good')).toMatchObject({ success: true, rarity: 'rare' })
  })
  it('neutre → rareté de base', () => {
    expect(resolveCraftOutcome('rare', 'neutral')).toMatchObject({ success: true, rarity: 'rare' })
  })
  it('raté → pas d’objet + debuff non permanent', () => {
    const o = resolveCraftOutcome('rare', 'fail')
    expect(o.success).toBe(false)
    expect(o.rarity).toBeNull()
    expect(o.severity).toBe('fail')
    expect(o.permanentDebuff).toBe(false)
  })
  it('catastrophe → pas d’objet + debuff permanent', () => {
    const o = resolveCraftOutcome('rare', 'catastrophe')
    expect(o.success).toBe(false)
    expect(o.severity).toBe('catastrophe')
    expect(o.permanentDebuff).toBe(true)
  })
})
