// Moteur de combat — logique pure, sans état React
// Appelé par le store Zustand et l'écran Combat.jsx

import { MONSTERS } from '../data/monsters'
import { SKILLS, getLevelBonus } from '../data/skills'
import { RESOURCES } from '../data/resources'
import { scaleMonsterStats, ZONE_MULTS, ZONE_ORDER } from '../data/zones'
import {
  checkIgnarethAwakening,
  checkSylvaraAwakening,
  checkVoltarisAwakening,
} from '../data/deities'

// ── Calcul de dégâts ──────────────────────────────────────────────────────────

/**
 * Calcule les dégâts d'une attaque de base : `max(1, ATK - DEF/2)` avec ±10% de variance.
 * @param {number} atk - Attaque/Force de l'attaquant
 * @param {number} def - Défense de la cible
 * @returns {number} Dégâts infligés (≥ 1)
 * @example calcBaseDamage(14, 6) // ≈ 11 (avec variance aléatoire)
 */
export function calcBaseDamage(atk, def) {
  const base = Math.max(1, atk - Math.floor(def / 2))
  const variance = 0.9 + Math.random() * 0.2 // 90%–110%
  return Math.max(1, Math.round(base * variance))
}

/**
 * Calcule les dégâts d'un skill actif selon son type et son niveau.
 */
export function calcSkillDamage(skill, heroStats, level = 1) {
  const template = SKILLS[skill.skillId]
  if (!template || template.type !== 'active') return 0

  const effect = template.effect
  if (!effect?.damage) return 0

  const baseStat =
    effect.damage.baseStat === 'intelligence' ? heroStats.intelligence : heroStats.strength

  let multiplier = effect.damage.multiplier
  // Bonus de niveau : +30% par niveau au-delà de 1
  multiplier += (level - 1) * 0.3

  return Math.max(1, Math.round(baseStat * multiplier))
}

// ── Ordre des tours ───────────────────────────────────────────────────────────

/**
 * Calcule l'ordre des combattants selon leur Agility.
 * Retourne un tableau d'ids triés du plus rapide au plus lent.
 * Format des combattants : { id, agility, isHero }
 */
export function calcTurnOrder(hero, enemies) {
  const combatants = [
    { id: 'hero', agility: hero.agility, isHero: true },
    ...enemies.map((e) => ({ id: e.id, agility: e.stats.spd, isHero: false })),
  ]
  return combatants.sort((a, b) => b.agility - a.agility)
}

// ── Coût d'un skill ───────────────────────────────────────────────────────────

/**
 * Calcule le coût scalé d'un skill selon son niveau.
 * S07 — chaque niveau au-delà de 1 applique la réduction `costReduction` du palier.
 * Lv 2 : -10% (par défaut). Lv 3 : -20%.
 * Retourne { mana, hp } arrondis (jamais < 0).
 */
export function getScaledSkillCost(template, level) {
  if (!template) return { mana: 0, hp: 0 }
  // SKL01 — anti-régression niveaux 4-5 : on garde la réduction du dernier palier défini.
  const reduction = getLevelBonus(template, level).costReduction ?? 0
  return {
    mana: Math.max(0, Math.round(template.cost.mana * (1 - reduction))),
    hp: Math.max(0, Math.round(template.cost.hp * (1 - reduction))),
  }
}

/**
 * Vérifie si le héros peut utiliser un skill (mana + hp suffisants).
 */
export function canUseSkill(skill, heroStats) {
  const template = SKILLS[skill.skillId]
  if (!template) return false
  if (skill.currentCooldown > 0) return false
  const cost = getScaledSkillCost(template, skill.level)
  if (heroStats.mana < cost.mana) return false
  if (heroStats.hp <= cost.hp) return false // ne peut pas se suicider avec
  return true
}

/**
 * Applique le coût d'un skill au héros et retourne les nouvelles stats.
 * B10 — applique aussi un éventuel `cost.stat_sacrifice` (réduction d'une stat).
 */
export function applySkillCost(skill, heroStats) {
  const template = SKILLS[skill.skillId]
  if (!template) return heroStats
  const cost = getScaledSkillCost(template, skill.level)
  const next = {
    ...heroStats,
    mana: heroStats.mana - cost.mana,
    hp: heroStats.hp - cost.hp,
  }
  const sac = getStatSacrifice(template)
  if (sac && typeof next[sac.stat] === 'number') {
    next[sac.stat] = Math.max(0, next[sac.stat] - sac.amount)
  }
  return next
}

/**
 * B10 — Retourne le sacrifice de stat d'un skill `{ stat, amount, permanent }`, ou null.
 */
export function getStatSacrifice(template) {
  return template?.cost?.stat_sacrifice ?? null
}

