// NPC01 — Système de dialogue NPC (arbre simple).
// Un dialogue = { startId, nodes: { [id]: DialogueNode } }
// DialogueNode = { text, options: [{ label, nextId }] }
//   - option.nextId = id d'un autre nœud → navigation
//   - option.nextId = null → termine le dialogue (ferme le panneau)
// Base réutilisable pour NPC04 (maîtres de bâtiment), TAV01 (informateurs),
// GLD01 (guilde), ACA* (académie). 2–3 nœuds max par PNJ pour le POC.

export const DIALOGUES = {
  // Chef de village générique (présent à toute heure tant que BLD01 n'est pas fait)
  village_elder: {
    startId: 'greet',
    nodes: {
      greet: {
        text: 'Well met, traveler. These are troubled times for our little village.',
        options: [
          { label: 'What troubles you?', nextId: 'trouble' },
          { label: 'Is there work for me?', nextId: 'work' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      trouble: {
        text: "Beasts from the forest grow bolder each night. We've lost two flocks already.",
        options: [
          { label: "I'll see what I can do.", nextId: 'thanks' },
          { label: '(Back)', nextId: 'greet' },
        ],
      },
      work: {
        text: 'Speak with the innkeeper — she keeps the quest board, and a warm hearth besides.',
        options: [
          { label: '(Back)', nextId: 'greet' },
        ],
      },
      thanks: {
        text: 'The Old Gods smile on you. Walk safe out there, hero.',
        options: [
          { label: 'Farewell.', nextId: null },
        ],
      },
    },
  },
}

/** Récupère un dialogue par son id (ou null). */
export function getDialogue(id) {
  return DIALOGUES[id] ?? null
}

/** Récupère un nœud d'un dialogue (ou null). */
export function getNode(dialogue, nodeId) {
  return dialogue?.nodes?.[nodeId] ?? null
}
