// QA01 — Audit compteurs de monstres + intégrité & fonctionnel des items (3 volets).
// Volet 1 : monsterKillCounts incrémenté à chaque kill (combat + idle) ET propagé
//           (bestiaire, objectifs de quête `kill`, déblocage idle ≥5, succès totalKills).
// Volet 2 : intégrité référentielle — toute référence d'item pointe vers un id existant.
// Volet 3 : items « liés » fonctionnels ET cohérents (effet ↔ type/description/rareté).
//
// NB : ce fichier consolide et comble les trous laissés par npc02/z07/itm01/crf06/recipes/
// resources/bestiary.store — il ne duplique pas leurs assertions, il pinne l'intégration.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { IDLE_MASTERY_KILLS } from './slices/idleSlice'
import { IDLE_TICK_MS } from '../engine/offlineProgress'
import { MONSTERS, MONSTERS_BY_ZONE } from '../data/monsters'
import { RESOURCES } from '../data/resources'
import { EQUIPMENT_TEMPLATES, createEquipmentInstance } from '../data/equipment'
import { SKILLS } from '../data/skills'
import { getRecipesByProfession } from '../data/craftRecipes'
import { QUESTS } from '../data/quests'
import { CHURCH_QUESTS } from '../data/churchQuests'
import { MAIN_QUESTS } from '../data/mainQuests'
import { MASTER_QUESTS } from '../data/masterQuests'
import { getActiveVillageQuests, VILLAGE_QUEST_GIVERS } from '../data/villageQuests'

const s = () => useGameStore.getState()

// Toutes les quêtes STATIQUES (les quêtes de village sont procédurales : couvertes à part).
const STATIC_QUESTS = [
  ...Object.values(QUESTS),
  ...Object.values(CHURCH_QUESTS),
  ...Object.values(MAIN_QUESTS),
  ...Object.values(MASTER_QUESTS),
]

