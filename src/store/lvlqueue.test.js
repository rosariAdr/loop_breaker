// FIX-LVLQUEUE01 — modal de level-up unique, cumulé et reportable.
// Cause racine : `pendingLevelUp` = compteur ; chaque événement XP (victoire, CHAQUE remise
// de quête) pouvait rouvrir un modal, qui n'accordait qu'UN point de stat quel que soit le
// nombre de niveaux. Décision : (1) un seul modal cumulé « +N levels » avec N choix de stat ;
// (2) « Do it later » → points stockés dans `hero.pendingStatPoints`, attribuables depuis le
// HeroSheet. Migration save `pendingStatPoints`.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { runMigrations } from './migrations'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('FIX-LVLQUEUE01 — coalescence des niveaux', () => {
  it('plusieurs gains XP successifs cumulent pendingLevelUp (un seul modal)', () => {
    s().gainExp(100) // level 1 → 2
    const after1 = s().pendingLevelUp
    expect(after1).toBeGreaterThan(0)
    s().gainExp(100000) // rafale : plusieurs niveaux d'un coup, cumulés
    expect(s().pendingLevelUp).toBeGreaterThan(after1)
  })
})

describe('FIX-LVLQUEUE01 — commitLevelUp (allocation + report du reliquat)', () => {
  it('alloue les points choisis et reporte le reliquat dans pendingStatPoints', () => {
    useGameStore.setState({ pendingLevelUp: 3 })
    const str = s().hero.stats.strength
    const def = s().hero.stats.def
    s().commitLevelUp({ strength: 2 }) // 2 alloués, 1 reporté
    expect(s().hero.stats.strength).toBe(str + 2)
    expect(s().hero.stats.def).toBe(def) // non touché
    expect(s().hero.pendingStatPoints).toBe(1)
    expect(s().pendingLevelUp).toBe(0)
  })

  it('allocation complète → aucun reliquat', () => {
    useGameStore.setState({ pendingLevelUp: 2 })
    s().commitLevelUp({ strength: 1, agility: 1 })
    expect(s().hero.pendingStatPoints).toBe(0)
    expect(s().pendingLevelUp).toBe(0)
  })

  it('ne dépasse jamais le pool : une sur-allocation est bornée par le report négatif → 0', () => {
    useGameStore.setState({ pendingLevelUp: 1 })
    s().commitLevelUp({ strength: 5 }) // le modal empêche ça, mais le store reste sûr
    expect(s().hero.pendingStatPoints).toBe(0) // deferred = max(0, 1 - 5)
    expect(s().pendingLevelUp).toBe(0)
  })
})

describe('FIX-LVLQUEUE01 — deferLevelUp (« Do it later »)', () => {
  it('reporte TOUS les points sans rien attribuer', () => {
    useGameStore.setState({ pendingLevelUp: 4 })
    const str = s().hero.stats.strength
    s().deferLevelUp()
    expect(s().hero.stats.strength).toBe(str)
    expect(s().hero.pendingStatPoints).toBe(4)
    expect(s().pendingLevelUp).toBe(0)
  })
})

describe('FIX-LVLQUEUE01 — assignStatPoint (depuis le HeroSheet)', () => {
  it('attribue 1 point différé et décrémente le pool', () => {
    useGameStore.setState((st) => ({ hero: { ...st.hero, pendingStatPoints: 2 } }))
    const int = s().hero.stats.intelligence
    s().assignStatPoint('intelligence')
    expect(s().hero.stats.intelligence).toBe(int + 1)
    expect(s().hero.pendingStatPoints).toBe(1)
  })

  it('no-op si aucun point en attente', () => {
    useGameStore.setState((st) => ({ hero: { ...st.hero, pendingStatPoints: 0 } }))
    const str = s().hero.stats.strength
    s().assignStatPoint('strength')
    expect(s().hero.stats.strength).toBe(str)
    expect(s().hero.pendingStatPoints).toBe(0)
  })

  it('no-op sur une stat inconnue', () => {
    useGameStore.setState((st) => ({ hero: { ...st.hero, pendingStatPoints: 1 } }))
    s().assignStatPoint('bogus')
    expect(s().hero.pendingStatPoints).toBe(1)
  })
})

describe('FIX-LVLQUEUE01 — migration save', () => {
  it('backfill pendingStatPoints à 0 pour une vieille save', () => {
    const migrated = runMigrations({ saveVersion: 3, hero: {}, world: {}, meta: {} })
    expect(migrated.hero.pendingStatPoints).toBe(0)
  })

  it('préserve une valeur valide et répare une valeur corrompue', () => {
    expect(
      runMigrations({ saveVersion: 3, hero: { pendingStatPoints: 5 }, world: {}, meta: {} }).hero
        .pendingStatPoints,
    ).toBe(5)
    expect(
      runMigrations({ saveVersion: 3, hero: { pendingStatPoints: -3 }, world: {}, meta: {} }).hero
        .pendingStatPoints,
    ).toBe(0)
    expect(
      runMigrations({ saveVersion: 3, hero: { pendingStatPoints: 'x' }, world: {}, meta: {} }).hero
        .pendingStatPoints,
    ).toBe(0)
  })
})
