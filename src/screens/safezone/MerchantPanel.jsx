import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useToastStore } from '../../store/toastStore'
import { getLocationType } from '../../data/zones'
import { RESOURCES } from '../../data/resources'
import {
  EQUIPMENT_TEMPLATES,
  RARITY_CONFIG,
  createEquipmentInstance,
  filterEquipStockByLocation,
} from '../../data/equipment'
import { Panel, InfoLine } from './Panel'

export default function MerchantPanel({ onBack }) {
  const { hero, world, spendGold, addConsumable, addEquipmentToInventory } = useGameStore()
  const [tab, setTab] = useState('potions') // 'potions' | 'equipment'

  const potionStock = [
    'hp_potion_small',
    'hp_potion_medium',
    'mana_potion_small',
    'mana_potion_medium',
    // Z02 — stock élargi
    'stamina_ration',
    'elixir_minor',
    'mana_crystal',
    'antidote_basic',
  ]

  // QA-BOOKS01 — les tomes de stats (ITM01) n'étaient distribués NULLE PART. Vendus par le
  // marchand en MAJEURE CITÉ uniquement (biens savants/rares), à la suite des potions.
  const locationTypeForBooks = getLocationType(world)
  const bookStock =
    locationTypeForBooks === 'city' ? ['tome_of_focus', 'tome_of_might', 'tome_of_wisdom'] : []

  // Équipements vendus par le marchand : templates avec merchantStock
  const fullEquipStock = Object.values(EQUIPMENT_TEMPLATES).flatMap((t) =>
    Object.entries(t.merchantStock ?? {})
      .filter(([, avail]) => avail)
      .map(([rarity]) => ({
        templateId: t.id,
        rarity,
        price: t.merchantBuyPrice?.[rarity] ?? 999,
      })),
  )
  // Z07 — stock différencié : village = communs + 1 rare ; ville = rares + 1 epic
  const locationType = getLocationType(world)
  const equipStock = filterEquipStockByLocation(fullEquipStock, locationType)

  const buyPotion = (id) => {
    const res = RESOURCES[id]
    if (!res || hero.inventory.gold < res.buyPrice) return
    spendGold(res.buyPrice)
    addConsumable(id, 1)
    // MRC01 — feedback d'achat
    useToastStore.getState().addToast(`🛒 Bought ${res.name} · −${res.buyPrice}🪙`, 'info')
  }

  const buyEquipment = (templateId, rarity, price) => {
    if (hero.inventory.gold < price) return
    spendGold(price)
    const item = createEquipmentInstance(templateId, rarity)
    addEquipmentToInventory(item) // lève déjà le badge unseen-loot (UX05)
    // MRC01 — feedback d'achat
    useToastStore.getState().addToast(`🛒 Bought ${item.name} · −${price}🪙`, 'loot')
  }

  return (
    <Panel title="🛒 Merchant's Stall" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "Quality goods at honest prices. Mostly."
      </p>
      <div className="flex flex-col gap-2" style={{ maxWidth: '480px' }}>
        <InfoLine label="Gold" value={`${hero.inventory.gold}g`} />

        {/* Tabs */}
        <div className="flex gap-2 mt-1 mb-2">
          {['potions', 'equipment'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 rounded text-xs capitalize"
              style={{
                fontFamily: 'Cinzel, serif',
                background: tab === t ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                color: tab === t ? 'var(--amber-deep)' : 'var(--ink-soft)',
                border: `1px solid ${tab === t ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
              }}
            >
              {t === 'potions' ? '🧪 Potions' : '⚔ Equipment'}
            </button>
          ))}
        </div>

        {tab === 'potions' &&
          [...potionStock, ...bookStock].map((id) => {
            const res = RESOURCES[id]
            if (!res) return null
            const canAfford = hero.inventory.gold >= res.buyPrice
            const owned = hero.inventory.consumables[id] || 0
            return (
              <div
                key={id}
                data-testid={res.isBook ? `book-stock-${id}` : undefined}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  background: 'rgba(201,169,110,.18)',
                  border: '1px solid var(--parchment-shadow)',
                }}
              >
                <div>
                  <p style={{ color: 'var(--amber-deep)', fontSize: '0.85rem' }}>{res.name}</p>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '0.75rem' }}>
                    {res.description} · Owned: {owned}
                  </p>
                </div>
                <button
                  onClick={() => buyPotion(id)}
                  disabled={!canAfford}
                  className="px-3 py-1 rounded text-xs ml-3"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: canAfford ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                    color: canAfford ? 'var(--amber-deep)' : 'var(--ink-soft)',
                    border: `1px solid ${canAfford ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Buy {res.buyPrice}g
                </button>
              </div>
            )
          })}

        {tab === 'equipment' &&
          equipStock.map(({ templateId, rarity, price }) => {
            const t = EQUIPMENT_TEMPLATES[templateId]
            const rc = RARITY_CONFIG[rarity]
            const canAfford = hero.inventory.gold >= price
            return (
              <div
                key={`${templateId}_${rarity}`}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  background: 'rgba(201,169,110,.18)',
                  border: '1px solid var(--parchment-shadow)',
                  borderLeft: `3px solid ${rc.color}`,
                }}
              >
                <div>
                  <p style={{ color: rc.color, fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}>
                    {rc.label} {t.name}
                  </p>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '0.73rem' }}>
                    {Object.entries(t.baseStats)
                      .map(([s, v]) => `+${Math.round(v * rc.mult)} ${s}`)
                      .join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => buyEquipment(templateId, rarity, price)}
                  disabled={!canAfford}
                  className="px-3 py-1 rounded text-xs ml-3"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: canAfford ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                    color: canAfford ? 'var(--amber-deep)' : 'var(--ink-soft)',
                    border: `1px solid ${canAfford ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Buy {price}g
                </button>
              </div>
            )
          })}
      </div>
    </Panel>
  )
}
