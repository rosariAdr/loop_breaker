// UI11 — Église en 1 clic (POC B split 2 colonnes) : couvre les AC du ticket +
// la régression FIX-QUESTPROG02 (quête kill active = delta, pas cumul).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react'
import SafeZone from '../SafeZone'
import { useGameStore } from '../../store/gameStore'

function openChurch() {
  render(<SafeZone />)
  fireEvent.click(screen.getAllByText('Church of the Old Gods')[0])
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    // Greywatch (village de départ, église présente) ; midi → bâtiments ouverts (BLD01).
    world: { ...s.world, tickCount: 12 },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('UI11 — Église : split B en 1 clic', () => {
  it('(a) 1 clic bâtiment → panneau split immédiat, sans écran d’intro « Enter the Church »', () => {
    openChurch()
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
    expect(screen.getByTestId('church-split')).toBeInTheDocument()
    expect(screen.queryByText(/Enter the Church/)).toBeNull()
  })

  it('(b) Talk (colonne gauche) ouvre le dialogue, et sa fermeture revient au panneau', () => {
    openChurch()
    fireEvent.click(screen.getByTestId('side-talk'))
    expect(screen.getByText(/Brother Caelum — Cleric/)).toBeInTheDocument()
    // dérouler l'arbre de dialogue jusqu'au bout (le dernier choix ferme) → retour au panneau
    for (let i = 0; i < 6; i++) {
      const opt = document.querySelector('.dlg-opt')
      if (!opt) break
      fireEvent.click(opt)
    }
    expect(screen.getByTestId('church-split')).toBeInTheDocument()
  })

  it('(c) le HP/MP n’est plus affiché dans le panneau (redondant topbar)', () => {
    openChurch()
    const split = screen.getByTestId('church-split')
    expect(within(split).queryByText(/^HP$/)).toBeNull()
    expect(within(split).queryByText(/^Mana$/)).toBeNull()
  })

  it('(d) les quest cards sont en thème parchemin (plus de fond noir)', () => {
    openChurch()
    const cards = screen.getByTestId('church-quests').querySelectorAll('[data-parchment]')
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.style.background).not.toBe('rgb(10, 10, 8)') // #0a0a08 (palette sombre du board)
    }
  })

  it('(e) Pray : désactivé à pleine forme, actif blessé (restaure + coûte 1 tic)', () => {
    openChurch()
    // pleine forme → désactivé + hint
    expect(screen.getByText('Pray').closest('button')).toBeDisabled()
    expect(screen.getByText(/Already at full strength/)).toBeInTheDocument()
    // blessé → actif, prier restaure et avance le temps
    act(() => {
      useGameStore.setState((s) => ({
        hero: { ...s.hero, stats: { ...s.hero.stats, hp: 10, mana: 5 } },
      }))
    })
    const tickBefore = useGameStore.getState().world.tickCount
    const btn = screen.getByText('Pray').closest('button')
    expect(btn).not.toBeDisabled()
    fireEvent.click(btn)
    const { hero, world } = useGameStore.getState()
    expect(hero.stats.hp).toBeGreaterThan(10)
    expect(world.tickCount).toBe((tickBefore + 1) % 24)
  })

  it('(f) Accept ajoute l’acte de dévotion au journal (activeQuests)', () => {
    openChurch()
    const before = useGameStore.getState().world.activeQuests.length
    fireEvent.click(within(screen.getByTestId('church-quests')).getAllByText('Accept')[0])
    expect(useGameStore.getState().world.activeQuests.length).toBe(before + 1)
  })

  it('(g) le cooldown de rotation « New deeds in X days » est affiché', () => {
    openChurch()
    expect(screen.getByText(/New deeds in \d+ day/)).toBeInTheDocument()
  })

  it('FIX-QUESTPROG02 (régression) — un deed kill accepté affiche le DELTA (0/N), pas le cumul', () => {
    // 5 loups déjà tués AVANT d'accepter : l'affichage doit repartir de 0, pas montrer 5/5.
    useGameStore.setState((s) => ({
      world: { ...s.world, monsterKillCounts: { ...s.world.monsterKillCounts, ashwood_wolf: 5 } },
    }))
    openChurch()
    const list = screen.getByTestId('church-quests')
    const acceptBtns = within(list).getAllByText('Accept')
    fireEvent.click(acceptBtns[0])
    // la carte active du deed kill (loups) montre 0/N — aucun pill « plein » d'entrée
    const pills = [...list.querySelectorAll('[data-parchment] span')]
      .map((el) => el.textContent)
      .filter((t) => /^\d+\/\d+$/.test(t))
    expect(pills.length).toBeGreaterThan(0)
    for (const p of pills) {
      const [cur, target] = p.split('/').map(Number)
      expect(cur).toBeLessThan(target) // pas de 5/5 fantôme à l'acceptation
    }
  })

  it('✕ Leave (colonne droite) ferme la fenêtre et rend la place du village', () => {
    openChurch()
    fireEvent.click(screen.getByTestId('church-leave'))
    expect(document.querySelector('.npc-scrim')).toBeNull()
  })
})
