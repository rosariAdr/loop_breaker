import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { MAIN_QUEST_ORDER } from '../data/mainQuests'
import { EDGES } from '../data/worldGraph'
import { MAIN_QUESTS } from '../data/mainQuests'
import { SIDE_QUESTS } from '../data/sideQuestChains'
import { nextCampaignQuest, campaignGate } from '../data/campaignProgression'
import { normalizeSave, runMigrations } from './migrations'
import { isNodeUnlocked, isZoneUnlocked } from '../data/zones'
import { createEquipmentInstance } from '../data/equipment'

const s = () => useGameStore.getState()
beforeEach(() => s().resetGame())
const world = (patch) => useGameStore.setState((st) => ({ world: { ...st.world, ...patch } }))
const resources = (patch) =>
  useGameStore.setState((st) => ({
    hero: {
      ...st.hero,
      inventory: { ...st.hero.inventory, resources: { ...st.hero.inventory.resources, ...patch } },
    },
  }))
const prerequisites = (id) =>
  world({ completedQuests: MAIN_QUEST_ORDER.slice(0, MAIN_QUEST_ORDER.indexOf(id)) })
function win(monsterId) {
  s().startCombat([{ monsterId, id: monsterId }])
  s().recordKill(monsterId)
  s().recordManualBattle('victory')
  s().endCombat('victory')
}

describe('campaign regression', () => {
  it('connects Millhaven to the hills before Ironhaven opens', () => {
    expect(EDGES).toContainEqual(['millhaven', 'wildmere_hills'])
  })
  it('finishes the main story with Malachar', () => {
    expect(MAIN_QUEST_ORDER).toHaveLength(11)
    expect(MAIN_QUEST_ORDER.at(-1)).toBe('mq11_last_obstacle')
  })
  it('refuses a locked or incomplete main quest', () => {
    s().startQuest('mq04_ironhaven_gates')
    expect(s().world.activeQuests).not.toContain('mq04_ironhaven_gates')
    s().startQuest('mq01_waking')
    s().completeQuest('mq01_waking')
    expect(s().world.completedQuests).not.toContain('mq01_waking')
  })
  it('starts with automatic combat locked', () => {
    expect(s().world.idleUnlocked).toBe(false)
  })
})

describe('complete campaign', () => {
  it('every geographic objective is reachable before its own reward', () => {
    const open = new Set(['greywatch', 'ashenvale_forest'])
    for (const id of MAIN_QUEST_ORDER) {
      const q = MAIN_QUESTS[id]
      for (const n of q.acceptUnlocks?.spots ?? []) open.add(n)
      const reachable = new Set(['greywatch'])
      let changed = true
      while (changed) {
        changed = false
        for (const [a, b] of EDGES) {
          if (!open.has(a) || !open.has(b)) continue
          for (const [from, to] of [
            [a, b],
            [b, a],
          ])
            if (reachable.has(from) && !reachable.has(to)) {
              reachable.add(to)
              changed = true
            }
        }
      }
      expect(reachable.has(q.issuedBy), id).toBe(true)
      if (id === 'mq04_ironhaven_gates') expect(reachable.has('wildmere_hills')).toBe(true)
      for (const o of q.objectives)
        if (o.type === 'visit') expect(reachable.has(o.spotId), id).toBe(true)
      for (const n of [...(q.unlocks.spots ?? []), ...(q.unlocks.locations ?? [])]) open.add(n)
    }
  })
  it('runs all eleven quests with no rare drops, side stories, deity or master', () => {
    for (const id of MAIN_QUEST_ORDER) {
      const q = MAIN_QUESTS[id]
      world({ currentLocation: q.issuedBy })
      s().setScreen('quest_board')
      s().startQuest(id)
      expect(s().world.activeQuests, id).toContain(id)
      if (id === 'mq06_beyond_marsh') {
        world({ currentHuntingSpot: 'crumbled_ruins' })
        expect(s().startSentinelTrial()).toBe(true)
        win('graven_sentinel')
        win('graven_sentinel')
      }
      for (const o of q.objectives) {
        if (o.type === 'kill') for (let n = 0; n < o.count; n++) s().recordKill(o.monsterId)
        if (o.type === 'visit') s().recordVisit(o.spotId)
        if (o.eventId === 'patrol_report') s().interactCampaign(o.eventId)
        if (o.eventId === 'crypt_cleared') win('hollow_crypt_boss')
        if (o.eventId === 'citadel_cleared') win('forsaken_citadel_boss')
        if (o.eventId === 'malachar_defeated') win('malachar')
        if (o.eventId === 'road_crossed')
          world({ campaignEvents: [...s().world.campaignEvents, 'road_crossed'] })
      }
      expect(s().isQuestComplete(id), id).toBe(true)
      s().completeQuest(id)
      expect(s().world.completedQuests, id).toContain(id)
    }
    expect(nextCampaignQuest(s().world)).toBeNull()
    expect(s().world.idleUnlocked).toBe(true)
    expect(s().hero.deity).toBeNull()
    expect(s().hero.masterId).toBeNull()
    expect(s().hero.inventory.resources.sentinel_orb).toBe(0)
  })
  it('rejects premature access, rumors and boss starts', () => {
    expect(isZoneUnlocked('grimspire', s())).toBe(false)
    s().unlockZone('grimspire', 'info')
    expect(s().world.unlockedZones).not.toContain('grimspire')
    expect(s().startCombat([{ monsterId: 'malachar' }])).toBe(false)
    expect(campaignGate('crypt', s().world)).toBe(false)
  })
  it('opens reconnaissance locations on acceptance, not after an impossible visit', () => {
    prerequisites('mq03_new_horizons')
    s().startQuest('mq03_new_horizons')
    expect(isNodeUnlocked('crumbled_ruins', s().world)).toBe(true)
    expect(s().isQuestComplete('mq03_new_horizons')).toBe(false)
  })
  it('requires the wraith victory after the serpent patrol', () => {
    prerequisites('mq07_marsh_circuit')
    s().startQuest('mq07_marsh_circuit')
    s().recordVisit('thornmarsh')
    s().recordKill('briar_wraith')
    for (let n = 0; n < 3; n++) s().recordKill('marsh_serpent')
    expect(s().isQuestComplete('mq07_marsh_circuit')).toBe(false)
    s().recordKill('briar_wraith')
    expect(s().isQuestComplete('mq07_marsh_circuit')).toBe(true)
  })
})

