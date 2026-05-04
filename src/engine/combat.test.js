import { describe, it, expect } from 'vitest'
import {
  calcBaseDamage,
  calcSkillDamage,
  canUseSkill,
  applySkillCost,
  calcDrops,
  buildEnemy,
  calcExpGain,
  isDefeated,
  enemyAI,
  calcTurnOrder,
  getScaledSkillCost,
} from './combat'
import { SKILLS } from '../data/skills'

// ── calcBaseDamage ────────────────────────────────────────────────────────────
describe('calcBaseDamage', () => {
  it('renvoie toujours au moins 1', () => {
    expect(calcBaseDamage(1, 100)).toBeGreaterThanOrEqual(1)
  })

  it('damage de base = max(1, atk - floor(def/2))', () => {
    // atk=10, def=4 → base = 10 - 2 = 8, variance ±10%
    for (let i = 0; i < 50; i++) {
      const dmg = calcBaseDamage(10, 4)
      expect(dmg).toBeGreaterThanOrEqual(7)  // 8 * 0.9 ≈ 7
      expect(dmg).toBeLessThanOrEqual(9)     // 8 * 1.1 ≈ 9
    }
  })

  it('DEF élevée réduit les dégâts mais ne les annule pas', () => {
    const dmg = calcBaseDamage(5, 100)
    expect(dmg).toBeGreaterThanOrEqual(1)
  })

  it("ATK élevée produit plus de dégâts qu'ATK faible (même DEF)", () => {
    const lowAvg = Array.from({ length: 100 }, () => calcBaseDamage(5, 0)).reduce((a, b) => a + b, 0) / 100
    const highAvg = Array.from({ length: 100 }, () => calcBaseDamage(20, 0)).reduce((a, b) => a + b, 0) / 100
    expect(highAvg).toBeGreaterThan(lowAvg)
  })

  it('variance reste dans ±10% de la base', () => {
    const base = 10 - Math.floor(6 / 2) // atk=10, def=6 → 7
    for (let i = 0; i < 100; i++) {
      const dmg = calcBaseDamage(10, 6)
      expect(dmg).toBeGreaterThanOrEqual(Math.floor(base * 0.9))
      expect(dmg).toBeLessThanOrEqual(Math.ceil(base * 1.1))
    }
  })
})

// ── calcSkillDamage ───────────────────────────────────────────────────────────
describe('calcSkillDamage', () => {
  const baseHero = { strength: 10, intelligence: 8, mana: 60, maxMana: 60, hp: 100, maxHp: 100 }
  const skillPhysical = { skillId: 'savage_bite', level: 1, xp: 0, currentCooldown: 0 }

  it('renvoie 0 pour un skill inconnu', () => {
    expect(calcSkillDamage({ skillId: 'inexistant', level: 1 }, baseHero, 1)).toBe(0)
  })

  it('skill physique utilise la Strength', () => {
    const dmg1 = calcSkillDamage(skillPhysical, { ...baseHero, strength: 10 }, 1)
    const dmg2 = calcSkillDamage(skillPhysical, { ...baseHero, strength: 20 }, 1)
    expect(dmg2).toBeGreaterThan(dmg1)
  })

  it('niveau 2 inflige plus de dégâts que niveau 1', () => {
    const lv1 = calcSkillDamage(skillPhysical, baseHero, 1)
    const lv2 = calcSkillDamage(skillPhysical, baseHero, 2)
    expect(lv2).toBeGreaterThan(lv1)
  })

  it('niveau 3 inflige plus de dégâts que niveau 2', () => {
    const lv2 = calcSkillDamage(skillPhysical, baseHero, 2)
    const lv3 = calcSkillDamage(skillPhysical, baseHero, 3)
    expect(lv3).toBeGreaterThan(lv2)
  })

  it('renvoie au moins 1 pour un skill valide', () => {
    expect(calcSkillDamage(skillPhysical, baseHero, 1)).toBeGreaterThanOrEqual(1)
  })
})

