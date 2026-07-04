// TEST-COV — MasterSmithPanel (Z06 maître forgeron) : rendu de la liste des recettes
// `master_*` (blacksmith), craftable vs non craftable, forge → mini-jeu → issue (succès
// ajoute la pièce au sac / échec applique un debuff), retour via onBack.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import MasterSmithPanel from './MasterSmithPanel'
import { useGameStore } from '../../store/gameStore'
import { getRecipesByProfession } from '../../data/craftRecipes'

// On mocke resolveHybridCraftOutcome pour piloter l'issue du craft (succès par défaut =
// implémentation réelle ; un test force une issue d'échec via mockReturnValueOnce).
const forgeOutcome = vi.fn()
vi.mock('../../utils/craftModel', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, resolveHybridCraftOutcome: (...args) => forgeOutcome(...args) }
})

const MASTER_RECIPES = getRecipesByProfession('blacksmith').filter((r) =>
  r.id.startsWith('master_'),
)
const SERPENT = MASTER_RECIPES.find((r) => r.id === 'master_serpent_dagger')
const SERPENT_COMBO = SERPENT.combinations[0]

// Seed généreux : héros peut forger la Serpent Dagger (5 serpent_scale + 1 void_fang, 120g).
function seedCraftable() {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      concentration: 0,
      inventory: {
        ...s.hero.inventory,
        gold: 5000,
        resources: { serpent_scale: 10, void_fang: 3 },
        equipment: [],
      },
    },
  }))
}

// Forge la Serpent Dagger jusqu'à ouvrir le mini-jeu, puis frappe 3 fois pour compléter.
function forgeAndStrike() {
  fireEvent.click(screen.getByTestId('master-recipe-master_serpent_dagger'))
  fireEvent.click(screen.getByText(/Forge Serpent Dagger/))
  // Mini-jeu ouvert : 3 frappes déclenchent onComplete → handleComplete.
  const action = screen.getByTestId('minigame-action')
  fireEvent.click(action)
  fireEvent.click(action)
  fireEvent.click(action)
}

beforeEach(async () => {
  seedCraftable()
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // RNG déterministe (roll de rareté, bump concentration)
  // Par défaut : l'issue du craft utilise la vraie logique (succès Rare/Epic déterministe).
  const actual = await vi.importActual('../../utils/craftModel')
  forgeOutcome.mockReset()
  forgeOutcome.mockImplementation((...args) => actual.resolveHybridCraftOutcome(...args))
})
afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('MasterSmithPanel — rendu de la liste', () => {
  it('affiche un bouton par recette master_* de la forge', () => {
    render(<MasterSmithPanel onBack={vi.fn()} />)
    expect(MASTER_RECIPES.length).toBeGreaterThan(0)
    for (const r of MASTER_RECIPES) {
      expect(screen.getByTestId(`master-recipe-${r.id}`)).toBeTruthy()
    }
    // le nom de la recette et ses ingrédients sont visibles
    expect(screen.getByText('Serpent Dagger (Rare)')).toBeTruthy()
  })

  it('grise les recettes non craftables (ingrédients manquants) et met en avant les craftables', () => {
    render(<MasterSmithPanel onBack={vi.fn()} />)
    const serpentBtn = screen.getByTestId('master-recipe-master_serpent_dagger')
    // craftable → opacité pleine
    expect(serpentBtn.style.opacity).toBe('1')
    // une recette epic dont on n'a pas les ingrédients → grisée (0.55)
    const wraithBtn = screen.getByTestId('master-recipe-master_wraith_crown')
    expect(wraithBtn.style.opacity).toBe('0.55')
  })
})

