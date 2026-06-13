# Loop Breaker — Backlog consolidé (session design)

> Bloc d'ajout pour `TASKS.md`. Issu de la session de design. **Map 1 figée**, Map 2 gelée (à activer après test propre).
>
> **Légende** — Statut : `READY` (spec claire) · `GROOM` (décision ouverte, questions inscrites) · `SPLIT` (à découper) · `BLOCKED`.
> Diff : S / M / L / XL · Milestones : `v1` (cœur/onboarding) · `v1.x` (systèmes proches) · `v1.9` (polish) · `v2` (ambition) · `v3` (lointain).
> Format : `- [ ] **ID — Titre** (Diff · Milestone · Statut) — AC. ⟶ renvois.`

## Index milestones (résumé)
- **v1** : chaîne de quêtes/onboarding (F, SUG-E7).
- **v1.x** : skills drops (A), ressources & tiers (B), quêtes village (C), Map 1 (D partiel), unlock & fog (F), crafting créatif (G), titres (J), équipement/sets/slots (K), idle & planification (L), bestiaire (SUG-E2), transverses.
- **v1.9** : indicateur jour/nuit + game feel (H partiel, SUG-E8).
- **v2** : ambush (E), Map 2 (D partiel), jour/nuit complet (H), enchantement (SUG-E1), méta/prestige (SUG-E5), compagnon (SUG-E6), exploration (SUG-E9), QoL (SUG-E10).
- **v3** : économie dynamique (SUG-E4).

---

## ÉPIC A — Refonte des skill drops (physical / magic / passive)

- [ ] **SKL01 — Refactor `skillDropType`** (M · v1.x · READY) — `active` → `physical_active` | `magic_active` (garder `passive`/`none`) ; maj data `MONSTERS` + logique combat/héritage. ⟶ MON01.
- [ ] **SKL02 — Rethème Thicket Hare → Fire Hare** (S · v1.x · READY) — rename id + entrée ASSET_PROMPTS.md + regen asset (lapin de feu).
- [ ] **SKL03 — Skill `ember_burst`** (S · v1.x · READY) — magic_active, drop Fire Hare (Ashenvale) ; 12 mana, CD 2, 1.0×INT feu + 20% Burn.
- [ ] **SKL04 — Skill `fox_fire`** (S · v1.x · READY) — magic_active, drop Russet Fox (Barrow Hills) ; 18 mana, CD 3, 1.2×INT feu + 30% Burn.
- [ ] **SKL05 — Passif `caustic_coat`** (S · v1.x · READY) — Mire Slime ; retour acide 15% en mêlée + debuff Corroded (−DEF, stack 5).
- [ ] **SKL06 — `bramble_slam`** (S · v1.x · READY) — Oakheart (elite physical_active, AoE) ; 16 mana, CD 4, 1.1×ATK cible / 0.6× autres, 30% Thorned DoT.
- [ ] **SKL07 — Mapping des 16 skill drops** (S · v1.x · READY) — table physique/magique/passif/élite par zone (cf. session).
- [ ] **SKL-G1 — Stats des skills d'élite** (M · v1.x · GROOM) — typage confirmé (Fenrot=magic, autres=physical) ; définir stats complètes `plague_maw`, `tomb_judgment`, `trample_charge`.
- [ ] **SKL-G2 — Doc design physical/magic** (S · v1.x · GROOM) — formaliser : physical = renforcement corps / multi-coups / infusion d'arme / charge / contre ; magic = élémentaire / âme-ombre / illusion / bouclier.
- [ ] **SKL-E1 — Revue de `skills.js` (27 skills)** (L · v1.x · BLOCKED) — bloqué tant que `skills.js` n'est pas transmis ; à découper ensuite par catégorie.

## ÉPIC B — Ressources droppées & tiers de monstres

