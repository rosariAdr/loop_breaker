// TAV01 — Panneau des informateurs (à l'auberge). Rendu dans le panneau PNJ.
import { useGameStore } from '../store/gameStore'
import { INFORMANTS } from '../data/informants'

const KIND_ICON = { boss: '☠', loot: '💎', zone: '🗺' }

export default function InformantsPanel({ onBack }) {
  const gold = useGameStore((s) => s.hero.inventory.gold)
  // ⚠ le `?? []` doit rester HORS du sélecteur (sinon nouvelle ref à chaque render
  // quand knownInfo est undefined sur une vieille save → boucle de rendu infinie).
  const known = useGameStore((s) => s.meta.knownInfo) ?? []
  const buyInfo = useGameStore((s) => s.buyInfo)

  return (
    <div data-testid="informants-panel">
      <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
        <button className="back-btn" style={{ position: 'static' }} onClick={onBack}>← Back</button>
        <div className="pb-title" style={{ margin: 0, border: 0 }}>Whispers &amp; Rumors</div>
        <div className="gold-pill" style={{ marginLeft: 'auto' }}>🪙 {gold} gold</div>
      </div>

      <div className="flex flex-col gap-2">
        {INFORMANTS.map((inf) => {
          const bought = known.includes(inf.id)
          const canAfford = gold >= inf.price
          return (
            <div key={inf.id} className="inv-card">
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <span>{KIND_ICON[inf.kind] ?? '🗣'}</span>
                <span className="inv-name" style={{ fontSize: 14 }}>{inf.name}</span>
                {bought
                  ? <span className="inv-tag" style={{ marginLeft: 'auto', background: 'rgba(45,82,22,.15)', color: 'var(--forest-deep)' }}>✓ Known</span>
                  : (
                    <button
                      className={`inv-btn ${canAfford ? 'primary' : ''}`}
                      style={{ marginLeft: 'auto', width: 'auto' }}
                      disabled={!canAfford}
                      onClick={() => buyInfo(inf.id, inf.price)}
                    >
                      Pay {inf.price}🪙
                    </button>
                  )}
              </div>
              <p className="inv-sub" style={{ fontStyle: 'italic' }}>
                “{bought ? inf.reveal : inf.teaser}”
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
