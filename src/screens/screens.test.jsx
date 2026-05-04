// Tests UI complets sur tous les écrans : rendu, navigation, layouts.
// Catch les bugs de layout (largeurs, max-w accidentels) et de navigation.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { useGameStore } from '../store/gameStore'

import App from '../App'
import HeroSheet from './HeroSheet'
import Inventory from './Inventory'
import WorldMap from './WorldMap'
import QuestBoard from './QuestBoard'
import PostMortem from './PostMortem'
import CharacterCreation from './CharacterCreation'
import LevelUpModal from './LevelUpModal'

beforeEach(() => {
  useGameStore.getState().resetGame()
  // Évite la modal CharacterCreation pour les tests qui ne la concernent pas
  useGameStore.setState(state => ({ hero: { ...state.hero, heroNamed: true, name: 'Tester' } }))
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
})

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests : chaque écran monte sans crasher
// ─────────────────────────────────────────────────────────────────────────────
describe('Smoke tests — montage de chaque écran', () => {
  it('App monte sans crasher', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('HeroSheet monte', () => {
    render(<HeroSheet />)
    expect(screen.getByText(useGameStore.getState().hero.name)).toBeInTheDocument()
  })

  it('Inventory monte', () => {
    render(<Inventory />)
    expect(screen.getByText('Inventory')).toBeInTheDocument()
  })

  it('WorldMap monte', () => {
    render(<WorldMap />)
    // WorldMap affiche au moins une zone
    expect(screen.queryAllByText(/Ashenvale|Grimspire/).length).toBeGreaterThan(0)
  })

  it('QuestBoard monte', () => {
    render(<QuestBoard />)
    expect(screen.getByText('Quest Board')).toBeInTheDocument()
  })

  it('PostMortem monte si lastRunSummary existe', () => {
    useGameStore.setState(state => ({
      meta: {
        ...state.meta,
        lastRunSummary: {
          cause: 'Test cause',
          zone: 'ashenvale',
          day: 5,
          level: 3,
          skills: [],
          stats: { strength: 10, agility: 10, intelligence: 8, chance: 5, def: 5 },
          totalKills: 12,
          reputationTokens: 4,
        },
      },
    }))
    render(<PostMortem />)
    expect(screen.getByText('☠ Fallen')).toBeInTheDocument()
  })

  it('CharacterCreation monte', () => {
    render(<CharacterCreation />)
    expect(screen.getByText(/The Wanderer Awakes/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your name/)).toBeInTheDocument()
  })

  it('LevelUpModal monte avec pendingLevelUp > 0', () => {
    useGameStore.setState({ pendingLevelUp: 1 })
    render(<LevelUpModal />)
    expect(screen.getByText(/Level Up!/)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Navigation : tous les chemins entre écrans
// ─────────────────────────────────────────────────────────────────────────────
describe('Navigation entre écrans', () => {
  it('NavBar : bouton "Map" → setScreen world_map', () => {
    useGameStore.getState().setScreen('hero_sheet')
    render(<App />)
    fireEvent.click(screen.getByText('Map'))
    expect(useGameStore.getState().currentScreen).toBe('world_map')
  })

  it('NavBar : bouton "Hero" → setScreen hero_sheet', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Hero'))
    expect(useGameStore.getState().currentScreen).toBe('hero_sheet')
  })

  it('NavBar : bouton "Bag" → setScreen inventory (BUG check)', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Bag'))
    expect(useGameStore.getState().currentScreen).toBe('inventory')
  })

  it('Inventory : bouton "← Map" retourne à world_map', () => {
    useGameStore.getState().setScreen('inventory')
    render(<Inventory />)
    fireEvent.click(screen.getByText('← Map'))
    expect(useGameStore.getState().currentScreen).toBe('world_map')
  })

  it('HeroSheet : bouton sidebar 🎒 Inventory → inventory', () => {
    render(<HeroSheet />)
    const invButton = screen.getByText(/🎒 Inventory/)
    fireEvent.click(invButton)
    expect(useGameStore.getState().currentScreen).toBe('inventory')
  })

  it('HeroSheet : bouton "← Map" → world_map', () => {
    useGameStore.getState().setScreen('hero_sheet')
    render(<HeroSheet />)
    fireEvent.click(screen.getByText('← Map'))
    expect(useGameStore.getState().currentScreen).toBe('world_map')
  })

  it("CharacterCreation bloque l'accès aux autres écrans tant qu'on n'a pas confirmé", () => {
    // Reset heroNamed à false pour forcer CharacterCreation
    useGameStore.setState(state => ({ hero: { ...state.hero, heroNamed: false, name: 'The Wanderer' } }))
    render(<App />)
    // CharacterCreation doit être visible
    expect(screen.getByText(/The Wanderer Awakes/)).toBeInTheDocument()
  })

  it('CharacterCreation : valider un nom débloque les écrans', () => {
    useGameStore.setState(state => ({ hero: { ...state.hero, heroNamed: false, name: 'The Wanderer' } }))
    render(<App />)
    fireEvent.click(screen.getByText(/Begin the Journey/))
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// HeroSheet : layout (BUG largeur signalé)
// ─────────────────────────────────────────────────────────────────────────────
describe('HeroSheet — layout', () => {
  it("le contenu principal n'a PAS de max-w-2xl (qui le limiterait à 672px)", () => {
    const { container } = render(<HeroSheet />)
    // Le div flex-1 principal ne doit pas avoir max-w-2xl (le bug d'origine)
    const mainContent = container.querySelector('.flex-1.flex.flex-col')
    expect(mainContent).not.toBeNull()
    expect(mainContent.className).not.toMatch(/max-w-2xl/)
  })

  it('affiche les 4 slots d\'équipement', () => {
    render(<HeroSheet />)
    // Les 4 slots sont rendus en uppercase
    expect(screen.getAllByText(/weapon|helmet|armor|boots/i).length).toBeGreaterThanOrEqual(4)
  })

  it('affiche les sections Stats / Equipment / Skills', () => {
    render(<HeroSheet />)
    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText(/Active Skills/)).toBeInTheDocument()
    expect(screen.getByText(/Passive Skills/)).toBeInTheDocument()
  })

  it('affiche la sidebar avec gold/tokens/run', () => {
    render(<HeroSheet />)
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.getByText('Run')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Inventory : navigation et tabs
// ─────────────────────────────────────────────────────────────────────────────
describe('Inventory — tabs et accès', () => {
  it('affiche les 4 onglets', () => {
    render(<Inventory />)
    expect(screen.getByText(/Mana Stones/)).toBeInTheDocument()
    expect(screen.getByText(/Equipment/)).toBeInTheDocument()
    expect(screen.getByText(/Consumables/)).toBeInTheDocument()
    expect(screen.getByText(/Resources/)).toBeInTheDocument()
  })

  it('tab Skills par défaut', () => {
    render(<Inventory />)
    // Sans manaStones, le message vide doit être affiché
    expect(screen.getByText(/No mana stones in bag/)).toBeInTheDocument()
  })

  it('clic sur Equipment tab affiche le contenu équipement', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    expect(screen.getByText(/No equipment in bag/)).toBeInTheDocument()
  })

  it('clic sur Consumables tab', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Consumables/))
    expect(screen.getByText(/No consumables/)).toBeInTheDocument()
  })

  it('clic sur Resources tab', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Resources/))
    expect(screen.getByText(/No resources yet/)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Inventory > SkillsTab : flow d'équipement (BUG signalé)
// ─────────────────────────────────────────────────────────────────────────────
describe('Inventory — flow équipement skill', () => {
  beforeEach(() => {
    // Ajoute des mana stones dans l'inventaire
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().addSkillToInventory({ skillId: 'iron_resolve', level: 1, xp: 0 })
  })

  it('affiche les mana stones dans la liste', () => {
    render(<Inventory />)
    // savage_bite et iron_resolve doivent apparaître par leurs noms
    // (les noms exacts viennent de SKILLS data)
    const skillButtons = screen.getAllByRole('button')
    expect(skillButtons.length).toBeGreaterThan(0)
  })

  it('hint "← Click a mana stone..." visible quand rien n\'est sélectionné', () => {
    render(<Inventory />)
    expect(screen.getByText(/Click a mana stone/)).toBeInTheDocument()
  })

  it("clic sur une stone affiche le panneau détail avec bouton Equip", () => {
    const { container } = render(<Inventory />)
    // Trouve le premier bouton dans la liste de stones
    const stoneList = container.querySelector('.flex.gap-4 > .flex-1')
    const firstStone = within(stoneList).getAllByRole('button')[0]
    fireEvent.click(firstStone)

    // Le bouton Equip apparaît
    const equipBtn = screen.queryByText(/Equip \(Active\)|Equip \(Passive\)/)
    expect(equipBtn).not.toBeNull()
  })

  it('clic sur Equip déplace la stone dans activeSkills', () => {
    const { container } = render(<Inventory />)
    const stoneList = container.querySelector('.flex.gap-4 > .flex-1')
    const firstStone = within(stoneList).getAllByRole('button')[0]
    fireEvent.click(firstStone)

    const equipBtn = screen.getByText(/Equip \(Active\)|Equip \(Passive\)/)
    fireEvent.click(equipBtn)

    const state = useGameStore.getState()
    const total = state.hero.activeSkills.length + state.hero.passiveSkills.length
    expect(total).toBe(1)
    expect(state.hero.inventory.manaStones).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Inventory > EquipmentTab : flow d'équipement
// ─────────────────────────────────────────────────────────────────────────────
describe('Inventory — flow équipement item', () => {
  beforeEach(() => {
    useGameStore.getState().addEquipmentToInventory({
      instanceId: 'test_sword',
      templateId: 'iron_sword',
      name: 'Iron Sword',
      slot: 'weapon',
      rarity: 'common',
      stats: { strength: 5 },
      sellPrice: 20,
    })
  })

  it("affiche l'item dans le tab Equipment", () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    expect(screen.getByText('Iron Sword')).toBeInTheDocument()
  })

  it('clic sur l\'item → détail avec bouton Equip', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Iron Sword'))
    expect(screen.getByText('Equip')).toBeInTheDocument()
    expect(screen.getByText(/Sell 20g/)).toBeInTheDocument()
  })

  it('clic sur Equip déplace dans hero.equipped', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Iron Sword'))
    fireEvent.click(screen.getByText('Equip'))
    expect(useGameStore.getState().hero.equipped.weapon?.instanceId).toBe('test_sword')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Régression : Inventory ne doit pas crasher avec une vieille save (sans equipment/equipped)
// ─────────────────────────────────────────────────────────────────────────────
describe('Inventory — régression vieille save (bug user)', () => {
  it("monte sans crasher après loadGame d'une save sans inventory.equipment", () => {
    // Reproduit la save du user qui a crashé
    const oldSave = {
      hero: {
        name: 'OldHero',
        stats: { hp: 100, maxHp: 121, mana: 73, maxMana: 73, strength: 10, agility: 10, intelligence: 8, chance: 5, def: 5 },
        level: 3, exp: 149, expToNext: 225,
        activeSkills: [],
        passiveSkills: [],
        deity: 'sylvara',
        divineSkill: { skillId: 'healing_bloom', level: 1, xp: 0 },
        titles: [],
        // ← pas de equipped, pas de inventory.equipment (vieille save)
        inventory: {
          resources: { rotten_flesh: 30 },
          consumables: {},
          manaStones: [{ skillId: 'counter_strike', level: 1, xp: 0 }],
          gold: 58,
        },
        battleLog: [],
        combatEntryLog: [],
        runNumber: 1,
        deathCount: 0,
        reputationTokens: 2,
      },
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
    }
    localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
    useGameStore.getState().loadGame()

    // Doit monter sans throw
    expect(() => render(<Inventory />)).not.toThrow()
    // Le tab "Equipment (0)" doit s'afficher (pas de crash sur .length)
    expect(screen.getByText(/Equipment \(0\)/)).toBeInTheDocument()
    expect(screen.getByText(/Mana Stones \(1\)/)).toBeInTheDocument()
  })

  it('clic sur le tab Equipment ne crashe pas', () => {
    // Save sans equipment + sans manaStones non plus
    const oldSave = {
      hero: {
        ...useGameStore.getState().hero,
        inventory: { resources: {}, consumables: {}, gold: 0 },  // ni equipment ni manaStones
      },
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
    }
    delete oldSave.hero.equipped
    localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
    useGameStore.getState().loadGame()

    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment \(0\)/))
    expect(screen.getByText(/No equipment in bag/)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// QuestBoard : rendu des quêtes
// ─────────────────────────────────────────────────────────────────────────────
describe('QuestBoard — affichage quêtes', () => {
  it('affiche au moins une quête disponible (sir_aldric a 3 quêtes)', () => {
    render(<QuestBoard />)
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('First Blood')).toBeInTheDocument()
  })

  it('affiche le NPC donneur sur chaque quête (Q08)', () => {
    render(<QuestBoard />)
    // sir_aldric (titre = Knight of Millhaven)
    expect(screen.getAllByText(/Knight of Millhaven/).length).toBeGreaterThan(0)
  })

  it('affiche les nouvelles quêtes Q03 (boss)', () => {
    render(<QuestBoard />)
    expect(screen.getByText('Silence the Crypt')).toBeInTheDocument()
    expect(screen.getByText('Storm the Citadel')).toBeInTheDocument()
    expect(screen.getByText('End the Demon')).toBeInTheDocument()
  })

  it('affiche les nouvelles quêtes Q08 (greywatch)', () => {
    render(<QuestBoard />)
    expect(screen.getByText('Bog Purge')).toBeInTheDocument()
    expect(screen.getByText('Cleanse the Ruins')).toBeInTheDocument()
  })

  it('clic sur Accept ajoute la quête aux activeQuests', () => {
    render(<QuestBoard />)
    const acceptButtons = screen.getAllByText('Accept')
    fireEvent.click(acceptButtons[0])
    expect(useGameStore.getState().world.activeQuests.length).toBeGreaterThan(0)
  })

  it('section Active apparaît après acceptation', () => {
    useGameStore.getState().startQuest('first_blood')
    render(<QuestBoard />)
    expect(screen.getByText(/Active \(1\)/)).toBeInTheDocument()
  })

  it('bouton "← Inn" → safe_zone', () => {
    render(<QuestBoard />)
    fireEvent.click(screen.getByText('← Inn'))
    expect(useGameStore.getState().currentScreen).toBe('safe_zone')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// LevelUpModal : flow complet
// ─────────────────────────────────────────────────────────────────────────────
describe('LevelUpModal — flow', () => {
  beforeEach(() => {
    useGameStore.setState({ pendingLevelUp: 1 })
  })

  it('clic sur une stat la sélectionne', () => {
    render(<LevelUpModal />)
    fireEvent.click(screen.getByText('Strength'))
    // Le bouton Confirm doit devenir actif
    const confirmBtn = screen.getByText(/Confirm & Continue/)
    expect(confirmBtn).not.toBeDisabled()
  })

  it("Confirm sans choix ne fait rien", () => {
    render(<LevelUpModal />)
    const confirmBtn = screen.getByText(/Confirm & Continue/)
    expect(confirmBtn).toBeDisabled()
  })

  it("Confirm avec choix applique le bonus + clear pendingLevelUp", () => {
    const before = useGameStore.getState().hero.stats.strength
    render(<LevelUpModal />)
    fireEvent.click(screen.getByText('Strength'))
    fireEvent.click(screen.getByText(/Confirm & Continue/))
    expect(useGameStore.getState().hero.stats.strength).toBe(before + 1)
    expect(useGameStore.getState().pendingLevelUp).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PostMortem : récap + boutons
// ─────────────────────────────────────────────────────────────────────────────
describe('PostMortem — actions', () => {
  beforeEach(() => {
    useGameStore.setState(state => ({
      meta: {
        ...state.meta,
        lastRunSummary: {
          cause: 'Stone Golem',
          zone: 'ashenvale',
          day: 5,
          level: 3,
          skills: [],
          stats: { strength: 11, agility: 10, intelligence: 8, chance: 5, def: 5 },
          totalKills: 12,
          reputationTokens: 4,
        },
      },
    }))
  })

  it("affiche la cause de mort (T01)", () => {
    render(<PostMortem />)
    expect(screen.getByText('Stone Golem')).toBeInTheDocument()
  })

  it('affiche le bouton "↺ New Run"', () => {
    render(<PostMortem />)
    expect(screen.getByText(/New Run/)).toBeInTheDocument()
  })

  it('clic sur "New Run" reset le jeu', () => {
    useGameStore.getState().addGold(500)
    render(<PostMortem />)
    fireEvent.click(screen.getByText(/New Run/))
    expect(useGameStore.getState().hero.inventory.gold).toBe(0)
  })
})
