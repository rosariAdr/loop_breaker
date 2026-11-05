// FIX-QUESTSNAP01 / FIX-QXP01 / FIX-QRANK01 — edge coverage for snapshotForQuest
// and the XP/rank reward helpers. Targets the COLLECT branch of snapshotForQuest
// (baseResources) plus the reward tier/repeat/default fallbacks.

import { describe, it, expect } from 'vitest'
import {
  snapshotForQuest,
  questXpReward,
  questRankPoints,
  defaultQuestXp,
  defaultQuestRankPoints,
  QUEST_XP_REPEAT_MULT,
} from './quests'

// ── snapshotForQuest ─────────────────────────────────────────────────────────
describe('snapshotForQuest — KILL objectives (baseKills)', () => {
  it('captures the current kill count for the targeted monster', () => {
    const quest = {
      id: 'q_kill',
      objectives: [{ type: 'kill', monsterId: 'ashwood_wolf', count: 5 }],
    }
    const state = {
      world: { monsterKillCounts: { ashwood_wolf: 7 }, dayCount: 4 },
      meta: { craftCount: 2 },
      hero: {},
    }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseKills).toEqual({ ashwood_wolf: 7 })
    expect(snap.baseResources).toEqual({})
    expect(snap.baseCraft).toBe(2)
    expect(snap.acceptedDay).toBe(4)
  })

  it('defaults a missing monster kill count to 0', () => {
    const quest = {
      id: 'q_kill_absent',
      objectives: [{ type: 'kill', monsterId: 'never_killed', count: 3 }],
    }
    const state = { world: { monsterKillCounts: {} }, meta: {}, hero: {} }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseKills).toEqual({ never_killed: 0 })
  })

  it('defaults to 0 when monsterKillCounts is entirely absent', () => {
    const quest = {
      id: 'q_kill_nomap',
      objectives: [{ type: 'kill', monsterId: 'ashwood_wolf', count: 1 }],
    }
    const snap = snapshotForQuest(quest, { world: {}, meta: {}, hero: {} })
    expect(snap.baseKills).toEqual({ ashwood_wolf: 0 })
  })

  it('captures multiple kill objectives independently', () => {
    const quest = {
      id: 'q_multi_kill',
      objectives: [
        { type: 'kill', monsterId: 'ruin_specter', count: 3 },
        { type: 'kill', monsterId: 'hollow_knight', count: 2 },
      ],
    }
    const state = {
      world: { monsterKillCounts: { ruin_specter: 1 } },
      meta: {},
      hero: {},
    }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseKills).toEqual({ ruin_specter: 1, hollow_knight: 0 })
  })
})

describe('snapshotForQuest — COLLECT objectives (baseResources) [uncovered branch]', () => {
  it('captures the currently held quantity of the targeted resource', () => {
    const quest = {
      id: 'q_collect',
      objectives: [{ type: 'collect', resourceId: 'marsh_venom', count: 4 }],
    }
    const state = {
      hero: { inventory: { resources: { marsh_venom: 3 } } },
      world: { dayCount: 6 },
      meta: { craftCount: 1 },
    }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseResources).toEqual({ marsh_venom: 3 })
    expect(snap.baseKills).toEqual({})
    expect(snap.baseCraft).toBe(1)
    expect(snap.acceptedDay).toBe(6)
  })

  it('defaults a missing resource quantity to 0', () => {
    const quest = {
      id: 'q_collect_absent',
      objectives: [{ type: 'collect', resourceId: 'rusted_iron', count: 3 }],
    }
    const state = { hero: { inventory: { resources: {} } }, world: {}, meta: {} }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseResources).toEqual({ rusted_iron: 0 })
  })

  it('defaults to 0 when the whole inventory chain is absent', () => {
    const quest = {
      id: 'q_collect_noinv',
      objectives: [{ type: 'collect', resourceId: 'marsh_venom', count: 2 }],
    }
    // hero present but no inventory; also test hero entirely missing
    const snapNoInv = snapshotForQuest(quest, { hero: {}, world: {}, meta: {} })
    expect(snapNoInv.baseResources).toEqual({ marsh_venom: 0 })
    const snapNoHero = snapshotForQuest(quest, { world: {}, meta: {} })
    expect(snapNoHero.baseResources).toEqual({ marsh_venom: 0 })
  })

  it('captures multiple collect objectives independently', () => {
    const quest = {
      id: 'q_multi_collect',
      objectives: [
        { type: 'collect', resourceId: 'marsh_venom', count: 2 },
        { type: 'collect', resourceId: 'rusted_iron', count: 5 },
      ],
    }
    const state = {
      hero: { inventory: { resources: { marsh_venom: 4 } } },
      world: {},
      meta: {},
    }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseResources).toEqual({ marsh_venom: 4, rusted_iron: 0 })
  })
})

