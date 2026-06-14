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

_(aucun playtest enregistré pour l'instant — première session à venir)_

---

## Synthèse des tendances (à mettre à jour périodiquement)

| Aspect | Verdict actuel | Action |
|---|---|---|
| Onboarding | Livré (ONB01-03 : tips + codex Rules) | Tester clarté en jeu |
| Chaîne principale (MQ) | Livré (B5+B6) | **Tester en priorité** — voir WATCHLIST |
| Démarrage Greywatch + nodes verrouillés | Livré (B6) | Tester si le gating coince |
| Remise d'élite (drops -> arme) | Livré (B5) | Vérifier rythme des drops (grind ?) |
| Difficulté Zone 1 | À tester | BAL02 |
| Difficulté boss | À tester | BAL02 |
| Économie tokens | Régulé 0/5-élites (REP01) ; rang à recaler | REP-REBAL01 |
| Idle progression | Seuil 5× (combat) | BAL03 |
