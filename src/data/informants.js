// TAV01 — Informateurs à l'auberge : vendent des infos (indices boss, loot,
// rumeurs de déblocage de zone) contre de l'or.
// Décidé : contreparties or / ressources / équipement / mana stone (PAS un skill
// équipé). Pour le POC : or uniquement ; les autres contreparties = extension.
// info: { id, name, teaser, reveal, price, kind }
//   kind: 'boss' | 'loot' | 'zone' (la rumeur 'zone' préparera PROG03)

export const INFORMANTS = [
  {
    id: 'boss_hint_crypt',
    name: 'Grizzled Veteran',
    kind: 'boss',
    teaser: 'The thing in the Hollow Crypt… I know how it fights.',
    reveal: 'The Crypt Keeper enrages below half health — burn it down fast, or brace for a beating.',
    price: 30,
  },
  {
    id: 'loot_thornmarsh',
    name: 'Hooded Trapper',
    kind: 'loot',
    teaser: 'I know where the rare hides drop thickest.',
    reveal: 'Thornmarsh serpents shed rare hides — hunt them with high Chance and a full bag.',
    price: 20,
  },
  {
    id: 'zone_rumor_grimspire',
    name: 'Road Warden',
    kind: 'zone',
    teaser: "There's a path beyond the Blighted Road… for the worthy.",
    reveal: 'Grimspire opens to the proven — reach level 8, or cull forty Ashenvale beasts.',
    price: 40,
  },
]

/** Récupère un informateur/une info par son id (ou null). */
export function getInformant(id) {
  return INFORMANTS.find((i) => i.id === id) ?? null
}
