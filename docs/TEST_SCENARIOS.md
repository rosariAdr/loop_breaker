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

### Mise en route

```
npm run dev -- --host 127.0.0.1     # forcer l'IPv4 : sur ce poste `localhost` résout en ::1
```

Puis `http://127.0.0.1:5173`. Le **Test harness** s'ouvre au bouton flottant `⚙ DEV` (bas-droite) ou
`Ctrl+Shift+D` — il n'existe qu'en build de dev (`import.meta.env.DEV`), jamais en prod.

**Pièges de manipulation connus** (cf. sessions précédentes) :

- La **sauvegarde est débouncée (~30 s)** : après une action, attendre avant de fermer l'onglet, sinon
  le test de persistance (F5) donne un faux négatif.
- En combat, activer le **Safety net** du harness si le but n'est pas de mourir.
- Le harness ne dispose PAS de console d'état arbitraire : le store n'est pas exposé sur `window`.
  Tout passe par les 20 boutons listés ci-dessous — d'où les recettes par scénario.

### Inventaire du Test harness

| Section | Boutons |
|---|---|
| **Navigate** | World Map · Village (téléporte à **Millhaven**/ashenvale) · Forest (ashenvale_forest) · Hero Sheet · Inventory · Quest Board |
| **Triggers** | Start combat (ashwood_wolf) · Divine call (Ignareth) · **Die → PostMortem** · Gods' Shop |
| **Cheats** | +1000 gold · +50 tokens · +500 XP · Full heal · **Skip day (sleep)** · +1 tick · Set run #10 · +5 all attrs · +50 maxHP/MP · Force Ignareth/Sylvara/Voltaris · Kill Malachar · Give savage_bite · **Give frostbite** · +5 wolf_pelt · +3 hp potions · Unlock all idle · Reset game |

### Repères de données utiles

- **Départ** : run 1, zone `ashenvale`, localité **Greywatch**, `dayCount = 1`, `tickCount = 0/24`.
- **9 slots** (`EQUIP_SLOTS`) : `weapon, offhand, helmet, armor, gloves, boots, amulet, ring1, ring2`.
- **Set Iron Vanguard** (def/strength), 7 pièces sur 7 slots distincts :
  `iron_sword, iron_helm, leather_armor, leather_gloves, swift_boots, iron_pendant, iron_band`
  (arme d'élite alternative : `thunderhoof_maul`). Set jumeau : **Wraithbound** (int/maxHp), base `bone_staff`.
- **Paliers de set** : 2 pièces → +5 %, 3 → +13 %, 4 → +20 %, 5 → +27 %, 6 → +34 %, 7 → +41 %.
- **Skills de glace** : `ice_shard`, `frostbite` (**le seul qui gèle : 35 %, 1 tour**), `blizzard` (AoE), `frost_lance`.
  Aucun n'est droppé par un monstre — ce sont des récompenses de maître.
- **Rotation des maîtres itinérants** — 1 maître dans 1 seule agglomération, par blocs de 4 jours :

  | Jours | Maître | Focus | Hôte |
  |---|---|---|---|
  | 0–3 | Pyra the Emberwalker | feu | Greywatch |
  | **4–7** | **Kaira Froststep** | **glace** | **Greywatch** |
  | 8–11 | Grukk Bloodmane | berserker | Greywatch |
  | 12–15 | Pyra | feu | Millhaven |
  | 16–19 | Kaira | glace | Millhaven |
  | 20–23 | Grukk | berserker | Millhaven |
  | 24–35 | Pyra / Kaira / Grukk | — | Ironhaven |
  | 36–47 | Pyra / Kaira / Grukk | — | Stonehaven |

  Cycle complet = 18 blocs = **72 jours**, chaque paire (maître × agglo) exactement une fois.

### Recettes de mise en situation (le plus court chemin par scénario)

| Scénario | Recette harness |
|---|---|
| S2 | `+5 wolf_pelt` + `+1000 gold`, farmer `wolf_fang` sur les loups (55 %), puis Village → forge. Recette 100 % « loups Ashenvale » : **Swift Boots common = 2× wolf_pelt + 2× wolf_fang + 20 g**. (Iron Sword common = 3× `rusted_iron`, qui vient du hollow_knight — autre spot.) |
| S3 | `+1000 gold` ×6 → Greywatch (ville) → marchand/forgeron : acheter les 7 pièces Iron Vanguard ci-dessus (`merchantStock` common/rare/epic en ville) |
| S4 | `Skip day (sleep)` ×3 depuis le jour 1 → **jour 4, Kaira Froststep à Greywatch** ; puis ×4 encore → jour 8, elle est partie |
| S5 | `Give frostbite` + `+5 all attrs` + `+50 maxHP/MP` → `Start combat` (raccourci ; le chemin « légitime » passe par S4) |
| S7 | `+5 all attrs` ×5, `+50 maxHP/MP` ×5, `Full heal` → World Map → Grimspire (⚠️ ne PAS cliquer `Kill Malachar`, qui court-circuite le combat) |
| S8 | monter 2-3 stats + équiper 1 actif et 1 **passif**, puis `Die → PostMortem` ; `+50 tokens` avant si la boutique doit être testée |
| S10 | `Unlock all idle` (met 10 kills sur 5 monstres) → lancer l'idle |

> ⚠️ **S1 ne doit utiliser aucun cheat** : c'est le seul scénario qui teste le parcours réel d'un nouveau joueur.

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
