// TEST-COV — couverture fonctionnelle du panneau de forge (BlacksmithPanel).
// Rend le panneau avec un vrai état de store, sélectionne un template + une rareté,
// vérifie l'état craftable/non-craftable (ingrédients + or), lance le mini-jeu de forge
// et prouve l'issue :
//   • succès (palier parfait) → une instance d'équipement atterrit dans hero.inventory.equipment
//     (avec bump de rareté common→epic) + coûts consommés (or, ingrédients, vigueur) ;
//   • échec (catastrophe, curseur à 0) → aucun objet, debuff « burnt_hands » appliqué.
// Le mini-jeu dérive son palier du timing (performance.now) : on le pilote donc via un mock
// de performance.now (curseur au centre = parfait, curseur à 0 = catastrophe). Le roll de
// rareté/Concentration passe par Math.random → mocké pour être déterministe.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import BlacksmithPanel from './BlacksmithPanel'
import { useGameStore } from '../../store/gameStore'

// Ingrédients d'une Iron Sword common : { rusted_iron: 3 }, gold: 20.
// Ingrédients d'une Iron Sword rare    : { rusted_iron: 5, cursed_steel: 1 }, gold: 80.
const seedHero = (overrides = {}) => {
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      concentration: 0,
      vigor: 100,
      activeDebuffs: [],
      inventory: {
        ...s.hero.inventory,
        gold: 5000,
        resources: { rusted_iron: 10, cursed_steel: 5, ...(overrides.resources ?? {}) },
      },
      ...(overrides.hero ?? {}),
    },
  }))
}

// Pilote performance.now via une horloge mutable. Le mini-jeu capture startRef à l'ouverture
// (clic Craft, horloge = 0) puis calcule elapsed = now - start à chaque frappe. On avance donc
// l'horloge à `clock.t` juste avant les frappes. cursorPositionAt(600, 1200) = 50 (centre →
// parfait) ; elapsed 0 → curseur au bord → accuracy 0 → catastrophe.
const clock = { t: 0 }
function mockForgeClock() {
  clock.t = 0
  vi.spyOn(performance, 'now').mockImplementation(() => clock.t)
}

