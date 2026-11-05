import { useGameStore } from '../store/gameStore'
import { CAMPAIGN_INTERACTIONS } from '../data/campaignProgression'

export default function CampaignInteractions() {
  const s = useGameStore()
  const { world } = s
  const interactions = Object.entries(CAMPAIGN_INTERACTIONS).filter(
    ([, i]) => i.spot === world.currentHuntingSpot && world.activeQuests.includes(i.quest),
  )
  const ruins = world.currentHuntingSpot === 'crumbled_ruins'
  const trialAvailable =
    ruins &&
    (world.activeQuests.includes('mq06_beyond_marsh') ||
      world.completedQuests.includes('mq06_beyond_marsh'))
  const trial = world.sentinelTrial ?? { active: false, wins: 0, completed: 0 }
  const fate = world.campaignChoices?.guardian_fate
  if (!interactions.length && !trialAvailable && !(ruins && fate)) return null
  return (
    <section className="fsec-card" data-testid="campaign-interactions" style={{ padding: 14 }}>
      <h3>Field journal</h3>
      {interactions.map(([id, i]) => (
        <div key={id} style={{ marginBottom: 10 }}>
          {world.campaignEvents.includes(id) ? (
            <p>{i.text}</p>
          ) : (
            <button className="pbtn" onClick={() => s.interactCampaign(id)}>
              {i.label}
            </button>
          )}
        </div>
      ))}
      {ruins && fate && (
        <p>
          {fate === 'restore'
            ? 'The restored boundary stones glow around the patrol route.'
            : 'The dismantled ward stones bear the marks of Ironhaven’s salvagers.'}
        </p>
      )}
      {trialAvailable && (
        <div>
          <h4>Sentinel Trial · {trial.active ? `${trial.wins}/2 victories` : 'Ready'}</h4>
          <p>
            Two consecutive manual Sentinel victories grant one guaranteed orb. Defeat, retreat or
            another enemy resets the streak. Resting and saving are allowed.
          </p>
          <p>
            Sentinel Orbs: {s.hero.inventory.resources.sentinel_orb ?? 0} · Completed trials:{' '}
            {trial.completed}
          </p>
          {!trial.active && (
            <button className="pbtn" onClick={() => s.startSentinelTrial()}>
              Start Sentinel Trial
            </button>
          )}
          {world.completedQuests.includes('mq06_beyond_marsh') && (
            <button
              className="pbtn"
              disabled={
                (world.sentinelUpgrades ?? 0) >= 2 ||
                (s.hero.inventory.resources.sentinel_orb ?? 0) <
                  (world.sentinelUpgrades ?? 0) + 1 ||
                !s.hero.inventory.equipment.some((e) => e.templateId === 'graven_edge')
              }
              onClick={() => s.upgradeSentinelWeapon()}
            >
              Upgrade Graven Edge in bag ·{' '}
              {(world.sentinelUpgrades ?? 0) >= 2
                ? 'Limit reached'
                : `${(world.sentinelUpgrades ?? 0) + 1} orb(s)`}
            </button>
          )}
          <p style={{ fontSize: '.8rem' }}>
            The first orb is reserved for the marsh passage. Unequip Graven Edge before upgrading.
            Two upgrades maximum.
          </p>
        </div>
      )}
    </section>
  )
}
