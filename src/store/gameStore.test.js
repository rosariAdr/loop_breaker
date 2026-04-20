import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

// Reset du store avant chaque test
beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

// ── Navigation ────────────────────────────────────────────────────────────────
describe('Navigation — setScreen', () => {
  it('change currentScreen', () => {
    useGameStore.getState().setScreen('hero_sheet')
    expect(useGameStore.getState().currentScreen).toBe('hero_sheet')
  })

  it('accepte tous les screens valides', () => {
    const screens = ['world_map', 'zone_view', 'combat', 'hero_sheet', 'inventory', 'safe_zone']
    screens.forEach(s => {
      useGameStore.getState().setScreen(s)
      expect(useGameStore.getState().currentScreen).toBe(s)
    })
  })
})

describe('Navigation — startCombat / endCombat', () => {
  const mockEnemies = [{ id: 'wolf_0', monsterId: 'ashwood_wolf', name: 'Ashwood Wolf', stats: { hp: 40 }, currentHp: 40, rank: 'common', expReward: 15 }]

  it('startCombat positionne activeCombat et passe en screen combat', () => {
    useGameStore.getState().startCombat(mockEnemies)
    const state = useGameStore.getState()
    expect(state.activeCombat).not.toBeNull()
    expect(state.activeCombat.enemies).toEqual(mockEnemies)
    expect(state.currentScreen).toBe('combat')
  })

  it('startCombat initialise phase à player', () => {
    useGameStore.getState().startCombat(mockEnemies)
    expect(useGameStore.getState().activeCombat.phase).toBe('player')
  })

  it('endCombat vide activeCombat et retourne à world_map', () => {
    useGameStore.getState().startCombat(mockEnemies)
    useGameStore.getState().endCombat('victory')
    const state = useGameStore.getState()
    expect(state.activeCombat).toBeNull()
    expect(state.currentScreen).toBe('world_map')
  })

  it('endCombat enregistre le résultat dans battleLog', () => {
    useGameStore.getState().startCombat(mockEnemies)
    useGameStore.getState().endCombat('victory')
    const { hero } = useGameStore.getState()
    expect(hero.battleLog).toHaveLength(1)
    expect(hero.battleLog[0].type).toBe('victory')
  })
})

// ── XP & Level ───────────────────────────────────────────────────────────────
describe('gainExp', () => {
  it("ajoute de l'exp au héros", () => {
    useGameStore.getState().gainExp(50)
    expect(useGameStore.getState().hero.exp).toBe(50)
  })

  it('déclenche un level up quand exp >= expToNext', () => {
    useGameStore.getState().gainExp(100) // expToNext initial = 100
    expect(useGameStore.getState().hero.level).toBe(2)
  })

  it('level up augmente les stats (maxHp)', () => {
    const before = useGameStore.getState().hero.stats.maxHp
    useGameStore.getState().gainExp(100)
    const after = useGameStore.getState().hero.stats.maxHp
    expect(after).toBeGreaterThan(before)
  })

  it('level up incrémente pendingLevelUp', () => {
    useGameStore.getState().gainExp(100)
    expect(useGameStore.getState().pendingLevelUp).toBeGreaterThan(0)
  })

  it('plusieurs level ups en une fois (exp très élevée)', () => {
    useGameStore.getState().gainExp(10000)
    expect(useGameStore.getState().hero.level).toBeGreaterThan(2)
  })

  it('exp restante après level up est correcte', () => {
    useGameStore.getState().gainExp(150) // 150 - 100 = 50 restants
    expect(useGameStore.getState().hero.exp).toBe(50)
  })
})

// ── Apprentissage — Skills ────────────────────────────────────────────────────
describe('addSkillToInventory', () => {
  it('ajoute un skill dans manaStones', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.inventory.manaStones).toHaveLength(1)
  })

  it('peut empiler plusieurs skills différents', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().addSkillToInventory({ skillId: 'putrid_slam', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.inventory.manaStones).toHaveLength(2)
  })
})

