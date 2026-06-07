// Régression : save v2 écrite avant l'ajout de champs meta (ex. `seenHints`).
// Bug réel (save day10 du joueur) : `meta.seenHints` absent → `recordKill` throwait au
// 5ᵉ kill (`state.meta.seenHints.includes`) → compteurs de kills/quêtes BLOQUÉS à 4 et
// déblocage idle impossible. Les migrations étant version-gated, une save déjà en v2 ne
// repassait jamais par le backfill. Correctif : `normalizeSave` (idempotent, toutes
// versions) + accès défensif dans `recordKill`.

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, runMigrations, normalizeSave, SAVE_VERSION } from './gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

describe('normalizeSave — backfill des champs par défaut (toutes versions)', () => {
  it('save v2 sans seenHints → seenHints ré-injecté ([])', () => {
    const save = { saveVersion: 2, hero: {}, world: {}, meta: { totalDeaths: 8 } }
    const out = normalizeSave(save)
    expect(out.meta.seenHints).toEqual([])
  })

  it('backfille aussi settings/gluttonyLastUsed/permanentStatBoosts/firstDeathSeen', () => {
    const out = normalizeSave({ saveVersion: 2, meta: {} })
    expect(out.meta.settings).toEqual({ animations: true })
    expect(out.meta.gluttonyLastUsed).toBeNull()
    expect(out.meta.permanentStatBoosts).toEqual({})
    expect(out.meta.firstDeathSeen).toBe(false)
  })

  it('NE perd PAS les données existantes de la save', () => {
    const out = normalizeSave({
      saveVersion: 2,
      meta: { totalDeaths: 8, knownInfo: ['loot_thornmarsh'], divineBonds: { medieval_fantasy: 'sylvara' } },
      world: { monsterKillCounts: { ashwood_wolf: 4 }, dayCount: 10 },
      hero: { name: 'Innoryu', level: 8 },
    })
    expect(out.meta.totalDeaths).toBe(8)
    expect(out.meta.knownInfo).toEqual(['loot_thornmarsh'])
    expect(out.world.monsterKillCounts.ashwood_wolf).toBe(4)
    expect(out.world.dayCount).toBe(10)
    expect(out.hero.name).toBe('Innoryu')
  })

  it('settings imbriqué partiel → sous-clés par défaut conservées', () => {
    const out = normalizeSave({ saveVersion: 2, meta: { settings: {} } })
    expect(out.meta.settings.animations).toBe(true)
  })

  it('runMigrations applique le backfill (save v2 incomplète comme celle du joueur)', () => {
    const out = runMigrations({ saveVersion: 2, hero: {}, world: {}, meta: { totalDeaths: 8 } })
    expect(out.meta.seenHints).toEqual([])
  })
})

describe('recordKill — RÉGRESSION compteur bloqué', () => {
  it('5ᵉ kill avec seenHints absent → PAS de throw + compteur passe à 5', () => {
    // Simule l'état corrompu : meta sans seenHints, mob déjà à 4 kills (comme la save day10)
    useGameStore.setState((s) => {
      const meta = { ...s.meta }
      delete meta.seenHints
      return { meta, world: { ...s.world, monsterKillCounts: { ashwood_wolf: 4 } } }
    })

    expect(() => useGameStore.getState().recordKill('ashwood_wolf')).not.toThrow()
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(5)
  })

  it('le seuil idle (5 kills) marque bien seenHints=idle_unlock', () => {
    useGameStore.setState((s) => {
      const meta = { ...s.meta }
      delete meta.seenHints
      return { meta, world: { ...s.world, monsterKillCounts: { marsh_serpent: 4 } } }
    })
    useGameStore.getState().recordKill('marsh_serpent')
    expect(useGameStore.getState().meta.seenHints).toContain('idle_unlock')
  })

  it('kills successifs incrémentent normalement de 1 à 6 (pas de blocage à 4)', () => {
    useGameStore.setState((s) => {
      const meta = { ...s.meta }
      delete meta.seenHints
      return { meta, world: { ...s.world, monsterKillCounts: {} } }
    })
    for (let i = 0; i < 6; i++) useGameStore.getState().recordKill('ashwood_wolf')
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(6)
  })
})

describe('MON01 — remap d\'id de spot renommé (barrow_hills → wildmere_hills)', () => {
  it('normalizeSave remappe currentHuntingSpot et currentNode', () => {
    const out = normalizeSave({
      saveVersion: 2,
      world: { currentHuntingSpot: 'barrow_hills', currentNode: 'barrow_hills' },
    })
    expect(out.world.currentHuntingSpot).toBe('wildmere_hills')
    expect(out.world.currentNode).toBe('wildmere_hills')
  })

  it('ne touche pas un spot non renommé', () => {
    const out = normalizeSave({
      saveVersion: 2,
      world: { currentHuntingSpot: 'thornmarsh', currentNode: 'ironhaven' },
    })
    expect(out.world.currentHuntingSpot).toBe('thornmarsh')
    expect(out.world.currentNode).toBe('ironhaven')
  })
})

describe('SAVE_VERSION sanity', () => {
  it('runMigrations renvoie un objet exploitable', () => {
    const out = runMigrations({ saveVersion: SAVE_VERSION, hero: {}, world: {}, meta: {} })
    expect(out.meta.seenHints).toBeDefined()
    expect(out.world).toBeDefined()
    expect(out.hero).toBeDefined()
  })
})
