// Q02 (barres progression) + Q06 (rang aventurier) — tests UI sur QuestBoard
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import QuestBoard, { getRankInfo, RANK_TIERS } from './QuestBoard'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  // Évite la modal CharacterCreation
  useGameStore.setState((state) => ({ hero: { ...state.hero, heroNamed: true, name: 'Tester' } }))
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// ── Q06 — getRankInfo (logique pure) ────────────────────────────────────────
describe('Q06 — getRankInfo', () => {
  it('0 token → Copper, début de tier', () => {
    const r = getRankInfo(0)
    expect(r.label).toBe('Copper')
    expect(r.tokensInTier).toBe(0)
    expect(r.pctToNext).toBe(0)
  })

  it('5 tokens → Copper 5/10', () => {
    const r = getRankInfo(5)
    expect(r.label).toBe('Copper')
    expect(r.tokensInTier).toBe(5)
    expect(r.tokensNeededInTier).toBe(10)
    expect(r.pctToNext).toBe(0.5)
  })

  it('10 tokens → Silver début de tier', () => {
    const r = getRankInfo(10)
    expect(r.label).toBe('Silver')
    expect(r.tokensInTier).toBe(0)
  })

  it('25 tokens → Silver 15/20', () => {
    const r = getRankInfo(25)
    expect(r.label).toBe('Silver')
    expect(r.tokensInTier).toBe(15)
    expect(r.tokensNeededInTier).toBe(20)
  })

  it('70 tokens → Platinum début de tier', () => {
    const r = getRankInfo(70)
    expect(r.label).toBe('Platinum')
  })

  it('150 tokens → Diamond, isMax=true', () => {
    const r = getRankInfo(150)
    expect(r.label).toBe('Diamond')
    expect(r.isMax).toBe(true)
    expect(r.pctToNext).toBe(1)
  })

  it('999 tokens → toujours Diamond, isMax=true', () => {
    const r = getRankInfo(999)
    expect(r.isMax).toBe(true)
  })

  it('tokens négatifs → traités comme 0 (Copper)', () => {
    const r = getRankInfo(-5)
    expect(r.label).toBe('Copper')
    expect(r.tokens).toBe(0)
  })

  it('undefined → traité comme 0', () => {
    const r = getRankInfo(undefined)
    expect(r.label).toBe('Copper')
  })

  it('RANK_TIERS exposé pour usage UI/tests externes', () => {
    expect(Array.isArray(RANK_TIERS)).toBe(true)
    expect(RANK_TIERS.length).toBeGreaterThanOrEqual(5)
    expect(RANK_TIERS[0].id).toBe('copper')
  })
})

// ── Q06 — RankBanner (rendu) ─────────────────────────────────────────────────
describe('Q06 — RankBanner dans QuestBoard', () => {
  it('affiche le rang Copper avec 0 tokens', () => {
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText('Copper')).toBeInTheDocument()
  })

  it('affiche Silver avec 15 tokens', () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, reputationTokens: 15 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText('Silver')).toBeInTheDocument()
  })

  it('affiche progressbar avec aria-valuenow correct', () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, reputationTokens: 5 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    const bar = within(banner).getByRole('progressbar')
    // 5/10 = 50%
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
  })

  it("affiche 'MAX' quand Diamond", () => {
    useGameStore.setState((state) => ({ hero: { ...state.hero, reputationTokens: 200 } }))
    render(<QuestBoard />)
    const banner = screen.getByTestId('rank-banner')
    expect(within(banner).getByText(/MAX/)).toBeInTheDocument()
  })
})

// ── Q02 — Barres de progression objectifs ────────────────────────────────────
describe('Q02 — Barres de progression objectifs', () => {
  it("rend une progressbar pour chaque objectif d'une quête active", () => {
    useGameStore.getState().startQuest('first_blood')
    render(<QuestBoard />)
    // first_blood a 1 objectif (kill 5 wolves)
    const bars = screen.getAllByTestId('objective-progress')
    expect(bars.length).toBeGreaterThanOrEqual(1)
  })

  it('aria-valuenow reflète le killCount', () => {
    useGameStore.getState().startQuest('first_blood')
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
    useGameStore.getState().startQuest('first_blood')
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
      world: { ...state.world, completedQuests: ['first_blood'], activeQuests: [] },
    }))
    render(<QuestBoard />)
    // Les progress bars d'objectif sont sur les quêtes non-complétées seulement.
    // first_blood est seul dans completed → 0 bars d'objectifs sur sa carte.
    // Mais d'autres quêtes "available" ont des bars. On vérifie que la quête completed
    // n'a pas de bar dans son card (parent text "First Blood ✓")
    const completedTitle = screen.getByText(/First Blood/)
    const card = completedTitle.closest('div.p-4')
    expect(within(card).queryAllByTestId('objective-progress')).toHaveLength(0)
  })
})
