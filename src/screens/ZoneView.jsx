import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { ZONES } from '../data/zones'
import { MONSTERS, MONSTERS_BY_ZONE, MONSTERS_BY_SPOT } from '../data/monsters'
import { RESOURCES, RARITY_COLORS } from '../data/resources'
import { SKILLS } from '../data/skills'
import { generateEnemies } from '../engine/combat'
import { ParchmentFrame } from '../components/parchment'
import ConfirmDialog from '../components/ConfirmDialog'

// S02 — seuil de kills pour révéler le skill droppable d'un monstre
const SKILL_REVEAL_THRESHOLD = 5

export default function ZoneView() {
  const { world, setScreen, recordVisit } = useGameStore()
  const zone = ZONES[world.currentZone]
  // ZV-CARDS01 — bloc stats des cartes monstres masquable (off par défaut → cartes épurées)
  const [showStats, setShowStats] = useState(false)
  // UX-LEAVE-CONFIRM01 — confirmation avant de quitter une zone de donjon/danger en cours
  const [confirmLeave, setConfirmLeave] = useState(false)

  // Q04 — enregistre la visite du spot de chasse courant (quêtes d'exploration)
  useEffect(() => {
    if (world.currentHuntingSpot) recordVisit(world.currentHuntingSpot)
  }, [world.currentHuntingSpot, recordVisit])

  if (!zone) return null

  const isBlightedRoad = world.currentZone === 'blighted_road'

  // Si on est sur un spot de chasse Ashenvale, utiliser la liste spécifique
  const spot = world.currentHuntingSpot
    ? zone.huntingSpots?.find((s) => s.id === world.currentHuntingSpot)
    : null

  const monsterList = spot
    ? (MONSTERS_BY_SPOT[world.currentHuntingSpot] ?? [])
    : (MONSTERS_BY_ZONE[world.currentZone] ?? [])

  const displayName = spot ? spot.name : zone.name
  const displayDesc = spot ? spot.description : zone.description

  return (
    <div className={`parchment fill forest ${isBlightedRoad ? 'blighted' : ''}`}>
      <ParchmentFrame variant="vine" />

      <button
        className="back-btn"
        onClick={() => (isBlightedRoad ? setConfirmLeave(true) : setScreen('world_map'))}
      >
        ← Map
      </button>

      {/* UX-LEAVE-CONFIRM01 — quitter la Blighted Road (zone de danger) demande confirmation */}
      <ConfirmDialog
        open={confirmLeave}
        variant="warn"
        title="Leave the Blighted Road?"
        message="This cursed crossing is no place to linger. Head back to the map?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={() => {
          setConfirmLeave(false)
          setScreen('world_map')
        }}
        onCancel={() => setConfirmLeave(false)}
      />

      <div className="zone-header vil-header">
        <div className="t-zone zh-title">
          {spot?.icon && <span style={{ marginRight: '0.5rem' }}>{spot.icon}</span>}
          {displayName}
        </div>
        <div className="t-sub zh-sub">{displayDesc}</div>
        {spot && (
          <div className="t-sub" style={{ fontSize: 14, marginTop: 2 }}>
            Recommended Lv {spot.levelRange[0]}–{spot.levelRange[1]}
          </div>
        )}
      </div>

      <div className="forest-body">
        <div className="forest-main">
          {/* Avertissement route */}
          {isBlightedRoad && (
            <div className="forest-danger">
              ⚠ Danger Zone — No idle farming. Elite monsters only.
            </div>
          )}

          {/* Monstres → clairières */}
          <Section title="Clearings">
            {/* ZV-CARDS01 — afficher/masquer le bloc de stats des cartes */}
            <label className="zv-stats-toggle">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                data-testid="zv-stats-toggle"
              />{' '}
              Show stats
            </label>
            <div className="mcard-grid">
              {monsterList.map((monsterId) => (
                <MonsterRow key={monsterId} monsterId={monsterId} showStats={showStats} />
              ))}
            </div>
          </Section>

          {/* Donjon (seulement sur la zone principale, pas sur les spots) */}
          {!spot && zone.dungeon && (
            <DungeonSection zone={zone} world={world} setScreen={setScreen} />
          )}

          {/* Demon Lord */}
          {zone.demonLord && <DemonLordSection world={world} setScreen={setScreen} />}
        </div>

        {/* Journal idle (panneau parchemin) */}
        <IdleSidebar />
      </div>
    </div>
  )
}

