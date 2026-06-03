import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'
import { DEITIES } from '../data/deities'
import { RARITY_CONFIG, calcEquippedStatBonuses } from '../data/equipment'
import { DEBUFFS } from '../data/debuffs'
import { TITLES } from '../data/titles'
import { hasGluttony, isGluttonyReady, gluttonyDaysRemaining } from '../engine/gluttony'
import Tooltip from '../components/Tooltip'

// UX01 — Descriptions in-game des stats du héros
const STAT_TOOLTIPS = {
  HP: "Points de vie. À 0 → mort + transmigration.",
  Mana: "Énergie magique. Coût des skills actifs (réduit de 10% par niveau de skill).",
  Strength: "Augmente les dégâts d'attaque basique et des skills physiques. +1/level-up.",
  Agility: "Vitesse au tour de combat (ordre d'action). Augmente le %fuite.",
  Intelligence: "Augmente les dégâts des skills magiques.",
  Chance: "Augmente la fréquence et la qualité des drops de loot (skills, ressources).",
  Defense: "Réduit les dégâts subis : dmg = max(1, atk - DEF/2).",
}

export default function HeroSheet() {
  const { hero, meta, world, setScreen, unequipItem, unequipActiveSkill, unequipPassiveSkill } = useGameStore()
  const equippedBonuses = calcEquippedStatBonuses(hero.equipped ?? {})
  const earnedTitles = (meta?.titlesEarned ?? []).map(id => TITLES[id]).filter(Boolean) // M01
  // GLT03 — statut Gluttony
  const gluttonyEquipped = hasGluttony(hero.passiveSkills ?? [])
  const gluttonyReady = isGluttonyReady(world?.dayCount ?? 0, meta?.gluttonyLastUsed)
  const gluttonyDays = gluttonyDaysRemaining(world?.dayCount ?? 0, meta?.gluttonyLastUsed)

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">

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
              {hero.name}
            </h2>
            <p style={{ color: '#6a5a4a', fontSize: '0.78rem' }}>
              Run #{hero.runNumber} · {hero.deathCount} deaths
            </p>
          </div>
        </div>

        {/* Stats */}
        <Section title="Stats">
          <div className="grid grid-cols-2 gap-2">
            <StatRow label="HP" value={`${hero.stats.hp} / ${hero.stats.maxHp}`} color="#c04040" bonus={equippedBonuses.maxHp} />
            <StatRow label="Mana" value={`${hero.stats.mana} / ${hero.stats.maxMana}`} color="#3060c0" />
            <StatRow label="Strength" value={hero.stats.strength} color="#c08040" bonus={equippedBonuses.strength} />
            <StatRow label="Agility" value={hero.stats.agility} color="#40c080" bonus={equippedBonuses.agility} />
            <StatRow label="Intelligence" value={hero.stats.intelligence} color="#8060c0" bonus={equippedBonuses.intelligence} />
            <StatRow label="Chance" value={hero.stats.chance} color="#c0c040" bonus={equippedBonuses.chance} />
            <StatRow label="Defense" value={hero.stats.def} color="#6080a0" bonus={equippedBonuses.def} />
          </div>
        </Section>

        {/* CRF05 — Debuffs actifs */}
        {(hero.activeDebuffs?.length ?? 0) > 0 && (
          <Section title="Active Debuffs">
            <div className="flex flex-col gap-2" data-testid="active-debuffs">
              {hero.activeDebuffs.map((d, i) => {
                const def = DEBUFFS[d.debuffId]
                if (!def) return null
                const remaining = d.duration?.remaining
                return (
                  <div
                    key={`${d.debuffId}_${i}`}
                    className="flex items-center gap-3 p-2 rounded"
                    style={{ background: '#140a0a', border: `1px solid ${d.permanent ? '#6a2020' : '#3a2018'}` }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Cinzel, serif', color: '#d08060', fontSize: '0.82rem' }}>
                        {def.name}
                        <span style={{ color: '#8a5a4a', fontSize: '0.72rem', marginLeft: '0.4rem' }}>
                          −{Math.round(def.reduction * 100)}% {def.stat}
                        </span>
                      </p>
                      <p style={{ color: '#6a5a4a', fontSize: '0.7rem' }}>{def.description}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs flex-shrink-0"
                      style={{
                        background: d.permanent ? '#2a0808' : '#1a1208',
                        color: d.permanent ? '#e05050' : '#c0a060',
                        border: `1px solid ${d.permanent ? '#6a2020' : '#3a2818'}`,
                        fontFamily: 'Cinzel, serif',
                      }}
                    >
                      {d.permanent ? 'Cure needed' : `${remaining}d left`}
                    </span>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Équipement */}
        <Section title="Equipment">
          <div className="grid grid-cols-2 gap-2">
            {['weapon', 'helmet', 'armor', 'boots'].map(slot => {
              const item = hero.equipped?.[slot]
              const rarityConf = item ? RARITY_CONFIG[item.rarity] : null
              return (
                <div
                  key={slot}
                  className="p-3 rounded border"
                  style={{
                    background: '#0f0c08',
                    borderColor: rarityConf ? `${rarityConf.color}50` : '#1a1410',
                    borderLeft: rarityConf ? `3px solid ${rarityConf.color}` : '3px solid #1a1410',
                  }}
                >
                  <p style={{ color: '#4a3a2a', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {slot}
                  </p>
                  {item ? (
                    <>
                      <p style={{ color: rarityConf.color, fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}>
                        {item.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.stats).map(([stat, val]) => (
                          <span key={stat} style={{ color: '#80c040', fontSize: '0.7rem' }}>
                            +{val} {stat}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => unequipItem(slot)}
                        style={{ color: '#5a3a2a', fontSize: '0.68rem', marginTop: '0.3rem' }}
                      >
                        Unequip
                      </button>
                    </>
                  ) : (
                    <p style={{ color: '#2a2018', fontSize: '0.78rem', fontStyle: 'italic' }}>Empty</p>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Divinité */}
        <Section title="Deity">
          {hero.deity ? (
            <DeityDisplay deityId={hero.deity} hero={hero} />
          ) : (
            <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
              No deity — walk alone, or let one find you.
            </p>
          )}
        </Section>

        {/* Active Skills */}
        <Section title={`Active Skills (${hero.activeSkills.length}/6)`}>
          {hero.activeSkills.length === 0 ? (
            <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
              No active skills equipped. Equip from Inventory.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {hero.activeSkills.map(s => <SkillRow key={s.skillId} skill={s} onUnequip={() => unequipActiveSkill(s.skillId)} />)}
            </div>
          )}
        </Section>

        {/* Passive Skills */}
        <Section title={`Passive Skills (${hero.passiveSkills.length}/4)`}>
          {hero.passiveSkills.length === 0 ? (
            <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
              No passive skills equipped.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {hero.passiveSkills.map(s => <SkillRow key={s.skillId} skill={s} onUnequip={() => unequipPassiveSkill(s.skillId)} />)}
            </div>
          )}
        </Section>

        {/* GLT03 — Statut Gluttony */}
        {gluttonyEquipped && (
          <Section title="Gluttony">
            <div
              className="flex items-center justify-between p-2.5 rounded"
              data-testid="gluttony-status"
              style={{ background: '#160a08', border: '1px solid #5a2818' }}
            >
              <span style={{ color: '#e08060', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}>
                👹 Gluttony
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  background: gluttonyReady ? '#0e1808' : '#1a1208',
                  color: gluttonyReady ? '#80c040' : '#a08050',
                  border: `1px solid ${gluttonyReady ? '#2a5018' : '#3a2818'}`,
                  fontFamily: 'Cinzel, serif',
                }}
              >
                {gluttonyReady ? 'Ready' : `${gluttonyDays}d remaining`}
              </span>
            </div>
          </Section>
        )}

        {/* M01 — Titres permanents (persistent entre runs) */}
        {(earnedTitles.length > 0 || hero.titles.length > 0) && (
          <Section title="Titles">
            <div className="flex flex-wrap gap-2" data-testid="permanent-titles">
              {earnedTitles.map(t => (
                <Tooltip key={t.id} content={t.description}>
                  <span
                    className="px-3 py-1 rounded text-xs inline-flex items-center gap-1"
                    style={{ background: '#1a0f08', color: '#d4af70', border: '1px solid #5a3818', fontFamily: 'Cinzel, serif', cursor: 'help' }}
                  >
                    <span>{t.icon}</span> {t.name}
                  </span>
                </Tooltip>
              ))}
              {/* Titres legacy par-run (chaînes brutes) */}
              {hero.titles.map(t => (
                <span
                  key={t}
                  className="px-3 py-1 rounded text-xs"
                  style={{ background: '#140c08', color: '#a08050', border: '1px solid #3a2818', fontFamily: 'Cinzel, serif' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className="w-44 p-4 border-l flex flex-col gap-4"
        style={{ borderColor: '#2a2018', background: '#0a0805' }}
      >
        <SideInfo label="Gold" value={`${hero.inventory.gold}g`} color="#d4af70" />
        <SideInfo label="Tokens" value={hero.reputationTokens} color="#c084fc" />
        <SideInfo label="Run" value={`#${hero.runNumber}`} color="#6a5a4a" />
        <div className="mt-auto">
          <button
            onClick={() => setScreen('inventory')}
            className="w-full px-3 py-2 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#1a1410', color: '#d4af70', border: '1px solid #3a2818' }}
          >
            🎒 Inventory
          </button>
        </div>
      </aside>
    </div>
  )
}

function DeityDisplay({ deityId, hero }) {
  const deity = DEITIES[deityId]
  if (!deity) return null

  return (
    <div className="p-3 rounded border" style={{ background: '#0f0a18', borderColor: '#3a2848' }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: '1.2rem' }}>{deity.sigil}</span>
        <div>
          <p style={{ fontFamily: 'Cinzel, serif', color: '#c084fc', fontSize: '0.9rem' }}>{deity.name}</p>
          <p style={{ color: '#6a5a7a', fontSize: '0.75rem' }}>{deity.title}</p>
        </div>
        <span
          className="ml-auto px-2 py-0.5 rounded text-xs"
          style={{
            background: deity.alignment === 'chaotic' ? '#1a0808' : '#080f08',
            color: deity.alignment === 'chaotic' ? '#c04040' : '#40c080',
            border: `1px solid ${deity.alignment === 'chaotic' ? '#5a1818' : '#185a18'}`,
            fontFamily: 'Cinzel, serif',
          }}
        >
          {deity.alignment}
        </span>
      </div>
      {hero.deityBlessing && (
        <p style={{ color: '#8060b0', fontSize: '0.78rem', fontStyle: 'italic' }}>
          ✦ {hero.deityBlessing.description}
        </p>
      )}
      {hero.divineSkill && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: '#2a1a3a' }}>
          <p style={{ color: '#6a5a7a', fontSize: '0.72rem', fontFamily: 'Cinzel, serif', marginBottom: '0.25rem' }}>
            DIVINE SKILL
          </p>
          <SkillRow skill={hero.divineSkill} isDivine />
        </div>
      )}
    </div>
  )
}

function SkillRow({ skill, isDivine = false, onUnequip }) {
  const template = SKILLS[skill.skillId]
  if (!template) return null

  const xpNeeded = skill.level === 1 ? 20 : 50
  const xpPct = Math.min(1, (skill.xp ?? 0) / xpNeeded)

  return (
    <div
      className="flex items-center gap-3 p-2 rounded"
      style={{
        background: isDivine ? '#0f0818' : '#0f0c08',
        border: `1px solid ${isDivine ? '#3a2048' : '#1a1410'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p style={{ fontFamily: 'Cinzel, serif', color: isDivine ? '#c084fc' : '#d4af70', fontSize: '0.85rem' }}>
            {template.name}
          </p>
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: template.type === 'active' ? '#1a0f08' : '#080f0a',
              color: template.type === 'active' ? '#c08040' : '#40c080',
            }}
          >
            {template.type}
          </span>
          <span style={{ color: '#d4af70', fontSize: '0.75rem', marginLeft: 'auto' }}>
            Lv {skill.level}/3
          </span>
        </div>
        <p style={{ color: '#6a5a4a', fontSize: '0.73rem', marginTop: '0.15rem' }}>
          {template.description}
        </p>
        {template.cost.mana > 0 && (
          <span style={{ color: '#3060c0', fontSize: '0.7rem', marginRight: '0.5rem' }}>
            {template.cost.mana} MP
          </span>
        )}
        {template.cost.hp > 0 && (
          <span style={{ color: '#c04040', fontSize: '0.7rem', marginRight: '0.5rem' }}>
            {template.cost.hp} HP
          </span>
        )}
        {template.cooldown > 0 && (
          <span style={{ color: '#6a5a4a', fontSize: '0.7rem' }}>
            CD: {template.cooldown}t
          </span>
        )}
        {skill.level < 3 && (
          <div className="mt-1 w-full h-1 rounded overflow-hidden" style={{ background: '#1a1410' }}>
            <div
              className="h-full rounded"
              style={{ width: `${xpPct * 100}%`, background: isDivine ? '#8040c0' : '#d4af70' }}
            />
          </div>
        )}
      </div>
      {onUnequip && (
        <button
          onClick={onUnequip}
          title="Unequip"
          className="unequip-btn"
          style={{ fontSize: '0.78rem', flexShrink: 0 }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function StatRow({ label, value, color }) {
  const tooltip = STAT_TOOLTIPS[label]
  return (
    <div className="flex justify-between items-center p-2 rounded" style={{ background: '#0f0c08', border: '1px solid #1a1410' }}>
      <Tooltip content={tooltip}>
        <span
          style={{
            color: '#6a5a4a', fontSize: '0.8rem', fontFamily: 'Cinzel, serif',
            cursor: tooltip ? 'help' : 'default',
            borderBottom: tooltip ? '1px dotted #3a2818' : 'none',
          }}
        >
          {label}
        </span>
      </Tooltip>
      <span style={{ color, fontSize: '0.9rem', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function SideInfo({ label, value, color }) {
  return (
    <div>
      <p style={{ color: '#4a3a2a', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ color, fontSize: '0.9rem' }}>{value}</p>
    </div>
  )
}