// Trois frappes → onComplete du mini-jeu. `elapsedAtStrike` positionne l'horloge (donc le
// curseur) avant de frapper.
function strikeThrice(elapsedAtStrike) {
  clock.t = elapsedAtStrike
  const btn = screen.getByTestId('minigame-action')
  fireEvent.click(btn)
  fireEvent.click(btn)
  fireEvent.click(btn)
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  seedHero()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('BlacksmithPanel — rendu & sélection', () => {
  it('rend la forge, l’invite « Select an item » et les templates forgeables', () => {
    render(<BlacksmithPanel onBack={vi.fn()} />)
    expect(screen.getByText(/Blacksmith's Forge/)).toBeInTheDocument()
    // Détail vide tant qu'aucun template sélectionné.
    expect(screen.getByText('Select an item to craft.')).toBeInTheDocument()
    // Les templates disponibles au forgeron sont listés (Iron Sword est availableAt blacksmith).
    expect(screen.getByRole('button', { name: 'Iron Sword' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iron Helm' })).toBeInTheDocument()
  })

  it('le bouton Back appelle onBack', () => {
    const onBack = vi.fn()
    render(<BlacksmithPanel onBack={onBack} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('sélectionner un template affiche sa description, ses raretés et sa recette', () => {
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    // Description du template.
    expect(screen.getByText(/A sturdy iron blade/)).toBeInTheDocument()
    // Sélecteur de rareté (les 4 raretés craftables de l'Iron Sword).
    expect(screen.getByRole('button', { name: 'Common' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rare' })).toBeInTheDocument()
    // Section recette : ingrédient rusted_iron affiché avec le compteur possédé/requis.
    expect(screen.getByText('Recipe')).toBeInTheDocument()
    expect(screen.getByText(/10\/3/)).toBeInTheDocument() // owned 10 / need 3
  })

  it('changer de rareté met à jour la recette (common → rare demande cursed_steel)', () => {
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rare' }))
    // La recette rare exige 5 rusted_iron + 1 cursed_steel + 80 gold.
    expect(screen.getByText(/10\/5/)).toBeInTheDocument() // rusted_iron 10/5
    expect(screen.getByText(/5\/1/)).toBeInTheDocument() // cursed_steel 5/1
    expect(screen.getByText(/\/80g/)).toBeInTheDocument() // gold requis
  })
})

describe('BlacksmithPanel — craftable vs bloqué', () => {
  it('bloque le craft (ingrédients manquants) et affiche la raison', () => {
    // Aucune ressource → l'Iron Sword common (besoin rusted_iron:3) n'est pas craftable.
    useGameStore.setState((s) => ({
      hero: { ...s.hero, inventory: { ...s.hero.inventory, gold: 5000, resources: {} } },
    }))
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    const reason = screen.getByTestId('craft-blocked-reason')
    expect(reason.textContent).toMatch(/Missing ingredients/)
    // Le bouton craft est désactivé.
    expect(screen.getByRole('button', { name: /Craft/ })).toBeDisabled()
  })

  it('bloque le craft (or insuffisant) avec la raison « Not enough gold »', () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        inventory: { ...s.hero.inventory, gold: 0, resources: { rusted_iron: 10 } },
      },
    }))
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    const reason = screen.getByTestId('craft-blocked-reason')
    expect(reason.textContent).toMatch(/Not enough gold/)
  })

  it('autorise le craft quand ingrédients ET or sont présents (bouton actif)', () => {
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    const craftBtn = screen.getByRole('button', { name: /Craft/ })
    expect(craftBtn).not.toBeDisabled()
    // Pas de raison de blocage affichée.
    expect(screen.queryByTestId('craft-blocked-reason')).toBeNull()
  })
})

describe('BlacksmithPanel — cycle de craft complet (mini-jeu)', () => {
  it('craft parfait → instance d’équipement ajoutée + coûts consommés', () => {
    mockForgeClock()
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))

    const before = useGameStore.getState().hero
    expect(before.inventory.equipment).toHaveLength(0)

    // Clic Craft : consomme ingrédients + or et ouvre le mini-jeu.
    fireEvent.click(screen.getByRole('button', { name: /Craft/ }))
    // Ingrédients & or consommés à l'engagement.
    const engaged = useGameStore.getState().hero
    expect(engaged.inventory.resources.rusted_iron).toBe(7) // 10 - 3
    expect(engaged.inventory.gold).toBe(4980) // 5000 - 20
    // Le mini-jeu est ouvert.
    expect(screen.getByTestId('crafting-minigame')).toBeInTheDocument()

    // Résout le mini-jeu (3 frappes au centre → parfait).
    strikeThrice(600) // cursorPositionAt(600, 1200) = 50 → parfait

    const after = useGameStore.getState().hero
    // Un objet a été forgé et rangé dans l'inventaire.
    expect(after.inventory.equipment).toHaveLength(1)
    const item = after.inventory.equipment[0]
    expect(item.templateId).toBe('iron_sword')
    // common +2 (parfait) → epic (Concentration 0 → pas de bump supplémentaire).
    expect(item.rarity).toBe('epic')
    // Vigueur dépensée (STA01, -3) et Concentration gagnée (parfait → +5).
    expect(after.vigor).toBe(97)
    expect(after.concentration).toBe(5)
    // Message de succès affiché.
    expect(screen.getByText(/forged!/)).toBeInTheDocument()
  })

  it('craft raté (catastrophe) → aucun objet, debuff burnt_hands appliqué', () => {
    mockForgeClock()
    render(<BlacksmithPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iron Sword' }))
    fireEvent.click(screen.getByRole('button', { name: /Craft/ }))
    strikeThrice(0) // curseur au bord → accuracy 0 → catastrophe

    const after = useGameStore.getState().hero
    // Aucun équipement produit.
    expect(after.inventory.equipment).toHaveLength(0)
    // Debuff appliqué (catastrophe → permanent).
    expect(after.activeDebuffs.some((d) => d.debuffId === 'burnt_hands')).toBe(true)
    // Message d'échec affiché.
    expect(screen.getByText(/Catastrophe!|Botched!/)).toBeInTheDocument()
  })
})
