// EQP01 / SET-G1 / SET-CONTENT01 — Tests du système de bonus de set.
import { describe, it, expect } from 'vitest'
import {
  SETS,
  SET_BONUS_TIERS,
  setBonusFraction,
  countEquippedSetPieces,
  getSetBonus,
  getActiveSetsSummary,
} from './sets'
import {
  EQUIPMENT_TEMPLATES,
  createEquipmentInstance,
  calcEquippedStatBonuses,
} from './equipment'

// Fabrique une pièce équipée « nue » avec un set et des stats donnés.
const piece = (setId, stats) => ({ instanceId: Math.random().toString(36), set: setId, stats })

describe('SET-G1 — modèle de bonus (paliers % de pièces)', () => {
  it('les paliers vont de 2 → 9 pièces, croissants', () => {
    const keys = Object.keys(SET_BONUS_TIERS).map(Number)
    expect(Math.min(...keys)).toBe(2)
    expect(Math.max(...keys)).toBe(9)
    for (let n = 3; n <= 9; n++) {
      expect(SET_BONUS_TIERS[n]).toBeGreaterThan(SET_BONUS_TIERS[n - 1])
    }
  })

  it('setBonusFraction : 0/1 pièce → 0 ; 2 → 0.05 ; 3 → 0.13 ; 4 → 0.20', () => {
    expect(setBonusFraction(0)).toBe(0)
    expect(setBonusFraction(1)).toBe(0)
    expect(setBonusFraction(2)).toBe(0.05)
    expect(setBonusFraction(3)).toBe(0.13)
    expect(setBonusFraction(4)).toBe(0.2)
  })

  it('setBonusFraction clampe au-delà de 9 pièces', () => {
    expect(setBonusFraction(12)).toBe(SET_BONUS_TIERS[9])
  })
})

describe('EQP01 — getSetBonus (math)', () => {
  it('aucun bonus sous 2 pièces', () => {
    const eq = { a: piece('iron_vanguard', { strength: 5 }) }
    expect(getSetBonus(eq)).toEqual({})
  })

  it('2 pièces → +5% de la somme des stats gouvernés fournis', () => {
    // iron_vanguard gouverne def+strength. 2 pièces : def 10 + strength 20 → +5%.
    const eq = {
      helmet: piece('iron_vanguard', { def: 10 }),
      weapon: piece('iron_vanguard', { strength: 20 }),
    }
    const b = getSetBonus(eq)
    expect(b.def).toBe(Math.round(10 * 0.05)) // 1 (arrondi de 0.5)
    expect(b.strength).toBe(Math.round(20 * 0.05)) // 1
  })

  it('ne compte QUE les stats gouvernés par le set (ignore les autres)', () => {
    // iron_vanguard gouverne def+strength ; agility fourni par une pièce n’est PAS boosté.
    const eq = {
      helmet: piece('iron_vanguard', { def: 40, agility: 100 }),
      weapon: piece('iron_vanguard', { strength: 40 }),
    }
    const b = getSetBonus(eq)
    expect(b.agility).toBeUndefined()
    expect(b.def).toBe(Math.round(40 * 0.05))
    expect(b.strength).toBe(Math.round(40 * 0.05))
  })

  it('le palier grimpe avec le nombre de pièces (3 → 13%)', () => {
    const eq = {
      helmet: piece('iron_vanguard', { def: 100 }),
      armor: piece('iron_vanguard', { def: 100 }),
      weapon: piece('iron_vanguard', { strength: 100 }),
    }
    const b = getSetBonus(eq)
    expect(b.def).toBe(Math.round(200 * 0.13)) // 26
    expect(b.strength).toBe(Math.round(100 * 0.13)) // 13
  })

  it('agrège plusieurs sets simultanés indépendamment', () => {
    const eq = {
      helmet: piece('iron_vanguard', { def: 100 }),
      armor: piece('iron_vanguard', { def: 100 }),
      amulet: piece('wraithbound', { intelligence: 100 }),
      ring1: piece('wraithbound', { intelligence: 100 }),
    }
    const b = getSetBonus(eq)
    expect(b.def).toBe(Math.round(200 * 0.05)) // iron_vanguard 2 pièces
    expect(b.intelligence).toBe(Math.round(200 * 0.05)) // wraithbound 2 pièces
  })

  it('un set inconnu (tag orphelin) est ignoré sans crash', () => {
    const eq = {
      a: piece('ghost_set', { strength: 100 }),
      b: piece('ghost_set', { strength: 100 }),
    }
    expect(getSetBonus(eq)).toEqual({})
  })

  it('robuste aux slots vides / stats manquantes', () => {
    const eq = { a: null, b: { set: 'iron_vanguard' }, c: piece('iron_vanguard', { def: 10 }) }
    expect(() => getSetBonus(eq)).not.toThrow()
  })
})

describe('EQP01 — les bonus de set entrent dans calcEquippedStatBonuses', () => {
  it('le total = stats brutes des pièces + bonus de set', () => {
    const eq = {
      helmet: piece('iron_vanguard', { def: 100 }),
      armor: piece('iron_vanguard', { def: 100 }),
      weapon: piece('iron_vanguard', { strength: 100 }),
    }
    const total = calcEquippedStatBonuses(eq)
    // def brut = 200 + set 26 = 226 ; strength brut 100 + set 13 = 113.
    expect(total.def).toBe(226)
    expect(total.strength).toBe(113)
  })

  it('sans set actif, calcEquippedStatBonuses = somme brute (non-régression)', () => {
    const eq = { weapon: { stats: { strength: 7 } }, helmet: { stats: { def: 4 } } }
    expect(calcEquippedStatBonuses(eq)).toEqual({ strength: 7, def: 4 })
  })
})

