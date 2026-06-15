// TRV01 / WMAP01-05 — Tests du graphe de la World Map
import { describe, it, expect } from 'vitest'
import {
  areAdjacent,
  neighborsOf,
  EDGES,
  NODES,
  POS,
  MAPS,
  MAP_BRIDGE,
  ALL_NODES,
  ALL_EDGES,
  DUNGEON_NODES,
  getMap,
  getNodeMap,
} from './worldGraph'

describe('worldGraph — adjacence', () => {
  it('areAdjacent est symétrique pour une arête existante', () => {
    expect(areAdjacent('millhaven', 'ironhaven')).toBe(true)
    expect(areAdjacent('ironhaven', 'millhaven')).toBe(true)
  })

  it('areAdjacent = false pour des non-voisins', () => {
    expect(areAdjacent('greywatch', 'ironhaven')).toBe(false)
    expect(areAdjacent('wildmere_hills', 'greywatch')).toBe(false)
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
    expect(n).toEqual(
      expect.arrayContaining(['millhaven', 'thornmarsh', 'wildmere_hills', 'crypt']),
    )
    expect(n).toHaveLength(4)
  })

  it('neighborsOf = [] pour un node isolé du graphe', () => {
    expect(neighborsOf('grimspire')).toEqual([])
  })

  it('chaque NODE a une position dans POS', () => {
    NODES.forEach((n) => expect(POS[n.id]).toBeDefined())
  })

  it("chaque extrémité d'arête a une position", () => {
    EDGES.flat().forEach((id) => expect(POS[id]).toBeDefined())
  })
})

// WMAP01/04/05 — structure v2 : conteneurs de carte, nodes typés, pont, donjons.
describe('worldGraph v2 — cartes & topologie', () => {
  it('expose 2 conteneurs de carte (map1 / map2) via MAPS', () => {
    expect(MAPS.map1.id).toBe('map1')
    expect(MAPS.map2.id).toBe('map2')
    expect(MAPS.map1.nodes.length).toBeGreaterThan(0)
    expect(MAPS.map2.frozen).toBe(true) // Map 2 gelée (contenu MQ07-10 à construire)
  })

  it('getMap retourne le conteneur par id, null sinon', () => {
    expect(getMap('map1')).toBe(MAPS.map1)
    expect(getMap('map2')).toBe(MAPS.map2)
    expect(getMap('inexistant')).toBeNull()
  })

  it('getNodeMap localise un node sur sa carte', () => {
    expect(getNodeMap('ironhaven')).toBe('map1')
    expect(getNodeMap('goblin_cave')).toBe('map1') // WMAP05 — donjon de Map 1
    expect(getNodeMap('stonehaven')).toBe('map2')
    expect(getNodeMap('demon_lord')).toBe('map2') // WMAP05 — Demon Lord déplacé sur Map 2
    expect(getNodeMap('inexistant')).toBeNull()
  })

  it('chaque node typé porte un kind valide', () => {
    const kinds = new Set(['village', 'city', 'spot', 'dungeon'])
    ALL_NODES.forEach((n) => expect(kinds.has(n.kind)).toBe(true))
  })

  it('NODES (rétro-compat) = settlements + spots de Map 1, sans donjon', () => {
    expect(NODES.every((n) => n.kind !== 'dungeon')).toBe(true)
    // Tous les NODES rétro-compat appartiennent à Map 1.
    NODES.forEach((n) => expect(getNodeMap(n.id)).toBe('map1'))
  })

  it('DUNGEON_NODES regroupe tous les donjons des 2 cartes', () => {
    expect(DUNGEON_NODES.every((n) => n.kind === 'dungeon')).toBe(true)
    const ids = DUNGEON_NODES.map((n) => n.id)
    expect(ids).toEqual(
      expect.arrayContaining(['crypt', 'goblin_cave', 'vampire_castle', 'demon_lord']),
    )
  })

  it('MAP_BRIDGE relie Ironhaven (Map 1) à Stonehaven (Map 2)', () => {
    expect(MAP_BRIDGE).toEqual(['ironhaven', 'stonehaven'])
    expect(getNodeMap(MAP_BRIDGE[0])).toBe('map1')
    expect(getNodeMap(MAP_BRIDGE[1])).toBe('map2')
    // Le pont fait partie de la vue agrégée des arêtes.
    expect(ALL_EDGES).toContain(MAP_BRIDGE)
  })

  it('Map 1 = 8 arêtes, Map 2 = 5 arêtes (+ pont)', () => {
    expect(MAPS.map1.edges).toHaveLength(8)
    expect(MAPS.map2.edges).toHaveLength(5)
    expect(ALL_EDGES).toHaveLength(8 + 5 + 1)
  })
})
