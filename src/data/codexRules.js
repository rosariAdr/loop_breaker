// ONB03 — Codex de règles : explique les systèmes du jeu (stats, fatigue,
// divinités, transmigration…). Affiché dans l'onglet « Rules » du CodexOverlay.
// Donnée pure (testable, facile à étendre) ; aucune logique ici.
import { IDLE_MASTERY_KILLS } from '../store/slices/idleSlice'

export const CODEX_RULES = [
  {
    id: 'stats',
    icon: '📊',
    heading: 'Stats',
    body: 'Strength raises the damage you deal. Defense cuts the damage you take. Speed decides turn order. Chance improves drop rates and critical hits. HP and Mana are your combat reserves — Mana fuels active skills.',
  },
  {
    id: 'vigor',
    icon: '🔥',
    heading: 'Vigor & Fatigue',
    body: 'Vigor drains as you fight, travel and craft. The lower it falls, the weaker your hero becomes; let it reach zero and you act exhausted. Rest at an inn or pray at the church to restore it.',
  },
  {
    id: 'idle',
    icon: '♻️',
    heading: 'Idle Mastery',
    body: `Defeat a monster ${IDLE_MASTERY_KILLS} times to master it and unlock Idle farming. Idle then grinds resources, gold and XP for you automatically — even while you are away from the game.`,
  },
  {
    id: 'reputation',
    icon: '🪙',
    heading: 'Reputation & Ranks',
    body: "Elite hunts reward reputation tokens. Spend them at the Gods' Shop between lives. Your rank — Copper, Silver, Gold, Platinum, Diamond — reflects how far your standing has grown.",
  },
  {
    id: 'divinities',
    icon: '⛪',
    heading: 'Divinities',
    body: 'Pledge to one of the Old Gods at the church to forge a divine bond and earn unique boons. Your bond is remembered even after death, shaping every life that follows.',
  },
  {
    id: 'transmigration',
    icon: '♾️',
    heading: 'Transmigration',
    body: "Death is not the end. When you fall you transmigrate: choose what to carry over — a stat, an active skill and a passive skill — then spend tokens at the Gods' Shop before being reborn stronger.",
  },
]
