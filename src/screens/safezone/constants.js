// Positions (%) des bâtiments autour de la place du village
export const BLD_POS = {
  inn: { x: 28, y: 30 },
  church: { x: 72, y: 30 },
  blacksmith: { x: 20, y: 58 },
  merchant: { x: 80, y: 58 },
  knight_trainer: { x: 30, y: 82 },
  alchemy: { x: 70, y: 82 },
  master_smith: { x: 50, y: 88 },
  guild: { x: 50, y: 16 }, // GLD01 — au centre de la place, en ville
  academy: { x: 50, y: 66 }, // ACA05 — créneau central-bas libre (sinon VilBuilding rendait null → Académie invisible/inaccessible)
}

// VIL-FACADE01 — bâtiments qui ont une vraie façade dans /public/buildings/<id>.png :
// affichés en GRAND et SANS cadre parchemin. Les autres (+ le puits) gardent le placeholder encadré.
export const BLD_FACADES = new Set(['inn', 'church', 'merchant', 'alchemy', 'blacksmith'])
