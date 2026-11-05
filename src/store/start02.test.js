// START02/04 — Déblocage des nodes : au départ seuls Greywatch + la forêt sont
// ouverts ; les autres s'ouvrent via la chaîne principale (world.unlockedNodes).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { isNodeUnlocked, START_OPEN_NODES } from '../data/zones'

const s = () => useGameStore.getState()

beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('START02 — helper isNodeUnlocked', () => {
  it('les nodes de départ sont ouverts d’office', () => {
    expect(START_OPEN_NODES).toEqual(expect.arrayContaining(['greywatch', 'ashenvale_forest']))
    expect(isNodeUnlocked('greywatch', {})).toBe(true)
    expect(isNodeUnlocked('ashenvale_forest', {})).toBe(true)
  })

  it('les autres nodes sont fermés tant qu’ils ne sont pas dans unlockedNodes', () => {
    expect(isNodeUnlocked('millhaven', {})).toBe(false)
    expect(isNodeUnlocked('millhaven', { unlockedNodes: ['millhaven'] })).toBe(true)
  })
})

describe('START01/02 — état de départ', () => {
  it('le run démarre à Greywatch (node + localité)', () => {
    expect(s().world.currentNode).toBe('greywatch')
    expect(s().world.currentLocation).toBe('greywatch')
  })

  it('au départ : Greywatch + forêt ouverts, Millhaven/Ironhaven fermés', () => {
    expect(s().isNodeUnlocked('greywatch')).toBe(true)
    expect(s().isNodeUnlocked('ashenvale_forest')).toBe(true)
    expect(s().isNodeUnlocked('millhaven')).toBe(false)
    expect(s().isNodeUnlocked('ironhaven')).toBe(false)
  })
})

describe('START04 — la chaîne principale ouvre les nodes', () => {
  it('compléter mq02 ouvre Millhaven (condition = le spine)', () => {
    expect(s().isNodeUnlocked('millhaven')).toBe(false)
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    expect(s().isNodeUnlocked('millhaven')).toBe(true)
  })
})