describe('equipActiveSkill', () => {
  beforeEach(() => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
  })

  it('déplace le skill de manaStones vers activeSkills', () => {
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    const state = useGameStore.getState()
    expect(state.hero.inventory.manaStones).toHaveLength(0)
    expect(state.hero.activeSkills).toHaveLength(1)
    expect(state.hero.activeSkills[0].skillId).toBe('savage_bite')
  })

  it("refuse d'équiper si 6 slots actifs déjà remplis", () => {
    // Remplir les 6 slots
    const skills = ['savage_bite','putrid_slam','spectral_veil','venom_bite','stone_skin','iron_resolve']
    skills.forEach(id => {
      useGameStore.getState().addSkillToInventory({ skillId: id, level: 1, xp: 0 })
      useGameStore.getState().equipActiveSkill({ skillId: id, level: 1, xp: 0 })
    })
    // Tentative d'équiper un 7ème
    useGameStore.getState().addSkillToInventory({ skillId: 'cleave', level: 1, xp: 0 })
    useGameStore.getState().equipActiveSkill({ skillId: 'cleave', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.activeSkills).toHaveLength(6)
    // cleave doit rester dans manaStones
    expect(useGameStore.getState().hero.inventory.manaStones.some(s => s.skillId === 'cleave')).toBe(true)
  })
})

describe('equipPassiveSkill', () => {
  it('déplace le skill vers passiveSkills', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'iron_resolve', level: 1, xp: 0 })
    useGameStore.getState().equipPassiveSkill({ skillId: 'iron_resolve', level: 1, xp: 0 })
    const state = useGameStore.getState()
    expect(state.hero.passiveSkills).toHaveLength(1)
    expect(state.hero.inventory.manaStones).toHaveLength(0)
  })

  it("refuse d'équiper si 4 slots passifs remplis", () => {
    const passives = ['iron_resolve','troll_regeneration','veterans_resolve','stone_skin']
    passives.forEach(id => {
      useGameStore.getState().addSkillToInventory({ skillId: id, level: 1, xp: 0 })
      useGameStore.getState().equipPassiveSkill({ skillId: id, level: 1, xp: 0 })
    })
    useGameStore.getState().addSkillToInventory({ skillId: 'sentinel_watch', level: 1, xp: 0 })
    useGameStore.getState().equipPassiveSkill({ skillId: 'sentinel_watch', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.passiveSkills).toHaveLength(4)
  })
})

describe('gainSkillXp', () => {
  beforeEach(() => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
  })

  it("accumule l'xp du skill", () => {
    useGameStore.getState().gainSkillXp('savage_bite', 5)
    const skill = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(skill.xp).toBe(5)
  })

  it('monte en Lv2 après 20 uses', () => {
    for (let i = 0; i < 20; i++) {
      useGameStore.getState().gainSkillXp('savage_bite', 1)
    }
    const skill = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(skill.level).toBe(2)
  })

  it('XP repart à 0 après le level up', () => {
    for (let i = 0; i < 20; i++) {
      useGameStore.getState().gainSkillXp('savage_bite', 1)
    }
    const skill = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(skill.xp).toBe(0)
  })

  it('monte en Lv3 après 20+50 uses cumulées', () => {
    for (let i = 0; i < 70; i++) {
      useGameStore.getState().gainSkillXp('savage_bite', 1)
    }
    const skill = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(skill.level).toBe(3)
  })

  it('ne dépasse pas Lv3', () => {
    for (let i = 0; i < 200; i++) {
      useGameStore.getState().gainSkillXp('savage_bite', 1)
    }
    const skill = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(skill.level).toBe(3)
  })
})

describe('unequipActiveSkill / unequipPassiveSkill', () => {
  it('retourne le skill actif dans manaStones', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().unequipActiveSkill('savage_bite')
    const state = useGameStore.getState()
    expect(state.hero.activeSkills).toHaveLength(0)
    expect(state.hero.inventory.manaStones.some(s => s.skillId === 'savage_bite')).toBe(true)
  })

  it('retourne le skill passif dans manaStones', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'iron_resolve', level: 1, xp: 0 })
    useGameStore.getState().equipPassiveSkill({ skillId: 'iron_resolve', level: 1, xp: 0 })
    useGameStore.getState().unequipPassiveSkill('iron_resolve')
    const state = useGameStore.getState()
    expect(state.hero.passiveSkills).toHaveLength(0)
    expect(state.hero.inventory.manaStones.some(s => s.skillId === 'iron_resolve')).toBe(true)
  })

  it('conserve le niveau du skill après déséquipement', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 2, xp: 10 })
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 2, xp: 10 })
    useGameStore.getState().unequipActiveSkill('savage_bite')
    const stone = useGameStore.getState().hero.inventory.manaStones.find(s => s.skillId === 'savage_bite')
    expect(stone.level).toBe(2)
    expect(stone.xp).toBe(10)
  })
})

