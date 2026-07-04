// MST09 — pools de skills-récompense par discipline : intégrité + cohérence physical/magic.
import { describe, it, expect } from 'vitest'
import {
  MASTER_FOCUSES,
  FOCUS_DAMAGE_CLASS,
  MASTER_SKILL_POOLS,
  getMasterSkillPool,
  MASTERS,
  getMaster,
  getMasterByInitiationQuest,
} from './masters'
import { SKILLS } from './skills'
import { getSkillDropType } from './monsters'
import { MASTER_QUESTS } from './masterQuests'

// Classe de dégâts d'un skill via la source de vérité SKD (getSkillDropType attend
// un "monstre" avec skillDrop.skillId → on l'enveloppe).
const dropClass = (skillId) => getSkillDropType({ skillDrop: { skillId } })

describe('MST09 — pools de skills par discipline', () => {
  it('chaque discipline connue a un pool (tableau)', () => {
    for (const focus of MASTER_FOCUSES) {
      expect(Array.isArray(MASTER_SKILL_POOLS[focus]), focus).toBe(true)
    }
  })

  it('tout id poolé existe dans SKILLS', () => {
    for (const [focus, ids] of Object.entries(MASTER_SKILL_POOLS)) {
      for (const id of ids) {
        expect(SKILLS[id], `${focus}/${id}`).toBeDefined()
      }
    }
  })

  it('on ne puise que dans les skills « de base » (container mana_stone)', () => {
    for (const [focus, ids] of Object.entries(MASTER_SKILL_POOLS)) {
      for (const id of ids) {
        expect(SKILLS[id].container, `${focus}/${id}`).toBe('mana_stone')
      }
    }
  })

  it('aucun doublon au sein d’un même pool', () => {
    for (const [focus, ids] of Object.entries(MASTER_SKILL_POOLS)) {
      expect(new Set(ids).size, focus).toBe(ids.length)
    }
  })

  // Cohérence physical/magic — règle : un skill qui PORTE des dégâts doit correspondre
  // à la classe de la discipline. Utilitaires (sans dégât) et passifs sont autorisés
  // côté physique (garde/riposte/buffs martiaux) mais interdits de dégâts contradictoires.
  it('disciplines physiques (martial, berserker) : aucun skill à dégâts non physiques', () => {
    for (const focus of ['martial', 'berserker']) {
      expect(FOCUS_DAMAGE_CLASS[focus]).toBe('physical')
      for (const id of MASTER_SKILL_POOLS[focus]) {
        const dmg = SKILLS[id].effect?.damage?.type
        if (dmg) expect(dmg, `${focus}/${id}`).toBe('physical')
      }
    }
  })

  it('disciplines magiques (arcane, feu, glace) : jamais de dégâts physiques', () => {
    for (const focus of ['arcane', 'feu', 'glace']) {
      expect(FOCUS_DAMAGE_CLASS[focus].startsWith('magic')).toBe(true)
      for (const id of MASTER_SKILL_POOLS[focus]) {
        const dmg = SKILLS[id].effect?.damage?.type
        if (dmg) expect(dmg, `${focus}/${id}`).not.toBe('physical')
        // via la source de vérité SKD : jamais classé physical_active
        expect(dropClass(id), `${focus}/${id}`).not.toBe('physical_active')
      }
    }
  })

  it('feu : tout skill à dégâts est de l’élément `fire`', () => {
    for (const id of MASTER_SKILL_POOLS.feu) {
      const dmg = SKILLS[id].effect?.damage?.type
      if (dmg) expect(dmg, `feu/${id}`).toBe('fire')
    }
    expect(MASTER_SKILL_POOLS.feu.length).toBeGreaterThan(0)
  })

  it('glace : tout skill à dégâts est de l’élément `ice` (SKD-ICE01 — pool désormais alimenté)', () => {
    for (const id of MASTER_SKILL_POOLS.glace) {
      const dmg = SKILLS[id].effect?.damage?.type
      if (dmg) expect(dmg, `glace/${id}`).toBe('ice')
    }
    // SKD-ICE01 — le pool de glace n'est plus vide (débloque le maître de glace MST08).
    expect(MASTER_SKILL_POOLS.glace.length).toBeGreaterThan(0)
    expect(MASTER_SKILL_POOLS.glace).toContain('ice_shard')
  })

  it('martial : contient bien power_strike et counter_strike (reroutés par MST03)', () => {
    expect(MASTER_SKILL_POOLS.martial).toContain('power_strike')
    expect(MASTER_SKILL_POOLS.martial).toContain('counter_strike')
  })

  it('getMasterSkillPool renvoie le pool, ou [] pour une discipline inconnue', () => {
    expect(getMasterSkillPool('martial')).toBe(MASTER_SKILL_POOLS.martial)
    expect(getMasterSkillPool('inconnue')).toEqual([])
  })
})

