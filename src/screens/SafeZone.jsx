import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'
import { ZONES } from '../data/zones'
import { RESOURCES } from '../data/resources'
import { SKILLS } from '../data/skills'
import { QUESTS } from '../data/quests'
import {
  EQUIPMENT_TEMPLATES,
  RARITY_TIERS,
  RARITY_CONFIG,
  canCraft,
  createEquipmentInstance,
} from '../data/equipment'
import { resolveCraftOutcome, alchemyQuantity } from '../utils/crafting'
import { ALCHEMY_RECIPES, MASTER_RECIPES } from '../data/recipes'
import CraftingMinigame from '../components/CraftingMinigame'
import { ArtSlot, HeroAvatar, ParchmentFrame } from '../components/parchment'
import { portraitSrc } from '../data/portraits'
import { getDialogue, FALLBACK_DIALOGUE } from '../data/dialogues'
import DialoguePanel from '../components/DialoguePanel'
import InformantsPanel from '../components/InformantsPanel'

// NPC04 — arbre de dialogue par bâtiment (repli générique sinon)
const TALK_ID = { inn: 'inn_marta', church: 'church_caelum', merchant: 'merchant_pell', blacksmith: 'blacksmith_bram' }

const HERO_SPRITE = '/sprites/hero/idle/00.png'

// UI05 — PNJ par bâtiment (portrait pixel couche B + dialogue + action d'entrée)
const NPCS = {
  inn:            { role: 'marta',    name: 'Marta', title: 'Innkeeper', icon: '🛏', cta: 'Rest at the Inn',
    line: "Welcome, traveler. Weary bones find rest here — and the ale's not bad either." },
  church:         { role: null, fallback: '⛪', name: 'Brother Caelum', title: 'Cleric', icon: '🙏', cta: 'Enter the Church',
    line: "The Old Gods still listen, child. Pledge your heart, and their favor shall guide your blade." },
  merchant:       { role: 'merchant', name: 'Goodwife Pell', title: 'Merchant', icon: '🎒', cta: 'Browse the wares',
    line: "Fresh from the road! Potions, blades, trinkets — all fairly priced, I swear it on me cart." },
  blacksmith:     { role: 'smith',    name: 'Bram', title: 'Blacksmith', icon: '🔨', cta: 'To the forge',
    line: "Steel and fire, that's all a man needs. Bring me ore and I'll bring you ruin for your foes." },
  master_smith:   { role: 'smith',    name: 'Master Hollis', title: 'Master Smith', icon: '🛠', cta: 'Master forge',
    line: "Only the finest work leaves my anvil. Rare materials, rare results — that's the bargain." },
  knight_trainer: { role: 'aldric',   name: 'Sir Aldric', title: 'Knight Trainer', icon: '⚔', cta: 'Train with Aldric',
    line: "So you'd learn the blade? Steel is patient, lad. Train, and I'll make a hero of you yet." },
  alchemy:        { role: 'mage',     name: 'Vesna', title: 'Alchemist', icon: '⚗', cta: 'Enter the lab',
    line: "Mind the dosage — a hair too much and the draught turns to poison. Shall we brew?" },
}

// IMM01 — actions par bâtiment. L'auberge s'exécute INLINE (repos + feedback,
// pas de 2e fenêtre). Les autres bâtiments ouvrent encore leur panneau via
// onEnter (kind 'panel') — migration vers le corps du panneau en IMM02.
function buildingActions(building, npc) {
  const talk = { ico: '💬', label: 'Talk', kind: 'talk' } // NPC04
  if (building === 'inn') {
    return [
      { ico: '🛏', label: 'Rest at the Inn', kind: 'rest', primary: true },
      { ico: '📜', label: 'Quest Board', kind: 'nav', screen: 'quest_board' },
      { ico: '🕵', label: 'Ask around', kind: 'panel' }, // TAV01 — informateurs
      talk,
    ]
  }
  return [{ ico: npc.icon, label: npc.cta, kind: 'panel', primary: true }, talk]
}

