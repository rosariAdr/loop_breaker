// TAV01 — Tests informateurs (data + achat d'info)
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { INFORMANTS, getInformant } from '../data/informants'

describe('TAV01 — informateurs', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('getInformant retourne une info existante ou null', () => {
    expect(getInformant(INFORMANTS[0].id)).toBe(INFORMANTS[0])
    expect(getInformant('nope')).toBeNull()
  })

  it('chaque info a teaser / reveal / price', () => {
    for (const i of INFORMANTS) {
      expect(i.teaser).toBeTruthy()
      expect(i.reveal).toBeTruthy()
      expect(typeof i.price).toBe('number')
    }
  })

  it('knownInfo vide par défaut', () => {
    expect(useGameStore.getState().meta.knownInfo).toEqual([])
  })

  it("buyInfo dépense l'or, ajoute à knownInfo, retourne true", () => {
    useGameStore.getState().addGold(100)
    const inf = INFORMANTS[0]
    const goldBefore = useGameStore.getState().hero.inventory.gold
    expect(useGameStore.getState().buyInfo(inf.id, inf.price)).toBe(true)
    expect(useGameStore.getState().meta.knownInfo).toContain(inf.id)
    expect(useGameStore.getState().hero.inventory.gold).toBe(goldBefore - inf.price)
  })

  it('buyInfo refuse si or insuffisant ou info déjà connue', () => {
    const inf = INFORMANTS[0]
    expect(useGameStore.getState().buyInfo(inf.id, inf.price)).toBe(false) // gold 0
    useGameStore.getState().addGold(1000)
    expect(useGameStore.getState().buyInfo(inf.id, inf.price)).toBe(true)
    expect(useGameStore.getState().buyInfo(inf.id, inf.price)).toBe(false) // déjà connue
  })
})
