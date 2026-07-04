// ACA — panneau Académie (côté CATALOGUE de skills). Complémentaire de
// SafeZone.masters.test.jsx (qui couvre le MasterBoard). Ici on exerce :
//   • ACA01 — rendu du catalogue achetable (getAcademyCatalog) + achat (or dépensé,
//     stone apprise) + bouton grisé quand or insuffisant ;
//   • ACA06 — sélecteurs skill/niveau (premium) + achat d'un skill monté ;
//   • ACA03 — revente d'un skill non équipé (manaStones) ;
//   • ACA02 — déséquipement (actif & passif) UNIQUEMENT ici ;
//   • onBack.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import AcademyPanel from './AcademyPanel'
import { useGameStore } from '../../store/gameStore'
import {
  getAcademyCatalog,
  skillBuyPrice,
  skillSellPrice,
  skillPremiumBuyPrice,
} from '../../data/academy'

const catalog = getAcademyCatalog()
const FIRST = catalog[0].skillId // power_strike

// Ironhaven = ville : le MasterBoard rendu en pied de panneau se scope à une agglo réelle.
function seed(patch = {}) {
  useGameStore.getState().resetGame()
  useGameStore.setState((s) => ({
    world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'ironhaven', tickCount: 12 },
    hero: {
      ...s.hero,
      inventory: {
        ...s.hero.inventory,
        gold: patch.gold ?? 5000,
        manaStones: patch.manaStones ?? [],
      },
      activeSkills: patch.activeSkills ?? [],
      passiveSkills: patch.passiveSkills ?? [],
    },
  }))
}

beforeEach(() => {
  seed()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})
afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('AcademyPanel — catalogue (ACA01)', () => {
  it('rend une ligne achetable par entrée du catalogue et affiche l’or courant', () => {
    render(<AcademyPanel onBack={() => {}} />)
    expect(screen.getByText(/Gold: 5000/)).toBeInTheDocument()
    for (const { skillId } of catalog) {
      expect(screen.getByTestId(`academy-buy-${skillId}`)).toBeInTheDocument()
    }
  })

  it('acheter un skill : dépense l’or et ajoute une mana stone Lv1', () => {
    render(<AcademyPanel onBack={() => {}} />)
    const price = skillBuyPrice(FIRST)
    fireEvent.click(screen.getByTestId(`academy-buy-${FIRST}`))
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(5000 - price)
    expect(inv.manaStones.some((s) => s.skillId === FIRST && s.level === 1)).toBe(true)
  })

  it('grise (disabled) les entrées du catalogue quand l’or est insuffisant', () => {
    seed({ gold: 0 })
    render(<AcademyPanel onBack={() => {}} />)
    const btn = screen.getByTestId(`academy-buy-${FIRST}`)
    expect(btn.disabled).toBe(true)
    fireEvent.click(btn) // no-op : pas d'achat
    expect(useGameStore.getState().hero.inventory.gold).toBe(0)
    expect(useGameStore.getState().hero.inventory.manaStones.length).toBe(0)
  })
})

describe('AcademyPanel — skill monté premium (ACA06)', () => {
  it('rend les sélecteurs skill/niveau et le bouton d’achat premium', () => {
    render(<AcademyPanel onBack={() => {}} />)
    expect(screen.getByTestId('aca06-skill')).toBeInTheDocument()
    expect(screen.getByTestId('aca06-level')).toBeInTheDocument()
    // prix Lv2 par défaut affiché dans le libellé du bouton
    const priceLv2 = skillPremiumBuyPrice(FIRST, 2)
    expect(screen.getByTestId('aca06-buy').textContent).toContain(String(priceLv2))
  })

  it('changer skill + niveau recalcule le prix, puis l’achat ajoute une stone au bon niveau', () => {
    render(<AcademyPanel onBack={() => {}} />)
    const second = catalog[1].skillId
    fireEvent.change(screen.getByTestId('aca06-skill'), { target: { value: second } })
    fireEvent.change(screen.getByTestId('aca06-level'), { target: { value: '4' } })
    const price = skillPremiumBuyPrice(second, 4)
    expect(screen.getByTestId('aca06-buy').textContent).toContain(String(price))

    const goldBefore = useGameStore.getState().hero.inventory.gold
    fireEvent.click(screen.getByTestId('aca06-buy'))
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(goldBefore - price)
    expect(inv.manaStones.some((s) => s.skillId === second && s.level === 4)).toBe(true)
  })

  it('bouton premium grisé quand l’or est insuffisant', () => {
    seed({ gold: 1 })
    render(<AcademyPanel onBack={() => {}} />)
    const btn = screen.getByTestId('aca06-buy')
    expect(btn.disabled).toBe(true)
    fireEvent.click(btn)
    expect(useGameStore.getState().hero.inventory.manaStones.length).toBe(0)
  })
})

describe('AcademyPanel — revente (ACA03)', () => {
  it('sans stones : affiche l’état vide « No unequipped skills to sell. »', () => {
    render(<AcademyPanel onBack={() => {}} />)
    expect(screen.getByText(/No unequipped skills to sell\./)).toBeInTheDocument()
  })

  it('avec une stone : rend la ligne de vente et l’achat créditant l’or au prix de niveau', () => {
    seed({ gold: 0, manaStones: [{ skillId: FIRST, level: 2, xp: 0 }] })
    render(<AcademyPanel onBack={() => {}} />)
    const price = skillSellPrice(FIRST, 2)
    const btn = screen.getByTestId(`academy-sell-${FIRST}`)
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    const inv = useGameStore.getState().hero.inventory
    expect(inv.gold).toBe(price)
    expect(inv.manaStones.length).toBe(0)
  })
})

describe('AcademyPanel — déséquipement (ACA02)', () => {
  it('sans skill équipé : affiche « No equipped skills. »', () => {
    render(<AcademyPanel onBack={() => {}} />)
    expect(screen.getByText(/No equipped skills\./)).toBeInTheDocument()
  })

  it('déséquipe un skill ACTIF : le retire des actifs et le remet en stone', () => {
    seed({ activeSkills: [{ skillId: FIRST, level: 3, xp: 0, currentCooldown: 0 }] })
    render(<AcademyPanel onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`academy-unequip-${FIRST}`))
    const hero = useGameStore.getState().hero
    expect(hero.activeSkills.length).toBe(0)
    expect(hero.inventory.manaStones.some((s) => s.skillId === FIRST)).toBe(true)
  })

  it('déséquipe un skill PASSIF : le retire des passifs et le remet en stone', () => {
    const passive = 'stone_skin'
    seed({ passiveSkills: [{ skillId: passive, level: 1, xp: 0 }] })
    render(<AcademyPanel onBack={() => {}} />)
    fireEvent.click(screen.getByTestId(`academy-unequip-${passive}`))
    const hero = useGameStore.getState().hero
    expect(hero.passiveSkills.length).toBe(0)
    expect(hero.inventory.manaStones.some((s) => s.skillId === passive)).toBe(true)
  })
})

describe('AcademyPanel — onBack', () => {
  it('le bouton « ← Back » appelle onBack', () => {
    const onBack = vi.fn()
    render(<AcademyPanel onBack={onBack} />)
    fireEvent.click(screen.getByText(/← Back/))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
