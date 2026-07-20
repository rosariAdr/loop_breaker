// QSV2-ADJ-AUDIT01 — Test d'intégrité d'adjacence des quêtes.
// Règle : une quête NON-spine (board) qui n'est pas gelée Map 2 ne doit cibler
// (kill / visit / elite_turnin) qu'un spot ADJACENT à son lieu émetteur (getQuestIssuer),
// d'après le graphe worldGraph.EDGES. Le spine (MAIN_QUESTS) est exempté.
import { describe, it, expect } from 'vitest'
import { QUESTS, getQuestIssuer } from './quests'
import { MONSTERS, MONSTERS_BY_SPOT } from './monsters'
import { neighborsOf } from './worldGraph'
import { SPOT_OWNER, ownedSpots, generateVillageQuestPool } from './villageQuests'

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

// ── QSV2-QSRC-TEST01 — sourcing & disjonction des quêtes de village ──────────
// (1) disjonction : aucun spot n'alimente 2 lieux (SPOT_OWNER = propriétaire unique) ;
// (2) 0 doublon inter-village : deux lieux ne proposent jamais la même cible ;
// (3) sourcing : toute quête de village cible un monstre d'un spot POSSÉDÉ par son émetteur.
const VQ_LOCATIONS = ['greywatch', 'millhaven', 'ironhaven']

// Clé de cible d'un objectif de quête générée (monstre / ressource / spot visité).
const targetKey = (obj) => `${obj.type}:${obj.monsterId ?? obj.resourceId ?? obj.spotId ?? 'none'}`

describe('QSV2-QSRC-TEST01 — disjonction SPOT_OWNER', () => {
  it('chaque spot de chasse de surface a exactement UN propriétaire', () => {
    for (const spot of Object.keys(MONSTERS_BY_SPOT)) {
      const owners = VQ_LOCATIONS.filter((loc) => ownedSpots(loc).includes(spot))
      expect(owners, `${spot} possédé par : ${owners.join(', ')}`).toHaveLength(1)
    }
  })

  it('le mapping SPOT_OWNER couvre tous les spots de surface (aucun orphelin)', () => {
    for (const spot of Object.keys(MONSTERS_BY_SPOT)) {
      expect(SPOT_OWNER[spot], `${spot} sans propriétaire`).toBeDefined()
    }
  })

  it("ownedSpots d'un lieu ⊂ ses voisins d'adjacence (owner toujours adjacent)", () => {
    for (const loc of VQ_LOCATIONS) {
      const adj = new Set(neighborsOf(loc))
      for (const spot of ownedSpots(loc)) {
        expect(adj.has(spot), `${spot} possédé par ${loc} mais non adjacent`).toBe(true)
      }
    }
  })
})

describe('QSV2-QSRC-TEST01 — 0 doublon inter-village', () => {
  it('deux lieux ne proposent jamais la même cible (pools disjoints)', () => {
    const seenTargets = new Map() // targetKey → location
    const seenIds = new Map()
    for (const loc of VQ_LOCATIONS) {
      for (const q of generateVillageQuestPool(loc)) {
        expect(seenIds.has(q.id), `${q.id} proposé à ${loc} ET ${seenIds.get(q.id)}`).toBe(false)
        seenIds.set(q.id, loc)
        for (const obj of q.objectives) {
          const key = targetKey(obj)
          const other = seenTargets.get(key)
          expect(other == null || other === loc, `${key} proposé à ${loc} ET ${other}`).toBe(true)
          seenTargets.set(key, loc)
        }
      }
    }
  })
})

describe('QSV2-QSRC-TEST01 — sourcing des quêtes de village', () => {
  it('toute quête de village cible un monstre/spot POSSÉDÉ par son émetteur', () => {
    const violations = []
    for (const loc of VQ_LOCATIONS) {
      const owned = new Set(ownedSpots(loc))
      for (const q of generateVillageQuestPool(loc)) {
        for (const obj of q.objectives) {
          // spot d'origine de la cible : visite → spotId ; kill → huntingSpot du monstre ;
          // collect → huntingSpot du monstre source (via sourceMonsterId si présent).
          const spot =
            obj.spotId ??
            MONSTERS[obj.monsterId]?.huntingSpot ??
            MONSTERS[obj.sourceMonsterId]?.huntingSpot ??
            null
          if (spot && !owned.has(spot)) violations.push(`${q.id} (${loc}) → ${spot}`)
        }
      }
    }
    expect(violations, `Sourcing hors spots possédés :\n${violations.join('\n')}`).toEqual([])
  })

  it('les quêtes hand-authored restent conformes (adjacence — garde-fou)', () => {
    // Redondant volontairement avec le test d'adjacence : pinne que la règle vaut AUSSI
    // après le retrait des doublons legacy (QSV2-DROPDUP01).
    for (const q of map1Quests) {
      const adj = new Set(neighborsOf(getQuestIssuer(q)))
      for (const obj of q.objectives) {
        const target = targetNodeOf(obj)
        if (target) expect(adj.has(target), `${q.id} → ${target}`).toBe(true)
      }
    }
  })
})
