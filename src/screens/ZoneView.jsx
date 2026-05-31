import { useGameStore } from '../store/gameStore'
import { ZONES } from '../data/zones'
import { MONSTERS, MONSTERS_BY_ZONE, MONSTERS_BY_SPOT } from '../data/monsters'
import { RESOURCES, RARITY_COLORS } from '../data/resources'
import { SKILLS } from '../data/skills'
import { buildEnemy } from '../engine/combat'

// S02 — seuil de kills pour révéler le skill droppable d'un monstre
const SKILL_REVEAL_THRESHOLD = 5

export default function ZoneView() {
  const { world, setScreen } = useGameStore()
  const zone = ZONES[world.currentZone]

  if (!zone) return null

  const isBlightedRoad = world.currentZone === 'blighted_road'

  // Si on est sur un spot de chasse Ashenvale, utiliser la liste spécifique
  const spot = world.currentHuntingSpot
    ? zone.huntingSpots?.find(s => s.id === world.currentHuntingSpot)
    : null

  const monsterList = spot
    ? MONSTERS_BY_SPOT[world.currentHuntingSpot] ?? []
    : MONSTERS_BY_ZONE[world.currentZone] ?? []

  const displayName = spot ? spot.name : zone.name
  const displayDesc = spot ? spot.description : zone.description

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('world_map')}
            style={{ color: '#6a5a4a', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}
          >
            ← Map
          </button>
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.3rem' }}>
              {spot?.icon && <span style={{ marginRight: '0.5rem' }}>{spot.icon}</span>}
              {displayName}
            </h2>
            <p style={{ color: '#6a5a4a', fontSize: '0.8rem', fontStyle: 'italic' }}>
              {displayDesc}
            </p>
            {spot && (
              <p style={{ color: '#4a3a2a', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                Recommended Lv {spot.levelRange[0]}–{spot.levelRange[1]}
              </p>
            )}
          </div>
        </div>

        {/* Avertissement route */}
        {isBlightedRoad && (
          <div
            className="px-4 py-3 rounded border"
            style={{ background: '#1a0808', borderColor: '#5a2018' }}
          >
            <p style={{ color: '#c06040', fontFamily: 'Cinzel, serif', fontSize: '0.85rem' }}>
              ⚠ Danger Zone — No idle farming. Elite monsters only.
            </p>
          </div>
        )}

        {/* Monstres */}
        <Section title="Monsters">
          <div className="flex flex-col gap-3">
            {monsterList.map((monsterId) => (
              <MonsterRow key={monsterId} monsterId={monsterId} />
            ))}
          </div>
        </Section>

        {/* Donjon (seulement sur la zone principale, pas sur les spots) */}
        {!spot && zone.dungeon && <DungeonSection zone={zone} world={world} setScreen={setScreen} />}

        {/* Demon Lord */}
        {zone.demonLord && <DemonLordSection world={world} setScreen={setScreen} />}
      </div>

      {/* Sidebar droite — Log idle */}
      <IdleSidebar />
    </div>
  )
}

// ── Ligne d'un monstre ────────────────────────────────────────────────────────
function MonsterRow({ monsterId }) {
  const { world, hero, toggleIdle, startCombat } = useGameStore()
  const monster = MONSTERS[monsterId]
  if (!monster) return null

  const killCount = world.monsterKillCounts[monsterId] || 0
  const idleUnlocked = killCount >= 5
  const isIdleActive = world.idleToggles[monsterId] || false
  const isElite = monster.rank === 'elite'

  const handleFight = () => {
    const enemy = buildEnemy(monsterId, world.currentZone, hero.runNumber)
    if (!enemy) return
    startCombat([enemy])
  }

  return (
    <div
      className="flex items-center gap-4 p-3 rounded"
      style={{
        background: '#0f0c08',
        border: `1px solid ${isElite ? '#5a3018' : '#1a1410'}`,
      }}
    >
      {/* Infos monstre */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'Cinzel, serif', color: isElite ? '#c08040' : '#d4af70', fontSize: '0.9rem' }}>
            {monster.name}
          </span>
          {isElite && (
            <span className="px-1 py-0.5 text-xs rounded" style={{ background: '#3a2010', color: '#c08040' }}>
              ELITE
            </span>
          )}
        </div>
        <div className="flex gap-3 mt-1" style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>
          <span>HP {monster.baseStats.hp}</span>
          <span>ATK {monster.baseStats.atk}</span>
          <span>DEF {monster.baseStats.def}</span>
          <span>SPD {monster.baseStats.spd}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded overflow-hidden" style={{ background: '#1a1410', maxWidth: '80px' }}>
            <div
              className="h-full rounded"
              style={{
                width: `${Math.min(100, (killCount / 5) * 100)}%`,
                background: idleUnlocked ? '#80c040' : '#d4af70',
              }}
            />
          </div>
          <span style={{ color: idleUnlocked ? '#80c040' : '#6a5a4a', fontSize: '0.72rem' }}>
            {idleUnlocked ? '✓ Idle unlocked' : `${killCount}/5 kills`}
          </span>
        </div>

        {/* S02 — Aperçu du skill droppable (flou tant que < 5 kills) */}
        <SkillDropPreview monster={monster} killCount={killCount} />
      </div>

      {/* Boutons */}
      <div className="flex gap-2">
        {/* Bouton idle */}
        {idleUnlocked && !isElite && (
          <button
            onClick={() => toggleIdle(monsterId)}
            className="px-3 py-1 rounded text-xs transition-all"
            style={{
              fontFamily: 'Cinzel, serif',
              background: isIdleActive ? '#203010' : '#1a1410',
              color: isIdleActive ? '#80c040' : '#6a5a4a',
              border: `1px solid ${isIdleActive ? '#80c040' : '#2a2018'}`,
            }}
          >
            {isIdleActive ? '⏸ Idle ON' : '▶ Idle'}
          </button>
        )}

        {/* Bouton combat manuel */}
        <button
          onClick={handleFight}
          className="px-3 py-1 rounded text-xs transition-all hover:opacity-80"
          style={{
            fontFamily: 'Cinzel, serif',
            background: '#1a0f08',
            color: '#d4af70',
            border: '1px solid #3a2818',
          }}
        >
          ⚔ Fight
        </button>
      </div>
    </div>
  )
}

