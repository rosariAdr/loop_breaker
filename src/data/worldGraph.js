// TRV01 — Graphe de la World Map (source de vérité partagée).
// Extrait de WorldMap.jsx pour être testable + réutilisable (déplacement, animation).
//
// Coordonnées RELATIVES (%) calées sur public/map/eldenmoor.png — si l'image est
// remplacée, réajuster ce seul tableau (doc : CONTEXT.md §WorldMap).

export const POS = {
  greywatch:        { x: 13, y: 16 },
  ashenvale_forest: { x: 43, y: 16 },
  millhaven:        { x: 41, y: 41 },
  ironhaven:        { x: 60, y: 56 },
  crumbled_ruins:   { x: 21, y: 59 },
  thornmarsh:       { x: 34, y: 79 },
  wildmere_hills:   { x: 51, y: 89 },
  crypt:            { x: 68, y: 83 }, // donjon (grotte)
  grimspire:        { x: 90, y: 45 }, // locked (overlay sur les montagnes)
}

export const NODES = [
  { id: 'greywatch', name: 'Greywatch', kind: 'village', glow: 'village' },
  { id: 'ashenvale_forest', name: 'Ashenvale Forest', kind: 'spot' },
  { id: 'millhaven', name: 'Millhaven', kind: 'village', glow: 'village' },
  { id: 'ironhaven', name: 'Ironhaven', kind: 'city', glow: 'amber' },
  { id: 'crumbled_ruins', name: 'Crumbled Ruins', kind: 'spot' },
  { id: 'thornmarsh', name: 'Thornmarsh', kind: 'spot' },
  { id: 'wildmere_hills', name: 'Wildmere Hills', kind: 'spot' },
]

// Graphe d'adjacence = source de vérité du déplacement (indépendant des chemins dessinés)
export const EDGES = [
  ['greywatch', 'ashenvale_forest'],
  ['ashenvale_forest', 'millhaven'],
  ['millhaven', 'crumbled_ruins'],
  ['millhaven', 'thornmarsh'],
  ['millhaven', 'ironhaven'],
  ['ironhaven', 'thornmarsh'],
  ['ironhaven', 'wildmere_hills'],
  ['ironhaven', 'crypt'],
]

/** Deux nodes sont-ils voisins directs dans le graphe ? (symétrique) */
export function areAdjacent(a, b) {
  if (!a || !b || a === b) return false
  return EDGES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

/** Liste des voisins directs d'un node. */
export function neighborsOf(id) {
  const out = []
  for (const [x, y] of EDGES) {
    if (x === id) out.push(y)
    else if (y === id) out.push(x)
  }
  return out
}
