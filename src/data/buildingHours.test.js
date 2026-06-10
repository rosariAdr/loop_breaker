// BLD01 — Tests des horaires d'ouverture des bâtiments.
import { describe, it, expect } from 'vitest'
import { BUILDING_HOURS, isBuildingOpen, nextOpenHour, formatBuildingHours } from './buildingHours'

describe('BLD01 — isBuildingOpen', () => {
  it('inn (taverne) est ouverte 24/24', () => {
    expect(BUILDING_HOURS.inn).toBeNull()
    for (let t = 0; t < 24; t++) expect(isBuildingOpen('inn', t)).toBe(true)
  })

  it('church (5–21) ouverte en journée, fermée la nuit', () => {
    expect(isBuildingOpen('church', 5)).toBe(true) // ouverture
    expect(isBuildingOpen('church', 12)).toBe(true)
    expect(isBuildingOpen('church', 20)).toBe(true)
    expect(isBuildingOpen('church', 21)).toBe(false) // to exclus
    expect(isBuildingOpen('church', 3)).toBe(false)
    expect(isBuildingOpen('church', 23)).toBe(false)
  })

  it('merchant (7–19)', () => {
    expect(isBuildingOpen('merchant', 6)).toBe(false)
    expect(isBuildingOpen('merchant', 7)).toBe(true)
    expect(isBuildingOpen('merchant', 18)).toBe(true)
    expect(isBuildingOpen('merchant', 19)).toBe(false)
  })

  it('bâtiment inconnu → considéré ouvert (pas de blocage par défaut)', () => {
    expect(isBuildingOpen('inexistant', 3)).toBe(true)
  })

  it('tick hors borne est normalisé (modulo 24)', () => {
    expect(isBuildingOpen('merchant', 12 + 24)).toBe(true)
    expect(isBuildingOpen('merchant', -1)).toBe(isBuildingOpen('merchant', 23))
  })
})

describe('BLD01 — helpers', () => {
  it("nextOpenHour renvoie l'heure d'ouverture (null pour 24/24)", () => {
    expect(nextOpenHour('inn')).toBeNull()
    expect(nextOpenHour('church')).toBe(5)
    expect(nextOpenHour('blacksmith')).toBe(6)
  })

  it('formatBuildingHours', () => {
    expect(formatBuildingHours('inn')).toMatch(/all day/i)
    expect(formatBuildingHours('merchant')).toBe('Open 7:00–19:00')
  })
})