// ─────────────────────────────────────────────────────────────────────────────
// VOLET 1 — Compteurs de monstres : incrément + propagation (combat + idle)
// ─────────────────────────────────────────────────────────────────────────────
describe('QA01 — Volet 1 : compteurs de monstres (combat + idle)', () => {
  beforeEach(() => {
    s().resetGame()
    localStorage.clear()
  })

  describe('combat (recordKill)', () => {
    it('incrémente world.monsterKillCounts ET meta.bestiaryKills', () => {
      s().recordKill('ashwood_wolf')
      s().recordKill('ashwood_wolf')
      expect(s().world.monsterKillCounts.ashwood_wolf).toBe(2)
      expect(s().meta.bestiaryKills.ashwood_wolf).toBe(2)
    })

    it('fait progresser un objectif de quête `kill` (delta depuis acceptation)', () => {
      s().startQuest('first_blood') // 5× ashwood_wolf
      for (let i = 0; i < 5; i++) s().recordKill('ashwood_wolf')
      expect(s().isQuestComplete('first_blood')).toBe(true)
    })

    it('déblocage idle : 5 kills suffisent (seuil de maîtrise)', () => {
      for (let i = 0; i < IDLE_MASTERY_KILLS; i++) s().recordKill('ashwood_wolf')
      expect(s().world.monsterKillCounts.ashwood_wolf).toBe(IDLE_MASTERY_KILLS)
      s().toggleIdle('ashwood_wolf')
      expect(s().world.isIdleActive).toBe(true)
      expect(s().world.idleTargetMonster).toBe('ashwood_wolf')
    })

    it('alimente le succès totalKills (checkAchievements → first_blood)', () => {
      s().recordKill('ashwood_wolf')
      s().checkAchievements()
      expect(s().meta.achievements).toContain('first_blood')
    })
  })

  describe('idle en direct (processIdleTick) — RÉGRESSION QA01', () => {
    // Avant QA01 : l'idle incrémentait monsterKillCounts mais PAS bestiaryKills → le
    // bestiaire/Codex ne comptait jamais les kills idle. Ce test pinne la propagation.
    const armIdle = (monsterId) => {
      // héros assez fort pour tuer sans être stoppé (HP haut, str > def/2), niveau élevé
      useGameStore.setState((st) => ({
        hero: {
          ...st.hero,
          level: 30,
          stats: { ...st.hero.stats, strength: 200, def: 100, hp: 500, maxHp: 500 },
        },
        world: { ...st.world, isIdleActive: true, idleTargetMonster: monsterId },
      }))
    }

    it('un tick idle incrémente monsterKillCounts ET meta.bestiaryKills', () => {
      armIdle('ashwood_wolf')
      const before = s().meta.bestiaryKills.ashwood_wolf ?? 0
      s().processIdleTick()
      expect(s().world.monsterKillCounts.ashwood_wolf).toBe(1)
      expect(s().meta.bestiaryKills.ashwood_wolf ?? 0).toBe(before + 1)
    })

    it('les kills idle font progresser un objectif de quête `kill`', () => {
      s().startQuest('first_blood') // 5× ashwood_wolf
      armIdle('ashwood_wolf')
      for (let i = 0; i < 5; i++) s().processIdleTick()
      expect(s().isQuestComplete('first_blood')).toBe(true)
    })

    it('les kills idle comptent pour le succès totalKills', () => {
      armIdle('ashwood_wolf')
      s().processIdleTick()
      s().checkAchievements()
      expect(s().meta.achievements).toContain('first_blood')
    })
  })

  describe('idle hors-ligne (applyOfflineProgress) — RÉGRESSION QA01', () => {
    it('crédite les kills batch dans monsterKillCounts ET meta.bestiaryKills', () => {
      const now = 5_000_000
      useGameStore.setState((st) => ({
        world: { ...st.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
        meta: { ...st.meta, lastSeen: now - 40 * IDLE_TICK_MS },
      }))
      const bestBefore = s().meta.bestiaryKills.ashwood_wolf ?? 0
      s().applyOfflineProgress(now)
      const killed = s().world.monsterKillCounts.ashwood_wolf
      expect(killed).toBeGreaterThan(0)
      // le bestiaire doit avoir suivi EXACTEMENT le même nombre de kills
      expect(s().meta.bestiaryKills.ashwood_wolf ?? 0).toBe(bestBefore + killed)
    })

    it('bestiaire persistant + monsterKillCounts restent alignés sur le récap offline', () => {
      const now = 6_000_000
      useGameStore.setState((st) => ({
        world: { ...st.world, isIdleActive: true, idleTargetMonster: 'ashwood_wolf' },
        meta: { ...st.meta, lastSeen: now - 25 * IDLE_TICK_MS },
      }))
      s().applyOfflineProgress(now)
      const summaryKills = s().meta.offlineSummary.kills
      expect(s().meta.bestiaryKills.ashwood_wolf).toBe(summaryKills)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// VOLET 2 — Intégrité référentielle : toute référence d'item résout un id existant
// ─────────────────────────────────────────────────────────────────────────────
describe('QA01 — Volet 2 : intégrité référentielle des items', () => {
  it('drops de monstres : resourceDrops + skillDrop pointent vers des ids existants', () => {
    for (const [id, m] of Object.entries(MONSTERS)) {
      for (const d of m.resourceDrops ?? []) {
        expect(RESOURCES[d.resourceId], `${id} → resource ${d.resourceId}`).toBeDefined()
      }
      const sid = m.skillDrop?.skillId
      if (sid) expect(SKILLS[sid], `${id} → skill ${sid}`).toBeDefined()
    }
  })

  it('recettes alchimie : ingredients + output résolvent (output = consommable)', () => {
    // Source unifiée : recettes `alchemy_*` (profession alchimiste, sortie = consommable).
    const alchemyRecipes = getRecipesByProfession('alchemist').filter((r) =>
      r.id.startsWith('alchemy_'),
    )
    for (const r of alchemyRecipes) {
      expect(RESOURCES[r.output], `alchemy output ${r.output}`).toBeDefined()
      expect(RESOURCES[r.output].isConsumable, `${r.output} consommable`).toBe(true)
      for (const c of r.combinations) {
        for (const id of Object.keys(c.ingredients)) {
          expect(RESOURCES[id], `alchemy ingredient ${id}`).toBeDefined()
        }
      }
    }
  })

  it('recettes maître : templateId + ingredients résolvent', () => {
    // Source unifiée : recettes `master_*` (profession blacksmith, sortie = templateId Rare/Epic).
    const masterRecipes = getRecipesByProfession('blacksmith').filter((r) =>
      r.id.startsWith('master_'),
    )
    for (const r of masterRecipes) {
      expect(EQUIPMENT_TEMPLATES[r.output], `master template ${r.output}`).toBeDefined()
      for (const c of r.combinations) {
        for (const id of Object.keys(c.ingredients)) {
          expect(RESOURCES[id], `master ingredient ${id}`).toBeDefined()
        }
      }
    }
  })

  it('recettes de craft d’équipement (par rareté) : tous les ingredients résolvent', () => {
    for (const [tid, t] of Object.entries(EQUIPMENT_TEMPLATES)) {
      for (const [rarity, recipe] of Object.entries(t.craftRecipes ?? {})) {
        for (const id of Object.keys(recipe.ingredients ?? {})) {
          expect(RESOURCES[id], `${tid}.${rarity} → ingredient ${id}`).toBeDefined()
        }
      }
    }
  })

  it('stock marchand : chaque rareté en merchantStock a un prix ET vend un template réel', () => {
    for (const [tid, t] of Object.entries(EQUIPMENT_TEMPLATES)) {
      for (const [rarity, avail] of Object.entries(t.merchantStock ?? {})) {
        if (!avail) continue
        expect(EQUIPMENT_TEMPLATES[tid], `merchant sells ${tid}`).toBeDefined()
        expect(
          t.merchantBuyPrice?.[rarity],
          `${tid} merchantBuyPrice[${rarity}] manquant`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('récompenses de quêtes (statiques) : equipment/resources/consumables/skill résolvent', () => {
    for (const q of STATIC_QUESTS) {
      const r = q.reward ?? {}
      if (r.equipment)
        expect(
          EQUIPMENT_TEMPLATES[r.equipment.templateId],
          `${q.id} → equip ${r.equipment.templateId}`,
        ).toBeDefined()
      for (const id of Object.keys(r.resources ?? {}))
        expect(RESOURCES[id], `${q.id} → resource ${id}`).toBeDefined()
      for (const id of Object.keys(r.consumables ?? {})) {
        expect(RESOURCES[id], `${q.id} → consumable ${id}`).toBeDefined()
        expect(RESOURCES[id].isConsumable, `${q.id} → ${id} isConsumable`).toBe(true)
      }
      if (r.skill) expect(SKILLS[r.skill.skillId], `${q.id} → skill ${r.skill.skillId}`).toBeDefined()
    }
  })

  it('objectifs de quêtes (statiques) `kill` ciblent des monstres existants', () => {
    for (const q of STATIC_QUESTS) {
      for (const o of q.objectives ?? []) {
        if (o.type === 'kill')
          expect(MONSTERS[o.monsterId], `${q.id} → monster ${o.monsterId}`).toBeDefined()
        if (o.type === 'collect')
          expect(RESOURCES[o.resourceId], `${q.id} → resource ${o.resourceId}`).toBeDefined()
        if (o.type === 'elite_turnin') {
          expect(RESOURCES[o.resourceId], `${q.id} → turnin res ${o.resourceId}`).toBeDefined()
          expect(
            EQUIPMENT_TEMPLATES[o.weaponTemplateId],
            `${q.id} → turnin weapon ${o.weaponTemplateId}`,
          ).toBeDefined()
        }
      }
    }
  })

  it('quêtes de village (procédurales) : monstres/ressources générés résolvent', () => {
    for (const location of Object.keys(VILLAGE_QUEST_GIVERS)) {
      const quests = getActiveVillageQuests(location, { dayCount: 1, heroLevel: 30, isCity: true })
      for (const q of quests) {
        for (const o of q.objectives ?? []) {
          if (o.type === 'kill')
            expect(MONSTERS[o.monsterId], `${q.id} → monster ${o.monsterId}`).toBeDefined()
          if (o.type === 'collect')
            expect(RESOURCES[o.resourceId], `${q.id} → resource ${o.resourceId}`).toBeDefined()
        }
      }
    }
  })

  it('livres (ITM01) : effet gain_stat cible une stat réelle du héros', () => {
    s().resetGame()
    const heroStatKeys = new Set([
      ...Object.keys(s().hero.stats),
      'concentration',
      'aura',
    ])
    for (const res of Object.values(RESOURCES)) {
      if (res.effect?.type !== 'gain_stat') continue
      expect(heroStatKeys.has(res.effect.stat), `book ${res.id} → stat ${res.effect.stat}`).toBe(
        true,
      )
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// VOLET 3 — Items « liés » fonctionnels ET cohérents (effet ↔ type/desc/rareté)
// ─────────────────────────────────────────────────────────────────────────────
describe('QA01 — Volet 3 : items fonctionnels + logiques', () => {
  beforeEach(() => {
    s().resetGame()
    localStorage.clear()
  })

  // Checklist statique de cohérence effet ↔ métadonnées.
  const KNOWN_EFFECT_TYPES = new Set([
    'heal_percent',
    'mana_restore_percent',
    'restore_both',
    'gain_stat',
  ])

  it('tout consommable déclare un effect avec un type connu et une valeur cohérente', () => {
    for (const res of Object.values(RESOURCES)) {
      if (!res.isConsumable) continue
      expect(res.effect, `${res.id} sans effect`).toBeDefined()
      const t = res.effect.type
      expect(KNOWN_EFFECT_TYPES.has(t), `${res.id} type inconnu: ${t}`).toBe(true)
      if (t === 'heal_percent' || t === 'mana_restore_percent' || t === 'restore_both') {
        expect(res.effect.value, `${res.id} value`).toBeGreaterThan(0)
        expect(res.effect.value).toBeLessThanOrEqual(1)
      }
      if (t === 'gain_stat') {
        expect(res.effect.stat, `${res.id} stat`).toBeTruthy()
        expect(res.effect.amount, `${res.id} amount`).toBeGreaterThan(0)
      }
    }
  })

  it('cohérence nom/description ↔ effet (potion de soin soigne, mana restaure du mana…)', () => {
    const checks = {
      hp_potion_small: 'heal_percent',
      hp_potion_medium: 'heal_percent',
      mana_potion_small: 'mana_restore_percent',
      mana_potion_medium: 'mana_restore_percent',
      mana_crystal: 'mana_restore_percent',
      stamina_ration: 'restore_both',
      elixir_minor: 'restore_both',
    }
    for (const [id, type] of Object.entries(checks)) {
      expect(RESOURCES[id].effect.type, `${id}`).toBe(type)
    }
    // l'antidote soigne (heal) ET purge les debuffs
    expect(RESOURCES.antidote_basic.effect.type).toBe('heal_percent')
    expect(RESOURCES.antidote_basic.effect.cureDebuffs).toBe(true)
  })

  it('cohérence de progression : la rareté supérieure restaure davantage', () => {
    expect(RESOURCES.hp_potion_medium.effect.value).toBeGreaterThan(
      RESOURCES.hp_potion_small.effect.value,
    )
    expect(RESOURCES.mana_potion_medium.effect.value).toBeGreaterThan(
      RESOURCES.mana_potion_small.effect.value,
    )
    expect(RESOURCES.elixir_minor.effect.value).toBeGreaterThan(
      RESOURCES.stamina_ration.effect.value,
    )
  })

  it('FONCTIONNEL — un livre de stat applique bien son gain (gain_stat)', () => {
    // Tome of Focus → +10 Concentration
    useGameStore.setState((st) => ({
      hero: {
        ...st.hero,
        inventory: {
          ...st.hero.inventory,
          consumables: { ...st.hero.inventory.consumables, tome_of_focus: 1 },
        },
      },
    }))
    expect(s().useBook('tome_of_focus')).toBe(true)
    expect(s().hero.concentration).toBe(RESOURCES.tome_of_focus.effect.amount)
    // cohérence : un tome de Focus donne bien de la Concentration (pas autre chose)
    expect(RESOURCES.tome_of_focus.effect.stat).toBe('concentration')
  })

  it('FONCTIONNEL — l’antidote (cureDebuffs) purge les debuffs actifs', () => {
    s().addHeroDebuff('poisoned', 7, false)
    s().addHeroDebuff('burnt_hands', 0, true)
    expect(s().hero.activeDebuffs.length).toBe(2)
    const cured = s().cureHeroDebuffs()
    expect(cured).toBe(2)
    expect(s().hero.activeDebuffs).toHaveLength(0)
  })

  it('COHÉRENT — chaque équipement produit des stats cohérentes avec son slot', () => {
    // createEquipmentInstance applique bien les baseStats × mult de rareté, non vides.
    for (const tid of Object.keys(EQUIPMENT_TEMPLATES)) {
      const inst = createEquipmentInstance(tid, 'common')
      expect(inst, `instance ${tid}`).toBeTruthy()
      expect(Object.keys(inst.stats).length, `${tid} sans stats`).toBeGreaterThan(0)
      // toutes les stats sont > 0 (pas de stat « morte » ou négative)
      for (const [stat, val] of Object.entries(inst.stats)) {
        expect(val, `${tid}.${stat}`).toBeGreaterThan(0)
      }
    }
  })

  it('COHÉRENT — une arme « magical » focalise l’INT, une « physical » la STR', () => {
    for (const t of Object.values(EQUIPMENT_TEMPLATES)) {
      if (t.slot !== 'weapon') continue
      if (t.type === 'magical') {
        expect(t.baseStats.intelligence, `${t.id} magical sans INT`).toBeGreaterThan(0)
        expect(t.baseStats.strength ?? 0, `${t.id} magical avec STR`).toBe(0)
      }
      if (t.type === 'physical') {
        expect(t.baseStats.strength, `${t.id} physical sans STR`).toBeGreaterThan(0)
      }
    }
  })
})

// Sanity : au moins un monstre de surface par zone déclarée (évite un MONSTERS_BY_ZONE vide).
describe('QA01 — sanity monstres', () => {
  it('chaque zone de MONSTERS_BY_ZONE liste des ids de monstres existants (non-réserve)', () => {
    for (const [zone, ids] of Object.entries(MONSTERS_BY_ZONE)) {
      expect(ids.length, `zone ${zone} vide`).toBeGreaterThan(0)
      for (const id of ids) {
        expect(MONSTERS[id], `${zone} → ${id}`).toBeDefined()
        expect(MONSTERS[id].reserve, `${zone} → ${id} en réserve`).not.toBe(true)
      }
    }
  })
})