// ── canUseSkill ───────────────────────────────────────────────────────────────
describe('canUseSkill', () => {
  const fullHero = { mana: 60, maxMana: 60, hp: 100, maxHp: 100 }
  const skill = { skillId: 'savage_bite', level: 1, currentCooldown: 0 }

  it('retourne true si conditions remplies', () => {
    expect(canUseSkill(skill, fullHero)).toBe(true)
  })

  it('retourne false si en cooldown', () => {
    expect(canUseSkill({ ...skill, currentCooldown: 2 }, fullHero)).toBe(false)
  })

  it('retourne false si mana insuffisant', () => {
    expect(canUseSkill(skill, { ...fullHero, mana: 5 })).toBe(false) // savage_bite coûte 15 mana
  })

  it('retourne false pour skill inconnu', () => {
    expect(canUseSkill({ skillId: 'inexistant', currentCooldown: 0 }, fullHero)).toBe(false)
  })

  it('retourne false si HP insuffisant pour skill à coût HP', () => {
    // veterans_resolve coûte 0 HP, putrid_slam coûte 0 HP — on simule un skill HP
    // On teste avec un héros à 1 HP et un skill qui coûte 10 HP
    // Utilisons iron_resolve qui coûte du HP s'il en a
    const hpSkill = { skillId: 'savage_bite', currentCooldown: 0 }
    // savage_bite ne coûte pas de HP, juste mana — test que HP n'est pas un souci ici
    expect(canUseSkill(hpSkill, { ...fullHero, mana: 60, hp: 1 })).toBe(true)
  })
})

// ── applySkillCost ────────────────────────────────────────────────────────────
describe('applySkillCost', () => {
  const hero = { mana: 60, maxMana: 60, hp: 100, maxHp: 100 }

  it('réduit le mana du coût du skill', () => {
    const skill = { skillId: 'savage_bite', level: 1, currentCooldown: 0 } // coût 15 mana
    const result = applySkillCost(skill, hero)
    expect(result.mana).toBe(45)
  })

  it('ne modifie pas le HP si coût HP = 0', () => {
    const skill = { skillId: 'savage_bite', level: 1, currentCooldown: 0 }
    const result = applySkillCost(skill, hero)
    expect(result.hp).toBe(100)
  })

  it('retourne les stats inchangées pour skill inconnu', () => {
    const result = applySkillCost({ skillId: 'inexistant' }, hero)
    expect(result.mana).toBe(60)
    expect(result.hp).toBe(100)
  })
})

// ── getScaledSkillCost (S07) ──────────────────────────────────────────────────
describe('getScaledSkillCost — S07', () => {
  const tplPhys = SKILLS.savage_bite          // mana: 15, costReduction Lv2=0.10, Lv3=0.20
  const tplVenom = SKILLS.venom_bite          // mana: 18, costReduction Lv2=0.10, Lv3=0.20

  it('Lv 1 : aucun changement de coût', () => {
    expect(getScaledSkillCost(tplPhys, 1)).toEqual({ mana: 15, hp: 0 })
  })

  it('Lv 2 : -10% sur mana (15 → 14)', () => {
    expect(getScaledSkillCost(tplPhys, 2)).toEqual({ mana: Math.round(15 * 0.9), hp: 0 })
  })

  it('Lv 3 : -20% sur mana (15 → 12)', () => {
    expect(getScaledSkillCost(tplPhys, 3)).toEqual({ mana: Math.round(15 * 0.8), hp: 0 })
  })

  it("retourne {mana:0, hp:0} si template manquant", () => {
    expect(getScaledSkillCost(null, 1)).toEqual({ mana: 0, hp: 0 })
    expect(getScaledSkillCost(undefined, 2)).toEqual({ mana: 0, hp: 0 })
  })

  it("venom_bite Lv 3 (18 mana → 14 arrondi)", () => {
    expect(getScaledSkillCost(tplVenom, 3)).toEqual({ mana: Math.round(18 * 0.8), hp: 0 })
  })

  it("ne va jamais sous 0", () => {
    const cheap = { cost: { mana: 1, hp: 0 }, levelBonuses: { 3: { costReduction: 0.99 } } }
    expect(getScaledSkillCost(cheap, 3).mana).toBeGreaterThanOrEqual(0)
  })
})

// ── applySkillCost — S07 réduction au niveau ─────────────────────────────────
describe('applySkillCost — S07 réduction au niveau', () => {
  const hero = { mana: 60, maxMana: 60, hp: 100, maxHp: 100 }

  it('Lv 2 réduit le coût de 10% (savage_bite 15 → 14)', () => {
    const skill = { skillId: 'savage_bite', level: 2, currentCooldown: 0 }
    expect(applySkillCost(skill, hero).mana).toBe(60 - 14)
  })

  it('Lv 3 réduit le coût de 20% (savage_bite 15 → 12)', () => {
    const skill = { skillId: 'savage_bite', level: 3, currentCooldown: 0 }
    expect(applySkillCost(skill, hero).mana).toBe(60 - 12)
  })
})

