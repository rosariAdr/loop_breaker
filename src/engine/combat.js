// Moteur de combat — logique pure, sans état React
// Appelé par le store Zustand et l'écran Combat.jsx

import { MONSTERS } from '../data/monsters'
import { SKILLS, isDivineSkillInheritable } from '../data/skills'
import { RESOURCES } from '../data/resources'
import { scaleMonsterStats, ZONE_MULTS } from '../data/zones'
import { checkIgnarethAwakening, checkSylvaraAwakening } from '../data/deities'

// ── Calcul de dégâts ──────────────────────────────────────────────────────────

/**
 * Calcule les dégâts d'une attaque de base.
 * dmg = max(1, ATK - DEF/2) avec une variance de ±10%
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

  const baseStat = effect.damage.baseStat === 'intelligence'
    ? heroStats.intelligence
    : heroStats.strength

  let multiplier = effect.damage.multiplier
  // Bonus de niveau : +30% par niveau au-delà de 1
  multiplier += (level - 1) * 0.30

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
    ...enemies.map(e => ({ id: e.id, agility: e.stats.spd, isHero: false })),
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
  const reduction = template.levelBonuses?.[level]?.costReduction ?? 0
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
 */
export function applySkillCost(skill, heroStats) {
  const template = SKILLS[skill.skillId]
  if (!template) return heroStats
  const cost = getScaledSkillCost(template, skill.level)
  return {
    ...heroStats,
    mana: heroStats.mana - cost.mana,
    hp: heroStats.hp - cost.hp,
  }
}

// ── Application des effets de statut ─────────────────────────────────────────

/**
 * Applique les effets de statut actifs (poison, etc.) au début du tour.
 * Retourne { newStats, expiredEffects, log }.
 */
export function applyStatusEffects(stats, activeEffects) {
  let newStats = { ...stats }
  const expiredEffects = []
  const log = []

  activeEffects.forEach(effect => {
    if (effect.type === 'poison') {
      const dmg = effect.tickDamage
      newStats.hp = Math.max(0, newStats.hp - dmg)
      log.push({ text: `Poison deals ${dmg} damage!`, type: 'status' })
    }
    if (effect.duration <= 1) {
      expiredEffects.push(effect.id)
    }
  })

  return { newStats, expiredEffects, log }
}

// ── Drops ─────────────────────────────────────────────────────────────────────

/**
 * Calcule les drops d'un monstre tué.
 * Retourne { skillDrop: string|null, resources: [{ id, qty }] }
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

  monster.resourceDrops.forEach(drop => {
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
  const gold = monster.goldReward.min +
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
  }
}

/**
 * Génère 1 à 3 ennemis pour un combat normal en zone.
 * Les boss sont toujours seuls.
 */
export function generateEnemies(monsterId, zoneId, runCount) {
  const monster = MONSTERS[monsterId]
  if (!monster) return []

  const isBoss = monster.rank === 'boss' || monster.rank === 'demon_lord' || monster.rank === 'elite'
  const count = isBoss ? 1 : Math.floor(Math.random() * 3) + 2

  return Array.from({ length: count }, () => buildEnemy(monsterId, zoneId, runCount))
}

// ── IA ennemie ────────────────────────────────────────────────────────────────

/**
 * Décide de l'action d'un ennemi.
 * Simple pour le POC : attaque basique 80% du temps.
 */
export function enemyAI(enemy, heroStats) {
  // 80% attaque basique
  const roll = Math.random()
  if (roll < 0.80 || true) { // simplifié pour le POC
    const dmg = calcBaseDamage(enemy.stats.atk, heroStats.def)
    return {
      type: 'attack',
      damage: dmg,
      log: `${enemy.name} attacks for ${dmg} damage!`,
    }
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

  return null
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

export function isDefeated(entity) {
  return entity.currentHp <= 0
}

export function calcHpPercent(entity) {
  const maxHp = entity.stats?.maxHp ?? entity.stats?.hp ?? 1
  return Math.max(0, Math.min(1, entity.currentHp / maxHp))
}

/**
 * Calcule l'XP de niveau donnée par un combat.
 * Pour le héros : somme de l'exp de chaque ennemi tué.
 */
export function calcExpGain(defeatedEnemies) {
  return defeatedEnemies.reduce((total, e) => total + (e.expReward ?? 0), 0)
}

/**
 * Applique les gains d'exp au héros et retourne le nouveau level si level up.
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
        maxHp: Math.round(heroStats.maxHp * 0.10),
        maxMana: Math.round(heroStats.maxMana * 0.10),
        strength: Math.round(heroStats.strength * 0.05),
        intelligence: Math.round(heroStats.intelligence * 0.05),
        def: Math.round(heroStats.def * 0.05),
      },
    }
  }
  return { levelUp: false, newExp, newExpToNext: expToNext }
}
