import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import GreywatchScene from './GreywatchScene'
import { GREYWATCH_SCENE, getVillageLighting } from './villageScenes'

afterEach(cleanup)

function Scene(props) {
  return <GreywatchScene tick={12} heroName="Kael" buildings={['inn', 'church']} {...props} />
}

describe('Greywatch — éclairage et décor', () => {
  it.each([
    [0, 'night'],
    [5, 'night'],
    [6, 'day'],
    [13, 'day'],
    [14, 'afternoon'],
    [17, 'afternoon'],
    [18, 'dusk'],
    [20, 'dusk'],
    [21, 'night'],
    [23, 'night'],
    [24, 'night'],
  ])('à %ih, affiche le fond %s', (tick, lighting) => {
    render(<Scene tick={tick} />)
    expect(screen.getByRole('region', { name: 'Greywatch village' })).toHaveAttribute(
      'data-lighting',
      lighting,
    )
    expect(screen.getByAltText('Greywatch countryside and watchtower')).toHaveAttribute(
      'src',
      `/villages/greywatch/background-${lighting}.png`,
    )
  })

  it('tous les fonds et sprites configurés existent dans public', () => {
    const sources = [
      ...[0, 6, 14, 18].map(
        (tick) => `${GREYWATCH_SCENE.root}/background-${getVillageLighting(tick)}.png`,
      ),
      ...GREYWATCH_SCENE.decorations.map((sprite) => sprite.src),
      ...GREYWATCH_SCENE.npcs.map((sprite) => sprite.src),
    ]
    for (const src of sources) expect(existsSync(resolve('public', src.slice(1))), src).toBe(true)
  })

  it('actualise le décor et les enfants au passage de 18h, puis au matin', () => {
    const { rerender } = render(<Scene tick={17} />)
    expect(screen.getByAltText(/Children playing/)).toBeInTheDocument()
    rerender(<Scene tick={18} />)
    expect(screen.queryByAltText(/Children playing/)).toBeNull()
    expect(screen.getByRole('region')).toHaveAttribute('data-lighting', 'dusk')
    rerender(<Scene tick={8} />)
    expect(screen.getByAltText(/Children playing/)).toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveAttribute('data-lighting', 'day')
  })

  it.each([0, 7, 18, 23])('les enfants sont absents à %ih', (tick) => {
    render(<Scene tick={tick} />)
    expect(screen.queryByAltText(/Children playing/)).toBeNull()
  })

  it('Moira et le bûcheron sont des images décoratives sans commande au clic', () => {
    render(<Scene />)
    for (const name of [/Elder Moira/, /Village woodcutter/]) {
      const npc = screen.getByAltText(name)
      expect(npc.closest('button, [role="button"], a')).toBeNull()
      expect(npc).not.toHaveAttribute('tabindex')
    }
  })

  it('une forge remplace la maison décorative au même emplacement', () => {
    const { rerender } = render(<Scene />)
    expect(screen.getAllByAltText('Village cottage')).toHaveLength(2)
    rerender(<Scene buildings={['inn', 'church', 'blacksmith']} />)
    expect(screen.getAllByAltText('Village cottage')).toHaveLength(1)
  })

  it('les deux portes permettent de quitter le village', () => {
    const onLeave = vi.fn()
    render(<Scene onLeave={onLeave} />)
    fireEvent.click(screen.getByRole('button', { name: /south gate/ }))
    fireEvent.click(screen.getByRole('button', { name: /east gate/ }))
    expect(onLeave).toHaveBeenCalledTimes(2)
  })
})
