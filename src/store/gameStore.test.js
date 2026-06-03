import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  // S03 — équiper ne retire qu'UNE copie + pas de doublon en slot
  it("S03 — équiper retire UNE seule copie quand on en a plusieurs", () => {
    // 3 copies de savage_bite (1 du beforeEach + 2 ici)
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.inventory.manaStones.filter(s => s.skillId === 'savage_bite')).toHaveLength(3)
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    // 2 copies restent dans le sac (pas 0 !)
    expect(useGameStore.getState().hero.inventory.manaStones.filter(s => s.skillId === 'savage_bite')).toHaveLength(2)
    expect(useGameStore.getState().hero.activeSkills).toHaveLength(1)
  })

  it("S03 — refuse d'équiper un skill déjà dans les slots actifs", () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    const beforeStones = useGameStore.getState().hero.inventory.manaStones.length
    // Re-équiper le même → refusé (pas de doublon)
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
    expect(useGameStore.getState().hero.activeSkills.filter(s => s.skillId === 'savage_bite')).toHaveLength(1)
    expect(useGameStore.getState().hero.inventory.manaStones.length).toBe(beforeStones)
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
    // ashwood_wolf (Lv 1) pour ne PAS déclencher le garde B12 (trop fort)
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      hero: { ...state.hero, level: 5, stats: { ...state.hero.stats, hp: 1, maxHp: 100 } }
    }))
    useGameStore.getState().processIdleTick()
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })

  // I04 — Toasts sur événements idle marquants
  it("I04 — toast warning quand idle s'arrête pour HP bas", async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      hero: { ...state.hero, level: 5, stats: { ...state.hero.stats, hp: 1, maxHp: 100 } }
    }))
    useGameStore.getState().processIdleTick()
    const warn = useToastStore.getState().toasts.find(t => t.type === 'warning')
    expect(warn).toBeDefined()
  })

  // B12 — ennemi trop fort → idle stoppé + combat manuel forcé
  it("B12 — force un combat manuel quand l'ennemi est trop fort", () => {
    // stone_golem = Lv 12 ; héros Lv 1 → 12 > 1+5 → trop fort
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'stone_golem' },
      hero: { ...state.hero, level: 1, stats: { ...state.hero.stats, hp: 100, maxHp: 100 } },
    }))
    useGameStore.getState().processIdleTick()
    const st = useGameStore.getState()
    expect(st.world.isIdleActive).toBe(false)
    expect(st.currentScreen).toBe('combat')
    expect(st.activeCombat?.enemies?.[0]?.monsterId).toBe('stone_golem')
  })

  it("B12 — n'interrompt PAS si le héros est assez haut niveau", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'stone_golem' },
      hero: { ...state.hero, level: 20, stats: { ...state.hero.stats, hp: 100, maxHp: 100, strength: 60 } },
    }))
    useGameStore.getState().processIdleTick()
    const st = useGameStore.getState()
    expect(st.currentScreen).not.toBe('combat')
    expect(st.world.isIdleActive).toBe(true)
  })

  it("I04 — toast levelup quand le héros monte de niveau en idle", async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    // Héros proche du level up + idle actif sur un monstre rentable
    useGameStore.setState(state => ({
      world: { ...state.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
      hero: {
        ...state.hero,
        exp: 99, expToNext: 100,  // 1 xp suffit ? ashwood_wolf = 15 xp
        stats: { ...state.hero.stats, hp: 100, maxHp: 100, strength: 50 },
      },
    }))
    useGameStore.getState().processIdleTick()
    const lvl = useToastStore.getState().toasts.find(t => t.type === 'levelup')
    expect(lvl).toBeDefined()
  })
})

// ── CRF01 — Debuffs passifs ───────────────────────────────────────────────────
describe('CRF01 — debuffs (store)', () => {
  it('addHeroDebuff ajoute un debuff au héros', () => {
    useGameStore.getState().addHeroDebuff('fatigue', 7)
    const d = useGameStore.getState().hero.activeDebuffs
    expect(d).toHaveLength(1)
    expect(d[0].debuffId).toBe('fatigue')
    expect(d[0].duration.remaining).toBe(7)
  })

  it('sleep décrémente la durée des debuffs temporaires', () => {
    useGameStore.getState().addHeroDebuff('fatigue', 7)
    useGameStore.getState().sleep()
    expect(useGameStore.getState().hero.activeDebuffs[0].duration.remaining).toBe(6)
  })

  it('sleep retire un debuff arrivé à expiration', () => {
    useGameStore.getState().addHeroDebuff('fatigue', 1)
    useGameStore.getState().sleep()
    expect(useGameStore.getState().hero.activeDebuffs).toHaveLength(0)
  })

  it('un debuff permanent survit au sommeil', () => {
    useGameStore.getState().addHeroDebuff('black_smoke', 7, true)
    useGameStore.getState().sleep()
    const d = useGameStore.getState().hero.activeDebuffs
    expect(d).toHaveLength(1)
    expect(d[0].permanent).toBe(true)
  })
})

// ── M01 / T13 — Titres permanents ─────────────────────────────────────────────
describe('M01 — awardTitle', () => {
  it('attribue un titre permanent', () => {
    useGameStore.getState().awardTitle('first_steps')
    expect(useGameStore.getState().meta.titlesEarned).toContain('first_steps')
  })

  it('ne duplique pas un titre déjà gagné', () => {
    useGameStore.getState().awardTitle('first_steps')
    useGameStore.getState().awardTitle('first_steps')
    const count = useGameStore.getState().meta.titlesEarned.filter(t => t === 'first_steps').length
    expect(count).toBe(1)
  })

  it('ignore un titre inconnu', () => {
    useGameStore.getState().awardTitle('bogus_title')
    expect(useGameStore.getState().meta.titlesEarned).not.toContain('bogus_title')
  })
})

describe('T13 — Demon Lord Slayer', () => {
  it('tuer le Demon Lord (clearDungeon grimspire) attribue les titres permanents', () => {
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        dungeons: { ...state.world.dungeons, grimspire: { active: true, cleared: false, position: 'north', discovered: true } },
      },
    }))
    useGameStore.getState().clearDungeon('grimspire')
    const earned = useGameStore.getState().meta.titlesEarned
    expect(earned).toContain('demon_lord_slayer')
    expect(earned).toContain('malachar_bane')
  })

  it("un donjon normal n'attribue pas Demon Lord Slayer", () => {
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        dungeons: { ...state.world.dungeons, ashenvale: { active: true, cleared: false, position: 'north', discovered: true } },
      },
    }))
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().meta.titlesEarned).not.toContain('demon_lord_slayer')
  })
})

// ── GLT01-04 — Gluttony ───────────────────────────────────────────────────────
describe('GLT01/04 — absorbGluttony', () => {
  it('absorbe une stat choisie et la stocke en boost permanent', () => {
    const before = useGameStore.getState().hero.stats.strength
    useGameStore.getState().absorbGluttony({ monsterId: 'malachar', stat: 'strength' }) // atk 90 → +9
    const st = useGameStore.getState()
    expect(st.hero.stats.strength).toBe(before + 9)
    expect(st.meta.permanentStatBoosts.strength).toBe(9)
    expect(st.meta.gluttonyLastUsed).toBe(st.world.dayCount)
  })

  it('cumule les boosts permanents', () => {
    useGameStore.getState().absorbGluttony({ monsterId: 'ashwood_wolf', stat: 'agility' }) // atk 8 → +1
    useGameStore.getState().absorbGluttony({ monsterId: 'ashwood_wolf', stat: 'agility' })
    expect(useGameStore.getState().meta.permanentStatBoosts.agility).toBe(2)
  })

  it('ignore un monstre inconnu', () => {
    useGameStore.getState().absorbGluttony({ monsterId: 'bogus', stat: 'strength' })
    expect(useGameStore.getState().meta.permanentStatBoosts.strength ?? 0).toBe(0)
  })
})