describe('snapshotForQuest — mixed kill + collect objectives', () => {
  it('populates both baseKills and baseResources', () => {
    const quest = {
      id: 'q_mixed',
      objectives: [
        { type: 'kill', monsterId: 'mire_slime', count: 4 },
        { type: 'collect', resourceId: 'marsh_venom', count: 2 },
        { type: 'visit', spotId: 'thornmarsh' }, // ignored branch
      ],
    }
    const state = {
      world: { monsterKillCounts: { mire_slime: 2 }, dayCount: 9 },
      hero: { inventory: { resources: { marsh_venom: 1 } } },
      meta: { craftCount: 5 },
    }
    const snap = snapshotForQuest(quest, state)
    expect(snap.baseKills).toEqual({ mire_slime: 2 })
    expect(snap.baseResources).toEqual({ marsh_venom: 1 })
    expect(snap.baseCraft).toBe(5)
    expect(snap.acceptedDay).toBe(9)
  })
})

describe('snapshotForQuest — defaults for craft/day', () => {
  it('baseCraft defaults to 0 and acceptedDay defaults to 1', () => {
    const quest = { id: 'q_defaults', objectives: [{ type: 'kill', monsterId: 'x' }] }
    const snap = snapshotForQuest(quest, { world: {}, hero: {}, meta: {} })
    expect(snap.baseCraft).toBe(0)
    expect(snap.acceptedDay).toBe(1)
  })

  it('acceptedDay falls back to 1 when world is missing entirely', () => {
    const quest = { id: 'q_noworld', objectives: [] }
    const snap = snapshotForQuest(quest, { hero: {}, meta: {} })
    expect(snap.acceptedDay).toBe(1)
    expect(snap.baseCraft).toBe(0)
  })
})

describe('snapshotForQuest — null / empty objectives (no throw)', () => {
  it('returns empty base maps for a quest with an empty objectives array', () => {
    const snap = snapshotForQuest(
      { id: 'empty', objectives: [] },
      { world: {}, hero: {}, meta: {} },
    )
    expect(snap.baseKills).toEqual({})
    expect(snap.baseResources).toEqual({})
  })

  it('does not throw for a quest with null objectives', () => {
    const snap = snapshotForQuest(
      { id: 'nullobj', objectives: null },
      { world: {}, hero: {}, meta: {} },
    )
    expect(snap.baseKills).toEqual({})
    expect(snap.baseResources).toEqual({})
  })

  it('does not throw when the quest itself is null/undefined', () => {
    const snap = snapshotForQuest(null, { world: {}, hero: {}, meta: {} })
    expect(snap.baseKills).toEqual({})
    expect(snap.baseResources).toEqual({})
    expect(snap.baseCraft).toBe(0)
    expect(snap.acceptedDay).toBe(1)
  })

  it('does not throw when state sub-objects are missing', () => {
    const quest = {
      id: 'q_bare_state',
      objectives: [
        { type: 'kill', monsterId: 'ashwood_wolf' },
        { type: 'collect', resourceId: 'marsh_venom' },
      ],
    }
    const snap = snapshotForQuest(quest, {})
    expect(snap.baseKills).toEqual({ ashwood_wolf: 0 })
    expect(snap.baseResources).toEqual({ marsh_venom: 0 })
    expect(snap.baseCraft).toBe(0)
    expect(snap.acceptedDay).toBe(1)
  })
})

