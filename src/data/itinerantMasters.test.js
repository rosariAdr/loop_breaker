// MST08 — maîtres ITINÉRANTS (de passage) : forme des données, apparition/rotation
// déterministe sur dayCount, gating aux agglomérations, quêtes ⊂ pool de la discipline.
import { describe, it, expect } from 'vitest'
import {
  MASTERS,
  MASTER_FOCUSES,
  MASTER_SKILL_POOLS,
  ITINERANT_MASTERS,
  ITINERANT_ROTATION_DAYS,
  getMasterByInitiationQuest,
  getMastersAtLocation,
  getItinerantMasterForDay,
  getItinerantMastersAtLocation,
  isItinerantHostLocation,
  getMasterQuestIdsAtLocation,
} from './masters'
import { MASTER_QUESTS, MASTER_QUEST_NPC } from './masterQuests'
import { SKILLS } from './skills'

const ITINERANT_IDS = ['flame_wanderer', 'frost_wanderer', 'savage_wanderer']

describe('MST08 — forme des maîtres itinérants', () => {
  it('les 3 maîtres itinérants attendus existent, marqués itinerant sans location fixe', () => {
    for (const id of ITINERANT_IDS) {
      const m = MASTERS[id]
      expect(m, id).toBeDefined()
      expect(m.itinerant, id).toBe(true)
      expect(m.location, id).toBeUndefined()
      expect(MASTER_FOCUSES, id).toContain(m.focus)
      expect(typeof m.initiationQuestId, id).toBe('string')
      expect(Array.isArray(m.skillQuestPool), id).toBe(true)
    }
  })

  it('couvre les focus feu / glace / berserker', () => {
    const focuses = ITINERANT_IDS.map((id) => MASTERS[id].focus)
    expect(focuses).toContain('feu')
    expect(focuses).toContain('glace')
    expect(focuses).toContain('berserker')
  })

  it('ITINERANT_MASTERS = exactement les maîtres itinérants de MASTERS', () => {
    const ids = ITINERANT_MASTERS.map((m) => m.id).sort()
    expect(ids).toEqual([...ITINERANT_IDS].sort())
    expect(ITINERANT_MASTERS.every((m) => m.itinerant)).toBe(true)
  })

  it('chaque initiation existe, est marquée initiation et pointe en retour vers son maître', () => {
    for (const id of ITINERANT_IDS) {
      const q = MASTER_QUESTS[MASTERS[id].initiationQuestId]
      expect(q, id).toBeDefined()
      expect(q.isInitiation, id).toBe(true)
      expect(q.isMasterQuest, id).toBe(true)
      expect(q.masterId, id).toBe(id)
      expect(getMasterByInitiationQuest(q.id)).toBe(MASTERS[id])
    }
  })

  it('un NPC donneur (itinerant) existe pour chaque itinérant', () => {
    for (const id of ITINERANT_IDS) {
      expect(MASTER_QUEST_NPC[id], id).toBeDefined()
      expect(MASTER_QUEST_NPC[id].itinerant, id).toBe(true)
    }
  })

  it('les quêtes de skill récompensent / ciblent des skills du pool de la discipline', () => {
    for (const id of ITINERANT_IDS) {
      const pool = MASTER_SKILL_POOLS[MASTERS[id].focus] ?? []
      for (const qid of MASTERS[id].skillQuestPool) {
        const q = MASTER_QUESTS[qid]
        expect(q, `${id}/${qid}`).toBeDefined()
        expect(q.isMasterQuest, `${id}/${qid}`).toBe(true)
        if (q.reward?.skill) {
          expect(pool, `${id}/${qid} reward`).toContain(q.reward.skill.skillId)
          expect(SKILLS[q.reward.skill.skillId]).toBeDefined()
        }
        const obj = q.objectives?.find((o) => o.type === 'skill_levelup')
        if (obj) expect(pool, `${id}/${qid} objectif`).toContain(obj.skillId)
      }
    }
  })

  it('l’initiation récompense un skill du pool de la discipline', () => {
    for (const id of ITINERANT_IDS) {
      const pool = MASTER_SKILL_POOLS[MASTERS[id].focus] ?? []
      const q = MASTER_QUESTS[MASTERS[id].initiationQuestId]
      if (q.reward?.skill) expect(pool, id).toContain(q.reward.skill.skillId)
    }
  })
})

