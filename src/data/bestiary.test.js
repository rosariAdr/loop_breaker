// BEST01/02/03 — bestiaire (paliers, bonus, complétion de zone).
import { describe, it, expect } from 'vitest'
import {
  bestiaryTier,
  bestiaryDamageBonus,
  bestiaryDropBonus,
  isMastered,
  zoneBestiaryComplete,
  completedBestiaryZones,
  ZONE_BESTIARY,
  bestiaryLore,
} from './bestiary'
import { MONSTERS_BY_ZONE, MONSTERS } from './monsters'

describe('BEST01 — paliers de kills', () => {
  it('10 → +5% dmg ; 50 → +10% + codexFull ; 100 → maîtrisé + drop +5% + lore', () => {
    expect(bestiaryDamageBonus(9)).toBe(0)
    expect(bestiaryDamageBonus(10)).toBe(0.05)
    expect(bestiaryTier(50)).toMatchObject({ dmgBonus: 0.1, codexFull: true })
    expect(bestiaryTier(100)).toMatchObject({ mastered: true, dropBonus: 0.05, loreUnlocked: true })
    expect(bestiaryDropBonus(99)).toBe(0)
    expect(bestiaryDropBonus(100)).toBe(0.05)
    expect(isMastered(100)).toBe(true)
    expect(isMastered(99)).toBe(false)
  })
})

describe('BEST03 — complétion de zone', () => {
  it('zoneBestiaryComplete : vrai seulement si toutes les espèces de surface sont maîtrisées', () => {
    const species = (MONSTERS_BY_ZONE.ashenvale ?? []).filter((id) => !MONSTERS[id]?.reserve)
    const kills = {}
    expect(zoneBestiaryComplete('ashenvale', kills)).toBe(false)
    species.forEach((id) => (kills[id] = 100))
    expect(zoneBestiaryComplete('ashenvale', kills)).toBe(true)
    expect(completedBestiaryZones(kills)).toContain('ashenvale')
    expect(ZONE_BESTIARY.ashenvale.titleId).toBe('ashenvale_warden')
  })
})

describe('BEST02 — lore', () => {
  it('renvoie un texte pour un monstre connu, vide sinon', () => {
    expect(bestiaryLore('ashwood_wolf')).toBeTruthy()
    expect(bestiaryLore('inconnu')).toBe('')
  })
})