describe('trial and optional stories', () => {
  beforeEach(() => {
    prerequisites('mq06_beyond_marsh')
    world({ activeQuests: ['mq06_beyond_marsh'], currentHuntingSpot: 'crumbled_ruins' })
  })
  it('requires activation, preserves rest/save, and never rewards the same battle twice', () => {
    win('graven_sentinel')
    expect(s().hero.inventory.resources.sentinel_orb ?? 0).toBe(0)
    s().startSentinelTrial()
    win('graven_sentinel')
    s().sleep()
    const saved = normalizeSave({ hero: s().hero, world: s().world, meta: s().meta })
    useGameStore.setState(saved)
    expect(s().world.sentinelTrial.wins).toBe(1)
    s().startCombat([{ monsterId: 'graven_sentinel' }, { monsterId: 'graven_sentinel' }])
    s().recordManualBattle('victory')
    s().recordManualBattle('victory')
    s().endCombat('victory')
    expect(s().hero.inventory.resources.sentinel_orb).toBe(1)
    expect(s().world.sentinelTrial.completed).toBe(1)
  })
  it('idle propagation cannot create trial wins or orbs', () => {
    s().startSentinelTrial()
    s().propagateKills('graven_sentinel', 20)
    expect(s().world.sentinelTrial.wins).toBe(0)
    expect(s().hero.inventory.resources.sentinel_orb ?? 0).toBe(0)
  })
  it('reserves the campaign orb and caps optional weapon improvements', () => {
    resources({ sentinel_orb: 5 })
    useGameStore.setState((st) => ({
      hero: {
        ...st.hero,
        inventory: {
          ...st.hero.inventory,
          equipment: [createEquipmentInstance('graven_edge', 'rare')],
        },
      },
    }))
    expect(s().upgradeSentinelWeapon()).toBe(false)
    s().completeQuest('mq06_beyond_marsh')
    expect(s().hero.inventory.resources.sentinel_orb).toBe(4)
    expect(s().upgradeSentinelWeapon()).toBe(true)
    expect(s().upgradeSentinelWeapon()).toBe(true)
    expect(s().upgradeSentinelWeapon()).toBe(false)
    expect(s().hero.inventory.resources.sentinel_orb).toBe(1)
  })
  it('registers three independent optional chains, each with three steps', () => {
    expect(new Set(Object.values(SIDE_QUESTS).map((q) => q.chain)).size).toBe(3)
    expect(Object.keys(SIDE_QUESTS)).toHaveLength(9)
    s().startQuest('sq_guardian_3')
    expect(s().world.activeQuests).not.toContain('sq_guardian_3')
  })
  it('validates interactions in the correct place and choices without double charging', () => {
    s().startQuest('sq_convoy_1')
    world({ currentHuntingSpot: 'ashenvale_forest' })
    expect(s().interactCampaign('convoy_camp')).toBe(false)
    world({ currentHuntingSpot: 'crumbled_ruins', currentLocation: 'millhaven' })
    expect(s().interactCampaign('convoy_camp')).toBe(true)
    expect(s().interactCampaign('convoy_camp')).toBe(false)
    s().completeQuest('sq_convoy_1')
    s().startQuest('sq_convoy_2')
    s().setScreen('quest_board')
    s().addGold(100)
    const gold = s().hero.inventory.gold
    expect(s().chooseQuestOption('sq_convoy_2', 'supplies')).toBe(true)
    expect(s().chooseQuestOption('sq_convoy_2', 'supplies')).toBe(false)
    expect(s().hero.inventory.gold).toBe(gold - 60)
    s().completeQuest('sq_convoy_2')
    expect(s().world.completedQuests).toContain('sq_convoy_2')
  })
  it.each(['restore', 'dismantle'])(
    'finishes all three optional stories, including the %s ending',
    (fate) => {
      world({ activeQuests: [], completedQuests: MAIN_QUEST_ORDER.slice(0, 8) })
      for (const q of Object.values(SIDE_QUESTS)) {
        world({ currentLocation: q.issuedBy })
        s().setScreen('quest_board')
        s().startQuest(q.id)
        expect(s().world.activeQuests, q.id).toContain(q.id)
        if (q.id === 'sq_convoy_1') {
          world({ currentHuntingSpot: 'crumbled_ruins' })
          s().interactCampaign('convoy_camp')
        }
        if (q.id === 'sq_convoy_2') {
          for (let n = 0; n < 3; n++) s().recordKill('knoll_goblin')
          expect(s().chooseQuestOption(q.id, 'patrol')).toBe(true)
        }
        if (q.reportEvent) expect(s().interactCampaign(q.reportEvent)).toBe(true)
        for (const obj of q.objectives) {
          if (obj.type === 'mastery') for (let n = 0; n < 5; n++) s().recordKill(obj.monsters[0])
          if (obj.type === 'idle_kills') {
            world({
              idleUnlocked: true,
              isIdleActive: true,
              idleTargetMonster: 'ashwood_wolf',
              currentZone: 'ashenvale',
            })
            for (let n = 0; n < 3; n++) s().processIdleTick()
          }
        }
        if (q.id === 'sq_guardian_1') {
          world({ currentHuntingSpot: 'crumbled_ruins' })
          s().interactCampaign('boundary_west')
          s().interactCampaign('boundary_east')
        }
        if (q.id === 'sq_guardian_2') {
          s().startSentinelTrial()
          win('graven_sentinel')
          win('graven_sentinel')
        }
        if (q.choices && q.id === 'sq_guardian_3')
          expect(s().chooseQuestOption(q.id, fate)).toBe(true)
        expect(s().isQuestComplete(q.id), q.id).toBe(true)
        s().completeQuest(q.id)
        expect(s().world.completedQuests, q.id).toContain(q.id)
      }
      expect(s().meta.titlesEarned).toContain('seasoned_tracker')
      expect(s().world.campaignChoices.guardian_fate).toBe(fate)
      expect(s().hero.inventory.resources.sentinel_orb).toBe(0)
    },
  )
  it('cannot farm trial orbs through offline progress', () => {
    s().startSentinelTrial()
    world({ idleUnlocked: true, isIdleActive: true, idleTargetMonster: 'graven_sentinel' })
    useGameStore.setState((st) => ({
      hero: { ...st.hero, level: 30, stats: { ...st.hero.stats, strength: 100 } },
      meta: { ...st.meta, lastSeen: 1000 },
    }))
    s().applyOfflineProgress(61000)
    expect(s().world.monsterKillCounts.graven_sentinel).toBeGreaterThan(0)
    expect(s().world.sentinelTrial.wins).toBe(0)
    expect(s().hero.inventory.resources.sentinel_orb ?? 0).toBe(0)
  })
})

