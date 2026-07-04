// MST08 — maîtres ITINÉRANTS (de passage) : forme des données, apparition/rotation
// déterministe sur dayCount, gating aux agglomérations, quêtes ⊂ pool de la discipline.
import { describe, it, expect } from 'vitest'
import {
  MASTERS,
  MASTER_FOCUSES,
  MASTER_SKILL_POOLS,
  ITINERANT_MASTERS,
  ITINERANT_ROTATION_DAYS,
  ITINERANT_HOST_ORDER,
  getMasterByInitiationQuest,
  getMastersAtLocation,
  getItinerantMasterForDay,
  getItinerantHostForDay,
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

describe('MST08 / v1.43 — apparition / rotation déterministe (dayCount)', () => {
  it('la cadence de rotation est de 4 jours (DÉCISION #3)', () => {
    expect(ITINERANT_ROTATION_DAYS).toBe(4)
  })

  it('getItinerantMasterForDay tourne par blocs de ITINERANT_ROTATION_DAYS jours', () => {
    const n = ITINERANT_MASTERS.length
    for (let day = 0; day < ITINERANT_ROTATION_DAYS * n * 2; day++) {
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

describe('MST08 / v1.43 (DÉCISION #3) — bloc → maître + agglo-hôte (unique par bloc)', () => {
  const CYCLE = ITINERANT_MASTERS.length * ITINERANT_HOST_ORDER.length // 18 blocs

  it('l’hôte est stable dans un bloc et avance tous les nbMaîtres blocs', () => {
    // stable dans un même bloc de ITINERANT_ROTATION_DAYS jours
    expect(getItinerantHostForDay(0)).toBe(getItinerantHostForDay(ITINERANT_ROTATION_DAYS - 1))
    // l’hôte n’avance qu’une fois tous les nbMaîtres blocs (le maître avance chaque bloc)
    const nM = ITINERANT_MASTERS.length
    const host0 = getItinerantHostForDay(0)
    for (let b = 1; b < nM; b++) {
      expect(getItinerantHostForDay(b * ITINERANT_ROTATION_DAYS)).toBe(host0)
    }
    expect(getItinerantHostForDay(nM * ITINERANT_ROTATION_DAYS)).not.toBe(host0)
  })

  it('le jeu d’agglos-hôtes = les 6 agglomérations (2 villes + 4 villages)', () => {
    expect([...ITINERANT_HOST_ORDER].sort()).toEqual(
      ['ashfall_post', 'duskreach', 'greywatch', 'ironhaven', 'millhaven', 'stonehaven'].sort(),
    )
  })

  it('sur le cycle complet (18 blocs), CHAQUE paire (maître, agglo) survient exactement une fois', () => {
    const pairs = new Set()
    for (let block = 0; block < CYCLE; block++) {
      const day = block * ITINERANT_ROTATION_DAYS
      pairs.add(`${getItinerantMasterForDay(day).id}@${getItinerantHostForDay(day)}`)
    }
    expect(pairs.size).toBe(CYCLE) // 3 × 6 = 18 paires distinctes
    // et donc chaque agglo accueille bien chacun des 3 focus au fil du cycle (pas de couplage figé)
    for (const host of ITINERANT_HOST_ORDER) {
      const mastersHere = new Set()
      for (let block = 0; block < CYCLE; block++) {
        const day = block * ITINERANT_ROTATION_DAYS
        if (getItinerantHostForDay(day) === host) mastersHere.add(getItinerantMasterForDay(day).id)
      }
      expect(mastersHere.size, host).toBe(ITINERANT_MASTERS.length)
    }
  })
})

describe('MST08 / v1.43 — surfaçage à UNE seule agglo (l’hôte du bloc)', () => {
  it('agglomérations = hôtes ; spots/donjons = non', () => {
    expect(isItinerantHostLocation('ironhaven')).toBe(true) // ville
    expect(isItinerantHostLocation('greywatch')).toBe(true) // village
    expect(isItinerantHostLocation('millhaven')).toBe(true) // village
    expect(isItinerantHostLocation('ashenvale_forest')).toBe(false) // spot
    expect(isItinerantHostLocation('crypt')).toBe(false) // donjon
    expect(isItinerantHostLocation(undefined)).toBe(false)
  })

  it('présent UNIQUEMENT à l’agglo-hôte du bloc, absent des autres agglos', () => {
    const day = 0
    const master = getItinerantMasterForDay(day)
    const host = getItinerantHostForDay(day)
    // présent chez l’hôte
    expect(getItinerantMastersAtLocation(host, day)).toEqual([master])
    // absent de TOUTES les autres agglos ce jour-là (single-location)
    for (const loc of ITINERANT_HOST_ORDER) {
      if (loc === host) continue
      expect(getItinerantMastersAtLocation(loc, day), loc).toEqual([])
    }
  })

  it('absent des spots/donjons même si c’était l’hôte "théorique"', () => {
    const day = 0
    expect(getItinerantMastersAtLocation('ashenvale_forest', day)).toEqual([]) // spot
    expect(getItinerantMastersAtLocation('crypt', day)).toEqual([]) // donjon
  })

  it('getMastersAtLocation n’inclut JAMAIS d’itinérant (fixes seuls — rétro-compat)', () => {
    for (const loc of ['ironhaven', 'greywatch', 'millhaven']) {
      expect(getMastersAtLocation(loc).every((m) => !m.itinerant)).toBe(true)
    }
  })
})

describe('MST08 / v1.43 — quêtes surfaçables : fixes + itinérant du jour (à son hôte)', () => {
  // Trouve un jour où `masterId` est l’itinérant du bloc ET où `host` l’accueille.
  const dayFor = (masterId, host) => {
    for (let d = 0; d < ITINERANT_ROTATION_DAYS * 6 * 4; d++) {
      if (getItinerantMasterForDay(d).id === masterId && getItinerantHostForDay(d) === host) return d
    }
    throw new Error(`no day where ${masterId} hosts at ${host}`)
  }

  it('sans dayCount : fixes seuls (rétro-compat, aucun itinérant)', () => {
    const ids = getMasterQuestIdsAtLocation('ironhaven')
    const itinInitIds = ITINERANT_IDS.map((id) => MASTERS[id].initiationQuestId)
    for (const iid of itinInitIds) expect(ids).not.toContain(iid)
  })

  it('avec dayCount, à l’agglo-hôte : ajoute l’initiation + le pool de l’itinérant du jour', () => {
    // un jour où Pyra (feu) est de passage — à SON agglo-hôte de ce bloc
    let day = 0
    while (getItinerantMasterForDay(day).id !== 'flame_wanderer') day++
    const host = getItinerantHostForDay(day)
    const ids = getMasterQuestIdsAtLocation(host, day)
    expect(ids).toContain('master_init_pyra')
    for (const qid of MASTERS.flame_wanderer.skillQuestPool) expect(ids).toContain(qid)
    // et PAS un itinérant d’un autre bloc (glace) ce jour-là
    expect(ids).not.toContain('master_init_kaira')
  })

  it('à une agglo NON-hôte le même jour : aucun itinérant surfacé', () => {
    let day = 0
    while (getItinerantMasterForDay(day).id !== 'flame_wanderer') day++
    const host = getItinerantHostForDay(day)
    const other = ITINERANT_HOST_ORDER.find((l) => l !== host)
    const ids = getMasterQuestIdsAtLocation(other, day)
    expect(ids).not.toContain('master_init_pyra')
  })

  it('chaque itinérant surface bien à chacune de ses haltes du cycle', () => {
    for (const id of ITINERANT_IDS) {
      const init = MASTERS[id].initiationQuestId
      // agglos où cet itinérant fait halte sur un cycle de 6 blocs
      const hosts = new Set()
      for (let block = 0; block < 6; block++) {
        const day = block * ITINERANT_ROTATION_DAYS
        if (getItinerantMasterForDay(day).id === id) hosts.add(getItinerantHostForDay(day))
      }
      for (const host of hosts) {
        const day = dayFor(id, host)
        expect(getMasterQuestIdsAtLocation(host, day), `${id}@${host}`).toContain(init)
      }
    }
  })

  it('à un spot (non-hôte) : aucun itinérant même avec dayCount', () => {
    const ids = getMasterQuestIdsAtLocation('ashenvale_forest', 0)
    for (const id of ITINERANT_IDS) {
      expect(ids).not.toContain(MASTERS[id].initiationQuestId)
    }
  })
})
