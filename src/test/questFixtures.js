// Arrange completed objectives for tests whose subject is reward delivery, not gameplay.
import { useGameStore } from '../store/gameStore'
import { getQuestById } from '../data/quests'

export function readyQuest(id) {
  const q = getQuestById(id)
  const ancestors = []
  let parent = q.requires
  while (parent) {
    ancestors.push(parent)
    parent = getQuestById(parent)?.requires
  }
  useGameStore.setState((s) => ({
    world: {
      ...s.world,
      completedQuests: [...new Set([...s.world.completedQuests, ...ancestors])],
    },
  }))
  useGameStore.getState().startQuest(id)
  useGameStore.setState((s) => {
    const world = {
      ...s.world,
      monsterKillCounts: { ...s.world.monsterKillCounts },
      visitedSpots: [...s.world.visitedSpots],
    }
    const hero = {
      ...s.hero,
      equipped: { ...s.hero.equipped },
      inventory: { ...s.hero.inventory, resources: { ...s.hero.inventory.resources } },
    }
    const meta = { ...s.meta, craftCountByKind: { ...s.meta.craftCountByKind } }
    const base = world.questProgress[id] ?? {}
    for (const obj of q.objectives) {
      if (obj.type === 'kill')
        world.monsterKillCounts[obj.monsterId] =
          (obj.cumulative ? 0 : (base.baseKills?.[obj.monsterId] ?? 0)) + obj.count
      if (obj.type === 'collect')
        hero.inventory.resources[obj.resourceId] =
          (base.baseResources?.[obj.resourceId] ?? 0) + obj.count
      if (obj.type === 'equip')
        hero.equipped[obj.category ?? 'weapon'] = { templateId: 'test_equipment' }
      if (obj.type === 'pray') meta.prayCount = (base.basePray ?? 0) + obj.count
      if (obj.type === 'accept_deed') meta.deedsAccepted = (base.baseDeeds ?? 0) + obj.count
      if (obj.type === 'craft') {
        if (obj.outputKind)
          meta.craftCountByKind[obj.outputKind] =
            (base.baseCraftByKind?.[obj.outputKind] ?? 0) + obj.count
        else meta.craftCount = (base.baseCraft ?? 0) + obj.count
      }
    }
    return { hero, world, meta }
  })
}
