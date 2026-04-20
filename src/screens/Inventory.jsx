import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'
import { RESOURCES, RARITY_COLORS } from '../data/resources'
import { RARITY_CONFIG } from '../data/equipment'

const TABS = ['skills', 'equipment', 'consumables', 'resources']

export default function Inventory() {
  const { hero, setScreen, equipActiveSkill, equipPassiveSkill, equipItem, sellEquipment } = useGameStore()
  const [activeTab, setActiveTab] = useState('skills')
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('world_map')}
            style={{ color: '#6a5a4a', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}
          >
            ← Map
          </button>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.3rem' }}>
            Inventory
          </h2>
          <span style={{ color: '#6a5a4a', fontSize: '0.8rem', marginLeft: 'auto' }}>
            {hero.inventory.gold}g
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#2a2018' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelected(null) }}
              className="px-4 py-2 text-xs capitalize transition-colors"
              style={{
                fontFamily: 'Cinzel, serif',
                color: activeTab === tab ? '#d4af70' : '#4a3a2a',
                borderBottom: activeTab === tab ? '2px solid #d4af70' : '2px solid transparent',
              }}
            >
              {tab === 'skills' && `✨ Mana Stones (${hero.inventory.manaStones.length})`}
              {tab === 'equipment' && `⚔ Equipment (${hero.inventory.equipment.length})`}
              {tab === 'consumables' && `🧪 Consumables`}
              {tab === 'resources' && `📦 Resources`}
            </button>
          ))}
        </div>

        {/* Contenu */}
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
          <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
            No mana stones in bag. Defeat monsters to steal their techniques.
          </p>
        )}
        {manaStones.map((stone, i) => {
          const t = SKILLS[stone.skillId]
          if (!t) return null
          return (
            <button
              key={`${stone.skillId}-${i}`}
              onClick={() => setSelected(i === selected ? null : i)}
              className="p-3 rounded text-left transition-all"
              style={{
                background: selected === i ? '#1a1208' : '#0f0c08',
                border: `1px solid ${selected === i ? '#d4af70' : '#1a1410'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.1rem' }}>
                  {t.container === 'divine' ? '✦' : t.container === 'supreme' ? '👑' : '💎'}
                </span>
                <p style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '0.85rem' }}>{t.name}</p>
                <span
                  className="ml-auto px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: t.type === 'active' ? '#1a0f08' : '#080f0a',
                    color: t.type === 'active' ? '#c08040' : '#40c080',
                  }}
                >
                  {t.type}
                </span>
                <span style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>Lv {stone.level}</span>
              </div>
              <p style={{ color: '#6a5a4a', fontSize: '0.73rem', marginTop: '0.2rem' }}>
                {t.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Panneau détail */}
      {selectedSkill && template && (
        <div
          className="w-52 p-4 rounded border flex flex-col gap-3"
          style={{ background: '#0a0a0f', borderColor: '#2a2018', alignSelf: 'flex-start' }}
        >
          <p style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '0.9rem' }}>{template.name}</p>
          <p style={{ color: '#7a6a5a', fontSize: '0.78rem', fontStyle: 'italic' }}>{template.description}</p>
          <div style={{ color: '#6a5a4a', fontSize: '0.75rem' }}>
            {template.cost.mana > 0 && <p>Mana cost: {template.cost.mana}</p>}
            {template.cost.hp > 0 && <p>HP cost: {template.cost.hp}</p>}
            {template.cooldown > 0 && <p>Cooldown: {template.cooldown} turns</p>}
          </div>

          {template.type === 'active' && (
            <button
              onClick={() => { equipActive(selectedSkill); setSelected(null) }}
              disabled={!canEquipActive || alreadyEquippedActive}
              className="w-full py-2 rounded text-xs transition-all"
              style={{
                fontFamily: 'Cinzel, serif',
                background: canEquipActive && !alreadyEquippedActive ? '#1a0f08' : '#0a0808',
                color: canEquipActive && !alreadyEquippedActive ? '#d4af70' : '#3a2a1a',
                border: `1px solid ${canEquipActive && !alreadyEquippedActive ? '#3a2818' : '#1a1410'}`,
                cursor: canEquipActive && !alreadyEquippedActive ? 'pointer' : 'not-allowed',
              }}
            >
              {alreadyEquippedActive ? 'Already equipped' : canEquipActive ? 'Equip (Active)' : 'Active slots full'}
            </button>
          )}

          {template.type === 'passive' && (
            <button
              onClick={() => { equipPassive(selectedSkill); setSelected(null) }}
              disabled={!canEquipPassive || alreadyEquippedPassive}
              className="w-full py-2 rounded text-xs transition-all"
              style={{
                fontFamily: 'Cinzel, serif',
                background: canEquipPassive && !alreadyEquippedPassive ? '#080f0a' : '#0a0808',
                color: canEquipPassive && !alreadyEquippedPassive ? '#40c080' : '#1a3a1a',
                border: `1px solid ${canEquipPassive && !alreadyEquippedPassive ? '#184018' : '#0a1a0a'}`,
                cursor: canEquipPassive && !alreadyEquippedPassive ? 'pointer' : 'not-allowed',
              }}
            >
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

  // Vérifier si un item est déjà équipé dans son slot
  const isEquipped = (item) => {
    const slot = equipped[item.slot]
    return slot?.instanceId === item.instanceId
  }

  if (equipment.length === 0) {
    return (
      <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
        No equipment in bag. Craft or buy some from the blacksmith or merchant.
      </p>
    )
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
            <button
              key={item.instanceId}
              onClick={() => setSelected(i === selected ? null : i)}
              className="p-3 rounded text-left transition-all"
              style={{
                background: selected === i ? '#1a1208' : '#0f0c08',
                border: `1px solid ${selected === i ? rc.color : '#1a1410'}`,
                borderLeft: `3px solid ${rc.color}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1rem' }}>{SLOT_ICONS[item.slot] ?? '?'}</span>
                <p style={{ fontFamily: 'Cinzel, serif', color: rc.color, fontSize: '0.85rem', flex: 1 }}>
                  {item.name}
                </p>
                {equipped_ && (
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#1a3010', color: '#80c040' }}>
                    equipped
                  </span>
                )}
              </div>
              <p style={{ color: '#6a5a4a', fontSize: '0.73rem', marginTop: '0.2rem' }}>
                {Object.entries(item.stats).map(([s, v]) => `+${v} ${s}`).join(' · ')}
              </p>
            </button>
          )
        })}
      </div>

      {/* Panneau détail */}
      {selectedItem && (
        <div
          className="w-52 p-4 rounded border flex flex-col gap-3"
          style={{ background: '#0a0a0f', borderColor: '#2a2018', alignSelf: 'flex-start' }}
        >
          {(() => {
            const rc = RARITY_CONFIG[selectedItem.rarity]
            const alreadyEquipped = isEquipped(selectedItem)
            return (
              <>
                <div>
                  <p style={{ fontFamily: 'Cinzel, serif', color: rc.color, fontSize: '0.9rem' }}>{selectedItem.name}</p>
                  <p style={{ color: '#4a3a2a', fontSize: '0.72rem', textTransform: 'capitalize' }}>{selectedItem.slot}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.entries(selectedItem.stats).map(([s, v]) => (
                    <div key={s} className="flex justify-between" style={{ fontSize: '0.78rem' }}>
                      <span style={{ color: '#6a5a4a', textTransform: 'capitalize' }}>{s}</span>
                      <span style={{ color: '#80c040' }}>+{v}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#4a3a2a', fontSize: '0.72rem' }}>Sell: {selectedItem.sellPrice}g</p>
                <button
                  onClick={() => { onEquip(selectedItem.instanceId); setSelected(null) }}
                  disabled={alreadyEquipped}
                  className="w-full py-2 rounded text-xs transition-all"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: alreadyEquipped ? '#0a0808' : '#1a1208',
                    color: alreadyEquipped ? '#3a2a1a' : '#d4af70',
                    border: `1px solid ${alreadyEquipped ? '#1a1410' : '#3a2818'}`,
                    cursor: alreadyEquipped ? 'not-allowed' : 'pointer',
                  }}
                >
                  {alreadyEquipped ? 'Already equipped' : 'Equip'}
                </button>
                <button
                  onClick={() => { onSell(selectedItem.instanceId); setSelected(null) }}
                  className="w-full py-2 rounded text-xs transition-all"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: '#180a0a',
                    color: '#c06040',
                    border: '1px solid #3a1818',
                  }}
                >
                  Sell {selectedItem.sellPrice}g
                </button>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ── Onglet Consommables ───────────────────────────────────────────────────────
function ConsumablesTab({ consumables }) {
  const entries = Object.entries(consumables).filter(([, qty]) => qty > 0)
  if (entries.length === 0) {
    return (
      <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
        No consumables. Buy some from a merchant.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-2 max-w-lg">
      {entries.map(([id, qty]) => {
        const res = RESOURCES[id]
        if (!res) return null
        return (
          <div key={id} className="p-3 rounded" style={{ background: '#0f0c08', border: '1px solid #1a1410' }}>
            <div className="flex justify-between items-center mb-1">
              <p style={{ fontFamily: 'Cinzel, serif', color: '#80c040', fontSize: '0.85rem' }}>{res.name}</p>
              <span style={{ color: '#d4af70', fontSize: '0.85rem' }}>×{qty}</span>
            </div>
            <p style={{ color: '#6a5a4a', fontSize: '0.73rem' }}>{res.description}</p>
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
    return (
      <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>
        No resources yet. Defeat monsters to collect drops.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-2 max-w-lg">
      {entries.map(([id, qty]) => {
        const res = RESOURCES[id]
        if (!res) return null
        const rarityColor = RARITY_COLORS[res.rarity] ?? '#9ca3af'
        return (
          <div key={id} className="p-3 rounded" style={{ background: '#0f0c08', border: `1px solid #1a1410`, borderLeft: `3px solid ${rarityColor}` }}>
            <div className="flex justify-between items-center mb-1">
              <p style={{ fontFamily: 'Cinzel, serif', color: rarityColor, fontSize: '0.82rem' }}>{res.name}</p>
              <span style={{ color: '#d4af70', fontSize: '0.85rem' }}>×{qty}</span>
            </div>
            <p style={{ color: '#6a5a4a', fontSize: '0.72rem' }}>{res.description}</p>
            <p style={{ color: '#4a3a2a', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              Sell: {res.sellPrice}g
            </p>
          </div>
        )
      })}
    </div>
  )
}