describe('GLT01 — boosts permanents réappliqués au run', () => {
  it('applyTransmigration réinjecte les permanentStatBoosts', () => {
    useGameStore.setState(state => ({
      meta: {
        ...state.meta,
        permanentStatBoosts: { strength: 5 },
        pendingInheritance: { stat: null, activeSkill: null, passiveSkill: null, bonuses: {} },
      },
    }))
    useGameStore.getState().applyTransmigration({})
    // INITIAL_HERO strength 10 + boost 5 = 15
    expect(useGameStore.getState().hero.stats.strength).toBe(15)
  })
})

describe('W01 — récompense Demon Lord', () => {
  it('tuer Malachar (grimspire) donne +200 tokens', () => {
    const before = useGameStore.getState().hero.reputationTokens ?? 0
    useGameStore.setState(state => ({
      world: { ...state.world, dungeons: { ...state.world.dungeons, grimspire: { active: true, cleared: false, position: 'north', discovered: true } } },
    }))
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().hero.reputationTokens).toBe(before + 200)
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

  it('completeQuest ajoute le skill de récompense dans manaStones', () => {
    useGameStore.getState().startQuest('first_blood')
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } }
    }))
    useGameStore.getState().completeQuest('first_blood')
    const stones = useGameStore.getState().hero.inventory.manaStones
    expect(stones.some(s => s.skillId === 'counter_strike')).toBe(true)
  })

  it('clear_the_marsh donne 2 tokens (pas 1 par défaut)', () => {
    useGameStore.getState().startQuest('clear_the_marsh')
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { marsh_serpent: 3 } }
    }))
    const before = useGameStore.getState().hero.reputationTokens
    useGameStore.getState().completeQuest('clear_the_marsh')
    expect(useGameStore.getState().hero.reputationTokens).toBe(before + 2)
  })

  it('completeQuest ignore un questId inexistant', () => {
    const before = useGameStore.getState()
    useGameStore.getState().completeQuest('ghost_quest_id')
    const after = useGameStore.getState()
    expect(after.hero.inventory.gold).toBe(before.hero.inventory.gold)
  })

  // Q07 — Toast récompense de quête
  it('Q07 — completeQuest pousse un toast type quest', async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    useGameStore.getState().startQuest('first_blood')
    useGameStore.getState().completeQuest('first_blood')
    const toasts = useToastStore.getState().toasts
    expect(toasts.length).toBeGreaterThanOrEqual(1)
    const questToast = toasts.find(t => t.type === 'quest')
    expect(questToast).toBeDefined()
    expect(questToast.message).toMatch(/First Blood/)
  })

  it("Q07 — le toast inclut les récompenses (gold + tokens + skill)", async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    useGameStore.getState().startQuest('first_blood')  // 50g + 1 token + counter_strike
    useGameStore.getState().completeQuest('first_blood')
    const questToast = useToastStore.getState().toasts.find(t => t.type === 'quest')
    expect(questToast.message).toMatch(/50g/)
    expect(questToast.message).toMatch(/🪙/)
  })

  // UX03 — abandonQuest
  it("abandonQuest retire la quête active sans la marquer complétée", () => {
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toContain('first_blood')
    useGameStore.getState().abandonQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).not.toContain('first_blood')
    expect(useGameStore.getState().world.completedQuests).not.toContain('first_blood')
  })

  it("abandonQuest sur une quête non active ne change rien", () => {
    const before = useGameStore.getState().world.activeQuests
    useGameStore.getState().abandonQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toEqual(before)
  })

  it("abandonQuest permet de re-accepter la même quête plus tard", () => {
    useGameStore.getState().startQuest('first_blood')
    useGameStore.getState().abandonQuest('first_blood')
    useGameStore.getState().startQuest('first_blood')
    expect(useGameStore.getState().world.activeQuests).toContain('first_blood')
  })
})

// ── Nouvelles quêtes Q03 + Q08 ───────────────────────────────────────────────
describe('Quêtes Q03 — boss donjon', () => {
  it('silence_the_crypt : accepter → tuer crypt boss → completer', () => {
    const store = useGameStore.getState
    store().startQuest('silence_the_crypt')
    expect(store().world.activeQuests).toContain('silence_the_crypt')
    expect(store().isQuestComplete('silence_the_crypt')).toBe(false)

    // Simule le kill du boss
    store().recordKill('hollow_crypt_boss')
    expect(store().isQuestComplete('silence_the_crypt')).toBe(true)

    const goldBefore = store().hero.inventory.gold
    const tokensBefore = store().hero.reputationTokens
    store().completeQuest('silence_the_crypt')
    expect(store().hero.inventory.gold).toBe(goldBefore + 200)
    expect(store().hero.reputationTokens).toBe(tokensBefore + 3)
    expect(store().hero.inventory.manaStones.some(s => s.skillId === 'soul_crush')).toBe(true)
  })

  it('end_the_demon : 10 tokens + 1000 gold pour Malachar', () => {
    const store = useGameStore.getState
    store().startQuest('end_the_demon')
    store().recordKill('malachar')
    const tokensBefore = store().hero.reputationTokens
    store().completeQuest('end_the_demon')
    expect(store().hero.reputationTokens).toBe(tokensBefore + 10)
    expect(store().hero.inventory.gold).toBeGreaterThanOrEqual(1000)
  })

  it('storm_the_citadel drop forsaken_curse', () => {
    const store = useGameStore.getState
    store().startQuest('storm_the_citadel')
    store().recordKill('forsaken_citadel_boss')
    store().completeQuest('storm_the_citadel')
    expect(store().hero.inventory.manaStones.some(s => s.skillId === 'forsaken_curse')).toBe(true)
  })
})

describe('Quêtes Q08 — NPCs multiples', () => {
  it('bog_purge : 4 bog_shamblers requis', () => {
    const store = useGameStore.getState
    store().startQuest('bog_purge')
    for (let i = 0; i < 3; i++) store().recordKill('bog_shambler')
    expect(store().isQuestComplete('bog_purge')).toBe(false)
    store().recordKill('bog_shambler')
    expect(store().isQuestComplete('bog_purge')).toBe(true)
  })

  it('ruins_cleanse requiert 3 specters ET 2 hollow knights', () => {
    const store = useGameStore.getState
    store().startQuest('ruins_cleanse')
    for (let i = 0; i < 3; i++) store().recordKill('ruin_specter')
    expect(store().isQuestComplete('ruins_cleanse')).toBe(false) // manque les knights
    for (let i = 0; i < 2; i++) store().recordKill('hollow_knight')
    expect(store().isQuestComplete('ruins_cleanse')).toBe(true)
  })

  it('accepter plusieurs quêtes de NPCs différents simultanément', () => {
    const store = useGameStore.getState
    store().startQuest('first_blood')          // sir_aldric
    store().startQuest('silence_the_crypt')    // ironhaven_captain
    store().startQuest('bog_purge')            // greywatch_elder
    expect(store().world.activeQuests).toHaveLength(3)
  })
})

// ── Héros — Rename (C01) ─────────────────────────────────────────────────────
describe('renameHero', () => {
  it('change le nom du héros', () => {
    useGameStore.getState().renameHero('Lyra')
    expect(useGameStore.getState().hero.name).toBe('Lyra')
  })

  it('met heroNamed à true', () => {
    expect(useGameStore.getState().hero.heroNamed).toBe(false)
    useGameStore.getState().renameHero('Lyra')
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })

  it("trim les espaces autour du nom", () => {
    useGameStore.getState().renameHero('  Kael  ')
    expect(useGameStore.getState().hero.name).toBe('Kael')
  })

  it('revient à "The Wanderer" si le nom est vide', () => {
    useGameStore.getState().renameHero('')
    expect(useGameStore.getState().hero.name).toBe('The Wanderer')
  })

  it('revient à "The Wanderer" si le nom est uniquement des espaces', () => {
    useGameStore.getState().renameHero('   ')
    expect(useGameStore.getState().hero.name).toBe('The Wanderer')
  })

  it('met quand même heroNamed=true même si nom vide (évite de rouvrir CharCreation)', () => {
    useGameStore.getState().renameHero('')
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })
})

