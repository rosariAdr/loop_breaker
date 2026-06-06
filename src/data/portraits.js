// UI05 / couche B — Portraits PNJ pixel (overlays de dialogue UNIQUEMENT).
// Assets : CraftPix (placeholders v0/v1). 5 jeux × 6 émotions, 128×128.
// Règle d'or anti-clash : un portrait pixel ne vit JAMAIS dans le même cadre,
// à la même échelle, qu'un sprite chibi (couche A). Portraits = dialogue ; chibi = carte/combat.

export const PORTRAIT_EMOTIONS = ['talk', 'calm', 'smile', 'sadness', 'aggression', 'special']

// rôle → dossier public/portraits/<folder>/<emotion>.png + origine du pack
export const PORTRAITS = {
  aldric:   { folder: 'aldric',   source: 'NPC_1 (barbu blanc)', role: 'Sir Aldric — Knight Trainer / maître guerrier' },
  smith:    { folder: 'smith',    source: 'NPC_2 (chauve roux)', role: 'Master Smith / forgeron' },
  marta:    { folder: 'marta',    source: 'NPC_3 (rousse)',      role: 'Marta — Innkeeper' },
  merchant: { folder: 'merchant', source: 'NPC_4 (brun)',        role: 'Marchand / maître de Guilde' },
  mage:     { folder: 'mage',     source: 'Queen (elfe noire)',  role: 'Maître mage (Académie) / PNJ spécial' },
}

// Bâtiments/PNJ sans portrait dédié pour l'instant → fallback (emoji/placeholder) :
// prêtre (church), chef de village, divinités. À sourcer plus tard (CONT06).
export const PORTRAIT_FALLBACK = '🧑'

/** Chemin du portrait pour un rôle + une émotion (null si rôle inconnu). */
export function portraitSrc(role, emotion = 'talk') {
  const p = PORTRAITS[role]
  if (!p) return null
  const emo = PORTRAIT_EMOTIONS.includes(emotion) ? emotion : 'talk'
  return `/portraits/${p.folder}/${emo}.png`
}
