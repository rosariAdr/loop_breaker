import React from 'react'

/**
 * The acting character's block — portrait, HP/MP and the permanent stat grid.
 *
 * R3, and the single most important borrowing from Darkest Dungeon: the numbers
 * you decide with stay on screen while you decide. The current Combat screen
 * forces a trip to the Hero Sheet, which is the main reason it reads as
 * "not strategic enough".
 */
export function ActiveCharacter({
  name,
  role,
  initial,
  hp,
  maxHp,
  mp,
  maxMp,
  stats = {},
  ...rest
}) {
  const entries = Object.entries(stats)
  return (
    <div className="lb-cbt-who" {...rest}>
      <div className="lb-cbt-who__head">
        <span className="lb-cbt-who__crest">
          <span>{initial}</span>
        </span>
        <div>
          <div className="lb-cbt-who__name">{name}</div>
          <div className="lb-cbt-who__role">{role}</div>
        </div>
      </div>

      <div className="lb-cbt-who__gauges">
        <div className="lb-cbt-who__read">
          <span>HP</span>
          <b>
            {hp} / {maxHp}
          </b>
        </div>
        <div className="lb-cbt-gauge">
          <i style={{ width: `${(hp / maxHp) * 100}%`, background: 'var(--danger, #c0392b)' }} />
        </div>
        <div className="lb-cbt-who__read">
          <span>MP</span>
          <b>
            {mp} / {maxMp}
          </b>
        </div>
        <div className="lb-cbt-gauge">
          <i style={{ width: `${(mp / maxMp) * 100}%`, background: 'var(--sky, #7db9de)' }} />
        </div>
      </div>

      <dl className="lb-cbt-stats">
        {entries.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}
