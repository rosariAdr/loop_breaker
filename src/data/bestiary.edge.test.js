// BEST01/02/03 — edge cases : bornes de paliers, fallbacks `?? 0`, exclusion réserve,
// complétion de zone, et lore dérivé (élite vs non-élite, huntingSpot ?? zone).
import { describe, it, expect } from 'vitest'
import {
  bestiaryTier,
  bestiaryDamageBonus,
  bestiaryDropBonus,
  isMastered,
  zoneBestiaryComplete,
  completedBestiaryZones,
  BESTIARY_TIERS,
  ZONE_BESTIARY,
  bestiaryLore,
} from './bestiary'
import { MONSTERS, MONSTERS_BY_ZONE } from './monsters'

// Real ids (verified from monsters.js) ----------------------------------------
const ASHENVALE = MONSTERS_BY_ZONE.ashenvale // 16 non-reserve species
const RESERVE_IDS = ['barrow_wight', 'soul_harvester'] // reserve:true, zone ashenvale
const COMMON_ID = 'ashwood_wolf' // rank common, huntingSpot ashenvale_forest
const ELITE_ID = 'old_oakheart' // rank elite, huntingSpot ashenvale_forest
const NO_SPOT_ID = 'cursed_warlord' // no huntingSpot key → falls back to zone blighted_road

describe('bestiaryTier — bornes de paliers', () => {
  it('kills 0 → level 0, tous bonus/flags à leur défaut', () => {
    const t = bestiaryTier(0)
    expect(t).toEqual({
      level: 0,
      dmgBonus: 0,
      dropBonus: 0,
      codexFull: false,
      mastered: false,
      loreUnlocked: false,
    })
  })

  it('kills = null → level 0 (via `kills ?? 0`)', () => {
    expect(bestiaryTier(null).level).toBe(0)
    expect(bestiaryTier(null).dmgBonus).toBe(0)
  })

  it('kills = undefined (défaut de paramètre) → level 0', () => {
    expect(bestiaryTier(undefined).level).toBe(0)
    expect(bestiaryTier().level).toBe(0)
  })

  it('juste sous le 1er palier (9) → toujours level 0', () => {
    const t = bestiaryTier(9)
    expect(t.level).toBe(0)
    expect(t.dmgBonus).toBe(0)
    expect(t.codexFull).toBe(false)
  })

  it('kills = 10 (borne T1) → level 1, dmgBonus 0.05, pas de codexFull', () => {
    const t = bestiaryTier(10)
    expect(t.level).toBe(1)
    expect(t.dmgBonus).toBe(0.05)
    expect(t.codexFull).toBe(false)
    expect(t.mastered).toBe(false)
    expect(t.loreUnlocked).toBe(false)
    expect(t.dropBonus).toBe(0)
  })

  it('entre T1 et T2 (49) → reste level 1', () => {
    expect(bestiaryTier(49).level).toBe(1)
    expect(bestiaryTier(49).dmgBonus).toBe(0.05)
  })

  it('kills = 50 (borne T2) → level 2, dmgBonus 0.1, codexFull true, pas encore maîtrisé', () => {
    const t = bestiaryTier(50)
    expect(t.level).toBe(2)
    expect(t.dmgBonus).toBe(0.1)
    expect(t.codexFull).toBe(true)
    expect(t.mastered).toBe(false)
    expect(t.loreUnlocked).toBe(false)
    // dropBonus reste 0 tant que T3 pas atteint (pas de champ dropBonus sur T2)
    expect(t.dropBonus).toBe(0)
  })

  it('entre T2 et T3 (99) → reste level 2', () => {
    expect(bestiaryTier(99).level).toBe(2)
    expect(bestiaryTier(99).mastered).toBe(false)
  })

  it('kills = 100 (borne T3) → level 3, dropBonus 0.05, mastered + loreUnlocked', () => {
    const t = bestiaryTier(100)
    expect(t.level).toBe(3)
    expect(t.dmgBonus).toBe(0.1)
    expect(t.dropBonus).toBe(0.05)
    expect(t.mastered).toBe(true)
    expect(t.loreUnlocked).toBe(true)
    expect(t.codexFull).toBe(true) // conservé de T2 (Object.assign successif, pas d'écrasement)
  })

  it('bien au-dessus de T3 (10000) → reste level 3 maîtrisé', () => {
    const t = bestiaryTier(10000)
    expect(t.level).toBe(3)
    expect(t.mastered).toBe(true)
    expect(t.dropBonus).toBe(0.05)
  })

  it('chaque seuil de BESTIARY_TIERS flippe bien le level correspondant', () => {
    for (const tier of BESTIARY_TIERS) {
      expect(bestiaryTier(tier.kills).level).toBe(tier.level)
      expect(bestiaryTier(tier.kills - 1).level).toBe(tier.level - 1)
    }
  })
})

