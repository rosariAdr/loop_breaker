// MQ-CHAIN01 / MQ-ELITETURN01 — données du spine Map 1 : registre, ordre, armes
// signature d'élite, et complétude de l'objectif `elite_turnin`.
import { describe, it, expect } from 'vitest'
import { MAIN_QUESTS, MAIN_QUEST_ORDER, nextMainQuest } from './mainQuests'
import { getQuestById, QUEST_NPC_REGISTRY, isQuestCompleteState } from './quests'
import { EQUIPMENT_TEMPLATES, createEquipmentInstance } from './equipment'

const stateWith = ({ resources = {}, equipment = [], level = 1, kills = {} } = {}) => ({
  hero: { level, inventory: { resources, equipment }, activeSkills: [], passiveSkills: [] },
  world: { questProgress: {}, monsterKillCounts: kills, visitedSpots: [] },
  meta: { craftCount: 0 },
})

describe('MQ-CHAIN01 — registre & ordre du spine', () => {
  it('expose 6 quêtes principales résolubles par getQuestById', () => {
    expect(MAIN_QUEST_ORDER).toHaveLength(6)
    for (const id of MAIN_QUEST_ORDER) {
      expect(getQuestById(id)).toBe(MAIN_QUESTS[id])
      expect(MAIN_QUESTS[id].isMainQuest).toBe(true)
    }
  })

  it('chaque maillon (sauf le 1er) requiert le précédent', () => {
    expect(MAIN_QUESTS.mq01_waking.requires).toBeNull()
    for (let i = 1; i < MAIN_QUEST_ORDER.length; i++) {
      expect(MAIN_QUESTS[MAIN_QUEST_ORDER[i]].requires).toBe(MAIN_QUEST_ORDER[i - 1])
    }
  })

  it('nextMainQuest suit la chaîne et s’arrête à la fin', () => {
    expect(nextMainQuest('mq01_waking')).toBe('mq02_millhaven_road')
    expect(nextMainQuest('mq06_beyond_marsh')).toBeNull()
    expect(nextMainQuest('inconnu')).toBeNull()
  })

  it('les donneurs « Doyen » résolvent dans le registre NPC', () => {
    for (const giver of ['greywatch_elder', 'millhaven_elder', 'ironhaven_captain']) {
      expect(QUEST_NPC_REGISTRY[giver]).toBeDefined()
    }
  })

  it('chaque MQ déclare un lieu émetteur (issuedBy) et des unlocks', () => {
    for (const id of MAIN_QUEST_ORDER) {
      const q = MAIN_QUESTS[id]
      expect(typeof q.issuedBy).toBe('string')
      expect(q.unlocks).toBeTypeOf('object')
    }
  })
})

describe('MQ-ELITETURN01 — armes signature d’élite', () => {
  it('les 3 armes existent comme templates d’arme non vendus', () => {
    for (const id of ['oakheart_branch', 'thunderhoof_maul', 'graven_edge']) {
      const t = EQUIPMENT_TEMPLATES[id]
      expect(t).toBeDefined()
      expect(t.slot).toBe('weapon')
      expect(t.availableAt).toEqual([])
    }
  })

  it('createEquipmentInstance produit une instance jouable (stats + sellPrice)', () => {
    const inst = createEquipmentInstance('oakheart_branch', 'rare')
    expect(inst).not.toBeNull()
    expect(inst.slot).toBe('weapon')
    expect(inst.stats.strength).toBeGreaterThan(0)
    expect(inst.sellPrice).toBeGreaterThanOrEqual(0)
  })

  it('chaque MQ de remise récompense bien son arme signature', () => {
    const pairs = [
      ['mq02_millhaven_road', 'oakheart_branch'],
      ['mq04_ironhaven_gates', 'thunderhoof_maul'],
      ['mq06_beyond_marsh', 'graven_edge'],
    ]
    for (const [qid, weapon] of pairs) {
      expect(MAIN_QUESTS[qid].reward.equipment.templateId).toBe(weapon)
    }
  })
})

describe('MQ-ELITETURN01 / MQ-TURNIN-SIG01 — complétude de l’objectif elite_turnin', () => {
  const mq02 = MAIN_QUESTS.mq02_millhaven_road

  it('non rempli sans items ni arme', () => {
    expect(isQuestCompleteState(mq02, stateWith())).toBe(false)
  })

  it('rempli avec 3× l’item rare ET l’élite vaincu', () => {
    const st = stateWith({ resources: { earth_crystal: 3 }, kills: { old_oakheart: 1 } })
    expect(isQuestCompleteState(mq02, st)).toBe(true)
  })

  it('MQ-TURNIN-SIG01 — PAS rempli avec les items mais sans avoir vaincu l’élite (provenance)', () => {
    expect(isQuestCompleteState(mq02, stateWith({ resources: { earth_crystal: 3 } }))).toBe(false)
  })

  it('PAS rempli avec seulement 2× l’item rare', () => {
    const st = stateWith({ resources: { earth_crystal: 2 }, kills: { old_oakheart: 1 } })
    expect(isQuestCompleteState(mq02, st)).toBe(false)
  })

  it('rempli via l’arme signature (provenance prouvée, sans kill requis)', () => {
    const st = stateWith({ equipment: [{ templateId: 'oakheart_branch', instanceId: 'x' }] })
    expect(isQuestCompleteState(mq02, st)).toBe(true)
  })
})
