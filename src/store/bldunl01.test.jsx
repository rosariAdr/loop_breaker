// BLDUNL01/05 — Modèle de déblocage des bâtiments : helper pur, actions store
// (lock/unlock + sélecteur) et feedback « verrouillé » au rendu (refus d'entrée).
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SafeZone from '../screens/SafeZone'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'
import {
  isBuildingUnlocked as isUnlockedPure,
  buildingLockReason,
  BUILDING_UNLOCKS,
} from '../data/buildingUnlocks'

const s = () => useGameStore.getState()

beforeEach(() => {
  s().resetGame()
  useToastStore.getState().clearToasts()
  localStorage.clear()
})
afterEach(cleanup)

describe('BLDUNL01 — helper pur isBuildingUnlocked', () => {
  it('déverrouillé par défaut (aucun verrou), id inconnu compris', () => {
    expect(isUnlockedPure('inn', [])).toBe(true)
    expect(isUnlockedPure('unknown_bld', [])).toBe(true)
  })
  it('verrouillé si présent dans buildingLocks', () => {
    expect(isUnlockedPure('alchemy', ['alchemy'])).toBe(false)
  })
  it('chaque bâtiment du modèle expose une raison de verrou (string)', () => {
    for (const id of Object.keys(BUILDING_UNLOCKS)) {
      expect(typeof buildingLockReason(id)).toBe('string')
    }
  })
})

describe('BLDUNL01 — store : lock / unlock + sélecteur', () => {
  it('rien de verrouillé au démarrage (POC jouable inchangé)', () => {
    expect(s().world.buildingLocks).toEqual([])
    expect(s().isBuildingUnlocked('blacksmith')).toBe(true)
  })
  it('lockBuilding verrouille (idempotent), unlockBuilding libère', () => {
    s().lockBuilding('alchemy')
    expect(s().isBuildingUnlocked('alchemy')).toBe(false)
    expect(s().world.buildingLocks).toContain('alchemy')

    s().lockBuilding('alchemy') // idempotent
    expect(s().world.buildingLocks.filter((b) => b === 'alchemy')).toHaveLength(1)

    s().unlockBuilding('alchemy')
    expect(s().isBuildingUnlocked('alchemy')).toBe(true)
    expect(s().world.buildingLocks).not.toContain('alchemy')
  })
})

describe('BLDUNL05 — feedback bâtiment verrouillé (rendu SafeZone)', () => {
  function enterCity() {
    useGameStore.setState((st) => ({
      currentScreen: 'safe_zone',
      world: {
        ...st.world,
        currentZone: 'ashenvale',
        currentLocation: 'ironhaven',
        tickCount: 12,
      },
    }))
  }

  it('un bâtiment verrouillé est grisé (.bld-locked) et refuse l’entrée', () => {
    enterCity()
    s().lockBuilding('academy')
    render(<SafeZone />)

    expect(document.querySelector('.bld-locked')).not.toBeNull()

    fireEvent.click(screen.getAllByText('Academy of Magic')[0])
    // pas d’overlay PNJ + toast indiquant la raison
    expect(screen.queryByText(/Enter the Academy/)).toBeNull()
    const toast = useToastStore.getState().toasts.find((t) => /Reach a major city/.test(t.message))
    expect(toast).toBeDefined()
  })

  it('déverrouillé (défaut) → l’entrée fonctionne', () => {
    enterCity()
    render(<SafeZone />)
    fireEvent.click(screen.getAllByText('Academy of Magic')[0]) // dialogue PNJ
    fireEvent.click(screen.getByText(/Enter the Academy/)) // panneau
    expect(document.querySelector('.npc-panel-host')).not.toBeNull()
  })
})
