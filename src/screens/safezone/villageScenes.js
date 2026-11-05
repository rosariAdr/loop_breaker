const ROOT = '/villages/greywatch'

export function villageHour(tick = 0) {
  return ((tick % 24) + 24) % 24
}

export function getVillageLighting(tick) {
  const hour = villageHour(tick)
  if (hour < 6 || hour >= 21) return 'night'
  if (hour < 14) return 'day'
  if (hour < 18) return 'afternoon'
  return 'dusk'
}

// Coordonnées des pieds des sprites, dans le fond 1536 × 1024.
export const GREYWATCH_SCENE = {
  root: ROOT,
  buildings: {
    inn: { x: 34, y: 43, width: 18 },
    church: { x: 70, y: 44, width: 16 },
    merchant: { x: 83, y: 62, width: 15 },
    alchemy: { x: 73, y: 79, width: 16 },
    blacksmith: { x: 18, y: 65, width: 17 },
    master_smith: { x: 44, y: 81, width: 15 },
  },
  decorations: [
    { id: 'well', src: `${ROOT}/well.png`, alt: 'Village well', x: 50, y: 61, width: 12 },
    { id: 'cart', src: `${ROOT}/cart.png`, alt: 'Wooden cart', x: 66, y: 67, width: 10 },
    {
      id: 'cottage-west',
      src: `${ROOT}/cottage.png`,
      alt: 'Village cottage',
      x: 18,
      y: 65,
      width: 15,
      replacedBy: 'blacksmith',
    },
    {
      id: 'cottage-south',
      src: `${ROOT}/cottage.png`,
      alt: 'Village cottage',
      x: 30,
      y: 80,
      width: 14,
    },
  ],
  npcs: [
    {
      id: 'elder-moira',
      src: `${ROOT}/npcs/elder-moira.png`,
      alt: 'Elder Moira — Elder of Greywatch Village',
      x: 25,
      y: 67,
      width: 6,
    },
    {
      id: 'woodcutter',
      src: `${ROOT}/npcs/woodcutter.png`,
      alt: 'Village woodcutter',
      x: 10,
      y: 70,
      width: 6,
    },
    {
      id: 'children',
      src: `${ROOT}/npcs/children.png`,
      alt: 'Children playing with a wooden hoop',
      x: 54,
      y: 73,
      width: 8,
      hours: { from: 8, to: 18 },
    },
  ],
  exits: [
    { id: 'south', x: 49, y: 92, label: 'Leave Greywatch through the south gate' },
    { id: 'east', x: 90, y: 40, label: 'Leave Greywatch through the east gate' },
  ],
  hero: { x: '44%', y: '60%' },
}

export function isVillageNpcVisible(npc, tick) {
  if (!npc.hours) return true
  const hour = villageHour(tick)
  return hour >= npc.hours.from && hour < npc.hours.to
}
