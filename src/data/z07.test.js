// Z07 — Stock d'équipement différencié village vs ville.
import { describe, it, expect } from 'vitest'
import { filterEquipStockByLocation, EQUIPMENT_TEMPLATES } from './equipment'
import { getLocationType, ZONES } from './zones'

const fullStock = Object.values(EQUIPMENT_TEMPLATES).flatMap((t) =>
  Object.entries(t.merchantStock ?? {})
    .filter(([, avail]) => avail)
    .map(([rarity]) => ({ templateId: t.id, rarity, price: t.merchantBuyPrice?.[rarity] ?? 999 })),
)

describe('Z07 — getLocationType', () => {
  it('ville reconnue quand currentLocation === city.id', () => {
    expect(
      getLocationType({ currentZone: 'ashenvale', currentLocation: ZONES.ashenvale.city.id }),
    ).toBe('city')
  })
  it('village par défaut sinon', () => {
    expect(getLocationType({ currentZone: 'ashenvale', currentLocation: 'millhaven' })).toBe(
      'village',
    )
    expect(getLocationType({ currentZone: 'ashenvale', currentLocation: 'inconnu' })).toBe(
      'village',
    )
  })
})

describe('Z07 — filterEquipStockByLocation', () => {
  it('village : que des communs + au plus 1 rare, aucun epic', () => {
    const v = filterEquipStockByLocation(fullStock, 'village')
    const rares = v.filter((s) => s.rarity === 'rare')
    expect(v.some((s) => s.rarity === 'common')).toBe(true)
    expect(rares.length).toBeLessThanOrEqual(1)
    expect(v.some((s) => s.rarity === 'epic')).toBe(false)
  })

  it('ville : que des rares + au plus 1 epic, aucun commun', () => {
    const c = filterEquipStockByLocation(fullStock, 'city')
    const epics = c.filter((s) => s.rarity === 'epic')
    expect(c.some((s) => s.rarity === 'rare')).toBe(true)
    expect(c.some((s) => s.rarity === 'common')).toBe(false)
    expect(epics.length).toBeLessThanOrEqual(1)
    // un epic est désormais disponible en ville
    expect(epics.length).toBe(1)
  })

  it('le rare du village est le moins cher disponible', () => {
    const v = filterEquipStockByLocation(fullStock, 'village')
    const rare = v.find((s) => s.rarity === 'rare')
    const allRares = fullStock.filter((s) => s.rarity === 'rare')
    const cheapest = allRares.reduce((a, b) => (b.price < a.price ? b : a))
    expect(rare.price).toBe(cheapest.price)
  })

  it('stock vide → retourne tableau vide sans planter', () => {
    expect(filterEquipStockByLocation([], 'city')).toEqual([])
  })
})
