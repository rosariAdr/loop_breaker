import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateEnemies } from '../../engine/combat'
import { MONSTERS } from '../../data/monsters'
import { monsterPortraitSrc } from '../../data/monsterPortraits'
import EnemyCard from './EnemyCard'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('portraits des combats multiples', () => {
  it('utilise toutes les variantes présentes pour chaque monstre', () => {
    const directory = resolve('public/monsters')
    const files = readdirSync(directory)
    for (const monsterId of Object.keys(MONSTERS)) {
      const available = files.filter(
        (file) => file === `${monsterId}.png` || new RegExp(`^${monsterId}_\\d+\\.png$`).test(file),
      )
      if (!available.length) continue
      const selected = available.map((_, index) => monsterPortraitSrc(monsterId, index))
      expect(new Set(selected).size).toBe(available.length)
      for (const src of selected) {
        expect(existsSync(resolve('public', src.slice(1)))).toBe(true)
      }
      expect(monsterPortraitSrc(monsterId, available.length)).toBe(selected[0])
    }
  })

  it('génère quatre ennemis avec des portraits stables et un retour à la première variante', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const enemies = generateEnemies('stone_golem', 'ashenvale', 1, 20)
    expect(enemies.map((enemy) => enemy.portraitSrc)).toEqual([
      '/monsters/stone_golem.png',
      '/monsters/stone_golem_2.png',
      '/monsters/stone_golem_3.png',
      '/monsters/stone_golem.png',
    ])
    const { container, rerender } = render(<EnemyCard enemy={enemies[1]} />)
    expect(container.querySelector('img')).toHaveAttribute('src', enemies[1].portraitSrc)
    rerender(<EnemyCard enemy={{ ...enemies[1], currentHp: 1 }} isSelected />)
    expect(container.querySelector('img')).toHaveAttribute('src', enemies[1].portraitSrc)
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
  })

  it('limite les débutants dans toutes les zones et permet quatre ennemis dans chacune', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    for (const zone of ['ashenvale', 'blighted_road', 'grimspire']) {
      expect(generateEnemies('ashwood_wolf', zone, 1, 1)).toHaveLength(2)
      expect(generateEnemies('ashwood_wolf', zone, 1, 10)).toHaveLength(3)
      const enemies = generateEnemies('ashwood_wolf', zone, 1, 20)
      expect(enemies).toHaveLength(4)
      expect(enemies.every((enemy) => enemy.portraitSrc === '/monsters/ashwood_wolf.png')).toBe(
        true,
      )
    }
  })

  it('conserve le portrait principal pour les anciens combats sans variante enregistrée', () => {
    const [enemy] = generateEnemies('thicket_hare', 'ashenvale', 1)
    delete enemy.portraitSrc
    const { container } = render(<EnemyCard enemy={enemy} />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/monsters/thicket_hare.png')
  })
})
