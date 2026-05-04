// Tests de scénarios : simulent des séquences de jeu réelles de bout en bout.
// Contrairement aux tests unitaires, ici on enchaîne plusieurs actions pour vérifier
// que la boucle de gameplay tient la route.

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './store/gameStore'
import { buildEnemy, calcBaseDamage, calcDrops, calcExpGain, canUseSkill } from './engine/combat'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 1 : premier run — du tutoriel à la première mort
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 1 — Premier run complet', () => {
  it('Run 1 : rename → combat → level up → quête → mort → run 2', () => {
    const store = useGameStore.getState

    // 1. Nommer le héros (CharacterCreation)
    expect(store().hero.heroNamed).toBe(false)
    store().renameHero('Kael')
    expect(store().hero.name).toBe('Kael')
    expect(store().hero.heroNamed).toBe(true)

    // 2. Accepter first_blood au Quest Board
    store().startQuest('first_blood')
    expect(store().world.activeQuests).toContain('first_blood')

    // 3. Tuer 5 loups (un combat par loup = gain d'xp, drops, kill count)
    for (let i = 0; i < 5; i++) {
      const wolf = buildEnemy('ashwood_wolf', 'ashenvale', 1)
      store().recordKill(wolf.monsterId)
      store().addGold(calcDrops('ashwood_wolf', 5).gold)
      store().gainExp(wolf.expReward)
    }
    expect(store().world.monsterKillCounts.ashwood_wolf).toBe(5)

    // 4. Avec 75 xp (5×15) on n'a pas level up (expToNext=100), donc level 1
    expect(store().hero.level).toBe(1)

    // 5. La quête doit être complétable
    expect(store().isQuestComplete('first_blood')).toBe(true)

    // 6. Claim la quête : récompense en gold, skill, tokens
    const goldBefore = store().hero.inventory.gold
    const tokensBefore = store().hero.reputationTokens
    store().completeQuest('first_blood')
    expect(store().hero.inventory.gold).toBe(goldBefore + 50)
    expect(store().hero.reputationTokens).toBe(tokensBefore + 1)
    expect(store().hero.inventory.manaStones.some(s => s.skillId === 'counter_strike')).toBe(true)

    // 7. Équiper le skill récompense
    store().equipActiveSkill({ skillId: 'counter_strike', level: 1, xp: 0 })
    expect(store().hero.activeSkills.some(s => s.skillId === 'counter_strike')).toBe(true)

    // 8. Gain suffisant pour level 2
    store().gainExp(100)
    expect(store().hero.level).toBe(2)
    expect(store().pendingLevelUp).toBeGreaterThan(0)

    // 9. Modal level-up confirmée + bonus stat choisi
    const strBefore = store().hero.stats.strength
    store().updateHeroStat('strength', strBefore + 1)
    store().clearPendingLevelUp()
    expect(store().hero.stats.strength).toBe(strBefore + 1)
    expect(store().pendingLevelUp).toBe(0)

    // 10. Mort contre un golem nommé
    store().heroDeath('Stone Golem')
    expect(store().currentScreen).toBe('post_mortem')
    expect(store().meta.lastRunSummary.cause).toBe('Stone Golem')
    expect(store().meta.lastRunSummary.level).toBe(2)
    expect(store().meta.lastRunSummary.totalKills).toBe(5)

    // 11. Choix d'héritage (stat + skill) + passage au gods shop
    store().confirmInheritance('strength', { skillId: 'counter_strike', level: 1, xp: 0 }, null)
    expect(store().currentScreen).toBe('gods_shop')
    expect(store().meta.pendingInheritance.stat).toBe('strength')

    // 12. Transmigration : nouveau run avec bonuses
    store().applyTransmigration({ extraSkills: [] })
    expect(store().hero.runNumber).toBe(2)
    expect(store().hero.deathCount).toBe(1)
    expect(store().hero.activeSkills.some(s => s.skillId === 'counter_strike')).toBe(true)
    expect(store().hero.stats.strength).toBeGreaterThan(10) // +10% sur la stat héritée (base=10 → 11)
    expect(store().world.dayCount).toBe(1) // nouveau run, jour 1
    expect(store().currentScreen).toBe('world_map')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 2 : idle grinding sur plusieurs ticks
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 2 — Idle grinding', () => {
  it('20 ticks idle sur des loups → or, ressources, kills', () => {
    const store = useGameStore.getState

    // Débloquer l'idle sur ashwood_wolf
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        monsterKillCounts: { ashwood_wolf: 5 },
        isIdleActive: true,
        idleTargetMonster: 'ashwood_wolf',
      },
      // HP assez haut pour tenir 20 ticks
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 1000, maxHp: 1000 } },
    }))

    const goldBefore = store().hero.inventory.gold
    const killsBefore = store().world.monsterKillCounts.ashwood_wolf

    for (let i = 0; i < 20; i++) store().processIdleTick()

    expect(store().hero.inventory.gold).toBeGreaterThan(goldBefore)
    expect(store().world.monsterKillCounts.ashwood_wolf).toBeGreaterThan(killsBefore)

    // Resources accumulées (loups droppent wolf_pelt, wolf_fang, etc.)
    const resources = store().hero.inventory.resources
    const totalLoot = Object.values(resources).reduce((a, b) => a + b, 0)
    expect(totalLoot).toBeGreaterThan(0)

    // Log d'idle alimenté
    expect(store().world.idleLog.length).toBeGreaterThan(0)
  })

  it("désactive automatiquement l'idle quand HP < 20%", () => {
    const store = useGameStore.getState
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        monsterKillCounts: { stone_golem: 5 },
        isIdleActive: true,
        idleTargetMonster: 'stone_golem',
      },
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 15, maxHp: 100 } },
    }))
    // Un tick suffit car le golem fait mal
    store().processIdleTick()
    // Soit déjà <20% soit descend <20% après le tick
    expect(store().world.isIdleActive).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 3 : quêtes en chaîne
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 3 — Quêtes en chaîne', () => {
  it('Accept 2 quêtes, compléter first_blood, puis proof_of_worth', () => {
    const store = useGameStore.getState

    store().startQuest('first_blood')
    store().startQuest('proof_of_worth')
    expect(store().world.activeQuests).toHaveLength(2)

    // Complete first_blood (5 wolf kills)
    for (let i = 0; i < 5; i++) store().recordKill('ashwood_wolf')
    expect(store().isQuestComplete('first_blood')).toBe(true)
    expect(store().isQuestComplete('proof_of_worth')).toBe(false)

    store().completeQuest('first_blood')
    expect(store().world.completedQuests).toContain('first_blood')
    expect(store().world.activeQuests).not.toContain('first_blood')
    expect(store().world.activeQuests).toContain('proof_of_worth')

    // Level 3 pour proof_of_worth
    store().gainExp(10000) // garantit d'atteindre level 3+
    expect(store().hero.level).toBeGreaterThanOrEqual(3)
    expect(store().isQuestComplete('proof_of_worth')).toBe(true)

    store().completeQuest('proof_of_worth')
    expect(store().world.completedQuests).toContain('proof_of_worth')
    expect(store().world.activeQuests).toHaveLength(0)
  })

  it('Ne peut pas re-accepter une quête complétée', () => {
    const store = useGameStore.getState
    store().startQuest('first_blood')
    for (let i = 0; i < 5; i++) store().recordKill('ashwood_wolf')
    store().completeQuest('first_blood')
    // Re-tenter
    store().startQuest('first_blood')
    expect(store().world.activeQuests).not.toContain('first_blood')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 4 : éveil divin + utilisation du skill en combat
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 4 — Divinité : acceptation et utilisabilité du divine skill', () => {
  it('Accepter Ignareth équipe inferno_strike et le rend utilisable', () => {
    const store = useGameStore.getState

    // Simule l'éveil (trigger)
    store().triggerDivineCall('ignareth')
    expect(store().pendingDivineCall).toEqual({ deityId: 'ignareth' })
    expect(store().currentScreen).toBe('divine_call')

    // Accepter la divinité avec inferno_strike
    store().acceptDeity('ignareth', 'inferno_strike')

    // Skill bien ajouté dans activeSkills (DV02)
    const hero = store().hero
    expect(hero.deity).toBe('ignareth')
    expect(hero.divineSkill.skillId).toBe('inferno_strike')
    expect(hero.activeSkills.some(s => s.skillId === 'inferno_strike')).toBe(true)

    // Le skill doit être utilisable (dans l'ActionPanel)
    const activeSkill = hero.activeSkills.find(s => s.skillId === 'inferno_strike')
    const skillWithCd = { ...activeSkill, currentCooldown: 0 }
    expect(canUseSkill(skillWithCd, hero.stats)).toBe(true)
  })

  it('Refuser la divinité ne marque pas le héros', () => {
    const store = useGameStore.getState
    store().triggerDivineCall('sylvara')
    store().refuseDeity()
    expect(store().hero.deity).toBeNull()
    expect(store().pendingDivineCall).toBeNull()
  })

  it('Bond divin persiste dans meta.divineBonds après mort', () => {
    const store = useGameStore.getState
    store().acceptDeity('ignareth', 'inferno_strike')
    store().heroDeath('Wolf')
    expect(store().meta.divineBonds.medieval_fantasy).toBe('ignareth')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 5 : journée complète (calendar + sleep)
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 5 — Journée complète', () => {
  it('24 ticks puis sleep → jour 2 et restauration complète', () => {
    const store = useGameStore.getState

    // Hero un peu abîmé
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 30, mana: 10 } },
    }))

    // 12 ticks = demi-journée
    for (let i = 0; i < 12; i++) store().advanceTick()
    expect(store().world.tickCount).toBe(12)
    expect(store().world.dayCount).toBe(1)

    // Encore 12 ticks → jour 2
    for (let i = 0; i < 12; i++) store().advanceTick()
    expect(store().world.dayCount).toBe(2)
    expect(store().world.tickCount).toBe(0)

    // Sleep → HP/MP full + jour 3
    store().sleep()
    expect(store().hero.stats.hp).toBe(store().hero.stats.maxHp)
    expect(store().hero.stats.mana).toBe(store().hero.stats.maxMana)
    expect(store().world.dayCount).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 6 : persistance entre sessions
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 6 — Persistance entre sessions', () => {
  it('Sauvegarde complète → rechargement après reset', () => {
    const store = useGameStore.getState

    // Progression : rename, level, gold, skill, quest
    store().renameHero('Lyra')
    store().addGold(320)
    store().gainExp(100)
    store().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    store().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    store().startQuest('first_blood')
    store().recordKill('ashwood_wolf')
    store().saveGame()

    // Simule fermeture / réouverture
    store().resetGame()
    expect(store().hero.name).toBe('The Wanderer')
    expect(store().hero.inventory.gold).toBe(0)

    // Reload
    const loaded = store().loadGame()
    expect(loaded).toBe(true)

    const h = store().hero
    const w = store().world
    expect(h.name).toBe('Lyra')
    expect(h.heroNamed).toBe(true)
    expect(h.inventory.gold).toBe(320)
    expect(h.level).toBe(2)
    expect(h.activeSkills.some(s => s.skillId === 'savage_bite')).toBe(true)
    expect(w.activeQuests).toContain('first_blood')
    expect(w.monsterKillCounts.ashwood_wolf).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 7 : combat simulé tour par tour
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 7 — Combat simulé', () => {
  it('Le héros affronte un loup et le bat (sans skills)', () => {
    const store = useGameStore.getState
    const wolf = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    store().startCombat([wolf])
    expect(store().activeCombat).not.toBeNull()
    expect(store().currentScreen).toBe('combat')

    // Simule la boucle de combat
    let wolfHp = wolf.currentHp
    const heroStats = { ...store().hero.stats }
    let turns = 0
    const MAX_TURNS = 20
    while (wolfHp > 0 && heroStats.hp > 0 && turns < MAX_TURNS) {
      // Tour joueur : attaque basique
      wolfHp -= calcBaseDamage(heroStats.strength, wolf.stats.def)
      if (wolfHp <= 0) break
      // Tour ennemi
      heroStats.hp -= calcBaseDamage(wolf.stats.atk ?? 5, heroStats.def)
      turns++
    }
    expect(wolfHp).toBeLessThanOrEqual(0)
    expect(turns).toBeLessThan(MAX_TURNS)

    // Victoire : drops + xp
    const drops = calcDrops(wolf.monsterId, store().hero.stats.chance)
    store().addGold(drops.gold)
    drops.resources.forEach(r => store().addResource(r.id, r.qty))
    store().recordKill(wolf.monsterId)
    store().gainExp(calcExpGain([wolf]))
    store().endCombat('victory')

    expect(store().hero.exp).toBe(wolf.expReward)
    expect(store().world.monsterKillCounts[wolf.monsterId]).toBe(1)
    expect(store().activeCombat).toBeNull()
  })

  it('Le héros fuit — fin de combat sans xp ni drops', () => {
    const store = useGameStore.getState
    const wolf = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    store().startCombat([wolf])
    const expBefore = store().hero.exp
    const killsBefore = store().world.monsterKillCounts.ashwood_wolf ?? 0

    store().endCombat('fled')
    expect(store().hero.exp).toBe(expBefore)
    expect(store().world.monsterKillCounts.ashwood_wolf ?? 0).toBe(killsBefore)
    expect(store().hero.battleLog[0].type).toBe('fled')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 8 : donjon — discover → clear → respawn au sleep
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 8 — Cycle donjon', () => {
  it('Discover → clear → respawn après sleep', () => {
    const store = useGameStore.getState
    const initial = store().world.dungeons.ashenvale
    expect(initial.discovered).toBe(false)
    expect(initial.cleared).toBe(false)

    // Discover (approche)
    store().discoverDungeon('ashenvale')
    expect(store().world.dungeons.ashenvale.discovered).toBe(true)

    // Clear (kill boss)
    store().clearDungeon('ashenvale')
    expect(store().world.dungeons.ashenvale.cleared).toBe(true)

    // Sleep → respawn : cleared=false, discovered=false
    store().sleep()
    const after = store().world.dungeons.ashenvale
    expect(after.cleared).toBe(false)
    expect(after.discovered).toBe(false)
    expect(after.active).toBe(true)
  })

  it('Tuer Malachar (grimspire) incrémente demonLordKills', () => {
    const store = useGameStore.getState
    expect(store().meta.demonLordKills).toBe(0)
    store().clearDungeon('grimspire')
    expect(store().meta.demonLordKills).toBe(1)
    expect(store().world.demonLordDefeated).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 9 : mort dans un combat réel → cause transmise
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 9 — Mort en combat avec cause (T01)', () => {
  it("Le héros meurt contre un monstre → la cause correspond au nom de l'ennemi", () => {
    const store = useGameStore.getState
    const golem = buildEnemy('stone_golem', 'crumbled_ruins', 1)

    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 1 } }
    }))
    store().startCombat([golem])

    // Simule la défaite
    store().heroDeath(golem.name)

    const summary = store().meta.lastRunSummary
    expect(summary.cause).toBe(golem.name)
    expect(summary.cause).toContain('Stone') // format du nom
  })

  it("Mort sans contexte → cause par défaut 'Unknown enemy'", () => {
    const store = useGameStore.getState
    store().heroDeath()
    expect(store().meta.lastRunSummary.cause).toBe('Unknown enemy')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 10 : équipement — craft → équiper → bonus stats
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 10 — Équipement', () => {
  it('Ajouter → équiper → déséquiper un item', () => {
    const store = useGameStore.getState
    const fakeItem = {
      instanceId: 'eq_test_1',
      templateId: 'iron_sword',
      name: 'Iron Sword',
      slot: 'weapon',
      rarity: 'common',
      stats: { strength: 5 },
      sellPrice: 20,
    }

    store().addEquipmentToInventory(fakeItem)
    expect(store().hero.inventory.equipment).toHaveLength(1)

    store().equipItem('eq_test_1')
    expect(store().hero.equipped.weapon).not.toBeNull()
    expect(store().hero.equipped.weapon.instanceId).toBe('eq_test_1')
    expect(store().hero.inventory.equipment).toHaveLength(0)

    store().unequipItem('weapon')
    expect(store().hero.equipped.weapon).toBeNull()
    expect(store().hero.inventory.equipment).toHaveLength(1)
  })

  it("Équiper un item dans un slot déjà occupé renvoie l'ancien dans l'inventaire", () => {
    const store = useGameStore.getState
    const item1 = { instanceId: 'a', templateId: 't', name: 'Sword A', slot: 'weapon', rarity: 'common', stats: {}, sellPrice: 10 }
    const item2 = { instanceId: 'b', templateId: 't', name: 'Sword B', slot: 'weapon', rarity: 'rare', stats: {}, sellPrice: 20 }

    store().addEquipmentToInventory(item1)
    store().addEquipmentToInventory(item2)
    store().equipItem('a')
    store().equipItem('b')

    expect(store().hero.equipped.weapon.instanceId).toBe('b')
    expect(store().hero.inventory.equipment.some(e => e.instanceId === 'a')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 11 : run #3 — progression inter-runs
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 11 — 3 runs successifs avec héritage', () => {
  it('Chaque run garde un skill hérité différent', () => {
    const store = useGameStore.getState

    // Run 1 : renomme, gagne un skill, meurt
    store().renameHero('Kael')
    store().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    store().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    store().heroDeath('Wolf')
    store().confirmInheritance('strength', { skillId: 'savage_bite', level: 1, xp: 0 }, null)
    store().applyTransmigration({ extraSkills: [] })

    expect(store().hero.runNumber).toBe(2)
    expect(store().hero.activeSkills.some(s => s.skillId === 'savage_bite')).toBe(true)

    // Run 2 : ajoute un autre skill, meurt, hérite de celui-là
    store().addSkillToInventory({ skillId: 'putrid_slam', level: 1, xp: 0 })
    store().equipActiveSkill({ skillId: 'putrid_slam', level: 1, xp: 0 })
    store().heroDeath('Zombie')
    store().confirmInheritance('agility', { skillId: 'putrid_slam', level: 1, xp: 0 }, null)
    store().applyTransmigration({ extraSkills: [] })

    expect(store().hero.runNumber).toBe(3)
    expect(store().hero.deathCount).toBe(2)
    expect(store().hero.activeSkills.some(s => s.skillId === 'putrid_slam')).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 12 : boss run complet (Q03 + combat boss + récompenses)
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 12 — Boss run complet (Crypt Keeper)', () => {
  it('accepter Q03 → combat simulé contre boss → claim récompense', () => {
    const store = useGameStore.getState

    // Accept quête boss
    store().startQuest('silence_the_crypt')
    expect(store().world.activeQuests).toContain('silence_the_crypt')

    // Un héros un peu boosté pour le boss
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, strength: 40, hp: 500, maxHp: 500, def: 20 } },
    }))

    // Combat simulé contre le Crypt Keeper
    const boss = buildEnemy('hollow_crypt_boss', 'ashenvale', 1)
    store().startCombat([boss])
    expect(boss.rank).toBe('boss')

    let bossHp = boss.currentHp
    const heroStats = { ...store().hero.stats }
    let turns = 0
    const MAX_TURNS = 50
    while (bossHp > 0 && heroStats.hp > 0 && turns < MAX_TURNS) {
      bossHp -= calcBaseDamage(heroStats.strength, boss.stats.def)
      if (bossHp <= 0) break
      heroStats.hp -= calcBaseDamage(boss.stats.atk, heroStats.def)
      turns++
    }
    expect(bossHp).toBeLessThanOrEqual(0)

    // Victoire + rewards combat
    store().recordKill(boss.monsterId)
    store().gainExp(calcExpGain([boss]))
    store().endCombat('victory')

    // Kill pour la quête OK → claim
    expect(store().isQuestComplete('silence_the_crypt')).toBe(true)
    const goldBefore = store().hero.inventory.gold
    store().completeQuest('silence_the_crypt')

    // Récompenses de quête empilées en plus du loot combat
    expect(store().hero.inventory.gold).toBe(goldBefore + 200)
    expect(store().hero.reputationTokens).toBeGreaterThanOrEqual(3)
    expect(store().hero.inventory.manaStones.some(s => s.skillId === 'soul_crush')).toBe(true)
    // Boss XP substantielle → level up garanti (boss=300 XP, expToNext lv1=100)
    expect(store().hero.level).toBeGreaterThan(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 13 : quêtes de plusieurs NPCs en parallèle (Q08)
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 13 — 3 NPCs en parallèle', () => {
  it('accepter des quêtes de 3 NPCs et toutes les finir', () => {
    const store = useGameStore.getState

    // Accept 3 quêtes d'NPCs différents
    store().startQuest('first_blood')          // sir_aldric
    store().startQuest('bog_purge')            // greywatch_elder
    store().startQuest('silence_the_crypt')    // ironhaven_captain
    expect(store().world.activeQuests).toHaveLength(3)

    // Progresser sur toutes en parallèle
    for (let i = 0; i < 5; i++) store().recordKill('ashwood_wolf')
    for (let i = 0; i < 4; i++) store().recordKill('bog_shambler')
    store().recordKill('hollow_crypt_boss')

    expect(store().isQuestComplete('first_blood')).toBe(true)
    expect(store().isQuestComplete('bog_purge')).toBe(true)
    expect(store().isQuestComplete('silence_the_crypt')).toBe(true)

    // Claim toutes
    const tokensBefore = store().hero.reputationTokens
    store().completeQuest('first_blood')
    store().completeQuest('bog_purge')
    store().completeQuest('silence_the_crypt')

    // 1 + 2 + 3 = 6 tokens
    expect(store().hero.reputationTokens).toBe(tokensBefore + 6)
    expect(store().world.completedQuests).toHaveLength(3)
    expect(store().world.activeQuests).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 14 : combat stats tracking (B08) — version simulée store
// ─────────────────────────────────────────────────────────────────────────────
// Note : les states combat sont locaux à Combat.jsx ; on teste que les actions
// store associées (gainExp, addGold, recordKill) sont bien appelées après coup.
describe('Scénario 14 — Combat complet avec tracking implicite', () => {
  it("après victoire, les effets attendus sont en place", () => {
    const store = useGameStore.getState
    const wolf = buildEnemy('ashwood_wolf', 'ashenvale', 1)
    store().startCombat([wolf])

    // Victoire
    store().recordKill(wolf.monsterId)
    store().gainExp(wolf.expReward)
    const gold = calcDrops(wolf.monsterId, 5).gold
    store().addGold(gold)
    store().endCombat('victory')

    // Vérifie que le monde a bien enregistré
    expect(store().world.monsterKillCounts.ashwood_wolf).toBe(1)
    expect(store().hero.exp).toBe(wolf.expReward)
    expect(store().hero.inventory.gold).toBeGreaterThanOrEqual(gold)
    expect(store().hero.battleLog[0].type).toBe('victory')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 15 : robustesse aux inputs invalides
// ─────────────────────────────────────────────────────────────────────────────
describe('Scénario 12 — Robustesse', () => {
  it("processIdleTick ne crash pas avec un monstre idleTarget invalide", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'fake_monster_id' },
    }))
    expect(() => useGameStore.getState().processIdleTick()).not.toThrow()
  })

  it('completeQuest sans quête active ne change rien', () => {
    const before = useGameStore.getState().hero.inventory.gold
    useGameStore.getState().completeQuest('first_blood')
    expect(useGameStore.getState().hero.inventory.gold).toBe(before)
  })

  it('equipActiveSkill d\'un skill absent de manaStones ne crash pas', () => {
    expect(() =>
      useGameStore.getState().equipActiveSkill({ skillId: 'ghost', level: 1, xp: 0 })
    ).not.toThrow()
  })

  it('unequipItem sur un slot vide ne modifie rien', () => {
    useGameStore.getState().unequipItem('weapon')
    expect(useGameStore.getState().hero.equipped.weapon).toBeNull()
  })

  it('spendGold avec 0 ou négatif ne crash pas', () => {
    useGameStore.getState().addGold(50)
    expect(() => useGameStore.getState().spendGold(0)).not.toThrow()
    expect(() => useGameStore.getState().spendGold(-10)).not.toThrow()
  })
})
