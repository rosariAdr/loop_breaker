// COV-ZONES01 — couverture unitaire des helpers purs de src/data/zones.js.
// Cible les branches faibles listées (~327,352,364-366 + branch 63 %) :
//   • getLocationType : zone inconnue, ville vs village
//   • hasDedicatedMasterBoard : ville/village AVEC board (academy/knight_trainer), village SANS, id inconnu
//   • isZoneUnlocked : zone inconnue, zone sans unlock, déblocage explicite, chaque type de condition (level/kills/stat/zoneCleared) vrai ET faux, type inconnu
//   • isNodeUnlocked : node de départ, node ouvert par quête, node verrouillé
//   • getVisibleZones : non-cachées toujours visibles, cachée verrouillée masquée, cachée débloquée visible
//   • getZoneMult / ZONE_MULTS : clés connues + getter dungeon_boss/demon_lord (327), id inconnu → 1.0
//   • scaleMonsterStats : scaling run + cap
//   • getSpotLevelRange : spot connu + spot inconnu (352 → null)
//   • getMonsterLevel : spot connu, repli zone.levelRange (364-365), monstre inconnu (359), zone inconnue → 1 (366)
import { describe, it, expect, beforeEach } from 'vitest'
import {
  ZONES,
  ZONE_ORDER,
  ZONE_MULTS,
  START_ZONE,
  START_OPEN_NODES,
  getLocationType,
  hasDedicatedMasterBoard,
  isZoneUnlocked,
  isNodeUnlocked,
  getVisibleZones,
  getZoneMult,
  scaleMonsterStats,
  getSpotLevelRange,
  getMonsterLevel,
} from './zones'
import { BALANCE, resetBalance } from '../config'

beforeEach(() => {
  // Les tests de getZoneMult / scaleMonsterStats lisent BALANCE : on repart des défauts.
  resetBalance()
})

describe('getLocationType', () => {
  it('retourne "village" par défaut si la zone est inconnue', () => {
    expect(getLocationType({ currentZone: 'nope', currentLocation: 'x' })).toBe('village')
  })

  it('retourne "village" pour un world null/undefined', () => {
    expect(getLocationType(undefined)).toBe('village')
    expect(getLocationType(null)).toBe('village')
  })

  it('retourne "city" quand currentLocation == la ville de la zone', () => {
    expect(getLocationType({ currentZone: 'ashenvale', currentLocation: 'ironhaven' })).toBe('city')
  })

  it('retourne "village" quand currentLocation n’est pas la ville', () => {
    expect(getLocationType({ currentZone: 'ashenvale', currentLocation: 'millhaven' })).toBe(
      'village',
    )
  })

  it('retourne "village" quand la zone n’a pas de ville (blighted_road)', () => {
    expect(getLocationType({ currentZone: 'blighted_road', currentLocation: 'anything' })).toBe(
      'village',
    )
  })
})

describe('hasDedicatedMasterBoard', () => {
  it('true pour une ville qui a l’Académie (Ironhaven)', () => {
    expect(hasDedicatedMasterBoard('ironhaven')).toBe(true)
  })

  it('true pour un village qui a le knight_trainer (Millhaven)', () => {
    expect(hasDedicatedMasterBoard('millhaven')).toBe(true)
  })

  it('false pour un village sans PNJ-maître (Greywatch)', () => {
    expect(hasDedicatedMasterBoard('greywatch')).toBe(false)
  })

  it('false pour un village d’une autre zone sans board (Duskreach)', () => {
    expect(hasDedicatedMasterBoard('duskreach')).toBe(false)
  })

  it('false pour un id de localité inconnu', () => {
    expect(hasDedicatedMasterBoard('nowhere')).toBe(false)
  })
})

