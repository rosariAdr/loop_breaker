// TEST-COV — couverture fonctionnelle de KnightTrainerPanel (Sir Aldric).
// Rend le panneau avec un vrai store (seed hero/world), exerce les 3 onglets
// (📜 Quests / ⚔ Techniques / 🔥 Train), les branches d'achat de skill (succès /
// or insuffisant / ressource insuffisante / déjà connu), l'entraînement d'Aura,
// l'acceptation + le claim d'une quête, et la surface du MasterBoard local à
// Millhaven (Elyndra / court_mage). onBack = vi.fn().
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import KnightTrainerPanel from './KnightTrainerPanel'
import { useGameStore } from '../../store/gameStore'
import { MASTER_QUESTS } from '../../data/masterQuests'

// Seed de base : héros riche, monde à Greywatch (le lieu FIXE d'Aldric), midi.
// `overrides.world` / `overrides.hero` fusionnent à plat ; `overrides.inventory`
// fusionne dans hero.inventory (or par défaut 5000). `overrides.level` posé après.
function seed(overrides = {}) {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    world: {
      ...s.world,
      currentZone: 'ashenvale',
      currentLocation: 'greywatch',
      tickCount: 12,
      dayCount: 1,
      ...(overrides.world ?? {}),
    },
    hero: {
      ...s.hero,
      level: overrides.level ?? s.hero.level,
      inventory: { ...s.hero.inventory, gold: 5000, ...(overrides.inventory ?? {}) },
    },
  }))
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  seed()
  localStorage.clear()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('KnightTrainerPanel — rendu & onglets', () => {
  it('rend le titre, la citation et démarre sur l’onglet Quêtes', () => {
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.getByText(/Sir Aldric — Knight of Millhaven/)).toBeInTheDocument()
    expect(screen.getByText(/I have fought for twenty years/)).toBeInTheDocument()
    // Les quêtes d'Aldric (giverNpc sir_aldric) sont listées par défaut.
    expect(screen.getByText('Boar Trouble')).toBeInTheDocument() // QSV2-DROPDUP01 — ex-First Blood
    expect(screen.getByText('Proof of Worth')).toBeInTheDocument()
  })

  it('onBack est câblé sur le bouton ← Back', () => {
    const onBack = vi.fn()
    render(<KnightTrainerPanel onBack={onBack} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('bascule vers l’onglet Techniques et affiche les trades d’Aldric', () => {
    // Lieu sans board maître → l'onglet Techniques est la seule source de ces noms.
    seed({ world: { currentLocation: 'ashenvale_forest' } })
    render(<KnightTrainerPanel onBack={() => {}} />)
    fireEvent.click(screen.getByText('⚔ Techniques'))
    expect(screen.getByText('Power Strike')).toBeInTheDocument()
    expect(screen.getByText('Shield Stance')).toBeInTheDocument()
    expect(screen.getByText('Battle Focus')).toBeInTheDocument()
    // Coût affiché avec les ressources (battle_focus : 120g + 3× Wolf Pelt).
    expect(screen.getByText(/3× Wolf Pelt/)).toBeInTheDocument()
  })

  it('bascule vers l’onglet Train et affiche le coût d’entraînement', () => {
    render(<KnightTrainerPanel onBack={() => {}} />)
    fireEvent.click(screen.getByText('🔥 Train'))
    expect(screen.getByText('Combat Training')).toBeInTheDocument()
    expect(screen.getByTestId('train-aura')).toBeInTheDocument()
  })
})

describe('KnightTrainerPanel — onglet Quêtes (accept / claim)', () => {
  it('accepte une quête non démarrée (startQuest + flash)', () => {
    render(<KnightTrainerPanel onBack={() => {}} />)
    const accepts = screen.getAllByText('Accept')
    fireEvent.click(accepts[0])
    // La quête est passée active dans le store.
    expect(useGameStore.getState().world.activeQuests.length).toBeGreaterThan(0)
    expect(screen.getByText(/Quest accepted:/)).toBeInTheDocument()
  })

  it('affiche « In progress » quand une quête est active mais non complétable', () => {
    seed({ world: { activeQuests: ['nc_thin_the_boars'] } }) // QSV2-DROPDUP01 — ex-first_blood
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('affiche « Completed ✓ » pour une quête déjà terminée', () => {
    seed({ world: { completedQuests: ['nc_thin_the_boars'] } })
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.getByText('Completed ✓')).toBeInTheDocument()
  })

  it('permet de réclamer une quête prête (proof_of_worth au niveau 3)', () => {
    seed({ world: { activeQuests: ['proof_of_worth'] }, level: 3 })
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.getByText('Ready to claim!')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Claim'))
    expect(useGameStore.getState().world.completedQuests).toContain('proof_of_worth')
    expect(screen.getByText(/Quest complete!/)).toBeInTheDocument()
  })
})

describe('KnightTrainerPanel — onglet Techniques (achat de skill)', () => {
  // Le bouton d'achat d'un trade = le <button> de sa carte (repéré par nom de skill).
  const learnBtn = (skillName) =>
    screen.getByText(skillName).closest('div.items-center').querySelector('button')

  // Lieu sans board maître pour que les noms de skill soient uniques à l'onglet.
  function openTradesAt(inventory) {
    seed({ world: { currentLocation: 'ashenvale_forest' }, inventory })
    render(<KnightTrainerPanel onBack={() => {}} />)
    fireEvent.click(screen.getByText('⚔ Techniques'))
  }

  it('achète Power Strike (or suffisant) : dépense l’or et ajoute la mana stone', () => {
    openTradesAt({ gold: 5000, resources: {} })
    const goldBefore = useGameStore.getState().hero.inventory.gold
    fireEvent.click(learnBtn('Power Strike'))
    expect(screen.getByText(/Learned: Power Strike!/)).toBeInTheDocument()
    const st = useGameStore.getState().hero
    expect(st.inventory.gold).toBe(goldBefore - 80)
    expect(st.inventory.manaStones.some((s) => s.skillId === 'power_strike')).toBe(true)
  })

  it('consomme aussi les ressources pour Battle Focus (120g + 3× wolf_pelt)', () => {
    openTradesAt({ gold: 5000, resources: { wolf_pelt: 5 } })
    fireEvent.click(learnBtn('Battle Focus'))
    expect(screen.getByText(/Learned: Battle Focus!/)).toBeInTheDocument()
    const st = useGameStore.getState().hero
    expect(st.inventory.resources.wolf_pelt).toBe(2) // 5 - 3
    expect(st.inventory.manaStones.some((s) => s.skillId === 'battle_focus')).toBe(true)
  })

  it('refuse l’achat si l’or est insuffisant (bouton désactivé, or inchangé)', () => {
    openTradesAt({ gold: 10, resources: {} })
    const btn = learnBtn('Power Strike')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(useGameStore.getState().hero.inventory.gold).toBe(10)
  })

  it('refuse Battle Focus si ressources insuffisantes (or ok, wolf_pelt manquants)', () => {
    openTradesAt({ gold: 5000, resources: { wolf_pelt: 1 } })
    const btn = learnBtn('Battle Focus')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(
      useGameStore.getState().hero.inventory.manaStones.some((s) => s.skillId === 'battle_focus'),
    ).toBe(false)
  })

  it('marque « ✓ Known » et grise quand le skill est déjà possédé', () => {
    openTradesAt({
      gold: 5000,
      resources: {},
      manaStones: [{ skillId: 'power_strike', level: 1, xp: 0 }],
    })
    expect(screen.getByText('✓ Known')).toBeInTheDocument()
  })
})

describe('KnightTrainerPanel — onglet Train (Aura)', () => {
  it('entraîne l’Aura quand l’or suffit (spendGold + grantAura)', () => {
    render(<KnightTrainerPanel onBack={() => {}} />)
    fireEvent.click(screen.getByText('🔥 Train'))
    const goldBefore = useGameStore.getState().hero.inventory.gold
    fireEvent.click(screen.getByTestId('train-aura'))
    expect(screen.getByText(/Trained hard! \+5 Aura\./)).toBeInTheDocument()
    const st = useGameStore.getState().hero
    expect(st.inventory.gold).toBe(goldBefore - 120)
    expect(st.aura).toBe(5)
  })

  it('bouton d’entraînement désactivé si l’or est insuffisant', () => {
    seed({ hero: { inventory: undefined } })
    useGameStore.setState((s) => ({
      hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 10, resources: {} } },
    }))
    render(<KnightTrainerPanel onBack={() => {}} />)
    fireEvent.click(screen.getByText('🔥 Train'))
    const btn = screen.getByTestId('train-aura')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(useGameStore.getState().hero.aura).toBe(0)
  })
})

describe('KnightTrainerPanel — MasterBoard local (Millhaven)', () => {
  it('surface le maître fixe de Millhaven (Elyndra / court_mage) sur le board', () => {
    seed({ world: { currentLocation: 'millhaven' } })
    render(<KnightTrainerPanel onBack={() => {}} />)
    const board = screen.getByTestId('master-quests')
    const init = MASTER_QUESTS.master_init_elyndra.name // « The Court Mage’s Wager »
    expect(within(board).getByText(init)).toBeInTheDocument()
    // Pas encore engagé → état « No master ».
    expect(within(board).getByTestId('master-state').textContent).toMatch(/No master/i)
  })

  it('ne rend PAS de board là où aucun maître n’est surfaçable (spot sans maître)', () => {
    seed({ world: { currentLocation: 'ashenvale_forest' } })
    render(<KnightTrainerPanel onBack={() => {}} />)
    expect(screen.queryByTestId('master-quests')).toBeNull()
  })
})
