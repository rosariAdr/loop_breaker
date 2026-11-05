// SKD-ICE01 — skills de glace (élément `ice`) : existence, typage magic:ice, cohérence
// avec la source de vérité SKD (getSkillDropType) et intégration au pool `glace` (MST08/MST09).
import { describe, it, expect } from 'vitest'
import { SKILLS } from './skills'
import { getSkillDropType } from './monsters'
import { MASTER_SKILL_POOLS, FOCUS_DAMAGE_CLASS } from './masters'

// Les skills de glace attendus (≥3 requis par le ticket ; on en fournit 4).
const ICE_SKILL_IDS = ['ice_shard', 'frostbite', 'blizzard', 'frost_lance']

// Classe de drop SKD (getSkillDropType attend un « monstre » avec skillDrop.skillId).
const dropClass = (skillId) => getSkillDropType({ skillDrop: { skillId } })

describe('SKD-ICE01 — skills de glace', () => {
  it('crée au moins 3 skills de glace', () => {
    const present = ICE_SKILL_IDS.filter((id) => SKILLS[id])
    expect(present.length).toBeGreaterThanOrEqual(3)
  })

  it('chaque skill de glace existe et est un skill de base (container mana_stone)', () => {
    for (const id of ICE_SKILL_IDS) {
      expect(SKILLS[id], id).toBeDefined()
      expect(SKILLS[id].container, id).toBe('mana_stone')
      expect(SKILLS[id].inheritable, id).toBe(true)
    }
  })

  it('tout skill de glace à dégâts porte l’élément exact `ice` (jamais physical/fire)', () => {
    for (const id of ICE_SKILL_IDS) {
      const dmg = SKILLS[id].effect?.damage?.type
      if (dmg) expect(dmg, id).toBe('ice')
    }
  })

  it('classé magique (magic_active) par la source de vérité SKD — jamais physical_active', () => {
    for (const id of ICE_SKILL_IDS) {
      // tous les skills de glace fournis portent des dégâts → magic_active
      expect(dropClass(id), id).toBe('magic_active')
      expect(dropClass(id), id).not.toBe('physical_active')
    }
  })

  it('couvre les archétypes attendus : mono-cible, contrôle (gel), et AoE', () => {
    // SKD-ICE01/FROZEN — contrôle : frostbite GÈLE (saute-tour), plus de `slow` de base
    const fb = SKILLS.frostbite.effect.statusEffect
    expect(fb.type).toBe('frozen')
    expect(fb.type).not.toBe('slow') // décision : le gel remplace le slow, pas de cumul
    // AoE : blizzard frappe tous les ennemis
    expect(SKILLS.blizzard.effect.aoe).toBe(true)
    // mono-cible pur : ice_shard n'est pas AoE
    expect(SKILLS.ice_shard.effect.aoe).toBeUndefined()
  })

  it('SKD-ICE01/FROZEN — frostbite applique `frozen` à 35% (< 100%, anti chain-lock)', () => {
    const fb = SKILLS.frostbite.effect.statusEffect
    expect(fb.type).toBe('frozen')
    expect(fb.chance).toBe(0.35)
    expect(fb.chance).toBeLessThan(1) // probabiliste : jamais un lock garanti
    expect(fb.duration).toBe(1)
    // le skill garde ses dégâts de glace
    expect(SKILLS.frostbite.effect.damage.type).toBe('ice')
  })

  it('SKD-ICE01/FROZEN — blizzard reste dégâts + AoE sans gel (pas de group-freeze)', () => {
    expect(SKILLS.blizzard.effect.statusEffect).toBeUndefined()
  })

  it('la discipline glace est bien typée magic:ice (FOCUS_DAMAGE_CLASS)', () => {
    expect(FOCUS_DAMAGE_CLASS.glace).toBe('magic:ice')
  })

  it('le pool `glace` contient exactement les skills de glace (≥3, tous ⊂ SKILLS)', () => {
    expect(MASTER_SKILL_POOLS.glace.length).toBeGreaterThanOrEqual(3)
    for (const id of MASTER_SKILL_POOLS.glace) {
      expect(SKILLS[id], id).toBeDefined()
      expect(SKILLS[id].effect?.damage?.type, id).toBe('ice')
    }
  })
})
