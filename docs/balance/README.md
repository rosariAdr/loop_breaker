# docs/balance — exports de travail (balance)

Ce dossier héberge les **exports Excel** générés pour l'équilibrage (quêtes, monstres, drops).

- **Non versionnés** : les `.xlsx` sont ignorés par git (cf. `.gitignore`). Ils sont **régénérables** depuis les données du jeu.
- **Source de vérité** : les valeurs (XP de quête, points de rang, taux/quantités de drop) ont vocation à vivre **en code** une fois implémentées (FIX-QXP01 / FIX-QRANK01). D'ici là, les versions **remplies** sont conservées hors repo (Downloads / Drive).

## Fichiers attendus ici
- `Loop_Breaker_Quetes.xlsx` — quêtes par lieu (onglets Greywatch / Millhaven / Ironhaven / Église) + colonnes XP / Points de rang.
- `Loop_Breaker_Monstres.xlsx` — monstres + drops (XP, or, skill, ressources, probas) par spot + onglet « Drops (détail) » (espérance).

## Régénération
Les générateurs sont des scripts jetables (créés à la demande, lancés via `vite-node`, puis supprimés). Demander à Claude de « régénérer l'export quêtes/monstres » — l'écriture `.xlsx` est faite en pur Node (zip OOXML, zéro dépendance).
