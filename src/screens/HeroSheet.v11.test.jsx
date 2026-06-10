// HeroSheet v1.1 — HS-VITALS01 / HS-AURA01 / HS-CURR01 / HS-DEITY01 / HS-SKILLS01
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'

const activeSkillId = Object.keys(SKILLS).find((k) => SKILLS[k].type === 'active')

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ currentScreen: 'hero_sheet' })
  localStorage.clear()
})
afterEach(cleanup)

describe('HeroSheet — HS-VITALS01 (barres de vitales)', () => {
  it('rend des barres HP / Mana / Vigor / Exp avec valeur et jauge', () => {
    render(<HeroSheet />)
    const hp = screen.getByTestId('vital-hp')
    expect(hp).toBeInTheDocument()
    expect(hp.textContent).toMatch(/100\/100/)
    expect(hp.querySelector('i')).not.toBeNull() // la jauge (fill)
    expect(screen.getByTestId('vital-mana')).toBeInTheDocument()
    expect(screen.getByTestId('vital-vigor')).toBeInTheDocument()
    expect(screen.getByTestId('vital-experience')).toBeInTheDocument()
  })
})

describe('HeroSheet — HS-AURA01 (aura/concentration floutées + 🔒)', () => {
  it('verrouillées quand à 0 : toujours visibles, classe hvb-locked + 🔒', () => {
    render(<HeroSheet />) // reset → aura 0, concentration 0
    const aura = screen.getByTestId('vital-aura')
    expect(aura).toBeInTheDocument()
    expect(aura.className).toMatch(/hvb-locked/)
    expect(aura.textContent).toContain('🔒')
    expect(screen.getByTestId('vital-concentration').className).toMatch(/hvb-locked/)
  })

  it('aura débloquée (>0) → plus de verrou, valeur affichée', () => {
    useGameStore.setState((s) => ({ hero: { ...s.hero, aura: 6 } }))
    render(<HeroSheet />)
    const aura = screen.getByTestId('vital-aura')
    expect(aura.className).not.toMatch(/hvb-locked/)
    expect(aura.textContent).toMatch(/\+3\.0% dmg/)
  })
})

describe('HeroSheet — HS-CURR01 (Currencies)', () => {
  it('affiche « Currencies » (plus « Provisions ») et retire la carte « Run »', () => {
    render(<HeroSheet />)
    expect(screen.getByText('Currencies')).toBeInTheDocument()
    expect(screen.queryByText('Provisions')).toBeNull()
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.queryByText('Run')).toBeNull() // plus de libellé « Run »
  })
})

describe('HeroSheet — HS-DEITY01 (déité en colonne gauche)', () => {
  it('le bloc Allegiance est dans la colonne gauche', () => {
    const { container } = render(<HeroSheet />)
    const left = container.querySelector('.hs-left')
    expect(left).not.toBeNull()
    expect(left.textContent).toContain('Allegiance')
  })
})

describe('HeroSheet — HS-SKILLS01 (grille 2/ligne)', () => {
  it('les skills actifs sont rendus dans une grille .skill-grid', () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, activeSkills: [{ skillId: activeSkillId, level: 1, xp: 0 }] },
    }))
    const { container } = render(<HeroSheet />)
    expect(container.querySelector('.skill-grid')).not.toBeNull()
  })
})
