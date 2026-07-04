import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  BALANCE,
  BALANCE_DEFAULTS,
  FEATURE_FLAGS,
  parseBalanceCsv,
  applyBalance,
  resetBalance,
  loadBalance,
} from './config'

beforeEach(() => {
  resetBalance()
})

describe('BAL-CSV01 — parseBalanceCsv', () => {
  it('parse des paires key,value en objet de nombres', () => {
    const out = parseBalanceCsv('xp_curve_mult,1.32\nrun_scaling,1.03')
    expect(out).toEqual({ xp_curve_mult: 1.32, run_scaling: 1.03 })
  })

  it('ignore l’en-tête, les lignes vides et les commentaires', () => {
    const csv = ['# commentaire', 'key,value', '', '  ', 'run_scaling,1.1', '# fin'].join('\n')
    expect(parseBalanceCsv(csv)).toEqual({ run_scaling: 1.1 })
  })

  it('gère les fins de ligne CRLF', () => {
    expect(parseBalanceCsv('a,1\r\nb,2\r\n')).toEqual({ a: 1, b: 2 })
  })

  it('ignore les valeurs non numériques et les lignes malformées', () => {
    const out = parseBalanceCsv('good,3\nbad,notanumber\nnocomma\nempty,')
    expect(out).toEqual({ good: 3 })
  })

  it('renvoie un objet vide pour une entrée non-string', () => {
    expect(parseBalanceCsv(null)).toEqual({})
    expect(parseBalanceCsv(undefined)).toEqual({})
    expect(parseBalanceCsv(42)).toEqual({})
  })
})

describe('BAL-CSV01 — applyBalance (mutation en place)', () => {
  it('écrase les clés connues dans l’objet BALANCE vivant', () => {
    applyBalance({ xp_curve_mult: 1.32 })
    expect(BALANCE.xp_curve_mult).toBe(1.32)
  })

  it('ignore les clés inconnues (ne pollue pas BALANCE)', () => {
    applyBalance({ totally_unknown_key: 99 })
    expect(BALANCE.totally_unknown_key).toBeUndefined()
  })

  it('ignore les valeurs non finies', () => {
    applyBalance({ run_scaling: NaN })
    expect(BALANCE.run_scaling).toBe(BALANCE_DEFAULTS.run_scaling)
  })

  it('préserve la référence de l’objet BALANCE (live binding)', () => {
    const ref = BALANCE
    applyBalance({ run_scaling: 1.2 })
    expect(ref.run_scaling).toBe(1.2) // même objet muté
  })
})

describe('BAL-CSV01 — resetBalance', () => {
  it('restaure toutes les valeurs par défaut', () => {
    applyBalance({ xp_curve_mult: 9 })
    resetBalance()
    expect(BALANCE).toEqual(BALANCE_DEFAULTS)
  })
})

describe('BAL-CSV01 — loadBalance (fetch runtime + fallback)', () => {
  it('applique les valeurs du CSV quand le fetch réussit', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('xp_curve_mult,1.32\nrun_scaling,1.03'),
    })
    await loadBalance(fetchFn)
    expect(BALANCE.xp_curve_mult).toBe(1.32)
    expect(BALANCE.run_scaling).toBe(1.03)
    expect(fetchFn).toHaveBeenCalledWith('/balance.csv', expect.any(Object))
  })

  it('retombe sur les défauts si le fetch rejette (offline)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('offline'))
    await loadBalance(fetchFn)
    expect(BALANCE).toEqual(BALANCE_DEFAULTS)
  })

  it('retombe sur les défauts si la réponse n’est pas ok (404)', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false })
    await loadBalance(fetchFn)
    expect(BALANCE).toEqual(BALANCE_DEFAULTS)
  })

  it('retombe sur les défauts si fetch est indisponible', async () => {
    const result = await loadBalance(undefined)
    expect(result).toEqual(BALANCE_DEFAULTS)
  })

  it('ne casse pas si le CSV est corrompu (garde les défauts)', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('###garbage###\n@@@'),
    })
    await loadBalance(fetchFn)
    expect(BALANCE).toEqual(BALANCE_DEFAULTS)
  })

  it('renvoie la référence BALANCE', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('x'))
    const result = await loadBalance(fetchFn)
    expect(result).toBe(BALANCE)
  })
})

describe('BAL-CSV01 — invariant défauts == valeurs de jeu actuelles', () => {
  it('les défauts figés couvrent exactement les clés de BALANCE', () => {
    expect(Object.keys(BALANCE).sort()).toEqual(Object.keys(BALANCE_DEFAULTS).sort())
  })

  it('les défauts historiques sont préservés (pas de changement de comportement)', () => {
    // Ces valeurs DOIVENT rester identiques au code d’origine (AC BAL-CSV01).
    expect(BALANCE_DEFAULTS.xp_curve_mult).toBe(1.5)
    expect(BALANCE_DEFAULTS.run_scaling).toBe(1.08)
    expect(BALANCE_DEFAULTS.run_scaling_cap).toBe(25)
    expect(BALANCE_DEFAULTS.zone_mult_ashenvale).toBe(1.0)
    expect(BALANCE_DEFAULTS.zone_mult_blighted_road).toBe(1.8)
    expect(BALANCE_DEFAULTS.zone_mult_grimspire).toBe(2.5)
    expect(BALANCE_DEFAULTS.zone_mult_dungeon_boss).toBe(3.5)
    expect(BALANCE_DEFAULTS.zone_mult_demon_lord).toBe(6.0)
    expect(BALANCE_DEFAULTS.quest_xp_easy).toBe(40)
    expect(BALANCE_DEFAULTS.quest_xp_medium).toBe(110)
    expect(BALANCE_DEFAULTS.quest_xp_hard).toBe(150)
  })
})

describe('BAL-CSV01 — live-linking effectif sur la logique de jeu', () => {
  it('scaleMonsterStats reflète un override de run_scaling appliqué via CSV', async () => {
    const { scaleMonsterStats } = await import('./data/zones')
    const base = { hp: 100, atk: 10, def: 4, spd: 7 }
    const before = scaleMonsterStats(base, 'ashenvale', 5).hp
    await loadBalance(
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('run_scaling,1.2') }),
    )
    const after = scaleMonsterStats(base, 'ashenvale', 5).hp
    expect(after).toBeGreaterThan(before) // 1.2^5 > 1.08^5
  })

  it('applyLevelUps reflète un override de xp_curve_mult', async () => {
    const { applyLevelUps } = await import('./store/helpers')
    const stats = { maxHp: 100, maxMana: 50, strength: 5, intelligence: 5, def: 5, agility: 5 }
    applyBalance({ xp_curve_mult: 2 })
    const r = applyLevelUps(100, 1, 100, stats)
    expect(r.expToNext).toBe(200) // 100 * 2
  })
})

describe('TECH06 — FEATURE_FLAGS', () => {
  it('exporte un objet de flags', () => {
    expect(FEATURE_FLAGS).toBeTypeOf('object')
  })

  it('expose le flag csvBalanceLive (garde le fetch CSV au boot)', () => {
    expect(FEATURE_FLAGS.csvBalanceLive).toBe(true)
  })

  it('tous les flags sont des booléens', () => {
    for (const value of Object.values(FEATURE_FLAGS)) {
      expect(typeof value).toBe('boolean')
    }
  })
})