- [ ] **RES01 — Modèle de données ressource** (S · v1.x · READY) — `{id, name, rarityTier, dropRate, sources[], uses[]}`.
- [ ] **RES02 — Drops commun + rare par monstre** (M · v1.x · READY) — 1 commune (collecte) + 1 rare par monstre (~32 ressources) ; taux rares = tier (cf. RES-TIER01).
- [ ] **RES03 — Câblage ressources → recettes** (M · v1.x · READY) — inputs alchimie / forge / cuir / bijou.
- [ ] **RES04 — Ressources "junk" vendeur** (XS · v1.x · READY) — `rotting_hide`, `grave_stone`, `goblin_trinket` : valeur de revente seule.
- [ ] **TIER01 — Champ `tier` (T1/T2/T3)** (S · v1.x · READY) — classer les 3 normaux de chaque zone par puissance.
- [ ] **RES-TIER01 — Item rare de craft tier-based** (S · v1.x · READY) — input de recettes, **distinct** de l'équipement : T2 @15%, T3 @7.5% (T1 aucun).
- [ ] **RES-G1 — Bande commune + scaling** (S · v1.x · GROOM) — confirmer 40-65% commun + scaling éventuel par zone/run_count (rares déjà tranchés).
- [ ] **RES-G2 — Audit recettes existantes** (S · v1.x · GROOM) — cohérence ids (ex. CRF06 antidote ↔ `venom_gland`).

## ÉPIC C — Quêtes de village (règle d'adjacence)

> Pool tournant de quêtes secondaires, **distinct** du spine MQ-CHAIN01.

- [ ] **VQ01 — Modèle de données quête** (S · v1.x · READY) — `type` kill/collect/visit, `target`, `count`, `giver`, `rewards`, `sourceZone`, `difficultyTier`.
- [ ] **VQ02 — Moteur d'adjacence** (M · v1.x · READY) — pool village = union des monstres/ressources des zones adjacentes.
- [ ] **VQ03 — Pool Greywatch** (S · v1.x · READY) — Ashenvale, tier facile (8 quêtes).
- [ ] **VQ04 — Pool Millhaven** (S · v1.x · READY) — Ashenvale (difficile) + Barrow Hills + Crumbled Ruins.
- [ ] **VQ05 — Pool Ironhaven** (S · v1.x · READY) — Crumbled Ruins (difficile) + Thornmarsh + Goblin Cave.
- [ ] **VQ06 — Rotation du board** (S · v1.x · READY) — 3 actives, refresh /3 jours (seed `dayCount`).
- [ ] **VQ07 — Câblage givers** (S · v1.x · READY) — Marta / Elder / Blacksmith / Priest.
- [ ] **VQ-G1 — Tokens en village ?** (XS · v1.x · GROOM) — récompenser des tokens en village ou réserver guilde/église ?
- [ ] **VQ-G2 — Tracking collect** (XS · v1.x · GROOM) — inventaire-à-l'acceptation vs track-après-acceptation.
- [ ] **VQ-G3 — Quêtes d'élite** (XS · v1.x · GROOM) — level-gate ou optionnel dans le pool ?
- [ ] **VQ-G4 — Nb de quêtes actives** (XS · v1.x · GROOM) — 3 partout vs 4 pour Millhaven.
- [ ] **VQ-G5 — Ironhaven inn vs guilde** (XS · v1.x · GROOM) — board d'inn séparé de la Guilde (GLD01) ? pool endgame Final Outpost ?

## ÉPIC D — Restructuration WorldMap (2 maps)

> Niveaux décidés : Ashenvale 1-8 · Barrow Hills 6-14 · Crumbled Ruins 12-22 · Thornmarsh 20-30 · Veteran's 28-38 · Draconic 36-50.

