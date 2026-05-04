// Tests techniques sur la structure des données QUESTS et QUEST_NPCS (Q03 + Q08)

import { describe, it, expect } from 'vitest'
import { QUESTS, QUEST_NPCS } from './quests'
import { MONSTERS } from './monsters'
import { SKILLS } from './skills'

describe('QUEST_NPCS — Q08', () => {
  it('contient au moins les 3 NPCs donneurs', () => {
    expect(QUEST_NPCS.sir_aldric).toBeDefined()
    expect(QUEST_NPCS.ironhaven_captain).toBeDefined()
    expect(QUEST_NPCS.greywatch_elder).toBeDefined()
  })

  it('chaque NPC a id, name, title, location, sigil', () => {
    Object.values(QUEST_NPCS).forEach(npc => {
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
    Object.values(QUESTS).forEach(q => {
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

  it('chaque giverNpc existe dans QUEST_NPCS', () => {
    Object.values(QUESTS).forEach(q => {
      expect(QUEST_NPCS[q.giverNpc]).toBeDefined()
    })
  })

  it("l'id de chaque quête correspond à sa clé", () => {
    Object.entries(QUESTS).forEach(([key, q]) => {
      expect(q.id).toBe(key)
    })
  })

  it("tous les monsterId dans les objectifs 'kill' existent dans MONSTERS", () => {
    Object.values(QUESTS).forEach(q => {
      q.objectives.filter(o => o.type === 'kill').forEach(o => {
        expect(MONSTERS[o.monsterId]).toBeDefined()
      })
    })
  })

  it('tous les skillId de récompense existent dans SKILLS', () => {
    Object.values(QUESTS).forEach(q => {
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
    // first_blood : 50g. silence_the_crypt (boss) > 100g
    expect(QUESTS.silence_the_crypt.reward.gold).toBeGreaterThan(QUESTS.first_blood.reward.gold)
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

describe('Q08 — Quêtes Greywatch Elder', () => {
  it('bog_purge vient de greywatch_elder', () => {
    expect(QUESTS.bog_purge.giverNpc).toBe('greywatch_elder')
    expect(QUESTS.bog_purge.objectives[0].monsterId).toBe('bog_shambler')
  })

  it('ruins_cleanse a plusieurs objectifs', () => {
    const q = QUESTS.ruins_cleanse
    expect(q.giverNpc).toBe('greywatch_elder')
    expect(q.objectives).toHaveLength(2)
  })
})

describe('Répartition des quêtes par NPC', () => {
  it('sir_aldric a au moins 3 quêtes de départ', () => {
    const count = Object.values(QUESTS).filter(q => q.giverNpc === 'sir_aldric').length
    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('ironhaven_captain a au moins 3 quêtes boss', () => {
    const count = Object.values(QUESTS).filter(q => q.giverNpc === 'ironhaven_captain').length
    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('greywatch_elder a au moins 2 quêtes', () => {
    const count = Object.values(QUESTS).filter(q => q.giverNpc === 'greywatch_elder').length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
