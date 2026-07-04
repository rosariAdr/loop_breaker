import { ArtSlot } from '../../components/parchment'
import { BLD_POS, BLD_FACADES } from './constants'

export default function VilBuilding({
  id,
  info,
  onClick,
  closed = false,
  locked = false,
  lockReason = '',
}) {
  const p = BLD_POS[id]
  if (!p || !info) return null
  // BLDUNL05 — un bâtiment verrouillé prime sur « fermé » (raison + 🔒 + grisé).
  const dimmed = locked || closed
  return (
    <div
      className={`bld${locked ? ' bld-locked' : ''}`}
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? 'grayscale(0.5)' : 'none',
      }}
      onClick={onClick}
      title={locked ? lockReason : closed ? 'Closed' : undefined}
    >
      {/* CONT01/VIL-FACADE01 — façade /buildings/<id>.png : en grand & sans cadre si l'asset
          existe, sinon placeholder légendé encadré. */}
      {BLD_FACADES.has(id) ? (
        <ArtSlot
          className="bld-facade"
          caption={info.name}
          src={`/buildings/${id}.png`}
          w={170}
          h={150}
        />
      ) : (
        <div className="bld-frame">
          <ArtSlot caption={info.name} src={`/buildings/${id}.png`} w={120} h={80} />
        </div>
      )}
      <div className="bld-sign">
        <span>{locked ? '🔒' : info.icon}</span>
        {info.name}
        {!locked && closed && (
          <span style={{ marginLeft: 4, fontSize: '0.7em', opacity: 0.8 }}>🔒</span>
        )}
      </div>
    </div>
  )
}
