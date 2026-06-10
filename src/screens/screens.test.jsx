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
  useGameStore.setState((state) => ({ hero: { ...state.hero, heroNamed: true, name: 'Tester' } }))
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

  it('U04 — App wrappe le screen courant dans un conteneur anim-screen-fade', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.anim-screen-fade')).not.toBeNull()
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
    // GLD01 — lieu par défaut = ville (Ironhaven) → titre "Adventurers' Guild"
    render(<QuestBoard />)
    expect(screen.getByText("Adventurers' Guild")).toBeInTheDocument()
  })

  it('PostMortem monte si lastRunSummary existe', () => {
    useGameStore.setState((state) => ({
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
    useGameStore.setState((state) => ({
      hero: { ...state.hero, heroNamed: false, name: 'The Wanderer' },
    }))
    render(<App />)
    // CharacterCreation doit être visible
    expect(screen.getByText(/The Wanderer Awakes/)).toBeInTheDocument()
  })

  it('CharacterCreation : valider un nom débloque les écrans', () => {
    useGameStore.setState((state) => ({
      hero: { ...state.hero, heroNamed: false, name: 'The Wanderer' },
    }))
    render(<App />)
    fireEvent.click(screen.getByText(/Begin the Journey/))
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CRF05 — Affichage des debuffs actifs sur HeroSheet
// ─────────────────────────────────────────────────────────────────────────────
describe('CRF05 — HeroSheet debuffs', () => {
  it('pas de section debuffs si aucun debuff actif', () => {
    render(<HeroSheet />)
    expect(screen.queryByTestId('active-debuffs')).toBeNull()
  })

  it('affiche un debuff temporaire avec sa durée restante', () => {
    useGameStore.getState().addHeroDebuff('fatigue', 5)
    render(<HeroSheet />)
    expect(screen.getByTestId('active-debuffs')).toBeInTheDocument()
    expect(screen.getByText('Fatigue')).toBeInTheDocument()
    expect(screen.getByText('5d left')).toBeInTheDocument()
  })

  it("marque un debuff permanent 'Cure needed'", () => {
    useGameStore.getState().addHeroDebuff('black_smoke', 7, true)
    render(<HeroSheet />)
    expect(screen.getByText('Cure needed')).toBeInTheDocument()
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

  it("affiche les 4 slots d'équipement", () => {
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

  it('affiche les Currencies (gold/tokens, sans carte « Run » — HS-CURR01)', () => {
    render(<HeroSheet />)
    expect(screen.getByText('Currencies')).toBeInTheDocument()
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.queryByText('Run')).toBeNull() // carte « Run » retirée (HS-CURR01)
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

  it('clic sur une stone affiche le panneau détail avec bouton Equip', () => {
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

  it("clic sur l'item → détail avec bouton Equip", () => {
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
// UX05 — Badge "nouveau loot" NavBar
// ─────────────────────────────────────────────────────────────────────────────
describe('UX05 — Badge unseen loot dans NavBar', () => {
  it('PAS de badge si unseenLoot = false par défaut', () => {
    render(<App />)
    expect(screen.queryByTestId('unseen-loot-badge')).toBeNull()
  })

  it("badge présent si unseenLoot = true et on n'est pas sur l'écran inventory", () => {
    useGameStore.setState({ unseenLoot: true, currentScreen: 'world_map' })
    render(<App />)
    expect(screen.getByTestId('unseen-loot-badge')).toBeInTheDocument()
  })

  it("badge masqué quand on est SUR l'écran inventory (déjà vu)", () => {
    useGameStore.setState({ unseenLoot: true, currentScreen: 'inventory' })
    render(<App />)
    // Inventory monté → useEffect appelle markLootAsSeen → flag passe à false
    // Aussi : showBadge condition exclut currentScreen === 'inventory'
    expect(screen.queryByTestId('unseen-loot-badge')).toBeNull()
  })

  it('clic sur Bag depuis world_map masque le badge', () => {
    useGameStore.setState({ unseenLoot: true, currentScreen: 'world_map' })
    render(<App />)
    expect(screen.getByTestId('unseen-loot-badge')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Bag'))
    // markLootAsSeen est appelé via useEffect d'Inventory
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// UX02 — Diff comparée équipement au survol/click
// ─────────────────────────────────────────────────────────────────────────────
describe('UX02 — Diff comparée équipement', () => {
  beforeEach(() => {
    // Équipement actuel : Iron Sword (+5 str)
    useGameStore.setState((state) => ({
      hero: {
        ...state.hero,
        equipped: {
          ...state.hero.equipped,
          weapon: {
            instanceId: 'equipped_sword',
            name: 'Iron Sword',
            slot: 'weapon',
            rarity: 'common',
            stats: { strength: 5 },
            sellPrice: 20,
          },
        },
        inventory: {
          ...state.hero.inventory,
          equipment: [
            {
              instanceId: 'new_sword',
              templateId: 'steel_sword',
              name: 'Steel Sword',
              slot: 'weapon',
              rarity: 'rare',
              stats: { strength: 12 },
              sellPrice: 80,
            },
            {
              instanceId: 'weak_sword',
              templateId: 'tin_sword',
              name: 'Tin Sword',
              slot: 'weapon',
              rarity: 'common',
              stats: { strength: 2 },
              sellPrice: 5,
            },
          ],
        },
      },
    }))
  })

  it('affiche un ↑ vert quand le nouvel item est meilleur', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Steel Sword'))
    const diff = screen.getByTestId('diff-strength')
    expect(diff.textContent).toContain('↑+7') // 12 - 5 = +7
  })

  it('affiche un ↓ rouge quand le nouvel item est pire', () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Tin Sword'))
    const diff = screen.getByTestId('diff-strength')
    expect(diff.textContent).toContain('↓-3') // 2 - 5 = -3
  })

  it("affiche le nom de l'item équipé pour comparaison", () => {
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Steel Sword'))
    expect(screen.getByText(/vs équipé : Iron Sword/)).toBeInTheDocument()
  })

  it("n'affiche PAS de diff quand l'item est l'équipement actuel", () => {
    // Ajoute le sword équipé aussi à l'inventaire (cas où on l'a sélectionné)
    useGameStore.setState((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          equipment: [...state.hero.inventory.equipment, state.hero.equipped.weapon],
        },
      },
    }))
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    // Click sur l'Iron Sword (équipé) — il y aura 2 matches → on prend le dernier (l'item de l'inventaire)
    const swords = screen.getAllByText('Iron Sword')
    fireEvent.click(swords[swords.length - 1])
    // Pas de diff puisque alreadyEquipped
    expect(screen.queryByTestId('diff-strength')).toBeNull()
  })

  it("n'affiche PAS de diff si aucun item équipé dans le slot", () => {
    useGameStore.setState((state) => ({
      hero: { ...state.hero, equipped: { ...state.hero.equipped, weapon: null } },
    }))
    render(<Inventory />)
    fireEvent.click(screen.getByText(/Equipment/))
    fireEvent.click(screen.getByText('Steel Sword'))
    expect(screen.queryByTestId('diff-strength')).toBeNull()
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
        stats: {
          hp: 100,
          maxHp: 121,
          mana: 73,
          maxMana: 73,
          strength: 10,
          agility: 10,
          intelligence: 8,
          chance: 5,
          def: 5,
        },
        level: 3,
        exp: 149,
        expToNext: 225,
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
        inventory: { resources: {}, consumables: {}, gold: 0 }, // ni equipment ni manaStones
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
    // GLD01 — en ville la section s'intitule "Available · Guild Commissions"
    expect(screen.getByText(/Available/)).toBeInTheDocument()
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

  it('affiche les nouvelles quêtes Q08 (greywatch) — disponibles à Greywatch (QSV2)', () => {
    // QSV2-LOCALITY01 — les quêtes de Greywatch ne sont disponibles qu'à Greywatch.
    useGameStore.setState((s) => ({ world: { ...s.world, currentLocation: 'greywatch' } }))
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

  it('bouton retour → safe_zone', () => {
    // GLD01 — en ville le retour est libellé "← Guild"
    render(<QuestBoard />)
    fireEvent.click(screen.getByText('← Guild'))
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

  it('Confirm sans choix ne fait rien', () => {
    render(<LevelUpModal />)
    const confirmBtn = screen.getByText(/Confirm & Continue/)
    expect(confirmBtn).toBeDisabled()
  })

  it('Confirm avec choix applique le bonus + clear pendingLevelUp', () => {
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
    useGameStore.setState((state) => ({
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

  it('affiche la cause de mort (T01)', () => {
    render(<PostMortem />)
    expect(screen.getByText('Stone Golem')).toBeInTheDocument()
  })

  // TUT03 — Hint première transmigration
  it('TUT03 — affiche le hint si firstDeathSeen=false et totalDeaths<=1', () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, firstDeathSeen: false, totalDeaths: 1 },
    }))
    render(<PostMortem />)
    expect(screen.getByTestId('first-death-hint')).toBeInTheDocument()
    expect(screen.getByText(/First Transmigration/)).toBeInTheDocument()
  })

  it('TUT03 — PAS de hint si déjà vu (firstDeathSeen=true)', () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, firstDeathSeen: true, totalDeaths: 1 },
    }))
    render(<PostMortem />)
    expect(screen.queryByTestId('first-death-hint')).toBeNull()
  })

  it('TUT03 — PAS de hint après plusieurs morts (totalDeaths>1)', () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, firstDeathSeen: false, totalDeaths: 5 },
    }))
    render(<PostMortem />)
    expect(screen.queryByTestId('first-death-hint')).toBeNull()
  })

  it("TUT03 — clic sur 'Got it' marque le hint comme vu", () => {
    useGameStore.setState((state) => ({
      meta: { ...state.meta, firstDeathSeen: false, totalDeaths: 1 },
    }))
    render(<PostMortem />)
    fireEvent.click(screen.getByText('Got it'))
    expect(useGameStore.getState().meta.firstDeathSeen).toBe(true)
  })

  it('affiche le bouton "↺ New Run"', () => {
    render(<PostMortem />)
    expect(screen.getByText(/New Run/)).toBeInTheDocument()
  })

  it('clic sur "New Run" ouvre une confirmation (UX03) — ne reset PAS directement', () => {
    useGameStore.getState().addGold(500)
    render(<PostMortem />)
    fireEvent.click(screen.getByText(/New Run/))
    // UX03 ajoute désormais une confirmation : le gold n'est PAS reset tant que non confirmé
    expect(useGameStore.getState().hero.inventory.gold).toBe(500)
    // Le dialog de confirmation est visible
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
  })

  it('clic sur "New Run" → "Reset everything" reset le jeu (UX03 flow complet)', () => {
    useGameStore.getState().addGold(500)
    render(<PostMortem />)
    fireEvent.click(screen.getByText(/New Run/))
    // Le dialog s'ouvre avec un bouton "Reset everything"
    fireEvent.click(screen.getByText(/Reset everything/))
    expect(useGameStore.getState().hero.inventory.gold).toBe(0)
  })

  it('"New Run" → "Keep my save" annule (gold préservé)', () => {
    useGameStore.getState().addGold(500)
    render(<PostMortem />)
    fireEvent.click(screen.getByText(/New Run/))
    fireEvent.click(screen.getByText(/Keep my save/))
    expect(useGameStore.getState().hero.inventory.gold).toBe(500)
    // Dialog fermé
    expect(screen.queryByTestId('confirm-dialog')).toBeNull()
  })

  // W03 — Bannière Malachar defeated
  describe('W03 — Bannière Malachar slain', () => {
    it("affiche la bannière 'MALACHAR THE UNDYING' si meta.malacharDefeatedThisRun=true", () => {
      useGameStore.setState((state) => ({
        meta: { ...state.meta, malacharDefeatedThisRun: true },
      }))
      render(<PostMortem />)
      expect(screen.getByTestId('malachar-defeated-banner')).toBeInTheDocument()
      expect(screen.getByText(/MALACHAR THE UNDYING/)).toBeInTheDocument()
      expect(screen.getByText(/Slayer of Eldenmoor/)).toBeInTheDocument()
      expect(screen.getByText(/To be continued/)).toBeInTheDocument()
    })

    it('PAS de bannière si Malachar pas killed ce run', () => {
      useGameStore.setState((state) => ({
        meta: { ...state.meta, malacharDefeatedThisRun: false },
      }))
      render(<PostMortem />)
      expect(screen.queryByTestId('malachar-defeated-banner')).toBeNull()
    })

    it("clic sur 'Continue to Transmigration' bascule vers le PostMortem normal", () => {
      useGameStore.setState((state) => ({
        meta: { ...state.meta, malacharDefeatedThisRun: true },
      }))
      render(<PostMortem />)
      fireEvent.click(screen.getByText(/Continue to Transmigration/))
      // La bannière disparaît, ☠ Fallen apparaît
      expect(screen.queryByTestId('malachar-defeated-banner')).toBeNull()
      expect(screen.getByText(/Fallen/)).toBeInTheDocument()
    })
  })
})
