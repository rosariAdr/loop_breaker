// S03 — Tests groupManaStones + removeOneManaStone
import { describe, it, expect } from 'vitest'
import { groupManaStones, removeOneManaStone } from './manaStones'

describe('groupManaStones — S03', () => {
  it("tableau vide → []", () => {
    expect(groupManaStones([])).toEqual([])
  })

  it("non-array → []", () => {
    expect(groupManaStones(null)).toEqual([])
    expect(groupManaStones(undefined)).toEqual([])
  })

  it("3 stones uniques → 3 groupes count=1", () => {
    const stones = [
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'cleave', level: 1, xp: 0 },
      { skillId: 'iron_resolve', level: 1, xp: 0 },
    ]
    const groups = groupManaStones(stones)
    expect(groups).toHaveLength(3)
    expect(groups.every(g => g.count === 1)).toBe(true)
  })

  it("3 copies du même skill+level → 1 groupe count=3", () => {
    const stones = [
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
    ]
    const groups = groupManaStones(stones)
    expect(groups).toHaveLength(1)
    expect(groups[0].count).toBe(3)
    expect(groups[0].skillId).toBe('savage_bite')
  })

  it("même skill mais level différent → 2 groupes séparés", () => {
    const stones = [
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 2, xp: 0 },
    ]
    const groups = groupManaStones(stones)
    expect(groups).toHaveLength(2)
  })

  it("firstIndex pointe sur la 1ère occurrence", () => {
    const stones = [
      { skillId: 'cleave', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
    ]
    const groups = groupManaStones(stones)
    const savage = groups.find(g => g.skillId === 'savage_bite')
    expect(savage.firstIndex).toBe(1)
    expect(savage.count).toBe(2)
  })

  it("mix : 2 savage + 1 cleave + 3 iron → 3 groupes", () => {
    const stones = [
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'cleave', level: 1, xp: 0 },
      { skillId: 'iron_resolve', level: 1, xp: 0 },
      { skillId: 'iron_resolve', level: 1, xp: 0 },
      { skillId: 'iron_resolve', level: 1, xp: 0 },
    ]
    const groups = groupManaStones(stones)
    expect(groups).toHaveLength(3)
    expect(groups.find(g => g.skillId === 'savage_bite').count).toBe(2)
    expect(groups.find(g => g.skillId === 'iron_resolve').count).toBe(3)
  })
})

describe('removeOneManaStone — S03', () => {
  it("retire UNE seule copie (pas toutes)", () => {
    const stones = [
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 0 },
    ]
    const after = removeOneManaStone(stones, 'savage_bite')
    expect(after).toHaveLength(2)
    expect(after.every(s => s.skillId === 'savage_bite')).toBe(true)
  })

  it("retire la 1ère occurrence", () => {
    const stones = [
      { skillId: 'cleave', level: 1, xp: 0 },
      { skillId: 'savage_bite', level: 1, xp: 5 },
      { skillId: 'savage_bite', level: 1, xp: 10 },
    ]
    const after = removeOneManaStone(stones, 'savage_bite')
    expect(after).toHaveLength(2)
    expect(after[0].skillId).toBe('cleave')
    // celle avec xp:10 reste
    expect(after[1].xp).toBe(10)
  })

  it("skillId absent → tableau inchangé", () => {
    const stones = [{ skillId: 'cleave', level: 1, xp: 0 }]
    expect(removeOneManaStone(stones, 'ghost')).toEqual(stones)
  })

  it("non-array → []", () => {
    expect(removeOneManaStone(null, 'x')).toEqual([])
  })
})
