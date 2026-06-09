// ANIM02 — dérivation du VFX par skill.
import { describe, it, expect } from 'vitest'
import { getSkillVfx, ELEMENT_COLORS } from './skillVfx'
import { SKILLS } from '../data/skills'

describe('ANIM02 — getSkillVfx', () => {
  it('skill physique au corps-à-corps (Power Strike) → mode mêlée, teinte acier', () => {
    const vfx = getSkillVfx(SKILLS.power_strike)
    expect(vfx.element).toBe('physical')
    expect(vfx.mode).toBe('melee')
    expect(vfx.color).toBe(ELEMENT_COLORS.physical)
  })

  it('skill élémentaire feu/foudre → projectile teinté', () => {
    expect(getSkillVfx(SKILLS.inferno_strike).mode).toBe('projectile')
    expect(getSkillVfx(SKILLS.inferno_strike).color).toBe(ELEMENT_COLORS.fire)
    expect(getSkillVfx(SKILLS.chain_lightning).mode).toBe('projectile')
  })

  it('Soul Rend (dégâts d\'âme, suprême) → projectile + heavy', () => {
    const vfx = getSkillVfx(SKILLS.soul_rend)
    expect(vfx.element).toBe('true')
    expect(vfx.mode).toBe('projectile')
    expect(vfx.heavy).toBe(true)
  })

  it('skill INT-based sans élément distant → projectile (magie)', () => {
    // un faux template : dégâts physiques mais baseStat intelligence
    expect(getSkillVfx({ effect: { damage: { type: 'physical', baseStat: 'intelligence', multiplier: 1 } } }).mode).toBe('projectile')
  })

  it('flag aoe reporté depuis effect.aoe', () => {
    expect(getSkillVfx({ effect: { damage: { type: 'fire', multiplier: 1 }, aoe: true } }).aoe).toBe(true)
    expect(getSkillVfx({ effect: { damage: { type: 'fire', multiplier: 1 } } }).aoe).toBe(false)
  })

  it('heavy si gros multiplicateur (≥1.8)', () => {
    expect(getSkillVfx({ effect: { damage: { type: 'physical', multiplier: 2 } } }).heavy).toBe(true)
    expect(getSkillVfx({ effect: { damage: { type: 'physical', multiplier: 1.2 } } }).heavy).toBe(false)
  })

  it('un champ skill.vfx surcharge la dérivation', () => {
    const vfx = getSkillVfx({ vfx: { element: 'ice', mode: 'projectile' }, effect: { damage: { type: 'physical', multiplier: 1 } } })
    expect(vfx.element).toBe('ice')
    expect(vfx.mode).toBe('projectile')
    expect(vfx.color).toBe(ELEMENT_COLORS.ice)
  })

  it('sans dégât (buff/heal) → mêlée par défaut, pas de crash', () => {
    expect(getSkillVfx({ effect: { heal: { value: 0.3 } } }).mode).toBe('melee')
    expect(getSkillVfx(undefined).element).toBe('physical')
  })
})
