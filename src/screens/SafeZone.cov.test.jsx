// TEST-COV01 — couverture des panneaux récents encore non testés au niveau rendu :
//   • ChurchPanel — reflète bien la rotation CHQ01 (pool tournant par jour)
//   • AcademyPanel — affiche les « Trials of Mastery » (ACA04)
//   • VilBuilding — chemin de repli (bâtiment sans façade → cadre .bld-frame)
// Déjà couverts ailleurs : venue Guilde/village → gld.test.jsx ; flux e2e PROG
// (kill → quête → équip → level-up) → scenarios.test.js (scénario 1).
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import SafeZone from './SafeZone'
import { useGameStore } from '../store/gameStore'
import { getActiveChurchQuests, CHURCH_ROTATION_DAYS } from '../data/churchQuests'
import { MASTER_QUESTS } from '../data/masterQuests'

// Ironhaven = ville (tous les bâtiments à panneau) ; midi → bâtiments ouverts.
function enterCity(dayCount = 1) {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    currentScreen: 'safe_zone',
    world: {
      ...s.world,
      currentZone: 'ashenvale',
      currentLocation: 'ironhaven',
      tickCount: 12,
      dayCount,
    },
    hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 5000 } },
  }))
  localStorage.clear()
}

afterEach(cleanup)

describe('TEST-COV01 — ChurchPanel reflète la rotation CHQ01', () => {
  function openChurchQuestsPanel(dayCount) {
    enterCity(dayCount)
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText('Church of the Old Gods')[0]) // tuile → PNJ
    fireEvent.click(screen.getByText(/Enter the Church/)) // entre dans le panneau
    return screen.getByTestId('church-quests')
  }

  it('affiche toutes les quêtes du pool tournant du jour', () => {
    const day = 1
    const panel = openChurchQuestsPanel(day)
    for (const q of getActiveChurchQuests(day)) {
      expect(within(panel).getByText(q.name)).toBeInTheDocument()
    }
  })

  it('un autre bloc de rotation affiche un pool différent', () => {
    const block0 = new Set(getActiveChurchQuests(1).map((q) => q.id))
    const laterDay = CHURCH_ROTATION_DAYS + 1
    const uniqueToBlock1 = getActiveChurchQuests(laterDay).filter((q) => !block0.has(q.id))
    // garde-fou : la rotation produit bien au moins une quête neuve dans le bloc suivant
    expect(uniqueToBlock1.length).toBeGreaterThan(0)

    const panel = openChurchQuestsPanel(laterDay)
    // le panneau au bloc suivant montre une quête absente du bloc 0
    expect(within(panel).getByText(uniqueToBlock1[0].name)).toBeInTheDocument()
  })
})

describe('TEST-COV01 — AcademyPanel : Trials of Mastery (ACA04)', () => {
  it('affiche la section et au moins une épreuve disponible', () => {
    enterCity()
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText('Academy of Magic')[0]) // tuile → PNJ
    fireEvent.click(screen.getByText(/Enter the Academy/)) // entre dans le panneau

    expect(screen.getByText(/Trials of Mastery/)).toBeInTheDocument()
    const trials = screen.getByTestId('master-quests')
    const firstMaster = Object.values(MASTER_QUESTS)[0]
    expect(within(trials).getByText(firstMaster.name)).toBeInTheDocument()
  })
})

describe('TEST-COV01 — VilBuilding : chemin de repli (sans façade)', () => {
  it('une ville rend à la fois une façade (.bld-facade) et un cadre de repli (.bld-frame)', () => {
    enterCity()
    const { container } = render(<SafeZone />)
    // façade : bâtiments avec asset (inn/church/…)
    expect(container.querySelector('.bld-facade')).not.toBeNull()
    // repli : bâtiments hors BLD_FACADES (académie/guilde/maîtres) → cadre légendé
    expect(container.querySelector('.bld-frame')).not.toBeNull()
  })
})
