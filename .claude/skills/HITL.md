# Protocole HITL — commun aux 3 skills

## Principe
Claude **propose**, Adrian **dispose**. Aucune écriture dans `TASKS.md`, `ADR.md`, `CONTEXT.md`,
`TODO.md` ou `src/` sans décision explicite d'Adrian, ligne par ligne.

**Le statu quo est une proposition comme une autre.** « Ne rien changer sur SKL-E1 » doit apparaître
dans la feuille de validation et être coché. Claude ne décide jamais, même de l'inaction.

## Le cycle
```
1. Claude LIT le contexte (ADR / CONTEXT / TASKS / TODO)
2. Claude PROPOSE tout — y compris les statu quo — dans un JSON
3. make_review.py → reviews/review-<date>.xlsx
4. 🛑 ADRIAN coche la colonne DÉCISION, sauvegarde
5. read_review.py → Claude ne lit QUE les décisions
6. Claude APPLIQUE uniquement le bloc "appliquer"
7. Claude affiche un diff résumé de ce qu'il a écrit
```

## Les 4 décisions
| Décision | Effet |
|---|---|
| `OUI` | Claude applique |
| `NON` | Abandonné **pour maintenant**. Pas de trace permanente. Rediscutable sans friction. |
| `PLUS TARD` | Parking. Noté dans `TODO.md` avec la date, réouvrable quand Adrian veut. |
| `MODIFIER` | Claude retravaille selon le commentaire et **repropose** (nouveau tour de validation). |
| *(vide)* | **NON TRAITÉE.** Claude n'applique rien et le redemande. Jamais d'interprétation. |

## Règle sur les refus — IMPORTANT
Un `NON` **n'est pas un verrou**. On ne tient PAS de registre de « décisions définitivement
rejetées » : un avis peut changer, et une idée écartée en juin peut devenir la bonne en octobre.

Concrètement :
- Ne crée jamais de section « rejeté, ne plus jamais proposer ».
- Ne bloque jamais une exploration au motif qu'un sujet proche a déjà été refusé.
- Si un sujet a été écarté récemment, tu peux le **signaler en une ligne** (« au passage : on avait
  écarté ça le 12/06 pour cause de coût — le contexte a changé ? ») puis **continuer normalement**.
  C'est une information, pas une objection.
- Seul `ADR.md` fait autorité. Une ADR *acceptée* est une contrainte active (Claude la signale et
  demande confirmation avant de la contredire). Un simple `NON` en review n'a pas ce statut.

## Génération de la feuille
```bash
python tools/backlog-studio/scripts/make_review.py propositions.json --out reviews/review-<date>.xlsx
python tools/backlog-studio/scripts/read_review.py reviews/review-<date>.xlsx
```
Schéma d'une proposition :
`ref`, `type`, `cible`, `titre`, `detail`, `justification`, `cout` (S/M/L/-), `reco` (OUI/NON/A DISCUTER)

`type` ∈ NOUVEAU TICKET · MODIF TICKET · FUSION · SUPPRESSION · REPRIORISATION · DÉCOUPAGE ·
STATU QUO · ADR · OPTION DESIGN · PLAN

## Mode dégradé
Si openpyxl n'est pas dispo ou si la review compte ≤ 3 propositions, propose un **tableau markdown
en chat** avec une colonne DÉCISION vide, et attends la réponse. Le protocole ne change pas :
rien ne s'écrit sans aval.
