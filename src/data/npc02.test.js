// NPC02 — 10 quêtes de contenu : validité des références (monstres, spots, équip., ressources).
import { describe, it, expect } from 'vitest'
import { QUESTS, QUEST_NPCS } from './quests'
import { MONSTERS } from './monsters'
import { ZONES } from './zones'
import { EQUIPMENT_TEMPLATES } from './equipment'
import { RESOURCES } from './resources'

const ncQuests = Object.values(QUESTS).filter((q) => q.id.startsWith('nc_'))
const spotIds = new Set(
  Object.values(ZONES).flatMap((z) => (z.huntingSpots ?? []).map((s) => s.id)),
)

describe('NPC02 — 10 nouvelles quêtes de contenu', () => {
  it('ajoute exactement 10 quêtes nc_*', () => {
    expect(ncQuests.length).toBe(10)
  })

  it('le donneur Pell est enregistré', () => {
    expect(QUEST_NPCS.merchant_pell).toBeTruthy()
  })

  it('chaque quête a un donneur valide', () => {
    for (const q of ncQuests) expect(QUEST_NPCS[q.giverNpc]).toBeTruthy()
  })

  it('les objectifs kill ciblent des monstres existants', () => {
    for (const q of ncQuests) {
      for (const o of q.objectives) {
        if (o.type === 'kill') expect(MONSTERS[o.monsterId], `${q.id}:${o.monsterId}`).toBeTruthy()
        if (o.type === 'visit') expect(spotIds.has(o.spotId), `${q.id}:${o.spotId}`).toBe(true)
        if (o.type === 'craft') expect(o.count).toBeGreaterThan(0)
      }
    }
  })

  it('les récompenses référencent des équipements et ressources valides', () => {
    for (const q of ncQuests) {
      const r = q.reward
      if (r.equipment) expect(EQUIPMENT_TEMPLATES[r.equipment.templateId], `${q.id}`).toBeTruthy()
      if (r.resources)
        for (const id of Object.keys(r.resources))
          expect(RESOURCES[id], `${q.id}:${id}`).toBeTruthy()
      if (r.consumables)
        for (const id of Object.keys(r.consumables))
          expect(RESOURCES[id], `${q.id}:${id}`).toBeTruthy()
      expect(r.gold).toBeGreaterThan(0)
    }
  })

  it('couvre élites + exploration + artisanat', () => {
    const killsElite = ncQuests.filter((q) =>
      q.objectives.some((o) => o.type === 'kill' && MONSTERS[o.monsterId]?.rank === 'elite'),
    )
    const visits = ncQuests.filter((q) => q.objectives.some((o) => o.type === 'visit'))
    const crafts = ncQuests.filter((q) => q.objectives.some((o) => o.type === 'craft'))
    expect(killsElite.length).toBeGreaterThanOrEqual(3)
    expect(visits.length).toBeGreaterThanOrEqual(2)
    expect(crafts.length).toBeGreaterThanOrEqual(2)
  })
})