// MST01/MST05 — modèle de données « maître » + engagement.
describe('MST01 — modèle de données MASTERS', () => {
  it('chaque maître a une forme valide (id, name, title, focus connu, initiation, pool)', () => {
    for (const [id, m] of Object.entries(MASTERS)) {
      expect(m.id, id).toBe(id)
      expect(typeof m.name, id).toBe('string')
      expect(typeof m.title, id).toBe('string')
      expect(MASTER_FOCUSES, id).toContain(m.focus)
      // localité fixe OU itinérant (exactement un des deux)
      expect(Boolean(m.location) !== Boolean(m.itinerant), `${id} location/itinerant`).toBe(true)
      expect(typeof m.initiationQuestId, id).toBe('string')
      expect(Array.isArray(m.skillQuestPool), id).toBe(true)
    }
  })

  it("l'initiationQuestId de chaque maître existe et est marquée initiation", () => {
    for (const [id, m] of Object.entries(MASTERS)) {
      const q = MASTER_QUESTS[m.initiationQuestId]
      expect(q, `${id}/${m.initiationQuestId}`).toBeDefined()
      expect(q.isInitiation, id).toBe(true)
      expect(q.isMasterQuest, id).toBe(true)
      expect(q.masterId, id).toBe(id) // l'initiation pointe en retour vers son maître
    }
  })

  it('les quêtes du skillQuestPool existent, sont des quêtes de maître, et récompensent des skills du pool de la discipline', () => {
    for (const [id, m] of Object.entries(MASTERS)) {
      const disciplinePool = MASTER_SKILL_POOLS[m.focus] ?? []
      for (const qid of m.skillQuestPool) {
        const q = MASTER_QUESTS[qid]
        expect(q, `${id}/${qid}`).toBeDefined()
        expect(q.isMasterQuest, `${id}/${qid}`).toBe(true)
        // le skill récompensé (le cas échéant) appartient au pool de la discipline
        if (q.reward?.skill) {
          expect(disciplinePool, `${id}/${qid} reward.skill`).toContain(q.reward.skill.skillId)
        }
        // le skill ciblé par l'objectif skill_levelup appartient au pool de la discipline
        const obj = q.objectives?.find((o) => o.type === 'skill_levelup')
        if (obj) expect(disciplinePool, `${id}/${qid} objectif`).toContain(obj.skillId)
      }
    }
  })

  it('getMaster / getMasterByInitiationQuest résolvent correctement', () => {
    expect(getMaster('sir_aldric')).toBe(MASTERS.sir_aldric)
    expect(getMaster('inconnu')).toBeNull()
    expect(getMasterByInitiationQuest('master_init_aldric')).toBe(MASTERS.sir_aldric)
    expect(getMasterByInitiationQuest('nope')).toBeNull()
  })
})

describe('MST05 — Sir Aldric, maître martial de Greywatch', () => {
  it('est un maître martial fixe à Greywatch, avec le titre décidé (MST-G2)', () => {
    const aldric = MASTERS.sir_aldric
    expect(aldric).toBeDefined()
    expect(aldric.focus).toBe('martial')
    expect(aldric.location).toBe('greywatch')
    expect(aldric.itinerant).toBeUndefined() // maître fixe, pas itinérant
    expect(aldric.title).toBe("Membre d'honneur du Royal Knighthood")
  })

  it('porte la quête d’initiation de départ (choix libre, non obligatoire)', () => {
    expect(MASTERS.sir_aldric.initiationQuestId).toBe('master_init_aldric')
    expect(MASTER_QUESTS.master_init_aldric.giverNpc).toBe('sir_aldric')
  })
})
