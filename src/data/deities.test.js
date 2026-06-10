// Tests divinités : conditions d'éveil + blessing + masquage UX (DV01/DV06/DV08/DV09)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  DEITIES,
  ACTIVE_DEITIES,
  checkIgnarethAwakening,
  checkSylvaraAwakening,
  checkVoltarisAwakening,
  applyDeityBlessing,
  getDivineRelation,
  getRelationTier,
} from './deities'

// ── DV01 — Logger Ignareth ───────────────────────────────────────────────────
describe('checkIgnarethAwakening — DV01', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') window.__DEITY_DEBUG = false
  })

  it('false si moins de 20 victoires', () => {
    const wins = Array.from({ length: 19 }, () => ({ type: 'victory', day: 5 }))
    expect(checkIgnarethAwakening({ battleLog: wins, dayCount: 5 })).toBe(false)
  })

  it('true avec 20 victoires dans la fenêtre 5 jours', () => {
    const wins = Array.from({ length: 20 }, () => ({ type: 'victory', day: 3 }))
    expect(checkIgnarethAwakening({ battleLog: wins, dayCount: 5 })).toBe(true)
  })

  it('false si 20 victoires mais hors fenêtre 5 jours', () => {
    // 20 victoires day=1, mais dayCount=10 → trop ancien
    const wins = Array.from({ length: 20 }, () => ({ type: 'victory', day: 1 }))
    expect(checkIgnarethAwakening({ battleLog: wins, dayCount: 10 })).toBe(false)
  })

  it('ignore les défaites', () => {
    const log = [
      ...Array.from({ length: 19 }, () => ({ type: 'victory', day: 5 })),
      ...Array.from({ length: 20 }, () => ({ type: 'defeat', day: 5 })),
    ]
    expect(checkIgnarethAwakening({ battleLog: log, dayCount: 5 })).toBe(false)
  })

  it('logs en mode debug si window.__DEITY_DEBUG=true', () => {
    if (typeof window === 'undefined') return // skip si pas de window (Node pur)
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    window.__DEITY_DEBUG = true
    checkIgnarethAwakening({ battleLog: [], dayCount: 1 })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    window.__DEITY_DEBUG = false
  })

  it('ne logue pas hors mode debug', () => {
    if (typeof window === 'undefined') return
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    window.__DEITY_DEBUG = false
    checkIgnarethAwakening({ battleLog: [], dayCount: 1 })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

// ── DV09 — Sylvara conditions ─────────────────────────────────────────────────
describe('checkSylvaraAwakening — DV09', () => {
  it('false si moins de 8 entrées', () => {
    const entries = Array.from({ length: 7 }, () => ({ hpPercent: 1.0 }))
    expect(checkSylvaraAwakening({ combatEntryLog: entries })).toBe(false)
  })

  it('true si 8 dernières entrées >= 85% HP', () => {
    const entries = Array.from({ length: 8 }, () => ({ hpPercent: 0.85 }))
    expect(checkSylvaraAwakening({ combatEntryLog: entries })).toBe(true)
  })

  it('false si une entrée est en-dessous du seuil', () => {
    const entries = [...Array.from({ length: 7 }, () => ({ hpPercent: 0.95 })), { hpPercent: 0.5 }]
    expect(checkSylvaraAwakening({ combatEntryLog: entries })).toBe(false)
  })

  it('regarde uniquement les 8 DERNIÈRES entrées', () => {
    // Premières entrées HP basses, mais 8 dernières OK → true
    const entries = [
      ...Array.from({ length: 5 }, () => ({ hpPercent: 0.2 })),
      ...Array.from({ length: 8 }, () => ({ hpPercent: 0.9 })),
    ]
    expect(checkSylvaraAwakening({ combatEntryLog: entries })).toBe(true)
  })

  it('retourne false si combatEntryLog manquant', () => {
    expect(checkSylvaraAwakening({})).toBe(false)
    expect(checkSylvaraAwakening({ combatEntryLog: undefined })).toBe(false)
  })
})

// ── DV08 — applyDeityBlessing ────────────────────────────────────────────────
describe('applyDeityBlessing — DV08', () => {
  const baseStats = {
    strength: 10,
    agility: 10,
    intelligence: 8,
    chance: 5,
    def: 5,
    hp: 100,
    maxHp: 100,
    mana: 60,
    maxMana: 60,
  }

  it('Ignareth : +15% strength (10 → 12 arrondi)', () => {
    const result = applyDeityBlessing(baseStats, 'ignareth')
    expect(result.strength).toBe(Math.round(10 * 1.15))
    expect(result.agility).toBe(10) // pas touché
  })

  it('Sylvara : pas de modification de stat (effet runtime regen)', () => {
    const result = applyDeityBlessing(baseStats, 'sylvara')
    // Sylvara a un effet hp_regen_per_tick — n'affecte pas les stats
    expect(result.strength).toBe(10)
    expect(result.maxHp).toBe(100)
  })

  it('retourne les stats inchangées pour deity inconnu', () => {
    expect(applyDeityBlessing(baseStats, 'unknown')).toEqual(baseStats)
  })

  it('retourne les stats inchangées si pas de blessing', () => {
    expect(applyDeityBlessing(baseStats, null)).toEqual(baseStats)
  })

  it("ne mute pas l'objet original", () => {
    const original = { ...baseStats }
    applyDeityBlessing(baseStats, 'ignareth')
    expect(baseStats).toEqual(original)
  })
})

// ── DV06 — Conditions masquées (anti-régression UX) ─────────────────────────
describe("DV06 — conditions d'éveil masquées (anti-régression)", () => {
  it("les conditions sont stockées en data mais aucune n'est exposée via une fonction publique 'getCondition'", () => {
    // Les conditions sont dans DEITIES[id].awakeningCondition mais c'est de la data
    // (on les exporte pour le moteur, pas pour l'UI). Les UI ne doivent jamais lire ce champ.
    expect(DEITIES.ignareth.awakeningCondition).toBeDefined()
    expect(DEITIES.sylvara.awakeningCondition).toBeDefined()
    // Les fonctions exportées renvoient seulement true/false (pas de progression)
    expect(typeof checkIgnarethAwakening({ battleLog: [], dayCount: 1 })).toBe('boolean')
    expect(typeof checkSylvaraAwakening({ combatEntryLog: [] })).toBe('boolean')
  })

  it('les conditions ne révèlent jamais une progression partielle (pas de "X/Y")', () => {
    // checkIgnarethAwakening renvoie un boolean, pas { current: 12, needed: 20 }
    const r = checkIgnarethAwakening({ battleLog: [], dayCount: 1 })
    expect(typeof r).toBe('boolean')
    expect(r).not.toHaveProperty('current')
    expect(r).not.toHaveProperty('progress')
  })
})

// ── Sanity : DEITIES + RELATIONS ─────────────────────────────────────────────
// ── DV04 — Voltaris ───────────────────────────────────────────────────────────
describe('checkVoltarisAwakening — DV04', () => {
  it('false avec moins de 5 victoires sous 30% HP', () => {
    const log = Array.from({ length: 4 }, () => ({ type: 'victory', hpPercent: 0.2 }))
    expect(checkVoltarisAwakening({ battleLog: log })).toBe(false)
  })

  it('true avec 5 victoires sous 30% HP', () => {
    const log = Array.from({ length: 5 }, () => ({ type: 'victory', hpPercent: 0.25 }))
    expect(checkVoltarisAwakening({ battleLog: log })).toBe(true)
  })

  it('ignore les victoires AU-DESSUS de 30% HP', () => {
    const log = [
      ...Array.from({ length: 10 }, () => ({ type: 'victory', hpPercent: 0.5 })),
      ...Array.from({ length: 4 }, () => ({ type: 'victory', hpPercent: 0.2 })),
    ]
    expect(checkVoltarisAwakening({ battleLog: log })).toBe(false)
  })

  it('ignore les défaites même sous 30% HP', () => {
    const log = Array.from({ length: 5 }, () => ({ type: 'defeat', hpPercent: 0.1 }))
    expect(checkVoltarisAwakening({ battleLog: log })).toBe(false)
  })

  it('battleLog manquant → false', () => {
    expect(checkVoltarisAwakening({})).toBe(false)
    expect(checkVoltarisAwakening({ battleLog: null })).toBe(false)
  })

  it('victoire sans hpPercent (legacy) → traitée comme 100% (ignorée)', () => {
    const log = Array.from({ length: 5 }, () => ({ type: 'victory' }))
    expect(checkVoltarisAwakening({ battleLog: log })).toBe(false)
  })
})

describe('Voltaris — données + relations (DV04)', () => {
  it('Voltaris existe avec blessing +20% AGI', () => {
    expect(DEITIES.voltaris).toBeDefined()
    expect(DEITIES.voltaris.blessing.effect.stat).toBe('agility')
    expect(DEITIES.voltaris.blessing.effect.multiplier).toBe(0.2)
  })

  it('Voltaris propose chain_lightning + overclock', () => {
    expect(DEITIES.voltaris.divineSkillOptions).toContain('chain_lightning')
    expect(DEITIES.voltaris.divineSkillOptions).toContain('overclock')
  })

  it('applyDeityBlessing Voltaris → +20% agility', () => {
    const stats = { agility: 10, strength: 10 }
    const result = applyDeityBlessing(stats, 'voltaris')
    expect(result.agility).toBe(Math.round(10 * 1.2))
    expect(result.strength).toBe(10) // inchangé
  })

  it('relations : Ignareth+Voltaris = allié fort (+6)', () => {
    expect(getDivineRelation('ignareth', 'voltaris')).toBe(6)
    expect(getRelationTier(6).label).toBe('Strong Ally')
  })

  it('relations : Sylvara+Voltaris = rival (-4)', () => {
    expect(getDivineRelation('sylvara', 'voltaris')).toBe(-4)
  })
})

describe('Données divinités', () => {
  it('ACTIVE_DEITIES contient ignareth + sylvara + voltaris', () => {
    expect(ACTIVE_DEITIES).toContain('ignareth')
    expect(ACTIVE_DEITIES).toContain('sylvara')
    expect(ACTIVE_DEITIES).toContain('voltaris')
  })

  it('chaque divinité a un blessing avec id, name, description', () => {
    Object.values(DEITIES).forEach((d) => {
      expect(d.blessing).toBeDefined()
      expect(d.blessing.id).toBeTruthy()
      expect(d.blessing.name).toBeTruthy()
      expect(d.blessing.description).toBeTruthy()
    })
  })

  it('getDivineRelation est symétrique', () => {
    expect(getDivineRelation('ignareth', 'sylvara')).toBe(-3)
    expect(getDivineRelation('sylvara', 'ignareth')).toBe(-3)
  })

  it('getRelationTier classe correctement', () => {
    expect(getRelationTier(-7).label).toBe('Enemy')
    expect(getRelationTier(-3).label).toBe('Rival')
    expect(getRelationTier(0).label).toBe('Neutral')
    expect(getRelationTier(3).label).toBe('Allied')
    expect(getRelationTier(8).label).toBe('Strong Ally')
  })
})
