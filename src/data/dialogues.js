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

// ── NPC04 — Maîtres de bâtiment (2 nœuds, messages prédéfinis) ────────────────
Object.assign(DIALOGUES, {
  inn_marta: {
    startId: 'g',
    nodes: {
      g: { text: "Rest easy, love. A warm bed and a warmer stew — that's all the cure most roads need.", options: [
        { label: 'Heard any rumors?', nextId: 'r' },
        { label: 'Farewell.', nextId: null },
      ] },
      r: { text: "Folk whisper of lights in the old ruins at night. I'd steer clear, were I you — but you've that look about you.", options: [
        { label: 'Thanks, Marta.', nextId: null },
      ] },
    },
  },
  merchant_pell: {
    startId: 'g',
    nodes: {
      g: { text: "Everything's for sale, dearie — at the right price. Even a smile, if you're buying.", options: [
        { label: 'Where do your wares come from?', nextId: 'w' },
        { label: 'Farewell.', nextId: null },
      ] },
      w: { text: "Caravans, mostly. What the roads don't swallow, I sell. The rest... best not to ask.", options: [
        { label: '(Leave)', nextId: null },
      ] },
    },
  },
  blacksmith_bram: {
    startId: 'g',
    nodes: {
      g: { text: "Bring me ore and coin and I'll bring your enemies grief. Simple as that.", options: [
        { label: 'What makes a good blade?', nextId: 'b' },
        { label: 'Farewell.', nextId: null },
      ] },
      b: { text: "Patience and fire. Rush the forge and you'll get brittle steel — and a brittle death.", options: [
        { label: '(Leave)', nextId: null },
      ] },
    },
  },
  church_caelum: {
    startId: 'g',
    nodes: {
      g: { text: "The Old Gods watch even the faithless, child. The question is whether you'll watch back.", options: [
        { label: 'Why should I pledge?', nextId: 'p' },
        { label: 'Farewell.', nextId: null },
      ] },
      p: { text: "A god's favor is a blade you cannot drop. But favor is earned in deeds, not words. Go — earn it.", options: [
        { label: '(Leave)', nextId: null },
      ] },
    },
  },
})

// Dialogue de repli quand un PNJ n'a pas d'arbre dédié.
export const FALLBACK_DIALOGUE = {
  startId: 'g',
  nodes: { g: { text: 'Safe travels, stranger. The road is long, and the night is longer.', options: [{ label: 'Farewell.', nextId: null }] } },
}

/** Récupère un dialogue par son id (ou null si inconnu). */
export function getDialogue(id) {
  return DIALOGUES[id] ?? null
}

/** Récupère un nœud d'un dialogue (ou null). */
export function getNode(dialogue, nodeId) {
  return dialogue?.nodes?.[nodeId] ?? null
}
