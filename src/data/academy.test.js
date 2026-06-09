// ACA01/ACA03 — Tests du catalogue Académie + prix + achat/vente.
import { describe, it, expect, beforeEach } from 'vitest'
import { skillValueAtLevel, skillBuyPrice, skillSellPrice, getAcademyCatalog, ACADEMY_CATALOG } from './academy'
import { useGameStore } from '../store/gameStore'

const store = () => useGameStore.getState()

describe('ACA03 — plus-value au niveau', () => {
  it('skillValueAtLevel = base × 1.15^(niveau−1)', () => {
    expect(skillValueAtLevel(100, 1)).toBe(100)
    expect(skillValueAtLevel(100, 2)).toBe(115)
    expect(skillValueAtLevel(100, 3)).toBe(132) // 100 × 1.3225
    expect(skillValueAtLevel(100, 5)).toBe(175) // 100 × 1.749
  })

  it('skillBuyPrice : catalogue / null hors catalogue', () => {
    expect(skillBuyPrice('power_strike')).toBe(120)
    expect(skillBuyPrice('soul_rend')).toBeNull() // skill suprême non achetable
  })

  it('skillSellPrice augmente avec le niveau (plus-value)', () => {
    const lv1 = skillSellPrice('power_strike', 1)
    const lv5 = skillSellPrice('power_strike', 5)
    expect(lv5).toBeGreaterThan(lv1)
  })

  it('getAcademyCatalog renvoie des entrées valides (skill défini)', () => {
    const cat = getAcademyCatalog()
    expect(cat.length).toBe(Object.keys(ACADEMY_CATALOG).length)
    cat.forEach((e) => { expect(e.skill).toBeDefined(); expect(e.price).toBeGreaterThan(0) })
  })
})

describe('ACA01 — buySkill / sellSkill', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('buySkill : assez d\'or → mana stone ajouté + or débité', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 500, manaStones: [] } } }))
    const ok = store().buySkill('power_strike')
    expect(ok).toBe(true)
    expect(store().hero.inventory.gold).toBe(380) // 500 − 120
    expect(store().hero.inventory.manaStones.some((m) => m.skillId === 'power_strike')).toBe(true)
  })

  it('buySkill : or insuffisant → refus, aucun changement', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 50, manaStones: [] } } }))
    const ok = store().buySkill('power_strike')
    expect(ok).toBe(false)
    expect(store().hero.inventory.gold).toBe(50)
    expect(store().hero.inventory.manaStones).toHaveLength(0)
  })

  it('sellSkill : retire une copie + crédite l\'or selon le niveau', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 0, manaStones: [{ skillId: 'power_strike', level: 3, xp: 0 }] } } }))
    const ok = store().sellSkill('power_strike')
    expect(ok).toBe(true)
    expect(store().hero.inventory.manaStones).toHaveLength(0)
    expect(store().hero.inventory.gold).toBe(skillSellPrice('power_strike', 3))
  })

  it('sellSkill : skill non possédé → false', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, inventory: { ...s.hero.inventory, manaStones: [] } } }))
    expect(store().sellSkill('power_strike')).toBe(false)
  })
})