// ── Effets de statut (B05) ───────────────────────────────────────────────────
// Spec complète : DESIGN.md §B05-SPEC.
// Catégories : DoT (poison, burn), contrôle (stun), stat (slow, *_down, *_break).

const DOT_TYPES = ['poison', 'burn']
const MAX_ACTIVE_EFFECTS = 2

// Quelles stats chaque effet de catégorie "stat" multiplie par (1 - reduction).
const STAT_EFFECT_TARGETS = {
  slow: ['agility', 'spd'],
  defense_break: ['def'],
  atk_down: ['atk', 'strength'],
  max_hp_reduction: ['maxHp'],
  all_stats_down: ['strength', 'intelligence', 'agility', 'def', 'atk', 'spd'],
}
const DEFAULT_REDUCTION = { slow: 0.5 }

/**
 * Applique en début de tour les DoT, décrémente les durées, retire les expirés.
 * Ne mute ni `stats` ni `activeEffects`.
 * Retourne { newStats, remainingEffects, log, flags: { skipTurn, noHeal } }.
 */
export function tickStatusEffects(stats, activeEffects = []) {
  const newStats = { ...stats }
  const log = []
  const flags = { skipTurn: false, noHeal: false }

  activeEffects.forEach((effect) => {
    if (DOT_TYPES.includes(effect.type)) {
      const dmg = effect.tickDamage ?? 0
      newStats.hp = Math.max(0, (newStats.hp ?? 0) - dmg)
      const label = effect.type === 'burn' ? 'Burn' : 'Poison'
      log.push({ text: `${label} deals ${dmg} damage!`, type: 'status' })
    }
    if (effect.type === 'burn') flags.noHeal = true
    if (effect.type === 'stun') flags.skipTurn = true
  })

  // Décrémente les durées et retire les effets arrivés à expiration.
  const remainingEffects = activeEffects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0)

  return { newStats, remainingEffects, log, flags }
}

/**
 * Ajoute un effet de statut en respectant le plafond (MAX_ACTIVE_EFFECTS).
 * - même type présent → refresh (durée = max, valeurs = plus fortes), pas d'empilement
 * - sinon, si plafond atteint → nouvel effet ignoré
 * Retourne un nouveau tableau.
 */
export function applyStatusEffect(activeEffects = [], newEffect, max = MAX_ACTIVE_EFFECTS) {
  const existing = activeEffects.find((e) => e.type === newEffect.type)
  if (existing) {
    return activeEffects.map((e) => {
      if (e.type !== newEffect.type) return e
      return {
        ...e,
        duration: Math.max(e.duration, newEffect.duration),
        tickDamage: Math.max(e.tickDamage ?? 0, newEffect.tickDamage ?? 0) || undefined,
        reduction: Math.max(e.reduction ?? 0, newEffect.reduction ?? 0) || undefined,
      }
    })
  }
  if (activeEffects.length >= max) return [...activeEffects]
  return [...activeEffects, { ...newEffect }]
}

/**
 * Calcule les stats effectives en appliquant les modificateurs des effets "stat"
 * (slow, defense_break, atk_down, all_stats_down…). Réductions multiplicatives
 * (cumul → multiplication, jamais addition). Ne mute pas `baseStats`.
 * @param {Object<string, number>} baseStats - Stats de base de l'entité
 * @param {{type:string, reduction?:number}[]} [activeEffects=[]] - Effets actifs
 * @returns {Object<string, number>} Nouvelles stats réduites (copie)
 * @example getEffectiveStats({ def: 10 }, [{ type:'defense_break', reduction:0.3 }]) // { def: 7 }
 */
export function getEffectiveStats(baseStats, activeEffects = []) {
  const stats = { ...baseStats }
  activeEffects.forEach((effect) => {
    const targets = STAT_EFFECT_TARGETS[effect.type]
    if (!targets) return
    const reduction = effect.reduction ?? DEFAULT_REDUCTION[effect.type] ?? 0
    targets.forEach((key) => {
      if (typeof stats[key] === 'number') {
        stats[key] = Math.max(0, Math.round(stats[key] * (1 - reduction)))
      }
    })
  })
  return stats
}

/** Le soin est interdit tant qu'un effet `burn` est actif. */
export function canHeal(activeEffects = []) {
  return !activeEffects.some((e) => e.type === 'burn')
}

/** Vrai si un effet `stun` est présent (la cible saute son tour). */
export function isStunned(activeEffects = []) {
  return activeEffects.some((e) => e.type === 'stun')
}

