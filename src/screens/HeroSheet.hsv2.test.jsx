// HSV2-01→05 — HeroSheet V2 : avatar en tête, barres uniformes, Aura/Concentration dans les
// attributs (masquées si verrouillées), repères de palier /35, plus de cooldown affiché.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'

const cdSkillId = Object.keys(SKILLS).find((k) => (SKILLS[k].cooldown ?? 0) > 0)

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'hero_sheet',
    hero: { ...s.hero, activeSkills: [{ skillId: cdSkillId, level: 1, xp: 0 }] },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('HSV2-01 — avatar en tête de colonne', () => {
  it("l'avatar est rendu (img) et placé AVANT le bloc Allegiance", () => {
    render(<HeroSheet />)
    const avatar = screen.getByTestId('hero-avatar')
    expect(avatar.querySelector('img')).toBeTruthy()
    const allegiance = screen.getByText('Allegiance')
    // avatar précède Allegiance dans l'ordre du document
    expect(
      avatar.compareDocumentPosition(allegiance) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})

describe('HSV2-02 — barres vitales uniformes', () => {
  it('les 4 vitales (HP/Mana/Vigor/Experience) sont rendues avec une barre', () => {
    render(<HeroSheet />)
    for (const v of ['hp', 'mana', 'vigor', 'experience']) {
      const row = screen.getByTestId(`vital-${v}`)
      expect(row.querySelector('.hvb-bar')).toBeTruthy()
    }
  })
})

describe('HSV2-03 — Aura & Concentration dans les attributs, masquées si verrouillées', () => {
  it('verrouillées (aura/conc = 0) → nom masqué « ??? »', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, aura: 0, concentration: 0 } }))
    render(<HeroSheet />)
    expect(within(screen.getByTestId('vital-aura')).getByText('???')).toBeInTheDocument()
    expect(within(screen.getByTestId('vital-concentration')).getByText('???')).toBeInTheDocument()
  })

  it('débloquées → nom réel affiché', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, aura: 5, concentration: 40 } }))
    render(<HeroSheet />)
    expect(within(screen.getByTestId('vital-aura')).getByText('Aura')).toBeInTheDocument()
    expect(
      within(screen.getByTestId('vital-concentration')).getByText('Concentration'),
    ).toBeInTheDocument()
  })
})

describe('HSV2-04 — repères de palier /35 sur les attributs', () => {
  it('nb de repères = floor(valeur / 35)', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, strength: 80 } },
    }))
    render(<HeroSheet />)
    const row = screen.getByText('Strength').closest('.attr-row')
    expect(within(row).getAllByTestId('stat-milestone')).toHaveLength(2) // 80 → 35,70
  })

  it('valeur < 35 → aucun repère', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, intelligence: 10 } },
    }))
    render(<HeroSheet />)
    const row = screen.getByText('Intelligence').closest('.attr-row')
    expect(within(row).queryAllByTestId('stat-milestone')).toHaveLength(0)
  })

  it('HSV2-06 — le repère porte le libellé du perk (STAT_MILESTONES)', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, stats: { ...s.hero.stats, strength: 40 } },
    }))
    render(<HeroSheet />)
    const row = screen.getByText('Strength').closest('.attr-row')
    const tick = within(row).getAllByTestId('stat-milestone')[0]
    expect(tick.getAttribute('title')).toContain('physical damage')
  })
})

describe("HSV2-05 — cooldown retiré de l'affichage des skills", () => {
  it('aucun « CD Xt » rendu même pour un skill avec cooldown', () => {
    render(<HeroSheet />)
    expect(screen.queryByText(/CD\s*\d+t/)).toBeNull()
  })
})
