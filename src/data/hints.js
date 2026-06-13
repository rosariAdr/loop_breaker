// ONB01 — Tutoriel contextuel : tips « one-shot » déclenchés à la 1ʳᵉ occurrence
// d'une action clé. Désactivables (meta.settings.tutorials). L'id est la clé de
// déduplication dans meta.seenHints — un hint vu ne se réaffiche jamais.
// Copie centralisée ici (source unique, consommée par triggerHint + combatSlice).
export const HINTS = {
  idle_unlock: {
    title: 'Idle unlocked',
    text: 'You have mastered this foe — toggle Idle from the zone view to farm it automatically.',
  },
  first_quest: {
    title: 'Quest accepted',
    text: 'Track active quests from the Quests panel. Meet the objective, then claim the reward where you took it — or back in town.',
  },
  first_levelup: {
    title: 'Level up!',
    text: 'Leveling raises your stats. Keep your gear and skills current to survive tougher zones.',
  },
  first_craft: {
    title: 'First craft',
    text: 'Crafting turns gathered resources into gear and consumables. Finer materials yield finer results.',
  },
  transmigration: {
    title: 'Transmigration',
    text: "When you fall, you are reborn. Choose what to inherit, then spend reputation tokens at the Gods' Shop.",
  },
}

/** Récupère un hint par id (ou null si inconnu). */
export function getHint(id) {
  return HINTS[id] ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// ONB02 — Chaîne de quêtes principale = fil tutoriel.
// ⚠️ STUB : la chaîne MQ (MQ-CHAIN01) n'est pas encore construite. On pose ici la
// structure de câblage (étape MQ → id de hint) pour que le déclenchement n'ait
// qu'à appeler triggerHint(getMqTutorialHint(stepId)) une fois MQ-CHAIN livré.
// Tant que la map est vide, getMqTutorialHint renvoie null (aucun déclenchement).
export const MQ_TUTORIAL_HINTS = {
  // 'mq01_first_blood':  'first_combat',   // exemple — à remplir avec MQ-CHAIN01
  // 'mq02_to_millhaven': 'travel',
}

/** ONB02 (stub) — hint enseigné par une étape de la quête principale, ou null. */
export function getMqTutorialHint(mqStepId) {
  return MQ_TUTORIAL_HINTS[mqStepId] ?? null
}