/**
 * B12 — Vrai si un ennemi est trop fort pour être affronté en idle :
 * son niveau dépasse celui du héros de plus de `gap`.
 * @param {number} enemyLevel - Niveau de l'ennemi
 * @param {number} heroLevel - Niveau du héros
 * @param {number} [gap=5] - Écart toléré
 * @returns {boolean}
 * @example isEnemyTooStrong(12, 5) // true (12 > 5+5)
 */
export function isEnemyTooStrong(enemyLevel, heroLevel, gap = 5) {
  return enemyLevel > heroLevel + gap
}

// ── Drops ─────────────────────────────────────────────────────────────────────

/**
 * Calcule les drops d'un monstre tué (skill, ressources, gold, exp).
 * Le bonus de Chance du héros augmente les probabilités (+0,5%/point au-delà de 5).
 * Au moins 1 ressource est toujours droppée.
 * @param {string} monsterId - Id du monstre (clé de MONSTERS)
 * @param {number} [heroChance=5] - Stat Chance du héros
 * @returns {{ skillDrop: string|null, resources: {id:string, qty:number}[], gold:number, exp:number }}
 * @example calcDrops('ashwood_wolf', 10)
 */
export function calcDrops(monsterId, heroChance = 5) {
  const monster = MONSTERS[monsterId]
  if (!monster) return { skillDrop: null, resources: [] }

  // Modificateur de drop lié à la stat Chance du héros
  // Chance = 5 (base) → aucun bonus. Chaque point au-delà de 5 = +0.5%
  const chanceBonus = Math.max(0, (heroChance - 5) * 0.005)

  // Skill drop
  let skillDrop = null
  const skillChance = (monster.skillDrop?.chance ?? 0) + chanceBonus
  if (Math.random() < skillChance) {
    skillDrop = monster.skillDrop.skillId
  }

  // Resource drops — au moins 1 ressource toujours droppée
  const resources = []
  let atLeastOne = false

  monster.resourceDrops.forEach((drop) => {
    const adjustedChance = drop.chance + chanceBonus
    if (Math.random() < adjustedChance) {
      const qty = drop.qty.min + Math.floor(Math.random() * (drop.qty.max - drop.qty.min + 1))
      resources.push({ id: drop.resourceId, qty })
      atLeastOne = true
    }
  })

  // Garantir au moins 1 ressource
  if (!atLeastOne && monster.resourceDrops.length > 0) {
    const drop = monster.resourceDrops[0]
    resources.push({ id: drop.resourceId, qty: drop.qty.min })
  }

  // Gold
  const gold =
    monster.goldReward.min +
    Math.floor(Math.random() * (monster.goldReward.max - monster.goldReward.min + 1))

  return { skillDrop, resources, gold, exp: monster.expReward }
}

// ── Scaling des monstres pour un combat ──────────────────────────────────────

/**
 * Crée les données de combat d'un ennemi scalé selon le run actuel.
 */
export function buildEnemy(monsterId, zoneId, runCount) {
  const monster = MONSTERS[monsterId]
  if (!monster) return null

  const scaledStats = scaleMonsterStats(monster.baseStats, zoneId, runCount)

  return {
    id: `${monsterId}_${Date.now()}_${Math.random()}`,
    monsterId,
    name: monster.name,
    rank: monster.rank,
    stats: scaledStats,
    currentHp: scaledStats.hp,
    activeEffects: [],
    skillDrop: monster.skillDrop,
    resourceDrops: monster.resourceDrops,
    goldReward: monster.goldReward,
    expReward: monster.expReward,
    bossMechanics: monster.bossMechanics ?? null, // BSS01/02/03
  }
}

/**
 * B03 — Nombre d'ennemis pour un combat, selon le rang et la zone.
 * - élite / boss / demon_lord → toujours 1
 * - zone 1 (index 0) → 1 à 2 ; zone 2+ → 1 à 3
 * @param {{rank:string}} monster - Template du monstre
 * @param {string} zoneId - Id de la zone (pour le palier)
 * @param {() => number} [rng=Math.random] - Générateur injectable (tests)
 * @returns {number} Nombre d'ennemis (0 si monstre nul)
 * @example getEnemyCount({ rank:'common' }, 'ashenvale', () => 0.9) // 2
 */
export function getEnemyCount(monster, zoneId, rng = Math.random) {
  if (!monster) return 0
  if (['elite', 'boss', 'demon_lord'].includes(monster.rank)) return 1
  const zoneIndex = ZONE_ORDER.indexOf(zoneId)
  const max = zoneIndex <= 0 ? 2 : 3 // zone 1 → max 2, zone 2+ → max 3
  return 1 + Math.floor(rng() * max) // 1..max
}

