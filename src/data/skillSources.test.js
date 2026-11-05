// FIX-SRCMON01 — réciprocité sourceMonster ↔ skillDrop.
// Audit 2026-07-17 : 4 `sourceMonster` contradictoires — le skill revendiquait un monstre
// qui droppe en réalité un AUTRE skill (stone_skin→stone_golem qui droppe stoneskin ;
// venom_bite→marsh_serpent qui droppe venom_strike ; spectral_veil→briar_wraith qui droppe
// thorn_lash ; iron_resolve→hollow_knight qui droppe cursed_cleave, vraie source =
// barrow_wight en réserve).
// Décisions : stone_skin / venom_bite = versions ENSEIGNÉES à l'Académie (sourceMonster
// null — jumelles ASSUMÉES des versions droppées, cf. ACADEMY_CATALOG) ; spectral_veil =
// orpheline (boutique des dieux / futur, comme reckless_blow) ; iron_resolve re-sourcé
// sur barrow_wight (son vrai droppeur, monstre de réserve).
import { describe, it, expect } from 'vitest'
import { SKILLS } from './skills'
import { MONSTERS } from './monsters'

describe('FIX-SRCMON01 — réciprocité sourceMonster ↔ skillDrop', () => {
  it('chaque sourceMonster est un VRAI droppeur (le monstre droppe bien ce skill)', () => {
    const violations = []
    for (const skill of Object.values(SKILLS)) {
      if (!skill.sourceMonster) continue
      const m = MONSTERS[skill.sourceMonster]
      if (!m) violations.push(`${skill.id} → ${skill.sourceMonster} (monstre inconnu)`)
      else if (m.skillDrop?.skillId !== skill.id)
        violations.push(
          `${skill.id} → ${skill.sourceMonster} (droppe ${m.skillDrop?.skillId ?? 'rien'})`,
        )
    }
    expect(violations, `sourceMonster contradictoires :\n${violations.join('\n')}`).toEqual([])
  })

  it('chaque skillDrop de monstre pointe un skill dont la source déclarée est un VRAI droppeur', () => {
    // Un skill peut avoir PLUSIEURS droppeurs (ex. soul_crush : hollow_crypt_boss 60 % +
    // soul_harvester 20 % en réserve) — sa source déclarée doit être L'UN d'eux.
    const violations = []
    for (const m of Object.values(MONSTERS)) {
      const sid = m.skillDrop?.skillId
      if (!sid) continue
      const skill = SKILLS[sid]
      if (!skill) violations.push(`${m.id} droppe ${sid} (skill inconnu)`)
      else if (MONSTERS[skill.sourceMonster]?.skillDrop?.skillId !== sid)
        violations.push(
          `${m.id} droppe ${sid} (source déclarée ${skill.sourceMonster} ne le droppe pas)`,
        )
    }
    expect(violations, `skillDrops non re-sourcés :\n${violations.join('\n')}`).toEqual([])
  })

  it('les 4 corrections pinnées : académie (null) / re-sourcing barrow_wight', () => {
    expect(SKILLS.stone_skin.sourceMonster).toBeNull() // version Académie (jumelle de stoneskin)
    expect(SKILLS.venom_bite.sourceMonster).toBeNull() // version Académie (jumelle de venom_strike)
    expect(SKILLS.spectral_veil.sourceMonster).toBeNull() // orpheline (shop/futur)
    expect(SKILLS.iron_resolve.sourceMonster).toBe('barrow_wight') // vrai droppeur (réserve)
  })

  it('les jumelles assumées restent distinctes (id + effet légèrement différents)', () => {
    // stoneskin (drop, 12%) > stone_skin (académie, 10%) — la version droppée est meilleure.
    expect(SKILLS.stoneskin.effect.damageReduction).toBeGreaterThan(
      SKILLS.stone_skin.effect.damageReduction,
    )
    // venom_bite / venom_strike : ids et sources distincts (académie vs drop marsh_serpent).
    expect(SKILLS.venom_strike.sourceMonster).toBe('marsh_serpent')
    expect(SKILLS.thorn_lash.sourceMonster).toBe('briar_wraith')
  })
})