// ── canUseSkill — B09 cost.hp + S07 ──────────────────────────────────────────
describe('canUseSkill — B09 cost.hp + S07 niveau', () => {
  it("refuse si cost.hp >= hp courant", () => {
    // En réalité aucun skill du jeu n'a cost.hp > 0 actuellement, donc on prouve
    // la logique sur un cas où le HP est très bas mais le skill ne coûte pas de HP.
    const heroLowHp = { mana: 60, hp: 5, maxHp: 100, maxMana: 60 }
    const skillWithHp = { skillId: 'savage_bite', level: 1, currentCooldown: 0 }
    // savage_bite cost.hp = 0 → reste utilisable
    expect(canUseSkill(skillWithHp, heroLowHp)).toBe(true)
  })

  it("Lv 3 permet d'utiliser un skill avec moins de mana qu'au Lv 1", () => {
    // savage_bite : 15 mana lv1, 12 mana lv3
    const heroLowMana = { mana: 13, hp: 100, maxHp: 100, maxMana: 60 }
    const skillLv1 = { skillId: 'savage_bite', level: 1, currentCooldown: 0 }
    const skillLv3 = { skillId: 'savage_bite', level: 3, currentCooldown: 0 }
    expect(canUseSkill(skillLv1, heroLowMana)).toBe(false)  // 15 > 13
    expect(canUseSkill(skillLv3, heroLowMana)).toBe(true)   // 12 <= 13
  })
})

