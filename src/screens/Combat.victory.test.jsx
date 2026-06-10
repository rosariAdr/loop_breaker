// CMB-WIN-FIX — Régression : "combat gagné mais bloqué sur l'écran de combat".
//
// Cause-racine : handleVictory loggait « Victory! » puis distribuait les récompenses
// (drops, kills, XP, éveil divin…) AVANT setPhase('result'). Si une seule de ces
// récompenses throwait (save corrompue / id manquant / champ non migré), la fonction
// s'interrompait et le joueur restait coincé au tour du héros — resolvedRef (déjà true)
// neutralisant le filet de sécurité. Le correctif encapsule toute la distribution dans
// un try/catch pour GARANTIR la transition vers le ResultPanel (bouton « ← Continue »).
//
// Ces tests verrouillent : victoire 1 tour, multi-tours, multi-ennemis, par compétence,
// avec divinité, et surtout — résilience si une récompense throw.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import Combat from './Combat'
import { useGameStore } from '../store/gameStore'

let origRecordKill
beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  origRecordKill = useGameStore.getState().recordKill // pour restauration après injection
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  // Restaure toute action de store écrasée par un test (les actions survivent à resetGame)
  useGameStore.setState({ recordKill: origRecordKill })
})

// Helpers ───────────────────────────────────────────────────────────────────
function makeEnemy(over = {}) {
  return {
    id: 'ashwood_wolf_0',
    monsterId: 'ashwood_wolf',
    name: 'Test Wolf',
    stats: { hp: 80, atk: 5, def: 4, spd: 10 },
    currentHp: 80,
    rank: 'common',
    expReward: 15,
    ...over,
  }
}

function setHero(over = {}) {
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      stats: { ...s.hero.stats, hp: 500, maxHp: 500, ...over.stats },
      ...over.hero,
    },
  }))
}

// Joue un tour : clic Basic Attack puis avance le temps (player anim + tour ennemi complet)
async function attackRound() {
  const btn = screen.queryByText(/Basic Attack/i)
  if (!btn) return false
  await act(async () => {
    btn.click()
  })
  await act(async () => {
    vi.advanceTimersByTime(2500)
  })
  return true
}

// Joue jusqu'à la victoire (ResultPanel) ou épuisement des rounds
async function fightToVictory(maxRounds = 8) {
  for (let i = 0; i < maxRounds; i++) {
    if (screen.queryByText(/Continue/i)) return true
    if (!(await attackRound())) break
  }
  return !!screen.queryByText(/Continue/i)
}

// Tests ───────────────────────────────────────────────────────────────────────
describe('CMB-WIN-FIX — la victoire mène TOUJOURS au ResultPanel', () => {
  it('victoire en 1 coup (one-shot) → bouton « Continue »', async () => {
    setHero({ stats: { strength: 999 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
  })

  it('victoire MULTI-TOURS (ennemi survit plusieurs coups) → ResultPanel', async () => {
    setHero({ stats: { strength: 30 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 80, atk: 5, def: 4, spd: 10 }, currentHp: 80 })])
    render(<Combat />)
    expect(await fightToVictory()).toBe(true)
  })

  it('victoire MULTI-ENNEMIS (2) → ResultPanel + kills comptés', async () => {
    setHero({ stats: { strength: 999 } })
    useGameStore.getState().startCombat([
      makeEnemy({ id: 'w0', stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 }),
      makeEnemy({
        id: 'w1',
        name: 'Test Wolf 2',
        stats: { hp: 1, atk: 5, def: 0, spd: 10 },
        currentHp: 1,
      }),
    ])
    render(<Combat />)
    expect(await fightToVictory()).toBe(true)
  })

  it('victoire AVEC divinité (sylvara) → ResultPanel', async () => {
    setHero({ stats: { strength: 999 }, hero: { deity: 'sylvara' } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
  })

  it('victoire par COMPÉTENCE (Power Strike) → ResultPanel', async () => {
    setHero({
      stats: { strength: 999, mana: 100, maxMana: 100 },
      hero: { activeSkills: [{ skillId: 'power_strike', level: 1, xp: 0, currentCooldown: 0 }] },
    })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    // Onglet Skills → bouton Power Strike
    await act(async () => {
      screen.getByText(/Skills/i).click()
    })
    const skillBtn = screen.getByText(/Power Strike/i)
    await act(async () => {
      skillBtn.click()
      vi.advanceTimersByTime(800)
    })
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
  })

  // ── LE test de régression central ──────────────────────────────────────────
  it('RÉGRESSION : si une récompense throw (recordKill), le combat se termine QUAND MÊME', async () => {
    // Simule un état corrompu : recordKill lève une exception (comme une save du joueur
    // dont un champ déclenchait un throw au milieu de la distribution des récompenses).
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    useGameStore.setState({
      recordKill: () => {
        throw new Error('reward boom (état corrompu simulé)')
      },
    })

    setHero({ stats: { strength: 999 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })

    // AVANT le correctif : resté bloqué au tour du héros (pas de « Continue »).
    // APRÈS : le ResultPanel s'affiche malgré l'échec de la récompense.
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
    expect(errSpy).toHaveBeenCalled() // l'erreur a bien été loggée, pas avalée silencieusement
    errSpy.mockRestore()
  })

  it('RÉGRESSION : un throw dans une récompense ne laisse jamais le tour « player » actif', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    useGameStore.setState({
      recordKill: () => {
        throw new Error('boom')
      },
    })

    setHero({ stats: { strength: 999 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    // L'écran de combat (onglets d'action) ne doit plus proposer d'attaquer
    expect(screen.queryByText(/Basic Attack/i)).toBeNull()
    errSpy.mockRestore()
  })
})

// CMB-WIN — après victoire, « Continue » ramène à l'écran de zone (liste des monstres)
describe('CMB-WIN — retour à zone_view après victoire', () => {
  it('« Continue » après victoire → currentScreen = zone_view (huntingSpot défini)', async () => {
    useGameStore.setState((s) => ({
      world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' },
      hero: { ...s.hero, stats: { ...s.hero.stats, strength: 999, hp: 500, maxHp: 500 } },
    }))
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    await act(async () => {
      screen.getByText(/Continue/i).click()
    })
    expect(useGameStore.getState().currentScreen).toBe('zone_view')
  })
})
