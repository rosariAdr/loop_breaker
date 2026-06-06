// NPC01 — Tests du système de dialogue (data + intégrité de l'arbre)
import { describe, it, expect } from 'vitest'
import { DIALOGUES, getDialogue, getNode } from './dialogues'

describe('NPC01 — dialogues', () => {
  it('getDialogue retourne un dialogue existant, null sinon', () => {
    expect(getDialogue('village_elder')).toBe(DIALOGUES.village_elder)
    expect(getDialogue('nope')).toBeNull()
  })

  it('getNode retourne le bon nœud, null sinon', () => {
    const d = getDialogue('village_elder')
    expect(getNode(d, d.startId).text).toBeTruthy()
    expect(getNode(d, 'nope')).toBeNull()
    expect(getNode(null, 'x')).toBeNull()
  })

  it('le startId existe dans chaque dialogue', () => {
    for (const d of Object.values(DIALOGUES)) {
      expect(d.nodes[d.startId]).toBeDefined()
    }
  })

  it('chaque option pointe vers un nœud existant ou termine (null)', () => {
    for (const d of Object.values(DIALOGUES)) {
      for (const node of Object.values(d.nodes)) {
        expect(Array.isArray(node.options)).toBe(true)
        for (const opt of node.options) {
          if (opt.nextId != null) expect(d.nodes[opt.nextId]).toBeDefined()
        }
      }
    }
  })
})