/**
 * Génère les ennemis d'un combat normal en zone (B03 — 1 à 3 selon zone/rang).
 * Les boss/élites sont toujours seuls.
 * @param {string} monsterId - Id du monstre
 * @param {string} zoneId - Id de la zone (scaling + nombre)
 * @param {number} runCount - Numéro de run (scaling des stats)
 * @returns {object[]} Tableau d'ennemis prêts au combat (vide si monstre inconnu)
 * @example generateEnemies('ashwood_wolf', 'ashenvale', 1)
 */
export function generateEnemies(monsterId, zoneId, runCount) {
  const monster = MONSTERS[monsterId]
  if (!monster) return []

  const count = getEnemyCount(monster, zoneId)
  return Array.from({ length: count }, () => buildEnemy(monsterId, zoneId, runCount))
}

// ── IA ennemie ────────────────────────────────────────────────────────────────

/**
 * Décide de l'action d'un ennemi.
 * Simple pour le POC : attaque basique 80% du temps.
 */
export function enemyAI(enemy, heroStats) {
  // POC : toujours attaque basique (TODO B05 — diversifier l'IA avec skills/effets)
  const dmg = calcBaseDamage(enemy.stats.atk, heroStats.def)
  return {
    type: 'attack',
    damage: dmg,
    log: `${enemy.name} attacks for ${dmg} damage!`,
  }
}

// ── Vérification des conditions d'éveil ──────────────────────────────────────

/**
 * Vérifie si une condition d'éveil divin est remplie après un combat.
 * Retourne l'id de la divinité à invoquer, ou null.
 */
export function checkAwakeningConditions(hero, worldState) {
  // Si le héros a déjà une divinité, pas de nouvel éveil
  if (hero.deity) return null

  if (checkIgnarethAwakening({ battleLog: hero.battleLog, dayCount: worldState.dayCount })) {
    return 'ignareth'
  }

  if (checkSylvaraAwakening({ combatEntryLog: hero.combatEntryLog })) {
    return 'sylvara'
  }

  // DV04 — Voltaris : 5 victoires sous 30% HP
  if (checkVoltarisAwakening({ battleLog: hero.battleLog })) {
    return 'voltaris'
  }

  return null
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

/**
 * Vrai si une entité est vaincue (PV ≤ 0).
 * @param {{currentHp:number}} entity
 * @returns {boolean}
 * @example isDefeated({ currentHp: 0 }) // true
 */
export function isDefeated(entity) {
  return entity.currentHp <= 0
}

/**
 * Ratio de PV restant d'une entité, borné [0, 1].
 * @param {{currentHp:number, stats?:{maxHp?:number, hp?:number}}} entity
 * @returns {number} Pourcentage de vie (0 → 1)
 * @example calcHpPercent({ currentHp: 50, stats: { maxHp: 100 } }) // 0.5
 */
export function calcHpPercent(entity) {
  const maxHp = entity.stats?.maxHp ?? entity.stats?.hp ?? 1
  return Math.max(0, Math.min(1, entity.currentHp / maxHp))
}

/**
 * Calcule l'XP de niveau donnée par un combat (somme de l'exp des ennemis tués).
 * @param {{expReward?:number}[]} defeatedEnemies
 * @returns {number} Total d'XP
 * @example calcExpGain([{ expReward: 10 }, { expReward: 8 }]) // 18
 */
export function calcExpGain(defeatedEnemies) {
  return defeatedEnemies.reduce((total, e) => total + (e.expReward ?? 0), 0)
}

/**
 * Applique les gains d'exp au héros ; en cas de level-up, renvoie les bonus de stats.
 * @param {Object} heroStats - Stats du héros (maxHp, maxMana, strength, intelligence…)
 * @param {number} currentExp - Exp actuelle
 * @param {number} expToNext - Seuil du prochain niveau
 * @param {number} expGain - Exp gagnée
 * @returns {{levelUp:boolean, newExp:number, newExpToNext?:number, statBonuses?:Object}}
 * @example applyExpGain(stats, 90, 100, 20) // { levelUp: true, ... }
 */
export function applyExpGain(heroStats, currentExp, expToNext, expGain) {
  const newExp = currentExp + expGain
  if (newExp >= expToNext) {
    // Level up — stats +10%
    return {
      levelUp: true,
      newExp: newExp - expToNext,
      newExpToNext: Math.round(expToNext * 1.5),
      statBonuses: {
        maxHp: Math.round(heroStats.maxHp * 0.1),
        maxMana: Math.round(heroStats.maxMana * 0.1),
        strength: Math.round(heroStats.strength * 0.05),
        intelligence: Math.round(heroStats.intelligence * 0.05),
        def: Math.round(heroStats.def * 0.05),
      },
    }
  }
  return { levelUp: false, newExp, newExpToNext: expToNext }
}
