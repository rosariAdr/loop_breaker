// FIX-BOAR-DROP01 — le Tuskmaw Boar droppait des parts de loup (wolf_fang/wolf_pelt), ce qui
// était thématiquement incohérent. Il droppe désormais des ressources de sanglier.
import { describe, it, expect } from 'vitest'
import { MONSTERS } from './monsters'
import { RESOURCES } from './resources'

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
