// ANIM02 — VFX de combat propres à chaque skill.
//
// On DÉRIVE le rendu visuel des champs déjà présents sur le template (type de dégât,
// stat de base, AoE, multiplicateur) plutôt que d'annoter les ~30 skills à la main.
// Un champ `skill.vfx` explicite peut surcharger la dérivation si besoin.

// Couleur par type de dégât (flash élémentaire teinté).
export const ELEMENT_COLORS = {
  physical: '#e8d8b0', // acier / neutre
  poison: '#86c544', // vert
  fire: '#ff7a33', // orange
  lightning: '#ffd24a', // jaune
  true: '#c79cff', // violet (dégâts d'âme — Soul Rend, en réalité typé `magical`)
  ice: '#7ec8ff',
  holy: '#ffe9a8',
  dark: '#a060c0',
  arcane: '#7aa2ff',
  // ANIM03 — types réellement utilisés par les skills (`magical` : 2 skills dont Soul Rend ;
  // `percentage` : skills proportionnels) — sans ces entrées le rendu retombait sur physique/mêlée.
  magical: '#b388ff', // violet arcane
  percentage: '#e06b8b', // rose/crimson (effets proportionnels)
}

// Les éléments « à distance » déclenchent un projectile ; les autres, une frappe au corps-à-corps.
const RANGED_ELEMENTS = new Set([
  'fire',
  'lightning',
  'true',
  'ice',
  'arcane',
  'holy',
  'dark',
  'magical', // ANIM03
  'percentage', // ANIM03
])

/**
 * Décrit le rendu visuel d'un skill.
 * @param {object} template - entrée de SKILLS
 * @returns {{element:string, color:string, mode:'projectile'|'melee', aoe:boolean, heavy:boolean}}
 */
export function getSkillVfx(template) {
  // surcharge explicite éventuelle : { element?, mode?, color? }
  const override = template?.vfx ?? {}
  const dmg = template?.effect?.damage
  const element = override.element ?? dmg?.type ?? 'physical'
  const isRanged = override.mode
    ? override.mode === 'projectile'
    : !!dmg && (RANGED_ELEMENTS.has(element) || dmg.baseStat === 'intelligence')
  const mult = dmg?.multiplier ?? 0
  return {
    element,
    color: override.color ?? ELEMENT_COLORS[element] ?? ELEMENT_COLORS.physical,
    mode: isRanged ? 'projectile' : 'melee',
    aoe: !!template?.effect?.aoe,
    // gros skills → windup marqué (gros multiplicateur ou skill suprême)
    heavy: mult >= 1.8 || template?.container === 'supreme',
  }
}
