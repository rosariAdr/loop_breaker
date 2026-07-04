// v1.42 batch 5 — Modèle de qualité HYBRIDE unifié.
// Prouve : (1) le cœur de bump PARTAGÉ (applyRarityBumps) est correct et borné ; (2) le
// chemin hybride resolveCraftedRarity combine roll de base + bumps bornés (Concentration/outil
// /palier) ; (3) resolveCraftOutcome (STA03) et resolveCraftedRarity CONVERGENT sur ce cœur.
import { describe, it, expect } from 'vitest'
import {
  applyRarityBumps,
  tierRarityBump,
  resolveCraftOutcome,
  bumpRarity,
} from './crafting'
import { resolveCraftedRarity, toolRarityBump } from './craftModel'

describe('HYBRIDE — applyRarityBumps (cœur borné partagé)', () => {
  it('0 bump → rareté de base', () => {
    expect(applyRarityBumps({ baseRarity: 'common', bumps: 0 })).toBe('common')
    expect(applyRarityBumps({ baseRarity: 'rare', bumps: 0 })).toBe('rare')
  })
  it('bumps positifs montent d’autant de crans', () => {
    expect(applyRarityBumps({ baseRarity: 'common', bumps: 1 })).toBe('rare')
    expect(applyRarityBumps({ baseRarity: 'common', bumps: 2 })).toBe('epic')
    expect(applyRarityBumps({ baseRarity: 'rare', bumps: 2 })).toBe('legendary')
  })
  it('ne descend jamais sous la base (bumps négatifs clampés)', () => {
    expect(applyRarityBumps({ baseRarity: 'epic', bumps: -3 })).toBe('epic')
  })
  it('le plafond du lieu borne le résultat', () => {
    expect(applyRarityBumps({ baseRarity: 'common', bumps: 3, locationCapRarity: 'rare' })).toBe(
      'rare',
    )
  })
  it('un plafond incohérent (< base) est ignoré au profit de la base', () => {
    expect(applyRarityBumps({ baseRarity: 'epic', bumps: 0, locationCapRarity: 'common' })).toBe(
      'epic',
    )
  })
  it('clampe à la borne haute des tiers', () => {
    expect(applyRarityBumps({ baseRarity: 'exx', bumps: 5 })).toBe('exx')
  })
  it('rareté inconnue renvoyée telle quelle', () => {
    expect(applyRarityBumps({ baseRarity: 'ultra', bumps: 2 })).toBe('ultra')
  })
})

describe('HYBRIDE — tierRarityBump / toolRarityBump (bumps bornés)', () => {
  it('tierRarityBump : parfait +2, bon +1, neutre/autre 0', () => {
    expect(tierRarityBump('perfect')).toBe(2)
    expect(tierRarityBump('good')).toBe(1)
    expect(tierRarityBump('neutral')).toBe(0)
    expect(tierRarityBump(undefined)).toBe(0)
  })
  it('toolRarityBump : borné à +1 (outil > 1 → +1, sinon 0)', () => {
    expect(toolRarityBump(1)).toBe(0)
    expect(toolRarityBump(1.5)).toBe(1)
    expect(toolRarityBump(5)).toBe(1) // JAMAIS plus de +1 (contraste avec l’ancienne formule ×)
    expect(toolRarityBump()).toBe(0)
  })
})

describe('HYBRIDE — resolveCraftedRarity (chemin de qualité unique)', () => {
  it('tire la base dans la rarityTable puis n’ajoute rien sans bonus', () => {
    // rng 0.99 → tombe sur la 2e tranche { common:80, rare:20 } → rare ; aucun bump.
    const r = resolveCraftedRarity({ rarityTable: { common: 80, rare: 20 }, rng: () => 0.99 })
    expect(r).toBe('rare')
  })
  it('baseRarity explicite prime sur la rarityTable', () => {
    expect(resolveCraftedRarity({ baseRarity: 'rare', rng: () => 0.0 })).toBe('rare')
  })
  it('la Concentration à 150 garantit +1 cran (borné)', () => {
    // base common, concentration 150 → bump concentration garanti = +1 → rare.
    expect(resolveCraftedRarity({ baseRarity: 'common', concentration: 150, rng: () => 0.99 })).toBe(
      'rare',
    )
  })
  it('l’outil ajoute au plus +1 (pas de multiplication)', () => {
    // base common, sans concentration, outil 5 → +1 SEULEMENT → rare (pas legendary).
    expect(resolveCraftedRarity({ baseRarity: 'common', toolBonus: 5, rng: () => 0.99 })).toBe(
      'rare',
    )
  })
  it('palier + concentration + outil s’additionnent, bornés par le plafond', () => {
    // base common, perfect(+2) + conc 150(+1) + outil(+1) = +4 → mythic ; plafond epic → epic.
    expect(
      resolveCraftedRarity({
        baseRarity: 'common',
        tier: 'perfect',
        concentration: 150,
        toolBonus: 2,
        locationCapRarity: 'epic',
        rng: () => 0.0,
      }),
    ).toBe('epic')
  })
  it('table vide et pas de baseRarity → null', () => {
    expect(resolveCraftedRarity({ rarityTable: {}, rng: () => 0.5 })).toBeNull()
  })
})

describe('HYBRIDE — convergence STA03 ⇆ resolveCraftedRarity (même cœur)', () => {
  // Pour tout base/tier/extraBump, resolveCraftOutcome (STA03) et resolveCraftedRarity
  // produisent la MÊME rareté → un seul modèle de qualité, plus de formules concurrentes.
  const bases = ['common', 'rare', 'epic']
  const tiers = ['neutral', 'good', 'perfect']
  for (const base of bases) {
    for (const tier of tiers) {
      for (const extra of [0, 1]) {
        it(`base=${base} tier=${tier} concBump=${extra} : STA03 == hybride`, () => {
          const sta03 = resolveCraftOutcome(base, tier, extra).rarity
          // Reproduit le extraBump via une concentration garantie (150) ou nulle (0).
          const hybrid = resolveCraftedRarity({
            baseRarity: base,
            tier,
            concentration: extra === 1 ? 150 : 0,
            rng: () => 0.0, // rollConcentrationBump(150) = 1 garanti ; (0) = 0.
          })
          expect(hybrid).toBe(sta03)
        })
      }
    }
  }

  it('bumpRarity reste l’unique primitive de décalage (STA03 s’appuie dessus)', () => {
    expect(bumpRarity('common', 2)).toBe('epic')
    expect(resolveCraftOutcome('common', 'perfect').rarity).toBe('epic')
  })
})
