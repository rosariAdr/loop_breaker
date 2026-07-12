---
name: lb-grooming
description: Raffinage du backlog Loop Breaker (grooming agile) avec validation humaine par feuille Excel. À utiliser quand Adrian veut créer un ticket, nettoyer TASKS.md, dédupliquer, re-prioriser, découper un ticket, ou faire le point sur ce qui reste. Se déclenche sur "nouveau ticket", "grooming", "point backlog", "range-moi TASKS.md", "qu'est-ce qui reste". Ne modifie JAMAIS TASKS.md sans décision cochée par Adrian.
---

# lb-grooming — raffinage de backlog, HITL strict

## Règle absolue
Lis `.claude/skills/HITL.md`. Tu **proposes**, Adrian **dispose**. Aucune écriture dans `TASKS.md` sans
décision cochée.

**Le statu quo est une proposition.** Si tu penses qu'un ticket ne doit pas bouger, ça part quand
même en review avec `type: STATU QUO` et Adrian coche. Tu ne valides jamais l'inaction tout seul —
c'est encore une décision, et elle lui appartient.

Une ligne laissée vide = **non traitée**. Tu n'appliques rien et tu la redemandes. Jamais
d'interprétation d'un silence.

## Étape 0 — Lire avant de proposer (non négociable)
`TASKS.md` **en entier**, `CONTEXT.md`, `ADR.md`, `TODO.md`.
Ne saute jamais cette étape, même si Adrian a l'air pressé : la dette de doublons coûte plus cher
que les cinq minutes gagnées.

## Anti-doublon — la raison d'être de ce skill
Avant toute proposition de ticket, cherche s'il existe déjà (par sujet, système, préfixe d'ID).

Superseded connus, à ne pas recréer : `CRAFT-LVL01` → **`CRAFT-GRADE01`** · `EQDROP01` →
**`EQDROP01b`**.

Si tu trouves un ticket proche mais pas identique : **ne crée pas de doublon**. Propose plutôt
`type: MODIF TICKET` en signalant « ⚠️ proche de `<ID>` », et laisse Adrian trancher entre enrichir
et créer.

## Format de ticket
Préfixes existants (`UI` / `TST` / `BUG` + ceux déjà présents dans `TASKS.md` — relève-les, ne les
invente pas). Références atomiques.

```
### <PREFIX>-<NN> — <titre à l'impératif>
**Contexte** : <1-2 lignes ; lien vers plans/brainstorm-*.md ou ADR si applicable>
**Scope** :
**Hors scope** : <OBLIGATOIRE — garde-fou anti-scope-creep. Si tu n'as rien à y mettre,
                  le ticket est mal cadré : ne le propose pas encore.>
**Critères d'acceptation** :
- [ ] <vérifiable ; pas "ça marche bien">
- [ ] <un critère de test si le ticket touche une mécanique>
**Dépend de** : <IDs ou "aucune">
**Coût** : S / M / L
```

## Le cycle de session
1. **Inventaire** — X ouverts, Y bloqués, Z candidats au nettoyage. Affiche-le en chat.
2. **Propositions** — TOUT ce que tu ferais, dans un JSON : nouveaux tickets, modifs, fusions,
   découpages, repriorisations, **et les statu quo**. Une ligne par action, avec `reco` et coût.
3. **Feuille de validation** :
   ```bash
   python tools/backlog-studio/scripts/make_review.py propositions.json --out reviews/review-<date>.xlsx
   ```
   🛑 **STOP.** Adrian coche.
4. **Relecture** : `python tools/backlog-studio/scripts/read_review.py reviews/review-<date>.xlsx`
5. **Application** — uniquement le bloc `appliquer`. Les `MODIFIER` repartent pour un tour.
   Les `PLUS TARD` vont dans `TODO.md` avec la date.
6. **Diff résumé** de ce qui a été écrit dans `TASKS.md`.

## Découpage
Un ticket au-delà de « L » se découpe. Propose le découpage (`type: DÉCOUPAGE`), ne l'impose pas.
Chaque sous-ticket doit être livrable et testable seul.

## Éléments de contexte
- **SKL-E1** (audit des skills non documentés dans `skills.js`) : bloqué tant que le fichier n'est
  pas transmis. Ne devine pas le contenu. Propose le statu quo, ou rappelle-le si le sujet arrive.
- **Map 2** : gelée tant que Map 1 n'est pas testée. Un ticket Map 2 se propose en `PLUS TARD`
  plutôt qu'en création — mais c'est Adrian qui coche.

## Anti-patterns
- Écrire dans `TASKS.md` « pour gagner du temps » avant validation. **Jamais.**
- Proposer sans avoir relu `TASKS.md` en entier.
- Un « Hors scope » vide.
- Marquer un ticket `done` à la place d'Adrian.
- Traiter une cellule vide comme un accord tacite.