// ── Divinité (DV02 / S01) ────────────────────────────────────────────────────
describe('acceptDeity', () => {
  it('set la divinité sur le héros', () => {
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    expect(useGameStore.getState().hero.deity).toBe('ignareth')
  })

  it('crée le divineSkill au niveau 1', () => {
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    const { divineSkill } = useGameStore.getState().hero
    expect(divineSkill).toEqual({ skillId: 'inferno_strike', level: 1, xp: 0 })
  })

  it('pousse le divine skill dans activeSkills (DV02)', () => {
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    const { activeSkills } = useGameStore.getState().hero
    expect(activeSkills.some(s => s.skillId === 'inferno_strike')).toBe(true)
  })

  it('évite la duplication si le skill est déjà équipé', () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'inferno_strike', level: 2, xp: 5 })
    useGameStore.getState().equipActiveSkill({ skillId: 'inferno_strike', level: 2, xp: 5 })
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    const active = useGameStore.getState().hero.activeSkills
    const count = active.filter(s => s.skillId === 'inferno_strike').length
    expect(count).toBe(1)
  })

  it("enregistre divineBonds pour l'univers medieval_fantasy", () => {
    useGameStore.getState().acceptDeity('sylvara', 'healing_bloom')
    expect(useGameStore.getState().meta.divineBonds.medieval_fantasy).toBe('sylvara')
  })

  it('clean pendingDivineCall et retourne à world_map', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    const state = useGameStore.getState()
    expect(state.pendingDivineCall).toBeNull()
    expect(state.currentScreen).toBe('world_map')
  })
})

describe('refuseDeity', () => {
  it('clean pendingDivineCall sans set de divinité', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    useGameStore.getState().refuseDeity()
    const state = useGameStore.getState()
    expect(state.pendingDivineCall).toBeNull()
    expect(state.hero.deity).toBeNull()
  })

  // DV07 — Refus = run solo
  it("DV07 — refuseDeity lève le flag hero.soloRun", () => {
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().hero.soloRun).toBe(false)
    useGameStore.getState().triggerDivineCall('ignareth')
    useGameStore.getState().refuseDeity()
    expect(useGameStore.getState().hero.soloRun).toBe(true)
  })

  it("DV07 — soloRun garantit le bonus T11 (+1 lvl skills) même si une divinité existait", () => {
    useGameStore.getState().resetGame()
    // Simule : a une divinité MAIS soloRun=true (a refusé une 2e divinité)
    useGameStore.setState(state => ({ hero: { ...state.hero, deity: 'ignareth', soloRun: true } }))
    useGameStore.getState().confirmInheritance('strength', { skillId: 'savage_bite', level: 1, xp: 0 }, null)
    useGameStore.getState().applyTransmigration({})
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(active.level).toBe(2) // base 1 + solo bonus 1
  })
})

// ── Mort & héritage ───────────────────────────────────────────────────────────
describe('heroDeath', () => {
  it('passe en post_mortem', () => {
    useGameStore.getState().heroDeath('Ashwood Wolf')
    expect(useGameStore.getState().currentScreen).toBe('post_mortem')
  })

  it('capture la cause de mort dans lastRunSummary (T01)', () => {
    useGameStore.getState().heroDeath('Stone Golem')
    expect(useGameStore.getState().meta.lastRunSummary.cause).toBe('Stone Golem')
  })

  it('défaut "Unknown enemy" si pas de cause fournie', () => {
    useGameStore.getState().heroDeath()
    expect(useGameStore.getState().meta.lastRunSummary.cause).toBe('Unknown enemy')
  })

  it('incrémente totalDeaths dans meta', () => {
    const before = useGameStore.getState().meta.totalDeaths
    useGameStore.getState().heroDeath('Wolf')
    expect(useGameStore.getState().meta.totalDeaths).toBe(before + 1)
  })

  it('nettoie activeCombat', () => {
    useGameStore.getState().startCombat([{ id: 'x', monsterId: 'ashwood_wolf', name: 'W', stats: { hp: 10 }, currentHp: 0, rank: 'common', expReward: 15 }])
    useGameStore.getState().heroDeath('W')
    expect(useGameStore.getState().activeCombat).toBeNull()
  })

  it('lastRunSummary inclut level, kills, tokens, stats', () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, level: 3, reputationTokens: 5 },
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 4, marsh_serpent: 2 } },
    }))
    useGameStore.getState().heroDeath('Serpent')
    const s = useGameStore.getState().meta.lastRunSummary
    expect(s.level).toBe(3)
    expect(s.totalKills).toBe(6)
    expect(s.reputationTokens).toBe(5)
    expect(s.stats).toBeDefined()
  })
})

describe('confirmInheritance + applyTransmigration', () => {
  it('confirmInheritance passe au gods_shop', () => {
    useGameStore.getState().confirmInheritance('strength', null, null)
    expect(useGameStore.getState().currentScreen).toBe('gods_shop')
  })

  it('confirmInheritance stocke pendingInheritance', () => {
    useGameStore.getState().confirmInheritance('agility', { skillId: 'savage_bite', level: 2, xp: 0 }, null)
    expect(useGameStore.getState().meta.pendingInheritance.stat).toBe('agility')
    expect(useGameStore.getState().meta.pendingInheritance.activeSkill.skillId).toBe('savage_bite')
  })

  it('applyTransmigration booste la stat héritée de 10%', () => {
    const baseStr = useGameStore.getState().hero.stats.strength
    useGameStore.getState().confirmInheritance('strength', null, null)
    useGameStore.getState().applyTransmigration({ extraSkills: [] })
    const after = useGameStore.getState().hero.stats.strength
    expect(after).toBe(Math.round(baseStr * 1.10))
  })

  it('applyTransmigration incrémente runNumber et deathCount', () => {
    useGameStore.setState(state => ({ hero: { ...state.hero, runNumber: 1, deathCount: 0 } }))
    useGameStore.getState().confirmInheritance('strength', null, null)
    useGameStore.getState().applyTransmigration({ extraSkills: [] })
    const h = useGameStore.getState().hero
    expect(h.runNumber).toBe(2)
    expect(h.deathCount).toBe(1)
  })

  it("applyTransmigration transporte l'active skill choisi", () => {
    // Simule un run AVEC divinité pour neutraliser T11 solo bonus
    useGameStore.setState((state) => ({ hero: { ...state.hero, deity: 'ignareth' } }))
    const skill = { skillId: 'savage_bite', level: 2, xp: 10 }
    useGameStore.getState().confirmInheritance('strength', skill, null)
    useGameStore.getState().applyTransmigration({ extraSkills: [] })
    const active = useGameStore.getState().hero.activeSkills
    expect(active.some(s => s.skillId === 'savage_bite' && s.level === 2)).toBe(true)
  })

  it('applyTransmigration nettoie pendingInheritance', () => {
    useGameStore.getState().confirmInheritance('strength', null, null)
    useGameStore.getState().applyTransmigration({ extraSkills: [] })
    expect(useGameStore.getState().meta.pendingInheritance).toBeNull()
  })

  it('applyTransmigration reset le monde (nouveau jour 1)', () => {
    useGameStore.setState(state => ({ world: { ...state.world, dayCount: 12 } }))
    useGameStore.getState().confirmInheritance('strength', null, null)
    useGameStore.getState().applyTransmigration({ extraSkills: [] })
    expect(useGameStore.getState().world.dayCount).toBe(1)
  })

  // T04 + W02 — Malachar resurrection counter
  describe('T04 — Malachar resurrection counter', () => {
    const transmigrate = () => {
      useGameStore.getState().confirmInheritance('strength', null, null)
      useGameStore.getState().applyTransmigration({})
    }

    it("compteur reste à 0 tant que Malachar n'a pas été tué", () => {
      transmigrate()
      expect(useGameStore.getState().world.demonLordResurrectionCounter).toBe(0)
      expect(useGameStore.getState().world.demonLordDefeated).toBe(false)
    })

    it("compteur s'incrémente à 1 après transmigration si Malachar killed", () => {
      useGameStore.getState().clearDungeon('grimspire')  // tue Malachar
      transmigrate()
      expect(useGameStore.getState().world.demonLordResurrectionCounter).toBe(1)
      expect(useGameStore.getState().world.demonLordDefeated).toBe(true)
    })

    it("après 4 transmigrations post-kill : Malachar respawn (counter reset + defeated=false)", () => {
      useGameStore.getState().clearDungeon('grimspire')
      transmigrate()  // 1
      transmigrate()  // 2
      transmigrate()  // 3
      transmigrate()  // 4 → respawn
      expect(useGameStore.getState().world.demonLordResurrectionCounter).toBe(0)
      expect(useGameStore.getState().world.demonLordDefeated).toBe(false)
      // Le donjon grimspire est aussi reset (cleared/discovered)
      expect(useGameStore.getState().world.dungeons.grimspire.cleared).toBe(false)
      expect(useGameStore.getState().world.dungeons.grimspire.discovered).toBe(false)
    })

    it("après respawn, prochain kill remet le counter à 1", () => {
      useGameStore.getState().clearDungeon('grimspire')
      transmigrate()
      transmigrate()
      transmigrate()
      transmigrate()  // respawn
      // Re-kill
      useGameStore.getState().clearDungeon('grimspire')
      transmigrate()
      expect(useGameStore.getState().world.demonLordResurrectionCounter).toBe(1)
    })

    it("W03 — flag malacharDefeatedThisRun reset à la transmigration", () => {
      useGameStore.getState().clearDungeon('grimspire')
      expect(useGameStore.getState().meta.malacharDefeatedThisRun).toBe(true)
      transmigrate()
      expect(useGameStore.getState().meta.malacharDefeatedThisRun).toBe(false)
    })
  })
})