describe('bestiaryDamageBonus', () => {
  it('sous le 1er palier → 0 (fallback du dmgBonus par défaut)', () => {
    expect(bestiaryDamageBonus(0)).toBe(0)
    expect(bestiaryDamageBonus(9)).toBe(0)
    expect(bestiaryDamageBonus(null)).toBe(0)
    expect(bestiaryDamageBonus(undefined)).toBe(0)
  })

  it('renvoie le dmgBonus du palier atteint', () => {
    expect(bestiaryDamageBonus(10)).toBe(0.05)
    expect(bestiaryDamageBonus(50)).toBe(0.1)
    expect(bestiaryDamageBonus(100)).toBe(0.1)
  })
})

describe('bestiaryDropBonus — fallback `?? 0` + valeur top-tier', () => {
  it('sous T3 → 0 via le `?? 0` (T0/T1/T2 n’ont pas de dropBonus)', () => {
    expect(bestiaryDropBonus(0)).toBe(0)
    expect(bestiaryDropBonus(10)).toBe(0)
    expect(bestiaryDropBonus(50)).toBe(0)
    expect(bestiaryDropBonus(99)).toBe(0)
    expect(bestiaryDropBonus(null)).toBe(0)
    expect(bestiaryDropBonus(undefined)).toBe(0)
  })

  it('à/au-dessus de T3 → dropBonus 0.05', () => {
    expect(bestiaryDropBonus(100)).toBe(0.05)
    expect(bestiaryDropBonus(500)).toBe(0.05)
  })
})

describe('isMastered', () => {
  it('false sous 100 kills', () => {
    expect(isMastered(0)).toBe(false)
    expect(isMastered(50)).toBe(false)
    expect(isMastered(99)).toBe(false)
    expect(isMastered(null)).toBe(false)
    expect(isMastered(undefined)).toBe(false)
  })

  it('true à/au-dessus du palier de maîtrise (100)', () => {
    expect(isMastered(100)).toBe(true)
    expect(isMastered(250)).toBe(true)
  })
})

describe('zoneBestiaryComplete — exclusion réserve + complétion', () => {
  const masterAll = (ids) => Object.fromEntries(ids.map((id) => [id, 100]))

  it('zone inconnue → false (species.length === 0)', () => {
    expect(zoneBestiaryComplete('nowhere', { anything: 100 })).toBe(false)
  })

  it('zone vide / chaîne vide → false', () => {
    expect(zoneBestiaryComplete('', {})).toBe(false)
    expect(zoneBestiaryComplete(undefined, {})).toBe(false)
  })

  it('kills manquants (défaut {}) → false', () => {
    expect(zoneBestiaryComplete('ashenvale')).toBe(false)
    expect(zoneBestiaryComplete('ashenvale', {})).toBe(false)
  })

  it('toutes les espèces non-réserve maîtrisées → true', () => {
    expect(zoneBestiaryComplete('ashenvale', masterAll(ASHENVALE))).toBe(true)
  })

  it('une seule espèce sous maîtrise (99) → false', () => {
    const kills = masterAll(ASHENVALE)
    kills[ASHENVALE[0]] = 99
    expect(zoneBestiaryComplete('ashenvale', kills)).toBe(false)
  })

  it('les monstres RÉSERVE ne bloquent PAS la complétion (branche filter reserve)', () => {
    // Confirme que la réserve existe bien et est reserve:true...
    for (const id of RESERVE_IDS) expect(MONSTERS[id].reserve).toBe(true)
    // ...et n'est PAS dans MONSTERS_BY_ZONE.ashenvale (donc jamais requise).
    for (const id of RESERVE_IDS) expect(ASHENVALE).not.toContain(id)
    // Ashenvale complète UNIQUEMENT avec les non-réserve, même si la réserve a 0 kill.
    const kills = masterAll(ASHENVALE) // ne contient aucune réserve
    expect(zoneBestiaryComplete('ashenvale', kills)).toBe(true)
    // Ajouter des réserve à 0 kill ne casse rien.
    for (const id of RESERVE_IDS) kills[id] = 0
    expect(zoneBestiaryComplete('ashenvale', kills)).toBe(true)
  })

  it('blighted_road (2 espèces, aucune réserve) — complète si les 2 maîtrisées', () => {
    const ids = MONSTERS_BY_ZONE.blighted_road
    expect(zoneBestiaryComplete('blighted_road', masterAll(ids))).toBe(true)
    const partial = masterAll(ids)
    partial[ids[0]] = 0
    expect(zoneBestiaryComplete('blighted_road', partial)).toBe(false)
  })
})

