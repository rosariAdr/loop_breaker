import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'
import { ZONES } from '../data/zones'
import { isBuildingOpen, nextOpenHour } from '../data/buildingHours'
import { ArtSlot, HeroAvatar, ParchmentFrame } from '../components/parchment'
import { buildingLockReason } from '../data/buildingUnlocks'
import InformantsPanel from '../components/InformantsPanel'
import { BLD_POS } from './safezone/constants'
import NpcOverlay from './safezone/NpcOverlay'
import VilBuilding from './safezone/VilBuilding'
import ChurchPanel from './safezone/ChurchPanel'
import MerchantPanel from './safezone/MerchantPanel'
import AlchemyPanel from './safezone/AlchemyPanel'
import BlacksmithPanel from './safezone/BlacksmithPanel'
import MasterSmithPanel from './safezone/MasterSmithPanel'
import KnightTrainerPanel from './safezone/KnightTrainerPanel'
import AcademyPanel from './safezone/AcademyPanel'

const HERO_SPRITE = '/sprites/hero/idle/00.png'

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
  const { world, setScreen, hero, isBuildingUnlocked } = useGameStore()
  const [activeBuilding, setActiveBuilding] = useState(null)
  const [showPanel, setShowPanel] = useState(false)

  const openBuilding = (id) => {
    // BLDUNL05 — un bâtiment verrouillé refuse l'entrée + indique la raison.
    if (!isBuildingUnlocked(id)) {
      useToastStore
        .getState()
        .addToast(`${BUILDING_INFO[id]?.name ?? id} — ${buildingLockReason(id)}.`, 'warning')
      return
    }
    // BLD01 — un bâtiment fermé refuse l'entrée + indique son heure d'ouverture (inn = 24/24).
    if (!isBuildingOpen(id, world.tickCount)) {
      useToastStore
        .getState()
        .addToast(
          `${BUILDING_INFO[id]?.name ?? id} is closed — opens at ${nextOpenHour(id)}:00.`,
          'warning',
        )
      return
    }
    setActiveBuilding(id)
    setShowPanel(false)
  }
  const closeBuilding = () => {
    setActiveBuilding(null)
    setShowPanel(false)
  }

  const zone = ZONES[world.currentZone]
  const isCity = zone?.city?.id === world.currentLocation
  // Trouver la localisation actuelle
  const location = zone
    ? isCity
      ? zone.city
      : zone.villages?.find((v) => v.id === world.currentLocation)
    : null

  // Génération paresseuse des bâtiments optionnels d'un village.
  // generateVillageBuildings est déterministe (seedé sur l'id du village),
  // donc le render peut la calculer sans la persister. La persistance dans le
  // store DOIT passer par un effet : un setState pendant le render de SafeZone
  // déclenchait un update d'App pendant le rendu (warning React).
  const needsGeneration = Boolean(
    location && !isCity && location.optionalBuildings && !world.generatedVillages?.[location.id],
  )
  useEffect(() => {
    if (!needsGeneration) return
    const optional = generateVillageBuildings(location.id, location.optionalBuildings)
    useGameStore.setState((state) => ({
      world: {
        ...state.world,
        generatedVillages: {
          ...state.world.generatedVillages,
          [location.id]: { buildings: optional },
        },
      },
    }))
    // DX-LINT01 — génération unique du village (gated par needsGeneration) : deps assumées
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsGeneration, location?.id])

  if (!zone) return null
  if (!location) return null

  // Construire la liste des bâtiments disponibles
  let buildings = [...(location.buildings ?? [])]
  if (!isCity && location.optionalBuildings) {
    // Déterministe : utilise la valeur persistée si présente, sinon recalcule
    // (résultat identique) — l'effet ci-dessus se charge de la sauvegarde.
    const stored = world.generatedVillages?.[location.id]
    const optional = stored
      ? stored.buildings
      : generateVillageBuildings(location.id, location.optionalBuildings)
    buildings = [...buildings, ...optional]
  }

  const BUILDING_INFO = {
    inn: { icon: '🍺', name: 'The Hearth Inn', color: '#c08040' },
    church: { icon: '⛪', name: 'Church of the Old Gods', color: '#c0a060' },
    merchant: { icon: '🛒', name: "Merchant's Stall", color: '#60c080' },
    alchemy: { icon: '⚗️', name: 'Alchemy Workshop', color: '#8060c0' },
    blacksmith: { icon: '🔨', name: "Blacksmith's Forge", color: '#808080' },
    master_smith: { icon: '🛠', name: 'Master Smith', color: '#c0a060' }, // Z06
    knight_trainer: { icon: '⚔', name: 'Sir Aldric — Knight Trainer', color: '#c08040' },
    academy: { icon: '📜', name: 'Academy of Magic', color: '#8060c0' }, // ACA01
    guild: { icon: '⚜', name: "Adventurers' Guild", color: '#c084fc' }, // GLD01
  }

  return (
    <>
      {/* ── Carte du village (parchemin) ─────────────────────────────── */}
      <div className="parchment fill village">
        <ParchmentFrame variant="vine" />

        <button
          className="back-btn"
          onClick={() => {
            setActiveBuilding(null)
            setScreen('world_map')
          }}
        >
          ← Map
        </button>

        <div className="zone-header vil-header">
          <div className="t-zone zh-title">{location.name}</div>
          <div className="t-sub zh-sub">
            {isCity ? '🏰 Major City' : '🏘 Village'} · {zone.name}
          </div>
        </div>

        {/* Place centrale en terre battue */}
        <div className="vil-square" />

        {/* Chemins du puits vers chaque bâtiment */}
        <svg className="vil-paths" preserveAspectRatio="none">
          {buildings.map((id) => {
            const p = BLD_POS[id]
            if (!p) return null
            return (
              <line
                key={id}
                x1="50%"
                y1="50%"
                x2={`${p.x}%`}
                y2={`${p.y}%`}
                stroke="#c9b083"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.55"
              />
            )
          })}
        </svg>

        {/* Puits au centre */}
        <div className="vil-well">
          <ArtSlot caption="village well" w={84} h={66} />
        </div>

        {/* Bâtiments */}
        {buildings.map((id) => (
          <VilBuilding
            key={id}
            id={id}
            info={BUILDING_INFO[id]}
            closed={!isBuildingOpen(id, world.tickCount)}
            locked={!isBuildingUnlocked(id)}
            lockReason={buildingLockReason(id)}
            onClick={() => openBuilding(id)}
          />
        ))}

        {/* Héros près du puits */}
        <HeroAvatar x="50%" y="40%" name={hero.name} src={HERO_SPRITE} />
      </div>

      {/* ── UI05/IMM02 — Dialogue PNJ + panneau fonctionnel DANS LA MÊME fenêtre ── */}
      {activeBuilding && (
        <NpcOverlay
          building={activeBuilding}
          isCity={isCity}
          showPanel={showPanel}
          onEnter={() => setShowPanel(true)}
          onClose={closeBuilding}
          panel={
            showPanel ? (
              activeBuilding === 'church' ? (
                <ChurchPanel onBack={() => setShowPanel(false)} />
              ) : activeBuilding === 'merchant' ? (
                <MerchantPanel onBack={() => setShowPanel(false)} zoneId={world.currentZone} />
              ) : activeBuilding === 'alchemy' ? (
                <AlchemyPanel onBack={() => setShowPanel(false)} />
              ) : activeBuilding === 'blacksmith' ? (
                <BlacksmithPanel onBack={() => setShowPanel(false)} zoneId={world.currentZone} />
              ) : activeBuilding === 'master_smith' ? (
                <MasterSmithPanel onBack={() => setShowPanel(false)} />
              ) : activeBuilding === 'knight_trainer' ? (
                <KnightTrainerPanel onBack={() => setShowPanel(false)} />
              ) : activeBuilding === 'academy' ? (
                <AcademyPanel onBack={() => setShowPanel(false)} />
              ) : (
                <InformantsPanel onBack={() => setShowPanel(false)} />
              )
            ) : null
          }
        />
      )}
    </>
  )
}
