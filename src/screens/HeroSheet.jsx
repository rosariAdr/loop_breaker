import { useGameStore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'
import { SKILLS } from '../data/skills'
import { DEITIES } from '../data/deities'
import { RARITY_CONFIG, calcEquippedStatBonuses, EQUIP_SLOTS as EQUIP_SLOT_KEYS } from '../data/equipment'
import { getActiveSetsSummary } from '../data/sets'
import { DEBUFFS } from '../data/debuffs'
import { TITLES, getTitleStatBuffs } from '../data/titles'
import { STAT_MILESTONES } from '../data/statMilestones'
import { hasGluttony, isGluttonyReady, gluttonyDaysRemaining } from '../engine/gluttony'
import { ArtSlot } from '../components/parchment'
import Tooltip from '../components/Tooltip'

const HERO_SPRITE = '/sprites/hero/idle/00.png'

// TITLE-BUF01 — résumé des buffs d'un titre pour le tooltip.
const buffText = (buffs) =>
  buffs && Object.keys(buffs).length
    ? ` · ${Object.entries(buffs)
        .map(([k, v]) => `+${v} ${k}`)
        .join(', ')}`
    : ''

// UX01 — Descriptions in-game des stats du héros
const STAT_TOOLTIPS = {
  HP: 'Points de vie. À 0 → mort + transmigration.',
  Mana: 'Énergie magique. Coût des skills actifs (réduit de 10% par niveau de skill).',
  Vigor:
    'Vigueur (Fatigue). −3/combat, −1/voyage, −3/craft. Restaurée à 100 en dormant. Sous 70 → malus de stats croissant.',
  Aura: 'Aura — multiplicateur de dégâts permanent : +0,5% de dégâts par point. Se débloque en utilisant 15 skills en moins de 4 jours, puis +1 tous les 10 skills.',
  Concentration:
    "Concentration — qualité de craft (0-150). Chance d'un cran de rareté supérieur = X/150 ; 150 = +1 cran garanti. Gagnée en craftant.",
  Experience: 'Expérience accumulée. À expToNext atteint → level up (+stats, PV/Mana max).',
  Strength: "Augmente les dégâts d'attaque basique et des skills physiques. +1/level-up.",
  Agility: "Vitesse au tour de combat (ordre d'action). Augmente le %fuite.",
  Intelligence: 'Augmente les dégâts des skills magiques.',
  Chance: 'Augmente la fréquence et la qualité des drops de loot (skills, ressources).',
  Defense: 'Réduit les dégâts subis : dmg = max(1, atk - DEF/2).',
}

// SLOT01 — 9 slots portés (ordre d'affichage). Libellés lisibles pour l'UI.
const EQUIP_SLOTS = EQUIP_SLOT_KEYS
const SLOT_LABELS = {
  weapon: 'weapon',
  offhand: 'offhand',
  helmet: 'helmet',
  armor: 'armor',
  gloves: 'gloves',
  boots: 'boots',
  amulet: 'amulet',
  ring1: 'ring I',
  ring2: 'ring II',
}
const ATTR_DEFS = [
  { key: 'strength', label: 'Strength' },
  { key: 'agility', label: 'Agility' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'chance', label: 'Chance' },
  { key: 'def', label: 'Defense' },
]

export default function HeroSheet({ onClose }) {
  const { hero, meta, world, setScreen, unequipItem, setActiveTitle } = useGameStore()
  // ACA02 — équiper est libre partout, mais déséquiper un skill se fait UNIQUEMENT à
  // l'Académie de magie. Ailleurs, on donne un feedback clair au lieu de déséquiper.
  const blockSkillUnequip = () =>
    useToastStore.getState().addToast('Visit the Academy of Magic to unequip skills.', 'info')
  // TITLE-BUF01 — bonus affichés = équipement + buffs du titre actif.
  const equippedBonuses = { ...calcEquippedStatBonuses(hero.equipped ?? {}) }
  for (const [stat, bonus] of Object.entries(getTitleStatBuffs(meta?.activeTitle))) {
    equippedBonuses[stat] = (equippedBonuses[stat] ?? 0) + bonus
  }
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
            {meta?.activeTitle && TITLES[meta.activeTitle] && (
              <span className="hs-active-title" data-testid="active-title">
                {TITLES[meta.activeTitle].icon} {TITLES[meta.activeTitle].name}
              </span>
            )}
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
            {/* HSV2-01 — avatar en tête de colonne gauche (remonté au-dessus d'Allegiance) */}
            <div className="lb-slot hs-portrait art-slot" data-testid="hero-avatar">
              <img
                src={HERO_SPRITE}
                alt="Hero avatar"
                draggable={false}
                style={{
                  imageRendering: 'pixelated',
                  maxHeight: '88%',
                  maxWidth: '92%',
                  objectFit: 'contain',
                }}
              />
            </div>
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
            <div className="panel-block">
              <div className="pb-title">Equipment</div>
              <div className="equip-grid">
                {EQUIP_SLOTS.map((slot) => {
                  const item = hero.equipped?.[slot]
                  const rc = item ? RARITY_CONFIG[item.rarity] : null
                  // SLOT01 — l'offhand est verrouillée quand une arme 2 mains est portée.
                  const lockedByTwoHanded =
                    slot === 'offhand' && !item && hero.equipped?.weapon?.twoHanded
                  return (
                    <div className="equip-cell" key={slot}>
                      <span className="eq-label">{SLOT_LABELS[slot] ?? slot}</span>
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
                            {lockedByTwoHanded ? '🔒' : '—'}
                          </span>
                        )}
                      </div>
                      <span className={`eq-name ${item ? '' : 'empty'}`}>
                        {item
                          ? item.name
                          : lockedByTwoHanded
                            ? '— two-handed —'
                            : '— empty —'}
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
              {/* SET-UI01 — bonus de set actifs (pièces 2/3/4… + bonus appliqués) */}
              <SetBonusPanel equipped={hero.equipped ?? {}} />
            </div>

            {/* HS-CURR01 — « Currencies » (Gold / Tokens) ; carte « Run » retirée (info déjà en en-tête) */}
            <div className="panel-block">
              <div className="pb-title">Currencies</div>
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
              <button
                className="pbtn wide"
                style={{ marginTop: 6 }}
                onClick={() => setScreen('achievements')}
              >
                🏆 Achievements
              </button>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="hs-right flex-1 flex flex-col">
            {/* Vitals & Attributs */}
            <div className="panel-block">
              <div className="pb-title">Stats</div>
              {/* HS-VITALS01 — vraies barres HP/Mana/Vigor/Exp (+ valeur). HS-AURA01 — Aura &
                  Concentration TOUJOURS visibles, floutées + 🔒 tant qu'elles sont verrouillées. */}
              <div className="hs-vitals" style={{ marginBottom: 20 }}>
                <VitalBar
                  label="HP"
                  tip={STAT_TOOLTIPS.HP}
                  color="var(--danger)"
                  cur={hero.stats.hp}
                  max={hero.stats.maxHp}
                />
                <VitalBar
                  label="Mana"
                  tip={STAT_TOOLTIPS.Mana}
                  color="#2f7fb8"
                  cur={hero.stats.mana}
                  max={hero.stats.maxMana}
                />
                <VitalBar
                  label="Vigor"
                  tip={STAT_TOOLTIPS.Vigor}
                  color={
                    (hero.vigor ?? 100) >= 70
                      ? '#4a8020'
                      : (hero.vigor ?? 100) >= 30
                        ? '#b07a30'
                        : 'var(--danger)'
                  }
                  cur={hero.vigor ?? 100}
                  max={100}
                />
                <VitalBar
                  label="Experience"
                  tip={STAT_TOOLTIPS.Experience}
                  color="var(--gold)"
                  cur={hero.exp}
                  max={hero.expToNext}
                />
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
                        <i style={{ width: `${Math.min(100, ((total % 35) / 35) * 100)}%` }} />
                      </span>
                      {/* HSV2-04 — repères tous les 35 pts (paliers franchis = « on ») */}
                      <span className="ar-ticks">
                        {Array.from({ length: Math.floor(total / 35) }).map((_, i) => (
                          <span
                            key={i}
                            className="ar-tick on"
                            data-testid="stat-milestone"
                            title={`Palier ${(i + 1) * 35} — ${STAT_MILESTONES[key]?.label ?? ''}`}
                          />
                        ))}
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
              {/* HSV2-03 — Aura & Concentration au bas du bloc attributs (masquées si verrouillées) */}
              <div className="hs-vitals" style={{ marginTop: 16 }}>
                <VitalBar
                  label="Aura"
                  tip={STAT_TOOLTIPS.Aura}
                  color="#c084fc"
                  cur={hero.aura ?? 0}
                  max={20}
                  locked={(hero.aura ?? 0) <= 0}
                  display={`${hero.aura ?? 0} (+${((hero.aura ?? 0) * 0.5).toFixed(1)}% dmg)`}
                />
                <VitalBar
                  label="Concentration"
                  tip={STAT_TOOLTIPS.Concentration}
                  color="#60a0d0"
                  cur={hero.concentration ?? 0}
                  max={150}
                  locked={(hero.concentration ?? 0) <= 0}
                />
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
                <div className="skill-grid">
                  {hero.activeSkills.map((s) => (
                    <SkillRow key={s.skillId} skill={s} onUnequip={blockSkillUnequip} compact />
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
                <div className="skill-grid">
                  {hero.passiveSkills.map((s) => (
                    <SkillRow key={s.skillId} skill={s} onUnequip={blockSkillUnequip} compact />
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

            {/* M01 — Titres permanents */}
            {(earnedTitles.length > 0 || hero.titles.length > 0) && (
              <div className="panel-block">
                <div className="pb-title">Titles</div>
                <div className="hs-titles" data-testid="permanent-titles">
                  {earnedTitles.map((t) => {
                    const active = meta?.activeTitle === t.id
                    return (
                      <Tooltip key={t.id} content={`${t.description}${buffText(t.statBuffs)}`}>
                        <button
                          className={`hs-title-chip ${active ? 'active' : ''}`}
                          data-testid={`title-chip-${t.id}`}
                          onClick={() => setActiveTitle(active ? null : t.id)}
                        >
                          <span>{t.icon}</span> {t.name}
                          {active ? ' ✓' : ''}
                        </button>
                      </Tooltip>
                    )
                  })}
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

// HS-VITALS01 / HS-AURA01 — barre de vitale : libellé + jauge colorée + valeur.
// `locked` (Aura/Concentration non débloquées) → jauge floutée + 🔒 (pattern S02) ; le
// libellé reste net avec son tooltip explicatif.
function VitalBar({ label, cur, max, color, tip, locked = false, display }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (cur / max) * 100)) : 0
  // HSV2-03 — verrouillé : nom masqué (« ??? ») + pas de tooltip (masquage complet).
  const labelEl = <span className="hvb-label">{locked ? '???' : label}</span>
  return (
    <div
      className={`hvb ${locked ? 'hvb-locked' : ''}`}
      data-testid={`vital-${label.toLowerCase()}`}
    >
      {tip && !locked ? <Tooltip content={tip}>{labelEl}</Tooltip> : labelEl}
      <span className="hvb-bar">
        <i style={{ width: `${locked ? 100 : pct}%`, background: color }} />
      </span>
      <span className="hvb-val">{locked ? '🔒' : (display ?? `${cur}/${max}`)}</span>
    </div>
  )
}

// SET-UI01 — Panneau des bonus de set actifs : pour chaque set dont ≥1 pièce est portée,
// affiche le nombre de pièces (x/total) et, si ≥2 pièces, les bonus de stat appliqués.
function SetBonusPanel({ equipped }) {
  const sets = getActiveSetsSummary(equipped)
  if (sets.length === 0) return null
  return (
    <div className="hs-setbonus" data-testid="set-bonuses" style={{ marginTop: 10 }}>
      {sets.map((s) => {
        const bonusText = Object.entries(s.bonuses)
          .map(([stat, val]) => `+${val} ${stat}`)
          .join(' · ')
        return (
          <div
            key={s.id}
            className="hs-set-row"
            data-testid={`set-${s.id}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '4px 0',
              borderTop: '1px dashed var(--parchment-shadow)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 12,
                  color: s.active ? 'var(--forest-deep)' : 'var(--ink-soft)',
                }}
              >
                {s.name}
              </span>
              <span
                data-testid={`set-count-${s.id}`}
                style={{ fontSize: 11, color: 'var(--ink-soft)' }}
              >
                {s.count}/{s.total}
              </span>
            </div>
            {s.active && bonusText && (
              <span
                data-testid={`set-bonus-${s.id}`}
                style={{ fontSize: 11, color: 'var(--forest-deep)' }}
              >
                ✦ {bonusText}
              </span>
            )}
          </div>
        )
      })}
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

function SkillRow({ skill, isDivine = false, onUnequip, compact = false }) {
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
        {!compact && <div className="sk-desc">{template.description}</div>}
        <div className="sk-meta">
          {template.cost.mana > 0 && (
            <span style={{ color: '#2f7fb8' }}>{template.cost.mana} MP</span>
          )}
          {template.cost.hp > 0 && (
            <span style={{ color: 'var(--danger)' }}>{template.cost.hp} HP</span>
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
