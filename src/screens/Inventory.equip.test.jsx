// Inventory — onglet Équipement (SLOT01/SLOT02, EQP01, SET-UI01).
// Couvre : bascule vers l'onglet Equipment ; rendu de la grille des 9 slots (EquippedGrid) ;
// équiper une pièce du sac (hero.equipped mis à jour) ; les bagues remplissent ring1 puis ring2 ;
// une arme 2 mains verrouille l'offhand (« two-handed ») ; les lignes de set actif s'affichent
// dès ≥2 pièces d'un même set portées ; sac vide ; diff vs équipé ; vente (rareté protégée →
// ConfirmDialog) et vente directe ; fermeture (onClose).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import Inventory from './Inventory'
import { useGameStore } from '../store/gameStore'
import { createEquipmentInstance } from '../data/equipment'

// Fabrique une instance et lui assigne un instanceId stable/lisible (createEquipmentInstance
// utilise Date.now()+Math.random() → on fige l'id pour des assertions déterministes).
let counter = 0
function mkItem(templateId, rarity) {
  const inst = createEquipmentInstance(templateId, rarity)
  inst.instanceId = `${templateId}#${counter++}`
  return inst
}

// Ouvre l'inventaire et bascule sur l'onglet Équipement.
function openEquipment(onClose = vi.fn()) {
  render(<Inventory onClose={onClose} />)
  fireEvent.click(screen.getByText(/Equipment \(/))
  return onClose
}

function seedBag(items) {
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      inventory: { ...s.hero.inventory, equipment: items },
    },
  }))
}

function seedEquipped(equipped) {
  useGameStore.setState((s) => ({
    hero: { ...s.hero, equipped: { ...s.hero.equipped, ...equipped } },
  }))
}

beforeEach(() => {
  useGameStore.getState().resetGame()
  counter = 0
})
afterEach(cleanup)

describe('Inventory — onglet Équipement : rendu de base', () => {
  it('bascule sur l’onglet Equipment et rend la grille des 9 slots (tous vides)', () => {
    openEquipment()
    const grid = screen.getByTestId('equipped-grid')
    expect(grid).toBeTruthy()
    // les 9 slots canoniques sont rendus
    for (const slot of [
      'weapon',
      'offhand',
      'helmet',
      'armor',
      'gloves',
      'boots',
      'amulet',
      'ring1',
      'ring2',
    ]) {
      expect(screen.getByTestId(`eq-slot-${slot}`)).toBeTruthy()
    }
    // tous vides → au moins un « — empty — »
    expect(within(grid).getAllByText('— empty —').length).toBe(9)
  })

  it('affiche l’état « sac vide » quand aucune pièce n’est en réserve', () => {
    openEquipment()
    expect(screen.getByText(/No equipment in bag/)).toBeTruthy()
  })

  it('liste les pièces du sac avec leur stat concaténée', () => {
    seedBag([mkItem('iron_sword', 'common')])
    openEquipment()
    // le libellé de rareté + nom apparaît dans la liste
    expect(screen.getAllByText(/Iron Sword/).length).toBeGreaterThan(0)
  })
})

describe('Inventory — équiper depuis le sac', () => {
  it('équipe une pièce du sac → hero.equipped[slot] mis à jour et retirée du sac', () => {
    seedBag([mkItem('iron_helm', 'common')])
    openEquipment()
    // sélectionne la pièce (ouvre le panneau détail)
    fireEvent.click(screen.getByText(/Iron Helm/))
    // clique sur Equip
    fireEvent.click(screen.getByText('Equip'))

    const { hero } = useGameStore.getState()
    expect(hero.equipped.helmet?.templateId).toBe('iron_helm')
    // retirée du sac
    expect(hero.inventory.equipment.some((e) => e.templateId === 'iron_helm')).toBe(false)
    // la grille reflète le nom de la pièce portée
    const grid = screen.getByTestId('equipped-grid')
    expect(within(grid).getAllByText(/Iron Helm/).length).toBeGreaterThan(0)
  })

  it('les bagues se logent dans ring1 puis ring2', () => {
    seedBag([mkItem('iron_band', 'common'), mkItem('band_of_fortune', 'common')])
    openEquipment()

    // première bague → ring1
    fireEvent.click(screen.getByText(/Iron Band/))
    fireEvent.click(screen.getByText('Equip'))
    expect(useGameStore.getState().hero.equipped.ring1?.templateId).toBe('iron_band')
    expect(useGameStore.getState().hero.equipped.ring2).toBeNull()

    // seconde bague → ring2 (ring1 occupé)
    fireEvent.click(screen.getByText(/Band of Fortune/))
    fireEvent.click(screen.getByText('Equip'))
    const eq = useGameStore.getState().hero.equipped
    expect(eq.ring1?.templateId).toBe('iron_band')
    expect(eq.ring2?.templateId).toBe('band_of_fortune')
  })

  it('une arme 2 mains verrouille l’offhand (affiche « two-handed »)', () => {
    seedBag([mkItem('bone_staff', 'common')]) // bone_staff.twoHanded = true
    openEquipment()
    fireEvent.click(screen.getByText(/Bone Staff/))
    fireEvent.click(screen.getByText('Equip'))

    const eq = useGameStore.getState().hero.equipped
    expect(eq.weapon?.templateId).toBe('bone_staff')
    expect(eq.weapon?.twoHanded).toBe(true)
    expect(eq.offhand).toBeNull()
    // la case offhand vide + arme 2 mains portée → libellé spécial
    const offhand = screen.getByTestId('eq-slot-offhand')
    expect(within(offhand).getByText(/two-handed/)).toBeTruthy()
  })

  it('« Already equipped » quand la pièce sélectionnée est déjà portée', () => {
    const helm = mkItem('iron_helm', 'common')
    seedBag([helm])
    seedEquipped({ helmet: helm })
    openEquipment()
    // dans la liste elle porte le tag « equipped »
    expect(screen.getAllByText('equipped').length).toBeGreaterThan(0)
    // ouvrir le détail : cliquer l'entrée de la LISTE (le nom apparaît aussi dans la grille)
    // → cibler le nœud dont l'ancêtre bouton porte la classe .inv-li.
    const listName = screen.getAllByText(/Iron Helm/).find((n) => n.closest('button.inv-li'))
    fireEvent.click(listName)
    const btn = screen.getByText('Already equipped')
    expect(btn).toBeTruthy()
    expect(btn.disabled).toBe(true)
  })
})