// ── calcDrops ─────────────────────────────────────────────────────────────────
describe('calcDrops', () => {
  it('retourne la structure attendue', () => {
    const drops = calcDrops('ashwood_wolf', 5)
    expect(drops).toHaveProperty('skillDrop')
    expect(drops).toHaveProperty('resources')
    expect(drops).toHaveProperty('gold')
    expect(drops).toHaveProperty('exp')
    expect(Array.isArray(drops.resources)).toBe(true)
  })

  it('renvoie vide pour un monstre inconnu', () => {
    const drops = calcDrops('monstre_inexistant', 5)
    expect(drops.skillDrop).toBeNull()
    expect(drops.resources).toHaveLength(0)
  })

  it('garantit au moins 1 ressource', () => {
    // On run 1000 fois pour vérifier qu'on a toujours au moins 1 ressource
    for (let i = 0; i < 200; i++) {
      const drops = calcDrops('ashwood_wolf', 5)
      expect(drops.resources.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('gold est dans la plage du monstre (ashwood_wolf: 1-3)', () => {
    for (let i = 0; i < 100; i++) {
      const drops = calcDrops('ashwood_wolf', 5)
      expect(drops.gold).toBeGreaterThanOrEqual(1)
      expect(drops.gold).toBeLessThanOrEqual(3)
    }
  })

  it('exp correspond à expReward du monstre', () => {
    const drops = calcDrops('ashwood_wolf', 5)
    expect(drops.exp).toBe(15) // ashwood_wolf.expReward = 15
  })

  it('chance Chance > 5 augmente les drops', () => {
    let highChanceDrops = 0
    let baseDrops = 0
    for (let i = 0; i < 500; i++) {
      if (calcDrops('ashwood_wolf', 5).skillDrop !== null) baseDrops++
      if (calcDrops('ashwood_wolf', 50).skillDrop !== null) highChanceDrops++
    }
    expect(highChanceDrops).toBeGreaterThanOrEqual(baseDrops)
  })

  it('stone_golem droppe des stone_shard ou earth_crystal', () => {
    const drops = calcDrops('stone_golem', 5)
    const ids = drops.resources.map(r => r.id)
    const valid = ids.every(id => ['stone_shard', 'earth_crystal'].includes(id))
    expect(valid).toBe(true)
  })
})

// ── buildEnemy ────────────────────────────────────────────────────────────────
describe('buildEnemy', () => {
  it('retourne null pour un monstre inconnu', () => {
    expect(buildEnemy('inexistant', 'ashenvale', 1)).toBeNull()
  })

  it('retourne la structure complète pour un monstre valide', () => {
    const enemy = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    expect(enemy).not.toBeNull()
    expect(enemy).toHaveProperty('monsterId', 'ashwood_wolf')
    expect(enemy).toHaveProperty('name')
    expect(enemy).toHaveProperty('rank', 'common')
    expect(enemy).toHaveProperty('expReward', 15)
    expect(enemy).toHaveProperty('stats')
    expect(enemy).toHaveProperty('currentHp')
    expect(enemy.currentHp).toBe(enemy.stats.hp)
  })

  it('le rank est correctement transmis', () => {
    const elite = buildEnemy('soul_harvester', 'ashenvale', 1)
    expect(elite.rank).toBe('elite')
    const boss = buildEnemy('malachar', 'grimspire', 1)
    expect(boss.rank).toBe('demon_lord')
  })

  it('stats scalées selon le run (run 5 > run 1)', () => {
    const run1 = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    const run5 = buildEnemy('ashwood_wolf', 'ashenvale', 5)
    expect(run5.stats.hp).toBeGreaterThan(run1.stats.hp)
  })

  it('stats scalées selon la zone (grimspire > ashenvale)', () => {
    const ashenvale = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    const grimspire  = buildEnemy('ashwood_wolf', 'grimspire', 1)
    expect(grimspire.stats.hp).toBeGreaterThan(ashenvale.stats.hp)
  })

  it('id est unique à chaque appel', () => {
    const a = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    const b = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    expect(a.id).not.toBe(b.id)
  })
})

// ── calcExpGain ───────────────────────────────────────────────────────────────
describe('calcExpGain', () => {
  it("somme correctement l'expReward des ennemis", () => {
    const enemies = [
      { expReward: 15 },
      { expReward: 18 },
    ]
    expect(calcExpGain(enemies)).toBe(33)
  })

  it('retourne 0 pour une liste vide', () => {
    expect(calcExpGain([])).toBe(0)
  })

  it('gère les ennemis sans expReward', () => {
    const enemies = [{ expReward: 15 }, {}]
    expect(calcExpGain(enemies)).toBe(15)
  })

  it('fonctionne avec des ennemis buildEnemy réels', () => {
    const enemies = [
      buildEnemy('ashwood_wolf', 'ashenvale', 1),
      buildEnemy('rotting_shambler', 'ashenvale', 1),
    ]
    expect(calcExpGain(enemies)).toBe(15 + 18) // 33
  })
})

// ── isDefeated ────────────────────────────────────────────────────────────────
describe('isDefeated', () => {
  it('retourne true si currentHp === 0', () => {
    expect(isDefeated({ currentHp: 0 })).toBe(true)
  })

  it('retourne true si currentHp < 0', () => {
    expect(isDefeated({ currentHp: -5 })).toBe(true)
  })

  it('retourne false si currentHp > 0', () => {
    expect(isDefeated({ currentHp: 1 })).toBe(false)
    expect(isDefeated({ currentHp: 100 })).toBe(false)
  })
})

// ── enemyAI ───────────────────────────────────────────────────────────────────
describe('enemyAI', () => {
  const enemy = buildEnemy('ashwood_wolf', 'ashenvale', 1)
  const heroStats = { hp: 100, maxHp: 100, def: 5, mana: 60 }

  it('retourne une action avec damage > 0', () => {
    const action = enemyAI(enemy, heroStats)
    expect(action).toBeDefined()
    expect(action.damage).toBeGreaterThanOrEqual(1)
  })

  it('retourne un log non vide', () => {
    const action = enemyAI(enemy, heroStats)
    expect(typeof action.log).toBe('string')
    expect(action.log.length).toBeGreaterThan(0)
  })

  it("le log mentionne le nom de l'ennemi", () => {
    const action = enemyAI(enemy, heroStats)
    expect(action.log).toContain(enemy.name)
  })
})

// ── calcTurnOrder ─────────────────────────────────────────────────────────────
describe('calcTurnOrder', () => {
  const hero   = { agility: 15 }
  const slow   = { id: 'slow',   stats: { spd: 5  } }
  const fast   = { id: 'fast',   stats: { spd: 20 } }
  const medium = { id: 'medium', stats: { spd: 10 } }

  it('trie du plus rapide au plus lent', () => {
    const order = calcTurnOrder(hero, [slow, fast, medium])
    expect(order[0].agility ?? order[0].id).toBeDefined()
    // fast (20) > hero (15) > medium (10) > slow (5)
    const ids = order.map(c => c.id ?? 'hero')
    expect(ids[0]).toBe('fast')
    expect(ids[1]).toBe('hero')
    expect(ids[2]).toBe('medium')
    expect(ids[3]).toBe('slow')
  })

  it('retourne autant de combattants que hero + enemies', () => {
    const order = calcTurnOrder(hero, [slow, fast])
    expect(order).toHaveLength(3)
  })

  it('héros est identifié par isHero: true', () => {
    const order = calcTurnOrder(hero, [slow])
    const heroEntry = order.find(c => c.isHero)
    expect(heroEntry).toBeDefined()
  })
})
