import { TITLES } from '../../data/titles'
import StatusIcons from './StatusIcons'
import FloatingNumbers from './FloatingNumbers'
import StatBar from './StatBar'
import { HeroBattleSprite } from './Sprites'

// ── Carte héros ───────────────────────────────────────────────────────────────
export default function HeroCard({
  heroStats,
  heroName,
  activeTitle,
  deity,
  hitFlash,
  isAnimHit,
  isAttacking,
  floatingNumbers = [],
  heroEffects = [],
}) {
  // B13 — anim-hero-attack lors d'une attaque ; ANIM01 — hit-react quand le héros encaisse
  const animClass = isAttacking ? ' anim-hero-attack' : isAnimHit ? ' anim-hit-react' : ''
  return (
    <div className={`flex items-center gap-6 relative${animClass}`}>
      {/* B07 — Nombres flottants (dégâts reçus / soins) */}
      <FloatingNumbers numbers={floatingNumbers} />
      {/* Portrait — 96px */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          fontSize: '2.8rem',
          borderRadius: '12px',
          background: hitFlash
            ? 'radial-gradient(circle, #3c0808 0%, #1c0404 100%)'
            : 'radial-gradient(circle, #101c08 0%, #081008 100%)',
          border: `2px solid ${hitFlash ? '#d04040' : '#2a4018'}`,
          boxShadow: hitFlash ? '0 0 20px rgba(210,64,64,0.6)' : '0 0 12px rgba(0,0,0,0.5)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* ANIM01 — étincelle d'impact quand le héros encaisse */}
        {isAnimHit && <span className="impact-spark" data-testid="impact-spark-hero" />}
        <HeroBattleSprite />
      </div>

      {/* Stats */}
      <div style={{ minWidth: '220px' }}>
        {/* TITLE-DISP01 — titre actif au-dessus du nom en combat */}
        {activeTitle && TITLES[activeTitle] && (
          <p
            data-testid="combat-title"
            style={{
              color: '#c9a0e0',
              fontSize: '0.72rem',
              fontFamily: 'Cinzel, serif',
              marginBottom: 2,
            }}
          >
            {TITLES[activeTitle].icon} {TITLES[activeTitle].name}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <p style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '0.95rem' }}>
            {heroName}
          </p>
          {deity && <span style={{ color: '#c084fc', fontSize: '0.75rem' }}>✦ {deity}</span>}
          {/* B05 — effets de statut sur le héros */}
          {heroEffects?.length > 0 && <StatusIcons effects={heroEffects} />}
        </div>
        <StatBar
          value={heroStats.hp}
          max={heroStats.maxHp}
          color={hitFlash ? '#ff3030' : '#c03838'}
          label="HP"
          width={200}
          flash={hitFlash}
        />
        <StatBar
          value={heroStats.mana}
          max={heroStats.maxMana}
          color="#3060d0"
          label="MP"
          width={200}
        />
      </div>
    </div>
  )
}