describe('Inventory — sets actifs (SET-UI01)', () => {
  it('affiche une ligne de set actif quand ≥2 pièces d’un même set sont portées', () => {
    // deux pièces iron_vanguard sur des slots distincts → palier 2 (+5 %) actif
    seedEquipped({
      helmet: mkItem('iron_helm', 'common'),
      armor: mkItem('leather_armor', 'common'),
    })
    openEquipment()
    const bonuses = screen.getByTestId('inv-set-bonuses')
    expect(bonuses).toBeTruthy()
    const line = screen.getByTestId('inv-set-iron_vanguard')
    expect(line.textContent).toMatch(/Iron Vanguard/)
    expect(line.textContent).toMatch(/2\/7/) // 2 pièces portées / 7 au total
    // set actif → une ligne de bonus « ✦ » présente
    expect(line.textContent).toMatch(/✦/)
  })

  it('une seule pièce de set → ligne présente mais non-active (pas de « ✦ »)', () => {
    seedEquipped({ helmet: mkItem('iron_helm', 'common') })
    openEquipment()
    const line = screen.getByTestId('inv-set-iron_vanguard')
    expect(line.textContent).toMatch(/1\/7/)
    expect(line.textContent).not.toMatch(/✦/)
  })
})

describe('Inventory — panneau détail : diff & vente', () => {
  it('affiche la diff vs pièce équipée quand une meilleure pièce du même slot est sélectionnée', () => {
    // rare en réserve, common porté → diff positive
    seedEquipped({ helmet: mkItem('iron_helm', 'common') })
    seedBag([mkItem('iron_helm', 'rare')])
    openEquipment()
    // la seule entrée « — empty — » n'existe plus pour helmet ; sélectionne l'item du sac (rare)
    fireEvent.click(screen.getByText(/Rare Iron Helm/))
    // ligne « vs équipé » + au moins un badge diff
    expect(screen.getByText(/vs equipped/)).toBeTruthy()
    expect(screen.getByTestId('diff-def')).toBeTruthy()
  })

  it('vente directe d’une pièce commune : retirée du sac + or crédité, sans confirmation', () => {
    const sword = mkItem('iron_sword', 'common')
    seedBag([sword])
    const goldBefore = useGameStore.getState().hero.inventory.gold
    openEquipment()
    fireEvent.click(screen.getByText(/Iron Sword/))
    fireEvent.click(screen.getByText(new RegExp(`Sell ${sword.sellPrice}g`)))

    const { hero } = useGameStore.getState()
    expect(hero.inventory.equipment.some((e) => e.instanceId === sword.instanceId)).toBe(false)
    expect(hero.inventory.gold).toBe(goldBefore + sword.sellPrice)
  })

  it('vente d’une pièce épique : ouvre la confirmation puis vend après confirmation', () => {
    const epicSword = mkItem('iron_sword', 'epic')
    seedBag([epicSword])
    const goldBefore = useGameStore.getState().hero.inventory.gold
    openEquipment()
    fireEvent.click(screen.getByText(/Epic Iron Sword/))
    // la vente d'une rareté protégée porte le marqueur ⚠ et déclenche la confirmation
    fireEvent.click(screen.getByText(/Sell .*g ⚠/))
    // dialogue ouvert
    expect(screen.getByText(/Sell rare item\?/)).toBeTruthy()
    // confirmer
    fireEvent.click(screen.getByText(new RegExp(`Sell for ${epicSword.sellPrice}g`)))

    const { hero } = useGameStore.getState()
    expect(hero.inventory.equipment.some((e) => e.instanceId === epicSword.instanceId)).toBe(false)
    expect(hero.inventory.gold).toBe(goldBefore + epicSword.sellPrice)
  })
})

describe('Inventory — fermeture', () => {
  it('déclenche onClose au clic sur « ← Map »', () => {
    const onClose = openEquipment()
    fireEvent.click(screen.getByText(/← Map/))
    expect(onClose).toHaveBeenCalled()
  })
})
