// SKL01 — Tests : skills jusqu'au niveau 5 + anti-régression des bonus de niveau.
import { describe, it, expect, beforeEach } from 'vitest'
import { SKILL_MAX_LEVEL, SKILL_XP_THRESHOLDS, skillXpForLevel, getLevelBonus, SKILLS } from './skills'
import { getScaledSkillCost } from '../engine/combat'
import { useGameStore } from '../store/gameStore'

describe('SKL01 — paliers & helpers', () => {
  it('niveau max = 5, seuils = [20,50,90,140]', () => {
    expect(SKILL_MAX_LEVEL).toBe(5)
    expect(SKILL_XP_THRESHOLDS).toEqual([20, 50, 90, 140])
    expect(skillXpForLevel(1)).toBe(20)
    expect(skillXpForLevel(4)).toBe(140)
    expect(skillXpForLevel(5)).toBe(Infinity) // déjà au max
  })

  it('getLevelBonus : niveaux 2/3 définis, 4/5 = clamp sur le dernier défini (pas de régression)', () => {
    const t = SKILLS.savage_bite
    expect(getLevelBonus(t, 2)).toEqual(t.levelBonuses[2])
    expect(getLevelBonus(t, 3)).toEqual(t.levelBonuses[3])
    // niveaux 4 et 5 → on garde le bonus de niveau 3 (dernier défini)
    expect(getLevelBonus(t, 4)).toEqual(t.levelBonuses[3])
    expect(getLevelBonus(t, 5)).toEqual(t.levelBonuses[3])
  })

  it('coût d\'un skill ne régresse pas aux niveaux 4-5 (≤ coût niveau 3)', () => {
    const t = SKILLS.power_strike
    const c3 = getScaledSkillCost(t, 3)
    const c4 = getScaledSkillCost(t, 4)
    const c5 = getScaledSkillCost(t, 5)
    expect(c4.mana).toBeLessThanOrEqual(c3.mana)
    expect(c5.mana).toBeLessThanOrEqual(c3.mana)
    expect(c4.mana).toBe(c3.mana) // clamp → identique au niveau 3
  })
})

describe('SKL01 — gainSkillXp monte jusqu\'au niveau 5', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('un skill actif peut atteindre le niveau 4 puis 5, puis plafonne', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'savage_bite', level: 3, xp: 0, currentCooldown: 0 }] },
    }))
    const lvl = () => useGameStore.getState().hero.activeSkills[0].level

    useGameStore.getState().gainSkillXp('savage_bite', 90)  // 3 → 4 (seuil 90)
    expect(lvl()).toBe(4)
    useGameStore.getState().gainSkillXp('savage_bite', 140) // 4 → 5 (seuil 140)
    expect(lvl()).toBe(5)
    useGameStore.getState().gainSkillXp('savage_bite', 999) // déjà au max → reste 5
    expect(lvl()).toBe(5)
  })

  it('ne level up pas sous le seuil (3 → 4 nécessite 90 XP)', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: 'savage_bite', level: 3, xp: 0, currentCooldown: 0 }] },
    }))
    useGameStore.getState().gainSkillXp('savage_bite', 50) // < 90
    expect(useGameStore.getState().hero.activeSkills[0].level).toBe(3)
  })
})
