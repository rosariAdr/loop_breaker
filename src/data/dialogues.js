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
        options: [{ label: '(Back)', nextId: 'greet' }],
      },
      thanks: {
        text: 'The Old Gods smile on you. Walk safe out there, hero.',
        options: [{ label: 'Farewell.', nextId: null }],
      },
    },
  },
}

// ── NPC04 — Maîtres de bâtiment (2 nœuds, messages prédéfinis) ────────────────
Object.assign(DIALOGUES, {
  inn_marta: {
    startId: 'g',
    nodes: {
      g: {
        text: "Rest easy, love. A warm bed and a warmer stew — that's all the cure most roads need.",
        options: [
          { label: 'Heard any rumors?', nextId: 'r' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      r: {
        text: "Folk whisper of lights in the old ruins at night. I'd steer clear, were I you — but you've that look about you.",
        options: [{ label: 'Thanks, Marta.', nextId: null }],
      },
    },
  },
  merchant_pell: {
    startId: 'g',
    nodes: {
      g: {
        text: "Everything's for sale, dearie — at the right price. Even a smile, if you're buying.",
        options: [
          { label: 'Where do your wares come from?', nextId: 'w' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      w: {
        text: "Caravans, mostly. What the roads don't swallow, I sell. The rest... best not to ask.",
        options: [{ label: '(Leave)', nextId: null }],
      },
    },
  },
  blacksmith_bram: {
    startId: 'g',
    nodes: {
      g: {
        text: "Bring me ore and coin and I'll bring your enemies grief. Simple as that.",
        options: [
          { label: 'What makes a good blade?', nextId: 'b' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      b: {
        text: "Patience and fire. Rush the forge and you'll get brittle steel — and a brittle death.",
        options: [{ label: '(Leave)', nextId: null }],
      },
    },
  },
  church_caelum: {
    startId: 'g',
    nodes: {
      g: {
        text: "The Old Gods watch even the faithless, child. The question is whether you'll watch back.",
        options: [
          { label: 'Why should I pledge?', nextId: 'p' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      p: {
        text: "A god's favor is a blade you cannot drop. But favor is earned in deeds, not words. Go — earn it.",
        options: [{ label: '(Leave)', nextId: null }],
      },
    },
  },
})

// ── DLG01 — Maîtres de bâtiment & Guilde sans arbre dédié (retombaient sur le
//    FALLBACK générique « stranger… » alors qu'ils sont nommés). ────────────────
Object.assign(DIALOGUES, {
  // Guilde des Aventuriers (GLD01) — cas signalé en revue : TALK_ID.guild pointait
  // sur 'guild_master' mais aucun arbre n'existait → Doran parlait générique.
  guild_master: {
    startId: 'g',
    nodes: {
      g: {
        text: 'Proven blades only past this hall, friend. State your business — a commission, a drink, or gossip?',
        options: [
          { label: 'How do I prove myself?', nextId: 'prove' },
          { label: 'What does the road whisper?', nextId: 'rumor' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      prove: {
        text: 'Clear commissions off the board. Coin and reputation both — the Guild remembers who finishes what they start, and who runs.',
        options: [{ label: '(Back)', nextId: 'g' }],
      },
      rumor: {
        text: 'Caravans have gone quiet on the eastern road. And the church buys more candles than any honest grief explains. Make of that what you will.',
        options: [
          { label: 'Good to know.', nextId: null },
          { label: '(Back)', nextId: 'g' },
        ],
      },
    },
  },
  master_hollis: {
    startId: 'g',
    nodes: {
      g: {
        text: "Only the finest work leaves my anvil. Bring me rare stock and I'll bring you something worth carrying into the dark.",
        options: [
          { label: "How is your work different from Bram's?", nextId: 'd' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      d: {
        text: "Bram makes soldiers' steel — honest, blunt, plentiful. I make heirlooms. The difference is whether your grandchildren inherit the blade or the grave.",
        options: [{ label: '(Leave)', nextId: null }],
      },
    },
  },
  knight_aldric: {
    startId: 'g',
    nodes: {
      g: {
        text: "So you'd learn the blade. Good. Steel is patient — and so am I, though my patience has its edges.",
        options: [
          { label: "What's the first lesson?", nextId: 'l' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      l: {
        text: 'Footwork. A sword arm is worthless if your feet betray you. Master the ground before you ever master the edge.',
        options: [{ label: '(Back)', nextId: 'g' }],
      },
    },
  },
  alchemist_vesna: {
    startId: 'g',
    nodes: {
      g: {
        text: "Mind where you put your hands — half of what's on these shelves would kill you, and the other half only sometimes.",
        options: [
          { label: 'How did you learn all this?', nextId: 'h' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      h: {
        text: 'Trial. Error. A great deal of error. The trick is surviving long enough to call it experience.',
        options: [{ label: '(Leave)', nextId: null }],
      },
    },
  },
  academy_oren: {
    startId: 'g',
    nodes: {
      g: {
        text: 'Knowledge has a price, and a value — rarely the same number. What would you learn today, or unlearn?',
        options: [
          { label: 'Why teach at all?', nextId: 't' },
          { label: 'Farewell.', nextId: null },
        ],
      },
      t: {
        text: 'A technique hoarded dies with its keeper. A technique shared outlives empires. I am, at heart, merely vain about being remembered.',
        options: [{ label: '(Back)', nextId: 'g' }],
      },
    },
  },
})

// DLG01 — Mapping bâtiment → id de dialogue (source unique, consommée par SafeZone).
// Tout bâtiment proposant l'action « Talk » doit résoudre ici vers un arbre dédié ;
// l'absence d'entrée fait retomber le PNJ sur le FALLBACK générique.
export const BUILDING_DIALOGUE_ID = {
  inn: 'inn_marta',
  church: 'church_caelum',
  merchant: 'merchant_pell',
  blacksmith: 'blacksmith_bram',
  guild: 'guild_master',
  master_smith: 'master_hollis',
  knight_trainer: 'knight_aldric',
  alchemy: 'alchemist_vesna',
  academy: 'academy_oren',
}

// Dialogue de repli quand un PNJ n'a pas d'arbre dédié.
export const FALLBACK_DIALOGUE = {
  startId: 'g',
  nodes: {
    g: {
      text: 'Safe travels, stranger. The road is long, and the night is longer.',
      options: [{ label: 'Farewell.', nextId: null }],
    },
  },
}

/** Récupère un dialogue par son id (ou null si inconnu). */
export function getDialogue(id) {
  return DIALOGUES[id] ?? null
}

/** Récupère un nœud d'un dialogue (ou null). */
export function getNode(dialogue, nodeId) {
  return dialogue?.nodes?.[nodeId] ?? null
}
