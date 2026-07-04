// MST03 — les skills-récompense sont EXCLUSIFS aux maîtres : aucune quête ordinaire ne
// donne plus de skill, et chaque skill rerouté est bien attribué par une quête de maître.
// MST04 — helpers de scoping par localité (Académie ne montre que les maîtres du lieu).
import { describe, it, expect } from 'vitest'
import { QUESTS } from './quests'
import { MASTER_QUESTS } from './masterQuests'
import {
  MASTERS,
  MASTER_SKILL_POOLS,
  getMastersAtLocation,
  getMasterQuestIdsAtLocation,
} from './masters'

// Skills reroutés au maître par MST03 (retirés des quêtes ordinaires de quests.js).
const REROUTED_SKILLS = [
  'counter_strike',
  'cleave',
  'power_strike',
  'veterans_resolve',
  'soul_crush',
  'forsaken_curse',
]

describe('MST03 — skills de récompense exclusifs au maître', () => {
  it('AUCUNE quête ordinaire (QUESTS) ne donne de skill en récompense', () => {
    for (const [id, q] of Object.entries(QUESTS)) {
      expect(q.reward?.skill, `${id} ne doit plus récompenser de skill`).toBeUndefined()
    }
  })

  it('chaque skill rerouté est attribué par au moins une quête de maître', () => {
    const rewardedByMaster = new Set()
    for (const q of Object.values(MASTER_QUESTS)) {
      if (q.reward?.skill) rewardedByMaster.add(q.reward.skill.skillId)
    }
    for (const id of REROUTED_SKILLS) {
      expect(rewardedByMaster.has(id), `${id} rerouté vers un maître`).toBe(true)
    }
  })

  it('tout skill récompensé par une quête de maître appartient au pool de la discipline du maître', () => {
    // index quête → maître (via initiation ou skillQuestPool)
    const questToMaster = {}
    for (const m of Object.values(MASTERS)) {
      questToMaster[m.initiationQuestId] = m
      for (const qid of m.skillQuestPool ?? []) questToMaster[qid] = m
    }
    for (const [qid, q] of Object.entries(MASTER_QUESTS)) {
      if (!q.reward?.skill) continue
      const m = questToMaster[qid]
      expect(m, `${qid} rattachée à un maître`).toBeDefined()
      expect(MASTER_SKILL_POOLS[m.focus], `${qid} → pool ${m.focus}`).toContain(q.reward.skill.skillId)
    }
  })

  it('les skills arcanes reroutés (soul_crush/forsaken_curse) sont donnés par des maîtres arcanes', () => {
    const arcaneRewards = new Set()
    for (const m of Object.values(MASTERS)) {
      if (m.focus !== 'arcane') continue
      for (const qid of [m.initiationQuestId, ...(m.skillQuestPool ?? [])]) {
        const s = MASTER_QUESTS[qid]?.reward?.skill?.skillId
        if (s) arcaneRewards.add(s)
      }
    }
    expect(arcaneRewards.has('soul_crush')).toBe(true)
    expect(arcaneRewards.has('forsaken_curse')).toBe(true)
  })
})

describe('MST04 — scoping des maîtres par localité', () => {
  it('Ironhaven expose Vael (arcane) ET Bulgar (berserker), pas Aldric ni Elyndra', () => {
    const ids = getMastersAtLocation('ironhaven').map((m) => m.id)
    expect(ids).toContain('academy_master') // Vael
    expect(ids).toContain('pit_master') // Bulgar
    expect(ids).not.toContain('sir_aldric') // Greywatch
    expect(ids).not.toContain('court_mage') // Millhaven
  })

  it('Greywatch expose Aldric, Millhaven expose Elyndra', () => {
    expect(getMastersAtLocation('greywatch').map((m) => m.id)).toEqual(['sir_aldric'])
    expect(getMastersAtLocation('millhaven').map((m) => m.id)).toEqual(['court_mage'])
  })

  it('getMasterQuestIdsAtLocation regroupe initiation + skillQuestPool des maîtres du lieu', () => {
    const ids = getMasterQuestIdsAtLocation('ironhaven')
    expect(ids).toContain('master_init_vael')
    expect(ids).toContain('master_soul_rend')
    expect(ids).toContain('master_init_bulgar')
    expect(ids).toContain('master_pit_reckless')
    // pas d'ids d'un autre lieu
    expect(ids).not.toContain('master_init_aldric')
    expect(ids).not.toContain('master_init_elyndra')
  })

  it('une localité sans maître renvoie [] (helpers robustes)', () => {
    expect(getMastersAtLocation('nowhere')).toEqual([])
    expect(getMasterQuestIdsAtLocation('nowhere')).toEqual([])
    expect(getMasterQuestIdsAtLocation(undefined)).toEqual([])
  })
})

describe('MST06/MST07 — nouveaux maîtres', () => {
  it('Elyndra (MST06) : mage arcane de la cour royale, à Millhaven', () => {
    const m = MASTERS.court_mage
    expect(m.focus).toBe('arcane')
    expect(m.location).toBe('millhaven')
    expect(m.title).toBe('Ancien mage de la cour royale')
    expect(MASTER_QUESTS[m.initiationQuestId].isInitiation).toBe(true)
  })

  it('Vael (MST07) : maître arcane à Ironhaven (recyclé academy_master)', () => {
    const m = MASTERS.academy_master
    expect(m.focus).toBe('arcane')
    expect(m.location).toBe('ironhaven')
    expect(MASTER_QUESTS[m.initiationQuestId].isInitiation).toBe(true)
  })

  it('Bulgar (MST07) : maître physique (berserker) distinct à Ironhaven', () => {
    const m = MASTERS.pit_master
    expect(m.focus).toBe('berserker')
    expect(m.location).toBe('ironhaven')
    expect(m.id).not.toBe(MASTERS.academy_master.id)
    expect(MASTER_QUESTS[m.initiationQuestId].isInitiation).toBe(true)
  })
})
