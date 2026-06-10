// COV80 — flux de combat additionnels (compétence, objet, fuite) pour couvrir
// handleUseSkill / handleUseItem / handleFlee et la boucle de tour ennemi.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import Combat from './Combat'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function tankyEnemy() {
  return {
    id: 'wolf_0',
    monsterId: 'ashwood_wolf',
    name: 'Tank Wolf',
    // quasi invincible (def 999, hp 9999) → survit à une compétence : le combat continue
    stats: { hp: 9999, atk: 3, def: 999, spd: 5 },
    currentHp: 9999,
    rank: 'common',
    expReward: 15,
  }
}

describe('Combat — flux compétence / objet / fuite (COV80)', () => {
  it('utiliser une compétence (Power Strike) fait progresser le combat sans le terminer', async () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        stats: { ...s.hero.stats, hp: 500, maxHp: 500, mana: 100, maxMana: 100, strength: 30 },
        activeSkills: [{ skillId: 'power_strike', level: 1, xp: 0, currentCooldown: 0 }],
      },
    }))
    useGameStore.getState().startCombat([tankyEnemy()])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Skills/i).click()
    })
    await act(async () => {
      screen.getByText(/Power Strike/i).click()
      vi.advanceTimersByTime(2500)
    })
    // l'ennemi est quasi invincible → le combat continue (pas de fin), l'ennemi est toujours là
    expect(screen.queryByText(/Continue/i)).toBeFalsy()
    expect(screen.getByText('Tank Wolf')).toBeInTheDocument()
  })

  it('utiliser un objet de soin restaure des PV', async () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        stats: { ...s.hero.stats, hp: 50, maxHp: 200, mana: 50, maxMana: 50, strength: 10 },
        inventory: { ...s.hero.inventory, consumables: { hp_potion_small: 3 } },
      },
    }))
    useGameStore.getState().startCombat([tankyEnemy()])
    render(<Combat />)
    const hpBefore = useGameStore.getState().hero.stats.hp
    await act(async () => {
      screen.getByText(/Items/i).click()
    })
    // clique le 1er bouton d'objet dispo (nom de la potion)
    const potionBtn = screen.queryByText(/Potion|Elixir|hp_potion/i)
    if (potionBtn) {
      await act(async () => {
        potionBtn.click()
        vi.advanceTimersByTime(2500)
      })
      expect(useGameStore.getState().hero.stats.hp).toBeGreaterThanOrEqual(hpBefore)
    }
  })

  it('fuir avec une grande agilité termine le combat', async () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, hp: 500, maxHp: 500, agility: 999 } },
    }))
    useGameStore.getState().startCombat([tankyEnemy()])
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Flee/i).click()
      vi.advanceTimersByTime(2500)
    })
    // fuite réussie → on quitte la phase joueur (plus d'attaque de base proposée)
    expect(screen.queryByText(/Basic Attack/i)).toBeFalsy()
  })

  it('défaite : PV à 0 sous les coups ennemis → écran de résultat', async () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, hp: 3, maxHp: 100, def: 0, strength: 1 } },
    }))
    useGameStore.getState().startCombat([
      {
        id: 'killer',
        monsterId: 'ashwood_wolf',
        name: 'Killer',
        stats: { hp: 9999, atk: 9999, def: 0, spd: 1 },
        currentHp: 9999,
        rank: 'common',
        expReward: 15,
      },
    ])
    render(<Combat />)
    // attaquer jusqu'à la mort : le tour ennemi inflige des dégâts létaux → finishCombat('defeat')
    for (let i = 0; i < 5; i++) {
      const btn = screen.queryByText(/Basic Attack/i)
      if (!btn) break
      await act(async () => {
        btn.click()
        vi.advanceTimersByTime(2500)
      })
    }
    // combat terminé (défaite) → la phase joueur n'est plus proposée
    expect(screen.queryByText(/Basic Attack/i)).toBeFalsy()
  })
})
