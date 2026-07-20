# Scénarios de test fonctionnels — grille de recette (release gate)

> **Règle (proposée — cf. review 2026-07-19)** : dérouler **les 10 scénarios** dans le navigateur (`npm run dev`)
> et les cocher **avant tout merge `dev → master`**. Condition sine qua non de release, en complément de la
> checklist technique (`test:run` / `build` / `lint`, cf. `CONTRIBUTING.md` §5/§7).
> Un scénario en échec = bug bloquant → ticket `FIX-` + re-test après correctif.
>
> Origine : audit fonctionnel du 2026-07-17 (scénarios S1/S8/S9 + moitié de S6 déroulés en session — verts).
> Utiliser le **Test harness** (`Ctrl+Shift+D`) pour accélérer (téléportation, cheats, Die→PostMortem, Safety net en combat).

## Comment dérouler une passe

1. Vider la save : DevTools → Application → Local Storage → supprimer `roguelite_save` (ou Settings → Reset save).
2. Dérouler S1 → S10 dans l'ordre (S1 exige une save vierge ; les suivants peuvent s'appuyer sur le debug panel).
3. Cocher ci-dessous avec la date + commit testé. Toute anomalie → noter + ticket.

| # | Scénario | Dernier passage | Résultat |
|---|---|---|---|
| S1 | Onboarding nouveau joueur | 2026-07-17 (partiel) | ✅ (2 maillons) |
| S2 | Récolte → craft forge → équiper | — | ⬜ |
| S3 | 9 slots + bonus de set | — | ⬜ |
| S4 | Maître itinérant | — | ⬜ |
| S5 | Statut frozen en combat | — | ⬜ |
| S6 | Quêtes : adjacence + pools disjoints | 2026-07-17 (partiel) | ✅ (1 village) |
| S7 | Grimspire → Malachar 3 phases | — | ⬜ |
| S8 | Mort → héritage → boutique → run 2 | 2026-07-17 (partiel) | ✅ (sans passif ni achat) |
| S9 | Fog / node-locking + voyage | 2026-07-17 | ✅ |
| S10 | Idle + retour offline | — | ⬜ |

---

## S1 — Onboarding nouveau joueur (QONBOARD01)
- **Étapes** : save vierge → recharger → nommer le héros → suivre le guidage (quête principale « The Waking » +
  chaîne « Premières fois ») sans dévier, jusqu'au bout de la chaîne d'onboarding. F5 en cours de route.
- **Attendu** : chaque étape pointe un élément réellement cliquable ; aucune étape bloquante ; l'état d'onboarding
  persiste après F5 ; la chaîne ne se redéclenche pas une fois terminée ; **tout le texte est en anglais**.
- **Valide** : QONBOARD01/QOBJ-TYPES01, first-time UX, persistance.

## S2 — Récolte → craft forge (mini-jeu) → équiper
- **Étapes** : farmer les ressources d'une recette de base (loups Ashenvale) → village → forge → recette d'arme →
  mini-jeu réussi ; refaire un craft en **ratant volontairement** le mini-jeu.
- **Attendu** : consommation exacte des ressources ; qualité liée au score (raté = qualité moindre/échec sans crash) ;
  item en inventaire et équipable immédiatement.
- **Valide** : boucle récolte→craft→équip, qualité hybride, cohérence inventaire.

## S3 — Équipement 9 slots + bonus de set
- **Étapes** : via DebugPanel/farm, obtenir des pièces couvrant les 9 slots dont ≥2 d'un même set → équiper slot
  par slot (HeroSheet/Inventory) → vérifier la fiche → retirer une pièce du set.
- **Attendu** : chaque slot n'accepte que sa catégorie ; stats agrégées correctes à chaque équip ; bonus de set
  activé au seuil et désactivé au retrait ; swap renvoie l'ancien item en inventaire.
- **Valide** : SLOT01/EQP01/SET-*, migrationsSlots, agrégation de stats.

