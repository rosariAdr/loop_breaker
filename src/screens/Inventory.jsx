import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'
import { RESOURCES, RARITY_COLORS } from '../data/resources'
import { RARITY_CONFIG } from '../data/equipment'
import ConfirmDialog from '../components/ConfirmDialog'
import { groupManaStones } from '../utils/manaStones'
import { getSkillContainer } from '../data/containers'

// S06 — univers courant (hardcodé medieval pour le POC ; X08 le rendra dynamique)
const CURRENT_UNIVERSE = 'medieval_fantasy'

// UX03 — Raretés qui déclenchent une confirmation avant Sell
const PROTECTED_RARITIES = new Set(['epic', 'legendary', 'mythic', 'ex', 'exx'])

const TABS = ['skills', 'equipment', 'consumables', 'resources']

export default function Inventory() {
  const { hero, setScreen, equipActiveSkill, equipPassiveSkill, equipItem, sellEquipment, markLootAsSeen } = useGameStore()
  const [activeTab, setActiveTab] = useState('skills')
  const [selected, setSelected] = useState(null)

  // UX05 — marquer le loot comme vu dès qu'on entre dans Inventory
  useEffect(() => {
    markLootAsSeen()
  }, [markLootAsSeen])

  const back = () => setScreen('world_map')

  return (
    <div className="sheet-scrim" onClick={back}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ width: 1080 }}>

        {/* En-tête */}
        <div className="sheet-hd">
          <div className="sh-title">
            Inventory
            <span className="sh-meta">Knapsack</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="gold-pill">🪙 {hero.inventory.gold} gold</div>
            <button className="back-btn" style={{ position: 'static' }} onClick={back}>← Map</button>
            <div className="sheet-x" onClick={back}>✕</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="inv-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelected(null) }}
              className={`inv-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {/* S06 — label du contenant selon l'univers */}
              {tab === 'skills' && `${getSkillContainer(CURRENT_UNIVERSE).icon} ${getSkillContainer(CURRENT_UNIVERSE).label} (${hero.inventory.manaStones.length})`}
              {tab === 'equipment' && `⚔ Equipment (${hero.inventory.equipment.length})`}
              {tab === 'consumables' && `🧪 Consumables`}
              {tab === 'resources' && `📦 Resources`}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="inv-content">
          {activeTab === 'skills' && (
            <SkillsTab
              manaStones={hero.inventory.manaStones}
              hero={hero}
              selected={selected}
              setSelected={setSelected}
              equipActive={equipActiveSkill}
              equipPassive={equipPassiveSkill}
            />
          )}
          {activeTab === 'equipment' && (
            <EquipmentTab
              equipment={hero.inventory.equipment}
              equipped={hero.equipped}
              selected={selected}
              setSelected={setSelected}
              onEquip={equipItem}
              onSell={sellEquipment}
            />
          )}
          {activeTab === 'consumables' && (
            <ConsumablesTab consumables={hero.inventory.consumables} />
          )}
          {activeTab === 'resources' && (
            <ResourcesTab resources={hero.inventory.resources} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Onglet Mana Stones ────────────────────────────────────────────────────────
function SkillsTab({ manaStones, hero, selected, setSelected, equipActive, equipPassive }) {
  const selectedSkill = selected !== null ? manaStones[selected] : null
  const template = selectedSkill ? SKILLS[selectedSkill.skillId] : null

  const canEquipActive = hero.activeSkills.length < 6
  const canEquipPassive = hero.passiveSkills.length < 4
  const alreadyEquippedActive = selectedSkill && hero.activeSkills.some(s => s.skillId === selectedSkill.skillId)
  const alreadyEquippedPassive = selectedSkill && hero.passiveSkills.some(s => s.skillId === selectedSkill.skillId)

  return (
    <div className="flex gap-4">
      {/* Liste */}
      <div className="flex-1 flex flex-col gap-2">
        {manaStones.length === 0 && (
          <p className="inv-empty">No mana stones in bag. Defeat monsters to steal their techniques.</p>
        )}
        {manaStones.length > 0 && !selectedSkill && (
          <p className="inv-empty" style={{ fontSize: 12, marginBottom: 2 }}>← Click a mana stone to see equip options</p>
        )}
        {/* S03 — Stack des doublons : une entrée par groupe (skillId+level) avec ×N */}
        {groupManaStones(manaStones).map((group) => {
          const t = SKILLS[group.skillId]
          if (!t) return null
          const i = group.firstIndex
          return (
            <button key={`${group.skillId}-${group.level}`} onClick={() => setSelected(i === selected ? null : i)} className={`inv-li ${selected === i ? 'sel' : ''}`}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.1rem' }}>
                  {t.container === 'divine' ? '✦' : t.container === 'supreme' ? '👑' : '💎'}
                </span>
                <p className="inv-name" style={{ fontSize: 14 }}>{t.name}</p>
                {/* S03 — badge ×N si plusieurs copies */}
                {group.count > 1 && (
                  <span style={{ color: 'var(--forest-deep)', fontSize: 12, fontFamily: 'var(--font-head)', fontWeight: 700 }}>×{group.count}</span>
                )}
                <span className="inv-tag ml-auto" style={{ background: t.type === 'active' ? 'rgba(185,122,18,.15)' : 'rgba(45,82,22,.13)', color: t.type === 'active' ? 'var(--amber-deep)' : 'var(--forest-deep)' }}>
                  {t.type}
                </span>
                <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Lv {group.level}</span>
              </div>
              <p className="inv-sub">{t.description}</p>
            </button>
          )
        })}
      </div>

      {/* Panneau détail */}
      {selectedSkill && template && (
        <div className="inv-detail">
          <p className="inv-name" style={{ fontSize: 16 }}>{template.name}</p>
          <p className="inv-sub" style={{ fontStyle: 'italic' }}>{template.description}</p>
          <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>
            {template.cost.mana > 0 && <p>Mana cost: {template.cost.mana}</p>}
            {template.cost.hp > 0 && <p>HP cost: {template.cost.hp}</p>}
            {template.cooldown > 0 && <p>Cooldown: {template.cooldown} turns</p>}
          </div>

          {template.type === 'active' && (
            <button onClick={() => { equipActive(selectedSkill); setSelected(null) }} disabled={!canEquipActive || alreadyEquippedActive} className={`inv-btn ${canEquipActive && !alreadyEquippedActive ? 'primary' : ''}`}>
              {alreadyEquippedActive ? 'Already equipped' : canEquipActive ? 'Equip (Active)' : 'Active slots full'}
            </button>
          )}

          {template.type === 'passive' && (
            <button onClick={() => { equipPassive(selectedSkill); setSelected(null) }} disabled={!canEquipPassive || alreadyEquippedPassive} className={`inv-btn ${canEquipPassive && !alreadyEquippedPassive ? 'primary' : ''}`}>
              {alreadyEquippedPassive ? 'Already equipped' : canEquipPassive ? 'Equip (Passive)' : 'Passive slots full'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Onglet Équipement ─────────────────────────────────────────────────────────
function EquipmentTab({ equipment, equipped, selected, setSelected, onEquip, onSell }) {
  const selectedItem = selected !== null ? equipment[selected] : null
  // UX03 — pending sell pour confirmation
  const [pendingSell, setPendingSell] = useState(null) // { instanceId, name, rarity, sellPrice }

  // Vérifier si un item est déjà équipé dans son slot
  const isEquipped = (item) => {
    const slot = equipped[item.slot]
    return slot?.instanceId === item.instanceId
  }

  // UX03 — décide : confirmation ou sell direct
  const handleSellClick = (item) => {
    if (PROTECTED_RARITIES.has(item.rarity)) {
      setPendingSell(item)
    } else {
      onSell(item.instanceId)
      setSelected(null)
    }
  }
  const confirmSell = () => {
    onSell(pendingSell.instanceId)
    setPendingSell(null)
    setSelected(null)
  }

  if (equipment.length === 0) {
    return <p className="inv-empty">No equipment in bag. Craft or buy some from the blacksmith or merchant.</p>
  }

  const SLOT_ICONS = { weapon: '⚔', helmet: '🪖', armor: '🛡', boots: '👢' }

  return (
    <div className="flex gap-4">
      {/* Liste */}
      <div className="flex-1 flex flex-col gap-2">
        {equipment.map((item, i) => {
          const rc = RARITY_CONFIG[item.rarity]
          const equipped_ = isEquipped(item)
          return (
            <button key={item.instanceId} onClick={() => setSelected(i === selected ? null : i)} className={`inv-li ${selected === i ? 'sel' : ''}`} style={{ borderLeft: `3px solid ${rc.color}` }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1rem' }}>{SLOT_ICONS[item.slot] ?? '?'}</span>
                <p className="inv-name" style={{ color: rc.color, fontSize: 14, flex: 1 }}>{item.name}</p>
                {equipped_ && (
                  <span className="inv-tag" style={{ background: 'rgba(45,82,22,.15)', color: 'var(--forest-deep)' }}>equipped</span>
                )}
              </div>
              <p className="inv-sub">{Object.entries(item.stats).map(([s, v]) => `+${v} ${s}`).join(' · ')}</p>
            </button>
          )
        })}
      </div>

      {/* Panneau détail */}
      {selectedItem && (
        <div className="inv-detail">
          {(() => {
            const rc = RARITY_CONFIG[selectedItem.rarity]
            const alreadyEquipped = isEquipped(selectedItem)
            const equippedInSlot = equipped[selectedItem.slot]
            // UX02 — diff vs équipé actuel
            const showDiff = equippedInSlot && !alreadyEquipped
            return (
              <>
                <div>
                  <p className="inv-name" style={{ color: rc.color, fontSize: 16 }}>{selectedItem.name}</p>
                  <p className="inv-sub" style={{ textTransform: 'capitalize' }}>{selectedItem.slot}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.entries(selectedItem.stats).map(([s, v]) => {
                    const equippedVal = equippedInSlot?.stats?.[s] ?? 0
                    const diff = v - equippedVal
                    return (
                      <div key={s} className="flex justify-between items-baseline" style={{ fontSize: 13 }}>
                        <span style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{s}</span>
                        <span className="flex items-baseline gap-2">
                          <span style={{ color: 'var(--forest-deep)' }}>+{v}</span>
                          {showDiff && (
                            <span data-testid={`diff-${s}`} style={{ color: diff > 0 ? 'var(--forest-deep)' : diff < 0 ? 'var(--danger)' : 'var(--ink-soft)', fontSize: 11, fontFamily: 'var(--font-head)' }}>
                              {diff > 0 ? `↑+${diff}` : diff < 0 ? `↓${diff}` : '—'}
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                  {showDiff && (
                    <p className="inv-sub" style={{ fontStyle: 'italic', marginTop: 2 }}>vs équipé : {equippedInSlot.name}</p>
                  )}
                </div>
                <p className="inv-sub">Sell: {selectedItem.sellPrice}g</p>
                <button onClick={() => { onEquip(selectedItem.instanceId); setSelected(null) }} disabled={alreadyEquipped} className={`inv-btn ${alreadyEquipped ? '' : 'primary'}`}>
                  {alreadyEquipped ? 'Already equipped' : 'Equip'}
                </button>
                <button onClick={() => handleSellClick(selectedItem)} className="inv-btn sell">
                  Sell {selectedItem.sellPrice}g{PROTECTED_RARITIES.has(selectedItem.rarity) ? ' ⚠' : ''}
                </button>
              </>
            )
          })()}
        </div>
      )}

      {/* UX03 — Confirmation Sell pour les raretés Epic+ */}
      <ConfirmDialog
        open={!!pendingSell}
        title="Sell rare item?"
        message={pendingSell ? `You are about to sell ${pendingSell.name} (${pendingSell.rarity}). This cannot be undone.` : ''}
        confirmLabel={pendingSell ? `Sell for ${pendingSell.sellPrice}g` : 'Sell'}
        cancelLabel="Keep it"
        variant="destructive"
        onConfirm={confirmSell}
        onCancel={() => setPendingSell(null)}
      />
    </div>
  )
}

// ── Onglet Consommables ───────────────────────────────────────────────────────
function ConsumablesTab({ consumables }) {
  const entries = Object.entries(consumables).filter(([, qty]) => qty > 0)
  if (entries.length === 0) {
    return <p className="inv-empty">No consumables. Buy some from a merchant.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-2 max-w-lg">
      {entries.map(([id, qty]) => {
        const res = RESOURCES[id]
        if (!res) return null
        return (
          <div key={id} className="inv-card">
            <div className="flex justify-between items-center mb-1">
              <p className="inv-name" style={{ color: 'var(--forest-deep)', fontSize: 14 }}>{res.name}</p>
              <span style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}>×{qty}</span>
            </div>
            <p className="inv-sub">{res.description}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Onglet Ressources ─────────────────────────────────────────────────────────
function ResourcesTab({ resources }) {
  const entries = Object.entries(resources).filter(([, qty]) => qty > 0)
  if (entries.length === 0) {
    return <p className="inv-empty">No resources yet. Defeat monsters to collect drops.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-2 max-w-lg">
      {entries.map(([id, qty]) => {
        const res = RESOURCES[id]
        if (!res) return null
        const rarityColor = RARITY_COLORS[res.rarity] ?? '#9ca3af'
        return (
          <div key={id} className="inv-card" style={{ borderLeft: `3px solid ${rarityColor}` }}>
            <div className="flex justify-between items-center mb-1">
              <p className="inv-name" style={{ color: rarityColor, fontSize: 14 }}>{res.name}</p>
              <span style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}>×{qty}</span>
            </div>
            <p className="inv-sub">{res.description}</p>
            <p className="inv-sub" style={{ marginTop: 2 }}>Sell: {res.sellPrice}g</p>
          </div>
        )
      })}
    </div>
  )
}
