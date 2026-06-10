// S06 — Tests contenant cosmétique
import { describe, it, expect } from 'vitest'
import { getSkillContainer, SKILL_CONTAINERS } from './containers'

describe('S06 — getSkillContainer', () => {
  it('medieval_fantasy → Mana Stones / 💎', () => {
    const c = getSkillContainer('medieval_fantasy')
    expect(c.label).toBe('Mana Stones')
    expect(c.icon).toBe('💎')
    expect(c.id).toBe('mana_stone')
  })

  it('wushu → Manuscripts / 📜', () => {
    const c = getSkillContainer('wushu')
    expect(c.label).toBe('Manuscripts')
    expect(c.id).toBe('manuscript')
  })

  it('tower → Data Chips', () => {
    expect(getSkillContainer('tower').id).toBe('data_chip')
  })

  it('univers inconnu → fallback medieval_fantasy', () => {
    expect(getSkillContainer('unknown_universe').id).toBe('mana_stone')
  })

  it('undefined → fallback', () => {
    expect(getSkillContainer(undefined).label).toBe('Mana Stones')
  })

  it('chaque contenant a id, label, singular, icon', () => {
    for (const [universeId, container] of Object.entries(SKILL_CONTAINERS)) {
      expect(container.id, `${universeId} missing id`).toBeTruthy()
      expect(container.label, `${universeId} missing label`).toBeTruthy()
      expect(container.singular, `${universeId} missing singular`).toBeTruthy()
      expect(container.icon, `${universeId} missing icon`).toBeTruthy()
    }
  })

  it('les 4 univers prévus sont présents', () => {
    expect(SKILL_CONTAINERS.medieval_fantasy).toBeDefined()
    expect(SKILL_CONTAINERS.wushu).toBeDefined()
    expect(SKILL_CONTAINERS.tower).toBeDefined()
    expect(SKILL_CONTAINERS.post_apo).toBeDefined()
  })
})