describe('MasterSmithPanel — sélection & bouton Forge', () => {
  it('ne montre le bouton Forge qu’après avoir sélectionné une recette', () => {
    render(<MasterSmithPanel onBack={vi.fn()} />)
    expect(screen.queryByText(/Forge Serpent Dagger/)).toBeNull()
    fireEvent.click(screen.getByTestId('master-recipe-master_serpent_dagger'))
    expect(screen.getByText(/Forge Serpent Dagger/)).toBeTruthy()
  })

  it('désactive le bouton Forge quand les ingrédients manquent (recette non craftable)', () => {
    render(<MasterSmithPanel onBack={vi.fn()} />)
    // wraith_crown : pas d'ancient_bone/wraith_essence en stock → forge impossible
    fireEvent.click(screen.getByTestId('master-recipe-master_wraith_crown'))
    const forgeBtn = screen.getByText(/Forge Wraith Crown/)
    expect(forgeBtn.disabled).toBe(true)
  })
})

describe('MasterSmithPanel — forge (succès)', () => {
  it('consomme ingrédients + or et ouvre le mini-jeu au clic sur Forge', () => {
    render(<MasterSmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByTestId('master-recipe-master_serpent_dagger'))
    fireEvent.click(screen.getByText(/Forge Serpent Dagger/))
    // mini-jeu affiché
    expect(screen.getByTestId('crafting-minigame')).toBeTruthy()
    // ressources + or débités (5 serpent_scale, 1 void_fang, 120g)
    const inv = useGameStore.getState().hero.inventory
    expect(inv.resources.serpent_scale).toBe(10 - SERPENT_COMBO.ingredients.serpent_scale)
    expect(inv.resources.void_fang).toBe(3 - SERPENT_COMBO.ingredients.void_fang)
    expect(inv.gold).toBe(5000 - SERPENT_COMBO.gold)
  })

  it('après complétion du mini-jeu, ajoute la pièce forgée au sac et incrémente le compteur de crafts', () => {
    // Issue de succès déterministe (le tier issu du mini-jeu dépend du timing RAF sous jsdom).
    forgeOutcome.mockReturnValue({ success: true, tier: 'neutral', rarity: 'rare' })
    render(<MasterSmithPanel onBack={vi.fn()} />)
    const before = useGameStore.getState().meta.craftCount ?? 0
    forgeAndStrike()
    const st = useGameStore.getState()
    // une pièce serpent_dagger a été ajoutée à l'inventaire
    const forged = st.hero.inventory.equipment.filter((e) => e.templateId === 'serpent_dagger')
    expect(forged.length).toBe(1)
    expect(forged[0].rarity).toBe('rare') // rarityTable { rare: 100 }
    // compteur de crafts incrémenté
    expect(st.meta.craftCount).toBe(before + 1)
    // message de succès affiché
    expect(screen.getByText(/forged!/i)).toBeTruthy()
  })
})

describe('MasterSmithPanel — forge (échec → debuff)', () => {
  it('sur une issue ratée, applique Burnt Hands et n’ajoute aucune pièce', () => {
    // Issue d'échec : le mini-jeu résout un tier 'fail'/'catastrophe'. resolveHybridCraftOutcome
    // renvoie alors success:false → branche debuff de handleComplete.
    forgeOutcome.mockReturnValueOnce({
      success: false,
      tier: 'fail',
      rarity: null,
      severity: 'fail',
      permanentDebuff: false,
    })
    render(<MasterSmithPanel onBack={vi.fn()} />)
    forgeAndStrike()
    const st = useGameStore.getState()
    // aucune pièce ajoutée
    expect(
      st.hero.inventory.equipment.filter((e) => e.templateId === 'serpent_dagger').length,
    ).toBe(0)
    // debuff Burnt Hands présent
    const debuffs = st.hero.activeDebuffs ?? []
    expect(debuffs.some((d) => d.debuffId === 'burnt_hands')).toBe(true)
    // message d'échec
    expect(screen.getByText(/Botched|Burnt Hands/i)).toBeTruthy()
  })
})

describe('MasterSmithPanel — retour', () => {
  it('déclenche onBack au clic sur ← Back', () => {
    const onBack = vi.fn()
    render(<MasterSmithPanel onBack={onBack} />)
    fireEvent.click(screen.getByText(/← Back/))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
