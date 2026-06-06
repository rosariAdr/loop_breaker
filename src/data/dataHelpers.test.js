// Couverture des helpers purs de data/ (skills, titles, zones)
import { describe, it, expect } from 'vitest'
import { getSkillStats, isDivineSkillInheritable, SKILLS } from './skills'
import { getTitle, TITLES } from './titles'
import { scaleMonsterStats, getMonsterLevel, ZONE_MULTS } from './zones'

describe('skills — getSkillStats', () => {
  it('renvoie null pour un skill inconnu', () => {
    expect(getSkillStats('nope', 1)).toBeNull()
  })
  it('renvoie une copie de base au niveau 1', () => {
    const id = Object.keys(SKILLS)[0]
    expect(getSkillStats(id, 1).name).toBe(SKILLS[id].name)
  })
  it('attache _levelBonuses + level au niveau > 1', () => {
    const id = Object.keys(SKILLS)[0]
    const s = getSkillStats(id, 2)
    expect(s.level).toBe(2)
    expect(s._levelBonuses).toBeDefined()
  })
})

describe('skills — isDivineSkillInheritable', () => {
  it('skill non-divin suit son flag inheritable', () => {
    expect(isDivineSkillInheritable({ container: 'mana', inheritable: true })).toBe(true)
    expect(isDivineSkillInheritable({ container: 'mana', inheritable: false })).toBe(false)
  })
  it('skill divin héritable seulement à partir du niveau 2', () => {
    expect(isDivineSkillInheritable({ container: 'divine', level: 1 })).toBe(false)
    expect(isDivineSkillInheritable({ container: 'divine', level: 2 })).toBe(true)
    expect(isDivineSkillInheritable({ container: 'divine', level: 3 })).toBe(true)
  })
})

describe('titles — getTitle', () => {
  it('renvoie le titre existant', () => {
    const id = Object.keys(TITLES)[0]
    expect(getTitle(id)).toBe(TITLES[id])
  })
  it('renvoie null pour un id inconnu', () => {
    expect(getTitle('nope')).toBeNull()
  })
})

describe('zones — scaleMonsterStats', () => {
  const base = { hp: 100, atk: 10, def: 4, spd: 7 }

  it('applique le multiplicateur de zone et ne scale pas la vitesse', () => {
    const ash = scaleMonsterStats(base, 'ashenvale', 0)
    expect(ash.hp).toBe(Math.round(100 * (ZONE_MULTS.ashenvale ?? 1)))
    expect(ash.spd).toBe(7)
  })
  it('le run scale augmente les stats, plafonné à 25 runs', () => {
    const r0 = scaleMonsterStats(base, 'ashenvale', 0)
    const r10 = scaleMonsterStats(base, 'ashenvale', 10)
    const r25 = scaleMonsterStats(base, 'ashenvale', 25)
    const r99 = scaleMonsterStats(base, 'ashenvale', 99)
    expect(r10.hp).toBeGreaterThan(r0.hp)
    expect(r99.hp).toBe(r25.hp)
  })
  it('zone inconnue → multiplicateur 1', () => {
    expect(scaleMonsterStats(base, 'unknown_zone', 0).hp).toBe(100)
  })
})

describe('zones — getMonsterLevel', () => {
  it('renvoie 1 pour un monstre inconnu', () => {
    expect(getMonsterLevel('nope')).toBe(1)
  })
  it('dérive le niveau du levelRange du spot (>= 1)', () => {
    expect(getMonsterLevel('ashwood_wolf')).toBeGreaterThanOrEqual(1)
  })
})