// ── Calendrier / Sleep ───────────────────────────────────────────────────────
describe('advanceTick', () => {
  it('incrémente tickCount', () => {
    useGameStore.getState().advanceTick()
    expect(useGameStore.getState().world.tickCount).toBe(1)
  })

  it('passe au jour suivant après 24 ticks', () => {
    for (let i = 0; i < 24; i++) useGameStore.getState().advanceTick()
    expect(useGameStore.getState().world.tickCount).toBe(0)
    expect(useGameStore.getState().world.dayCount).toBe(2)
  })

  it('pas de rollover avant 24 ticks', () => {
    for (let i = 0; i < 23; i++) useGameStore.getState().advanceTick()
    expect(useGameStore.getState().world.tickCount).toBe(23)
    expect(useGameStore.getState().world.dayCount).toBe(1)
  })

  // CAL01 — vérifications complémentaires
  it('CAL01 — cycle complet : 24 advanceTick = +1 jour exact', () => {
    const startDay = useGameStore.getState().world.dayCount
    for (let i = 0; i < 24; i++) useGameStore.getState().advanceTick()
    expect(useGameStore.getState().world.dayCount).toBe(startDay + 1)
    expect(useGameStore.getState().world.tickCount).toBe(0)
  })
})

// ── CAL01 — prayAtChurch (Church Pray consomme 1 tick) ───────────────────────
describe('CAL01 — prayAtChurch', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 30, mana: 10 } },
      world: { ...state.world, tickCount: 5 },
    }))
  })

  it("restaure 40% HP et 40% mana", () => {
    const before = useGameStore.getState().hero.stats
    useGameStore.getState().prayAtChurch()
    const after = useGameStore.getState().hero.stats
    expect(after.hp).toBe(before.hp + Math.round(before.maxHp * 0.40))
    expect(after.mana).toBe(before.mana + Math.round(before.maxMana * 0.40))
  })

  it("consomme 1 tick (tickCount + 1)", () => {
    const beforeTick = useGameStore.getState().world.tickCount
    useGameStore.getState().prayAtChurch()
    expect(useGameStore.getState().world.tickCount).toBe(beforeTick + 1)
  })

  it("passe au jour suivant si pray est fait au tick 23", () => {
    useGameStore.setState(state => ({ world: { ...state.world, tickCount: 23, dayCount: 1 } }))
    useGameStore.getState().prayAtChurch()
    expect(useGameStore.getState().world.tickCount).toBe(0)
    expect(useGameStore.getState().world.dayCount).toBe(2)
  })

  it("HP cap au max (pas d'overflow)", () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: state.hero.stats.maxHp - 5 } },
    }))
    useGameStore.getState().prayAtChurch()
    const { hp, maxHp } = useGameStore.getState().hero.stats
    expect(hp).toBeLessThanOrEqual(maxHp)
  })
})

describe('sleep', () => {
  it('restaure HP et MP au max', () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 10, mana: 5 } },
    }))
    useGameStore.getState().sleep()
    const { hp, maxHp, mana, maxMana } = useGameStore.getState().hero.stats
    expect(hp).toBe(maxHp)
    expect(mana).toBe(maxMana)
  })

  it('avance au jour suivant et remet tickCount à 0', () => {
    useGameStore.setState(state => ({ world: { ...state.world, tickCount: 15, dayCount: 3 } }))
    useGameStore.getState().sleep()
    expect(useGameStore.getState().world.dayCount).toBe(4)
    expect(useGameStore.getState().world.tickCount).toBe(0)
  })

  it("respawn les donjons 'cleared'", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, dungeons: { ashenvale: { active: true, cleared: true, position: 'east', discovered: true } } },
    }))
    useGameStore.getState().sleep()
    const d = useGameStore.getState().world.dungeons.ashenvale
    expect(d.cleared).toBe(false)
    expect(d.discovered).toBe(false)
  })
})

// ── Heal / Restore (caps) ─────────────────────────────────────────────────────
describe('healHero / restoreHeroMana', () => {
  it("healHero ne dépasse jamais maxHp", () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 50, maxHp: 100 } },
    }))
    useGameStore.getState().healHero(9999)
    expect(useGameStore.getState().hero.stats.hp).toBe(100)
  })

  it('healHero additionne correctement sous le cap', () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, hp: 30, maxHp: 100 } },
    }))
    useGameStore.getState().healHero(40)
    expect(useGameStore.getState().hero.stats.hp).toBe(70)
  })

  it("restoreHeroMana ne dépasse jamais maxMana", () => {
    useGameStore.setState(state => ({
      hero: { ...state.hero, stats: { ...state.hero.stats, mana: 10, maxMana: 60 } },
    }))
    useGameStore.getState().restoreHeroMana(500)
    expect(useGameStore.getState().hero.stats.mana).toBe(60)
  })
})

// ── Gold & ressources ────────────────────────────────────────────────────────
describe('Gold management', () => {
  it("addGold augmente l'or", () => {
    useGameStore.getState().addGold(100)
    expect(useGameStore.getState().hero.inventory.gold).toBe(100)
  })

  it("spendGold retire l'or (sans aller sous 0)", () => {
    useGameStore.getState().addGold(50)
    useGameStore.getState().spendGold(30)
    expect(useGameStore.getState().hero.inventory.gold).toBe(20)
  })

  it("spendGold avec montant > gold ne va pas sous 0", () => {
    useGameStore.getState().addGold(10)
    useGameStore.getState().spendGold(100)
    expect(useGameStore.getState().hero.inventory.gold).toBeGreaterThanOrEqual(0)
  })
})

describe('Resources', () => {
  it('addResource empile sur la même clé', () => {
    useGameStore.getState().addResource('wolf_pelt', 3)
    useGameStore.getState().addResource('wolf_pelt', 2)
    expect(useGameStore.getState().hero.inventory.resources.wolf_pelt).toBe(5)
  })

  it('removeResource retire et ne va pas sous 0', () => {
    useGameStore.getState().addResource('wolf_pelt', 2)
    useGameStore.getState().removeResource('wolf_pelt', 5)
    const qty = useGameStore.getState().hero.inventory.resources.wolf_pelt ?? 0
    expect(qty).toBeGreaterThanOrEqual(0)
  })

  it('addConsumable empile', () => {
    useGameStore.getState().addConsumable('hp_potion_small', 2)
    useGameStore.getState().addConsumable('hp_potion_small', 1)
    expect(useGameStore.getState().hero.inventory.consumables.hp_potion_small).toBe(3)
  })
})

