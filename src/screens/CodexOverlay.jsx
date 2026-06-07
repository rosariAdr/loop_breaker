// CODEX01 — Bestiaire : compendium des monstres qui se remplit progressivement.
// Cohérent S02 : stats révélées après quelques kills, skill drop après 5.
// Réutilise world.monsterKillCounts.
import { useGameStore } from '../store/gameStore'
import { MONSTERS, MONSTERS_BY_ZONE } from '../data/monsters'
import { SKILLS } from '../data/skills'
import { ZONES } from '../data/zones'

const STATS_REVEAL = 3
const SKILL_REVEAL = 5

export default function CodexOverlay({ onClose }) {
  const kills = useGameStore((s) => s.world.monsterKillCounts)
  const setScreen = useGameStore((s) => s.setScreen)
  const back = onClose ?? (() => setScreen('world_map'))

  const zones = Object.keys(MONSTERS_BY_ZONE)
  const allIds = [...new Set(Object.values(MONSTERS_BY_ZONE).flat())].filter((id) => MONSTERS[id])
  const seenCount = allIds.filter((id) => (kills[id] || 0) > 0).length

  return (
    <div className="sheet-scrim" onClick={back}>
      <div className="sheet" style={{ width: 1000, maxWidth: '94%' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-hd">
          <div className="sh-title">Bestiary<span className="sh-meta">{seenCount} / {allIds.length} discovered</span></div>
          <div className="sheet-x" onClick={back}>✕</div>
        </div>
        <div className="sheet-body" style={{ display: 'block', overflowY: 'auto' }}>
          {zones.map((zoneId) => (
            <div key={zoneId} style={{ marginBottom: 18 }}>
              <div className="pb-title">{ZONES[zoneId]?.name ?? zoneId}</div>
              <div className="codex-grid">
                {MONSTERS_BY_ZONE[zoneId].map((id) => {
                  const m = MONSTERS[id]
                  if (!m) return null
                  const k = kills[id] || 0
                  const seen = k > 0
                  const statsKnown = k >= STATS_REVEAL
                  const skillTpl = m.skillDrop ? SKILLS[m.skillDrop.skillId] : null
                  return (
                    <div key={id} className={`codex-card ${seen ? '' : 'unseen'}`} data-testid={`codex-${id}`}>
                      <div className="codex-name">{seen ? m.name : '??? Undiscovered'}</div>
                      {seen && <div className="codex-kills">{k} slain</div>}
                      {seen && (
                        <div className="codex-stats">
                          {statsKnown
                            ? `HP ${m.baseStats.hp} · ATK ${m.baseStats.atk} · DEF ${m.baseStats.def} · SPD ${m.baseStats.spd}`
                            : <span className="codex-locked">Defeat {STATS_REVEAL} to reveal stats</span>}
                        </div>
                      )}
                      {seen && skillTpl && (
                        <div className="codex-skill" data-testid={`codex-skill-${id}`}>
                          ✦ {k >= SKILL_REVEAL ? skillTpl.name : '████████'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
