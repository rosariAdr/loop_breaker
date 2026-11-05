import { useGameStore } from '../store/gameStore'
import { nextCampaignQuest, hasQuestPrerequisites } from '../data/campaignProgression'

export function QuestActions({ quest }) {
  const state = useGameStore()
  const [choiceId, eventId] = [quest.choiceId, quest.reportEvent]
  const selected = state.world.campaignChoices?.[choiceId]
  return (
    <div className="flex flex-col gap-2" style={{ margin: '10px 0', color: 'var(--ink)' }}>
      {eventId && !(state.world.campaignEvents ?? []).includes(eventId) && (
        <button className="pbtn" onClick={() => state.interactCampaign(eventId)}>
          Discuss the report with{' '}
          {quest.giverNpc === 'ironhaven_captain' ? 'Captain Vaern' : 'the warden'}
        </button>
      )}
      {quest.choices &&
        !selected &&
        quest.choices.map((o) => {
          const base =
            state.world.questProgress?.[quest.id]?.baseChoiceKills?.[o.kills?.monsterId] ?? 0
          const disabled =
            state.hero.inventory.gold < (o.gold ?? 0) ||
            (o.kills &&
              (state.world.monsterKillCounts[o.kills.monsterId] ?? 0) - base < o.kills.count)
          return (
            <button
              className="pbtn"
              key={o.id}
              disabled={disabled}
              onClick={() => state.chooseQuestOption(quest.id, o.id)}
            >
              {o.label}
            </button>
          )
        })}
      {selected && (
        <p role="status">
          {choiceId === 'guardian_fate'
            ? selected === 'restore'
              ? 'Vaern: “The wards will protect our patrols again. The old oath still holds.”'
              : 'Vaern: “We will forge these remnants into something the living can use.”'
            : selected === 'patrol'
              ? 'Halric: “Your patrol cleared the alternate route. The drivers can return.”'
              : 'Halric: “These supplies will bring the drivers home. I will send word to Vaern.”'}
        </p>
      )}
    </div>
  )
}

export default function CampaignPanel() {
  const state = useGameStore()
  const quest = nextCampaignQuest(state.world)
  if (!quest)
    return (
      <section className="fsec-card" data-testid="campaign-complete">
        <strong>Eldenmoor — campaign complete</strong>
        <p>The routes are secure. Your hunting journal remains yours to explore.</p>
      </section>
    )
  const active = state.world.activeQuests.includes(quest.id)
  const here = state.world.currentLocation === quest.issuedBy
  const ready = active && state.isQuestComplete(quest.id)
  return (
    <section
      className="fsec-card"
      data-testid="campaign-next"
      style={{ padding: 12, marginBottom: 12 }}
    >
      <strong>⚔ Main story · {quest.name}</strong>
      <p>
        {active
          ? ready
            ? `Ready to turn in — ${quest.remote ? 'report from here' : quest.issuedBy}.`
            : quest.description
          : quest.remote
            ? 'Vaern’s next commission is ready. Accept it and report from the field.'
            : `Next: visit ${quest.issuedBy} to accept this mission.`}
      </p>
      {!active &&
        hasQuestPrerequisites(quest, state.world) &&
        (quest.remote || (here && state.currentScreen === 'quest_board')) && (
          <button className="pbtn" onClick={() => state.startQuest(quest.id)}>
            Accept mission
          </button>
        )}
      {active && quest.remote && ready && (
        <button className="pbtn" onClick={() => state.completeQuest(quest.id)}>
          Send report · Claim reward
        </button>
      )}
      <p style={{ fontSize: '.8rem' }}>
        {state.world.idleUnlocked
          ? 'Idle learned. Master each species with 5 victories; safety limits still apply.'
          : 'Learn idle: defeat 5 wolves, then return The Hunting Journal to Moira in Greywatch.'}
      </p>
    </section>
  )
}