// Sprite chibi du monstre (couche A) avec repli emoji si l'asset manque
function MonsterSprite({ id, elite }) {
  const [err, setErr] = useState(false)
  if (err) return <span className="ms-emoji">{elite ? '👹' : '🐾'}</span>
  return (
    <img
      className="ms-img"
      src={`/monsters/${id}.png`}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setErr(true)}
    />
  )
}

// ── Clairière d'un monstre ────────────────────────────────────────────────────
function MonsterRow({ monsterId, showStats = false }) {
  const { world, hero, toggleIdle, startCombat } = useGameStore()
  const monster = MONSTERS[monsterId]
  if (!monster) return null

  const killCount = world.monsterKillCounts[monsterId] || 0
  const idleUnlocked = killCount >= 5
  const isIdleActive = world.idleToggles[monsterId] || false
  const isElite = monster.rank === 'elite'

  const handleFight = () => {
    // B03 — 1 à 3 ennemis selon la zone et le rang (élite/boss → 1)
    const enemies = generateEnemies(monsterId, world.currentZone, hero.runNumber)
    if (enemies.length === 0) return
    startCombat(enemies)
  }

  return (
    <div className={`mcard ${isElite ? 'elite' : ''} ${isIdleActive ? 'idle-on' : ''}`}>
      <div className="mcard-sprite">
        <MonsterSprite id={monsterId} elite={isElite} />
      </div>
      <div className="mcard-head">
        <span className="mcard-name">{monster.name}</span>
        {isElite && <span className="mcard-elite">ELITE</span>}
        {isIdleActive && <span className="mcard-idle">◆ IDLE</span>}
      </div>

      {showStats && (
        <div className="mcard-stats">
          <span>HP {monster.baseStats.hp}</span>
          <span>ATK {monster.baseStats.atk}</span>
          <span>DEF {monster.baseStats.def}</span>
          <span>SPD {monster.baseStats.spd}</span>
        </div>
      )}

      <div className="kbar-row">
        <div className="kbar">
          <i
            style={{
              width: `${Math.min(100, (killCount / 5) * 100)}%`,
              background: idleUnlocked ? 'var(--safe-green)' : 'var(--gold)',
            }}
          />
        </div>
        <span
          className="kbar-label"
          style={{ color: idleUnlocked ? 'var(--forest-deep)' : 'var(--ink-soft)' }}
        >
          {idleUnlocked ? '✓ Idle unlocked' : `${killCount}/5 kills`}
        </span>
      </div>

      {/* S02 — Aperçu du skill droppable (flou tant que < 5 kills) */}
      <SkillDropPreview monster={monster} killCount={killCount} />

      <div className="mcard-actions">
        {idleUnlocked && !isElite && (
          <button
            className={`fbtn ${isIdleActive ? 'on' : ''}`}
            onClick={() => toggleIdle(monsterId)}
          >
            {isIdleActive ? '⏸ Idle ON' : '▶ Idle'}
          </button>
        )}
        <button className="fbtn fight" onClick={handleFight}>
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
    <div className="skill-drop" data-testid="skill-drop-preview">
      <span
        style={{ color: 'var(--ink-soft)', fontSize: '0.68rem', fontFamily: 'var(--font-head)' }}
      >
        ✦ Technique:
      </span>
      <span
        data-testid="skill-drop-name"
        style={{
          color: revealed ? '#7a3fb0' : '#a9967a',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-head)',
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
          className={`fsec-card ${dungeon.discovered ? 'arcane' : 'arcane-dim'}`}
          onClick={handleEnter}
        >
          <div className="fsec-row">
            <div>
              <p
                className="fsec-title"
                style={{ color: dungeon.discovered ? '#7a3fb0' : '#8a7a92' }}
              >
                {dungeon.discovered ? zone.dungeon.name : '??? Unknown Dungeon'}
              </p>
              <p className="fsec-sub">
                {dungeon.discovered
                  ? `${zone.dungeon.rooms} rooms + boss · One-shot`
                  : `Spotted to the ${dungeon.position} — approach to reveal`}
              </p>
            </div>
            {dungeon.discovered && <span className="fsec-cta arcane">Enter ➜</span>}
          </div>
        </div>
      ) : dungeon.cleared ? (
        <div className="fsec-card muted">
          <p className="fsec-sub italic">Dungeon cleared. A new one will appear tonight...</p>
        </div>
      ) : (
        <div className="fsec-card muted">
          <p className="fsec-sub italic">No active dungeon.</p>
        </div>
      )}
    </Section>
  )
}