describe('completedBestiaryZones', () => {
  const masterAll = (ids) => Object.fromEntries(ids.map((id) => [id, 100]))

  it('aucun kill → aucune zone complète', () => {
    expect(completedBestiaryZones()).toEqual([])
    expect(completedBestiaryZones({})).toEqual([])
  })

  it('ne renvoie que les zones de ZONE_BESTIARY qui sont complètes', () => {
    // ZONE_BESTIARY ne définit qu'ashenvale ; blighted_road n'y est pas listée.
    const result = completedBestiaryZones(masterAll(ASHENVALE))
    expect(result).toContain('ashenvale')
    // Toutes les entrées renvoyées sont bien des clés de ZONE_BESTIARY.
    for (const z of result) expect(Object.keys(ZONE_BESTIARY)).toContain(z)
  })

  it('ashenvale incomplète → non listée', () => {
    const kills = masterAll(ASHENVALE)
    kills[ASHENVALE[0]] = 10
    expect(completedBestiaryZones(kills)).not.toContain('ashenvale')
  })
})

describe('bestiaryLore', () => {
  it('id inconnu → chaîne vide', () => {
    expect(bestiaryLore('does_not_exist')).toBe('')
    expect(bestiaryLore(undefined)).toBe('')
    expect(bestiaryLore(null)).toBe('')
  })

  it('non-élite → "a creature of <huntingSpot>"', () => {
    const m = MONSTERS[COMMON_ID]
    const lore = bestiaryLore(COMMON_ID)
    expect(lore).toContain(m.name)
    expect(lore).toContain('a creature of')
    expect(lore).not.toContain('a fearsome elite')
    expect(lore).toContain(m.huntingSpot) // ashenvale_forest (huntingSpot ?? zone)
    expect(lore).toContain('Master hunters learn its every weakness.')
  })

  it('élite → "a fearsome elite of <huntingSpot>"', () => {
    const m = MONSTERS[ELITE_ID]
    const lore = bestiaryLore(ELITE_ID)
    expect(m.rank).toBe('elite')
    expect(lore).toContain('a fearsome elite of')
    expect(lore).not.toContain('a creature of')
    expect(lore).toContain(m.huntingSpot)
  })

  it('monstre sans huntingSpot → fallback sur la zone (`huntingSpot ?? zone`)', () => {
    const m = MONSTERS[NO_SPOT_ID]
    expect(m.huntingSpot).toBeUndefined()
    const lore = bestiaryLore(NO_SPOT_ID)
    expect(lore).toContain(m.zone) // blighted_road
    // élite → variante élite du texte
    expect(lore).toContain('a fearsome elite of')
  })

  it('utilise m.lore si présent (branche `m.lore ??`)', () => {
    // Aucun monstre du dataset n’a de champ `lore` ; on le vérifie et on prouve
    // qu’en son absence c’est bien le fallback dérivé qui est renvoyé.
    const withExplicitLore = Object.values(MONSTERS).find((m) => m.lore != null)
    if (withExplicitLore) {
      expect(bestiaryLore(withExplicitLore.id)).toBe(withExplicitLore.lore)
    } else {
      // Pas de lore explicite → fallback dérivé (non vide, contient le nom).
      const lore = bestiaryLore(COMMON_ID)
      expect(lore).toContain(MONSTERS[COMMON_ID].name)
      expect(lore.length).toBeGreaterThan(0)
    }
  })
})
