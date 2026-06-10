// T07b — Tests sélection skill bonus + helper getBonusSkillPool
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import GodsShop, { getBonusSkillPool } from './GodsShop'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  // GodsShop nécessite un pendingInheritance pour confirmer la transmigration
  useGameStore.setState((state) => ({
    meta: {
      ...state.meta,
      pendingInheritance: { stat: 'strength', activeSkill: null, passiveSkill: null, bonuses: [] },
      lastRunSummary: { reputationTokens: 100, skills: [] },
    },
    hero: { ...state.hero, reputationTokens: 100 },
  }))
})

afterEach(cleanup)

// ── Helper pur ───────────────────────────────────────────────────────────────
describe('getBonusSkillPool — T07b', () => {
  it('run sans skills → fallback 3 skills basiques Zone 1', () => {
    const pool = getBonusSkillPool({ skills: [] })
    expect(pool.length).toBe(3)
    expect(pool.map((s) => s.skillId)).toContain('power_strike')
  })

  it('lastRunSummary null → fallback', () => {
    const pool = getBonusSkillPool(null)
    expect(pool.length).toBe(3)
  })

  it('utilise les skills du run précédent si présents', () => {
    const pool = getBonusSkillPool({
      skills: [
        { skillId: 'cleave', level: 2, xp: 0 },
        { skillId: 'iron_resolve', level: 1, xp: 0 },
      ],
    })
    expect(pool.map((s) => s.skillId)).toEqual(['cleave', 'iron_resolve'])
  })

  it('dédoublonne par skillId', () => {
    const pool = getBonusSkillPool({
      skills: [
        { skillId: 'cleave', level: 1, xp: 0 },
        { skillId: 'cleave', level: 2, xp: 0 },
      ],
    })
    expect(pool.length).toBe(1)
  })

  it('enrichit avec le type du skill', () => {
    const pool = getBonusSkillPool({ skills: [{ skillId: 'savage_bite', level: 1, xp: 0 }] })
    expect(pool[0].type).toBeDefined()
  })

  it('ignore les skillId inconnus', () => {
    const pool = getBonusSkillPool({ skills: [{ skillId: 'ghost_skill', level: 1, xp: 0 }] })
    expect(pool.length).toBe(0)
  })
})

// ── UI ───────────────────────────────────────────────────────────────────────
describe('GodsShop — T07b sélecteur skill bonus', () => {
  it("le sélecteur n'apparaît PAS tant que bonus_skill non acheté", () => {
    render(<GodsShop />)
    expect(screen.queryByTestId('bonus-skill-selector')).toBeNull()
  })

  it('le sélecteur apparaît après achat du Bonus Skill Slot', () => {
    render(<GodsShop />)
    // Trouver le bouton d'achat du bonus_skill (coût 50)
    const bonusSkillRow = screen.getByText('Bonus Skill Slot').closest('div')
    const buyBtn = bonusSkillRow.parentElement.querySelector('button')
    fireEvent.click(buyBtn)
    expect(screen.getByTestId('bonus-skill-selector')).toBeInTheDocument()
  })

  it('affiche les options de la pool (fallback 3 skills)', () => {
    render(<GodsShop />)
    const bonusSkillRow = screen.getByText('Bonus Skill Slot').closest('div')
    const buyBtn = bonusSkillRow.parentElement.querySelector('button')
    fireEvent.click(buyBtn)
    // 3 skills fallback → Power Strike présent
    expect(screen.getByText(/Power Strike/)).toBeInTheDocument()
  })
})
