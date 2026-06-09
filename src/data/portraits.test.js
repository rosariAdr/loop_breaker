// UI05 — Tests du manifeste de portraits
import { describe, it, expect } from 'vitest'
import { PORTRAITS, PORTRAIT_EMOTIONS, portraitSrc } from './portraits'

describe('portraits — manifeste', () => {
  it('expose 5 rôles', () => {
    expect(Object.keys(PORTRAITS)).toHaveLength(5)
    expect(PORTRAITS.aldric).toBeDefined()
    expect(PORTRAITS.mage).toBeDefined()
  })
  it('6 émotions', () => {
    expect(PORTRAIT_EMOTIONS).toEqual(['talk', 'calm', 'smile', 'sadness', 'aggression', 'special'])
  })
})

describe('portraitSrc', () => {
  it('construit le chemin rôle + émotion', () => {
    expect(portraitSrc('aldric', 'smile')).toBe('/portraits/aldric/smile.png')
    expect(portraitSrc('mage', 'aggression')).toBe('/portraits/mage/aggression.png')
  })
  it('émotion par défaut = talk', () => {
    expect(portraitSrc('marta')).toBe('/portraits/marta/talk.png')
  })
  it('émotion inconnue → talk', () => {
    expect(portraitSrc('smith', 'bogus')).toBe('/portraits/smith/talk.png')
  })
  it('rôle inconnu → null', () => {
    expect(portraitSrc('priest')).toBeNull()
  })
})