// ── S02 — Aperçu du skill droppable ────────────────────────────────────────────
function SkillDropPreview({ monster, killCount }) {
  const skillId = monster.skillDrop?.skillId
  if (!skillId) return null
  const skill = SKILLS[skillId]
  if (!skill) return null

  const revealed = killCount >= SKILL_REVEAL_THRESHOLD

  return (
    <div className="flex items-center gap-1.5 mt-1" data-testid="skill-drop-preview">
      <span style={{ color: '#5a4a6a', fontSize: '0.68rem', fontFamily: 'Cinzel, serif' }}>
        ✦ Technique:
      </span>
      <span
        data-testid="skill-drop-name"
        style={{
          color: revealed ? '#c084fc' : '#3a3048',
          fontSize: '0.7rem',
          fontFamily: 'Cinzel, serif',
          // S02 — flou tant que pas révélé
          filter: revealed ? 'none' : 'blur(3px)',
          userSelect: revealed ? 'auto' : 'none',
          transition: 'filter 0.3s',
        }}
        title={revealed ? skill.name : `Defeat ${SKILL_REVEAL_THRESHOLD} to reveal`}
      >
        {revealed ? skill.name : '████████'}
      </span>
    </div>
  )
}

// ── Section donjon ────────────────────────────────────────────────────────────
function DungeonSection({ zone, world }) {
  const dungeon = world.dungeons[zone.id]
  if (!dungeon) return null

  const handleEnter = () => {
    // TODO : lancer le flux de donjon
    alert('Dungeon system coming soon!')
  }

  return (
    <Section title="Dungeon">
      {dungeon.active && !dungeon.cleared ? (
        <div
          className="p-4 rounded border cursor-pointer transition-all hover:opacity-90"
          style={{
            background: '#0f0a18',
            border: `1px solid ${dungeon.discovered ? '#8040c0' : '#3a2848'}`,
          }}
          onClick={handleEnter}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', color: dungeon.discovered ? '#c084fc' : '#604060', fontSize: '0.95rem' }}>
                {dungeon.discovered ? zone.dungeon.name : '??? Unknown Dungeon'}
              </p>
              <p style={{ color: '#6a5a4a', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {dungeon.discovered
                  ? `${zone.dungeon.rooms} rooms + boss · One-shot`
                  : `Spotted to the ${dungeon.position} — approach to reveal`}
              </p>
            </div>
            {dungeon.discovered && (
              <span
                className="px-3 py-1 rounded text-xs"
                style={{ background: '#2a1040', color: '#c084fc', fontFamily: 'Cinzel, serif' }}
              >
                Enter ➜
              </span>
            )}
          </div>
        </div>
      ) : dungeon.cleared ? (
        <div className="p-3 rounded" style={{ background: '#0f0c08', border: '1px solid #1a1410' }}>
          <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
            Dungeon cleared. A new one will appear tonight...
          </p>
        </div>
      ) : (
        <div className="p-3 rounded" style={{ background: '#0f0c08', border: '1px solid #1a1410' }}>
          <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
            No active dungeon.
          </p>
        </div>
      )}
    </Section>
  )
}

// ── Section Demon Lord ────────────────────────────────────────────────────────
function DemonLordSection({ world }) {
  const handleChallenge = () => {
    alert('Demon Lord battle coming soon!')
  }

  return (
    <Section title="Demon Lord">
      {world.demonLordDefeated ? (
        <div className="p-3 rounded" style={{ background: '#0f0c08', border: '1px solid #3a2018' }}>
          <p style={{ color: '#c04040', fontFamily: 'Cinzel, serif', fontSize: '0.85rem' }}>
            ☠ Malachar the Undying — Defeated
          </p>
          {world.demonLordResurrectionCounter > 0 && (
            <p style={{ color: '#6a3028', fontSize: '0.78rem', marginTop: '0.25rem' }}>
              Resurrects in {4 - world.demonLordResurrectionCounter} transmigrations
            </p>
          )}
        </div>
      ) : (
        <div
          className="p-4 rounded border cursor-pointer hover:opacity-90 transition-all"
          style={{ background: '#140808', border: '1px solid #6a2018' }}
          onClick={handleChallenge}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', color: '#c04040', fontSize: '0.95rem' }}>
                ⚡ Malachar the Undying
              </p>
              <p style={{ color: '#6a3028', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                Demon Lord of Eldenmoor · Grimspire Depths
              </p>
            </div>
            <span
              className="px-3 py-1 rounded text-xs"
              style={{ background: '#3a0808', color: '#c04040', fontFamily: 'Cinzel, serif' }}
            >
              Challenge ➜
            </span>
          </div>
        </div>
      )}
    </Section>
  )
}

// ── Sidebar idle log ──────────────────────────────────────────────────────────
function IdleSidebar() {
  const { world } = useGameStore()

  return (
    <aside
      className="w-56 flex flex-col gap-4 p-4 border-l overflow-y-auto"
      style={{ borderColor: '#2a2018', background: '#0a0805' }}
    >
      <div>
        <p
          className="mb-2 text-xs uppercase tracking-widest"
          style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}
        >
          Idle Log
        </p>

        {world.isIdleActive ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#80c040' }} />
              <span style={{ color: '#80c040', fontSize: '0.75rem' }}>Active</span>
            </div>
            {world.idleLog.length > 0 ? (
              world.idleLog.map((entry, i) => (
                <p
                  key={i}
                  style={{
                    color: entry.type === 'drop' ? '#c084fc' : entry.type === 'kill' ? '#80c040' : '#6a5a4a',
                    fontSize: '0.72rem',
                    borderBottom: '1px solid #1a1410',
                    paddingBottom: '0.25rem',
                  }}
                >
                  {entry.text}
                </p>
              ))
            ) : (
              <p style={{ color: '#4a3a2a', fontSize: '0.75rem', fontStyle: 'italic' }}>
                Waiting...
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: '#4a3a2a', fontSize: '0.78rem', fontStyle: 'italic' }}>
            No idle active. Toggle a monster below 5 kills.
          </p>
        )}
      </div>
    </aside>
  )
}

// ── Utilitaire ────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <p
        className="mb-3 text-xs uppercase tracking-widest"
        style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}
