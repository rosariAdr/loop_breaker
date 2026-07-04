// MST09 — Pools de skills-récompense par discipline de maître.
//
// Chaque maître (v1.43) a un `focus` (discipline). Les quêtes du maître engagé
// récompensent des skills tirés du pool de sa discipline (MST01/MST03). Ce module
// ne fait QUE définir ces pools — l'engagement, les quêtes d'initiation et le
// gating sont hors périmètre (MST01/MST02/MST05, gate design MST-G1).
//
// Cohérence physical/magic (SKD, source de vérité `getSkillDropType` dans monsters.js) :
//   - disciplines PHYSIQUES (martial, berserker) → techniques à dégâts physiques
//     (`effect.damage.type === 'physical'`) + techniques utilitaires/passives martiales
//     (garde, riposte, buffs) qui ne portent AUCUN dégât contradictoire.
//   - disciplines MAGIQUES (arcane, feu, glace) → skills magiques : jamais de dégâts
//     physiques. `feu`/`glace` exigent en plus l'élément exact (`fire`/`ice`).
//
// ⚠️ On ne puise que dans les skills « de base » du joueur (container `mana_stone`) :
//   les skills `divine`/`supreme` s'obtiennent via l'éveil d'une divinité / le Demon Lord,
//   pas via un maître (cf. ACADEMY_CATALOG qui exclut aussi boss/divins/suprêmes).
//
// ⚠️ GLACE : aucun skill d'élément `ice` n'existe encore dans skills.js (Soul Chill est
//   un skill PHYSIQUE de ralentissement, pas de la glace). Le pool `glace` est donc
//   volontairement VIDE en attendant des skills de glace dédiés (SKD futur / MST08).
//   Un maître à focus glace (MST08, itinérant) restera sans récompense-skill tant que
//   ce pool n'est pas alimenté — à surveiller quand les skills de glace arriveront.

// Disciplines connues (extensible). Sert de référence partagée (UI, MST01, tests).
export const MASTER_FOCUSES = ['martial', 'arcane', 'feu', 'glace', 'berserker']

// Classe de cohérence attendue par discipline :
//   'physical' → skills à dégâts physiques (+ utilitaires/passifs martiaux)
//   'magic'    → skills magiques non physiques
//   'magic:fire' / 'magic:ice' → magiques ET de l'élément exact
export const FOCUS_DAMAGE_CLASS = {
  martial: 'physical',
  berserker: 'physical',
  arcane: 'magic',
  feu: 'magic:fire',
  glace: 'magic:ice',
}

// Pools de skills-récompense par discipline. Ids ⊂ SKILLS (container mana_stone).
export const MASTER_SKILL_POOLS = {
  // Martial — épée & garde : frappe maîtrisée, riposte, posture défensive, endurance.
  martial: [
    'power_strike', // 160% STR (physique)
    'cleave', // AoE physique
    'cursed_blade', // physique + defense break
    'counter_strike', // riposte (utilitaire martial, sans dégât direct)
    'shield_stance', // posture défensive (utilitaire martial)
    'battle_focus', // passif +STR
    'veterans_resolve', // passif +maxHP
    'iron_resolve', // passif +DEF
  ],

  // Berserker — furie brute : gros coups physiques, sacrifice, aucune retenue.
  berserker: [
    'reckless_blow', // 220% STR, sacrifie de l'Agility
    'bone_crush', // 220% STR
    'trample_charge', // 180% STR
    'savage_bite', // 140% STR
    'bramble_slam', // physique + slow
    'thick_hide', // passif : réduction de dégâts (encaisser pour cogner)
  ],

  // Arcane — magie « pure » (dégâts magiques non élémentaires) + contrôle.
  arcane: [
    'wing_gust', // dégâts magiques AoE
    'soul_crush', // dégâts magiques lourds (skill de boss recyclé, MST03)
    'plague_maw', // dégâts magiques + poison
    'abyss_howl', // debuff ATK (contrôle magique, sans dégât physique)
    'forsaken_curse', // debuff all-stats (contrôle magique, skill de boss recyclé)
  ],

  // Feu — magie de flammes : brûlure. (inferno_strike est divin → hors pool.)
  feu: [
    'ember_burst', // 100% INT feu + burn
    'fox_fire', // 120% INT feu + burn
  ],

  // Glace — VIDE : aucun skill d'élément `ice` n'existe encore (cf. en-tête).
  glace: [],
}

/** Pool de skills-récompense d'une discipline (tableau d'ids ; [] si inconnue/vide). */
export function getMasterSkillPool(focus) {
  return MASTER_SKILL_POOLS[focus] ?? []
}

// ── MST01/MST05 — Modèle de données « maître » + engagement ───────────────────
//
// Un maître (mentor) enseigne une discipline (`focus`) via des quêtes. Le héros
// s'ENGAGE auprès d'UN SEUL maître par run (MST-G1(b)) : choix LIBRE parmi tous les
// maîtres, la 1ʳᵉ quête d'initiation validée verrouille l'engagement définitivement
// (MST-G1(a) : pas d'auto-assignation à un maître par défaut). L'état d'engagement
// (`hero.masterId`) vit dans le RUN et se réinitialise à la transmigration (comme les
// skills/stats) — voir INITIAL_HERO + le lock côté store (setMaster).
//
// Chaque maître porte :
//   - `id`, `name`, `title` (MST-G2 pour Aldric)
//   - `location` (localité fixe) OU `itinerant: true` (maître de passage — MST08, batch 3)
//   - `focus` ∈ MASTER_FOCUSES → détermine son pool de skills-récompense
//   - `initiationQuestId` : la quête d'initiation qui, validée, engage le héros
//   - `skillQuestPool[]` : ids des quêtes de maître (⊂ MASTER_QUESTS) proposées une fois
//     initié. Les skills récompensés par ces quêtes appartiennent au pool de la discipline
//     (MASTER_SKILL_POOLS[focus]).
export const MASTERS = {
  // MST05 — Sir Aldric, maître martial de Greywatch (village de départ). Porte la quête
  // d'initiation de départ. Non obligatoire : le héros peut choisir un autre maître (modèle
  // à choix libre). Titre décidé (MST-G2).
  sir_aldric: {
    id: 'sir_aldric',
    name: 'Sir Aldric',
    title: "Membre d'honneur du Royal Knighthood", // MST-G2 (chaîne exacte)
    location: 'greywatch',
    focus: 'martial',
    initiationQuestId: 'master_init_aldric',
    // Quêtes de maître martial (ACA04 existantes ; skills ⊂ MASTER_SKILL_POOLS.martial).
    skillQuestPool: ['master_sharpen_strike', 'master_focus_cleave', 'master_temper_resolve'],
  },
}

/** Un maître par id (ou null si inconnu). */
export function getMaster(masterId) {
  return MASTERS[masterId] ?? null
}

/** Le maître dont la quête d'initiation est `questId` (ou null). Sert au verrou MST02. */
export function getMasterByInitiationQuest(questId) {
  return Object.values(MASTERS).find((m) => m.initiationQuestId === questId) ?? null
}
