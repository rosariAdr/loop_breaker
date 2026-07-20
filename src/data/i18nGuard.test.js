// FIX-I18N01 — Garde-fou i18n : le jeu est 100 % ANGLAIS côté joueur (décision 2026-07-19).
// Scanne les champs visibles joueur des registres de data et échoue si une chaîne contient
// des caractères accentués français. Les commentaires de code restent en FR (convention repo) —
// seuls les CHAMPS de data affichés à l'écran sont couverts.
//
// Périmètre : les registres statiques touchés par FIX-I18N01 + la chaîne MQ (vérifiée saine).
// À étendre au fil de l'eau quand un nouveau registre visible joueur est créé.
import { describe, it, expect } from 'vitest'
import { ONBOARDING_QUESTS, ONBOARDING_QUEST_NPC } from './onboardingQuests'
import { RANK_TIERS } from './ranks'
import { STAT_MILESTONES } from './statMilestones'
import { SETS } from './sets'
import { CODEX_RULES } from './codexRules'
import { MAIN_QUESTS } from './mainQuests'

// Champs affichés à l'écran (les ids/clefs techniques sont hors périmètre).
const VISIBLE_FIELDS = new Set([
  'name',
  'label',
  'title',
  'description',
  'desc',
  'flavorText',
  'body',
  'text',
])

const FRENCH_ACCENTS = /[àâäéèêëîïôöùûüçœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]/

/** Parcourt récursivement `obj` et collecte les champs visibles contenant des accents FR. */
function findFrenchStrings(obj, path = '', out = []) {
  if (!obj || typeof obj !== 'object') return out
  for (const [key, value] of Object.entries(obj)) {
    const here = path ? `${path}.${key}` : key
    if (typeof value === 'string') {
      if (VISIBLE_FIELDS.has(key) && FRENCH_ACCENTS.test(value)) out.push(`${here} = "${value}"`)
    } else if (typeof value === 'object') {
      findFrenchStrings(value, here, out)
    }
  }
  return out
}

describe('FIX-I18N01 — aucun texte français visible joueur dans les data', () => {
  const registries = {
    ONBOARDING_QUESTS,
    ONBOARDING_QUEST_NPC,
    RANK_TIERS,
    STAT_MILESTONES,
    SETS,
    CODEX_RULES,
    MAIN_QUESTS,
  }

  for (const [name, registry] of Object.entries(registries)) {
    it(`${name} : champs visibles 100 % anglais`, () => {
      expect(findFrenchStrings(registry)).toEqual([])
    })
  }

  it('les labels de rang sont bien traduits (échantillon)', () => {
    const labels = RANK_TIERS.map((t) => t.label)
    expect(labels).toContain('Iron')
    expect(labels).toContain('Supreme')
    expect(labels).not.toContain('Fer')
    expect(labels).not.toContain('Suprême')
  })
})
