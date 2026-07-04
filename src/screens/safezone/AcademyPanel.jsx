import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { SKILLS } from '../../data/skills'
import { getAcademyCatalog, skillSellPrice, skillPremiumBuyPrice } from '../../data/academy'
import { Panel } from './Panel'
import MasterBoard from './MasterBoard'

// ── ACA01/ACA03 — Académie de magie : acheter / revendre des skills ───────────
export default function AcademyPanel({ onBack }) {
  const {
    hero,
    buySkill,
    buySkillAtLevel,
    sellSkill,
    unequipActiveSkill,
    unequipPassiveSkill,
  } = useGameStore()
  const catalog = getAcademyCatalog()
  const owned = hero.inventory.manaStones ?? []
  // ACA06 — achat d'un skill déjà monté (Lv2-5) à prix premium
  const [premSkill, setPremSkill] = useState(catalog[0]?.skillId)
  const [premLevel, setPremLevel] = useState(2)
  const premPrice = skillPremiumBuyPrice(premSkill, premLevel)
  const premAfford = premPrice != null && hero.inventory.gold >= premPrice
  const selStyle = {
    background: '#140e1a',
    color: '#b090e0',
    border: '1px solid #5a40b0',
    borderRadius: 6,
    padding: '4px 6px',
  }

  const rowStyle = (accent) => ({
    background: 'rgba(160,110,220,.10)',
    border: `1px solid ${accent}`,
    fontFamily: 'Cinzel, serif',
    borderRadius: 6,
  })

  return (
    <Panel title="📜 Academy of Magic" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '0.5rem',
          fontStyle: 'italic',
        }}
      >
        "Knowledge has a price, and a value. Learn a technique — or part with one you've outgrown."
      </p>
      <p style={{ color: 'var(--gold, #c0a060)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
        Gold: {hero.inventory.gold} 🪙
      </p>

      <div className="t-label" style={{ marginBottom: 4 }}>
        Learn a skill
      </div>
      <div className="flex flex-col gap-1.5" style={{ maxWidth: 460, marginBottom: '0.9rem' }}>
        {catalog.map(({ skillId, price, skill }) => {
          const afford = hero.inventory.gold >= price
          return (
            <button
              key={skillId}
              data-testid={`academy-buy-${skillId}`}
              onClick={() => buySkill(skillId)}
              disabled={!afford}
              className="text-left px-3 py-2 text-xs flex items-center justify-between"
              style={{
                ...rowStyle(afford ? '#5a40b0' : '#1a1620'),
                opacity: afford ? 1 : 0.55,
                cursor: afford ? 'pointer' : 'not-allowed',
              }}
            >
              <span>
                <span style={{ color: '#b090e0' }}>{skill.name}</span>{' '}
                <span style={{ color: '#6a5a7a', marginLeft: 6 }}>{skill.type}</span>
              </span>
              <span style={{ color: afford ? 'var(--gold, #c0a060)' : '#4a3a5a' }}>{price} 🪙</span>
            </button>
          )
        })}
      </div>

      {/* ACA06 — acheter un skill DÉJÀ MONTÉ (Lv2-5) à prix premium */}
      <div className="t-label" style={{ marginBottom: 4 }}>
        Buy a leveled skill (premium)
      </div>
      <div
        className="flex items-center gap-2 text-xs"
        style={{ maxWidth: 460, marginBottom: '0.9rem' }}
      >
        <select
          data-testid="aca06-skill"
          value={premSkill}
          onChange={(e) => setPremSkill(e.target.value)}
          style={selStyle}
        >
          {catalog.map(({ skillId, skill }) => (
            <option key={skillId} value={skillId}>
              {skill.name}
            </option>
          ))}
        </select>
        <select
          data-testid="aca06-level"
          value={premLevel}
          onChange={(e) => setPremLevel(Number(e.target.value))}
          style={selStyle}
        >
          {[2, 3, 4, 5].map((l) => (
            <option key={l} value={l}>
              Lv{l}
            </option>
          ))}
        </select>
        <button
          data-testid="aca06-buy"
          onClick={() => buySkillAtLevel(premSkill, premLevel)}
          disabled={!premAfford}
          className="px-3 py-2"
          style={{
            ...rowStyle(premAfford ? '#5a40b0' : '#1a1620'),
            cursor: premAfford ? 'pointer' : 'not-allowed',
            opacity: premAfford ? 1 : 0.55,
          }}
        >
          Buy{premPrice != null ? ` · ${premPrice} 🪙` : ''}
        </button>
      </div>

      <div className="t-label" style={{ marginBottom: 4 }}>
        Sell a skill (from your unequipped stones)
      </div>
      {owned.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.78rem', fontStyle: 'italic' }}>
          No unequipped skills to sell.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5" style={{ maxWidth: 460 }}>
          {owned.map((s, i) => {
            const skill = SKILLS[s.skillId]
            const price = skillSellPrice(s.skillId, s.level ?? 1)
            return (
              <button
                key={`${s.skillId}_${i}`}
                data-testid={`academy-sell-${s.skillId}`}
                onClick={() => sellSkill(s.skillId)}
                className="text-left px-3 py-2 text-xs flex items-center justify-between"
                style={{ ...rowStyle('#3a2818'), cursor: 'pointer' }}
              >
                <span style={{ color: 'var(--ink)' }}>
                  {skill?.name ?? s.skillId}{' '}
                  <span style={{ color: '#8a7a6a' }}>Lv{s.level ?? 1}</span>
                </span>
                <span style={{ color: 'var(--forest-deep, #4a8020)' }}>+{price} 🪙</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ACA02 — déséquiper un skill se fait UNIQUEMENT ici (à l'Académie). */}
      <div className="t-label" style={{ margin: '0.9rem 0 4px' }}>
        Unequip a skill <span style={{ color: '#8a7a6a', fontWeight: 400 }}>(only here)</span>
      </div>
      {hero.activeSkills.length + hero.passiveSkills.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.78rem', fontStyle: 'italic' }}>
          No equipped skills.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5" style={{ maxWidth: 460 }}>
          {hero.activeSkills.map((s, i) => (
            <button
              key={`uneq-a-${s.skillId}-${i}`}
              data-testid={`academy-unequip-${s.skillId}`}
              onClick={() => unequipActiveSkill(s.skillId)}
              className="text-left px-3 py-2 text-xs flex items-center justify-between"
              style={{ ...rowStyle('#3a2818'), cursor: 'pointer' }}
            >
              <span style={{ color: 'var(--ink)' }}>
                {SKILLS[s.skillId]?.name ?? s.skillId}{' '}
                <span style={{ color: '#8a7a6a' }}>active · Lv{s.level ?? 1}</span>
              </span>
              <span style={{ color: 'var(--amber-deep, #b07a30)' }}>Unequip ✕</span>
            </button>
          ))}
          {hero.passiveSkills.map((s, i) => (
            <button
              key={`uneq-p-${s.skillId}-${i}`}
              data-testid={`academy-unequip-${s.skillId}`}
              onClick={() => unequipPassiveSkill(s.skillId)}
              className="text-left px-3 py-2 text-xs flex items-center justify-between"
              style={{ ...rowStyle('#3a2818'), cursor: 'pointer' }}
            >
              <span style={{ color: 'var(--ink)' }}>
                {SKILLS[s.skillId]?.name ?? s.skillId}{' '}
                <span style={{ color: '#8a7a6a' }}>passive · Lv{s.level ?? 1}</span>
              </span>
              <span style={{ color: 'var(--amber-deep, #b07a30)' }}>Unequip ✕</span>
            </button>
          ))}
        </div>
      )}

      {/* ACA04 / MST04 / MST08 — Épreuves de maîtrise (maîtres fixes de la ville + itinérant
          de passage ce jour-là). Board partagé, cf. MasterBoard.jsx. */}
      <MasterBoard />
    </Panel>
  )
}
