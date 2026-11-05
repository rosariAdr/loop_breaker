import { useState, useEffect } from 'react'

// ── Portrait monstre : charge /monsters/<id>.png, fallback emoji si manquant ──
// Les images doivent être dans `public/monsters/<monsterId>.png`
// Format conseillé : 512×512 PNG, fond transparent, style fantasy joyeuse aventure
// Héros en combat : sprite idle animé (repli emoji si asset manquant)
export function HeroBattleSprite({ size = 88 }) {
  const [frame, setFrame] = useState(0)
  const [errored, setErrored] = useState(false)
  useEffect(() => {
    if (errored) return undefined
    const id = setInterval(() => setFrame((f) => (f + 1) % 18), 110)
    return () => clearInterval(id)
  }, [errored])
  if (errored) return <span style={{ fontSize: '2.8rem' }}>⚔️</span>
  return (
    <img
      src={`/sprites/hero/idle/${String(frame).padStart(2, '0')}.png`}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
      style={{
        height: `${size}px`,
        width: 'auto',
        objectFit: 'contain',
        filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.6))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

export function MonsterPortrait({ monsterId, fallbackEmoji, size = 120 }) {
  const [errored, setErrored] = useState(false)
  if (errored || !monsterId) {
    return (
      <span style={{ fontSize: `${Math.round(size * 0.55)}px`, lineHeight: 1 }}>
        {fallbackEmoji ?? '👹'}
      </span>
    )
  }
  return (
    <img
      src={`/monsters/${monsterId}.png`}
      alt=""
      onError={() => setErrored(true)}
      draggable={false}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  )
}
