# Playtests — Loop Breaker

> Journal de playtest structuré. Une entrée par session de jeu manuelle.
> Objectif : capturer le ressenti, les bugs, et les déséquilibres au fil de l'eau.

## Méthodologie

Pour chaque playtest :
1. Lancer `npm run dev` sur une **save fraîche** (ou noter si reprise)
2. Jouer ~15-30 min en conditions réelles (pas de debug panel sauf mention)
3. Remplir une entrée ci-dessous **immédiatement après**
4. Tagger les bugs trouvés → créer un ticket `fix/...` si bloquant

### Grille d'observation
- **Onboarding** : ai-je compris quoi faire sans aide ?
- **Boucle de jeu** : le combat → loot → progression est-il satisfaisant ?
- **Difficulté** : trop facile / juste / trop dur (par zone)
- **Économie** : assez de gold/tokens ? trop ?
- **Friction UX** : clics inutiles, infos manquantes, confusions
- **Ressenti global** : note /10 + une phrase

---

## Template d'entrée (à copier)

```
### Playtest #N — YYYY-MM-DD

- **Build / branche** : feat/batch_AB @ <commit court>
- **Durée** : ~XX min
- **Save** : fraîche / reprise (run #N)
- **Jusqu'où** : zone atteinte, boss tués, jour in-game

**Onboarding** :
**Boucle de jeu** :
**Difficulté** (par zone) :
**Économie** (gold/tokens) :
**Friction UX** :
**Bugs trouvés** :
- [ ] ...

**Ressenti global** : X/10 — ...

**Tickets à créer** :
- ...
```

---

## Entrées

### Playtest #1 — 2026-06-14 (chaîne principale & démarrage restreint)

- **Build / branche** : `feat/v1.33_progression`
- **Save** : reprise (run #1) + une save **antérieure au node-locking**
- **Jusqu'où** : Greywatch → Millhaven (chaîne MQ mq01→mq02), ~jour 50

**Boucle de jeu** : une fois les bugs de départ corrigés, la progression Greywatch → forêt → chaîne principale est fonctionnelle et lisible.

**Bugs trouvés** (→ épique `BUG_v1.2` dans `TASKS.md`) :
- [x] **FIX-START01** — une save d'avant le node-locking gardait le héros sur **Ironhaven (ville verrouillée)** → bloqué, rien de jouable. Corrigé (anti-piège `normalizeSave`).
- [x] **FIX-QUESTPROG01** — board : quête **non acceptée** affichait le cumul de kills (5/5 au lieu de 0/5). Corrigé.
- [ ] **FIX-QUESTPROG02** — même bug côté **panneau église** (affichage). Ouvert.
- [ ] **HSV2-01** — **avatar du héros invisible** sur le Hero Sheet.
- [ ] **MQUI01** — la **quête principale n'est pas distinguée** des secondaires (confusion « où est la main quest ? »).

**Friction UX** :
- Objectif `elite_turnin` (détenir 3× l'item d'un élite, drop 30 %) **peu lisible** : rien n'indique qu'il faut farmer l'item, ni de compteur x/3.
- Aura/Concentration affichées dans les stats **avant déblocage** → refonte Hero Sheet V2 (les masquer, HSV2-03).

**Ressenti global** : 7/10 — progression claire une fois débloquée ; frictions surtout de **lisibilité** (quête principale, elite_turnin) + un bug de save bloquant (corrigé).

**Tickets créés** : BUG_v1.2 (FIX-QUESTPROG02), MQUI01, QTOAST01, HSV2-01→06, QA01.

---

## Synthèse des tendances (à mettre à jour périodiquement)

| Aspect | Verdict actuel | Action |
|---|---|---|
| Onboarding | Livré (ONB01-03 : tips + codex Rules) | Tester clarté en jeu |
| Chaîne principale (MQ) | ✅ Testé (playtest #1) — jouable mq01→mq02 | Lisibilité à améliorer → **MQUI01** (distinguer la main quest) |
| Démarrage Greywatch + nodes verrouillés | ✅ Testé (playtest #1) — bug bloquant corrigé | **FIX-START01** (save d'avant node-locking piégée) livré |
| Remise d'élite (drops -> arme) | ✅ Testé (playtest #1) — fonctionne | Lisibilité `elite_turnin` faible (drop 30 %, pas de compteur x/3) |
| Difficulté Zone 1 | À tester | BAL02 |
| Difficulté boss | À tester | BAL02 |
| Économie tokens | Régulé 0/5-élites (REP01) ; rang à recaler | REP-REBAL01 |
| Idle progression | Seuil 5× (combat) | BAL03 |
