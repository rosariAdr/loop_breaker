// ── B08 — Stat de combat (résumé) ────────────────────────────────────────────
function CombatStat({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      <div className="flex flex-col items-start leading-tight">
        <span
          style={{
            color: '#5a4a3a',
            fontSize: '0.58rem',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>
      </div>
    </div>
  )
}

// ── Résultat — pleine largeur, dramatique ─────────────────────────────────────
export default function ResultPanel({ result, loot, combatStats, onLeave }) {
  const isVictory = result === 'victory'
  const isFled = result === 'fled'

  const colors = isVictory
    ? {
        bg: '#071508',
        border: '#2a5018',
        bannerBg: 'linear-gradient(90deg, #091c08, #0f2810, #091c08)',
        bannerBorder: '#2a5018',
        text: '#80e040',
        icon: '⚔️',
        label: 'Victory!',
      }
    : isFled
      ? {
          bg: '#080f08',
          border: '#1c3020',
          bannerBg: 'linear-gradient(90deg, #080f08, #0c1808, #080f08)',
          bannerBorder: '#1c3020',
          text: '#60a060',
          icon: '🏃',
          label: 'Escaped!',
        }
      : {
          bg: '#150808',
          border: '#602020',
          bannerBg: 'linear-gradient(90deg, #1a0808, #220a0a, #1a0808)',
          bannerBorder: '#602020',
          text: '#e04040',
          icon: '💀',
          label: 'Defeated...',
        }

  return (
    <div
      className="mx-4 mb-2 rounded-xl overflow-hidden anim-pop"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {/* Banner — pleine largeur */}
      <div
        className="px-8 py-4 flex items-center justify-center gap-4"
        style={{
          background: colors.bannerBg,
          borderBottom: `1px solid ${colors.bannerBorder}`,
        }}
      >
        <span style={{ fontSize: '2rem' }}>{colors.icon}</span>
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.4rem',
            letterSpacing: '0.1em',
            color: colors.text,
            textShadow: `0 0 20px ${colors.text}60`,
          }}
        >
          {colors.label}
        </p>
        <span style={{ fontSize: '2rem' }}>{colors.icon}</span>
      </div>

      {/* Loot */}
      {loot.length > 0 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 justify-center">
          {loot.map((item, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{
                background:
                  item.type === 'skill'
                    ? '#1a0f28'
                    : item.type === 'gold'
                      ? '#1c1408'
                      : item.type === 'xp'
                        ? '#08182a'
                        : '#0f1808',
                color:
                  item.type === 'skill'
                    ? '#c084fc'
                    : item.type === 'gold'
                      ? '#d4af70'
                      : item.type === 'xp'
                        ? '#60d0ff'
                        : '#80c040',
                border: `1px solid ${item.type === 'skill' ? '#4030a8' : item.type === 'gold' ? '#5a4010' : item.type === 'xp' ? '#1060b0' : '#304820'}`,
                fontFamily: 'Cinzel, serif',
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
      )}

      {/* B08 — Stats de combat */}
      {combatStats && isVictory && (
        <div
          className="px-6 py-2 flex justify-center gap-5"
          style={{ borderTop: `1px solid ${colors.bannerBorder}40` }}
        >
          <CombatStat icon="⚔️" label="Dealt" value={combatStats.dmgDealt} color="#d4af70" />
          <CombatStat icon="💥" label="Taken" value={combatStats.dmgTaken} color="#c06060" />
          <CombatStat icon="✨" label="Mana" value={combatStats.manaSpent} color="#60a0f0" />
          <CombatStat icon="💀" label="Kills" value={combatStats.kills} color="#a080c0" />
        </div>
      )}

      <div className="px-6 pb-5 flex justify-center">
        <button
          onClick={onLeave}
          className="px-8 py-2.5 rounded-lg text-sm transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: '#1a1410',
            color: '#d4af70',
            border: '1px solid #3a2818',
            letterSpacing: '0.05em',
          }}
        >
          ← Continue
        </button>
      </div>
    </div>
  )
}