// ── Idle ──────────────────────────────────────────────────────────────────────
describe('processIdleTick', () => {
  it('ne fait rien si idle inactif', () => {
    const before = useGameStore.getState().hero.inventory.gold
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().hero.inventory.gold).toBe(before)
  })

  it("ajoute de l'or et des ressources quand actif", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' }
    }))
    const before = useGameStore.getState().hero.inventory.gold
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().hero.inventory.gold).toBeGreaterThanOrEqual(before)
  })

  it('incrémente le kill count', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' }
    }))
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().world.monsterKillCounts['ashwood_wolf']).toBeGreaterThanOrEqual(1)
  })

  it('réduit les HP du héros (combat idle)', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 100 } }
    }))
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().hero.stats.hp).toBeLessThan(100)
  })

  it("désactive l'idle si HP < 20%", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'stone_golem' },
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 1, maxHp: 100 } }
    }))
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })
})

// ── Persistance ───────────────────────────────────────────────────────────────
describe('saveGame / loadGame', () => {
  it('round-trip : sauvegarde et recharge le state', () => {
    useGameStore.getState().addGold(250)
    useGameStore.getState().saveGame()
    useGameStore.getState().resetGame()
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.inventory.gold).toBe(250)
  })

  it('loadGame retourne false si pas de save', () => {
    localStorage.clear()
    const result = useGameStore.getState().loadGame()
    expect(result).toBe(false)
  })

  it('migration : accepte une save avec completedQuests=0 (ancien format)', () => {
    const oldSave = {
      hero: useGameStore.getState().hero,
      world: { ...useGameStore.getState().world, completedQuests: 0, activeQuests: 0 },
      meta: useGameStore.getState().meta,
    }
    localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
    useGameStore.getState().loadGame()
    expect(Array.isArray(useGameStore.getState().world.completedQuests)).toBe(true)
    expect(Array.isArray(useGameStore.getState().world.activeQuests)).toBe(true)
  })

  it('migration : complète les champs manquants avec les valeurs par défaut', () => {
    const partialSave = {
      hero: { ...useGameStore.getState().hero },
      world: { dayCount: 5 }, // save partielle sans les autres champs
      meta: useGameStore.getState().meta,
    }
    localStorage.setItem('roguelite_save', JSON.stringify(partialSave))
    useGameStore.getState().loadGame()
    // Les champs manquants doivent être reconstruits
    expect(useGameStore.getState().world.currentZone).toBeDefined()
    expect(useGameStore.getState().world.dayCount).toBe(5)
  })
})

// ── Quêtes ────────────────────────────────────────────────────────────────────
describe('Système de quêtes', () => {
  it('startQuest ajoute la quête aux activeQuests', () => {
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toContain('first_blood')
  })

  it('startQuest ignore les doublons', () => {
    useGameStore.getState().startQuest('first_blood')
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toHaveLength(1)
  })

  it('startQuest ignore les quêtes déjà complétées', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, completedQuests: ['first_blood'], activeQuests: [] }
    }))
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toHaveLength(0)
  })

  it('isQuestComplete retourne false si objectifs non remplis', () => {
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().isQuestComplete('first_blood')).toBe(false)
  })

  it('isQuestComplete retourne true si kills suffisants', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } }
    }))
    expect(useGameStore.getState().isQuestComplete('first_blood')).toBe(true)
  })

  it('isQuestComplete — quête de niveau', () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, level: 3 }
    }))
    expect(useGameStore.getState().isQuestComplete('proof_of_worth')).toBe(true)
  })

  it("completeQuest retire la quête des actives et l'ajoute aux complètes", () => {
    useGameStore.getState().startQuest('first_blood')
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } }
    }))
    useGameStore.getState().completeQuest('first_blood')
    const state = useGameStore.getState()
    expect(state.world.activeQuests).not.toContain('first_blood')
    expect(state.world.completedQuests).toContain('first_blood')
  })

  it('completeQuest ajoute la récompense en or', () => {
    useGameStore.getState().startQuest('first_blood') // reward: 50g
    const before = useGameStore.getState().hero.inventory.gold
    useGameStore.getState().completeQuest('first_blood')
    expect(useGameStore.getState().hero.inventory.gold).toBe(before + 50)
  })

  it('completeQuest ajoute les tokens de réputation', () => {
    useGameStore.getState().startQuest('first_blood')
    const before = useGameStore.getState().hero.reputationTokens
    useGameStore.getState().completeQuest('first_blood')
    expect(useGameStore.getState().hero.reputationTokens).toBeGreaterThan(before)
  })
})
