// HeroSheet — rendu enrichi : déité + skills + debuffs (branches d'affichage)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'
import { DEBUFFS } from '../data/debuffs'

const activeSkillId = Object.keys(SKILLS).find((k) => SKILLS[k].type === 'active')
const passiveSkillId = Object.keys(SKILLS).find((k) => SKILLS[k].type === 'passive')
const debuffId = Object.keys(DEBUFFS)[0]

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'hero_sheet',
    hero: {
      ...s.hero,
      deity: 'ignareth',
      deityBlessing: { description: '+20% Attack' },
      divineSkill: { skillId: 'inferno_strike', level: 2, xp: 0 },
      activeSkills: [{ skillId: activeSkillId, level: 1, xp: 0 }],
      passiveSkills: passiveSkillId ? [{ skillId: passiveSkillId, level: 1, xp: 0 }] : [],
      activeDebuffs: [{ debuffId, duration: { remaining: 5 }, permanent: false }],
    },
  }))
  localStorage.clear()
})
afterEach(cleanup)

describe('HeroSheet — affichage enrichi', () => {
  it('affiche la déité et sa bénédiction', () => {
    render(<HeroSheet />)
    expect(screen.getAllByText(/Ignareth/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/\+20% Attack/)).toBeInTheDocument()
  })

  it('affiche les skills actifs équipés', () => {
    render(<HeroSheet />)
    expect(screen.getByText(SKILLS[activeSkillId].name)).toBeInTheDocument()
  })

  it('affiche les debuffs actifs (CRF05)', () => {
    render(<HeroSheet />)
    expect(screen.getByTestId('active-debuffs')).toBeInTheDocument()
    expect(screen.getByText(DEBUFFS[debuffId].name)).toBeInTheDocument()
    expect(screen.getByText(/5d left/)).toBeInTheDocument()
  })
})
