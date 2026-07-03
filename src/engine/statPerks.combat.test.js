// HS-STATPERK01 — application des perks de palier au combat (dégâts phys/magiques, réduction).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { calcSkillDamage, enemyAI } from './combat'
import { SKILLS } from '../data/skills'

const physId = Object.keys(SKILLS).find(
  (k) =>
    SKILLS[k].type === 'active' &&
    SKILLS[k].effect?.damage &&
    SKILLS[k].effect.damage.baseStat !== 'intelligence',
)
const magId = Object.keys(SKILLS).find(
  (k) => SKILLS[k].type === 'active' && SKILLS[k].effect?.damage?.baseStat === 'intelligence',
)

afterEach(() => vi.restoreAllMocks())

describe('HS-STATPERK01 — perks au combat', () => {
  it('FOR : dégâts physiques ×(1 + 3%/palier), nuls sous 35', () => {
    const mult = SKILLS[physId].effect.damage.multiplier
    expect(calcSkillDamage({ skillId: physId }, { strength: 34 }, 1)).toBe(Math.round(34 * mult))
    expect(calcSkillDamage({ skillId: physId }, { strength: 35 }, 1)).toBe(
      Math.round(35 * mult * 1.03),
    )
    expect(calcSkillDamage({ skillId: physId }, { strength: 70 }, 1)).toBe(
      Math.round(70 * mult * 1.06),
    )
  })

  it('INT : dégâts magiques ×(1 + 3%/palier)', () => {
    if (!magId) return // pas de skill magique à baseStat intelligence
    const mult = SKILLS[magId].effect.damage.multiplier
    expect(calcSkillDamage({ skillId: magId }, { intelligence: 70 }, 1)).toBe(
      Math.round(70 * mult * 1.06),
    )
  })

  it('DÉF : dégâts subis réduits de 3%/palier (enemyAI)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // variance neutre ×1.0
    const enemy = { name: 'X', stats: { atk: 100 } }
    expect(enemyAI(enemy, { def: 34 }).damage).toBe(83) // 100 - 17, 0 palier
    expect(enemyAI(enemy, { def: 70 }).damage).toBe(61) // (100 - 35) × 0.94 → 61
  })
})