// ── Donjons ──────────────────────────────────────────────────────────────────
describe('Donjons', () => {
  it("discoverDungeon marque le donjon comme découvert", () => {
    useGameStore.getState().discoverDungeon('ashenvale')
    expect(useGameStore.getState().world.dungeons.ashenvale.discovered).toBe(true)
  })

  it('discoverDungeon ignore une zone sans donjon', () => {
    const before = useGameStore.getState()
    useGameStore.getState().discoverDungeon('inexistant')
    const after = useGameStore.getState()
    expect(after.world.dungeons).toEqual(before.world.dungeons)
  })

  it('clearDungeon marque le donjon comme cleared', () => {
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().world.dungeons.ashenvale.cleared).toBe(true)
  })

  it("clearDungeon sur grimspire flag demonLordDefeated", () => {
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().world.demonLordDefeated).toBe(true)
  })

  // M02 — Compteur Demon Lords kills par univers
  it("M02 — clearDungeon('grimspire') incrémente meta.demonLordKills.medieval_fantasy", () => {
    expect(useGameStore.getState().meta.demonLordKills.medieval_fantasy ?? 0).toBe(0)
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().meta.demonLordKills.medieval_fantasy).toBe(1)
  })

  it("M02 — incréments multiples (re-kill après respawn) s'additionnent", () => {
    useGameStore.getState().clearDungeon('grimspire')
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().meta.demonLordKills.medieval_fantasy).toBe(2)
  })

  it("M02 — clearDungeon ashenvale n'incrémente PAS demonLordKills", () => {
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().meta.demonLordKills.medieval_fantasy ?? 0).toBe(0)
  })

  // D05 — Warp à la sortie
  it("D05 — clearDungeon warpe le hero vers la city de la zone", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, currentLocation: 'millhaven', currentHuntingSpot: 'crumbled_ruins' },
    }))
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().world.currentLocation).toBe('ironhaven')
    expect(useGameStore.getState().world.currentHuntingSpot).toBeNull()
  })

  it("D05 — clearDungeon stop l'idle (cohérence D07)", () => {
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        isIdleActive: true,
        idleTargetMonster: 'ashwood_wolf',
      },
    }))
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
    expect(useGameStore.getState().world.idleTargetMonster).toBeNull()
  })

  it("D05 — clearDungeon grimspire warpe vers stonehaven", () => {
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().world.currentLocation).toBe('stonehaven')
  })

  // W03 — Flag malacharDefeatedThisRun
  it("W03 — clearDungeon('grimspire') lève malacharDefeatedThisRun", () => {
    expect(useGameStore.getState().meta.malacharDefeatedThisRun).toBe(false)
    useGameStore.getState().clearDungeon('grimspire')
    expect(useGameStore.getState().meta.malacharDefeatedThisRun).toBe(true)
  })

  it("W03 — clearDungeon ashenvale NE lève PAS malacharDefeatedThisRun", () => {
    useGameStore.getState().clearDungeon('ashenvale')
    expect(useGameStore.getState().meta.malacharDefeatedThisRun).toBe(false)
  })
})

// ── Reset & Toggle Idle ──────────────────────────────────────────────────────
describe('toggleIdle', () => {
  it("refuse l'activation si kills < 5", () => {
    useGameStore.getState().toggleIdle('ashwood_wolf')
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })

  it('active si kills >= 5', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } },
    }))
    useGameStore.getState().toggleIdle('ashwood_wolf')
    expect(useGameStore.getState().world.isIdleActive).toBe(true)
    expect(useGameStore.getState().world.idleTargetMonster).toBe('ashwood_wolf')
  })

  it('désactive si on toggle à nouveau', () => {
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } },
    }))
    useGameStore.getState().toggleIdle('ashwood_wolf')
    useGameStore.getState().toggleIdle('ashwood_wolf')
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })

  // D07 — Idle interdit dans certaines zones / écrans
  it("D07 — refuse l'activation idle sur la Blighted Road (idleAllowed=false)", () => {
    useGameStore.setState(state => ({
      world: {
        ...state.world,
        currentZone: 'blighted_road',
        monsterKillCounts: { cursed_warlord: 10 },
      },
    }))
    useGameStore.getState().toggleIdle('cursed_warlord')
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })

  it("D07 — refuse l'activation idle sur écran dungeon", () => {
    useGameStore.setState(state => ({
      currentScreen: 'dungeon',
      world: {
        ...state.world,
        currentZone: 'ashenvale',
        monsterKillCounts: { ashwood_wolf: 5 },
      },
    }))
    useGameStore.getState().toggleIdle('ashwood_wolf')
    expect(useGameStore.getState().world.isIdleActive).toBe(false)
  })

  it("D07 — autorise idle sur ashenvale (zone normale)", () => {
    useGameStore.setState(state => ({
      currentScreen: 'zone_view',
      world: {
        ...state.world,
        currentZone: 'ashenvale',
        monsterKillCounts: { ashwood_wolf: 5 },
      },
    }))
    useGameStore.getState().toggleIdle('ashwood_wolf')
    expect(useGameStore.getState().world.isIdleActive).toBe(true)
  })
})

describe('resetGame', () => {
  it('remet hero/world/meta à leurs valeurs initiales', () => {
    useGameStore.getState().addGold(500)
    useGameStore.getState().gainExp(300)
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.hero.inventory.gold).toBe(0)
    expect(state.hero.exp).toBe(0)
    expect(state.hero.level).toBe(1)
  })

  it('retourne à world_map', () => {
    useGameStore.getState().setScreen('combat')
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().currentScreen).toBe('world_map')
  })

  it('nettoie activeCombat et pendingDivineCall', () => {
    useGameStore.getState().triggerDivineCall('ignareth')
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().pendingDivineCall).toBeNull()
    expect(useGameStore.getState().activeCombat).toBeNull()
  })

  it("réinitialise heroNamed à false (re-déclenche CharacterCreation)", () => {
    useGameStore.getState().renameHero('Kael')
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().hero.heroNamed).toBe(false)
  })
})

// ── clearPendingLevelUp (C02) ────────────────────────────────────────────────
describe('clearPendingLevelUp', () => {
  it('remet pendingLevelUp à 0', () => {
    useGameStore.getState().gainExp(1000)
    expect(useGameStore.getState().pendingLevelUp).toBeGreaterThan(0)
    useGameStore.getState().clearPendingLevelUp()
    expect(useGameStore.getState().pendingLevelUp).toBe(0)
  })
})

// ── Kill count ───────────────────────────────────────────────────────────────
describe('recordKill', () => {
  it('incrémente le compteur pour un monstre', () => {
    useGameStore.getState().recordKill('ashwood_wolf')
    useGameStore.getState().recordKill('ashwood_wolf')
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(2)
  })

  it('compte séparément chaque type', () => {
    useGameStore.getState().recordKill('ashwood_wolf')
    useGameStore.getState().recordKill('marsh_serpent')
    expect(useGameStore.getState().world.monsterKillCounts.ashwood_wolf).toBe(1)
    expect(useGameStore.getState().world.monsterKillCounts.marsh_serpent).toBe(1)
  })

  // TUT02 — Hint idle unlock
  it("TUT02 — toast hint au 5e kill (idle unlock) + flag seenHints", async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    useGameStore.getState().resetGame()
    for (let i = 0; i < 5; i++) useGameStore.getState().recordKill('ashwood_wolf')
    expect(useGameStore.getState().meta.seenHints).toContain('idle_unlock')
    const hint = useToastStore.getState().toasts.find(t => /Idle combat unlocked/.test(t.message))
    expect(hint).toBeDefined()
  })

  it("TUT02 — hint affiché UNE seule fois (pas au 2e mob qui atteint 5)", async () => {
    const { useToastStore } = await import('./toastStore')
    useGameStore.getState().resetGame()
    for (let i = 0; i < 5; i++) useGameStore.getState().recordKill('ashwood_wolf')
    useToastStore.getState().clearToasts()
    // 2e mob atteint 5 → pas de nouveau hint
    for (let i = 0; i < 5; i++) useGameStore.getState().recordKill('marsh_serpent')
    const hint = useToastStore.getState().toasts.find(t => /Idle combat unlocked/.test(t.message))
    expect(hint).toBeUndefined()
  })

  it("TUT02 — pas de hint avant le 5e kill", async () => {
    const { useToastStore } = await import('./toastStore')
    useToastStore.getState().clearToasts()
    useGameStore.getState().resetGame()
    for (let i = 0; i < 4; i++) useGameStore.getState().recordKill('ashwood_wolf')
    expect(useGameStore.getState().meta.seenHints).not.toContain('idle_unlock')
  })
})

