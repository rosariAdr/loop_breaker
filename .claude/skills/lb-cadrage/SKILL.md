---
name: lb-cadrage
description: Transforme une décision de design Loop Breaker en artefacts de cadrage — ADR, tickets, plan d'implémentation — avant tout code. À utiliser quand Adrian dit "on implémente", "on part là-dessus", "fige-moi ça", ou quand un brainstorm aboutit. Pont entre lb-brainstorm (explorer) et le code. Sert aussi de garde-fou : si Adrian demande du code sur un sujet non cadré, propose ce passage d'abord.
---

# lb-cadrage — du flou à l'exécutable

## Ce que fait ce skill
Il produit le **contrat** avant le code : décision tracée (ADR), travail découpé (tickets), plan
d'implémentation. Il ne code pas. Il rend le code trivial à écrire ensuite.

## Règle absolue
Lis `.claude/skills/HITL.md`. ADR, tickets et plan passent **tous** par la feuille de validation avant
d'être écrits. Y compris un « pas d'ADR nécessaire » : c'est une proposition, elle se coche.

## Garde-fou d'entrée
Si Adrian demande d'implémenter un truc **sans brainstorm, ni ADR, ni ticket**, pose UNE question :
« C'est cadré quelque part, ou on fait un passage lb-cadrage d'abord ? »
S'il dit « vas-y direct » → obéis, mais crée au minimum un ticket a posteriori.
Un fix évident (typo, bug isolé) n'a pas besoin de cadrage. Juge la taille, ne sois pas bureaucrate.

## Étape 0 — Lire
`ADR.md`, `CONTEXT.md`, `TASKS.md`, et le `plans/brainstorm-*.md` correspondant s'il existe.

## 1. ADR — seulement si c'est structurant
Une ADR **si et seulement si** la décision est coûteuse à annuler : architecture, schéma de données,
boucle de gameplay, économie, règle de scaling, système transverse aux 4 univers.
Une valeur de tuning (taux de drop, multiplicateur) **n'est pas une ADR** — c'est de la donnée.

```markdown
## ADR-<NNN> — <titre>
Date: <YYYY-MM-DD> · Statut: accepté | remplacé par ADR-<NNN>

**Contexte** : <la situation qui force un choix>
**Décision** : <ce qu'on fait, à l'affirmatif>
**Alternatives envisagées** : <+ pourquoi elles n'ont pas été retenues à ce stade>
**Conséquences** : <ce que ça verrouille, ce que ça coûte>
```
Une ADR ne se réécrit jamais : on la marque `remplacé par` et on en crée une nouvelle.
Une ADR peut être **rouverte** — c'est le mécanisme prévu, pas un échec.

## 2. Tickets
Format et anti-doublon : voir **lb-grooming** (ne duplique pas ses règles).
Rappels : relire `TASKS.md` avant création · champ **Hors scope** obligatoire · validation cochée.

## 3. Plan d'implémentation
Pour chaque ticket non trivial, avant de coder :
```markdown
### Plan — <TICKET-ID>
**Fichiers touchés** : <liste explicite. Si tu ne sais pas, va lire le code d'abord.>
**Fichiers à NE PAS toucher** : <garde-fou anti-changement orthogonal>
**Étapes** : 1. …
**Tests** (Vitest) : <pour un BUG, un test qui échoue AVANT le fix>
**Risque de régression** :
```
🛑 Le plan passe en validation avant la première ligne de code (`type: PLAN`).

## Contexte technique Loop Breaker
À rappeler quand c'est pertinent. Ce sont des **décisions courantes**, pas des dogmes : si un
cadrage les bouscule, signale l'impact et demande — n'oppose pas un refus.

- Stack : React 19, Vite, Zustand 5, TailwindCSS 4, Vitest 4, **JS pur** (pas de TS).
- POC PC-first · combat en ordre de tour fixe (ATB en V2) · mobile en V2.
- Scaling : `monster_stat = base × zone_mult × 1.08^min(run_count, 25)`.
- Idle : seuil de maîtrise **5×** (combat et craft) · idle par type de monstre après 10 kills manuels.
- Équipement : 9 slots (pas de ceinture) · drops T1 15% / T2 7,5% / T3 3% / elite 10%.
- Rotation d'univers : fenêtre glissante (courant + précédent exclus du tirage suivant).
- Deity-link permanent par univers · relations inter-divines de −10 à +10.
- Écran principal : vue Map.
- Map 2 gelée tant que Map 1 n'est pas testée.

Si une de ces lignes est contredite par une ADR plus récente, **l'ADR gagne** — et signale-moi que
ce fichier est à jour à corriger.

## Règles d'exécution (une fois le plan validé)
- **Ne touche que les fichiers du plan.** Aucun changement orthogonal « au passage ».
- Refactor **non destructif** : on étend, on ne réécrit pas un script qui marche
  (`process_assets.py`, `forge.py` en particulier).
- Pas de sur-ingénierie : la solution la plus simple qui passe les critères d'acceptation.
- Une hypothèse nécessaire ? **Demande.** Ne devine jamais en silence.
- Une décision qui émerge pendant l'implémentation → propose une ADR.
