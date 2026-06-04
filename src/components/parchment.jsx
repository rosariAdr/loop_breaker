// Kit de composants UI « parchemin » partagé (design ref UI of Loop Breaker).
// ArtSlot affiche une vraie sprite (src) ou un placeholder pointillé légendé.

export function ArtSlot({ caption, src, w, h, round, glow, style, className = '' }) {
  return (
    <div
      className={`art-slot ${round ? 'round' : ''} ${glow ? 'glow-gold' : ''} ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      {src
        ? <img src={src} alt="" draggable={false} />
        : <span className="as-cap">{caption}</span>}
    </div>
  )
}

// Avatar héros chibi + halo doré + plaque de nom
export function HeroAvatar({ x, y, name = 'Kael', src }) {
  return (
    <div className="hero-avatar" style={{ left: x, top: y }}>
      <div className="hero-sprite">
        {src
          ? <img src={src} alt="" draggable={false} />
          : <span className="as-cap" style={{ fontSize: 9 }}>hero</span>}
      </div>
      <div className="hero-glow" />
      <div className="hero-name">{name}</div>
    </div>
  )
}

// Trail à l'encre pointillée (courbe) entre 2 points dans un calque 1920×1080
export function Trail({ from, to, danger, bend = 0 }) {
  const midx = (from[0] + to[0]) / 2 + bend
  const midy = (from[1] + to[1]) / 2 - Math.abs(bend) * 0.4
  const d = `M ${from[0]} ${from[1]} Q ${midx} ${midy} ${to[0]} ${to[1]}`
  return (
    <svg className={`trail ${danger ? 'danger' : ''}`} style={{ inset: 0, width: '100%', height: '100%' }}>
      <path d={d} />
    </svg>
  )
}

// Médaillon de lieu sur la carte
export function MapNode({ node, onClick, onHover }) {
  const { x, y, name, size, tag, art, artSrc, glow, locked, dungeon } = node
  return (
    <div
      className={`node size-${size} ${locked ? 'locked' : ''} ${dungeon ? 'dungeon' : ''}`}
      style={{ left: x, top: y }}
      onClick={() => { if (!locked && onClick) onClick(node) }}
      onMouseEnter={() => onHover && onHover(node, true)}
      onMouseLeave={() => onHover && onHover(node, false)}
    >
      <div className={`node-medallion ${glow ? 'glow-' + glow : ''}`}>
        {dungeon
          ? <span className="q">?</span>
          : <ArtSlot caption={art} src={artSrc} w="76%" h="76%" round={size !== 'major'} />}
        {locked && <span className="lock-badge">🔒</span>}
      </div>
      <div className="node-name">{name}</div>
      {tag && <div className="node-tag" style={{ color: tag.color }}>{tag.text}</div>}
    </div>
  )
}

// Cadre décoratif parchemin (compass = double-filet + fioritures d'angle ; vine ; wood)
export function ParchmentFrame({ variant = 'compass' }) {
  return (
    <>
      <div className={`frame-border frame-${variant}`} />
      {variant === 'compass' && ['tl', 'tr', 'bl', 'br'].map(c => (
        <svg key={c} className={`frame-corner ${c}`} viewBox="0 0 54 54" fill="none">
          <path d="M4 50 Q4 14 14 8 Q26 2 40 4" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10 50 Q10 20 20 14 Q30 10 42 12" stroke="currentColor" strokeWidth="1.4" fill="none" opacity=".6" />
          <circle cx="44" cy="8" r="3.4" fill="currentColor" />
        </svg>
      ))}
    </>
  )
}

// Sidebar / journal (partagée — rendue par App au-dessus du .map-area)
function Field({ k, children, cls }) {
  return (
    <div className="sb-field">
      <div className="sb-key">{k}</div>
      <div className={`sb-val ${cls || ''}`}>{children}</div>
    </div>
  )
}

export function Sidebar({ style = 'scroll', location, zone, actions = [], idleLog, deity, demonLord, tokens }) {
  return (
    <div className="sidebar">
      <div className={`scroll-panel style-${style}`}>
        <Field k="Location">{location} <span style={{ color: 'var(--ink-soft)' }}>· {zone}</span></Field>
        <Field k="Deity" cls={deity ? '' : 'muted'}>{deity || 'No deity chosen'}</Field>
        <Field k="Demon Lord" cls="danger">⚡ {demonLord}</Field>
        <Field k="Reputation">🪙 {tokens} tokens</Field>

        {idleLog && (
          <>
            <div className="sb-divider" />
            <div className="t-label" style={{ marginBottom: 8 }}>Idle Log</div>
            <div className="idle-log">
              {idleLog.length === 0 && <div className="sb-val muted" style={{ fontSize: 14 }}>None active</div>}
              {idleLog.map((e, i) => (
                <div className="idle-entry" key={i}>
                  <span className="dot">◆</span>
                  <span>{e.text} {e.gain && <span className="gain">{e.gain}</span>}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sb-divider" />
        <div className="sb-actions">
          <div className="t-label">Actions</div>
          {actions.map((a, i) => (
            <button key={i} className={`pbtn wide ${a.primary ? 'primary' : ''}`} onClick={a.onClick} disabled={a.disabled} title={a.hint || ''}>
              <span className="pbtn-ico">{a.ico}</span>{a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
