// PROG01/PROG02/PROG03 — déblocage de zones (data-driven), unlockedZones + migration, unlockZone (quête/info).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { isZoneUnlocked, getVisibleZones, ZONE_ORDER, START_ZONE } from '../data/zones'
import { QUESTS } from '../data/quests'

const store = () => useGameStore.getState()

describe('PROG01 — isZoneUnlocked (data-driven)', () => {
  it('la zone de départ est toujours débloquée', () => {
    expect(isZoneUnlocked(START_ZONE, { world: {}, hero: { level: 1 } })).toBe(true)
  })

  it('blighted_road : verrouillée à bas niveau, débloquée à niveau 3', () => {
    expect(isZoneUnlocked('blighted_road', { world: { monsterKillCounts: {} }, hero: { level: 1 } })).toBe(false)
    expect(isZoneUnlocked('blighted_road', { world: { monsterKillCounts: {} }, hero: { level: 3 } })).toBe(true)
  })

  it('grimspire : débloquée par niveau 8 OU 40 kills ashenvale', () => {
    expect(isZoneUnlocked('grimspire', { world: { monsterKillCounts: {} }, hero: { level: 5 } })).toBe(false)
    expect(isZoneUnlocked('grimspire', { world: { monsterKillCounts: {} }, hero: { level: 8 } })).toBe(true)
    expect(isZoneUnlocked('grimspire', { world: { monsterKillCounts: { ashwood_wolf: 40 } }, hero: { level: 1 } })).toBe(true)
  })

  it('déblocage explicite (unlockedZones) outrepasse les conditions', () => {
    expect(isZoneUnlocked('grimspire', { world: { unlockedZones: ['grimspire'], monsterKillCounts: {} }, hero: { level: 1 } })).toBe(true)
  })

  it('getVisibleZones renvoie les zones non cachées', () => {
    const vis = getVisibleZones({ world: {}, hero: { level: 1 } })
    expect(vis).toEqual(ZONE_ORDER) // aucune zone hidden pour l'instant
  })
})

describe('PROG02 — unlockedZones + migration', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('un nouveau run ne débloque que la zone de départ', () => {
    expect(store().world.unlockedZones).toEqual([START_ZONE])
  })

  it('migration : une save sans unlockedZones débloque tout (pas de régression)', () => {
    const oldSave = JSON.stringify({
      hero: store().hero,
      world: { ...store().world, unlockedZones: undefined },
      meta: store().meta,
    })
    // supprime le champ pour simuler une ancienne save
    const parsed = JSON.parse(oldSave)
    delete parsed.world.unlockedZones
    expect(store().importSave(JSON.stringify(parsed))).toBe(true)
    expect(store().world.unlockedZones).toEqual([...ZONE_ORDER])
  })
})

describe('PROG03 — unlockZone (quête / info)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('unlockZone ajoute la zone une seule fois', () => {
    store().unlockZone('grimspire', 'info')
    expect(store().world.unlockedZones).toContain('grimspire')
    const len = store().world.unlockedZones.length
    store().unlockZone('grimspire', 'info') // idempotent
    expect(store().world.unlockedZones.length).toBe(len)
  })

  it('unlockZone ignore une zone inconnue', () => {
    const before = store().world.unlockedZones.length
    store().unlockZone('nowhere')
    expect(store().world.unlockedZones.length).toBe(before)
  })

  it('voie « info » : acheter la rumeur Grimspire débloque la zone', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 999 } } }))
    expect(store().world.unlockedZones).not.toContain('grimspire')
    store().buyInfo('zone_rumor_grimspire', 40)
    expect(store().world.unlockedZones).toContain('grimspire')
  })

  it('voie « quête » : compléter nc_explore_hills débloque Grimspire', () => {
    expect(QUESTS.nc_explore_hills.reward.unlockZone).toBe('grimspire')
    store().startQuest('nc_explore_hills')
    useGameStore.setState((s) => ({ world: { ...s.world, visitedSpots: ['wildmere_hills'] } }))
    expect(store().isQuestComplete('nc_explore_hills')).toBe(true)
    store().completeQuest('nc_explore_hills')
    expect(store().world.unlockedZones).toContain('grimspire')
  })
})
