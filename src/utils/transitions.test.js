// UI09 — détection des transitions de zone (déclencheur du déroulé de parchemin).
import { describe, it, expect } from 'vitest'
import { isZoneTransition } from './transitions'

describe('UI09 — isZoneTransition', () => {
  it('entrée en zone (world_map → safe_zone / zone_view)', () => {
    expect(isZoneTransition('world_map', 'safe_zone')).toBe(true)
    expect(isZoneTransition('world_map', 'zone_view')).toBe(true)
  })

  it('sortie de zone (safe_zone / zone_view → world_map)', () => {
    expect(isZoneTransition('safe_zone', 'world_map')).toBe(true)
    expect(isZoneTransition('zone_view', 'world_map')).toBe(true)
  })

  it('pas de déroulé pour les autres changements d\'écran', () => {
    expect(isZoneTransition('world_map', 'combat')).toBe(false)
    expect(isZoneTransition('safe_zone', 'quest_board')).toBe(false)
    expect(isZoneTransition('zone_view', 'combat')).toBe(false)
    expect(isZoneTransition('combat', 'world_map')).toBe(false)
  })

  it('pas de déroulé si l\'écran ne change pas / valeurs nulles', () => {
    expect(isZoneTransition('world_map', 'world_map')).toBe(false)
    expect(isZoneTransition(null, 'safe_zone')).toBe(false)
    expect(isZoneTransition('safe_zone', undefined)).toBe(false)
  })
})