// ── Section Demon Lord ────────────────────────────────────────────────────────
function DemonLordSection({ world }) {
  const { startCombat, hero } = useGameStore()
  // DEMON-FIGHT — lance le vrai combat contre Malachar (rank demon_lord, 3 phases BSS03,
  // drop Soul Rend garanti). La victoire est gérée dans Combat.handleVictory → clearDungeon('grimspire').
  const handleChallenge = () => {
    const enemies = generateEnemies('malachar', 'grimspire', hero.runNumber)
    if (enemies.length) startCombat(enemies)
  }

  return (
    <Section title="Demon Lord">
      {world.demonLordDefeated ? (
        <div className="fsec-card danger-dim">
          <p className="fsec-title" style={{ color: 'var(--danger)' }}>
            ☠ Malachar the Undying — Defeated
          </p>
          {world.demonLordResurrectionCounter > 0 && (
            <p className="fsec-sub" style={{ color: '#9a5048' }}>
              Resurrects in {4 - world.demonLordResurrectionCounter} transmigrations
            </p>
          )}
        </div>
      ) : (
        <div className="fsec-card danger" onClick={handleChallenge}>
          <div className="fsec-row">
            <div>
              <p className="fsec-title" style={{ color: 'var(--danger)' }}>
                ⚡ Malachar the Undying
              </p>
              <p className="fsec-sub" style={{ color: '#9a5048' }}>
                Demon Lord of Eldenmoor · Grimspire Depths
              </p>
            </div>
            <span className="fsec-cta danger">Challenge ➜</span>
          </div>
        </div>
      )}
    </Section>
  )
}

// ── Journal idle (panneau parchemin) ──────────────────────────────────────────
function IdleSidebar() {
  const { world, setIdleHpThreshold } = useGameStore()
  const threshold = world.idleHpThreshold ?? 0.2
  const THRESHOLDS = [0.2, 0.35, 0.5]

  return (
    <aside className="forest-log">
      <div className="scroll-panel style-scroll" style={{ height: '100%' }}>
        {/* I08 — réglage du seuil de PV d'auto-stop */}
        <div className="t-label" style={{ marginBottom: 6 }}>
          Auto-stop at HP
        </div>
        <div className="flex gap-1" style={{ marginBottom: 12 }} data-testid="idle-hp-threshold">
          {THRESHOLDS.map((t) => {
            const active = Math.abs(threshold - t) < 0.001
            return (
              <button
                key={t}
                onClick={() => setIdleHpThreshold(t)}
                data-testid={`idle-threshold-${Math.round(t * 100)}`}
                className="px-2 py-1 rounded text-xs"
                style={{
                  fontFamily: 'Cinzel, serif',
                  flex: 1,
                  background: active ? 'rgba(74,128,32,.22)' : 'rgba(201,169,110,.14)',
                  color: active ? 'var(--forest-deep, #4a8020)' : 'var(--ink-soft)',
                  border: `1px solid ${active ? 'var(--forest-deep, #4a8020)' : 'var(--parchment-shadow, #3a2818)'}`,
                  cursor: 'pointer',
                }}
              >
                {Math.round(t * 100)}%
              </button>
            )
          })}
        </div>

        <div className="t-label" style={{ marginBottom: 8 }}>
          Idle Log
        </div>

        {world.isIdleActive ? (
          <div className="idle-log">
            <div className="idle-entry" style={{ color: 'var(--forest-deep)' }}>
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--safe-green)',
                }}
              />
              <span>Active</span>
            </div>
            {world.idleLog.length > 0 ? (
              world.idleLog.map((entry, i) => (
                <div className="idle-entry" key={i}>
                  <span
                    className="dot"
                    style={{
                      color:
                        entry.type === 'drop'
                          ? '#7a3fb0'
                          : entry.type === 'kill'
                            ? 'var(--forest-deep)'
                            : 'var(--ink-soft)',
                    }}
                  >
                    ◆
                  </span>
                  <span>{entry.text}</span>
                </div>
              ))
            ) : (
              <div className="sb-val muted" style={{ fontSize: 13 }}>
                Waiting...
              </div>
            )}
          </div>
        ) : (
          <div className="sb-val muted" style={{ fontSize: 13 }}>
            No idle active. Toggle a monster below 5 kills.
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Utilitaire ────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="fsec">
      <div className="t-label" style={{ marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}
