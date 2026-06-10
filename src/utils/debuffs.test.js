// CRF01 — Tests des helpers de debuffs
import { describe, it, expect } from 'vitest'
import {
  makeDebuff,
  addDebuff,
  tickDebuffsOneDay,
  getDebuffStatModifiers,
  applyDebuffsToStats,
} from './debuffs'
import { DEBUFFS, getDebuff } from '../data/debuffs'

describe('CRF01 — data/debuffs', () => {
  it('expose les 4 debuffs de base', () => {
    expect(DEBUFFS.burnt_hands.stat).toBe('strength')
    expect(DEBUFFS.poisoned.stat).toBe('maxHp')
    expect(DEBUFFS.fatigue.stat).toBe('agility')
    expect(DEBUFFS.black_smoke.stat).toBe('chance')
  })
  it('getDebuff retourne le debuff ou null', () => {
    expect(getDebuff('fatigue').name).toBe('Fatigue')
    expect(getDebuff('inexistant')).toBeNull()
  })
})

describe('CRF01 — makeDebuff', () => {
  it('temporaire : remaining = days', () => {
    expect(makeDebuff('fatigue', 7)).toMatchObject({
      debuffId: 'fatigue',
      permanent: false,
      duration: { type: 'days', remaining: 7 },
    })
  })
  it('permanent : remaining null', () => {
    expect(makeDebuff('black_smoke', 7, true)).toMatchObject({
      permanent: true,
      duration: { remaining: null },
    })
  })
})

describe('CRF01 — addDebuff', () => {
  it('ajoute un debuff à une liste vide', () => {
    const result = addDebuff([], 'fatigue', 7)
    expect(result).toHaveLength(1)
    expect(result[0].debuffId).toBe('fatigue')
  })
  it('ignore un debuffId inconnu', () => {
    expect(addDebuff([], 'inexistant', 7)).toHaveLength(0)
  })
  it('même debuff : prend la durée max sans doublon', () => {
    const start = [makeDebuff('fatigue', 3)]
    const result = addDebuff(start, 'fatigue', 7)
    expect(result).toHaveLength(1)
    expect(result[0].duration.remaining).toBe(7)
  })
  it('rafraîchir en permanent verrouille le debuff', () => {
    const start = [makeDebuff('fatigue', 3)]
    const result = addDebuff(start, 'fatigue', 7, true)
    expect(result[0].permanent).toBe(true)
    expect(result[0].duration.remaining).toBeNull()
  })
  it('retourne un nouveau tableau (immutable)', () => {
    const start = []
    expect(addDebuff(start, 'fatigue')).not.toBe(start)
  })
})

describe('CRF01 — tickDebuffsOneDay', () => {
  it('décrémente les temporaires', () => {
    const result = tickDebuffsOneDay([makeDebuff('fatigue', 7)])
    expect(result[0].duration.remaining).toBe(6)
  })
  it('retire un debuff arrivé à 0', () => {
    const result = tickDebuffsOneDay([makeDebuff('fatigue', 1)])
    expect(result).toHaveLength(0)
  })
  it('laisse les permanents intacts', () => {
    const result = tickDebuffsOneDay([makeDebuff('black_smoke', 7, true)])
    expect(result).toHaveLength(1)
    expect(result[0].duration.remaining).toBeNull()
  })
  it('ne mute pas la liste en entrée', () => {
    const start = [makeDebuff('fatigue', 7)]
    tickDebuffsOneDay(start)
    expect(start[0].duration.remaining).toBe(7)
  })
})

describe('CRF01 — getDebuffStatModifiers / applyDebuffsToStats', () => {
  const base = { strength: 20, agility: 10, maxHp: 100, chance: 8, intelligence: 12 }

  it('agrège les réductions par stat', () => {
    const mods = getDebuffStatModifiers([makeDebuff('burnt_hands'), makeDebuff('fatigue')])
    expect(mods.strength).toBeCloseTo(0.1)
    expect(mods.agility).toBeCloseTo(0.2)
  })

  it('applique les réductions aux stats', () => {
    const out = applyDebuffsToStats(base, [makeDebuff('fatigue')]) // agi −20%
    expect(out.agility).toBe(8)
    expect(out.strength).toBe(20) // inchangé
  })

  it('cumule deux debuffs sur la même stat (additif, plafonné)', () => {
    const out = applyDebuffsToStats(base, [makeDebuff('fatigue'), makeDebuff('fatigue')])
    // note : addDebuff empêche le doublon, mais applyDebuffsToStats reste additif si forcé
    expect(out.agility).toBe(Math.round(10 * (1 - 0.4)))
  })

  it('ne mute pas les stats de base', () => {
    applyDebuffsToStats(base, [makeDebuff('fatigue')])
    expect(base.agility).toBe(10)
  })

  it('liste vide : stats inchangées', () => {
    expect(applyDebuffsToStats(base, [])).toEqual(base)
  })
})
