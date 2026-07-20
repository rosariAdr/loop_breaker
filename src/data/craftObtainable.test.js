// FIX-CRAFTSRC01 — test d'intégrité « obtainable » : chaque ingrédient de chaque recette
// (recettes autorées + variantes forge dérivées des templates) doit être OBTENABLE —
// c.-à-d. droppé par au moins un monstre (`RESOURCES[id].sources` non vide).
// Contexte : bat_wing / void_fang / troll_blood avaient `sources: []` (droppés par personne,
// vendus nulle part) → 2 recettes d'alchimie et 4 variantes de forge étaient incraftables.
// Décision 2026-07-19 (option b) : recentrer les recettes sur des ingrédients droppables
// EXISTANTS — pas de nouveaux drops, pas de rééquilibrage des taux.
import { describe, it, expect } from 'vitest'
import { ALL_CRAFT_RECIPES } from './craftRecipes'
import { RESOURCES } from './resources'

// Les 3 ingrédients morts historiques : plus JAMAIS référencés par une recette.
const DEAD_INGREDIENTS = ['bat_wing', 'void_fang', 'troll_blood']

describe('FIX-CRAFTSRC01 — intégrité « obtainable » des recettes', () => {
  it('chaque ingrédient de chaque recette est droppé par au moins un monstre', () => {
    const violations = []
    for (const recipe of ALL_CRAFT_RECIPES) {
      for (const combo of recipe.combinations ?? []) {
        for (const ingredientId of Object.keys(combo.ingredients ?? {})) {
          const res = RESOURCES[ingredientId]
          if (!res) violations.push(`${recipe.id} / ${combo.id} → ${ingredientId} (id inconnu)`)
          else if (!(res.sources?.length > 0))
            violations.push(`${recipe.id} / ${combo.id} → ${ingredientId} (sources vides)`)
        }
      }
    }
    expect(violations, `Ingrédients inobtenables :\n${violations.join('\n')}`).toEqual([])
  })

  it('les 3 ingrédients morts (bat_wing / void_fang / troll_blood) ne sont plus dans aucune recette', () => {
    const uses = []
    for (const recipe of ALL_CRAFT_RECIPES) {
      for (const combo of recipe.combinations ?? []) {
        for (const dead of DEAD_INGREDIENTS) {
          if (combo.ingredients?.[dead] != null) uses.push(`${recipe.id} / ${combo.id} → ${dead}`)
        }
      }
    }
    expect(uses, `Ingrédients morts encore référencés :\n${uses.join('\n')}`).toEqual([])
  })
})
