// VQ01-07 / VQ-G — quêtes de village générées par adjacence.
import { describe, it, expect } from 'vitest'
import {
  VILLAGE_QUEST_GIVERS,
  adjacentSpots,
  villageQuestCount,
  generateVillageQuestPool,
  getActiveVillageQuests,
} from './villageQuests'
import { MONSTERS } from './monsters'

const targetSpot = (obj) => {
  if (obj.type === 'visit') return obj.spotId
  if (obj.type === 'kill') return MONSTERS[obj.monsterId]?.huntingSpot ?? null
  return null // collect : pas de spot strict (ressource multi-sources)
}
const isEliteQuest = (q) =>
  q.objectives.some((o) => o.type === 'kill' && MONSTERS[o.monsterId]?.rank === 'elite')

describe('VQ02 — adjacence', () => {
  it('Greywatch n’est adjacent qu’à la forêt', () => {
    expect(adjacentSpots('greywatch')).toEqual(['ashenvale_forest'])
  })
  it('Millhaven couvre forêt + ruines + marais', () => {
    const s = adjacentSpots('millhaven')
    expect(s).toEqual(expect.arrayContaining(['ashenvale_forest', 'crumbled_ruins', 'thornmarsh']))
  })
  it('Ironhaven couvre marais + collines', () => {
    const s = adjacentSpots('ironhaven')
    expect(s).toEqual(expect.arrayContaining(['thornmarsh', 'wildmere_hills']))
  })
})

describe('VQ-G4 — nb de quêtes actives', () => {
  it('village : 3 base, +1/5 niveaux, cap 6', () => {
    expect(villageQuestCount(1, false)).toBe(3)
    expect(villageQuestCount(5, false)).toBe(4)
    expect(villageQuestCount(15, false)).toBe(6)
    expect(villageQuestCount(40, false)).toBe(6)
  })
  it('ville : 6 base, cap 12', () => {
    expect(villageQuestCount(1, true)).toBe(6)
    expect(villageQuestCount(30, true)).toBe(12)
    expect(villageQuestCount(99, true)).toBe(12)
  })
})

describe('VQ01/VQ02/VQ03-05 — génération du pool', () => {
  it('Greywatch : quêtes émises par Elder Moira, depuis la forêt', () => {
    const pool = generateVillageQuestPool('greywatch')
    expect(pool.length).toBeGreaterThan(0)
    for (const q of pool) {
      expect(q.giverNpc).toBe('greywatch_elder')
      expect(q.issuedBy).toBe('greywatch')
      expect(q.sourceSpot).toBe('ashenvale_forest')
      expect(q.isVillageQuest).toBe(true)
    }
  })

  it('VQ-G1 — seules les quêtes d’élite donnent des tokens', () => {
    for (const q of generateVillageQuestPool('millhaven')) {
      expect((q.reward.reputationTokens ?? 0) > 0).toBe(isEliteQuest(q))
    }
  })

  it('VQ-G3 — les quêtes d’élite portent un requiredLevel', () => {
    const elites = generateVillageQuestPool('ironhaven').filter(isEliteQuest)
    expect(elites.length).toBeGreaterThan(0)
    for (const q of elites) expect(q.requiredLevel).toBeGreaterThan(0)
  })

  it('toute cible kill/visit est sur un spot adjacent à l’émetteur', () => {
    for (const loc of Object.keys(VILLAGE_QUEST_GIVERS)) {
      const adj = new Set(adjacentSpots(loc))
      for (const q of generateVillageQuestPool(loc)) {
        for (const obj of q.objectives) {
          const s = targetSpot(obj)
          if (s) expect(adj.has(s), `${q.id}:${s}`).toBe(true)
        }
      }
    }
  })

  it('Fenrot (élite Map 2) est exclu du pool de village', () => {
    const pool = generateVillageQuestPool('millhaven') // millhaven adj thornmarsh (Fenrot)
    expect(pool.some((q) => q.objectives.some((o) => o.monsterId === 'fenrot_devourer'))).toBe(
      false,
    )
  })
})

describe('VQ06 + VQ-G3 — quêtes actives (rotation + level-gate)', () => {
  it('respecte le nombre VQ-G4', () => {
    expect(getActiveVillageQuests('greywatch', { dayCount: 1, heroLevel: 1 }).length).toBe(3)
  })
  it('level-gate : la prime Thunderhoof (Lv 6) est hors pool au niveau 1', () => {
    const eliteId = 'vq_ironhaven_kill_thunderhoof'
    expect(generateVillageQuestPool('ironhaven').find((q) => q.id === eliteId)?.requiredLevel).toBe(
      6,
    )
    const lvl1 = getActiveVillageQuests('ironhaven', { dayCount: 1, heroLevel: 1, isCity: true })
    expect(lvl1.some((q) => q.id === eliteId)).toBe(false)
  })
  it('rotation : un autre bloc de 3 jours change la fenêtre', () => {
    const a = getActiveVillageQuests('millhaven', { dayCount: 1, heroLevel: 1 }).map((q) => q.id)
    const b = getActiveVillageQuests('millhaven', { dayCount: 4, heroLevel: 1 }).map((q) => q.id)
    expect(a).not.toEqual(b)
  })
})

describe('QSV2-MULTIMON01 — quêtes multi-objectifs', () => {
  it('génère des quêtes patrouille à ≥ 2 objectifs kill (≥ 3 au total Map 1)', () => {
    const all = Object.keys(VILLAGE_QUEST_GIVERS).flatMap((l) => generateVillageQuestPool(l))
    const multi = all.filter((q) => q.objectives.length >= 2)
    expect(multi.length).toBeGreaterThanOrEqual(3)
    for (const q of multi) expect(q.objectives.every((o) => o.type === 'kill')).toBe(true)
  })
})