- [ ] **MAP01 — `worldGraph` v2** (M · v1.x · READY) — 2 conteneurs (map1/map2), nodes typés (village/city/zone/safe/dungeon).
- [ ] **MAP02 — Nouvelles `levelRange` par zone** (S · v1.x · READY) — appliquer le barème ci-dessus.
- [ ] **MAP03 — Zone Draconic Supra Metal Rock** (S · v2 · READY) — rethème zone haute Map 2 (id `draconic_supra_metal_rock`).
- [ ] **MAP04 — `EDGES` v2** (S · v1.x · READY) — Map 1 : 8 edges noirs ; Map 2 : 5 edges orange + pont inter-map.
- [ ] **MAP05 — Re-mapping donjons** (S · v1.x · READY) — Goblin Cave→Ironhaven ; Vampire Castle→Map 2 ; Demon Lord→Map 2.
- [ ] **MAP06 — Asset Map 1** (M · v1.x · READY) — génération Nano Banana (prompt cartographie parchemin, réf `eldenmoor.png`) + chemins tracés.
- [ ] **MAP07 — Asset Map 2** (M · v2 · READY) — génération Nano Banana (variante hostile) + chemins orange.
- [ ] **MAP08 — Recalibrage `POS`** (S · v1.x · READY) — coordonnées % des nodes sur les 2 illustrations.
- [ ] **MAP09 — Transition inter-map** (M · v2 · SPLIT) — UI + state de bascule Thornmarsh ↔ Veteran's Playground.
- [ ] **MAP-G1 — Re-leveling Barrow Hills** (XS · v1.x · GROOM) — stats inchangées, zone passe mid-game : valider le ressenti.
- [ ] **MAP-G2 — Bestiaire Thornmarsh Lv 20-30** (XS · v1.x · GROOM) — vérifier la formule de scaling sur la nouvelle range.
- [ ] **MAP-G3 — Nommage assets** (XS · v1.x · GROOM) — `eldenmoor_map1.png` / `draconic_frontier_map2.png` ?

## ÉPIC E — Système d'embuscade (voyage, Map 2)

> S'applique aussi pendant l'**idle** (cf. IDLE-INT01) → risque de mort en idle.

- [ ] **AMB01 — Champ `ambush` sur edges Map 2** (S · v2 · READY) — `{baseChance, eliteChance}`.
- [ ] **AMB02 — Roll par tick** (M · v2 · READY) — `taux = max(15%, baseChance − floor(sumStats/30) × 1%)` (plancher **15%**).
- [ ] **AMB03 — Sous-roll élite** (S · v2 · READY) — 10% que l'embuscade soit un élite.
- [ ] **AMB04 — Surprise** (S · v2 · READY) — l'agresseur joue en premier.
- [ ] **AMB05 — Fuite pénalisée** (S · v2 · READY) — +1 tick.
- [ ] **AMB06 — Spawn haut de range** (XS · v2 · READY) — l'agresseur spawn en haut de la level range de la zone source.
- [ ] **AMB07 — Taux de base par route** (XS · v2 · READY) — 30→50% selon l'edge Map 2.
- [ ] **AMB-G1 — Map 2 seulement ?** (XS · v2 · GROOM) — extension future à Map 1 ?
- [ ] **AMB-G2 — Définition `sum_stats`** (XS · v2 · GROOM) — STR+AGI+INT+DEF+Chance ?

## ÉPIC F — Progression, déblocage & fog (s'appuie sur START01-04 existants)

