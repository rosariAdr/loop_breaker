import { MAIN_QUEST_ORDER, MAIN_QUESTS } from './mainQuests'

export function nextCampaignQuest(world) {
  return (
    MAIN_QUESTS[MAIN_QUEST_ORDER.find((id) => !(world.completedQuests ?? []).includes(id))] ?? null
  )
}

export function hasQuestPrerequisites(quest, world) {
  const completed = world.completedQuests ?? []
  return [quest.requires, ...(quest.requiresAll ?? [])]
    .filter(Boolean)
    .every((id) => completed.includes(id))
}

export function campaignGate(id, world) {
  const required = {
    crypt: 'mq07_marsh_circuit',
    blighted_road: 'mq08_crypt_master',
    grimspire: 'mq09_crossing',
    forsaken_citadel: 'mq09_crossing',
    malachar: 'mq10_forsaken_citadel',
  }[id]
  return (
    !required ||
    (world.completedQuests ?? []).includes(required) ||
    (world.campaignLegacyAccess ?? []).includes(id)
  )
}

export const CAMPAIGN_INTERACTIONS = {
  convoy_camp: {
    spot: 'crumbled_ruins',
    quest: 'sq_convoy_1',
    label: 'Search the abandoned convoy',
    text: 'The crates are intact. Tracks lead away from the road: the drivers fled toward the hills.',
  },
  boundary_west: {
    spot: 'crumbled_ruins',
    quest: 'sq_guardian_1',
    label: 'Read the western boundary stone',
    text: 'The first stone marks a patrol route. Its carved arrows point toward the marsh.',
  },
  boundary_east: {
    spot: 'crumbled_ruins',
    quest: 'sq_guardian_1',
    label: 'Read the eastern boundary stone',
    text: 'The second stone describes a ward powered by the Sentinel. Its orb can restore the old boundary.',
  },
}
