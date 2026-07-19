// QONBOARD01 — chaîne d'onboarding « Premières fois » : registre, agrégation, filtre de
// track, séquençage, et résolution de chaque objectif (via les types QOBJ-TYPES01).
import { describe, it, expect } from 'vitest'
import {
  ONBOARDING_QUESTS,
  ONBOARDING_QUEST_ORDER,
  ONBOARDING_QUEST_NPC,
  nextOnboardingQuest,
} from './onboardingQuests'
import { getQuestById, QUEST_NPC_REGISTRY, isQuestCompleteState } from './quests'
import { EQUIPMENT_TEMPLATES } from './equipment'
import { RESOURCES } from './resources'

// État minimal accepté par questObjectiveStatus (baseline snapshot vide → delta = compteur brut).
const stateWith = ({
  kills = {},
  resources = {},
  equipped = {},
  prayCount = 0,
  deedsAccepted = 0,
  craftCountByKind = {},
} = {}) => ({
  hero: { equipped, inventory: { resources, equipment: [] }, activeSkills: [], passiveSkills: [] },
  world: { questProgress: {}, monsterKillCounts: kills, visitedSpots: [] },
  meta: { craftCount: 0, prayCount, deedsAccepted, craftCountByKind },
})

describe('QONBOARD01 — agrégation & registre', () => {
  it("expose 6 quêtes d'onboarding résolubles par getQuestById", () => {
    expect(ONBOARDING_QUEST_ORDER).toHaveLength(6)
    for (const id of ONBOARDING_QUEST_ORDER) {
      expect(getQuestById(id)).toBe(ONBOARDING_QUESTS[id])
    }
  })

  it('toutes portent track:"onboarding" et AUCUN isMainQuest', () => {
    for (const q of Object.values(ONBOARDING_QUESTS)) {
      expect(q.track).toBe('onboarding')
      expect(q.isMainQuest).toBeUndefined()
    }
  })

  it('le mentor (greywatch_mentor) est enregistré dans le registre NPC', () => {
    expect(ONBOARDING_QUEST_NPC.greywatch_mentor).toBeDefined()
    expect(QUEST_NPC_REGISTRY.greywatch_mentor).toBeDefined()
    expect(QUEST_NPC_REGISTRY.greywatch_mentor.location).toBe('greywatch')
  })

  it('chaque quête est émise à Greywatch', () => {
    for (const q of Object.values(ONBOARDING_QUESTS)) {
      expect(q.issuedBy).toBe('greywatch')
      expect(q.giverNpc).toBe('greywatch_mentor')
    }
  })
})

describe('QONBOARD01 — séquençage de la chaîne', () => {
  it("la 1ère quête n'a pas de prérequis, chaque suivante requiert la précédente", () => {
    expect(ONBOARDING_QUESTS[ONBOARDING_QUEST_ORDER[0]].requires).toBeNull()
    for (let i = 1; i < ONBOARDING_QUEST_ORDER.length; i++) {
      expect(ONBOARDING_QUESTS[ONBOARDING_QUEST_ORDER[i]].requires).toBe(
        ONBOARDING_QUEST_ORDER[i - 1],
      )
    }
  })

  it("nextOnboardingQuest suit la chaîne et s'arrête à la fin", () => {
    expect(nextOnboardingQuest('onb_first_edge')).toBe('onb_well_armed')
    expect(nextOnboardingQuest('onb_first_brew')).toBeNull()
    expect(nextOnboardingQuest('inconnu')).toBeNull()
  })
})

describe('QONBOARD01 — récompenses (templates réels)', () => {
  it('les équipements récompensés existent comme templates', () => {
    expect(EQUIPMENT_TEMPLATES.iron_sword).toBeDefined()
    expect(EQUIPMENT_TEMPLATES.iron_sword.slot).toBe('weapon')
    expect(EQUIPMENT_TEMPLATES.iron_helm).toBeDefined()
    expect(EQUIPMENT_TEMPLATES.iron_helm.slot).toBe('helmet')
    expect(ONBOARDING_QUESTS.onb_first_edge.reward.equipment.templateId).toBe('iron_sword')
    expect(ONBOARDING_QUESTS.onb_cover_up.reward.equipment.templateId).toBe('iron_helm')
  })

  it('le consommable récompensé (potion) existe', () => {
    expect(RESOURCES.hp_potion_small).toBeDefined()
    expect(ONBOARDING_QUESTS.onb_first_brew.reward.consumables.hp_potion_small).toBe(2)
  })
})

describe('QONBOARD01 — résolution de chaque objectif', () => {
  it('onb_first_edge (kill) : rempli après 3 kills', () => {
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_first_edge, stateWith())).toBe(false)
    const st = stateWith({ kills: { ashwood_wolf: 3 } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_first_edge, st)).toBe(true)
  })

  it('onb_well_armed (equip) : rempli quand une arme est portée', () => {
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_well_armed, stateWith())).toBe(false)
    const st = stateWith({ equipped: { weapon: { templateId: 'iron_sword' } } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_well_armed, st)).toBe(true)
  })

  it('onb_cover_up (kill + collect) : requiert les 5 kills ET la peau', () => {
    const partial = stateWith({ kills: { thicket_hare: 5 } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_cover_up, partial)).toBe(false)
    const full = stateWith({ kills: { thicket_hare: 5 }, resources: { hare_pelt: 1 } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_cover_up, full)).toBe(true)
  })

  it('onb_recueillement (pray) : rempli après 1 prière', () => {
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_recueillement, stateWith())).toBe(false)
    expect(
      isQuestCompleteState(ONBOARDING_QUESTS.onb_recueillement, stateWith({ prayCount: 1 })),
    ).toBe(true)
  })

  it('onb_devotion (accept_deed) : rempli après 1 acte accepté', () => {
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_devotion, stateWith())).toBe(false)
    expect(
      isQuestCompleteState(ONBOARDING_QUESTS.onb_devotion, stateWith({ deedsAccepted: 1 })),
    ).toBe(true)
  })

  it('onb_first_brew (craft consumable) : seul un craft de consommable compte', () => {
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_first_brew, stateWith())).toBe(false)
    const wrong = stateWith({ craftCountByKind: { equipment: 3 } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_first_brew, wrong)).toBe(false)
    const right = stateWith({ craftCountByKind: { consumable: 1 } })
    expect(isQuestCompleteState(ONBOARDING_QUESTS.onb_first_brew, right)).toBe(true)
  })
})
