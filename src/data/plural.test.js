// FIX-PLURAL01 — pluralisation des noms de monstres dans les quêtes GÉNÉRÉES.
// Cause racine : villageQuests.js construisait les libellés avec un pluriel naïf
// `name + 's'` → « Cull the Ashwood Wolfs » (Greywatch), « Russet Foxs » (Ironhaven).
// Fix data-driven : champ optionnel `namePlural` (Wolves/Foxes + future-proof
// Thunderhooves/Bone Colossi) + helper `monsterPlural` + call sites.
import { describe, it, expect } from 'vitest'
import { MONSTERS, monsterPlural } from './monsters'
import { generateVillageQuestPool } from './villageQuests'

describe('FIX-PLURAL01 — monsterPlural (data-driven)', () => {
  it('utilise namePlural quand il existe (pluriels irréguliers)', () => {
    expect(monsterPlural(MONSTERS.ashwood_wolf)).toBe('Ashwood Wolves')
    expect(monsterPlural(MONSTERS.russet_fox)).toBe('Russet Foxes')
  })

  it("retombe sur name + 's' pour les pluriels réguliers", () => {
    // thicket_hare est nommé « Fire Hare » (SKD02) ; pas de namePlural → défaut régulier.
    expect(monsterPlural(MONSTERS.thicket_hare)).toBe('Fire Hares')
    expect(monsterPlural(MONSTERS.tuskmaw_boar)).toBe('Tuskmaw Boars')
  })

  it('est défensif (monstre absent → chaîne vide)', () => {
    expect(monsterPlural(undefined)).toBe('')
    expect(monsterPlural({})).toBe('')
  })
})

describe('FIX-PLURAL01 — plus aucun pluriel fautif dans les quêtes générées', () => {
  it('aucun nom/label de quête de village ne contient « Wolfs » ou « Foxs »', () => {
    const offenders = []
    for (const loc of ['greywatch', 'millhaven', 'ironhaven']) {
      for (const q of generateVillageQuestPool(loc)) {
        const texts = [q.name, q.description, ...q.objectives.map((o) => o.label)]
        for (const t of texts) {
          if (/Wolfs|Foxs|Colossuss|Thunderhoofs/.test(t ?? '')) offenders.push(`${q.id} → ${t}`)
        }
      }
    }
    expect(offenders, `Pluriels fautifs :\n${offenders.join('\n')}`).toEqual([])
  })
})