- [ ] **START01 — Démarrage Greywatch** (— · v1 · à activer) — `currentLocation` initial = greywatch. *(ticket existant)*
- [ ] **START02 — Accès initial limité (node-level)** (— · v1 · à activer) — seul Greywatch ouvert au départ. *(existant)*
- [ ] **START03 — Fog of war généralisé par node + dissipation** (— · v1 · à activer) — **le "nuage" non posé** = ce ticket ; calque par node, retrait à l'unlock. *(existant)*
- [ ] **START04 — Conditions de déblocage par node** (— · v1 · résolu par MQ-CHAIN01) — chaînage = la chaîne de quêtes ci-dessous. *(existant)*
- [ ] **BLDUNL01 — Modèle `building.unlock`** (S · v1 · READY) — verrouillé par défaut + trigger (quête/dialogue/arrivée).
- [ ] **BLDUNL02 — Déblocage progressif des bâtiments** (M · v1 · READY) — **Auberge** via dialogue **doyen** (centre) ; forge/alchimie/cordonnier/bijoutier via **quête du maître** (devant le bâtiment) ; **marchand ouvert d'office**.
- [ ] **BLDUNL03 — Académie via quête** (S · v1 · READY) — débloquée à l'arrivée en ville (maître Académie).
- [ ] **BLDUNL04 — Guilde via quête** (S · v1 · READY) — débloquée en ville (maître de Guilde).
- [ ] **BLDUNL05 — Feedback bâtiment verrouillé** (S · v1 · READY) — grisé + tooltip « Quête X requise » ; cohérent fog (START03) + horaires (BLD01).
- [ ] **MQ-CHAIN01 — Chaîne de quêtes Map 1** (L · v1 · READY) — spine unifié zones+bâtiments (contenu ci-dessous). Map 2 (MQ07-10) **gelé**.
- [ ] **MQ-ELITETURN01 — Type de quête "élite"** (M · v1 · READY) — objectif : 3× item rare de l'élite **OU** son arme ; récompense : **arme de l'élite** ; si l'arme a été rendue → **même arme +1 rareté**.

### MQ-CHAIN01 — détail (Map 1)

