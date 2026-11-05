// Tests techniques sur la structure des données QUESTS et QUEST_NPCS (Q03 + Q08)

import { describe, it, expect } from 'vitest'
import { QUESTS, QUEST_NPCS, QUEST_NPC_REGISTRY } from './quests'
import { MONSTERS } from './monsters'
import { SKILLS } from './skills'
import { CHURCH_QUESTS } from './churchQuests'
import { MASTER_QUESTS } from './masterQuests'
import { MAIN_QUESTS } from './mainQuests'

describe('QSV2-NPCONLY01 — quêtes maître/église hors board', () => {
  it('aucun id d’église/maître n’est dans le pool de board (QUESTS + MAIN_QUESTS)', () => {
    const boardIds = new Set([...Object.keys(QUESTS), ...Object.keys(MAIN_QUESTS)])
    for (const id of Object.keys(CHURCH_QUESTS)) expect(boardIds.has(id), id).toBe(false)
    for (const id of Object.keys(MASTER_QUESTS)) expect(boardIds.has(id), id).toBe(false)
  })
})

describe('QUEST_NPCS — Q08', () => {
  it('contient au moins les 3 NPCs donneurs', () => {
    expect(QUEST_NPCS.sir_aldric).toBeDefined()
    expect(QUEST_NPCS.ironhaven_captain).toBeDefined()
    expect(QUEST_NPCS.greywatch_elder).toBeDefined()
  })

  it('chaque NPC a id, name, title, location, sigil', () => {
    Object.values(QUEST_NPCS).forEach((npc) => {
      expect(npc).toHaveProperty('id')
      expect(npc).toHaveProperty('name')
      expect(npc).toHaveProperty('title')
      expect(npc).toHaveProperty('location')
      expect(npc).toHaveProperty('sigil')
    })
  })

  it("l'id de chaque NPC correspond à sa clé", () => {
    Object.entries(QUEST_NPCS).forEach(([key, npc]) => {
      expect(npc.id).toBe(key)
    })
  })
})

describe('QUESTS — structure valide', () => {
  it('toutes les quêtes ont les champs requis', () => {
    Object.values(QUESTS).forEach((q) => {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('name')
      expect(q).toHaveProperty('description')
      expect(q).toHaveProperty('giverNpc')
      expect(q).toHaveProperty('flavorText')
      expect(q).toHaveProperty('objectives')
      expect(q).toHaveProperty('reward')
      expect(Array.isArray(q.objectives)).toBe(true)
    })
  })

  it('chaque giverNpc existe dans le registre', () => {
    // QSV2-ADJ-AUDIT01 — givers re-domiciliés peuvent venir du registre (ex. Warden Halric).
    Object.values(QUESTS).forEach((q) => {
      expect(QUEST_NPC_REGISTRY[q.giverNpc], q.id).toBeDefined()
    })
  })

  it("l'id de chaque quête correspond à sa clé", () => {
    Object.entries(QUESTS).forEach(([key, q]) => {
      expect(q.id).toBe(key)
    })
  })

  it("tous les monsterId dans les objectifs 'kill' existent dans MONSTERS", () => {
    Object.values(QUESTS).forEach((q) => {
      q.objectives
        .filter((o) => o.type === 'kill')
        .forEach((o) => {
          expect(MONSTERS[o.monsterId]).toBeDefined()
        })
    })
  })

  it('tous les skillId de récompense existent dans SKILLS', () => {
    Object.values(QUESTS).forEach((q) => {
      if (q.reward.skill) {
        expect(SKILLS[q.reward.skill.skillId]).toBeDefined()
      }
    })
  })
})

describe('Q03 — Quêtes boss donjon', () => {
  it('silence_the_crypt cible hollow_crypt_boss', () => {
    const q = QUESTS.silence_the_crypt
    expect(q.giverNpc).toBe('ironhaven_captain')
    expect(q.objectives[0].monsterId).toBe('hollow_crypt_boss')
    expect(q.objectives[0].count).toBe(1)
  })

  it('storm_the_citadel cible forsaken_citadel_boss', () => {
    const q = QUESTS.storm_the_citadel
    expect(q.giverNpc).toBe('ironhaven_captain')
    expect(q.objectives[0].monsterId).toBe('forsaken_citadel_boss')
  })

  it('end_the_demon cible malachar', () => {
    const q = QUESTS.end_the_demon
    expect(q.giverNpc).toBe('ironhaven_captain')
    expect(q.objectives[0].monsterId).toBe('malachar')
  })

  it('récompenses boss > récompenses communes', () => {
    // nc_thin_the_boars : 60g. silence_the_crypt (boss) > 100g
    expect(QUESTS.silence_the_crypt.reward.gold).toBeGreaterThan(
      QUESTS.nc_thin_the_boars.reward.gold,
    )
    expect(QUESTS.end_the_demon.reward.gold).toBeGreaterThanOrEqual(1000)
  })

  it('récompenses en tokens scalent avec la difficulté', () => {
    const boss1 = QUESTS.silence_the_crypt.reward.reputationTokens
    const boss2 = QUESTS.storm_the_citadel.reward.reputationTokens
    const demon = QUESTS.end_the_demon.reward.reputationTokens
    expect(boss2).toBeGreaterThanOrEqual(boss1)
    expect(demon).toBeGreaterThanOrEqual(boss2)
  })
})

describe('Q08 / QSV2-ADJ-AUDIT01 — quêtes secondaires re-domiciliées', () => {
  it('bog_purge re-domicilié à Millhaven (thornmarsh adjacent)', () => {
    expect(QUESTS.bog_purge.giverNpc).toBe('millhaven_elder')
    expect(QUESTS.bog_purge.objectives[0].monsterId).toBe('mire_slime')
  })

  it('ruins_cleanse (Millhaven) a plusieurs objectifs', () => {
    const q = QUESTS.ruins_cleanse
    expect(q.giverNpc).toBe('millhaven_elder')
    expect(q.objectives).toHaveLength(2)
  })
})

describe('Répartition des quêtes par NPC', () => {
  it('sir_aldric a au moins 2 quêtes de départ (QSV2-DROPDUP01 : first_blood/oakheart retirées)', () => {
    const count = Object.values(QUESTS).filter((q) => q.giverNpc === 'sir_aldric').length
    expect(count).toBeGreaterThanOrEqual(2)
  })

  it('ironhaven_captain a au moins 3 quêtes boss', () => {
    const count = Object.values(QUESTS).filter((q) => q.giverNpc === 'ironhaven_captain').length
    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('millhaven_elder (Warden Halric) porte ≥ 2 quêtes re-domiciliées', () => {
    const count = Object.values(QUESTS).filter((q) => q.giverNpc === 'millhaven_elder').length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
