// QSV2-ADJ-AUDIT01 — Test d'intégrité d'adjacence des quêtes.
// Règle : une quête NON-spine (board) qui n'est pas gelée Map 2 ne doit cibler
// (kill / visit / elite_turnin) qu'un spot ADJACENT à son lieu émetteur (getQuestIssuer),
// d'après le graphe worldGraph.EDGES. Le spine (MAIN_QUESTS) est exempté.
import { describe, it, expect } from 'vitest'
import { QUESTS, getQuestIssuer } from './quests'
import { MONSTERS } from './monsters'
import { neighborsOf } from './worldGraph'

// Boss de donjon → node de carte correspondant (les boss n'ont pas de huntingSpot).
const BOSS_NODE = {
  hollow_crypt_boss: 'crypt', // Map 1
  forsaken_citadel_boss: 'forsaken_citadel', // Map 2
  malachar: 'demon_lord', // Map 2
}

// Spot/node ciblé par un objectif (null si l'objectif n'a pas de cible géographique).
function targetNodeOf(obj) {
  if (obj.type === 'visit') return obj.spotId
  if (obj.type === 'elite_turnin') return MONSTERS[obj.eliteId]?.huntingSpot ?? null
  if (obj.type === 'kill') {
    const m = MONSTERS[obj.monsterId]
    if (!m) return null
    return m.huntingSpot ?? BOSS_NODE[obj.monsterId] ?? null
  }
  return null // level / craft → pas de cible géographique
}

// Une cible appartient-elle à Map 2 (zone grimspire) ? (sert au gel mapTier)
function isMap2Target(obj) {
  const id = obj.monsterId ?? obj.eliteId
  if (!id) return false
  const m = MONSTERS[id]
  return m?.zone === 'grimspire'
}

const boardQuests = Object.values(QUESTS)
// Quêtes "actives" sur Map 1 = non gelées (mapTier 1 par défaut).
const map1Quests = boardQuests.filter((q) => (q.mapTier ?? 1) <= 1)

describe('QSV2-ADJ-AUDIT01 — adjacence des quêtes de board', () => {
  it('chaque quête Map 1 cible un spot adjacent à son émetteur', () => {
    const violations = []
    for (const q of map1Quests) {
      const issuer = getQuestIssuer(q)
      const adj = new Set(neighborsOf(issuer))
      for (const obj of q.objectives) {
        const target = targetNodeOf(obj)
        if (!target) continue
        if (!adj.has(target)) {
          violations.push(
            `${q.id} (émetteur ${issuer}) → ${target} [non adjacent : ${[...adj].join(', ')}]`,
          )
        }
      }
    }
    expect(violations, `Violations d'adjacence :\n${violations.join('\n')}`).toEqual([])
  })

  it('aucune quête non gelée ne cible une zone Map 2 (sinon mapTier:2 requis)', () => {
    const leaks = []
    for (const q of map1Quests) {
      for (const obj of q.objectives) {
        if (isMap2Target(obj)) leaks.push(`${q.id} → ${obj.monsterId ?? obj.eliteId} (Map 2)`)
      }
    }
    expect(leaks, `Cibles Map 2 surfacées sur Map 1 :\n${leaks.join('\n')}`).toEqual([])
  })
})