// ── Migration save (heroNamed) ───────────────────────────────────────────────
describe('Migration save — heroNamed (C01)', () => {
  it("infère heroNamed=false si le nom est 'The Wanderer'", () => {
    const oldSave = {
      hero: { ...useGameStore.getState().hero, name: 'The Wanderer' },
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
    }
    delete oldSave.hero.heroNamed // simule ancienne save
    localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.heroNamed).toBe(false)
  })

  it("infère heroNamed=true si le héros a un nom perso", () => {
    const oldSave = {
      hero: { ...useGameStore.getState().hero, name: 'Kael' },
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
    }
    delete oldSave.hero.heroNamed
    localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })

  it("préserve heroNamed explicite dans la save", () => {
    const save = {
      hero: { ...useGameStore.getState().hero, name: 'The Wanderer', heroNamed: true },
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
    }
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.heroNamed).toBe(true)
  })
})

// ── S04 — Notif level-up de skill ────────────────────────────────────────────
describe('gainSkillXp — S04 notif level-up', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    useGameStore.getState().equipActiveSkill({ skillId: 'savage_bite', level: 1, xp: 0 })
  })

  it("recentSkillLevelUps est vide au départ", () => {
    expect(useGameStore.getState().recentSkillLevelUps).toEqual([])
  })

  it('push une entrée level-up quand le skill monte de niveau', () => {
    for (let i = 0; i < 20; i++) useGameStore.getState().gainSkillXp('savage_bite', 1)
    const entries = useGameStore.getState().recentSkillLevelUps
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ skillId: 'savage_bite', fromLevel: 1, toLevel: 2 })
  })

  it("aucun push si pas de level-up", () => {
    useGameStore.getState().gainSkillXp('savage_bite', 5) // < 20
    expect(useGameStore.getState().recentSkillLevelUps).toHaveLength(0)
  })

  it("push 2 entrées si on saute Lv1 → Lv2 puis Lv2 → Lv3 (cumul d'xp énorme)", () => {
    useGameStore.getState().gainSkillXp('savage_bite', 20)  // Lv2
    useGameStore.getState().gainSkillXp('savage_bite', 50)  // Lv3
    expect(useGameStore.getState().recentSkillLevelUps).toHaveLength(2)
  })

  it("clearSkillLevelUp(id) retire l'entrée correspondante", () => {
    for (let i = 0; i < 20; i++) useGameStore.getState().gainSkillXp('savage_bite', 1)
    const id = useGameStore.getState().recentSkillLevelUps[0].id
    useGameStore.getState().clearSkillLevelUp(id)
    expect(useGameStore.getState().recentSkillLevelUps).toHaveLength(0)
  })

  it("clearAllSkillLevelUps vide la liste", () => {
    for (let i = 0; i < 20; i++) useGameStore.getState().gainSkillXp('savage_bite', 1)
    useGameStore.getState().clearAllSkillLevelUps()
    expect(useGameStore.getState().recentSkillLevelUps).toHaveLength(0)
  })

  it("resetGame vide les recentSkillLevelUps", () => {
    for (let i = 0; i < 20; i++) useGameStore.getState().gainSkillXp('savage_bite', 1)
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().recentSkillLevelUps).toEqual([])
  })
})

// ── DV08 — acceptDeity applique le blessing ───────────────────────────────────
describe('acceptDeity — DV08 blessing applied', () => {
  it("Ignareth : strength augmente de 15% à l'acceptation", () => {
    useGameStore.getState().resetGame()
    const before = useGameStore.getState().hero.stats.strength
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    const after = useGameStore.getState().hero.stats.strength
    expect(after).toBe(Math.round(before * 1.15))
  })

  it("hero.deityBlessing est set après acceptation Ignareth", () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().acceptDeity('ignareth', 'inferno_strike')
    expect(useGameStore.getState().hero.deityBlessing).toBeDefined()
    expect(useGameStore.getState().hero.deityBlessing.id).toBe('ignareth_blessing')
  })

  it("Sylvara : pas de modification immédiate de stat (effet runtime)", () => {
    useGameStore.getState().resetGame()
    const beforeStr = useGameStore.getState().hero.stats.strength
    const beforeMaxHp = useGameStore.getState().hero.stats.maxHp
    useGameStore.getState().acceptDeity('sylvara', 'healing_bloom')
    expect(useGameStore.getState().hero.stats.strength).toBe(beforeStr)
    expect(useGameStore.getState().hero.stats.maxHp).toBe(beforeMaxHp)
    // Mais le blessing est bien stocké
    expect(useGameStore.getState().hero.deityBlessing.id).toBe('sylvara_blessing')
  })
})

// ── T06–T11 — applyTransmigration avec achats boutique ──────────────────────
describe('applyTransmigration — T06 à T11 (boutique)', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  // Par défaut on simule un run AVEC divinité pour neutraliser T11 (compensation solo)
  const setupInheritance = ({ deity = 'ignareth', repTokens = 0 } = {}) => {
    useGameStore.setState((state) => ({
      hero: {
        ...state.hero,
        deity,
        reputationTokens: repTokens,
      },
    }))
    useGameStore.getState().confirmInheritance(
      'strength',
      { skillId: 'savage_bite', level: 1, xp: 0 },
      null
    )
  }

  it("T06 — rankRestored : récupère 80% des rep tokens du run précédent", () => {
    setupInheritance({ repTokens: 100 })
    useGameStore.getState().applyTransmigration({ rankRestored: true })
    expect(useGameStore.getState().hero.reputationTokens).toBe(80)
  })

  it("T06 — sans rankRestored : tokens à 0", () => {
    setupInheritance({ repTokens: 100 })
    useGameStore.getState().applyTransmigration({})
    expect(useGameStore.getState().hero.reputationTokens).toBe(0)
  })

  it("T07 — extraSkills (active) : ajoute un skill bonus", () => {
    setupInheritance()
    useGameStore.getState().applyTransmigration({
      extraSkills: [{ type: 'active', skillId: 'power_strike', level: 1, xp: 0 }],
    })
    const active = useGameStore.getState().hero.activeSkills
    expect(active.some(s => s.skillId === 'power_strike')).toBe(true)
    expect(active.some(s => s.skillId === 'savage_bite')).toBe(true)  // hérité
  })

  it("T07 — extraSkills (passive) : ajoute un passif bonus", () => {
    setupInheritance()
    useGameStore.getState().applyTransmigration({
      extraSkills: [{ type: 'passive', skillId: 'iron_resolve', level: 1, xp: 0 }],
    })
    expect(useGameStore.getState().hero.passiveSkills.some(s => s.skillId === 'iron_resolve')).toBe(true)
  })

  it("T08 — bonusStatSlot : +1 stat", () => {
    setupInheritance()
    useGameStore.getState().applyTransmigration({ bonusStatSlot: true, bonusStat: 'agility' })
    // Stat de base agility = 10 → 11
    expect(useGameStore.getState().hero.stats.agility).toBe(11)
  })

  it("T09 — skillLevelUps : +N niveau sur le skill hérité", () => {
    setupInheritance()
    useGameStore.getState().applyTransmigration({ skillLevelUps: 1 })
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(active.level).toBe(2)
  })

  it("T09 — skillLevelUps capé à 3", () => {
    setupInheritance()
    useGameStore.getState().applyTransmigration({ skillLevelUps: 5 })
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(active.level).toBe(3)
  })

  it("T11 — Compensation solo : +1 lv si pas de divinité au run précédent", () => {
    setupInheritance({ deity: null })
    useGameStore.getState().applyTransmigration({})
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(active.level).toBe(2) // base 1 + solo bonus 1
  })

  it("T11 — Pas de compensation si une divinité a été acceptée", () => {
    setupInheritance({ deity: 'ignareth' })
    useGameStore.getState().applyTransmigration({})
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    expect(active.level).toBe(1)
  })

  it("T09 + T11 cumulent : skillLevelUps + solo compensent", () => {
    setupInheritance({ deity: null })
    useGameStore.getState().applyTransmigration({ skillLevelUps: 1 })
    const active = useGameStore.getState().hero.activeSkills.find(s => s.skillId === 'savage_bite')
    // Base 1 + skillLevelUp 1 + solo 1 = 3 (capé)
    expect(active.level).toBe(3)
  })

  it("préserve heroNamed et name à travers transmigration", () => {
    useGameStore.getState().renameHero('Lyra')
    setupInheritance()
    useGameStore.getState().applyTransmigration({})
    const h = useGameStore.getState().hero
    expect(h.name).toBe('Lyra')
    expect(h.heroNamed).toBe(true)
  })
})

