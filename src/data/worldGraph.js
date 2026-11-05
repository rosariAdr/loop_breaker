// TRV01 / WMAP01 — Graphe de la World Map v2 : 2 conteneurs de carte (map1 / map2),
// nodes typés (village | city | spot | dungeon).
//
// Rétro-compat : NODES / EDGES / POS / areAdjacent / neighborsOf restent === Map 1
// (la carte jouable actuelle) pour ne RIEN casser côté UI/tests. Les structures v2
// (MAPS, ALL_EDGES, MAP_BRIDGE, DUNGEON_NODES, getMap, getNodeMap) sont ADDITIVES.
//
// Coordonnées RELATIVES (%) calées sur public/map/. Les POS des nodes Map 2 sont des
// PLACEHOLDERS — à recalibrer en WMAP08 quand l'illustration « Draconic Frontier » existera.

// ── Positions (%) ─────────────────────────────────────────────────────────────
export const POS = {
  // Map 1 (Eldenmoor / Ashenvale) — calé sur public/map/eldenmoor.png
  greywatch: { x: 13, y: 16 },
  ashenvale_forest: { x: 43, y: 16 },
  millhaven: { x: 41, y: 41 },
  ironhaven: { x: 60, y: 56 },
  crumbled_ruins: { x: 21, y: 59 },
  thornmarsh: { x: 34, y: 79 },
  wildmere_hills: { x: 51, y: 89 },
  crypt: { x: 68, y: 83 }, // donjon (grotte)
  goblin_cave: { x: 74, y: 44 }, // WMAP05 — donjon près d'Ironhaven (placeholder)
  grimspire: { x: 90, y: 45 }, // « porte » vers Map 2 (overlay sur les montagnes)
  // Map 2 (Draconic Frontier) — PLACEHOLDERS (WMAP08)
  stonehaven: { x: 30, y: 30 },
  duskreach: { x: 15, y: 55 },
  ashfall_post: { x: 50, y: 72 },
  veterans_playground: { x: 24, y: 18 },
  draconic_frontier: { x: 70, y: 34 },
  forsaken_citadel: { x: 55, y: 20 },
  vampire_castle: { x: 80, y: 58 },
  demon_lord: { x: 88, y: 82 },
}

// ── Nodes typés ───────────────────────────────────────────────────────────────
// Map 1 — région d'Ashenvale (« Eldenmoor »). Topologie inchangée.
const MAP1_NODES = [
  { id: 'greywatch', name: 'Greywatch', kind: 'village', glow: 'village' },
  { id: 'ashenvale_forest', name: 'Ashenvale Forest', kind: 'spot' },
  { id: 'millhaven', name: 'Millhaven', kind: 'village', glow: 'village' },
  { id: 'ironhaven', name: 'Ironhaven', kind: 'city', glow: 'amber' },
  { id: 'crumbled_ruins', name: 'Crumbled Ruins', kind: 'spot' },
  { id: 'thornmarsh', name: 'Thornmarsh', kind: 'spot' },
  { id: 'wildmere_hills', name: 'Wildmere Hills', kind: 'spot' },
  // WMAP05 — donjons de Map 1
  { id: 'crypt', name: 'The Hollow Crypt', kind: 'dungeon' },
  { id: 'goblin_cave', name: 'Goblin Cave', kind: 'dungeon', frozen: true },
]

// Map 2 — « Draconic Frontier » (gelé : contenu MQ07-10 à construire — structure seulement).
const MAP2_NODES = [
  { id: 'stonehaven', name: 'Stonehaven', kind: 'city', glow: 'amber' },
  { id: 'duskreach', name: 'Duskreach', kind: 'village', glow: 'village' },
  { id: 'ashfall_post', name: 'Ashfall Post', kind: 'village', glow: 'village' },
  { id: 'veterans_playground', name: "Veteran's Playground", kind: 'spot', frozen: true },
  { id: 'draconic_frontier', name: 'Draconic Frontier', kind: 'spot', frozen: true },
  { id: 'forsaken_citadel', name: 'The Forsaken Citadel', kind: 'dungeon' },
  { id: 'vampire_castle', name: 'Vampire Castle', kind: 'dungeon', frozen: true },
  { id: 'demon_lord', name: 'Malachar — Demon Lord', kind: 'dungeon' },
]

// ── EDGES v2 ─────────────────────────────────────────────────────────────────
// Map 1 — 8 arêtes noires (graphe d'adjacence = source de vérité du déplacement).
const MAP1_EDGES = [
  ['greywatch', 'ashenvale_forest'],
  ['ashenvale_forest', 'millhaven'],
  ['millhaven', 'crumbled_ruins'],
  ['millhaven', 'thornmarsh'],
  ['millhaven', 'ironhaven'],
  ['ironhaven', 'thornmarsh'],
  ['ironhaven', 'wildmere_hills'],
  ['ironhaven', 'crypt'],
]
// Map 2 — 5 arêtes orange (squelette).
const MAP2_EDGES = [
  ['stonehaven', 'veterans_playground'],
  ['veterans_playground', 'duskreach'],
  ['duskreach', 'draconic_frontier'],
  ['draconic_frontier', 'ashfall_post'],
  ['ashfall_post', 'forsaken_citadel'],
]
// WMAP04 — pont inter-cartes : sortie de Map 1 (Ironhaven) → entrée de Map 2 (Stonehaven).
export const MAP_BRIDGE = ['ironhaven', 'stonehaven']

// ── Conteneurs de carte (WMAP01) ─────────────────────────────────────────────
export const MAPS = {
  map1: {
    id: 'map1',
    name: 'Eldenmoor',
    asset: '/map/eldenmoor.png',
    nodes: MAP1_NODES,
    edges: MAP1_EDGES,
  },
  map2: {
    id: 'map2',
    name: 'Draconic Frontier',
    asset: '/map/draconic_frontier.png',
    nodes: MAP2_NODES,
    edges: MAP2_EDGES,
    frozen: true, // contenu Map 2 gelé (MQ07-10) — structure de données seulement
  },
}

// ── Rétro-compat : exports plats = Map 1 (carte jouable actuelle) ─────────────
// NODES historique = settlements + spots de Map 1 (les donjons sont rendus à part).
export const NODES = MAP1_NODES.filter((n) => n.kind !== 'dungeon')
export const EDGES = MAP1_EDGES

// v2 — vue agrégée (les 2 cartes + le pont) pour la future logique inter-cartes.
export const ALL_NODES = [...MAP1_NODES, ...MAP2_NODES]
export const ALL_EDGES = [...MAP1_EDGES, ...MAP2_EDGES, MAP_BRIDGE]
export const DUNGEON_NODES = ALL_NODES.filter((n) => n.kind === 'dungeon')

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Conteneur de carte par id ('map1' | 'map2'), ou null. */
export function getMap(mapId) {
  return MAPS[mapId] ?? null
}

/** Id de la carte contenant un node ('map1' | 'map2'), ou null. */
export function getNodeMap(nodeId) {
  if (MAP1_NODES.some((n) => n.id === nodeId)) return 'map1'
  if (MAP2_NODES.some((n) => n.id === nodeId)) return 'map2'
  return null
}

/** Deux nodes sont-ils voisins directs dans le graphe ? (Map 1, symétrique) */
export function areAdjacent(a, b) {
  if (!a || !b || a === b) return false
  return EDGES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

/** Liste des voisins directs d'un node (Map 1). */
export function neighborsOf(id) {
  const out = []
  for (const [x, y] of EDGES) {
    if (x === id) out.push(y)
    else if (y === id) out.push(x)
  }
  return out
}
