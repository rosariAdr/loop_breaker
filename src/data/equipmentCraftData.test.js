// v1.42 — Équipement & Craft (batch 1 : fondation DATA ressources/tiers).
// Couvre RES01 (modèle), TIER01 (tier T1/T2/T3), RES-TIER01 (rare tier-based),
// RES02 (commun + rare par monstre), RES04 (junk vendeur), RES-G1 (bande commune 40-65%).
import { describe, it, expect } from 'vitest'
import { RESOURCES, COMMON_DROP_BAND, RARE_DROP_RATE_BY_TIER } from './resources'
import { MONSTERS, MONSTERS_BY_SPOT, MONSTERS_BY_ZONE } from './monsters'
import { getRecipesByProfession } from './craftRecipes'

// ── Dérivations (source de vérité) ───────────────────────────────────────────
// Sources réelles = monstres dont resourceDrops référence la ressource.
function derivedSources() {
  const map = {}
  for (const m of Object.values(MONSTERS)) {
    for (const d of m.resourceDrops ?? []) {
      ;(map[d.resourceId] ??= new Set()).add(m.id)
    }
  }
  return map
}
// Usages réels côté craft = ressources référencées comme ingrédient d'une recette.
// Source unifiée : recettes alchimie (`alchemy_*`) + maître forgeron (`master_*`).
function craftUsedIds() {
  const set = new Set()
  const alchemy = getRecipesByProfession('alchemist').filter((r) => r.id.startsWith('alchemy_'))
  const master = getRecipesByProfession('blacksmith').filter((r) => r.id.startsWith('master_'))
  for (const r of [...alchemy, ...master]) {
    for (const c of r.combinations) {
      for (const id of Object.keys(c.ingredients)) set.add(id)
    }
  }
  return set
}

// Ressources de collecte/craft (portent la forme RES01 complète) = tout sauf les
// consommables/livres (achats marchand, hors chaîne de drop).
const collectibleResources = Object.values(RESOURCES).filter((r) => !r.isConsumable)

