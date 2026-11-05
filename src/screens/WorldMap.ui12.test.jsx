// UI12 — bande cinématique 3:2 : test de non-régression structure/layout.
// jsdom ne calcule pas le layout réel (aspect-ratio/container queries) → on garde
// les invariants STRUCTURELS qui portent la correction : le wrapper .wm-band existe,
// .wm-map n'est plus en `fill` (sa géométrie vient du CSS 3:2), et les éléments
// positionnés en % (nodes, héros, fog) restent DANS .wm-map → coords POS alignées.
// La vérification du ratio réel (±2 % à 1366×768 / 1920×1080) est faite en recette
// navigateur (docs/TEST_SCENARIOS.md · S9) — pas simulable ici.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import WorldMap from './WorldMap'
import { useGameStore } from '../store/gameStore'
import { POS, NODES } from '../data/worldGraph'

beforeEach(() => {
  useGameStore.getState().resetGame()
})

describe('UI12 — bande cinématique 3:2 (structure)', () => {
  it('le wrapper .wm-band (fill) contient la boîte .wm-map', () => {
    render(<WorldMap />)
    const band = screen.getByTestId('wm-band')
    const map = screen.getByTestId('wm-map')
    expect(band.classList.contains('wm-band')).toBe(true)
    expect(band.classList.contains('fill')).toBe(true)
    expect(map.classList.contains('wm-map')).toBe(true)
    expect(band.contains(map)).toBe(true)
  })

  it(".wm-map n'est plus en `fill` (sa taille vient du ratio 3:2, pas de inset:0)", () => {
    render(<WorldMap />)
    expect(screen.getByTestId('wm-map').classList.contains('fill')).toBe(false)
  })

  it('fond, voile et trails restent dans .wm-map (alignés sur la boîte 3:2)', () => {
    render(<WorldMap />)
    const map = screen.getByTestId('wm-map')
    expect(map.querySelector('.wm-bg')).not.toBeNull()
    expect(map.querySelector('.wm-overlay')).not.toBeNull()
    expect(map.querySelector('.wm-trails')).not.toBeNull()
  })

  it('les nodes gardent leurs coordonnées POS en % et vivent dans .wm-map', () => {
    render(<WorldMap />)
    const map = screen.getByTestId('wm-map')
    const nodes = map.querySelectorAll('.wm-node')
    // tous les nodes du graphe (hors donjon non découvert) sont rendus dans la boîte
    expect(nodes.length).toBeGreaterThanOrEqual(NODES.length)
    for (const el of nodes) {
      expect(el.style.left).toMatch(/%$/)
      expect(el.style.top).toMatch(/%$/)
    }
    // échantillon : Greywatch rend exactement ses % de POS (aucun recalage)
    const gw = [...nodes].find((el) => el.textContent.includes('Greywatch'))
    expect(gw.style.left).toBe(`${POS.greywatch.x}%`)
    expect(gw.style.top).toBe(`${POS.greywatch.y}%`)
  })

  it('héros et légende restent dans .wm-map (pas orphelins dans la bande)', () => {
    render(<WorldMap />)
    const map = screen.getByTestId('wm-map')
    expect(map.querySelector('.hero-avatar')).not.toBeNull()
    expect(map.contains(screen.getByTestId('wm-legend'))).toBe(true)
  })
})