describe('MST08 — apparition / rotation déterministe (dayCount)', () => {
  it('getItinerantMasterForDay tourne par blocs de ITINERANT_ROTATION_DAYS jours', () => {
    const n = ITINERANT_MASTERS.length
    // jours 1-2 → bloc 0, 3-5 → bloc 1, etc. (avec rotation de 3)
    for (let day = 0; day < 3 * n * 2; day++) {
      const block = Math.floor(day / ITINERANT_ROTATION_DAYS)
      expect(getItinerantMasterForDay(day)).toBe(ITINERANT_MASTERS[block % n])
    }
  })

  it('est stable dans un même bloc et change au bloc suivant', () => {
    const d0 = getItinerantMasterForDay(0)
    const d1 = getItinerantMasterForDay(ITINERANT_ROTATION_DAYS - 1)
    expect(d1).toBe(d0) // même bloc
    const d2 = getItinerantMasterForDay(ITINERANT_ROTATION_DAYS)
    if (ITINERANT_MASTERS.length > 1) expect(d2).not.toBe(d0) // bloc suivant
  })

  it('finit par présenter les 3 focus au fil des blocs', () => {
    const seen = new Set()
    for (let day = 0; day < ITINERANT_ROTATION_DAYS * ITINERANT_MASTERS.length; day++) {
      seen.add(getItinerantMasterForDay(day).id)
    }
    expect(seen.size).toBe(ITINERANT_MASTERS.length)
  })
})

describe('MST08 — gating aux agglomérations (host locations)', () => {
  it('agglomérations = hôtes ; spots/donjons = non', () => {
    expect(isItinerantHostLocation('ironhaven')).toBe(true) // ville
    expect(isItinerantHostLocation('greywatch')).toBe(true) // village
    expect(isItinerantHostLocation('millhaven')).toBe(true) // village
    expect(isItinerantHostLocation('ashenvale_forest')).toBe(false) // spot
    expect(isItinerantHostLocation('crypt')).toBe(false) // donjon
    expect(isItinerantHostLocation(undefined)).toBe(false)
  })

  it('getItinerantMastersAtLocation rend l’itinérant du jour dans une agglo, sinon []', () => {
    const day = 0
    const expected = getItinerantMasterForDay(day)
    expect(getItinerantMastersAtLocation('ironhaven', day)).toEqual([expected])
    expect(getItinerantMastersAtLocation('ashenvale_forest', day)).toEqual([]) // spot
    expect(getItinerantMastersAtLocation('crypt', day)).toEqual([]) // donjon
  })

  it('getMastersAtLocation n’inclut JAMAIS d’itinérant (fixes seuls — rétro-compat)', () => {
    for (const loc of ['ironhaven', 'greywatch', 'millhaven']) {
      expect(getMastersAtLocation(loc).every((m) => !m.itinerant)).toBe(true)
    }
  })
})

describe('MST08 — quêtes surfaçables : fixes + itinérant du jour', () => {
  it('sans dayCount : fixes seuls (rétro-compat, aucun itinérant)', () => {
    const ids = getMasterQuestIdsAtLocation('ironhaven')
    const itinInitIds = ITINERANT_IDS.map((id) => MASTERS[id].initiationQuestId)
    for (const iid of itinInitIds) expect(ids).not.toContain(iid)
  })

  it('avec dayCount : ajoute l’initiation + le pool de l’itinérant du jour', () => {
    // trouve un jour où l’itinérant de FEU (Pyra) est de passage
    let day = 0
    while (getItinerantMasterForDay(day).id !== 'flame_wanderer') day++
    const ids = getMasterQuestIdsAtLocation('ironhaven', day)
    expect(ids).toContain('master_init_pyra')
    for (const qid of MASTERS.flame_wanderer.skillQuestPool) expect(ids).toContain(qid)
    // et PAS l’itinérant d’un autre bloc (glace) ce jour-là
    expect(ids).not.toContain('master_init_kaira')
  })

  it('à un spot (non-hôte) : aucun itinérant même avec dayCount', () => {
    const ids = getMasterQuestIdsAtLocation('ashenvale_forest', 0)
    for (const id of ITINERANT_IDS) {
      expect(ids).not.toContain(MASTERS[id].initiationQuestId)
    }
  })
})
