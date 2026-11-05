import React from 'react'

/**
 * One fighter on the battle line — ally or foe, with its floor health bar and,
 * for foes, the telegraphed intent above it.
 *
 * R5 — the frame colour codes the side (gold ally / red foe / amber acting).
 * No "enemy" label anywhere.
 */
export function Combatant({
  name,
  initial,
  side = 'ally',
  hp = 8,
  maxHp = 8,
  intent,
  elite = false,
  selected = false,
  showBar = true,
  onSelect,
  ...rest
}) {
  const foe = side === 'foe'
  const cls = [
    'lb-cbt-unit',
    `lb-cbt-unit--${foe ? 'foe' : 'ally'}`,
    elite && 'lb-cbt-unit--elite',
  ]
    .filter(Boolean)
    .join(' ')

  const pips = []
  for (let i = 0; i < maxHp; i++) {
    pips.push(<i key={i} className={i < hp ? undefined : 'is-off'} />)
  }

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={selected}
      aria-label={`${name}${foe ? `, ${hp} of ${maxHp} health` : ''}`}
      onClick={onSelect}
      {...rest}
    >
      {foe && intent && <span className="lb-cbt-intent">{intent}</span>}
      <span className="lb-cbt-unit__body">
        <span>{initial}</span>
      </span>
      <span className="lb-cbt-unit__name">{name}</span>
      {showBar && <span className="lb-cbt-bar">{pips}</span>}
    </button>
  )
}
