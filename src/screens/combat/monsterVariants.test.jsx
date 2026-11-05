import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateEnemies } from '../../engine/combat'
import { MONSTERS } from '../../data/monsters'
import { getMonsterLevel } from '../../data/zones'
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

  it('adapte les groupes au niveau de chaque monstre, quelle que soit la zone ou le run', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    for (const zone of ['ashenvale', 'blighted_road', 'grimspire']) {
      for (const monsterId of ['ashwood_wolf', 'hill_slime', 'marsh_serpent', 'grimstone_troll']) {
        const monsterLevel = getMonsterLevel(monsterId)
        for (const run of [1, 10]) {
          for (const [gap, max] of [
            [-1, 2],
            [0, 2],
            [1, 3],
            [2, 3],
            [3, 4],
          ]) {
            const heroLevel = Math.max(1, monsterLevel + gap)
            expect(generateEnemies(monsterId, zone, run, heroLevel)).toHaveLength(max)
          }
        }
      }
    }
  })

  it('conserve le portrait principal pour les anciens combats sans variante enregistrée', () => {
    const [enemy] = generateEnemies('thicket_hare', 'ashenvale', 1)
    delete enemy.portraitSrc
    const { container } = render(<EnemyCard enemy={enemy} />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/monsters/thicket_hare.png')
  })
})