// ── DV10 — Skill divin héritable seulement si Lv 2+ ──────────────────────────
describe('DV10 — héritage skill divin Lv 2+', () => {
  it("isDivineSkillInheritable : skill normal Lv 1 → true", async () => {
    const { isDivineSkillInheritable } = await import('../data/skills')
    const skill = { container: 'standard', inheritable: true, level: 1 }
    expect(isDivineSkillInheritable(skill)).toBe(true)
  })

  it("isDivineSkillInheritable : skill divin Lv 1 → false", async () => {
    const { isDivineSkillInheritable } = await import('../data/skills')
    expect(isDivineSkillInheritable({ container: 'divine', level: 1 })).toBe(false)
  })

  it("isDivineSkillInheritable : skill divin Lv 2 → true", async () => {
    const { isDivineSkillInheritable } = await import('../data/skills')
    expect(isDivineSkillInheritable({ container: 'divine', level: 2 })).toBe(true)
  })

  it("isDivineSkillInheritable : skill divin Lv 3 → true", async () => {
    const { isDivineSkillInheritable } = await import('../data/skills')
    expect(isDivineSkillInheritable({ container: 'divine', level: 3 })).toBe(true)
  })
})

// ── Migration des saves anciennes : champs inventaire manquants ──────────────
// Bug réel observé : un user avec une vieille save sans `equipment` / `equipped`
// crashait l'écran Inventory au render. Cette suite garantit la robustesse.
describe('Migration save — anti-crash inventaire (régression)', () => {
  const oldSaveWithoutEquipment = () => ({
    hero: {
      name: 'OldRunner',
      stats: { hp: 100, maxHp: 100, mana: 60, maxMana: 60, strength: 10, agility: 10, intelligence: 8, chance: 5, def: 5 },
      level: 3, exp: 50, expToNext: 225,
      activeSkills: [],
      passiveSkills: [],
      deity: 'sylvara',
      divineSkill: { skillId: 'healing_bloom', level: 1, xp: 0 },
      titles: [],
      // PAS de hero.equipped — vieille save
      inventory: {
        resources: { wolf_pelt: 3 },
        consumables: {},
        manaStones: [{ skillId: 'counter_strike', level: 1, xp: 0 }],
        // PAS de inventory.equipment — vieille save
        gold: 58,
      },
      battleLog: [],
      combatEntryLog: [],
      runNumber: 1,
      deathCount: 0,
      reputationTokens: 2,
      adventurerRankTokens: 0,
    },
    world: useGameStore.getState().world,
    meta: useGameStore.getState().meta,
  })

  it("ajoute hero.inventory.equipment = [] si absent (anti-crash Inventory)", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(oldSaveWithoutEquipment()))
    useGameStore.getState().loadGame()
    expect(Array.isArray(useGameStore.getState().hero.inventory.equipment)).toBe(true)
    expect(useGameStore.getState().hero.inventory.equipment).toHaveLength(0)
  })

  it("ajoute hero.equipped avec 4 slots null si absent", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(oldSaveWithoutEquipment()))
    useGameStore.getState().loadGame()
    const eq = useGameStore.getState().hero.equipped
    expect(eq).toEqual({ weapon: null, helmet: null, armor: null, boots: null })
  })

  it("préserve les manaStones existantes", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(oldSaveWithoutEquipment()))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.inventory.manaStones).toHaveLength(1)
    expect(useGameStore.getState().hero.inventory.manaStones[0].skillId).toBe('counter_strike')
  })

  it("migre divineSkill rétroactif dans activeSkills (DV02 retro)", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(oldSaveWithoutEquipment()))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.activeSkills.some(s => s.skillId === 'healing_bloom')).toBe(true)
  })

  it("ne dédoublonne pas le divine skill s'il est déjà dans activeSkills", () => {
    const save = oldSaveWithoutEquipment()
    save.hero.activeSkills = [{ skillId: 'healing_bloom', level: 1, xp: 0 }]
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    useGameStore.getState().loadGame()
    const count = useGameStore.getState().hero.activeSkills.filter(s => s.skillId === 'healing_bloom').length
    expect(count).toBe(1)
  })

  it("save sans inventory du tout ne crash pas", () => {
    const save = oldSaveWithoutEquipment()
    delete save.hero.inventory
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    expect(() => useGameStore.getState().loadGame()).not.toThrow()
    const inv = useGameStore.getState().hero.inventory
    expect(inv).toBeDefined()
    expect(Array.isArray(inv.equipment)).toBe(true)
    expect(Array.isArray(inv.manaStones)).toBe(true)
  })

  it("save sans titles/battleLog/combatEntryLog ne crash pas", () => {
    const save = oldSaveWithoutEquipment()
    delete save.hero.titles
    delete save.hero.battleLog
    delete save.hero.combatEntryLog
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    useGameStore.getState().loadGame()
    expect(Array.isArray(useGameStore.getState().hero.titles)).toBe(true)
    expect(Array.isArray(useGameStore.getState().hero.battleLog)).toBe(true)
    expect(Array.isArray(useGameStore.getState().hero.combatEntryLog)).toBe(true)
  })
})

// ── UX05 — Badge "nouveau loot" ──────────────────────────────────────────────
describe('UX05 — unseenLoot flag', () => {
  beforeEach(() => useGameStore.getState().resetGame())

  it("flag par défaut à false", () => {
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })

  it("addResource lève le flag", () => {
    useGameStore.getState().addResource('wolf_pelt', 1)
    expect(useGameStore.getState().unseenLoot).toBe(true)
  })

  it("addEquipmentToInventory lève le flag", () => {
    useGameStore.getState().addEquipmentToInventory({
      instanceId: 'x', name: 'X', slot: 'weapon', rarity: 'common', stats: {}, sellPrice: 1,
    })
    expect(useGameStore.getState().unseenLoot).toBe(true)
  })

  it("addSkillToInventory lève le flag", () => {
    useGameStore.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })
    expect(useGameStore.getState().unseenLoot).toBe(true)
  })

  it("addGold NE lève PAS le flag (gold visible ailleurs)", () => {
    useGameStore.getState().addGold(50)
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })

  it("addConsumable NE lève PAS le flag (achat ≠ loot)", () => {
    useGameStore.getState().addConsumable('hp_potion_small', 1)
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })

  it("markLootAsSeen reset à false", () => {
    useGameStore.getState().addResource('wolf_pelt', 1)
    useGameStore.getState().markLootAsSeen()
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })

  it("resetGame reset le flag", () => {
    useGameStore.getState().addResource('wolf_pelt', 1)
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().unseenLoot).toBe(false)
  })
})