**Greywatch**
- `MQ01` *L'éveil* — Doyen (centre) — parler → **Auberge + Ashenvale Forest** — récompense : kit départ + tuto.
- `BQ-GW1` *Le feu de la forge* — Forgeron — 5× minerai (Ashenvale) → **Forge** — récompense : **ressources monstres** + tuto forge.
- `BQ-GW2` *Remèdes des bois* — Alchimiste — 5× herbe (Ashenvale) → **Alchimie** — récompense : **ressources monstres** + tuto alchimie.
- *(Marchand : ouvert d'office.)*
- `MQ02` *La route de Millhaven* — Doyen — 3× item rare **Old Oakheart** OU son arme → **→ Millhaven** — récompense : **arme d'Oakheart** (ou +1 rareté).

**Millhaven**
- `MQ03` *Nouveaux horizons* — Chef Millhaven — 2× équip. **T1/T2 (Ashenvale)** → **Barrow Hills + Crumbled Ruins** — récompense : or + carte d'aventurier.
- `BQ-MH1` *Cuir et lanières* — Cordonnier — 5× cuir (Barrow Hills) → **Cordonnier** — récompense : **ressources monstres** + tuto.
- `BQ-MH2` *Éclats et gemmes* — Bijoutier — 5× gemme (Crumbled Ruins) → **Bijoutier** — récompense : **ressources monstres** + tuto.
- `MQ04` *Les portes d'Ironhaven* — Chef Millhaven — 3× item rare **Thunderhoof** OU son arme → **→ Ironhaven** — récompense : **arme de Thunderhoof** (ou +1 rareté).

**Ironhaven**
- `MQ05` *La cité de fer* — Chef de ville — 2× équip. **T1/T2 (Ashenvale)** → bâtiments + marché ville — récompense : accès marché.
- `BQ-IH1` *L'épreuve de l'Académie* — Maître Académie — quête → **Académie** — récompense : tome de skill.
- `BQ-IH2` *La Guilde* — Maître de Guilde — quête → **Guilde** (rangs, quêtes ville) — récompense : rang initial + tokens.
- `MQ06` *Au-delà du marais* — Guilde — 3× item rare **Graven Sentinel** OU son arme → **Thornmarsh** — récompense : **arme de Graven Sentinel** (ou +1 rareté).

**Map 2 (gelé)** : `MQ07` Veteran's Playground · `MQ08` Final Outpost · `MQ09` Draconic + Vampire Castle · `MQ10` Demon Lord. Élite réservé : Fenrot Devourer.

## ÉPIC G — Artisanat créatif & métiers étendus

> Modèle de gating à 3 axes : **Concentration** (qualité, STA03) · **Grade de craft** (par métier → recettes) · **Outils de craft** (par métier → succès+rareté) · **Lieu** (plafond rareté).

- [ ] **CRAFT-GRADE01 — Grades de craft par métier** (M · v1.x · READY) — progression par profession débloquant ses recettes. *(remplace l'idée de "niveau" global CRAFT-LVL01)*
- [ ] **CRAFT-TOOL01 — Outils de craft par métier** (M · v1.x · READY) — équipables, +taux de succès **et** +chance de rareté, spécifiques à la profession.
- [ ] **CRAFT-QUEST01 — Quêtes de craft** (S · v1.x · READY) — récompensent des outils (et/ou Concentration).
- [ ] **CRAFT-KNOWN01 — Recettes connues vs à découvrir** (S · v1.x · READY) — connues = débloquées par grade/livre ; découvrables = assemblage libre.
- [ ] **CRAFT-MULTI01 — Plusieurs recettes → même objet** (M · v1.x · READY) — `itemId` cible + N combinaisons valides.
- [ ] **CRAFT-RARITY01 — Recette → taux de rareté** (S · v1.x · READY) — chaque combinaison porte sa table de qualité.
- [ ] **CRAFT-LOC01 — Plafond de rareté par lieu** (M · v1.x · READY) — forgeron village (Greywatch/Millhaven) → normal+rare ; ville (Ironhaven) → normal→épique ; sup. + recettes via quête. ⟶ PROG02, LEAT01 (forge+cordonnier).
- [ ] **BIJOU01 — Métier bijoutier** (M · v1.x · READY) — 5ᵉ profession (bagues/amulettes), alimente les nouveaux slots ; pattern LEAT01.
- [ ] **BIJOU-BLD01 — Bâtiment + NPC bijoutier** (M · v1.x · READY) — BLD_POS / NPCS / BUILDING_INFO ; prérequis de BIJOU01.
- [ ] **CRAFT-DISC01 — Craft expérimental (découverte)** (M · v1.x · GROOM) — assembler librement des ingrédients pour tenter un objet hors recette connue.
- [ ] **CRAFT-G2 — Mécanique de découverte** (S · v1.x · GROOM) — slots libres ? indices ? échec = perte d'ingrédients ? lien CraftingMinigame/CRAFTMG01.
- [ ] **CRAFT-G3 — Pondération qualité** (S · v1.x · GROOM) — articulation rareté ↔ Concentration (STA03) ↔ outils ↔ score mini-jeu.
- [ ] **CRAFT-LOC-G1 — Exception maître forgeron** (S · v1.x · GROOM) — Z06 (spawn village, recettes Rare/Epic) = exception au plafond village ? + axe grade.
- [ ] **PERMSTAT01 — Items de stats définitives** (M · v2 · GROOM) — craftables, coût en ingrédients **très rares OU en grande quantité** ; étend ITM01. *Non prioritaire.*

## ÉPIC H — Cycle jour/nuit

- [ ] **DN01 — Indicateur visuel jour/nuit** (S · v1.9 · READY) — code couleur + icône ☀/🌙 dérivés du tic.
- [ ] **DN02 — Animation d'incrément de temps** (S · v1.9 · READY) — feedback à chaque tic.
- [ ] **DN03 — Variantes de map jour/nuit** (M · v2 · READY) — assets soir/nuit + bascule (4 illustrations au total avec les 2 maps).
- [ ] **DN04 — Capacités nocturnes des monstres** (M · v2 · GROOM) — skills/buffs actifs uniquement la nuit.
- [ ] **DN05 — Récompenses majorées la nuit** (S · v2 · GROOM) — loot/exp/or bonus, contrepartie de la difficulté.
- [ ] **DN-G1 — Cadrage jour/nuit** (S · v2 · GROOM) — seuils (tics = nuit), capacités par monstre, barème de bonus ; liens EVT03 + AMB.
- [ ] **NSKL01 — Drop de skill rare nocturne** (M · v2 · READY) — 5% sur **n'importe quel** monstre d'une zone, **uniquement la nuit** ; flag `nightRareSkill` + état nuit.
- [ ] **NSKL02 — 6 skills rares nocturnes** (M · v2 · GROOM) — 1 par zone (Ashenvale, Barrow Hills, Crumbled Ruins, Thornmarsh, Veteran's, Draconic).
- [ ] **NSKL-G1 — Balance** (S · v2 · GROOM) — puissance « assez bon », interaction drops normaux, héritabilité (T12), Codex.

## ÉPIC I — Monotonie / burnout

> Axe **distinct de la Fatigue** (STA01) : la Fatigue = effort total (sommeil) ; le burnout = manque de variété (changer d'activité).

- [ ] **BURN01 — Tracker de variété d'actions** (M · v1.x · READY) — fenêtre glissante (combat/craft/repos/collecte/voyage) ; réutilise `countWithinDays`.
- [ ] **BURN02 — Malus de monotonie** (M · v1.x · READY) — **sur-combat → −Aura temp** ; **sur-craft → −Concentration temp** ; **exemption si ≥2 activités** planifiées. *(pas de mitigation par palier de stat.)*
- [ ] **BURN-G1 — Chiffrage** (S · v1.x · GROOM) — taille de fenêtre, seuils, magnitude du malus, durée/levée ; border l'interaction avec STA04 (éviter spirale Fatigue+burnout).

## ÉPIC J — Titres (affichage + buffs)

- [ ] **TITLE-DISP01 — Titre au-dessus du nom** (S · v1.x · READY) — afficher le titre actif au-dessus du nom (carte + combat), en plus du HeroSheet (M01).
- [ ] **TITLE-BUF01 — Buffs de titre** (S · v1.x · READY) — `statBuffs` sur les données de titre + application aux stats dérivées.
- [ ] **TITLE-G1 — Actif vs cumul** (XS · v1.x · GROOM) — un titre actif (affiché+buff) ou cumul de tous ? + barème de buffs par titre.

## ÉPIC K — Équipement : drops, tiers, sets, slots

> Slots finaux (9) : casque, armure, gants, bottes, amulette, 2 bagues, arme principale, arme secondaire. *(Ceinture reportée.)*

- [ ] **EQDROP01b — Drops d'équipement tier-based** (M · v1.x · READY) — pièce de set : **T1 @15% · T2 @7.5% · T3 @3% · élite @10%**. L'élite droppe l'**arme signature = 4ᵉ pièce de set**.
- [ ] **EQDROP-G1 — Pool d'équipement** (S · v1.x · GROOM) — par zone/tier + rareté ; lien EQUIPMENT_TEMPLATES + Z07.
- [ ] **SET-CONTENT01 — Contenu des sets** (M · v1.x · READY) — sets de zone (3 normaux + arme élite = 4 pièces) **+ sets au max de slots** (jusqu'à 9) en zones haut-level ou craftables. Renseigne `equipment.set`. ⟶ EQP01.
- [ ] **SET-G1 — Modèle de bonus de set** (S · v1.x · GROOM) — bonus = **% du stat fourni par les pièces** : 2→+5%, 3→+12-14%, 4→+20% (étendre 5→9) ; un set fournit 1-3 stats ; chaque pièce = stat fixe (ex. 5-9 STR).
- [ ] **SET-UI01 — Affichage des bonus de set actifs** (S · v1.x · READY) — pièces 2/3/4… + bonus appliqués (HeroSheet/onglet Équipement).
- [ ] **SLOT01 — Étendre `equipped` 6 → 9 slots** (M · v1.x · READY) — casque/armure/gants/bottes/amulette/2 bagues/arme principale/arme secondaire + **migration save**. Armes : 2M = 2 slots ; 1M + (bouclier OU 2ᵉ arme OU vide). *(Synergies arme↔skill plus tard.)*
- [ ] **SLOT02 — Onglet « Équipement » dans l'inventaire** (S · v1.x · READY) — étendre la grille Equipped de UI07 (plutôt que surcharger le HeroSheet UI06).
- [ ] **UX-COMPARE-EXT01 — Comparaison équipement étendue** (S · v1.x · READY) — étendre UX02 (6 slots) aux nouveaux slots (bagues/amulette).

## ÉPIC L — Idle & planification

- [ ] **IDLE-MASTERY01 — Seuil de maîtrise idle à 5×** (S · v1.x · READY) — unifier combat ET craft à 5× (au lieu de 10 pour le combat). *(révisable plus tard.)*
- [ ] **IDLE-CRAFT01 — Idle généralisé au craft** (M · v1.x · READY) — une recette craftée 5× peut être produite automatiquement en idle.
- [ ] **PLAN01 — Écran de planification (auberge/foyer)** (M · v1.x · READY) — choisir : zone de combat, niveau d'objet à forger, type de potion, niveau chaussure/ceinture, bijou ; **conseils contextuels** (« danger ! », « risqué… ») selon les choix.
- [ ] **PLAN02 — Prérequis ≥3 activités** (S · v1.x · GROOM) — au moins 3 parmi combat/forge/potion/cordonnier/bijoutier pour que la planification ait un intérêt.
- [ ] **IDLE-SAFE01 — Sécurité idle** (M · v1.x · READY) — auto-stop HP + auto-fuite réglables ; gestion de la **mort pendant l'idle** (l'embuscade peut tuer) ; récap offline gère la mort. ⟶ QOL01, IDLE-OFF.
- [ ] **IDLE-INT01 — Interactions idle (résolu)** (S · v1.x · READY) — **idle de nuit → drops nocturnes obtenus** (décision du plan) ; **embuscade en idle → risque de mort** ; **burnout exempté si ≥2 activités**.

## Transverses (tickets nécessaires)

- [ ] **MIGRATE-EXT01 — Migration de save étendue** (M · v1.x · READY) — `loadGame` couvre tous les nouveaux champs : `tier`, `equipment.set`, slots étendus, `titleBuffs`, `building.unlock`, état burnout, `nightSkill`.
- [ ] **BAL-INTEG01 — Intégrer les nouveaux drops au balancing** (M · v1.x · READY) — items rares tier, équipement, pièces de set, skills nocturnes dans BAL-CSV01 + courbe d'économie.
- [ ] **QA-EXT01 — Étendre l'audit d'intégrité** (S · v1.x · READY) — QA01 couvre les nouveaux ids : sets, tiers, ressources craft, skills nocturnes, bijoux.
- [ ] **ACHIEVE-SYS01 — Système d'achievements formel** (M · v1.x · READY) — `src/data/achievements.js` (id, condition, cible, récompense) ; pré-requis de UI-ACHIEVE-PREVIEW.
- [ ] **ZONE-NAMING01 — Nettoyage des ids de zone** (S · v1.x · READY) — cohérence `crumbled_ruins` / `draconic_supra_metal_rock` après restructuration ; pas de référence morte.
- [ ] **REP-REBAL01 — Rééquilibrage des tokens** (M · v2 · GROOM) — débloquer REP01 avec les nouveaux puits (Gods' Shop méta, enchantement) et sources (quêtes principales).

---

## Épics suggérées (retenues)

### SUG-E1 — Enchantement & sertissage (v2)
- [ ] **ENCH01 — Renforcement +N** (M · v2 · READY) — améliorer une pièce par paliers via matériaux, plafond selon rareté.
- [ ] **SOCKET01 — Sertir des mana stones** (M · v2 · READY) — emplacements sur l'équipement, bonus stat/élémentaire ; réutilise l'inventaire de pierres.
- [ ] **ENCH02 — Risque d'échec** (M · v2 · GROOM) — perte/rétrogradation atténuée par pierres de protection.

### SUG-E2 — Maîtrise du bestiaire (v1.x)
- [ ] **BEST01 — Paliers de kills → bonus permanents** (M · v1.x · GROOM) — 10/50/100 kills → bonus ciblés inscrits au Codex.
- [ ] **BEST02 — Lore & recettes via Codex** (S · v1.x · GROOM) — déblocages à la complétion d'entrées.
- [ ] **BEST03 — Succès de complétion de zone** (S · v2 · GROOM) — titre ou bonus de set à la complétion.

### SUG-E5 — Profondeur méta / prestige (v2)
- [ ] **META01 — Arbre méta persistant** (L · v2 · GROOM) — bonus globaux durables entre transmigrations (monnaie méta).
- [ ] **META02 — Choix de carryover étendus** (M · v2 · GROOM) — sélectionner skills/stats/ressources à conserver.
- [ ] **META03 — Modificateurs NG+** (M · v2 · GROOM) — modificateurs optionnels (plus durs / plus de loot) selon les runs.

### SUG-E6 — Compagnon / familier (v2)
- [ ] **COMP01 — Familier d'assistance** (L · v2 · GROOM) — aide combat/idle, barre de vie + slot dédié.
- [ ] **COMP02 — Apprivoisement** (XL · v2 · GROOM) — capturer des créatures vaincues.
- [ ] **COMP03 — Progression du familier** (L · v2 · GROOM) — niveaux/évolutions/compétences.

### SUG-E7 — Onboarding & tutoriel (v1)
- [ ] **TUT01 — Tutoriel contextuel** (M · v1 · READY) — déclenché à la 1ʳᵉ occurrence de chaque action clé ; désactivable.
- [ ] **TUT02 — Chaîne des quêtes principales = fil tuto** (M · v1 · READY) — chaque MQ enseigne une mécanique. ⟶ MQ-CHAIN01.
- [ ] **TUT03 — Panneau d'aide / codex de règles** (S · v1 · READY) — stats, fatigue, divinités, transmigration.

### SUG-E8 — Game feel : audio & animations (v1.9)
- [ ] **FEEL01 — SFX par action** (M · v1.9 · READY) — coup, craft, loot, level-up.
- [ ] **FEEL02 — Musique par zone & jour/nuit** (M · v1.9 · READY) — ambiance médiévale fantasy.
- [ ] **FEEL03 — Juice visuel** (M · v1.9 · READY) — screen-shake, particules de loot, transitions ; lien DN02.

### SUG-E9 — Exploration & secrets de map (v2)
- [ ] **EXPL01 — Nodes cachés** (M · v2 · GROOM) — révélés par dissipation du fog ou indice d'informateur.
- [ ] **EXPL02 — Événements de route non-combat** (M · v2 · GROOM) — marchand ambulant, sanctuaire, voyageur.
- [ ] **EXPL03 — Coffres / trésors de zone** (S · v2 · GROOM) — découverte unique, loot/ressources rares.

### SUG-E10 — QoL & accessibilité (v2)
- [ ] **QOL01 — Contrôle de vitesse + auto-battle** (M · v2 · READY) — ×1/×2/×4 + seuils HP/mana, fuite auto. ⟶ IDLE-SAFE01.
- [ ] **QOL02 — Multi-slots de sauvegarde + export/import** (S · v2 · READY) — JSON.
- [ ] **QOL03 — Raccourcis clavier remappables** (S · v2 · READY) — actions fréquentes.

---

## Décisions verrouillées (mémo)
- Idle débloqué à **5×** (combat + craft).
- Bijoutier = **métier à part entière** (bâtiment + NPC + recettes).
- Burnout : sur-combat → −Aura ; sur-craft → −Concentration ; exempt si ≥2 activités ; **pas** de mitigation par palier.
- Sets : élite = **4ᵉ pièce = arme signature** ; sets jusqu'à 9 slots (haut-level/craft).
- Drops équipement : T1 15% · T2 7.5% · T3 3% · élite 10%. Item rare de craft **distinct** (T2 15% · T3 7.5%).
- Slots : 9 (ceinture reportée).
- Concentration = qualité de craft (global) ; grades + outils = par métier.
- Map 2 **gelée** jusqu'au test de Map 1.

## Bloqueurs
- **SKL-E1** : nécessite la transmission de `skills.js`.
