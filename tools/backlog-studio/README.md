# backlog-studio — scripts de validation HITL

Outillage du pipeline de cadrage Loop Breaker : **Claude propose, Adrian dispose.**

Les skills vivent dans [`.claude/skills/`](../../.claude/skills/) (`lb-brainstorm`, `lb-cadrage`,
`lb-grooming`) et se chargent automatiquement — aucune installation. Ce dossier ne contient que les
deux scripts qu'ils utilisent pour la feuille de validation Excel, plus le protocole commun
[`HITL.md`](../../.claude/skills/HITL.md).

## Scripts

```bash
# Génère la feuille de validation à partir d'un JSON de propositions
python tools/backlog-studio/scripts/make_review.py propositions.json --out reviews/review-<date>.xlsx

# 🛑 Adrian coche la colonne DÉCISION, sauvegarde, puis :
python tools/backlog-studio/scripts/read_review.py reviews/review-<date>.xlsx
```

Schéma d'une proposition (JSON) :
`ref` · `type` · `cible` · `titre` · `detail` · `justification` · `cout` (S/M/L/-) · `reco`

`type` ∈ NOUVEAU TICKET · MODIF TICKET · FUSION · SUPPRESSION · REPRIORISATION · DÉCOUPAGE ·
STATU QUO · ADR · OPTION DESIGN · PLAN

Voir [`scripts/propositions.example.json`](scripts/propositions.example.json) pour un exemple.

## Dépendance

```bash
pip install -r tools/backlog-studio/requirements.txt   # openpyxl
```

> ⚠️ Sur Windows, `python` seul peut pointer vers le stub Microsoft Store. Utilise l'interpréteur
> du venv du projet (`.venv/Scripts/python.exe`) ou active le venv avant de lancer les scripts.
> Le venv n'est pas versionné : `pip install` est à refaire sur chaque poste.
