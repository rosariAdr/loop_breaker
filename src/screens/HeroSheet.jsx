import { useGameStore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'
import { SKILLS } from '../data/skills'
import { DEITIES } from '../data/deities'
import { RARITY_CONFIG, calcEquippedStatBonuses } from '../data/equipment'
import { DEBUFFS } from '../data/debuffs'
import { TITLES } from '../data/titles'
import { hasGluttony, isGluttonyReady, gluttonyDaysRemaining } from '../engine/gluttony'
import { ArtSlot } from '../components/parchment'
import Tooltip from '../components/Tooltip'

const HERO_SPRITE = '/sprites/hero/idle/00.png'

// UX01 — Descriptions in-game des stats du héros
const STAT_TOOLTIPS = {
  HP: 'Points de vie. À 0 → mort + transmigration.',
  Mana: 'Énergie magique. Coût des skills actifs (réduit de 10% par niveau de skill).',
  Vigor:
    'Vigueur (Fatigue). −3/combat, −1/voyage, −3/craft. Restaurée à 100 en dormant. Sous 70 → malus de stats croissant.',
  Aura: 'Aura — multiplicateur de dégâts permanent : +0,5% de dégâts par point. Se débloque en utilisant 15 skills en moins de 4 jours, puis +1 tous les 10 skills.',
  Concentration:
    "Concentration — qualité de craft (0-150). Chance d'un cran de rareté supérieur = X/150 ; 150 = +1 cran garanti. Gagnée en craftant.",
  Strength: "Augmente les dégâts d'attaque basique et des skills physiques. +1/level-up.",
  Agility: "Vitesse au tour de combat (ordre d'action). Augmente le %fuite.",
  Intelligence: 'Augmente les dégâts des skills magiques.',
  Chance: 'Augmente la fréquence et la qualité des drops de loot (skills, ressources).',
  Defense: 'Réduit les dégâts subis : dmg = max(1, atk - DEF/2).',
}

const EQUIP_SLOTS = ['weapon', 'helmet', 'armor', 'boots']
const ATTR_DEFS = [
  { key: 'strength', label: 'Strength' },
  { key: 'agility', label: 'Agility' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'chance', label: 'Chance' },
  { key: 'def', label: 'Defense' },
]

export default function HeroSheet({ onClose }) {
  const { hero, meta, world, setScreen, unequipItem } = useGameStore()
  // ACA02 — équiper est libre partout, mais déséquiper un skill se fait UNIQUEMENT à
  // l'Académie de magie. Ailleurs, on donne un feedback clair au lieu de déséquiper.
  const blockSkillUnequip = () =>
    useToastStore.getState().addToast('Visit the Academy of Magic to unequip skills.', 'info')
  const equippedBonuses = calcEquippedStatBonuses(hero.equipped ?? {})
  const earnedTitles = (meta?.titlesEarned ?? []).map((id) => TITLES[id]).filter(Boolean) // M01
  // GLT03 — statut Gluttony
  const gluttonyEquipped = hasGluttony(hero.passiveSkills ?? [])
  const gluttonyReady = isGluttonyReady(world?.dayCount ?? 0, meta?.gluttonyLastUsed)
  const gluttonyDays = gluttonyDaysRemaining(world?.dayCount ?? 0, meta?.gluttonyLastUsed)

  const back = onClose ?? (() => setScreen('world_map'))

  return (
    <div className="sheet-scrim" onClick={back}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div className="sheet-hd">
          <div className="sh-title">
            {hero.name}
            <span className="sh-meta">
              Wanderer · Run #{hero.runNumber} · Level {hero.level} · {hero.deathCount} deaths
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="back-btn" style={{ position: 'static' }} onClick={back}>
              ← Map
            </button>
            <div className="sheet-x" onClick={back}>
              ✕
            </div>
          </div>
        </div>

        {/* Corps : portrait+équipement | vitals+skills */}
        <div className="sheet-body" style={{ overflowY: 'auto' }}>
          {/* Colonne gauche */}
          <div className="hs-left">
            <div className="lb-slot hs-portrait art-slot">
              <img
                src={HERO_SPRITE}
                alt=""
                draggable={false}
                style={{ imageRendering: 'pixelated', height: '88%', objectFit: 'contain' }}
              />
            </div>

            <div className="panel-block">
              <div className="pb-title">Equipment</div>
              <div className="equip-grid">
                {EQUIP_SLOTS.map((slot) => {
                  const item = hero.equipped?.[slot]
                  const rc = item ? RARITY_CONFIG[item.rarity] : null
                  return (
                    <div className="equip-cell" key={slot}>
                      <span className="eq-label">{slot}</span>
                      <div
                        className="eq-slot art-slot"
                        style={
                          rc
                            ? { borderColor: rc.color, boxShadow: `inset 0 0 0 1px ${rc.color}` }
                            : undefined
                        }
                      >
                        {item ? (
                          <span className="as-cap" style={{ color: rc?.color, fontSize: 10 }}>
                            {item.name}
                          </span>
                        ) : (
                          <span className="as-cap" style={{ fontSize: 10 }}>
                            —
                          </span>
                        )}
                      </div>
                      <span className={`eq-name ${item ? '' : 'empty'}`}>
                        {item ? item.name : '— empty —'}
                        {item && (
                          <button
                            className="hs-unequip"
                            onClick={() => unequipItem(slot)}
                            title="Unequip"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Provisions (Gold / Tokens / Run) + accès Inventory */}
            <div className="panel-block">
              <div className="pb-title">Provisions</div>
              <div className="derived" style={{ marginBottom: 12 }}>
                <div className="dv">
                  <div className="dv-num" style={{ color: 'var(--gold)' }}>
                    {hero.inventory.gold}
                  </div>
                  <div className="dv-lbl">Gold</div>
                </div>
                <div className="dv">
                  <div className="dv-num" style={{ color: '#7a3fb0' }}>
                    {hero.reputationTokens}
                  </div>
                  <div className="dv-lbl">Tokens</div>
                </div>
                <div className="dv">
                  <div className="dv-num">#{hero.runNumber}</div>
                  <div className="dv-lbl">Run</div>
                </div>
              </div>
              <button className="pbtn wide" onClick={() => setScreen('inventory')}>
                🎒 Inventory
              </button>
              <button
                className="pbtn wide"
                style={{ marginTop: 6 }}
                onClick={() => setScreen('codex')}
              >
                📖 Bestiary
              </button>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="hs-right flex-1 flex flex-col">
            {/* Vitals & Attributs */}
            <div className="panel-block">
              <div className="pb-title">Stats</div>
              <div className="derived" style={{ marginBottom: 20 }}>
                <Vital
                  label="HP"
                  tip={STAT_TOOLTIPS.HP}
                  color="var(--danger)"
                  value={`${hero.stats.hp}/${hero.stats.maxHp}`}
                />
                <Vital
                  label="Mana"
                  tip={STAT_TOOLTIPS.Mana}
                  color="#2f7fb8"
                  value={`${hero.stats.mana}/${hero.stats.maxMana}`}
                />
                {/* STA01 — Vigueur (Fatigue) */}
                <Vital
                  label="Vigor"
                  tip={STAT_TOOLTIPS.Vigor}
                  color={
                    (hero.vigor ?? 100) >= 70
                      ? '#4a8020'
                      : (hero.vigor ?? 100) >= 30
                        ? '#b07a30'
                        : 'var(--danger)'
                  }
                  value={`${hero.vigor ?? 100}/100`}
                />
                {/* STA02 — Aura (mult. de dégâts) ; affichée une fois débloquée */}
                {(hero.aura ?? 0) > 0 && (
                  <Vital
                    label="Aura"
                    tip={STAT_TOOLTIPS.Aura}
                    color="#c084fc"
                    value={`${hero.aura} (+${(hero.aura * 0.5).toFixed(1)}% dmg)`}
                  />
                )}
                {/* STA03 — Concentration (qualité de craft) */}
                {(hero.concentration ?? 0) > 0 && (
                  <Vital
                    label="Concentration"
                    tip={STAT_TOOLTIPS.Concentration}
                    color="#60a0d0"
                    value={`${hero.concentration}/150`}
                  />
                )}
                <Vital label="Experience" value={`${hero.exp}/${hero.expToNext}`} />
              </div>
              <div className="attr-grid">
                {ATTR_DEFS.map(({ key, label }) => {
                  const base = hero.stats[key] ?? 0
                  const bonus = equippedBonuses[key] ?? 0
                  const total = base + bonus
                  return (
                    <div className="attr-row" key={key}>
                      <Tooltip content={STAT_TOOLTIPS[label]}>
                        <span className="ar-name" style={{ cursor: 'help' }}>
                          {label}
                        </span>
                      </Tooltip>
                      <span className="ar-bar">
                        <i style={{ width: `${Math.min(100, (total / 25) * 100)}%` }} />
                      </span>
                      <span className="ar-val">
                        {total}
                        {bonus ? (
                          <span style={{ color: 'var(--forest-deep)', fontSize: 11 }}>
                            {' '}
                            (+{bonus})
                          </span>
                        ) : null}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CRF05 — Debuffs actifs */}
            {(hero.activeDebuffs?.length ?? 0) > 0 && (
              <div className="panel-block">
                <div className="pb-title">Active Debuffs</div>
                <div className="skill-list" data-testid="active-debuffs">
                  {hero.activeDebuffs.map((d, i) => {
                    const def = DEBUFFS[d.debuffId]
                    if (!def) return null
                    return (
                      <div
                        className="skill"
                        key={`${d.debuffId}_${i}`}
                        style={{ borderColor: d.permanent ? 'rgba(192,57,43,.6)' : undefined }}
                      >
                        <div className="sk-ico" style={{ background: 'var(--danger)' }}>
                          {def.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="sk-name">
                            {def.name}
                            <span
                              style={{
                                color: 'var(--ink-soft)',
                                fontWeight: 400,
                                fontSize: 12,
                                marginLeft: 8,
                              }}
                            >
                              −{Math.round(def.reduction * 100)}% {def.stat}
                            </span>
                          </div>
                          <div className="sk-desc">{def.description}</div>
                        </div>
                        <span
                          className="hs-pill"
                          style={{
                            color: d.permanent ? 'var(--danger)' : 'var(--amber-deep)',
                            borderColor: d.permanent
                              ? 'rgba(192,57,43,.5)'
                              : 'var(--parchment-shadow)',
                          }}
                        >
                          {d.permanent ? 'Cure needed' : `${d.duration?.remaining}d left`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Active Skills */}
            <div className="panel-block">
              <div className="pb-title">Active Skills ({hero.activeSkills.length}/6)</div>
              {hero.activeSkills.length === 0 ? (
                <p className="hs-muted">No active skills equipped. Equip from Inventory.</p>
              ) : (
                <div className="skill-list">
                  {hero.activeSkills.map((s) => (
                    <SkillRow key={s.skillId} skill={s} onUnequip={blockSkillUnequip} />
                  ))}
                </div>
              )}
            </div>

            {/* Passive Skills */}
            <div className="panel-block">
              <div className="pb-title">Passive Skills ({hero.passiveSkills.length}/4)</div>
              {hero.passiveSkills.length === 0 ? (
                <p className="hs-muted">No passive skills equipped.</p>
              ) : (
                <div className="skill-list">
                  {hero.passiveSkills.map((s) => (
                    <SkillRow key={s.skillId} skill={s} onUnequip={blockSkillUnequip} />
                  ))}
                </div>
              )}
            </div>

            {/* GLT03 — Gluttony */}
            {gluttonyEquipped && (
              <div className="panel-block">
                <div className="pb-title">Gluttony</div>
                <div className="skill" data-testid="gluttony-status">
                  <div className="sk-ico" style={{ background: '#7a3fb0' }}>
                    👹
                  </div>
                  <div className="sk-name" style={{ flex: 1 }}>
                    Gluttony
                  </div>
                  <span
                    className="hs-pill"
                    style={{ color: gluttonyReady ? 'var(--forest-deep)' : 'var(--amber-deep)' }}
                  >
                    {gluttonyReady ? 'Ready' : `${gluttonyDays}d remaining`}
                  </span>
                </div>
              </div>
            )}

            {/* Allégeance */}
            <div className="panel-block">
              <div className="pb-title">Allegiance</div>
              {hero.deity ? (
                <DeityDisplay deityId={hero.deity} hero={hero} />
              ) : (
                <div className="faith-row">
                  <div className="fr">
                    <div className="fr-k">Deity</div>
                    <div className="fr-v muted">No deity chosen</div>
                  </div>
                  <div className="fr">
                    <div className="fr-k">Demon Lord</div>
                    <div className="fr-v danger" style={{ color: 'var(--danger)' }}>
                      ⚡ Malachar the Undying
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* M01 — Titres permanents */}
            {(earnedTitles.length > 0 || hero.titles.length > 0) && (
              <div className="panel-block">
                <div className="pb-title">Titles</div>
                <div className="hs-titles" data-testid="permanent-titles">
                  {earnedTitles.map((t) => (
                    <Tooltip key={t.id} content={t.description}>
                      <span className="hs-title-chip" style={{ cursor: 'help' }}>
                        <span>{t.icon}</span> {t.name}
                      </span>
                    </Tooltip>
                  ))}
                  {hero.titles.map((t) => (
                    <span key={t} className="hs-title-chip legacy">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Vital({ label, value, color, tip }) {
  const num = (
    <div className="dv-num" style={color ? { color } : undefined}>
      {value}
    </div>
  )
  return (
    <div className="dv">
      {tip ? <Tooltip content={tip}>{num}</Tooltip> : num}
      <div className="dv-lbl">{label}</div>
    </div>
  )
}

function DeityDisplay({ deityId, hero }) {
  const deity = DEITIES[deityId]
  if (!deity) return null
  return (
    <>
      <div className="faith-row" style={{ marginBottom: hero.deityBlessing ? 12 : 0 }}>
        <div className="fr">
          <div className="fr-k">Deity</div>
          <div className="fr-v" style={{ color: '#7a3fb0' }}>
            {deity.sigil} {deity.name}{' '}
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>· {deity.title}</span>
          </div>
        </div>
        <div className="fr">
          <div className="fr-k">Demon Lord</div>
          <div className="fr-v danger" style={{ color: 'var(--danger)' }}>
            ⚡ Malachar the Undying
          </div>
        </div>
      </div>
      {hero.deityBlessing && (
        <p className="hs-muted" style={{ fontStyle: 'italic' }}>
          ✦ {hero.deityBlessing.description}
        </p>
      )}
      {hero.divineSkill && (
        <div style={{ marginTop: 10 }}>
          <SkillRow skill={hero.divineSkill} isDivine />
        </div>
      )}
    </>
  )
}

function SkillRow({ skill, isDivine = false, onUnequip }) {
  const template = SKILLS[skill.skillId]
  if (!template) return null
  const xpNeeded = skill.level === 1 ? 20 : 50
  const xpPct = Math.min(1, (skill.xp ?? 0) / xpNeeded)
  const ico = isDivine ? '✦' : template.type === 'active' ? '⚔' : '🛡'

  return (
    <div className="skill">
      <div
        className="sk-ico"
        style={{
          background: isDivine
            ? '#7a3fb0'
            : template.type === 'active'
              ? 'var(--amber-deep)'
              : 'var(--forest)',
        }}
      >
        {ico}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sk-name">
          {template.name}
          <span
            className="hs-tag"
            style={{
              color: template.type === 'active' ? 'var(--amber-deep)' : 'var(--forest-deep)',
            }}
          >
            {template.type}
          </span>
          <span
            style={{ marginLeft: 'auto', color: 'var(--ink-soft)', fontSize: 12, fontWeight: 400 }}
          >
            Lv {skill.level}/3
          </span>
        </div>
        <div className="sk-desc">{template.description}</div>
        <div className="sk-meta">
          {template.cost.mana > 0 && (
            <span style={{ color: '#2f7fb8' }}>{template.cost.mana} MP</span>
          )}
          {template.cost.hp > 0 && (
            <span style={{ color: 'var(--danger)' }}>{template.cost.hp} HP</span>
          )}
          {template.cooldown > 0 && (
            <span style={{ color: 'var(--ink-soft)' }}>CD {template.cooldown}t</span>
          )}
        </div>
        {skill.level < 3 && (
          <div className="sk-xp">
            <i
              style={{ width: `${xpPct * 100}%`, background: isDivine ? '#7a3fb0' : 'var(--gold)' }}
            />
          </div>
        )}
      </div>
      {onUnequip && (
        <button className="hs-unequip" onClick={onUnequip} title="Unequip">
          ✕
        </button>
      )}
    </div>
  )
}
