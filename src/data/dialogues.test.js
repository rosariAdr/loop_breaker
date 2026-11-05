// NPC01 — Tests du système de dialogue (data + intégrité de l'arbre)
import { describe, it, expect } from 'vitest'
import {
  DIALOGUES,
  getDialogue,
  getNode,
  BUILDING_DIALOGUE_ID,
  FALLBACK_DIALOGUE,
} from './dialogues'

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

describe('DLG01 — aucun PNJ nommé ne retombe sur le FALLBACK', () => {
  const fallbackText = FALLBACK_DIALOGUE.nodes[FALLBACK_DIALOGUE.startId].text

  it('chaque bâtiment mappé résout vers un arbre dédié (pas null, pas FALLBACK)', () => {
    for (const [building, id] of Object.entries(BUILDING_DIALOGUE_ID)) {
      const d = getDialogue(id)
      expect(d, `${building} → ${id} doit avoir un arbre dédié`).not.toBeNull()
      const greet = getNode(d, d.startId)
      expect(greet.text).toBeTruthy()
      expect(greet.text, `${building} ne doit pas parler comme le FALLBACK`).not.toBe(fallbackText)
    }
  })

  it('les 5 PNJ jadis génériques ont désormais un arbre (régression DLG01)', () => {
    for (const id of [
      'guild_master',
      'master_hollis',
      'knight_aldric',
      'alchemist_vesna',
      'academy_oren',
    ]) {
      expect(getDialogue(id), `${id} manquant`).not.toBeNull()
    }
  })
})