## S4 — Maître itinérant au village
- **Étapes** : dormir plusieurs jours jusqu'à l'arrivée d'un itinérant (indicateur SafeZone) → parler → engagement/
  quête → remplir la condition → revenir avant son départ ; puis dormir au-delà du départ et retenter.
- **Attendu** : présence/absence conformes au calendrier (1 lieu / 4 jours) ; récompense versée une seule fois ;
  après départ, aucun état résiduel cassé (quête ni bloquée ni dupliquée).
- **Valide** : MST08/itinerantEngagement, robustesse temporelle.

## S5 — Statut frozen en combat
- **Étapes** : obtenir un skill de glace (maître/debug `Give savage_bite`→équivalent glace) → combat multi-ennemis →
  appliquer frozen → observer 2-3 tours → laisser expirer.
- **Attendu** : l'ennemi gelé saute son tour ; icône/feedback visible ; décompte correct ; dégel effectif ;
  pas de double application incohérente ; log cohérent.
- **Valide** : SKD-ICE01/frozen, statuts en multi-ennemis.

## S6 — Quêtes : adjacence + pools disjoints (SPOT_OWNER)
- **Étapes** : visiter 2 lieux différents (Greywatch + Millhaven ou Ironhaven) → comparer leurs boards → accepter
  1 quête de village à chaque lieu.
- **Attendu** : chaque board ne propose que des cibles des spots **possédés** par le lieu ; les pools des deux lieux
  sont **disjoints** (0 doublon inter-village) ; pas de doublon quête principale ↔ quête de village au même board
  (post QSV2-DROPDUP01) ; XP/rang affichés cohérents.
- **Valide** : QSV2-SPOTOWNER01, VQ-DEDUP01.

## S7 — Grimspire → Malachar 3 phases (win condition)
- **Étapes** : héros boosté (debug : +attrs, +HP/MP, Full heal) → débloquer/atteindre Grimspire → combat Malachar →
  passer les 3 phases → victoire.
- **Attendu** : transitions de phase aux bons seuils HP avec feedback (log/VFX) ; pas de soft-lock entre phases ;
  victoire → Soul Rend + 200 tokens + titres ; `demonLordDefeated` visible au run suivant.
- **Valide** : BSS03/W01/T13, la win condition du jeu.

## S8 — Mort → héritage complet → achat → run 2
- **Étapes** : héros avec stats montées + ≥1 skill actif + ≥1 passif équipés → mourir (Blighted Road ou debug) →
  PostMortem : vérifier le résumé → choisir 1 stat + 1 actif + **1 passif** → Gods' Shop : acheter ≥1 article avec
  les tokens → Transmigrate.
- **Attendu** : résumé exact (cause/level/kills) ; les **3 héritages** présents au run 2 (le passif surtout — jamais
  testé) ; stat héritée = `max(base, 40 % du run)` ; achat déduit les tokens et l'effet est présent au run 2 ;
  carte/quêtes réinitialisées proprement.
- **Valide** : la boucle méta cœur + économie tokens en réel.

## S9 — Fog / node-locking + voyage
- **Étapes** : nouveau run → WorldMap : zones voilées/verrouillées → cliquer une zone verrouillée → progresser dans
  la MQ pour débloquer le node suivant → voyager.
- **Attendu** : clic verrouillé = refus clair ; déblocage visible immédiatement ; coût en tics appliqué ;
  fog levé persistant après F5.
- **Valide** : START01-04/MQ-CHAIN01, lisibilité de la progression spatiale.

## S10 — Idle + retour offline
- **Étapes** : débloquer l'idle (5 kills) → lancer → observer 2-3 min (log, or, HP) → fermer l'onglet → rouvrir
  après un délai (ou manipuler `meta.lastSeen`).
- **Attendu** : gains offline calculés + récap au retour ; idle coupé sous le seuil HP configuré ; aucun gain
  aberrant ; état cohérent après reload.
- **Valide** : idle en session + IDLE-OFF, garde-fous HP.