describe('old saves', () => {
  it('repairs an old Millhaven save and preserves existing mastery and MQ06 completion', () => {
    const oldWorld = {
      currentNode: 'millhaven',
      currentLocation: 'millhaven',
      currentZone: 'ashenvale',
      activeQuests: ['mq04_ironhaven_gates'],
      completedQuests: MAIN_QUEST_ORDER.slice(0, 3),
      monsterKillCounts: { ashwood_wolf: 5 },
      unlockedNodes: ['millhaven', 'crumbled_ruins', 'wildmere_hills'],
    }
    const save = runMigrations({ saveVersion: 3, hero: {}, world: oldWorld, meta: {} })
    expect(save.saveVersion).toBe(4)
    expect(save.world.currentNode).toBe('millhaven')
    expect(save.world.idleUnlocked).toBe(true)
    expect(save.world.sentinelTrial).toEqual({ active: false, wins: 0, completed: 0 })
    expect(normalizeSave(save)).toEqual(save)
    const done = runMigrations({
      saveVersion: 3,
      world: { ...oldWorld, completedQuests: ['mq06_beyond_marsh'] },
    })
    expect(done.world.unlockedNodes).toContain('thornmarsh')
  })
  it('preserves an advanced legacy route and does not trap the hero', () => {
    const save = runMigrations({
      saveVersion: 3,
      world: {
        currentZone: 'grimspire',
        currentNode: 'stonehaven',
        unlockedZones: ['ashenvale', 'grimspire'],
      },
    })
    expect(campaignGate('malachar', save.world)).toBe(true)
    expect(save.world.currentNode).toBe('ironhaven')
  })
  it('opens the new reconnaissance destinations for a mission already accepted in an old save', () => {
    const save = runMigrations({
      saveVersion: 3,
      world: {
        currentNode: 'millhaven',
        currentLocation: 'millhaven',
        activeQuests: ['mq03_new_horizons'],
        completedQuests: MAIN_QUEST_ORDER.slice(0, 2),
        unlockedNodes: ['millhaven'],
      },
    })
    expect(save.world.unlockedNodes).toContain('crumbled_ruins')
    expect(save.world.unlockedNodes).toContain('wildmere_hills')
  })
})
