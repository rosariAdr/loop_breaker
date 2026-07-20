// TEST-COV — AlchemyPanel (Z04 / CRF02) : rendu de la liste des recettes d'alchimie (source
// unifiée getRecipesByProfession('alchemist') filtrée `alchemy_*`), craftabilité selon les
// ingrédients, et brassage via le mini-jeu (handleBrew → handleComplete). On couvre :
//   • le rendu de la liste (recettes craftables vs grisées) ;
//   • un clic « Brew » qui consomme les ingrédients + or et ouvre le mini-jeu (ligne ~35) ;
//   • handleComplete succès (tier perfect → addConsumable, lignes 44-47) ;
//   • handleComplete catastrophe (qty 0 → poison PERMANENT, lignes 49-55) ;
//   • handleComplete raté simple (poison 7 jours, branche non-permanente du message) ;
//   • le bouton Brew désactivé quand les ingrédients manquent ;
//   • onBack déclenché par « ← Back ».
//
// Le mini-jeu calcule le tier depuis performance.now() (position du curseur ping-pong sur
// 1200ms). On stub performance.now avec une valeur pilotable : elapsed 600ms → curseur 50%
// (centre) → precision 1 → perfect ; elapsed 0 → curseur 0% → precision 0 → catastrophe ;
// elapsed 810ms → curseur ~67.5% → precision 0.3 → fail.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import AlchemyPanel from './AlchemyPanel'
import { useGameStore } from '../../store/gameStore'

const store = () => useGameStore.getState()

// performance.now() pilotable pour rendre le tier du mini-jeu déterministe.
let nowValue = 0
beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  nowValue = 0
  vi.spyOn(performance, 'now').mockImplementation(() => nowValue)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Sème l'inventaire pour rendre `alchemy_hp_potion_small` (briar_thorn ×2, 8g) craftable.
function seedCraftable() {
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      inventory: {
        ...s.hero.inventory,
        gold: 500,
        resources: { ...s.hero.inventory.resources, briar_thorn: 10 },
        consumables: {},
      },
    },
  }))
}

describe('AlchemyPanel — rendu de la liste des recettes', () => {
  it('liste les recettes alchemy_* de la source unifiée', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    // la recette semée est présente et cliquable (data-testid dérivé de l'id)
    expect(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small')).toBeInTheDocument()
    // au moins une autre recette d'alchimie (mana) figure aussi
    expect(screen.getByTestId('alchemy-recipe-alchemy_mana_potion_small')).toBeInTheDocument()
  })

  it('ne montre le bouton Brew qu’après sélection d’une recette', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    expect(screen.queryByText(/Brew Small HP Potion/)).toBeNull()
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small'))
    expect(screen.getByText(/Brew Small HP Potion/)).toBeInTheDocument()
  })
})

describe('AlchemyPanel — brassage (craftable)', () => {
  it('Brew consomme les ingrédients + l’or et ouvre le mini-jeu', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small'))

    expect(store().hero.inventory.resources.briar_thorn).toBe(10)
    expect(store().hero.inventory.gold).toBe(500)

    fireEvent.click(screen.getByText(/Brew Small HP Potion/))

    // ligne ~35 : removeResource + spendGold + ouverture du mini-jeu
    expect(store().hero.inventory.resources.briar_thorn).toBe(8) // -2
    expect(store().hero.inventory.gold).toBe(492) // -8
    expect(screen.getByTestId('crafting-minigame')).toBeInTheDocument()
  })

  it('un STOP centré (perfect) produit la potion et gagne de la concentration', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small'))
    fireEvent.click(screen.getByText(/Brew Small HP Potion/))

    // curseur au centre (50%) → precision 1 → tier perfect → qty 3
    nowValue = 600
    fireEvent.click(screen.getByTestId('minigame-action'))

    // lignes 44-47 : addConsumable(output, qty) + message succès
    expect(store().hero.inventory.consumables.hp_potion_small).toBe(3)
    expect(screen.getByText(/Brewed 3× Small HP Potion/)).toBeInTheDocument()
    // effets de bord STA03 / Q05
    expect(store().hero.concentration).toBeGreaterThan(0)
    expect(store().meta.craftCount).toBe(1)
    // mini-jeu refermé
    expect(screen.queryByTestId('crafting-minigame')).toBeNull()
  })

  it('un STOP hors zone (catastrophe) ne produit rien et applique un poison PERMANENT', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small'))
    fireEvent.click(screen.getByText(/Brew Small HP Potion/))

    // curseur à 0% (elapsed 0) → precision 0 → catastrophe → qty 0
    nowValue = 0
    fireEvent.click(screen.getByTestId('minigame-action'))

    // lignes 49-55 : aucune potion, message catastrophe, debuff permanent
    expect(store().hero.inventory.consumables.hp_potion_small ?? 0).toBe(0)
    expect(screen.getByText(/Catastrophe/)).toBeInTheDocument()
    const poison = store().hero.activeDebuffs.find((d) => d.debuffId === 'poisoned')
    expect(poison).toBeTruthy()
    expect(poison.permanent).toBe(true)
  })

  it('un STOP raté simple (fail) applique un poison temporaire (7 jours), pas permanent', () => {
    seedCraftable()
    render(<AlchemyPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_hp_potion_small'))
    fireEvent.click(screen.getByText(/Brew Small HP Potion/))

    // curseur ~67.5% (elapsed 810ms) → precision 0.3 → tier fail → qty 0, non permanent
    nowValue = 810
    fireEvent.click(screen.getByTestId('minigame-action'))

    expect(store().hero.inventory.consumables.hp_potion_small ?? 0).toBe(0)
    expect(screen.getByText(/Botched brew/)).toBeInTheDocument()
    const poison = store().hero.activeDebuffs.find((d) => d.debuffId === 'poisoned')
    expect(poison).toBeTruthy()
    expect(poison.permanent).toBe(false)
  })
})

describe('AlchemyPanel — recette non craftable & navigation', () => {
  it('le bouton Brew est désactivé quand les ingrédients manquent', () => {
    // pas de wolf_fang → mana potion non craftable (FIX-CRAFTSRC01 — ex-bat_wing)
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        inventory: { ...s.hero.inventory, gold: 500, resources: {}, consumables: {} },
      },
    }))
    render(<AlchemyPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('alchemy-recipe-alchemy_mana_potion_small'))

    const brewBtn = screen.getByText(/Brew Small Mana Potion/).closest('button')
    expect(brewBtn).toBeDisabled()

    // cliquer un bouton désactivé ne consomme rien ni n’ouvre le mini-jeu
    fireEvent.click(brewBtn)
    expect(screen.queryByTestId('crafting-minigame')).toBeNull()
    expect(store().hero.inventory.gold).toBe(500)
  })

  it('« ← Back » déclenche onBack', () => {
    seedCraftable()
    const onBack = vi.fn()
    render(<AlchemyPanel onBack={onBack} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
