// MON01 — Tests de la refonte du bestiaire de surface.
import { describe, it, expect } from 'vitest'
import { MONSTERS, MONSTERS_BY_SPOT, MONSTERS_BY_ZONE, MONSTERS_RESERVE } from './monsters'
import { SKILLS } from './skills'
import { ZONES, getMonsterLevel } from './zones'
import { POS, NODES } from './worldGraph'

const SURFACE_SPOTS = ['ashenvale_forest', 'thornmarsh', 'crumbled_ruins', 'wildmere_hills']

describe('MON01 — roster par spot', () => {
  const expected = {
    ashenvale_forest: ['ashwood_wolf', 'thicket_hare', 'tuskmaw_boar', 'old_oakheart'],
    thornmarsh: ['marsh_serpent', 'briar_wraith', 'mire_slime', 'fenrot_devourer'],
    crumbled_ruins: ['stone_golem', 'hollow_knight', 'ruin_specter', 'graven_sentinel'],
    wildmere_hills: ['hill_slime', 'russet_fox', 'knoll_goblin', 'thunderhoof'],
  }
  for (const [spot, ids] of Object.entries(expected)) {
    it(`${spot} → roster exact`, () => {
      expect(MONSTERS_BY_SPOT[spot]).toEqual(ids)
      ids.forEach((id) => {
        expect(MONSTERS[id]).toBeDefined()
        expect(MONSTERS[id].huntingSpot).toBe(spot)
      })
    })
  }

  it('chaque spot a exactement 1 élite', () => {
    SURFACE_SPOTS.forEach((spot) => {
      const elites = MONSTERS_BY_SPOT[spot].filter((id) => MONSTERS[id].rank === 'elite')
      expect(elites).toHaveLength(1)
    })
  })
})

describe('MON01 — retraits & renommages', () => {
  it('monstres retirés absents de MONSTERS', () => {
    ['rotting_shambler', 'gloom_bat', 'bog_shambler', 'grave_knight'].forEach((id) => {
      expect(MONSTERS[id]).toBeUndefined()
    })
  })

  it('Graven Sentinel remplace Grave Knight dans crumbled_ruins', () => {
    expect(MONSTERS.graven_sentinel).toBeDefined()
    expect(MONSTERS.graven_sentinel.name).toBe('Graven Sentinel')
    expect(MONSTERS.graven_sentinel.huntingSpot).toBe('crumbled_ruins')
  })

  it('zone renommée Wildmere Hills (id wildmere_hills, plus de barrow_hills)', () => {
    const spot = ZONES.ashenvale.huntingSpots.find((s) => s.id === 'wildmere_hills')
    expect(spot).toBeDefined()
    expect(spot.name).toBe('Wildmere Hills')
    expect(ZONES.ashenvale.huntingSpots.find((s) => s.id === 'barrow_hills')).toBeUndefined()
    // WorldMap : node renommé
    expect(POS.wildmere_hills).toBeDefined()
    expect(POS.barrow_hills).toBeUndefined()
    expect(NODES.find((n) => n.id === 'wildmere_hills')?.name).toBe('Wildmere Hills')
  })

  it('niveau de wildmere_hills dérivé du spot (18)', () => {
    expect(getMonsterLevel('thunderhoof')).toBe(18)
  })
})

describe('MON01 — réserve (jamais spawn en surface)', () => {
  it('barrow_wight + soul_harvester sont en réserve', () => {
    expect(MONSTERS_RESERVE).toEqual(expect.arrayContaining(['barrow_wight', 'soul_harvester']))
    expect(MONSTERS.barrow_wight.reserve).toBe(true)
    expect(MONSTERS.soul_harvester.reserve).toBe(true)
  })

  it('réserve conservée en données mais exclue des spots ET des zones', () => {
    MONSTERS_RESERVE.forEach((id) => {
      expect(MONSTERS[id]).toBeDefined() // toujours en data (usage futur donjon)
      SURFACE_SPOTS.forEach((spot) => expect(MONSTERS_BY_SPOT[spot]).not.toContain(id))
      expect(MONSTERS_BY_ZONE.ashenvale).not.toContain(id)
    })
  })
})

describe('MON01 — skillDropType (champ interne, cohérent avec SKILLS)', () => {
  it('chaque monstre a un skillDropType valide', () => {
    Object.values(MONSTERS).forEach((m) => {
      expect(['active', 'passive', 'none']).toContain(m.skillDropType)
    })
  })

  it("'none' → pas de skillDrop ; 'active'/'passive' → skill existant du bon type", () => {
    Object.values(MONSTERS).forEach((m) => {
      if (m.skillDropType === 'none') {
        expect(m.skillDrop).toBeUndefined()
      } else {
        expect(m.skillDrop?.skillId).toBeTruthy()
        const skill = SKILLS[m.skillDrop.skillId]
        expect(skill).toBeDefined()
        expect(skill.type).toBe(m.skillDropType)
      }
    })
  })

  it('monstres none = thicket_hare + russet_fox', () => {
    const none = Object.values(MONSTERS).filter((m) => m.skillDropType === 'none').map((m) => m.id)
    expect(none.sort()).toEqual(['russet_fox', 'thicket_hare'])
  })

  it('ashwood_wolf garde Savage Bite (décision joueur)', () => {
    expect(MONSTERS.ashwood_wolf.skillDrop.skillId).toBe('savage_bite')
    expect(SKILLS.savage_bite.name).toBe('Savage Bite')
  })
})

describe('MON01 — nouveaux skills créés', () => {
  const newActive = ['bramble_slam', 'cursed_cleave', 'soul_chill', 'tomb_judgment', 'venom_strike', 'thorn_lash', 'plague_maw', 'cheap_shot', 'trample_charge']
  const newPassive = ['thick_hide', 'stoneskin', 'caustic_coat', 'mossy_hide']

  it('les 9 actives existent et sont de type active', () => {
    newActive.forEach((id) => {
      expect(SKILLS[id]).toBeDefined()
      expect(SKILLS[id].type).toBe('active')
      expect(SKILLS[id].effect?.damage).toBeDefined()
    })
  })

  it('les 4 passives existent et sont de type passive', () => {
    newPassive.forEach((id) => {
      expect(SKILLS[id]).toBeDefined()
      expect(SKILLS[id].type).toBe('passive')
    })
  })
})
