// TEST-COV — MerchantPanel (boutique du marchand). Couvre les lignes ~59 / 82 / 118-162 :
//   • rendu du stock (onglet potions par défaut) + ligne d'or + onglets ;
//   • achat d'une potion (or suffisant → or ↓, consommable ajouté ; or insuffisant → bloqué) ;
//   • bascule vers l'onglet équipement (stock filtré ville vs village, incl. branche epic) ;
//   • achat d'un équipement (or suffisant → or ↓, item ajouté ; or insuffisant → bloqué) ;
//   • bouton ← Back → onBack().
// Le panneau n'expose PAS de revente (achat seul, 2 onglets) — non couvert car non supporté.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import MerchantPanel from './MerchantPanel'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'

// Ashenvale : city = ironhaven ; tout autre currentLocation → type 'village'.
function seedGold(gold, location = 'ironhaven') {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: location },
    hero: { ...s.hero, inventory: { ...s.hero.inventory, gold } },
  }))
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MerchantPanel — rendu & navigation', () => {
  it('affiche l’or, les onglets et le stock de potions par défaut', () => {
    seedGold(1000)
    render(<MerchantPanel onBack={vi.fn()} />)
    // ligne d'or (InfoLine)
    expect(screen.getByText('1000g')).toBeInTheDocument()
    // onglets
    expect(screen.getByText(/🧪 Potions/)).toBeInTheDocument()
    expect(screen.getByText(/⚔ Equipment/)).toBeInTheDocument()
    // stock de potions rendu (nom d'une potion du stock)
    expect(screen.getByText(RESOURCES.hp_potion_small.name)).toBeInTheDocument()
    expect(screen.getByText(RESOURCES.mana_crystal.name)).toBeInTheDocument()
  })

  it('← Back déclenche onBack', () => {
    seedGold(1000)
    const onBack = vi.fn()
    render(<MerchantPanel onBack={onBack} />)
    fireEvent.click(screen.getByText(/← Back/))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})

describe('MerchantPanel — achat de potions', () => {
  it('acheter avec assez d’or : l’or baisse et le consommable est ajouté', () => {
    const price = RESOURCES.hp_potion_small.buyPrice // 12
    seedGold(500)
    render(<MerchantPanel onBack={vi.fn()} />)

    // la tuile de la potion contient son bouton « Buy Npg »
    const row = screen.getByText(RESOURCES.hp_potion_small.name).closest('div').parentElement
    const buyBtn = within(row).getByText(new RegExp(`Buy ${price}g`))
    expect(buyBtn).not.toBeDisabled()

    fireEvent.click(buyBtn)

    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(500 - price)
    expect(inv.consumables.hp_potion_small).toBe(1)
    // « Owned: 1 » reflété dans la tuile après achat
    expect(within(row).getByText(/Owned:\s*1/)).toBeInTheDocument()
  })

  it('or insuffisant : le bouton est désactivé et le clic ne change rien (branche bloquée)', () => {
    const price = RESOURCES.hp_potion_small.buyPrice // 12
    seedGold(price - 1) // 11 : ne peut pas se payer la potion la moins chère
    render(<MerchantPanel onBack={vi.fn()} />)

    const row = screen.getByText(RESOURCES.hp_potion_small.name).closest('div').parentElement
    const buyBtn = within(row).getByText(new RegExp(`Buy ${price}g`))
    expect(buyBtn).toBeDisabled()

    // clic malgré tout : buyPotion retombe sur le garde-fou (gold < buyPrice) → no-op
    fireEvent.click(buyBtn)
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(price - 1)
    expect(inv.consumables.hp_potion_small || 0).toBe(0)
  })
})