describe('isZoneUnlocked', () => {
  it('false si la zone est inconnue', () => {
    expect(isZoneUnlocked('does_not_exist', {})).toBe(false)
  })

  it('true pour une zone sans unlock (zone de départ)', () => {
    expect(isZoneUnlocked('ashenvale', {})).toBe(true)
  })

  it('true via déblocage explicite dans world.unlockedZones', () => {
    expect(isZoneUnlocked('grimspire', { world: { unlockedZones: ['grimspire'] } })).toBe(true)
  })

  it('false quand aucune condition n’est satisfaite', () => {
    expect(isZoneUnlocked('grimspire', { world: {}, hero: { level: 1 } })).toBe(false)
  })

  it('condition "level" — vraie quand hero.level ≥ value', () => {
    // grimspire exige level 8
    expect(isZoneUnlocked('grimspire', { world: {}, hero: { level: 8 } })).toBe(true)
  })

  it('condition "level" — fausse quand hero.level < value (hero par défaut = 0)', () => {
    expect(isZoneUnlocked('blighted_road', { world: {} })).toBe(false)
  })

  it('condition "kills" — vraie quand les kills de la zone atteignent le seuil', () => {
    // blighted_road exige 10 kills d’ashenvale ; ashwood_wolf est en zone ashenvale.
    const state = { world: { monsterKillCounts: { ashwood_wolf: 10 } }, hero: { level: 0 } }
    expect(isZoneUnlocked('blighted_road', state)).toBe(true)
  })

  it('condition "kills" — additionne plusieurs monstres de la même zone', () => {
    const state = {
      world: { monsterKillCounts: { ashwood_wolf: 6, thicket_hare: 5 } },
      hero: { level: 0 },
    }
    // 11 ≥ 10 (blighted_road)
    expect(isZoneUnlocked('blighted_road', state)).toBe(true)
  })

  it('condition "kills" — ignore les kills d’une autre zone', () => {
    // cursed_warlord est en zone blighted_road, pas ashenvale → ne compte pas.
    const state = { world: { monsterKillCounts: { cursed_warlord: 99 } }, hero: { level: 0 } }
    expect(isZoneUnlocked('blighted_road', state)).toBe(false)
  })

  it('accepte un state plat (world === state)', () => {
    // Passe { unlockedZones } directement comme state (world = state.world ?? state).
    expect(isZoneUnlocked('grimspire', { unlockedZones: ['grimspire'] })).toBe(true)
  })

  it('condition "stat" — vraie/fausse selon hero.stats (branche stat via unlock synthétique)', () => {
    // La data réelle n’utilise pas 'stat' ; on injecte un unlock temporaire pour couvrir la branche.
    const original = ZONES.ashenvale.unlock
    ZONES.ashenvale.unlock = {
      hidden: false,
      conditions: [{ type: 'stat', stat: 'str', value: 5 }],
    }
    try {
      expect(isZoneUnlocked('ashenvale', { world: {}, hero: { stats: { str: 5 } } })).toBe(true)
      expect(isZoneUnlocked('ashenvale', { world: {}, hero: { stats: { str: 4 } } })).toBe(false)
      expect(isZoneUnlocked('ashenvale', { world: {}, hero: {} })).toBe(false)
    } finally {
      ZONES.ashenvale.unlock = original
    }
  })

  it('condition "zoneCleared" — vraie/fausse selon world.clearedZones', () => {
    const original = ZONES.ashenvale.unlock
    ZONES.ashenvale.unlock = {
      hidden: false,
      conditions: [{ type: 'zoneCleared', ref: 'tutorial' }],
    }
    try {
      expect(isZoneUnlocked('ashenvale', { world: { clearedZones: ['tutorial'] } })).toBe(true)
      expect(isZoneUnlocked('ashenvale', { world: { clearedZones: [] } })).toBe(false)
      expect(isZoneUnlocked('ashenvale', { world: {} })).toBe(false)
    } finally {
      ZONES.ashenvale.unlock = original
    }
  })

  it('condition de type inconnu → false', () => {
    const original = ZONES.ashenvale.unlock
    ZONES.ashenvale.unlock = { hidden: false, conditions: [{ type: 'mystery', value: 1 }] }
    try {
      expect(isZoneUnlocked('ashenvale', { world: {}, hero: { level: 99 } })).toBe(false)
    } finally {
      ZONES.ashenvale.unlock = original
    }
  })

  it('unlock avec conditions absentes → false (aucune condition satisfaite)', () => {
    const original = ZONES.ashenvale.unlock
    ZONES.ashenvale.unlock = { hidden: false }
    try {
      expect(isZoneUnlocked('ashenvale', { world: {}, hero: { level: 99 } })).toBe(false)
    } finally {
      ZONES.ashenvale.unlock = original
    }
  })
})

describe('isNodeUnlocked', () => {
  it('true pour un node d’ouverture (greywatch, ashenvale_forest)', () => {
    expect(isNodeUnlocked('greywatch')).toBe(true)
    expect(isNodeUnlocked('ashenvale_forest')).toBe(true)
    expect(START_OPEN_NODES).toContain('greywatch')
  })

  it('true pour un node ouvert par une quête (world.unlockedNodes)', () => {
    expect(isNodeUnlocked('thornmarsh', { unlockedNodes: ['thornmarsh'] })).toBe(true)
  })

  it('false pour un node verrouillé (absent des deux listes)', () => {
    expect(isNodeUnlocked('thornmarsh', { unlockedNodes: [] })).toBe(false)
    expect(isNodeUnlocked('crumbled_ruins')).toBe(false)
  })

  it('false quand world est omis pour un node non-départ', () => {
    expect(isNodeUnlocked('wildmere_hills')).toBe(false)
  })
})

describe('getVisibleZones', () => {
  it('inclut toutes les zones non cachées (unlock.hidden falsy)', () => {
    // Aucune zone n’est hidden dans la data → toutes visibles quel que soit le state.
    expect(getVisibleZones({})).toEqual(ZONE_ORDER)
  })

  it('masque une zone hidden tant qu’elle n’est pas débloquée', () => {
    const original = ZONES.grimspire.unlock
    ZONES.grimspire.unlock = { hidden: true, conditions: [{ type: 'level', value: 8 }] }
    try {
      const locked = getVisibleZones({ world: {}, hero: { level: 1 } })
      expect(locked).not.toContain('grimspire')
      // Débloquée (level 8) → réapparaît.
      const unlocked = getVisibleZones({ world: {}, hero: { level: 8 } })
      expect(unlocked).toContain('grimspire')
    } finally {
      ZONES.grimspire.unlock = original
    }
  })

  it('inclut une zone hidden si elle est dans unlockedZones', () => {
    const original = ZONES.grimspire.unlock
    ZONES.grimspire.unlock = { hidden: true, conditions: [] }
    try {
      expect(getVisibleZones({ world: { unlockedZones: ['grimspire'] } })).toContain('grimspire')
    } finally {
      ZONES.grimspire.unlock = original
    }
  })
})

