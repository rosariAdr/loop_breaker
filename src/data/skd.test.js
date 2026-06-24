// SKD07 — mapping des drops de skill par zone. SKD-E1 — revue d'intégrité de skills.js.
import { describe, it, expect } from 'vitest'
import { SKILLS } from './skills'
import { MONSTERS, getSkillDropMap } from './monsters'

describe('SKD07 — mapping des drops de skill par zone', () => {
  const map = getSkillDropMap()
  it('Ashenvale : 16 monstres de surface ont un drop classé', () => {
    expect(map.ashenvale).toHaveLength(16)
    for (const e of map.ashenvale) {
      expect(['physical_active', 'magic_active', 'passive']).toContain(e.class)
      expect(SKILLS[e.skillId]).toBeDefined()
    }
  })
  it('couvre les 3 classes (physique / magique / passif) en Ashenvale', () => {
    const classes = new Set(map.ashenvale.map((e) => e.class))
    expect(classes.has('physical_active')).toBe(true)
    expect(classes.has('magic_active')).toBe(true)
    expect(classes.has('passive')).toBe(true)
  })
  it('marque les élites de la zone', () => {
    const elites = map.ashenvale.filter((e) => e.elite).map((e) => e.monsterId)
    expect(elites).toEqual(
      expect.arrayContaining(['old_oakheart', 'graven_sentinel', 'thunderhoof', 'fenrot_devourer']),
    )
  })
})

const DAMAGE_TYPES = ['physical', 'magical', 'fire', 'lightning', 'ice', 'true']
const CONTAINERS = ['mana_stone', 'divine', 'supreme']

describe('SKD-E1 — intégrité de skills.js', () => {
  const skills = Object.entries(SKILLS)
  it('id === clé · type valide · container valide · inheritable booléen', () => {
    for (const [key, s] of skills) {
      expect(s.id, key).toBe(key)
      expect(['active', 'passive'], key).toContain(s.type)
      expect(CONTAINERS, key).toContain(s.container)
      expect(typeof s.inheritable, key).toBe('boolean')
    }
  })
  it('sourceMonster (si défini) existe dans MONSTERS', () => {
    for (const [key, s] of skills) {
      if (s.sourceMonster) expect(MONSTERS[s.sourceMonster], key).toBeDefined()
    }
  })
  it('type de dégâts valide quand présent', () => {
    for (const [key, s] of skills) {
      const dt = s.effect?.damage?.type
      if (dt) expect(DAMAGE_TYPES, key).toContain(dt)
    }
  })
  it('SKD03/04 — ember_burst & fox_fire créés (feu)', () => {
    for (const id of ['ember_burst', 'fox_fire']) {
      expect(SKILLS[id]).toBeDefined()
      expect(SKILLS[id].effect.damage.type).toBe('fire')
    }
  })
})
