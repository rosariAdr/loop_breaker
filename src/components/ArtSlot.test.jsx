// CONT01 — ArtSlot : rendu image (src) + fallback gracieux sur placeholder légendé si l'image manque.
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ArtSlot } from './parchment'

afterEach(() => cleanup())

describe('CONT01 — ArtSlot façade bâtiment', () => {
  it('avec src → rend une <img> sur ce chemin', () => {
    render(<ArtSlot caption="The Hearth Inn" src="/buildings/inn.png" w={120} h={80} />)
    const img = document.querySelector('img')
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toBe('/buildings/inn.png')
  })

  it('sans src → affiche le placeholder légendé', () => {
    render(<ArtSlot caption="Adventurers' Guild" w={120} h={80} />)
    expect(screen.getByText("Adventurers' Guild")).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
  })

  it('image manquante (onError) → retombe sur le placeholder légendé', () => {
    render(<ArtSlot caption="Master Smith" src="/buildings/master_smith.png" w={120} h={80} />)
    // au départ on tente l'image…
    const img = document.querySelector('img')
    expect(img).not.toBeNull()
    // …puis 404 → fallback sur la légende
    fireEvent.error(img)
    expect(screen.getByText('Master Smith')).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
  })
})
