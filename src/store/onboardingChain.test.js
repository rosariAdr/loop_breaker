// QONBOARD01 — séquençage de la chaîne d'onboarding au niveau du store (gating par chaînage)
// + acheminement des récompenses (équipement / consommables) au moment de la complétion.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

const s = () => useGameStore.getState()

describe('QONBOARD01 — gating de la chaîne (isOnboardingQuestAvailable)', () => {
  beforeEach(() => {
    s().resetGame()
    localStorage.clear()
  })

  it('seule la 1ère quête est disponible au départ', () => {
    expect(s().isOnboardingQuestAvailable('onb_first_edge')).toBe(true)
    expect(s().isOnboardingQuestAvailable('onb_well_armed')).toBe(false)
    expect(s().isOnboardingQuestAvailable('onb_first_brew')).toBe(false)
  })

  it("une quête acceptée (active) n'est plus « disponible »", () => {
    s().startQuest('onb_first_edge')
    expect(s().isOnboardingQuestAvailable('onb_first_edge')).toBe(false)
  })

  it('compléter un maillon débloque UNIQUEMENT le suivant', () => {
    s().startQuest('onb_first_edge')
    s().completeQuest('onb_first_edge')
    expect(s().world.completedQuests).toContain('onb_first_edge')
    expect(s().isOnboardingQuestAvailable('onb_well_armed')).toBe(true)
    expect(s().isOnboardingQuestAvailable('onb_cover_up')).toBe(false)
  })

  it("la chaîne entière se déroule dans l'ordre", () => {
    const order = [
      'onb_first_edge',
      'onb_well_armed',
      'onb_cover_up',
      'onb_recueillement',
      'onb_devotion',
      'onb_first_brew',
    ]
    for (const id of order) {
      expect(s().isOnboardingQuestAvailable(id)).toBe(true)
      s().startQuest(id)
      s().completeQuest(id)
    }
    expect(order.every((id) => s().world.completedQuests.includes(id))).toBe(true)
  })
})

describe('QONBOARD01 — récompenses acheminées', () => {
  beforeEach(() => {
    s().resetGame()
    localStorage.clear()
  })

  it("onb_first_edge octroie l'arme de départ (worn_iron_dagger)", () => {
    s().startQuest('onb_first_edge')
    s().completeQuest('onb_first_edge')
    const hasDagger = s().hero.inventory.equipment.some((e) => e.templateId === 'worn_iron_dagger')
    expect(hasDagger).toBe(true)
  })

  it('onb_first_brew octroie 2 potions de soin', () => {
    s().startQuest('onb_first_brew')
    const before = s().hero.inventory.consumables.hp_potion_small ?? 0
    s().completeQuest('onb_first_brew')
    expect((s().hero.inventory.consumables.hp_potion_small ?? 0) - before).toBe(2)
  })
})
