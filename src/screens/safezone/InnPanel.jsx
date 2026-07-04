import { useGameStore } from '../../store/gameStore'
import { Panel, InfoLine } from './Panel'

export default function InnPanel({ onBack }) {
  const { sleep, world, setScreen } = useGameStore()

  const handleSleep = () => {
    sleep()
    onBack()
  }

  return (
    <Panel title="🍺 The Hearth Inn" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          fontStyle: 'italic',
        }}
      >
        "Rest your bones, traveler. The road is long."
      </p>
      <div className="flex flex-col gap-3 max-w-sm">
        <InfoLine label="Day" value={world.dayCount} />
        <InfoLine label="Tick" value={`${world.tickCount}/24`} />

        <button
          onClick={handleSleep}
          className="mt-2 px-4 py-3 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: 'rgba(74,124,47,.14)',
            color: 'var(--forest-deep)',
            border: '1px solid #406030',
          }}
        >
          💤 Sleep until morning
          <br />
          <span style={{ fontSize: '0.75rem', color: '#507040' }}>
            Fully restores HP & Mana · Advances to Day {world.dayCount + 1}
          </span>
        </button>

        <button
          onClick={() => setScreen('quest_board')}
          className="px-4 py-3 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: 'rgba(160,110,220,.12)',
            color: '#c084fc',
            border: '1px solid #3a1c60',
          }}
        >
          📋 Quest Board
          <br />
          <span style={{ fontSize: '0.75rem', color: '#5a3a80' }}>
            View & claim available quests
          </span>
        </button>
      </div>
    </Panel>
  )
}