function NpcOverlay({ building, onClose, onEnter, showPanel, panel }) {
  const npc = NPCS[building]
  const { sleep, setScreen } = useGameStore()
  const [flash, setFlash] = useState(null)
  const [talkDlg, setTalkDlg] = useState(null) // NPC04 — dialogue en cours
  if (!npc) return null
  const src = npc.role ? portraitSrc(npc.role, 'talk') : null
  const actions = buildingActions(building, npc)
  const expanded = showPanel || talkDlg

  const run = (a) => {
    if (a.kind === 'rest') {
      sleep()
      const d = useGameStore.getState().world.dayCount
      setFlash(`You rest by the hearth — HP and Mana fully restored. Dawn breaks: it is now Day ${d}.`)
    } else if (a.kind === 'nav') {
      setScreen(a.screen)
    } else if (a.kind === 'panel') {
      onEnter()
    } else if (a.kind === 'talk') {
      setTalkDlg(getDialogue(TALK_ID[building]) ?? FALLBACK_DIALOGUE)
    }
  }

  return (
    <div className="npc-scrim" onClick={onClose}>
      <div className={`npc-panel ${expanded ? 'has-panel' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="npc-portrait">
          <div className="pframe" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {src
              ? <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />
              : <span style={{ fontSize: 84 }}>{npc.fallback || '🧑'}</span>}
          </div>
          <div className="pname">{npc.name}</div>
          <div className="t-label">{npc.title}</div>
        </div>
        <div className="npc-body">
          {showPanel ? (
            // IMM02 — panneau fonctionnel rendu DANS la même fenêtre (plus de 2e fenêtre)
            <div className="npc-panel-host">{panel}</div>
          ) : talkDlg ? (
            // NPC04 — conversation (arbre de dialogue) dans la même fenêtre
            <div className="npc-panel-host">
              <DialoguePanel dialogue={talkDlg} speaker={`${npc.name} — ${npc.title}`} onClose={() => setTalkDlg(null)} />
            </div>
          ) : (
            <>
              <div className="npc-eyebrow">{npc.name} — {npc.title}</div>
              <div className="npc-dialogue">“{flash || npc.line}”</div>
              <div className="npc-actions">
                {actions.map((a, i) => (
                  <button key={i} className={`pbtn ${a.primary ? 'primary' : ''}`} onClick={() => run(a)}>
                    <span className="pbtn-ico">{a.ico}</span>{a.label}
                  </button>
                ))}
                <button className="pbtn" onClick={onClose}><span className="pbtn-ico">✕</span>Leave</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Positions (%) des bâtiments autour de la place du village
const BLD_POS = {
  inn:            { x: 28, y: 30 },
  church:         { x: 72, y: 30 },
  blacksmith:     { x: 20, y: 58 },
  merchant:       { x: 80, y: 58 },
  knight_trainer: { x: 30, y: 82 },
  alchemy:        { x: 70, y: 82 },
  master_smith:   { x: 50, y: 88 },
}

function VilBuilding({ id, info, onClick }) {
  const p = BLD_POS[id]
  if (!p || !info) return null
  return (
    <div className="bld" style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={onClick}>
      <div className="bld-frame"><ArtSlot caption={info.name} w={120} h={80} /></div>
      <div className="bld-sign"><span>{info.icon}</span>{info.name}</div>
    </div>
  )
}

// Génère les bâtiments d'un village de façon déterministe
// (basé sur l'id du village pour que ça soit stable entre les sessions)
function generateVillageBuildings(villageId, optionalBuildings) {
  // Seed simple basé sur le nom du village
  const seed = villageId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  const buildings = []
  optionalBuildings.forEach(({ id, chance }, i) => {
    const hash = ((seed + i * 1234) % 100) / 100
    if (hash < chance) buildings.push(id)
  })
  return buildings
}

export default function SafeZone() {
  const { world, setScreen, hero } = useGameStore()
  const [activeBuilding, setActiveBuilding] = useState(null)
  const [showPanel, setShowPanel] = useState(false)

  const openBuilding = (id) => { setActiveBuilding(id); setShowPanel(false) }
  const closeBuilding = () => { setActiveBuilding(null); setShowPanel(false) }

  const zone = ZONES[world.currentZone]
  if (!zone) return null

  // Trouver la localisation actuelle
  const isCity = zone.city?.id === world.currentLocation
  const location = isCity
    ? zone.city
    : zone.villages?.find(v => v.id === world.currentLocation)

  if (!location) return null

  // Construire la liste des bâtiments disponibles
  let buildings = [...(location.buildings ?? [])]
  if (!isCity && location.optionalBuildings) {
    // Récupérer depuis le store ou générer
    const stored = world.generatedVillages?.[location.id]
    if (stored) {
      buildings = [...buildings, ...stored.buildings]
    } else {
      const optional = generateVillageBuildings(location.id, location.optionalBuildings)
      buildings = [...buildings, ...optional]
      // Sauvegarder dans le store
      useGameStore.setState(state => ({
        world: {
          ...state.world,
          generatedVillages: {
            ...state.world.generatedVillages,
            [location.id]: { buildings: optional }
          }
        }
      }))
    }
  }

  const BUILDING_INFO = {
    inn: { icon: '🍺', name: 'The Hearth Inn', color: '#c08040' },
    church: { icon: '⛪', name: 'Church of the Old Gods', color: '#c0a060' },
    merchant: { icon: '🛒', name: "Merchant's Stall", color: '#60c080' },
    alchemy: { icon: '⚗️', name: 'Alchemy Workshop', color: '#8060c0' },
    blacksmith: { icon: '🔨', name: "Blacksmith's Forge", color: '#808080' },
    master_smith: { icon: '🛠', name: 'Master Smith', color: '#c0a060' }, // Z06
    knight_trainer: { icon: '⚔', name: 'Sir Aldric — Knight Trainer', color: '#c08040' },
  }

  return (
    <>
      {/* ── Carte du village (parchemin) ─────────────────────────────── */}
      <div className="parchment fill village">
        <ParchmentFrame variant="vine" />

        <button className="back-btn" onClick={() => { setActiveBuilding(null); setScreen('world_map') }}>
          ← Map
        </button>

        <div className="zone-header vil-header">
          <div className="t-zone zh-title">{location.name}</div>
          <div className="t-sub zh-sub">{isCity ? '🏰 Major City' : '🏘 Village'} · {zone.name}</div>
        </div>

        {/* Place centrale en terre battue */}
        <div className="vil-square" />

        {/* Chemins du puits vers chaque bâtiment */}
        <svg className="vil-paths" preserveAspectRatio="none">
          {buildings.map(id => {
            const p = BLD_POS[id]
            if (!p) return null
            return <line key={id} x1="50%" y1="50%" x2={`${p.x}%`} y2={`${p.y}%`}
              stroke="#c9b083" strokeWidth="11" strokeLinecap="round" opacity="0.55" />
          })}
        </svg>

        {/* Puits au centre */}
        <div className="vil-well">
          <ArtSlot caption="village well" w={84} h={66} />
        </div>

        {/* Bâtiments */}
        {buildings.map(id => (
          <VilBuilding key={id} id={id} info={BUILDING_INFO[id]} onClick={() => openBuilding(id)} />
        ))}

        {/* Héros près du puits */}
        <HeroAvatar x="50%" y="40%" name={hero.name} src={HERO_SPRITE} />
      </div>

      {/* ── UI05/IMM02 — Dialogue PNJ + panneau fonctionnel DANS LA MÊME fenêtre ── */}
      {activeBuilding && (
        <NpcOverlay
          building={activeBuilding}
          showPanel={showPanel}
          onEnter={() => setShowPanel(true)}
          onClose={closeBuilding}
          panel={showPanel ? (
            activeBuilding === 'church' ? <ChurchPanel onBack={() => setShowPanel(false)} />
              : activeBuilding === 'merchant' ? <MerchantPanel onBack={() => setShowPanel(false)} zoneId={world.currentZone} />
              : activeBuilding === 'alchemy' ? <AlchemyPanel onBack={() => setShowPanel(false)} />
              : activeBuilding === 'blacksmith' ? <BlacksmithPanel onBack={() => setShowPanel(false)} zoneId={world.currentZone} />
              : activeBuilding === 'master_smith' ? <MasterSmithPanel onBack={() => setShowPanel(false)} />
              : activeBuilding === 'knight_trainer' ? <KnightTrainerPanel onBack={() => setShowPanel(false)} />
              : <InformantsPanel onBack={() => setShowPanel(false)} />
          ) : null}
        />
      )}
    </>
  )
}

// ── Bâtiments ─────────────────────────────────────────────────────────────────

function InnPanel({ onBack }) {
  const { sleep, world, setScreen } = useGameStore()

  const handleSleep = () => {
    sleep()
    onBack()
  }

  return (
    <Panel title="🍺 The Hearth Inn" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
        "Rest your bones, traveler. The road is long."
      </p>
      <div className="flex flex-col gap-3 max-w-sm">
        <InfoLine label="Day" value={world.dayCount} />
        <InfoLine label="Tick" value={`${world.tickCount}/24`} />

        <button
          onClick={handleSleep}
          className="mt-2 px-4 py-3 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: 'rgba(74,124,47,.14)',
            color: 'var(--forest-deep)',
            border: '1px solid #406030',
          }}
        >
          💤 Sleep until morning
          <br />
          <span style={{ fontSize: '0.75rem', color: '#507040' }}>
            Fully restores HP & Mana · Advances to Day {world.dayCount + 1}
          </span>
        </button>

        <button
          onClick={() => setScreen('quest_board')}
          className="px-4 py-3 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: 'rgba(160,110,220,.12)',
            color: '#c084fc',
            border: '1px solid #3a1c60',
          }}
        >
          📋 Quest Board
          <br />
          <span style={{ fontSize: '0.75rem', color: '#5a3a80' }}>
            View & claim available quests
          </span>
        </button>
      </div>
    </Panel>
  )
}

function ChurchPanel({ onBack }) {
  const { hero, prayAtChurch } = useGameStore()

  const alreadyFull = hero.stats.hp >= hero.stats.maxHp && hero.stats.mana >= hero.stats.maxMana

  return (
    <Panel title="⛪ Church of the Old Gods" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
        "The gods hear those who kneel."
      </p>
      <div className="flex flex-col gap-3 max-w-sm">
        <InfoLine label="HP" value={`${hero.stats.hp} / ${hero.stats.maxHp}`} />
        <InfoLine label="Mana" value={`${hero.stats.mana} / ${hero.stats.maxMana}`} />

        <button
          onClick={prayAtChurch}
          disabled={alreadyFull}
          className="mt-2 px-4 py-3 rounded transition-all"
          style={{
            fontFamily: 'Cinzel, serif',
            background: alreadyFull ? 'rgba(201,169,110,.1)' : 'rgba(160,110,220,.12)',
            color: alreadyFull ? '#3a3a4a' : '#c0a0ff',
            border: `1px solid ${alreadyFull ? '#1a1a2a' : '#5040a0'}`,
            cursor: alreadyFull ? 'not-allowed' : 'pointer',
          }}
        >
          🙏 Pray
          <br />
          <span style={{ fontSize: '0.75rem', color: '#7060b0' }}>
            {alreadyFull ? 'Already at full strength' : 'Restores 40% HP & Mana · costs 1 tick'}
          </span>
        </button>
      </div>
    </Panel>
  )
}

function MerchantPanel({ onBack }) {
  const { hero, spendGold, addConsumable, addEquipmentToInventory } = useGameStore()
  const [tab, setTab] = useState('potions') // 'potions' | 'equipment'

  const potionStock = [
    'hp_potion_small', 'hp_potion_medium',
    'mana_potion_small', 'mana_potion_medium',
    // Z02 — stock élargi
    'stamina_ration', 'elixir_minor', 'mana_crystal', 'antidote_basic',
  ]

  // Équipements vendus par le marchand : templates avec merchantStock
  const equipStock = Object.values(EQUIPMENT_TEMPLATES).flatMap(t =>
    Object.entries(t.merchantStock ?? {})
      .filter(([, avail]) => avail)
      .map(([rarity]) => ({ templateId: t.id, rarity, price: t.merchantBuyPrice?.[rarity] ?? 999 }))
  )

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
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        "Quality goods at honest prices. Mostly."
      </p>
      <div className="flex flex-col gap-2" style={{ maxWidth: '480px' }}>
        <InfoLine label="Gold" value={`${hero.inventory.gold}g`} />

        {/* Tabs */}
        <div className="flex gap-2 mt-1 mb-2">
          {['potions', 'equipment'].map(t => (
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

        {tab === 'potions' && potionStock.map(id => {
          const res = RESOURCES[id]
          if (!res) return null
          const canAfford = hero.inventory.gold >= res.buyPrice
          const owned = hero.inventory.consumables[id] || 0
          return (
            <div key={id} className="flex items-center justify-between p-2 rounded"
              style={{ background: 'rgba(201,169,110,.18)', border: '1px solid var(--parchment-shadow)' }}>
              <div>
                <p style={{ color: 'var(--amber-deep)', fontSize: '0.85rem' }}>{res.name}</p>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.75rem' }}>{res.description} · Owned: {owned}</p>
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

        {tab === 'equipment' && equipStock.map(({ templateId, rarity, price }) => {
          const t = EQUIPMENT_TEMPLATES[templateId]
          const rc = RARITY_CONFIG[rarity]
          const canAfford = hero.inventory.gold >= price
          return (
            <div key={`${templateId}_${rarity}`} className="flex items-center justify-between p-2 rounded"
              style={{ background: 'rgba(201,169,110,.18)', border: '1px solid var(--parchment-shadow)', borderLeft: `3px solid ${rc.color}` }}>
              <div>
                <p style={{ color: rc.color, fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}>
                  {rc.label} {t.name}
                </p>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.73rem' }}>
                  {Object.entries(t.baseStats).map(([s, v]) =>
                    `+${Math.round(v * rc.mult)} ${s}`
                  ).join(' · ')}
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

// Z04 + CRF02 — Alchimiste : brassage de potions via mini-jeu de dosage
function AlchemyPanel({ onBack }) {
  const { hero, spendGold, removeResource, addConsumable, addHeroDebuff } = useGameStore()
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false)

  const recipe = ALCHEMY_RECIPES.find(r => r.id === selected)
  const hasIngredients = recipe
    ? Object.entries(recipe.ingredients).every(([id, q]) => (hero.inventory.resources[id] ?? 0) >= q)
    : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canBrew = hasIngredients && hasGold

  const handleBrew = () => {
    if (!canBrew || !recipe) return
    Object.entries(recipe.ingredients).forEach(([id, q]) => removeResource(id, q))
    spendGold(recipe.gold)
    setMsg(null)
    setMinigameOpen(true)
  }

  const handleComplete = ({ tier }) => {
    setMinigameOpen(false)
    const qty = alchemyQuantity(tier)
    if (qty > 0) {
      addConsumable(recipe.output, qty)
      const flair = tier === 'perfect' ? ' (Perfect!)' : tier === 'good' ? ' (Good!)' : ''
      setMsg(`✓ Brewed ${qty}× ${recipe.name}${flair}`)
    } else {
      const permanent = tier === 'catastrophe'
      addHeroDebuff('poisoned', 7, permanent)
      setMsg(permanent
        ? '✗ Catastrophe! The brew turns toxic — Poisoned (permanent).'
        : '✗ Botched brew — Poisoned (7 days).')
    }
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <Panel title="⚗️ Alchemy Workshop" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        "The alchemist gestures at the bubbling tubes. 'Steady hands, steady brew.'"
      </p>
      <div className="flex flex-col gap-1.5" style={{ maxWidth: '460px' }}>
        {ALCHEMY_RECIPES.map(r => {
          const ok = Object.entries(r.ingredients).every(([id, q]) => (hero.inventory.resources[id] ?? 0) >= q)
            && hero.inventory.gold >= r.gold
          return (
            <button
              key={r.id}
              onClick={() => { setSelected(r.id); setMsg(null) }}
              data-testid={`alchemy-recipe-${r.id}`}
              className="text-left px-3 py-2 rounded text-xs"
              style={{
                background: selected === r.id ? 'rgba(160,110,220,.16)' : 'rgba(201,169,110,.12)',
                border: `1px solid ${selected === r.id ? '#5a40b0' : '#1a1620'}`,
                opacity: ok ? 1 : 0.55,
                fontFamily: 'Cinzel, serif',
              }}
            >
              <span style={{ color: '#b090e0' }}>{r.name}</span>
              <span style={{ color: '#6a5a7a', marginLeft: '0.5rem' }}>
                {Object.entries(r.ingredients).map(([id, q]) => `${RESOURCES[id]?.name ?? id}×${q}`).join(', ')} · {r.gold}g
              </span>
            </button>
          )
        })}
      </div>

      {recipe && (
        <button
          onClick={handleBrew}
          disabled={!canBrew}
          className="mt-3 px-4 py-2 rounded text-sm"
          style={{
            fontFamily: 'Cinzel, serif',
            background: canBrew ? 'rgba(160,110,220,.16)' : 'rgba(201,169,110,.12)',
            color: canBrew ? '#b090e0' : '#4a3a5a',
            border: `1px solid ${canBrew ? '#5a40b0' : '#1a1620'}`,
            cursor: canBrew ? 'pointer' : 'not-allowed',
          }}
        >
          ⚗️ Brew {recipe.name}
        </button>
      )}
      {msg && (
        <p style={{ color: msg.startsWith('✗') ? '#c06040' : 'var(--forest-deep)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', marginTop: '0.5rem' }}>
          {msg}
        </p>
      )}

      <CraftingMinigame
        open={minigameOpen}
        mode="alchemy"
        title={`Brew — ${recipe?.name ?? ''}`}
        onComplete={handleComplete}
      />
    </Panel>
  )
}

// Z06 — Maître forgeron : recettes Rare/Epic via mini-jeu de forge
function MasterSmithPanel({ onBack }) {
  const { hero, spendGold, removeResource, addEquipmentToInventory, addHeroDebuff } = useGameStore()
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false)

  const recipe = MASTER_RECIPES.find(r => r.id === selected)
  const hasIngredients = recipe
    ? Object.entries(recipe.ingredients).every(([id, q]) => (hero.inventory.resources[id] ?? 0) >= q)
    : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canForge = hasIngredients && hasGold

  const handleForge = () => {
    if (!canForge || !recipe) return
    Object.entries(recipe.ingredients).forEach(([id, q]) => removeResource(id, q))
    spendGold(recipe.gold)
    setMsg(null)
    setMinigameOpen(true)
  }

  const handleComplete = ({ tier }) => {
    setMinigameOpen(false)
    const outcome = resolveCraftOutcome(recipe.rarity, tier)
    if (outcome.success) {
      const item = createEquipmentInstance(recipe.templateId, outcome.rarity)
      addEquipmentToInventory(item)
      const bonus = outcome.rarity !== recipe.rarity ? ` (${tier}! → ${outcome.rarity})` : ''
      setMsg(`✓ ${item.name} forged!${bonus}`)
    } else {
      addHeroDebuff('burnt_hands', 7, outcome.permanentDebuff)
      setMsg(outcome.severity === 'catastrophe'
        ? '✗ Catastrophe! The masterwork shatters — Burnt Hands (permanent).'
        : '✗ Botched! Burnt Hands (7 days).')
    }
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <Panel title="🛠 Master Smith" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        "A master at the anvil eyes your materials. 'Only the worthy leave with steel.'"
      </p>
      <div className="flex flex-col gap-1.5" style={{ maxWidth: '500px' }}>
        {MASTER_RECIPES.map(r => {
          const rc = RARITY_CONFIG[r.rarity]
          const ok = Object.entries(r.ingredients).every(([id, q]) => (hero.inventory.resources[id] ?? 0) >= q)
            && hero.inventory.gold >= r.gold
          return (
            <button
              key={r.id}
              onClick={() => { setSelected(r.id); setMsg(null) }}
              data-testid={`master-recipe-${r.id}`}
              className="text-left px-3 py-2 rounded text-xs"
              style={{
                background: selected === r.id ? 'rgba(212,160,23,.2)' : 'rgba(201,169,110,.18)',
                border: `1px solid ${selected === r.id ? rc.color : 'var(--parchment-shadow)'}`,
                opacity: ok ? 1 : 0.55,
                fontFamily: 'Cinzel, serif',
              }}
            >
              <span style={{ color: rc.color }}>{r.name}</span>
              <span style={{ color: 'var(--ink-soft)', marginLeft: '0.5rem' }}>
                {Object.entries(r.ingredients).map(([id, q]) => `${RESOURCES[id]?.name ?? id}×${q}`).join(', ')} · {r.gold}g
              </span>
            </button>
          )
        })}
      </div>

      {recipe && (
        <button
          onClick={handleForge}
          disabled={!canForge}
          className="mt-3 px-4 py-2 rounded text-sm"
          style={{
            fontFamily: 'Cinzel, serif',
            background: canForge ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
            color: canForge ? 'var(--amber-deep)' : 'var(--ink-soft)',
            border: `1px solid ${canForge ? '#6a5018' : 'var(--parchment-shadow)'}`,
            cursor: canForge ? 'pointer' : 'not-allowed',
          }}
        >
          🛠 Forge {recipe.name}
        </button>
      )}
      {msg && (
        <p style={{ color: msg.startsWith('✗') ? '#c06040' : 'var(--forest-deep)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', marginTop: '0.5rem' }}>
          {msg}
        </p>
      )}

      <CraftingMinigame
        open={minigameOpen}
        mode="forge"
        title={`Master Forge — ${recipe?.name ?? ''}`}
        onComplete={handleComplete}
      />
    </Panel>
  )
}

function BlacksmithPanel({ onBack }) {
  const { hero, spendGold, removeResource, addEquipmentToInventory, addHeroDebuff } = useGameStore()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedRarity, setSelectedRarity] = useState('common')
  const [craftMsg, setCraftMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false) // CRF03

  // Templates disponibles au forgeron
  const smithTemplates = Object.values(EQUIPMENT_TEMPLATES).filter(t =>
    t.availableAt?.includes('blacksmith')
  )

  const template = selectedTemplate ? EQUIPMENT_TEMPLATES[selectedTemplate] : null
  const recipe = template?.craftRecipes?.[selectedRarity]

  const hasIngredients = recipe ? canCraft(selectedTemplate, selectedRarity, hero.inventory.resources) : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canDoCraft = hasIngredients && hasGold

  // CRF03 — lance le mini-jeu de forge ; les ingrédients sont consommés à l'engagement
  const handleCraft = () => {
    if (!canDoCraft || !recipe) return
    Object.entries(recipe.ingredients).forEach(([resId, qty]) => removeResource(resId, qty))
    spendGold(recipe.gold)
    setCraftMsg(null)
    setMinigameOpen(true)
  }

  // CRF03 + CRF04 — issue du mini-jeu : succès = rareté ajustée, échec = debuff
  const handleMinigameComplete = ({ tier }) => {
    setMinigameOpen(false)
    const outcome = resolveCraftOutcome(selectedRarity, tier)
    if (outcome.success) {
      const item = createEquipmentInstance(selectedTemplate, outcome.rarity)
      addEquipmentToInventory(item)
      const bonus = outcome.rarity !== selectedRarity ? ` (${tier}! → ${outcome.rarity})` : ''
      setCraftMsg(`✓ ${item.name} forged!${bonus}`)
    } else {
      // raté → Burnt Hands 7j ; catastrophe → permanent
      addHeroDebuff('burnt_hands', 7, outcome.permanentDebuff)
      setCraftMsg(outcome.severity === 'catastrophe'
        ? '✗ Catastrophe! The forge backfires — Burnt Hands (permanent).'
        : '✗ Botched! The metal cracks — Burnt Hands (7 days).')
    }
    setTimeout(() => setCraftMsg(null), 3500)
  }

  // Rarités disponibles pour le template sélectionné
  const availableRarities = template
    ? RARITY_TIERS.filter(r => template.craftRecipes?.[r])
    : []

  return (
    <Panel title="🔨 Blacksmith's Forge" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        "The forge roars. The smith nods at you."
      </p>

      <div className="flex gap-4" style={{ maxWidth: '580px' }}>
        {/* Liste des templates */}
        <div className="flex flex-col gap-1" style={{ width: '180px', flexShrink: 0 }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Items
          </p>
          {['weapon', 'helmet', 'armor', 'boots'].map(slot => (
            <div key={slot}>
              <p style={{ color: '#3a2a1a', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.4rem', marginBottom: '0.2rem' }}>
                {slot}
              </p>
              {smithTemplates.filter(t => t.slot === slot).map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setSelectedRarity('common'); setCraftMsg(null) }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs mb-0.5"
                  style={{
                    background: selectedTemplate === t.id ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                    color: selectedTemplate === t.id ? 'var(--amber-deep)' : 'var(--ink-soft)',
                    border: `1px solid ${selectedTemplate === t.id ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                    fontFamily: 'Cinzel, serif',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Détail du craft */}
        <div className="flex-1 flex flex-col gap-3">
          {!template ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontStyle: 'italic' }}>
              Select an item to craft.
            </p>
          ) : (
            <>
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', color: 'var(--amber-deep)', fontSize: '0.95rem' }}>{template.name}</p>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{template.description}</p>
              </div>

              {/* Sélecteur de rareté */}
              <div className="flex flex-wrap gap-1">
                {availableRarities.map(r => {
                  const rc = RARITY_CONFIG[r]
                  return (
                    <button
                      key={r}
                      onClick={() => { setSelectedRarity(r); setCraftMsg(null) }}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: rc.color,
                        background: selectedRarity === r ? 'rgba(212,160,23,.2)' : 'rgba(201,169,110,.18)',
                        border: `1px solid ${selectedRarity === r ? rc.color : 'var(--parchment-shadow)'}`,
                      }}
                    >
                      {rc.label}
                    </button>
                  )
                })}
              </div>

              {/* Recette */}
              {recipe && (
                <div className="flex flex-col gap-1">
                  <p style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recipe
                  </p>
                  {Object.entries(recipe.ingredients).map(([resId, qty]) => {
                    const res = RESOURCES[resId]
                    const owned = hero.inventory.resources[resId] ?? 0
                    const ok = owned >= qty
                    return (
                      <div key={resId} className="flex justify-between items-center"
                        // Z03 — grise les ingrédients manquants
                        style={{ fontSize: '0.78rem', opacity: ok ? 1 : 0.6 }}>
                        <span style={{ color: ok ? 'var(--forest-deep)' : '#c04040' }}>
                          {ok ? '✓' : '✗'} {res?.name ?? resId}
                        </span>
                        <span style={{ color: ok ? '#6a9a4a' : '#8a3a2a' }}>
                          {owned}/{qty}
                        </span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center mt-1" style={{ fontSize: '0.78rem' }}>
                    <span style={{ color: hasGold ? 'var(--forest-deep)' : '#c04040' }}>
                      {hasGold ? '✓' : '✗'} Gold
                    </span>
                    <span style={{ color: hasGold ? '#6a9a4a' : '#8a3a2a' }}>
                      {hero.inventory.gold}/{recipe.gold}g
                    </span>
                  </div>
                </div>
              )}

              {/* Stat preview */}
              {recipe && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                  {Object.entries(template.baseStats).map(([s, v]) => (
                    <span key={s} style={{ marginRight: '0.75rem', color: RARITY_CONFIG[selectedRarity].color }}>
                      +{Math.round(v * RARITY_CONFIG[selectedRarity].mult)} {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Bouton craft */}
              <button
                onClick={handleCraft}
                disabled={!canDoCraft}
                className="px-4 py-2 rounded text-sm transition-all"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: canDoCraft ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                  color: canDoCraft ? 'var(--amber-deep)' : 'var(--ink-soft)',
                  border: `1px solid ${canDoCraft ? '#6a5018' : 'var(--parchment-shadow)'}`,
                  cursor: canDoCraft ? 'pointer' : 'not-allowed',
                }}
              >
                🔨 Craft {RARITY_CONFIG[selectedRarity]?.label} {template.name}
              </button>

              {/* Z03 — Raison du blocage explicite */}
              {recipe && !canDoCraft && (
                <p data-testid="craft-blocked-reason" style={{ color: '#8a4030', fontSize: '0.72rem', fontStyle: 'italic' }}>
                  {!hasIngredients && !hasGold
                    ? 'Missing ingredients and gold.'
                    : !hasIngredients
                    ? 'Missing ingredients (see ✗ above).'
                    : 'Not enough gold.'}
                </p>
              )}

              {craftMsg && (
                <p style={{ color: craftMsg.startsWith('✗') ? '#c06040' : 'var(--forest-deep)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}>
                  {craftMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* CRF03 — mini-jeu de forge */}
      <CraftingMinigame
        open={minigameOpen}
        mode="forge"
        title={`Forge — ${template?.name ?? ''}`}
        onComplete={handleMinigameComplete}
      />
    </Panel>
  )
}

// ── Sir Aldric — Knight Trainer ───────────────────────────────────────────────

// Skills qu'Aldric peut enseigner directement (contre or/ressources)
const ALDRIC_TRADES = [
  {
    skillId: 'power_strike',
    cost: { gold: 80 },
    description: 'A focused blow. A warrior\'s first lesson.',
  },
  {
    skillId: 'shield_stance',
    cost: { gold: 100 },
    description: 'Defense is as vital as offense.',
  },
  {
    skillId: 'battle_focus',
    cost: { gold: 120, resources: { wolf_pelt: 3 } },
    description: 'Focus forged from the hunt.',
  },
]

function KnightTrainerPanel({ onBack }) {
  const { hero, world, spendGold, removeResource, addSkillToInventory, startQuest, completeQuest, isQuestComplete } = useGameStore()
  const [tab, setTab] = useState('quests') // 'quests' | 'trades'
  const [msg, setMsg] = useState(null)

  // Garde-fous pour les anciennes sauvegardes avec format incorrect
  const activeQuests = Array.isArray(world.activeQuests) ? world.activeQuests : []
  const completedQuests = Array.isArray(world.completedQuests) ? world.completedQuests : []

  const flash = (text, color = 'var(--forest-deep)') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 2500)
  }

  const handleTrade = (trade) => {
    const { cost, skillId } = trade
    if (hero.inventory.gold < (cost.gold ?? 0)) return flash('Not enough gold.', '#c04040')
    if (cost.resources) {
      for (const [resId, qty] of Object.entries(cost.resources)) {
        if ((hero.inventory.resources[resId] ?? 0) < qty)
          return flash(`Not enough ${RESOURCES[resId]?.name ?? resId}.`, '#c04040')
      }
    }
    const alreadyOwns =
      hero.inventory.manaStones.some(s => s.skillId === skillId) ||
      hero.activeSkills.some(s => s.skillId === skillId) ||
      hero.passiveSkills.some(s => s.skillId === skillId)
    if (alreadyOwns) return flash('You already know this skill.', '#c04040')

    spendGold(cost.gold ?? 0)
    if (cost.resources) {
      for (const [resId, qty] of Object.entries(cost.resources)) removeResource(resId, qty)
    }
    addSkillToInventory({ skillId, level: 1, xp: 0 })
    flash(`Learned: ${SKILLS[skillId]?.name ?? skillId}!`)
  }

  const questIds = Object.keys(QUESTS).filter(qId => QUESTS[qId].giverNpc === 'sir_aldric')

  return (
    <Panel title="⚔ Sir Aldric — Knight of Millhaven" onBack={onBack}>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.83rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
        "I have fought for twenty years. Let me spare you the worst of the lessons."
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['quests', 'trades'].map(t => (
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
            {t === 'quests' ? '📜 Quests' : '⚔ Techniques'}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mb-3" style={{ color: msg.color, fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}>
          {msg.text}
        </p>
      )}

      {/* ── Tab Quêtes ── */}
      {tab === 'quests' && (
        <div className="flex flex-col gap-3" style={{ maxWidth: '460px' }}>
          {questIds.map((questId) => {
            const quest = QUESTS[questId]
            const isActive = activeQuests.includes(questId)
            const isDone = completedQuests.includes(questId)
            const canComplete = isActive && isQuestComplete(questId)

            let statusColor = 'var(--ink-soft)'
            let statusLabel = 'Not started'
            if (isDone) { statusColor = 'var(--forest-deep)'; statusLabel = 'Completed ✓' }
            else if (canComplete) { statusColor = 'var(--amber-deep)'; statusLabel = 'Ready to claim!' }
            else if (isActive) { statusColor = '#6a9a4a'; statusLabel = 'In progress' }

            return (
              <div
                key={questId}
                className="p-3 rounded"
                style={{
                  background: 'rgba(201,169,110,.18)',
                  border: `1px solid ${isDone ? 'rgba(74,124,47,.16)' : canComplete ? '#4a3a18' : 'var(--parchment-shadow)'}`,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p style={{ fontFamily: 'Cinzel, serif', color: isDone ? '#4a5a2a' : 'var(--amber-deep)', fontSize: '0.88rem' }}>
                      {quest.name}
                    </p>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '0.75rem', marginTop: '0.2rem', fontStyle: 'italic' }}>
                      {quest.flavorText}
                    </p>
                    {/* Objectifs */}
                    <div className="mt-2 flex flex-col gap-0.5">
                      {quest.objectives.map((obj) => {
                        let current = 0
                        let target = 0
                        if (obj.type === 'kill') {
                          current = world.monsterKillCounts[obj.monsterId] ?? 0
                          target = obj.count
                        } else if (obj.type === 'level') {
                          current = hero.level
                          target = obj.targetLevel
                        }
                        const done = current >= target
                        return (
                          <p key={obj.id} style={{ color: done ? 'var(--forest-deep)' : 'var(--ink-soft)', fontSize: '0.72rem' }}>
                            {done ? '✓' : '○'} {obj.label} ({Math.min(current, target)}/{target})
                          </p>
                        )
                      })}
                    </div>
                    {/* Récompense */}
                    <p style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', marginTop: '0.4rem' }}>
                      Reward: {quest.reward.skill && `${SKILLS[quest.reward.skill.skillId]?.name ?? quest.reward.skill.skillId}`}
                      {quest.reward.gold && ` · ${quest.reward.gold}g`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p style={{ color: statusColor, fontSize: '0.68rem', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap' }}>
                      {statusLabel}
                    </p>
                    {!isActive && !isDone && (
                      <button
                        onClick={() => { startQuest(questId); flash(`Quest accepted: ${quest.name}`) }}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ fontFamily: 'Cinzel, serif', background: 'rgba(74,124,47,.16)', color: 'var(--forest-deep)', border: '1px solid rgba(74,124,47,.4)' }}
                      >
                        Accept
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={() => { completeQuest(questId); flash(`Quest complete! Reward claimed.`) }}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ fontFamily: 'Cinzel, serif', background: 'rgba(212,160,23,.18)', color: 'var(--amber-deep)', border: '1px solid #4a3a18' }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab Techniques ── */}
      {tab === 'trades' && (
        <div className="flex flex-col gap-2" style={{ maxWidth: '460px' }}>
          <InfoLine label="Gold" value={`${hero.inventory.gold}g`} />
          <div className="mt-2 flex flex-col gap-2">
            {ALDRIC_TRADES.map((trade) => {
              const skill = SKILLS[trade.skillId]
              if (!skill) return null
              const alreadyOwns =
                hero.inventory.manaStones.some(s => s.skillId === trade.skillId) ||
                hero.activeSkills.some(s => s.skillId === trade.skillId) ||
                hero.passiveSkills.some(s => s.skillId === trade.skillId)
              const canAffordGold = hero.inventory.gold >= (trade.cost.gold ?? 0)
              const canAffordRes = !trade.cost.resources || Object.entries(trade.cost.resources).every(
                ([resId, qty]) => (hero.inventory.resources[resId] ?? 0) >= qty
              )
              const canBuy = canAffordGold && canAffordRes && !alreadyOwns

              const costLabel = [
                trade.cost.gold && `${trade.cost.gold}g`,
                ...(trade.cost.resources
                  ? Object.entries(trade.cost.resources).map(([rId, q]) => `${q}× ${RESOURCES[rId]?.name ?? rId}`)
                  : []),
              ].filter(Boolean).join(' + ')

              return (
                <div
                  key={trade.skillId}
                  className="flex items-center justify-between p-3 rounded"
                  style={{
                    background: 'rgba(201,169,110,.18)',
                    border: `1px solid ${alreadyOwns ? 'rgba(74,124,47,.16)' : 'var(--parchment-shadow)'}`,
                    opacity: alreadyOwns ? 0.55 : 1,
                  }}
                >
                  <div className="flex-1">
                    <p style={{ fontFamily: 'Cinzel, serif', color: 'var(--amber-deep)', fontSize: '0.88rem' }}>
                      {skill.name}
                      <span className="ml-2 text-xs" style={{ color: skill.type === 'active' ? '#60c0a0' : '#c084fc' }}>
                        [{skill.type}]
                      </span>
                    </p>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '0.73rem', fontStyle: 'italic', marginTop: '0.15rem' }}>
                      {trade.description}
                    </p>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                      Cost: {costLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTrade(trade)}
                    disabled={!canBuy}
                    className="ml-3 px-3 py-1 rounded text-xs shrink-0"
                    style={{
                      fontFamily: 'Cinzel, serif',
                      background: alreadyOwns ? 'rgba(201,169,110,.18)' : canBuy ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                      color: alreadyOwns ? '#3a4a2a' : canBuy ? 'var(--amber-deep)' : 'var(--ink-soft)',
                      border: `1px solid ${alreadyOwns ? 'rgba(74,124,47,.16)' : canBuy ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {alreadyOwns ? '✓ Known' : 'Learn'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Panel>
  )
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function Panel({ title, onBack, children }) {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}
        >
          ← Back
        </button>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--amber-deep)', fontSize: '1rem' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--parchment-shadow)' }}>
      <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}>{label}</span>
      <span style={{ color: 'var(--amber-deep)', fontSize: '0.85rem' }}>{value}</span>
    </div>
  )
}

function SidebarStat({ label, value, color }) {
  return (
    <div>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ color, fontSize: '0.9rem' }}>{value}</p>
    </div>
  )
}