describe('getZoneMult & ZONE_MULTS', () => {
  it('renvoie le multiplicateur des zones connues', () => {
    expect(getZoneMult('ashenvale')).toBe(1.0)
    expect(getZoneMult('blighted_road')).toBe(1.8)
    expect(getZoneMult('grimspire')).toBe(2.5)
  })

  it('renvoie 1.0 pour une zone inconnue (fallback)', () => {
    expect(getZoneMult('unknown_zone')).toBe(1.0)
  })

  it('reflète un override BALANCE', () => {
    BALANCE.zone_mult_ashenvale = 9
    expect(getZoneMult('ashenvale')).toBe(9)
  })

  it('les getters ZONE_MULTS délèguent à getZoneMult (dont dungeon_boss/demon_lord)', () => {
    expect(ZONE_MULTS.ashenvale).toBe(1.0)
    expect(ZONE_MULTS.blighted_road).toBe(1.8)
    expect(ZONE_MULTS.grimspire).toBe(2.5)
    expect(ZONE_MULTS.dungeon_boss).toBe(3.5)
    expect(ZONE_MULTS.demon_lord).toBe(6.0)
  })
})

describe('scaleMonsterStats', () => {
  const base = { hp: 100, atk: 10, def: 5, spd: 12 }

  it('applique zone_mult au run 0 (runScale = 1)', () => {
    const s = scaleMonsterStats(base, 'ashenvale', 0)
    expect(s).toEqual({ hp: 100, atk: 10, def: 5, spd: 12 })
  })

  it('applique le run scaling (base^runCount) et n’altère pas spd', () => {
    const s = scaleMonsterStats(base, 'grimspire', 1)
    // mult 2.5 * 1.08^1 = 2.7
    expect(s.hp).toBe(Math.round(100 * 2.5 * BALANCE.run_scaling))
    expect(s.spd).toBe(12)
  })

  it('plafonne le run scaling au cap (run_scaling_cap)', () => {
    const capped = scaleMonsterStats(base, 'ashenvale', 999)
    const atCap = scaleMonsterStats(base, 'ashenvale', BALANCE.run_scaling_cap)
    expect(capped).toEqual(atCap)
  })
})

describe('getSpotLevelRange', () => {
  it('retourne le levelRange d’un spot connu', () => {
    expect(getSpotLevelRange('ashenvale_forest')).toEqual([1, 8])
    expect(getSpotLevelRange('thornmarsh')).toEqual([20, 30])
  })

  it('retourne null pour un spot inconnu', () => {
    expect(getSpotLevelRange('nowhere')).toBeNull()
  })
})

describe('getMonsterLevel', () => {
  it('retourne 1 pour un monstre inconnu', () => {
    expect(getMonsterLevel('does_not_exist')).toBe(1)
  })

  it('dérive du levelRange[0] du hunting spot du monstre', () => {
    // ashwood_wolf → ashenvale_forest [1,8]
    expect(getMonsterLevel('ashwood_wolf')).toBe(1)
  })

  it('dérive d’un spot plus tardif (marsh_serpent → thornmarsh [20,30])', () => {
    expect(getMonsterLevel('marsh_serpent')).toBe(20)
  })

  it('repli sur zone.levelRange[0] quand le monstre n’a pas de spot listé (cursed_warlord → blighted_road)', () => {
    // cursed_warlord : zone blighted_road [15,30], aucun huntingSpot dans huntingSpots.
    expect(getMonsterLevel('cursed_warlord')).toBe(15)
  })

  it('repli sur zone.levelRange pour un monstre "reserve" à huntingSpot null (barrow_wight → ashenvale)', () => {
    // huntingSpot null → aucun spot trouvé → zone ashenvale [1,30] → 1
    expect(getMonsterLevel('barrow_wight')).toBe(1)
  })

  it('retourne 1 quand ni spot ni zone.levelRange ne renseignent le niveau (fallback final)', () => {
    // barrow_wight : huntingSpot null. On neutralise temporairement le levelRange de sa
    // zone pour forcer le tout dernier `return 1` (aucune data réelle n’atteint ce chemin).
    const original = ZONES.ashenvale.levelRange
    ZONES.ashenvale.levelRange = undefined
    try {
      expect(getMonsterLevel('barrow_wight')).toBe(1)
    } finally {
      ZONES.ashenvale.levelRange = original
    }
  })
})

describe('constantes exportées', () => {
  it('START_ZONE et ZONE_ORDER sont cohérents', () => {
    expect(START_ZONE).toBe('ashenvale')
    expect(ZONE_ORDER[0]).toBe('ashenvale')
    expect(ZONE_ORDER).toContain('grimspire')
  })
})
