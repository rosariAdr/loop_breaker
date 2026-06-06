// TRV01 — Tests du graphe de la World Map
import { describe, it, expect } from 'vitest'
import { areAdjacent, neighborsOf, EDGES, NODES, POS } from './worldGraph'

describe('worldGraph — adjacence', () => {
  it('areAdjacent est symétrique pour une arête existante', () => {
    expect(areAdjacent('millhaven', 'ironhaven')).toBe(true)
    expect(areAdjacent('ironhaven', 'millhaven')).toBe(true)
  })

  it('areAdjacent = false pour des non-voisins', () => {
    expect(areAdjacent('greywatch', 'ironhaven')).toBe(false)
    expect(areAdjacent('barrow_hills', 'greywatch')).toBe(false)
  })

  it('areAdjacent = false pour un node avec lui-même', () => {
    expect(areAdjacent('ironhaven', 'ironhaven')).toBe(false)
  })

  it('areAdjacent = false si un argument manque', () => {
    expect(areAdjacent(null, 'ironhaven')).toBe(false)
    expect(areAdjacent('ironhaven', undefined)).toBe(false)
  })

  it('neighborsOf liste tous les voisins (symétrique)', () => {
    const n = neighborsOf('ironhaven')
    expect(n).toEqual(expect.arrayContaining(['millhaven', 'thornmarsh', 'barrow_hills', 'crypt']))
    expect(n).toHaveLength(4)
  })

  it('neighborsOf = [] pour un node isolé du graphe', () => {
    expect(neighborsOf('grimspire')).toEqual([])
  })

  it('chaque NODE a une position dans POS', () => {
    NODES.forEach((n) => expect(POS[n.id]).toBeDefined())
  })

  it('chaque extrémité d\'arête a une position', () => {
    EDGES.flat().forEach((id) => expect(POS[id]).toBeDefined())
  })
})
