# DESIGN — Loop Breaker (specs de game design)

Ce fichier contient les **specs de conception** validées avant implémentation, référencées par les tickets `*-SPEC` de `TASKS.md`. Source de vérité pour les valeurs d'équilibrage et les interactions de systèmes.

---

## B05-SPEC — Effets de statut (status effects)

Spec validée pour le ticket **B05 — Effets de statut**. Définit le comportement moteur, les valeurs par niveau et les interactions.

### Modèle de données

Un effet actif sur un combattant (héros ou ennemi) est stocké dans `entity.activeEffects: StatusEffect[]` :

```js
{
  id: string,            // identifiant unique de l'instance (pour expiration ciblée)
  type: string,          // voir catégories ci-dessous
  duration: number,      // tours restants ; décrémenté en fin de tour de la cible
  source: 'hero'|'enemy',// qui l'a appliqué (pour le log)
  // champs spécifiques au type :
  tickDamage?: number,   // poison / burn — dégâts par tour
  reduction?: number,    // *_down / *_break — fraction de réduction (0.20 = −20%)
}
```

Les skills déclarent l'effet qu'ils appliquent via `effect.statusEffect` (déjà présent dans `data/skills.js`).

### Règle de plafond

**Maximum 2 effets actifs** par combattant simultanément (règle du ticket B05). Si un 3e effet est appliqué :
- Si un effet du **même type** existe déjà → on **rafraîchit** sa durée (max des deux) et on met à jour ses valeurs (prend la plus forte). Pas d'empilement.
- Sinon (2 types différents déjà présents) → le nouvel effet est **ignoré** (le plus ancien reste). *(Choix POC : simple et lisible. Alternative "remplace le plus ancien" rejetée pour éviter le yo-yo.)*

### Catégories d'effets

| Type | Catégorie | Effet par tour | Effet sur stats | Durée typique |
|---|---|---|---|---|
| `poison` | DoT | −`tickDamage` HP | — | 2–3 |
| `burn` | DoT + soin bloqué | −`tickDamage` HP (feu) + **empêche les soins** tant qu'actif | — | 2 |
| `stun` | Contrôle | **saute son tour** | — | 1 |
| `slow` | Stat | — | Agility ×(1−`reduction`), défaut −50% | 2 |
| `defense_break` | Stat | — | DEF ×(1−`reduction`) | 2 |
| `atk_down` | Stat | — | ATK/STR ×(1−`reduction`) | 3 |
| `max_hp_reduction` | Stat | — | maxHP ×(1−`reduction`) | 3 |
| `all_stats_down` | Stat | — | toutes les stats principales ×(1−`reduction`) | 2 |

- **DoT** (poison, burn) : les dégâts s'appliquent **au début du tour** de la cible, *avant* son action. Un combattant peut mourir de poison/burn sans jouer.
- **Contrôle** (stun) : empêche l'action ; l'effet est consommé (durée −1) même si le tour est sauté.
- **Stat** : ne s'applique pas "par tour" — c'est un **modificateur calculé à la volée** via `getEffectiveStats()` à chaque fois qu'on lit les stats pour un calcul (dégâts, ordre des tours). Jamais muté en dur sur l'entité.

### Interactions

- **Burn + soin** : tant qu'un `burn` est actif, toute tentative de soin (potion, skill de heal, régénération de sommeil *en combat*) est **annulée** avec un log "The flames prevent healing!". Hors combat, le burn expire normalement et le soin redevient possible.
- **Poison + burn** simultanés : les deux DoT s'additionnent (2 effets max → c'est la combinaison "DoT max").
- **slow + all_stats_down** : les réductions d'Agility se **multiplient** (×(1−slow) puis ×(1−all_stats_down)), pas d'addition, pour éviter de tomber à 0.
- **Mort par DoT** : si un DoT réduit les HP à 0, la cible est vaincue immédiatement (drops/exp normaux ; pas d'éveil divin "victoire sous 30% HP" car ce n'est pas une action du héros — à confirmer au wiring DV).

### Valeurs par niveau (skills appliquant un statut)

Le `levelBonuses[level]` du skill peut majorer l'effet :
- `tickDamageBonus` : +N aux dégâts par tour du DoT (ex. `putrid_slam` Lv2 = +3, Lv3 = +6).
- `durationBonus` : +N tours (optionnel, non utilisé au POC).
- `reductionBonus` : +fraction à la réduction (optionnel).

La valeur finale est calculée à l'application : `tickDamage = base.tickDamage + (levelBonuses[level]?.tickDamageBonus ?? 0)`.

### API moteur (combat.js) — fonctions pures

- `tickStatusEffects(stats, activeEffects)` → `{ newStats, remainingEffects, log, flags }`
  - applique les DoT, décrémente les durées, retire les effets expirés (durée → 0)
  - `flags`: `{ skipTurn: bool, noHeal: bool }` calculés depuis les effets présents (stun → skipTurn, burn → noHeal)
- `applyStatusEffect(activeEffects, newEffect, max=2)` → `StatusEffect[]` (gère plafond + refresh même type)
- `getEffectiveStats(baseStats, activeEffects)` → `stats` (applique les modificateurs de catégorie Stat ; jamais muté en dur)
- `canHeal(activeEffects)` → `bool` (false si un `burn` actif)
- `isStunned(activeEffects)` → `bool`

### UI (B05)

- Icônes des effets actifs sur `EnemyCard` et `HeroCard` (emoji + tooltip nom + tours restants).
- Mapping icône : poison 🟢, burn 🔥, stun 💫, slow 🐌, defense_break 🛡️‍💥, atk_down ⬇️⚔️, max_hp_reduction 💔, all_stats_down 🌀.

---
