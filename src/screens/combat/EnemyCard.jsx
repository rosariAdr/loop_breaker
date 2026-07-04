import { isDefeated } from '../../engine/combat'
import { RANK_BADGE, MONSTER_EMOJI } from './constants'
import StatusIcons from './StatusIcons'
import FloatingNumbers from './FloatingNumbers'
import { MonsterPortrait } from './Sprites'

// ── Carte ennemi ──────────────────────────────────────────────────────────────
export default function EnemyCard({
  enemy,
  isSelected,
  isHit,
  isAttacking,
  fx = null,
  floatingNumbers = [],
  onSelect,
}) {
  const hpPct = Math.max(0, Math.min(1, enemy.currentHp / enemy.stats.hp))
  const dead = isDefeated(enemy)
  const rankBadge = RANK_BADGE[enemy.rank]
  const emoji = MONSTER_EMOJI[enemy.monsterId] ?? MONSTER_EMOJI.default
  // ANIM02 — un skill teinté frappe cette carte : hit-react même hors animatingEnemyId (utile en AoE)
  const reacting = isHit || !!fx

  return (
    <div
      className={`flex flex-col items-center gap-2.5 transition-all duration-300 relative${reacting ? ' anim-hit-react' : ''}${isAttacking ? ' anim-enemy-attack' : ''}`}
      style={{ opacity: dead ? 0.22 : 1, cursor: dead ? 'default' : 'pointer' }}
      onClick={onSelect}
    >
      {/* B07 — Nombres flottants (dégâts) */}
      <FloatingNumbers numbers={floatingNumbers} />
      {/* Indicateur ciblage */}
      {isSelected && !dead && (
        <p
          style={{
            color: '#d4af70',
            fontSize: '0.65rem',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.1em',
            textShadow: '0 0 8px #d4af7080',
          }}
        >
          ▼ TARGET
        </p>
      )}

      {/* Portrait — 128px, badge en overlay */}
      <div className="relative">
        {/* ANIM01 — étincelle d'impact au coup reçu */}
        {isHit && !dead && <span className="impact-spark" data-testid="impact-spark" />}
        {/* ANIM02 — VFX du skill : flash élémentaire + projectile (magie/distance) ou frappe (mêlée) */}
        {fx && !dead && (
          <>
            <span
              className="skill-flash"
              data-testid="skill-flash"
              style={{ '--fx-color': fx.color }}
              aria-hidden="true"
            />
            <span
              className={fx.mode === 'projectile' ? 'skill-orb' : 'skill-slash'}
              data-testid={fx.mode === 'projectile' ? 'skill-orb' : 'skill-slash'}
              style={{ '--fx-color': fx.color }}
              aria-hidden="true"
            />
          </>
        )}
        <div
          className="flex items-center justify-center transition-all duration-200 overflow-hidden"
          style={{
            // CMB-ICON — sprite ennemi ×2 (128 → 256, le conteneur a overflow-hidden donc
            // doubler aussi le cadre, sinon le portrait agrandi serait rogné).
            width: '256px',
            height: '256px',
            fontSize: '8rem',
            borderRadius: '20px',
            background:
              isSelected && !dead
                ? 'radial-gradient(circle, #2c1010 0%, #180808 100%)'
                : 'radial-gradient(circle, #1a0a0a 0%, #0f0606 100%)',
            border: `2px solid ${dead ? '#2a1010' : isSelected ? '#d4af70' : '#4a2018'}`,
            boxShadow:
              isSelected && !dead
                ? '0 0 22px rgba(212,175,112,0.3), inset 0 0 24px rgba(0,0,0,0.5)'
                : 'inset 0 0 24px rgba(0,0,0,0.5)',
            filter: dead ? 'grayscale(1) brightness(0.35)' : 'none',
          }}
        >
          {dead ? (
            <span>💀</span>
          ) : (
            <MonsterPortrait monsterId={enemy.monsterId} fallbackEmoji={emoji} size={240} />
          )}
        </div>

        {/* Badge de rang en overlay — haut gauche */}
        {rankBadge && !dead && (
          <div
            className="absolute px-1.5 py-0.5 rounded"
            style={{
              top: '-6px',
              left: '-6px',
              background: rankBadge.bg,
              border: `1px solid ${rankBadge.border}`,
              fontSize: '0.58rem',
              color: rankBadge.color,
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {rankBadge.label}
          </div>
        )}
      </div>

      {/* Infos ennemi */}
      <div className="text-center" style={{ minWidth: '140px' }}>
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            color: dead ? '#3a2a1a' : '#c0a070',
            fontSize: '0.85rem',
            marginBottom: '6px',
          }}
        >
          {enemy.name}
        </p>

        {/* Barre HP — plus épaisse */}
        <div className="flex items-center gap-1.5 justify-center">
          <div
            className="rounded overflow-hidden"
            style={{ width: '110px', height: '10px', background: '#1a0a0a' }}
          >
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${hpPct * 100}%`,
                background: hpPct > 0.5 ? '#40c060' : hpPct > 0.25 ? '#c0b040' : '#c03030',
                boxShadow:
                  hpPct > 0
                    ? `0 0 6px ${hpPct > 0.5 ? '#40c060' : hpPct > 0.25 ? '#c0b040' : '#c03030'}90`
                    : 'none',
              }}
            />
          </div>
          <span style={{ color: '#6a4a3a', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
            {Math.max(0, enemy.currentHp)}/{enemy.stats.hp}
          </span>
        </div>

        {/* B05 — effets de statut actifs */}
        {!dead && enemy.activeEffects?.length > 0 && (
          <div className="mt-1.5">
            <StatusIcons effects={enemy.activeEffects} />
          </div>
        )}
      </div>
    </div>
  )
}
