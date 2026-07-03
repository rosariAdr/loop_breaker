// HS-STATPERK01 — Paliers de stats (« The Gamer ») : 1 palier tous les 35 points par attribut,
// chacun débloquant un bonus passif CUMULATIF. Source de vérité consommée par :
//  • HSV2-06 (jalons visuels du HeroSheet : palier franchi = « on » + libellé du perk) ;
//  • le combat (`calcSkillDamage`/`calcDrops`/`enemyAI`) — effet nul sous 35 pts.
export const STAT_MILESTONE_STEP = 35

export const STAT_MILESTONES = {
  strength: { per: 0.03, effect: 'physDmg', label: '+3% dégâts physiques / palier' },
  agility: { per: 0.03, effect: 'evasion', label: '+3% vitesse & esquive / palier' },
  intelligence: { per: 0.03, effect: 'magicDmg', label: '+3% dégâts magiques / palier' },
  chance: { per: 0.02, effect: 'luck', label: '+2% drop & crit / palier' },
  def: { per: 0.03, effect: 'reduction', label: '+3% réduction des dégâts / palier' },
}

// Nombre de paliers franchis pour une valeur d'attribut donnée.
export function milestonesFor(value) {
  return Math.floor(Math.max(0, value ?? 0) / STAT_MILESTONE_STEP)
}

// Bonus cumulés dérivés des stats effectives du héros.
export function getStatMilestoneBonuses(stats = {}) {
  return {
    physDmg: milestonesFor(stats.strength) * STAT_MILESTONES.strength.per,
    magicDmg: milestonesFor(stats.intelligence) * STAT_MILESTONES.intelligence.per,
    evasion: milestonesFor(stats.agility) * STAT_MILESTONES.agility.per,
    luck: milestonesFor(stats.chance) * STAT_MILESTONES.chance.per,
    reduction: milestonesFor(stats.def) * STAT_MILESTONES.def.per,
  }
}