describe('RES01 — Modèle de données ressource { id, name, rarityTier, dropRate, sources[], uses[] }', () => {
  it('chaque ressource de collecte porte les 6 champs du modèle', () => {
    for (const r of collectibleResources) {
      expect(r.id, 'id').toBeTypeOf('string')
      expect(r.name, `${r.id}.name`).toBeTypeOf('string')
      expect(r.rarityTier, `${r.id}.rarityTier`).toBeTypeOf('string')
      // dropRate : nombre (0-1) OU null (pas droppé directement / input de craft).
      expect(r.dropRate === null || typeof r.dropRate === 'number', `${r.id}.dropRate`).toBe(true)
      expect(Array.isArray(r.sources), `${r.id}.sources`).toBe(true)
      expect(Array.isArray(r.uses), `${r.id}.uses`).toBe(true)
    }
  })

  it('id de la ressource === clé de la map RESOURCES', () => {
    for (const [key, r] of Object.entries(RESOURCES)) expect(r.id).toBe(key)
  })

  it('rarityTier appartient au vocabulaire attendu', () => {
    const VOCAB = ['common', 'rare', 'junk', 'boss', 'consumable']
    for (const r of Object.values(RESOURCES)) expect(VOCAB, r.id).toContain(r.rarityTier)
  })

  it('uses[] ne contient que des tags connus', () => {
    const VOCAB = ['craft', 'sell']
    for (const r of collectibleResources) {
      for (const u of r.uses) expect(VOCAB, `${r.id} use ${u}`).toContain(u)
    }
  })

  it('dropRate ∈ [0,1] quand défini', () => {
    for (const r of collectibleResources) {
      if (typeof r.dropRate === 'number') {
        expect(r.dropRate, r.id).toBeGreaterThanOrEqual(0)
        expect(r.dropRate, r.id).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('RES01 — Intégrité référentielle (pas d’id mort)', () => {
  const derived = derivedSources()

  it('chaque id de sources[] est un monstre existant qui droppe réellement la ressource', () => {
    for (const r of collectibleResources) {
      for (const monId of r.sources) {
        expect(MONSTERS[monId], `${r.id}.sources → ${monId} inconnu`).toBeDefined()
        expect(
          derived[r.id] && derived[r.id].has(monId),
          `${r.id} déclare la source ${monId} mais ${monId}.resourceDrops ne la contient pas`,
        ).toBe(true)
      }
    }
  })

  it('toute ressource réellement droppée existe dans RESOURCES (aucune ref morte dans les drops)', () => {
    for (const id of Object.keys(derived)) {
      expect(RESOURCES[id], `resourceDrops référence ${id} absent de RESOURCES`).toBeDefined()
    }
  })

  it("chaque ressource droppée par ≥1 monstre déclare 'sell' ou 'craft' dans uses[]", () => {
    for (const id of Object.keys(derived)) {
      const r = RESOURCES[id]
      if (r.isConsumable) continue
      expect(r.uses.length, `${id}.uses vide`).toBeGreaterThan(0)
    }
  })

  it("uses inclut 'craft' ⟺ la ressource est ingrédient d’au moins une recette", () => {
    const crafted = craftUsedIds()
    for (const r of collectibleResources) {
      const declaresCraft = r.uses.includes('craft')
      const isCraftIngredient = crafted.has(r.id)
      if (isCraftIngredient) {
        expect(declaresCraft, `${r.id} est ingrédient mais n’a pas 'craft' dans uses`).toBe(true)
      }
    }
  })
})

describe('TIER01 — Champ tier (T1/T2/T3) sur les 3 monstres normaux de chaque zone', () => {
  const VALID = ['T1', 'T2', 'T3']

  it('tout monstre rank=common (surface) porte un tier valide', () => {
    for (const m of Object.values(MONSTERS)) {
      if (m.rank === 'common' && !m.reserve) {
        expect(VALID, m.id).toContain(m.tier)
      }
    }
  })

  it('élites / boss / demon lord / réserve n’ont PAS de tier', () => {
    for (const m of Object.values(MONSTERS)) {
      if (m.rank !== 'common' || m.reserve) {
        expect(m.tier, `${m.id} ne devrait pas avoir de tier`).toBeUndefined()
      }
    }
  })

  it('chaque spot Ashenvale a exactement 1 T1, 1 T2, 1 T3 parmi ses 3 normaux', () => {
    for (const [spot, ids] of Object.entries(MONSTERS_BY_SPOT)) {
      const tiers = ids
        .map((id) => MONSTERS[id])
        .filter((m) => m.rank === 'common')
        .map((m) => m.tier)
        .sort()
      expect(tiers, spot).toEqual(['T1', 'T2', 'T3'])
    }
  })

  it('le tier suit la puissance (expReward croissant) dans chaque spot', () => {
    for (const ids of Object.values(MONSTERS_BY_SPOT)) {
      const normals = ids.map((id) => MONSTERS[id]).filter((m) => m.rank === 'common')
      const byTier = Object.fromEntries(normals.map((m) => [m.tier, m]))
      expect(byTier.T1.expReward).toBeLessThanOrEqual(byTier.T2.expReward)
      expect(byTier.T2.expReward).toBeLessThanOrEqual(byTier.T3.expReward)
    }
  })

  it('Grimspire : ses 6 normaux couvrent les 3 tiers', () => {
    const tiers = new Set(MONSTERS_BY_ZONE.grimspire.map((id) => MONSTERS[id]).map((m) => m.tier))
    expect([...tiers].sort()).toEqual(['T1', 'T2', 'T3'])
  })
})

describe('RES-TIER01 — Taux de drop rare tier-based (T2 @15%, T3 @7.5%, T1 aucun)', () => {
  it('constante RARE_DROP_RATE_BY_TIER conforme', () => {
    expect(RARE_DROP_RATE_BY_TIER).toEqual({ T1: null, T2: 0.15, T3: 0.075 })
  })

  // Un drop est "rare" ssi la ressource ciblée a rarityTier 'rare'.
  const rareDropsOf = (m) =>
    (m.resourceDrops ?? []).filter((d) => RESOURCES[d.resourceId]?.rarityTier === 'rare')

  it('les monstres T1 normaux n’ont AUCUN drop rare', () => {
    for (const m of Object.values(MONSTERS)) {
      if (m.rank === 'common' && !m.reserve && m.tier === 'T1') {
        expect(rareDropsOf(m).length, `${m.id} (T1) ne devrait pas dropper de rare`).toBe(0)
      }
    }
  })

  it('les monstres T2 droppent leur rare à 15%, les T3 à 7.5%', () => {
    for (const m of Object.values(MONSTERS)) {
      if (m.rank !== 'common' || m.reserve) continue
      for (const d of rareDropsOf(m)) {
        expect(d.chance, `${m.id} → ${d.resourceId}`).toBe(RARE_DROP_RATE_BY_TIER[m.tier])
      }
    }
  })
})

describe('RES02 — 1 commun + (T2/T3 → 1 rare) par monstre normal', () => {
  const normals = Object.values(MONSTERS).filter((m) => m.rank === 'common' && !m.reserve)

  it('chaque monstre normal a au moins un drop commun (rarityTier common)', () => {
    for (const m of normals) {
      const commons = (m.resourceDrops ?? []).filter(
        (d) => RESOURCES[d.resourceId]?.rarityTier === 'common',
      )
      expect(commons.length, `${m.id} devrait avoir un commun`).toBeGreaterThanOrEqual(1)
    }
  })

  it('T2/T3 ont exactement 1 drop rare ; T1 en ont 0', () => {
    for (const m of normals) {
      const rares = (m.resourceDrops ?? []).filter(
        (d) => RESOURCES[d.resourceId]?.rarityTier === 'rare',
      )
      expect(rares.length, `${m.id} (${m.tier})`).toBe(m.tier === 'T1' ? 0 : 1)
    }
  })

  it('~32 ressources de collecte/craft au total (commons + rares, hors consommables/junk)', () => {
    const n = Object.values(RESOURCES).filter(
      (r) => r.rarityTier === 'common' || r.rarityTier === 'rare',
    ).length
    expect(n).toBeGreaterThanOrEqual(28)
    expect(n).toBeLessThanOrEqual(40)
  })
})

describe('RES-G1 — Bande de drop commune 40-65%, sans scaling', () => {
  it('COMMON_DROP_BAND = [0.4, 0.65]', () => {
    expect(COMMON_DROP_BAND).toEqual({ min: 0.4, max: 0.65 })
  })

  it('tout drop commun d’un monstre NORMAL est dans la bande 40-65%', () => {
    for (const m of Object.values(MONSTERS)) {
      if (m.rank !== 'common' || m.reserve) continue
      for (const d of m.resourceDrops ?? []) {
        if (RESOURCES[d.resourceId]?.rarityTier !== 'common') continue
        expect(d.chance, `${m.id} → ${d.resourceId}`).toBeGreaterThanOrEqual(COMMON_DROP_BAND.min)
        expect(d.chance, `${m.id} → ${d.resourceId}`).toBeLessThanOrEqual(COMMON_DROP_BAND.max)
      }
    }
  })
})

describe('RES04 — Ressources junk (revente seule)', () => {
  const JUNK = ['rotting_hide', 'grave_stone', 'goblin_trinket']

  it('les 3 junk existent, rarityTier=junk, uses=[sell] uniquement', () => {
    for (const id of JUNK) {
      const r = RESOURCES[id]
      expect(r, id).toBeDefined()
      expect(r.rarityTier).toBe('junk')
      expect(r.uses).toEqual(['sell'])
      expect(r.sellPrice).toBeGreaterThan(0)
    }
  })

  it('les junk ne sont ingrédient d’aucune recette (pas d’autre usage que la revente)', () => {
    const crafted = craftUsedIds()
    for (const id of JUNK) expect(crafted.has(id), `${id} ne doit pas être craftable`).toBe(false)
  })
})

describe('Non-régression — les rarity loot (RARITY_COLORS) restent intacts', () => {
  it('chaque ressource garde un champ rarity dans le vocab loot', () => {
    const LOOT = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (const r of Object.values(RESOURCES)) expect(LOOT, r.id).toContain(r.rarity)
  })
})
