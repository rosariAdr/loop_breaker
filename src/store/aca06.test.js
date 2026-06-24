// ACA06 — acheter des skills déjà montés (Lv2-5) à prix premium.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { skillPremiumBuyPrice, skillSellPrice, getAcademyLeveledOffers } from '../data/academy'

const s = () => useGameStore.getState()
const setGold = (g) =>
  useGameStore.setState((st) => ({
    hero: { ...st.hero, inventory: { ...st.hero.inventory, gold: g, manaStones: [] } },
  }))

beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('ACA06 — prix premium des skills montés', () => {
  it('= sellPrice(niveau) × (3 au Lv2 → 5 au Lv5)', () => {
    expect(skillPremiumBuyPrice('power_strike', 2)).toBe(
      Math.round(skillSellPrice('power_strike', 2) * 3),
    )
    expect(skillPremiumBuyPrice('power_strike', 5)).toBe(
      Math.round(skillSellPrice('power_strike', 5) * 5),
    )
  })

  it('null hors niveaux 2-5 ou hors catalogue', () => {
    expect(skillPremiumBuyPrice('power_strike', 1)).toBeNull() // Lv1 = achat normal
    expect(skillPremiumBuyPrice('power_strike', 6)).toBeNull()
    expect(skillPremiumBuyPrice('soul_rend', 2)).toBeNull() // skill non catalogué
  })

  it('offres Lv2-5 croissantes', () => {
    const offers = getAcademyLeveledOffers('cleave')
    expect(offers.map((o) => o.level)).toEqual([2, 3, 4, 5])
    for (let i = 1; i < offers.length; i++) {
      expect(offers[i].price).toBeGreaterThan(offers[i - 1].price)
    }
  })

  it('buySkillAtLevel ajoute le mana stone au bon niveau et débite l’or', () => {
    setGold(99999)
    const price = skillPremiumBuyPrice('cleave', 3)
    expect(s().buySkillAtLevel('cleave', 3)).toBe(true)
    const stone = s().hero.inventory.manaStones.find((x) => x.skillId === 'cleave')
    expect(stone?.level).toBe(3)
    expect(s().hero.inventory.gold).toBe(99999 - price)
  })

  it('refuse si or insuffisant', () => {
    setGold(0)
    expect(s().buySkillAtLevel('cleave', 3)).toBe(false)
    expect(s().hero.inventory.manaStones).toHaveLength(0)
  })
})
