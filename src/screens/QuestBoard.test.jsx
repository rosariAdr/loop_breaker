// Q02 (barres progression) + Q06 (rang aventurier) — tests UI sur QuestBoard
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react'
import QuestBoard from './QuestBoard'
import { getRankInfo, RANK_TIERS } from '../data/ranks'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  // Évite la modal CharacterCreation ; place le héros en VILLE (START01 démarre à
  // Greywatch/village : ces tests exercent le board complet de la Guilde d'Ironhaven).
  useGameStore.setState((state) => ({
    hero: { ...state.hero, heroNamed: true, name: 'Tester' },
    world: { ...state.world, currentLocation: 'ironhaven', currentNode: 'ironhaven' },
  }))
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// ── Q06 — getRankInfo (logique pure) ────────────────────────────────────────
describe('FIX-QRANK01 — getRankInfo (échelle 10 paliers, rankPoints)', () => {
  it('0 point → Aluminium, début de tier', () => {
    const r = getRankInfo(0)
    expect(r.label).toBe('Aluminium')
    expect(r.tokensInTier).toBe(0)
    expect(r.pctToNext).toBe(0)
  })

  it('5 points → Aluminium 5/10', () => {
    const r = getRankInfo(5)
    expect(r.label).toBe('Aluminium')
    expect(r.tokensInTier).toBe(5)
    expect(r.tokensNeededInTier).toBe(10)
    expect(r.pctToNext).toBe(0.5)
  })

  it('10 points → Fer début de tier', () => {
    const r = getRankInfo(10)
    expect(r.label).toBe('Iron')
    expect(r.tokensInTier).toBe(0)
  })

  it('30 points → Bronze 5/20', () => {
    const r = getRankInfo(30)
    expect(r.label).toBe('Bronze')
    expect(r.tokensInTier).toBe(5)
    expect(r.tokensNeededInTier).toBe(20)
  })

  it('45 → Argent ; 100 → Or', () => {
    expect(getRankInfo(45).label).toBe('Silver')
    expect(getRankInfo(100).label).toBe('Gold')
  })

  it('350 points → Suprême, isMax=true', () => {
    const r = getRankInfo(350)
    expect(r.label).toBe('Supreme')
    expect(r.isMax).toBe(true)
    expect(r.pctToNext).toBe(1)
  })

  it('999 points → toujours Suprême, isMax=true', () => {
    expect(getRankInfo(999).isMax).toBe(true)
  })

  it('points négatifs → traités comme 0 (Aluminium)', () => {
    const r = getRankInfo(-5)
    expect(r.label).toBe('Aluminium')
    expect(r.tokensInTier).toBe(0)
  })

  it('undefined → traité comme 0', () => {
    expect(getRankInfo(undefined).label).toBe('Aluminium')
  })

  it('RANK_TIERS = 10 paliers (Aluminium → Suprême)', () => {
    expect(Array.isArray(RANK_TIERS)).toBe(true)
    expect(RANK_TIERS.length).toBe(10)
    expect(RANK_TIERS[0].id).toBe('aluminium')
    expect(RANK_TIERS[RANK_TIERS.length - 1].id).toBe('supreme')
  })
})

// ── FIX-QRANK01 — RankBanner (rendu, piloté par rankPoints) ──────────────────
describe('FIX-QRANK01 — RankBanner dans QuestBoard', () => {
  it('affiche Aluminium avec 0 point', () => {
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText('Aluminium')).toBeInTheDocument()
  })

  it('affiche Bronze avec 30 points de rang', () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, rankPoints: 30 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText('Bronze')).toBeInTheDocument()
  })

  it('progressbar aria-valuenow correct (5/10 = 50%)', () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, rankPoints: 5 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    const bar = within(banner).getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
  })

  it("affiche 'MAX' au palier Suprême", () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, rankPoints: 400 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText(/MAX/)).toBeInTheDocument()
  })
})

// ── Q02 — Barres de progression objectifs ────────────────────────────────────
describe('Q02 — Barres de progression objectifs', () => {
  it("rend une progressbar pour chaque objectif d'une quête active", () => {
    // QSV2-DROPDUP01 — mq01_waking (5 wolves) remplace first_blood (retirée)
    useGameStore.getState().startQuest('mq01_waking')
    render(<QuestBoard />)
    // mq01_waking a 1 objectif (kill 5 wolves)
    const bars = screen.getAllByTestId('objective-progress')
    expect(bars.length).toBeGreaterThanOrEqual(1)
  })

  it('aria-valuenow reflète le killCount', () => {
    useGameStore.getState().startQuest('mq01_waking')
    useGameStore.setState((state) => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 3 } },
    }))
    render(<QuestBoard />)
    const bars = screen.getAllByTestId('objective-progress')
    const wolfBar = bars.find((b) => b.getAttribute('aria-valuenow') === '3')
    expect(wolfBar).toBeDefined()
    expect(wolfBar.getAttribute('aria-valuemax')).toBe('5')
  })

  it('aria-valuenow saturé à valuemax si over-kill', () => {
    useGameStore.getState().startQuest('mq01_waking')
    useGameStore.setState((state) => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 99 } },
    }))
    render(<QuestBoard />)
    const bars = screen.getAllByTestId('objective-progress')
    const completedBar = bars.find((b) => b.getAttribute('aria-valuenow') === '5')
    expect(completedBar).toBeDefined()
  })

  it('pas de progressbar pour les quêtes complétées', () => {
    useGameStore.setState((state) => ({
      world: { ...state.world, completedQuests: ['nc_thin_the_boars'], activeQuests: [] },
    }))
    render(<QuestBoard />)
    // FIX-QCOMPLETED-COLLAPSE01 — la section « Completed » est repliée par défaut : on la déplie.
    fireEvent.click(screen.getByTestId('collapsible-header'))
    // Les progress bars d'objectif sont sur les quêtes non-complétées seulement.
    // nc_thin_the_boars est seule dans completed → 0 bars d'objectifs sur sa carte.
    const completedTitle = screen.getByText(/Boar Trouble/)
    const card = completedTitle.closest('div.p-4')
    expect(within(card).queryAllByTestId('objective-progress')).toHaveLength(0)
  })
})

// ── FIX-QXP01 / FIX-QRANK01 — balance injectée, visible sur le board (intégration) ──────────
describe('FIX-QXP01/QRANK01 — chips XP + rang injectés sur le board', () => {
  it("une quête autorée affiche l'XP et les points de rang injectés (The Waking → +40 XP / +1 rang)", () => {
    useGameStore.setState((state) => ({
      world: { ...state.world, currentLocation: 'greywatch', currentNode: 'greywatch' },
    }))
    render(<QuestBoard />)
    const card = screen.getByText('The Waking').closest('div.p-4')
    expect(within(card).getByText('+40 XP')).toBeInTheDocument() // QUEST_BALANCE.mq01_waking.xp
    expect(within(card).getByText('+1 rank')).toBeInTheDocument() // QUEST_BALANCE.mq01_waking.rankPoints
  })

  it('le rang affiché suit la nouvelle échelle 10 paliers (Aluminium → Fer au départ)', () => {
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText('Aluminium')).toBeInTheDocument()
    expect(within(banner).getByText(/to Iron/)).toBeInTheDocument()
  })
})
