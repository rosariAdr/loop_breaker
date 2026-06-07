// T12 — Soul Rend (skill suprême du Demon Lord) toujours héritable (transgresse DV10).
import { describe, it, expect } from 'vitest'
import { SKILLS, isDivineSkillInheritable } from './skills'

describe('T12 — Soul Rend alwaysInheritable', () => {
  it('soul_rend porte le flag alwaysInheritable', () => {
    expect(SKILLS.soul_rend.alwaysInheritable).toBe(true)
  })

  it('soul_rend est héritable même au niveau 1', () => {
    expect(isDivineSkillInheritable({ ...SKILLS.soul_rend, level: 1 })).toBe(true)
  })

  it('alwaysInheritable force l\'héritage même pour un skill divin non évolué', () => {
    // un skill divin niveau 1 n'est normalement PAS héritable (DV10)…
    expect(isDivineSkillInheritable({ container: 'divine', inheritable: true, level: 1 })).toBe(false)
    // …sauf s'il porte alwaysInheritable
    expect(isDivineSkillInheritable({ container: 'divine', inheritable: true, level: 1, alwaysInheritable: true })).toBe(true)
  })

  it('les autres skills ne sont pas affectés (DV10 préservé)', () => {
    expect(isDivineSkillInheritable({ container: 'divine', inheritable: true, level: 2 })).toBe(true)
    expect(isDivineSkillInheritable({ container: 'mana', inheritable: false, level: 5 })).toBe(false)
  })
})