// ── questXpReward / questRankPoints & default helpers ────────────────────────
describe('questXpReward — QUEST_BALANCE overlay (autored quests)', () => {
  it('uses the balance XP for a tiered/autored quest (mq01_waking → 40)', () => {
    expect(questXpReward({ id: 'mq01_waking' })).toBe(40)
  })

  it('uses the balance XP for a hard boss-ish quest (clear_the_marsh → 150)', () => {
    expect(questXpReward({ id: 'clear_the_marsh' })).toBe(150)
  })

  it('uses the balance XP for a medium quest (silence_the_crypt → 110)', () => {
    expect(questXpReward({ id: 'silence_the_crypt' })).toBe(110)
  })
})

describe('questXpReward — visit-only quests give 0 XP', () => {
  it('a visit-only quest not in balance returns 0', () => {
    const quest = {
      id: 'unknown_visit_only',
      objectives: [{ type: 'visit', spotId: 'thornmarsh' }],
    }
    expect(questXpReward(quest)).toBe(0)
    expect(defaultQuestXp(quest)).toBe(0)
  })

  it('an autored INUTILE visit quest returns 0 from the balance overlay', () => {
    expect(questXpReward({ id: 'nc_scout_marsh' })).toBe(0)
  })
})

describe('questXpReward — reward.xp fallback and gold-derived default', () => {
  it('falls back to reward.xp when the quest is not in QUEST_BALANCE', () => {
    const quest = {
      id: 'not_in_balance',
      reward: { xp: 999, gold: 10 },
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(questXpReward(quest)).toBe(999)
  })

  it('derives XP from gold (gold*0.6, min 10) when neither balance nor reward.xp exist', () => {
    const quest = {
      id: 'gold_only',
      reward: { gold: 200 },
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    // 200 * 0.6 = 120
    expect(questXpReward(quest)).toBe(120)
    expect(defaultQuestXp(quest)).toBe(120)
  })

  it('clamps the gold-derived XP to a minimum of 10', () => {
    const quest = {
      id: 'tiny_gold',
      reward: { gold: 5 },
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    // 5 * 0.6 = 3 → clamped to 10
    expect(defaultQuestXp(quest)).toBe(10)
  })

  it('defaults to 10 XP when there is no gold at all', () => {
    const quest = { id: 'no_gold', objectives: [{ type: 'kill', monsterId: 'x', count: 1 }] }
    expect(defaultQuestXp(quest)).toBe(10)
  })
})

describe('defaultQuestXp — village difficulty tiers', () => {
  it('easy → 40, medium → 110, hard → 150', () => {
    const base = { objectives: [{ type: 'kill', monsterId: 'x', count: 1 }] }
    expect(defaultQuestXp({ ...base, difficultyTier: 'easy' })).toBe(40)
    expect(defaultQuestXp({ ...base, difficultyTier: 'medium' })).toBe(110)
    expect(defaultQuestXp({ ...base, difficultyTier: 'hard' })).toBe(150)
  })

  it("normalises the legacy 'mid' tier to medium (110)", () => {
    const quest = {
      id: 'mid_tier',
      difficultyTier: 'mid',
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(defaultQuestXp(quest)).toBe(110)
  })

  it('a tier takes precedence over the gold-derived default', () => {
    const quest = {
      id: 'tier_over_gold',
      difficultyTier: 'easy',
      reward: { gold: 5000 },
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(defaultQuestXp(quest)).toBe(40)
  })
})

describe('questRankPoints — QUEST_BALANCE overlay', () => {
  it('uses the balance rank points for autored quests', () => {
    expect(questRankPoints({ id: 'mq01_waking' })).toBe(1)
    expect(questRankPoints({ id: 'silence_the_crypt' })).toBe(3)
    expect(questRankPoints({ id: 'clear_the_marsh' })).toBe(5)
  })

  it('an autored INUTILE quest returns 0 rank points', () => {
    expect(questRankPoints({ id: 'nc_scout_marsh' })).toBe(0)
  })
})

describe('questRankPoints — visit-only and defaults', () => {
  it('a visit-only quest not in balance returns 0 rank points', () => {
    const quest = {
      id: 'unknown_visit_rank',
      objectives: [{ type: 'visit', spotId: 'thornmarsh' }],
    }
    expect(questRankPoints(quest)).toBe(0)
    expect(defaultQuestRankPoints(quest)).toBe(0)
  })

  it('falls back to reward.rankPoints when not in balance', () => {
    const quest = {
      id: 'rank_reward_fallback',
      reward: { rankPoints: 4 },
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(questRankPoints(quest)).toBe(4)
  })

  it('defaults to 1 rank point for a non-tiered, non-visit quest', () => {
    const quest = {
      id: 'plain_rank',
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(questRankPoints(quest)).toBe(1)
    expect(defaultQuestRankPoints(quest)).toBe(1)
  })
})

describe('defaultQuestRankPoints — village difficulty tiers', () => {
  it('easy → 1, medium → 3, hard → 5', () => {
    const base = { objectives: [{ type: 'kill', monsterId: 'x', count: 1 }] }
    expect(defaultQuestRankPoints({ ...base, difficultyTier: 'easy' })).toBe(1)
    expect(defaultQuestRankPoints({ ...base, difficultyTier: 'medium' })).toBe(3)
    expect(defaultQuestRankPoints({ ...base, difficultyTier: 'hard' })).toBe(5)
  })

  it("normalises 'mid' to medium (3)", () => {
    const quest = {
      id: 'mid_rank',
      difficultyTier: 'mid',
      objectives: [{ type: 'kill', monsterId: 'x', count: 1 }],
    }
    expect(defaultQuestRankPoints(quest)).toBe(3)
  })
})

describe('QUEST_XP_REPEAT_MULT — repeat multiplier applied on re-completion', () => {
  it('is the documented 0.25 constant', () => {
    expect(QUEST_XP_REPEAT_MULT).toBe(0.25)
  })

  it('a repeat award = base XP * 0.25 (e.g. 150 → 37.5, rounded 38)', () => {
    const baseXp = questXpReward({ id: 'clear_the_marsh' }) // 150
    expect(baseXp).toBe(150)
    const repeatXp = Math.round(baseXp * QUEST_XP_REPEAT_MULT)
    expect(repeatXp).toBe(38)
  })

  it('a repeat award for a 40-XP quest is 10 (40 * 0.25)', () => {
    const baseXp = questXpReward({ id: 'mq01_waking' }) // 40
    expect(baseXp * QUEST_XP_REPEAT_MULT).toBe(10)
  })
})

describe('reward helpers — robustness on null/undefined quest', () => {
  it('questXpReward(undefined) does not throw and returns the 10 default', () => {
    expect(questXpReward(undefined)).toBe(10)
  })

  it('questRankPoints(undefined) does not throw and returns the 1 default', () => {
    expect(questRankPoints(undefined)).toBe(1)
  })

  it('defaultQuestXp / defaultQuestRankPoints handle a quest with no objectives', () => {
    // isVisitOnly requires length > 0, so an empty-objectives quest is NOT visit-only
    const quest = { id: 'no_obj', objectives: [] }
    expect(defaultQuestXp(quest)).toBe(10)
    expect(defaultQuestRankPoints(quest)).toBe(1)
  })
})