describe('SET-UI01 — getActiveSetsSummary', () => {
  it('résume les pièces portées et les bonus par set', () => {
    const eq = {
      helmet: piece('iron_vanguard', { def: 100 }),
      armor: piece('iron_vanguard', { def: 100 }),
    }
    const summary = getActiveSetsSummary(eq)
    expect(summary).toHaveLength(1)
    expect(summary[0].id).toBe('iron_vanguard')
    expect(summary[0].count).toBe(2)
    expect(summary[0].total).toBe(SETS.iron_vanguard.pieces.length)
    expect(summary[0].active).toBe(true)
    expect(summary[0].bonuses.def).toBe(Math.round(200 * 0.05))
  })

  it('une seule pièce → présent mais inactif (pas de bonus)', () => {
    const eq = { helmet: piece('iron_vanguard', { def: 100 }) }
    const summary = getActiveSetsSummary(eq)
    expect(summary[0].count).toBe(1)
    expect(summary[0].active).toBe(false)
    expect(summary[0].bonuses).toEqual({})
  })
})

describe('SET-CONTENT01 — intégrité des sets', () => {
  it('chaque set a id, name, ≥1 stat, ≥3 pièces', () => {
    for (const [id, s] of Object.entries(SETS)) {
      expect(s.id, `${id}.id`).toBe(id)
      expect(typeof s.name, `${id}.name`).toBe('string')
      expect(Array.isArray(s.stats) && s.stats.length >= 1, `${id}.stats`).toBe(true)
      expect(s.stats.length, `${id} 1-3 stats`).toBeLessThanOrEqual(3)
      expect(s.pieces.length, `${id} ≥3 pièces`).toBeGreaterThanOrEqual(3)
    }
  })

  it('chaque templateId d’un set (pièces + arme d’élite) existe et porte ce set', () => {
    for (const [id, s] of Object.entries(SETS)) {
      const ids = [...s.pieces, ...(s.eliteWeapon ? [s.eliteWeapon] : [])]
      for (const tId of ids) {
        const t = EQUIPMENT_TEMPLATES[tId]
        expect(t, `${id} → template ${tId} inconnu`).toBeDefined()
        expect(t.set, `${tId} devrait porter set='${id}'`).toBe(id)
      }
    }
  })

  it('les stats gouvernées par un set sont réellement fournies par ≥1 de ses pièces', () => {
    for (const [id, s] of Object.entries(SETS)) {
      const ids = [...s.pieces, ...(s.eliteWeapon ? [s.eliteWeapon] : [])]
      const providedStats = new Set()
      for (const tId of ids) {
        for (const k of Object.keys(EQUIPMENT_TEMPLATES[tId].baseStats ?? {})) providedStats.add(k)
      }
      for (const stat of s.stats) {
        expect(providedStats.has(stat), `${id} gouverne ${stat} mais aucune pièce ne le fournit`).toBe(true)
      }
    }
  })

  it('les pièces d’un set (hors arme d’élite alternative) occupent des SLOTS DISTINCTS', () => {
    for (const [id, s] of Object.entries(SETS)) {
      const slots = s.pieces.map((tId) => EQUIPMENT_TEMPLATES[tId].slot)
      expect(new Set(slots).size, `${id} : slots dupliqués → set non complétable`).toBe(slots.length)
    }
  })

  it('l’arme d’élite partage le slot de l’arme normale (alternative)', () => {
    for (const [id, s] of Object.entries(SETS)) {
      if (!s.eliteWeapon) continue
      expect(EQUIPMENT_TEMPLATES[s.eliteWeapon].slot, `${id} arme d’élite`).toBe('weapon')
    }
  })

  it('au moins un set atteint 3 pièces distinctes → set_collector atteignable', () => {
    const reachable = Object.values(SETS).some((s) => {
      const slots = new Set(s.pieces.map((tId) => EQUIPMENT_TEMPLATES[tId].slot))
      return slots.size >= 3
    })
    expect(reachable).toBe(true)
  })
})

describe('SET-CONTENT01 — createEquipmentInstance propage le champ set', () => {
  it('une instance d’une pièce de set porte instance.set', () => {
    const inst = createEquipmentInstance('iron_sword', 'common')
    expect(inst.set).toBe('iron_vanguard')
  })

  it('une pièce hors set ne porte pas de champ set', () => {
    const inst = createEquipmentInstance('serpent_dagger', 'common')
    expect(inst.set).toBeUndefined()
  })

  it('une arme 2 mains porte instance.twoHanded', () => {
    const staff = createEquipmentInstance('bone_staff', 'common')
    expect(staff.twoHanded).toBe(true)
    const sword = createEquipmentInstance('iron_sword', 'common')
    expect(sword.twoHanded).toBeUndefined()
  })
})

describe('set_collector — 3 pièces d’un même set équipées via instances réelles', () => {
  it('équiper helm+armor+bottes du même set atteint 3 pièces distinctes', () => {
    // iron_vanguard : iron_helm, leather_armor, swift_boots (slots distincts).
    const equipped = {
      helmet: createEquipmentInstance('iron_helm', 'common'),
      armor: createEquipmentInstance('leather_armor', 'common'),
      boots: createEquipmentInstance('swift_boots', 'common'),
    }
    const counts = countEquippedSetPieces(equipped)
    expect(counts.iron_vanguard).toBe(3)
  })
})