// ── TECH02 — Save schema versioning ──────────────────────────────────────────
describe('TECH02 — saveGame écrit avec saveVersion', () => {
  it("saveGame écrit un saveVersion dans le JSON localStorage", () => {
    useGameStore.getState().resetGame()
    useGameStore.getState().saveGame()
    const raw = localStorage.getItem('roguelite_save')
    const parsed = JSON.parse(raw)
    expect(parsed.saveVersion).toBe(2)
  })

  it("saveVersion est exporté comme constante (cohérence)", async () => {
    const mod = await import('./gameStore')
    expect(mod.SAVE_VERSION).toBe(2)
  })

  it("loadGame d'une save SANS saveVersion (legacy v1) la migre vers v2", () => {
    const legacySave = {
      hero: useGameStore.getState().hero,
      world: useGameStore.getState().world,
      meta: useGameStore.getState().meta,
      // pas de saveVersion → traité comme v1
    }
    localStorage.setItem('roguelite_save', JSON.stringify(legacySave))
    expect(useGameStore.getState().loadGame()).toBe(true)
    // La save v1 doit être restaurée intégralement (rien ne crash)
    expect(useGameStore.getState().hero).toBeDefined()
    expect(useGameStore.getState().world).toBeDefined()
  })

  it("loadGame d'une save avec saveVersion: 1 applique la migration", () => {
    const save = {
      hero: { name: 'Old', stats: {}, level: 1 },  // hero minimal
      world: { dayCount: 3 },
      meta: {},
      saveVersion: 1,
    }
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    useGameStore.getState().loadGame()
    // Tous les champs INITIAL_* doivent être présents
    expect(useGameStore.getState().hero.activeSkills).toEqual([])
    expect(useGameStore.getState().hero.passiveSkills).toEqual([])
    expect(useGameStore.getState().hero.inventory).toBeDefined()
    expect(useGameStore.getState().hero.equipped).toEqual({ weapon: null, helmet: null, armor: null, boots: null })
    expect(useGameStore.getState().world.dayCount).toBe(3) // valeur préservée
  })

  it("runMigrations exporté est testable directement", async () => {
    const { runMigrations } = await import('./gameStore')
    const result = runMigrations({ hero: {}, world: {}, meta: {} })
    expect(result.saveVersion).toBe(2)
    expect(result.hero.activeSkills).toEqual([])
    expect(result.world.activeQuests).toEqual([])
  })
})

// ── X02 — Battery anti-régression sur les vieilles saves ────────────────────
describe('X02 — Battery migration anti-régression', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  // Pattern factorisé : crée une save legacy avec un champ retiré, vérifie défaut appliqué
  const buildSaveMissing = (path, value = undefined) => {
    const save = {
      hero: JSON.parse(JSON.stringify(useGameStore.getState().hero)),
      world: JSON.parse(JSON.stringify(useGameStore.getState().world)),
      meta: JSON.parse(JSON.stringify(useGameStore.getState().meta)),
    }
    const parts = path.split('.')
    let target = save
    for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]]
    if (value === undefined) delete target[parts[parts.length - 1]]
    else target[parts[parts.length - 1]] = value
    return save
  }

  const expectArray = (path) => {
    const parts = path.split('.')
    let target = useGameStore.getState()
    for (const p of parts) target = target[p]
    expect(Array.isArray(target)).toBe(true)
  }

  const expectObject = (path) => {
    const parts = path.split('.')
    let target = useGameStore.getState()
    for (const p of parts) target = target[p]
    expect(target).toBeDefined()
    expect(typeof target).toBe('object')
    expect(target).not.toBeNull()
  }

  it("hero.inventory.equipment absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.inventory.equipment')))
    useGameStore.getState().loadGame()
    expectArray('hero.inventory.equipment')
  })

  it("hero.inventory.manaStones absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.inventory.manaStones')))
    useGameStore.getState().loadGame()
    expectArray('hero.inventory.manaStones')
  })

  it("hero.inventory.consumables absent → objet vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.inventory.consumables')))
    useGameStore.getState().loadGame()
    expectObject('hero.inventory.consumables')
  })

  it("hero.inventory.resources absent → objet vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.inventory.resources')))
    useGameStore.getState().loadGame()
    expectObject('hero.inventory.resources')
  })

  it("hero.equipped absent → 4 slots null", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.equipped')))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().hero.equipped).toEqual({
      weapon: null, helmet: null, armor: null, boots: null,
    })
  })

  it("hero.activeSkills absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.activeSkills')))
    useGameStore.getState().loadGame()
    expectArray('hero.activeSkills')
  })

  it("hero.passiveSkills absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.passiveSkills')))
    useGameStore.getState().loadGame()
    expectArray('hero.passiveSkills')
  })

  it("hero.battleLog absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.battleLog')))
    useGameStore.getState().loadGame()
    expectArray('hero.battleLog')
  })

  it("hero.combatEntryLog absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.combatEntryLog')))
    useGameStore.getState().loadGame()
    expectArray('hero.combatEntryLog')
  })

  it("hero.titles absent → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('hero.titles')))
    useGameStore.getState().loadGame()
    expectArray('hero.titles')
  })

  it("world.completedQuests = 0 (number, ancien format) → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('world.completedQuests', 0)))
    useGameStore.getState().loadGame()
    expectArray('world.completedQuests')
  })

  it("world.activeQuests = 0 (number, ancien format) → tableau vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('world.activeQuests', 0)))
    useGameStore.getState().loadGame()
    expectArray('world.activeQuests')
  })

  it("world.dungeons absent → restauré depuis INITIAL_WORLD", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('world.dungeons')))
    useGameStore.getState().loadGame()
    const dungeons = useGameStore.getState().world.dungeons
    expect(dungeons).toBeDefined()
    expect(dungeons.ashenvale).toBeDefined()
    expect(dungeons.grimspire).toBeDefined()
  })

  it("world.monsterKillCounts absent → objet vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('world.monsterKillCounts')))
    useGameStore.getState().loadGame()
    expectObject('world.monsterKillCounts')
  })

  it("meta.divineBonds absent → objet vide", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('meta.divineBonds')))
    useGameStore.getState().loadGame()
    expectObject('meta.divineBonds')
  })

  it("meta.lastRunSummary null préservé (state légitime)", () => {
    localStorage.setItem('roguelite_save', JSON.stringify(buildSaveMissing('meta.lastRunSummary', null)))
    useGameStore.getState().loadGame()
    expect(useGameStore.getState().meta.lastRunSummary).toBeNull()
  })

  it("hero entier absent → reste sur INITIAL_HERO", () => {
    const save = { world: useGameStore.getState().world, meta: useGameStore.getState().meta }
    localStorage.setItem('roguelite_save', JSON.stringify(save))
    expect(() => useGameStore.getState().loadGame()).not.toThrow()
    expect(useGameStore.getState().hero).toBeDefined()
    expect(useGameStore.getState().hero.activeSkills).toEqual([])
  })

  it("save vide ({}) ne crash pas", () => {
    localStorage.setItem('roguelite_save', JSON.stringify({}))
    expect(() => useGameStore.getState().loadGame()).not.toThrow()
  })
})

// ── TECH03 — localStorage quota warning ──────────────────────────────────────
describe('TECH03 — localStorage quota warning', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it("saveQuotaExceeded est false par défaut", () => {
    expect(useGameStore.getState().saveQuotaExceeded).toBe(false)
  })

  it("saveGame qui throw QuotaExceededError → flag passe à true", () => {
    const original = localStorage.setItem
    const err = new Error('quota exceeded')
    err.name = 'QuotaExceededError'
    localStorage.setItem = () => { throw err }
    // Silence console.error pour ce test
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    useGameStore.getState().saveGame()

    expect(useGameStore.getState().saveQuotaExceeded).toBe(true)
    expect(errSpy).toHaveBeenCalled()

    // restore
    localStorage.setItem = original
    errSpy.mockRestore()
  })

  it("saveGame réussi reset le flag à false si précédemment true", () => {
    // Setup: flag à true
    useGameStore.setState({ saveQuotaExceeded: true })
    // Now succeed
    useGameStore.getState().saveGame()
    expect(useGameStore.getState().saveQuotaExceeded).toBe(false)
  })

  it("resetGame remet saveQuotaExceeded à false", () => {
    useGameStore.setState({ saveQuotaExceeded: true })
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().saveQuotaExceeded).toBe(false)
  })
})
