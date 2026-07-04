import { SKILLS } from '../../data/skills'
import { RESOURCES } from '../../data/resources'
import { canUseSkill, getScaledSkillCost, getStatSacrifice } from '../../engine/combat'

// ── Panneau d'actions ─────────────────────────────────────────────────────────
export default function ActionPanel({
  selectedAction,
  onSelectAction,
  onAttack,
  onFlee,
  heroSkills,
  heroStats,
  onUseSkill,
  consumables,
  onUseItem,
  isBoss,
  isAnimating,
}) {
  const tabs = [
    { id: 'attack', icon: '⚔️', label: 'Attack' },
    { id: 'skills', icon: '✨', label: 'Skills' },
    { id: 'items', icon: '🧪', label: 'Items' },
    { id: 'flee', icon: '🏃', label: 'Flee', disabled: isBoss },
  ]

  return (
    <div
      className="mx-4 mb-2 rounded-xl overflow-hidden"
      style={{ background: '#080608', border: '1px solid #2a1818' }}
    >
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#2a1818' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onSelectAction(tab.id)}
            disabled={tab.disabled}
            // B11 — tooltip explicite quand Flee est désactivé sur un boss
            title={tab.disabled && tab.id === 'flee' ? 'Cannot flee from a boss' : undefined}
            className="flex-1 py-3 flex items-center justify-center gap-2 transition-colors"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.82rem',
              background: selectedAction === tab.id ? '#160e0a' : 'transparent',
              color: tab.disabled ? '#2a2018' : selectedAction === tab.id ? '#d4af70' : '#6a5a4a',
              borderBottom:
                selectedAction === tab.id ? '2px solid #d4af70' : '2px solid transparent',
              letterSpacing: '0.05em',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-5" style={{ minHeight: '80px' }}>
        {selectedAction === 'attack' && (
          <button
            onClick={onAttack}
            disabled={isAnimating}
            className="px-10 py-3 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.95rem',
              background: isAnimating ? '#100c08' : '#1c1208',
              color: isAnimating ? '#4a3a2a' : '#d4af70',
              border: `1px solid ${isAnimating ? '#2a2018' : '#5a3820'}`,
              letterSpacing: '0.07em',
            }}
          >
            ⚔️ Basic Attack
          </button>
        )}

        {selectedAction === 'skills' && (
          <div className="flex flex-wrap gap-3">
            {heroSkills.length === 0 && (
              <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
                No active skills equipped.
              </p>
            )}
            {heroSkills.map((skill) => {
              const template = SKILLS[skill.skillId]
              if (!template || template.type !== 'active') return null
              const usable = canUseSkill(skill, heroStats) && !isAnimating
              const onCD = skill.currentCooldown > 0
              // S07 — coût scalé au niveau (lecture des stats affichées)
              const scaledCost = getScaledSkillCost(template, skill.level)
              const sacrifice = getStatSacrifice(template) // B10
              return (
                <button
                  key={skill.skillId}
                  onClick={() => onUseSkill(skill)}
                  disabled={!usable}
                  className="relative px-4 py-2.5 rounded-lg text-left transition-all hover:opacity-90 overflow-hidden"
                  style={{
                    background: onCD ? '#0a0808' : usable ? '#100a1c' : '#0a0808',
                    color: onCD ? '#3a2848' : usable ? '#c084fc' : '#3a2848',
                    border: `1px solid ${onCD ? '#1c1428' : usable ? '#5a40b0' : '#1c1428'}`,
                    cursor: usable ? 'pointer' : 'not-allowed',
                    minWidth: '140px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.88rem',
                      marginBottom: '3px',
                    }}
                  >
                    {template.name}
                  </p>
                  <p style={{ color: usable ? '#7060a8' : '#2a1838', fontSize: '0.72rem' }}>
                    Lv{skill.level}
                    {scaledCost.mana > 0 && ` · ${scaledCost.mana}MP`}
                    {scaledCost.hp > 0 && ` · ${scaledCost.hp}HP`}
                    {/* B10 — sacrifice de stat */}
                    {sacrifice && (
                      <span style={{ color: '#e08040' }}>
                        {` · −${sacrifice.amount} ${sacrifice.stat.slice(0, 3).toUpperCase()}`}
                      </span>
                    )}
                  </p>
                  {/* S05 — Cooldown overlay : grand compteur centré */}
                  {onCD && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        background: 'rgba(8, 6, 12, 0.78)',
                        backdropFilter: 'grayscale(0.7)',
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '1.6rem',
                            fontWeight: 700,
                            color: '#806080',
                            textShadow: '0 0 6px rgba(128,96,128,0.4)',
                            lineHeight: 1,
                          }}
                        >
                          {skill.currentCooldown}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '0.55rem',
                            color: '#5a4868',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {skill.currentCooldown === 1 ? 'turn' : 'turns'}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {selectedAction === 'items' && (
          <div className="flex flex-wrap gap-3">
            {consumables.length === 0 && (
              <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
                No consumables in bag.
              </p>
            )}
            {consumables.map(([id, qty]) => {
              const res = RESOURCES[id]
              if (!res) return null
              return (
                <button
                  key={id}
                  onClick={() => onUseItem(id)}
                  disabled={isAnimating}
                  className="px-4 py-2.5 rounded-lg text-left transition-all hover:opacity-90"
                  style={{
                    background: '#0e1a08',
                    color: '#80c040',
                    border: '1px solid #3a5828',
                    minWidth: '140px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.88rem',
                      marginBottom: '3px',
                    }}
                  >
                    {res.name}
                  </p>
                  <p style={{ color: '#507040', fontSize: '0.72rem' }}>×{qty}</p>
                </button>
              )
            })}
          </div>
        )}

        {selectedAction === 'flee' && !isBoss && (
          <button
            onClick={onFlee}
            disabled={isAnimating}
            className="px-10 py-3 rounded-lg transition-all hover:opacity-90"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.95rem',
              background: '#120808',
              color: '#c06040',
              border: '1px solid #4a2818',
            }}
          >
            🏃 Attempt to flee (50%)
          </button>
        )}

        {selectedAction === 'flee' && isBoss && (
          <p style={{ color: '#4a3028', fontSize: '0.85rem', fontStyle: 'italic', padding: '4px 0' }}>
            You cannot flee from this encounter.
          </p>
        )}
      </div>
    </div>
  )
}
