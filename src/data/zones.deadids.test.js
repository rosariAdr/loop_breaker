// FIX-ZONELIST01 — garde-fou anti-ids-morts dans zones.js.
// La liste `monsters` zone-level (legacy pré-MON01) a été retirée car elle contenait
// 4 ids inexistants (rotting_shambler/gloom_bat/bog_shambler/grave_knight) et n'avait
// aucun consommateur runtime. Ce test pinne que tout id de monstre encore référencé
// dans zones.js (listes `monsters` des huntingSpots) existe bien dans MONSTERS.
import { describe, it, expect } from 'vitest'
import { ZONES } from './zones'
import { MONSTERS } from './monsters'

describe('FIX-ZONELIST01 — aucun id de monstre mort dans zones.js', () => {
  it('chaque monstre listé sur un huntingSpot existe dans MONSTERS', () => {
    const dead = []
    for (const zone of Object.values(ZONES)) {
      for (const spot of zone.huntingSpots ?? []) {
        for (const id of spot.monsters ?? []) {
          if (!MONSTERS[id]) dead.push(`${zone.id}/${spot.id} → ${id}`)
        }
      }
    }
    expect(dead, `ids de monstre morts :\n${dead.join('\n')}`).toEqual([])
  })

  it('la liste `monsters` zone-level legacy a bien été retirée', () => {
    for (const zone of Object.values(ZONES)) {
      expect(zone.monsters, `${zone.id} garde une liste monsters zone-level`).toBeUndefined()
    }
  })
})
