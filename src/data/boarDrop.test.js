// FIX-BOAR-DROP01 — le Tuskmaw Boar droppait des parts de loup (wolf_fang/wolf_pelt), ce qui
// était thématiquement incohérent. Il droppe désormais des ressources de sanglier.
import { describe, it, expect } from 'vitest'
import { MONSTERS } from './monsters'
import { RESOURCES } from './resources'
import { LEATHER_RECIPES, COOKING_RECIPES } from './recipes'

describe('FIX-BOAR-DROP01 — drops thématiques du sanglier', () => {
  it('boar_tusk et boar_hide existent dans RESOURCES (vendables)', () => {
    expect(RESOURCES.boar_tusk).toBeDefined()
    expect(RESOURCES.boar_hide).toBeDefined()
    expect(RESOURCES.boar_tusk.sellPrice).toBeGreaterThan(0)
    expect(RESOURCES.boar_hide.sellPrice).toBeGreaterThan(0)
  })

  it('tuskmaw_boar droppe boar_tusk/boar_hide et plus aucune part de loup', () => {
    const ids = MONSTERS.tuskmaw_boar.resourceDrops.map((d) => d.resourceId)
    expect(ids).toContain('boar_tusk')
    expect(ids).toContain('boar_hide')
    expect(ids).not.toContain('wolf_fang')
    expect(ids).not.toContain('wolf_pelt')
  })
})

// DROP-FIX01 — Réalignement thématique des drops de cuir/gibier. Le lièvre et le renard
// droppaient wolf_pelt (incohérent) ; désormais hare_pelt / fox_pelt. Thunderhoof → beast_hide.
// wolf_pelt est recanonisé sur le VRAI loup (ashwood_wolf). Les pelts ont des usages (LEAT/COOK).
describe('DROP-FIX01 — drops de cuir/gibier thématiques', () => {
  const NEW_PELTS = ['hare_pelt', 'fox_pelt', 'beast_hide', 'boar_tusk']

  const dropIds = (id) => MONSTERS[id].resourceDrops.map((d) => d.resourceId)

  it('hare_pelt / fox_pelt / beast_hide existent (vendables + craftables)', () => {
    for (const id of ['hare_pelt', 'fox_pelt', 'beast_hide']) {
      const r = RESOURCES[id]
      expect(r, id).toBeDefined()
      expect(r.sellPrice).toBeGreaterThan(0)
      expect(r.uses).toContain('craft')
      expect(r.uses).toContain('sell')
    }
  })

  it('thicket_hare droppe hare_pelt (plus wolf_pelt)', () => {
    expect(dropIds('thicket_hare')).toContain('hare_pelt')
    expect(dropIds('thicket_hare')).not.toContain('wolf_pelt')
  })

  it('russet_fox droppe fox_pelt (plus wolf_pelt)', () => {
    expect(dropIds('russet_fox')).toContain('fox_pelt')
    expect(dropIds('russet_fox')).not.toContain('wolf_pelt')
  })

  it('thunderhoof droppe beast_hide (plus wolf_pelt)', () => {
    expect(dropIds('thunderhoof')).toContain('beast_hide')
    expect(dropIds('thunderhoof')).not.toContain('wolf_pelt')
  })

  it('wolf_pelt est recanonisé sur ashwood_wolf (le vrai loup)', () => {
    expect(RESOURCES.wolf_pelt.sources).toEqual(['ashwood_wolf'])
    expect(dropIds('ashwood_wolf')).toContain('wolf_pelt')
  })

  it('hare_pelt / fox_pelt / beast_hide ont une source unique cohérente', () => {
    expect(RESOURCES.hare_pelt.sources).toEqual(['thicket_hare'])
    expect(RESOURCES.fox_pelt.sources).toEqual(['russet_fox'])
    expect(RESOURCES.beast_hide.sources).toEqual(['thunderhoof'])
  })

  it('Hare et Fox conservent leur skillDrop (magie de feu)', () => {
    expect(MONSTERS.thicket_hare.skillDrop.skillId).toBe('ember_burst')
    expect(MONSTERS.russet_fox.skillDrop.skillId).toBe('fox_fire')
  })

  it('les pelts/gibier sont câblés dans LEATHER_RECIPES / COOKING_RECIPES (usages réels)', () => {
    const leatherIngredients = new Set(
      LEATHER_RECIPES.flatMap((r) => Object.keys(r.ingredients)),
    )
    const cookingIngredients = new Set(
      COOKING_RECIPES.flatMap((r) => Object.keys(r.ingredients)),
    )
    const wired = new Set([...leatherIngredients, ...cookingIngredients])
    for (const id of NEW_PELTS) {
      expect(wired.has(id), `${id} n'est câblé dans aucune recette LEAT/COOK`).toBe(true)
    }
  })

  it('LEATHER_RECIPES cible des templates existants (armures/bottes de cuir)', () => {
    for (const r of LEATHER_RECIPES) {
      expect(['leather_armor', 'swift_boots']).toContain(r.templateId)
    }
  })

  it('COOKING_RECIPES produit des consommables restauratifs', () => {
    for (const r of COOKING_RECIPES) {
      expect(RESOURCES[r.output]?.isConsumable, `${r.output}`).toBe(true)
    }
  })
})
