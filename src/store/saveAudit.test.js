// SAVE-AUDIT01 — validation de schéma défensive : normalizeSave répare (au lieu de crasher)
// les saves dont des champs sont manquants OU du mauvais type, et les vieilles saves se
// chargent sans casser le jeu.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, normalizeSave, runMigrations } from './gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

describe('SAVE-AUDIT01 — normalizeSave répare les champs malformés', () => {
  it('coerce les tableaux/objets du mauvais type vers un défaut sûr', () => {
    const corrupt = {
      hero: {
        activeSkills: 'oops',
        passiveSkills: null,
        inventory: { manaStones: 42, equipment: {}, gold: 'x' },
      },
      world: { activeQuests: {}, completedQuests: 7, monsterKillCounts: [], questProgress: 'no' },
      meta: { achievements: 'nope', seenHints: 5, knownInfo: null },
    }
    const s = normalizeSave(corrupt)
    expect(Array.isArray(s.hero.activeSkills)).toBe(true)
    expect(Array.isArray(s.hero.passiveSkills)).toBe(true)
    expect(Array.isArray(s.hero.inventory.manaStones)).toBe(true)
    expect(Array.isArray(s.hero.inventory.equipment)).toBe(true)
    expect(typeof s.hero.inventory.gold).toBe('number')
    expect(Array.isArray(s.world.activeQuests)).toBe(true)
    expect(Array.isArray(s.world.completedQuests)).toBe(true)
    // monsterKillCounts doit être un objet (pas un tableau)
    expect(Array.isArray(s.world.monsterKillCounts)).toBe(false)
    expect(typeof s.world.monsterKillCounts).toBe('object')
    expect(typeof s.world.questProgress).toBe('object')
    expect(Array.isArray(s.meta.achievements)).toBe(true)
    expect(Array.isArray(s.meta.seenHints)).toBe(true)
    expect(Array.isArray(s.meta.knownInfo)).toBe(true)
  })

  it('backfille les sous-clés manquantes (stats / equipped / settings) sans perdre les données', () => {
    const s = normalizeSave({ hero: { stats: { hp: 5 } }, meta: { settings: {} } })
    expect(s.hero.stats.hp).toBe(5) // valeur préservée
    expect(s.hero.stats.maxHp).toBeDefined() // backfillé
    expect(s.hero.stats.strength).toBeDefined()
    expect(s.hero.equipped).toHaveProperty('weapon')
    expect(s.meta.settings.animations).toBeDefined()
  })

  it('null / non-objet → renvoyé tel quel sans crash', () => {
    expect(normalizeSave(null)).toBeNull()
    expect(normalizeSave('x')).toBe('x')
  })
})

describe('SAVE-AUDIT01 — vieilles saves (migration + chargement)', () => {
  it('runMigrations sur une save legacy v1 (sans saveVersion, champs manquants) ne crashe pas', () => {
    const legacy = {
      hero: { name: 'Old Hero', level: 4 },
      world: { currentZone: 'ashenvale' },
      meta: {},
    }
    const migrated = runMigrations(legacy)
    expect(migrated.hero.name).toBe('Old Hero')
    expect(Array.isArray(migrated.world.activeQuests)).toBe(true)
    expect(Array.isArray(migrated.meta.seenHints)).toBe(true)
    expect(typeof migrated.world.questProgress).toBe('object')
  })

  it('loadGame depuis une save corrompue : pas de crash + jeu jouable (recordKill)', () => {
    localStorage.setItem(
      'roguelite_save',
      JSON.stringify({
        saveVersion: 2,
        hero: { stats: { hp: 50, maxHp: 100 }, inventory: { manaStones: null } },
        world: { monsterKillCounts: null, activeQuests: 'bad' },
        meta: { seenHints: 'bad' },
      }),
    )
    expect(() => useGameStore.getState().loadGame()).not.toThrow()
    // recordKill lit meta.seenHints.includes + monsterKillCounts → ne doit pas crasher
    expect(() => useGameStore.getState().recordKill('ashwood_wolf')).not.toThrow()
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(1)
  })
})
