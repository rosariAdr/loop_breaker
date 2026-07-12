---
name: lb-brainstorm
description: Brainstorming de game design pour Loop Breaker (roguelite idle RPG). À utiliser dès qu'Adrian explore une idée de gameplay, système, univers, boucle, économie, progression, deity, équipement ou contenu — y compris sur "et si", "je me demande si", "j'hésite entre", "on pourrait ajouter". NE PAS utiliser pour du debug ou une tâche déjà cadrée (voir lb-cadrage). Ce skill produit des options à valider, jamais du code.
---

# lb-brainstorm — exploration cadrée

## Règle n°1 : aucun code
La sortie de ce skill est un document de décision. Si Adrian demande d'implémenter en plein
brainstorm : « on est en exploration — je note, et on passe par lb-cadrage une fois tranché. »

## Règle n°2 : le protocole HITL
Lis `.claude/skills/HITL.md` et applique-le. Rien ne s'écrit sans validation d'Adrian.
Point critique de ce skill : **un refus n'est pas définitif.** Ne tiens aucun registre de sujets
« interdits ». Adrian peut changer d'avis, et une idée écartée peut redevenir pertinente quand le
contexte bouge. Ne te sers jamais d'un refus passé pour clore une discussion.

## Étape 0 — Charger le contexte
Lis `ADR.md`, `CONTEXT.md`, `TASKS.md`, `TODO.md` avant de proposer quoi que ce soit.

Puis affiche un rappel court : « Contraintes actives ici : […] ».

**Distingue deux niveaux :**
- **ADR acceptée** = contrainte active. Si l'idée la contredit, dis-le franchement et demande :
  « ça rouvre l'ADR-xxx — c'est voulu ? » Puis, si Adrian confirme, **brainstorme normalement.**
- **Tout le reste** (idée écartée en review, sujet parké, préférence exprimée un jour) = simple
  information. Tu peux la mentionner en une ligne, mais elle ne bloque rien.

Éléments de contexte utiles (à rappeler, pas à imposer comme des dogmes) : POC PC-first, combat en
ordre de tour fixe (ATB en V2), Map 2 gelée tant que Map 1 n'est pas testée, mobile en V2.
Si une idée bouscule ça, dis le coût — puis explore quand même si Adrian veut.

## Méthode — 3 tours
### Tour 1 — Questions, pas de solutions
3 à 5 questions socratiques max. Objectif : faire émerger le **problème réel**.
- Quel problème joueur ? Quelle boucle ça nourrit (combat / idle / craft / run / méta) ?
- Ça vaut pour les 4 univers (medieval, wushu, tower, post-apo) ou un seul ?
- Impact sur l'idle (seuil de maîtrise 5×) ? Sur le scaling
  (`base × zone_mult × 1.08^min(run_count, 25)`) ?
- Ça survit à la transmigration (Gods' Shop, deity-link permanent par univers) ou ça se perd ?

**ATTENDS les réponses.** Ne passe pas au tour 2 tout seul. Le HITL est le cœur du skill.

### Tour 2 — Options sur la table
Minimum 3 options, dont une conservatrice et une ambitieuse. Pour chacune :
ce que ça change · coût S/M/L (stack : React 19, Zustand 5, JS pur, solo dev) · ce que ça casse
ailleurs · risque de repousser le POC.
Sois honnête : si une option est mauvaise, dis-le. Recommande-en une et justifie.

### Tour 3 — Converger → validation
Passe les options en feuille de validation (`type: OPTION DESIGN`), une ligne par option,
**y compris la ligne « ne rien faire / garder l'existant »** — le statu quo se coche aussi.

```bash
python tools/backlog-studio/scripts/make_review.py propositions.json --out reviews/review-<date>.xlsx
```
🛑 Attends qu'Adrian ait coché, puis `read_review.py`.

## Sortie (après validation seulement)
`plans/brainstorm-<slug>.md` :

```markdown
# Brainstorm — <titre>
Date: <YYYY-MM-DD> · Statut: exploré | décidé | parké

## Problème
## Contraintes actives (ADR concernées)
## Options envisagées
### A — <nom> (coût S/M/L) — retenue / non retenue à ce stade
Pour / Contre / Impact boucles
## Décision (validée par Adrian le <date>)
## Non retenu à ce stade
<sans jugement définitif — ces pistes restent ouvertes si le contexte change>
## Questions ouvertes
## Suite
- [ ] ADR à créer ? → lb-cadrage
- [ ] Tickets → lb-grooming
```

Note le vocabulaire : **« non retenu à ce stade »**, jamais « rejeté ». La nuance est volontaire.

## Anti-patterns
- Enchaîner les tours sans attendre les réponses.
- Proposer une feature « parce que c'est standard en idle game » — justifie par la boucle.
- Ignorer le coût : Adrian est solo dev, « ce serait cool » ne suffit jamais.
- **Opposer un refus passé comme argument.** Interdit. Mentionne, n'oppose pas.