describe('MerchantPanel — onglet équipement', () => {
  it('en VILLE (ironhaven) : rend le stock d’équipement (rares + branche epic la moins chère)', () => {
    seedGold(5000, 'ironhaven') // city
    render(<MerchantPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByText(/⚔ Equipment/))

    // au moins un rare est proposé (Iron Sword rare @160g fait partie du fullStock)
    expect(screen.getByText(/Rare Iron Sword/)).toBeInTheDocument()
    // branche epic : filterEquipStockByLocation ajoute l'epic le moins cher (Iron Sword epic @520g)
    expect(screen.getByText(/Epic Iron Sword/)).toBeInTheDocument()
  })

  it('acheter un équipement avec assez d’or : l’or baisse et l’item entre au sac', () => {
    seedGold(5000, 'ironhaven')
    render(<MerchantPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByText(/⚔ Equipment/))

    const goldBefore = useGameStore.getState().hero.inventory.gold
    const equipBefore = useGameStore.getState().hero.inventory.equipment.length

    // Iron Sword rare @160g
    const row = screen.getByText(/Rare Iron Sword/).closest('div').parentElement
    const buyBtn = within(row).getByText(/Buy 160g/)
    expect(buyBtn).not.toBeDisabled()
    fireEvent.click(buyBtn)

    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(goldBefore - 160)
    expect(inv.equipment.length).toBe(equipBefore + 1)
    expect(inv.equipment[inv.equipment.length - 1].templateId).toBe('iron_sword')
  })

  it('or insuffisant pour un équipement : bouton désactivé + clic no-op (garde-fou buyEquipment)', () => {
    seedGold(100, 'ironhaven') // < 160 (rare le moins cher)
    render(<MerchantPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByText(/⚔ Equipment/))

    const row = screen.getByText(/Rare Iron Sword/).closest('div').parentElement
    const buyBtn = within(row).getByText(/Buy 160g/)
    expect(buyBtn).toBeDisabled()

    fireEvent.click(buyBtn)
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(100)
    expect(inv.equipment.length).toBe(0)
  })

  it('en VILLAGE : rend le stock communs (+ 1 rare le moins cher) — branche non-city du filtre', () => {
    seedGold(5000, 'greywatch') // location != city → 'village'
    render(<MerchantPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByText(/⚔ Equipment/))

    // village → communs proposés (Iron Sword common @40g)
    expect(screen.getByText(/Common Iron Sword/)).toBeInTheDocument()
    // pas d'epic en village (la branche epic n'est ajoutée qu'en ville)
    expect(screen.queryByText(/Epic Iron Sword/)).toBeNull()
  })
})

// QA-BOOKS01 — les tomes de stats (tome_of_*) étaient distribués nulle part → contenu mort.
// Ils sont désormais vendus par le marchand en MAJEURE CITÉ, à la suite des potions.
describe('QA-BOOKS01 — tomes de stats vendus en ville', () => {
  const TOMES = ['tome_of_focus', 'tome_of_might', 'tome_of_wisdom']

  it('intégrité : tout consommable `isBook` figure dans le stock du marchand en ville', () => {
    const booksInGame = Object.values(RESOURCES)
      .filter((r) => r.isBook)
      .map((r) => r.id)
    for (const id of booksInGame) expect(TOMES).toContain(id)
  })

  it('en VILLE (ironhaven) : les 3 tomes sont proposés dans l’onglet Potions', () => {
    seedGold(5000, 'ironhaven')
    render(<MerchantPanel onBack={vi.fn()} />)
    for (const id of TOMES) {
      expect(screen.getByTestId(`book-stock-${id}`)).toBeInTheDocument()
    }
  })

  it('en VILLAGE : aucun tome proposé (biens savants, ville uniquement)', () => {
    seedGold(5000, 'greywatch')
    render(<MerchantPanel onBack={vi.fn()} />)
    for (const id of TOMES) {
      expect(screen.queryByTestId(`book-stock-${id}`)).toBeNull()
    }
  })

  it('acheter un tome en ville : or débité + livre ajouté aux consommables', () => {
    const price = RESOURCES.tome_of_focus.buyPrice // 90
    seedGold(500, 'ironhaven')
    render(<MerchantPanel onBack={vi.fn()} />)
    const row = screen.getByTestId('book-stock-tome_of_focus')
    fireEvent.click(within(row).getByText(new RegExp(`Buy ${price}g`)))
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(500 - price)
    expect(inv.consumables.tome_of_focus).toBe(1)
  })
})
