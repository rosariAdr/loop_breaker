// ITM01 — Livres de stats (consommables gain_stat) + STA03b (concentration via livre).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { RESOURCES } from '../data/resources'

const store = () => useGameStore.getState()
const giveBook = (id, n = 1) =>
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      inventory: { ...s.hero.inventory, consumables: { ...s.hero.inventory.consumables, [id]: n } },
    },
  }))

describe('ITM01 — livres de stats', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('les livres déclarent bien un effet gain_stat', () => {
    expect(RESOURCES.tome_of_focus.effect).toEqual({
      type: 'gain_stat',
      stat: 'concentration',
      amount: 10,
    })
    expect(RESOURCES.tome_of_might.isBook).toBe(true)
  })

  it('Tome of Focus → +10 Concentration (STA03b) + consommé', () => {
    giveBook('tome_of_focus', 1)
    expect(store().useBook('tome_of_focus')).toBe(true)
    expect(store().hero.concentration).toBe(10)
    expect(store().hero.inventory.consumables.tome_of_focus).toBe(0)
  })

  it('Tome of Might → +5 Aura', () => {
    giveBook('tome_of_might', 1)
    store().useBook('tome_of_might')
    expect(store().hero.aura).toBe(5)
  })

  it('Tome of Wisdom → +1 Intelligence (permanent, mémorisé)', () => {
    const base = store().hero.stats.intelligence
    giveBook('tome_of_wisdom', 1)
    store().useBook('tome_of_wisdom')
    expect(store().hero.stats.intelligence).toBe(base + 1)
    expect(store().meta.permanentStatBoosts.intelligence).toBe(1)
  })

  it('useBook sans le livre → false', () => {
    expect(store().useBook('tome_of_focus')).toBe(false)
  })
})
