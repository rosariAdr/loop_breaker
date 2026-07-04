// FIX-QXP01 / FIX-QRANK01 — Valeurs de balance (XP de héros + points de rang) par quête AUTORÉE.
// Source : Excel de balance (2026-07). Les quêtes de VILLAGE (générées) ne sont PAS ici : leur
// XP/rang est dérivé de la difficulté du spot (cf. `defaultQuestXp`/`defaultQuestRankPoints` dans
// quests.js). Fichier centralisé → destiné au futur pipeline Supabase (SUPA-CODEGEN01).
// Échelle : rang easy 1 · medium 3 · hard 5 ; visites/quêtes « INUTILE » = 0/0.
export const QUEST_BALANCE = {
  // ── Principale (chaîne mq) ──────────────────────────────────────────────
  mq01_waking: { xp: 40, rankPoints: 1 },
  mq02_millhaven_road: { xp: 150, rankPoints: 5 },
  mq03_new_horizons: { xp: 40, rankPoints: 1 },
  mq04_ironhaven_gates: { xp: 150, rankPoints: 5 },
  mq05_iron_city: { xp: 40, rankPoints: 1 },
  mq06_beyond_marsh: { xp: 150, rankPoints: 5 },

  // ── Statiques — Sir Aldric / Doyens ─────────────────────────────────────
  first_blood: { xp: 40, rankPoints: 1 },
  proof_of_worth: { xp: 80, rankPoints: 1 },
  clear_the_marsh: { xp: 150, rankPoints: 5 },
  silence_the_crypt: { xp: 110, rankPoints: 3 },
  storm_the_citadel: { xp: 110, rankPoints: 3 },
  end_the_demon: { xp: 110, rankPoints: 3 },
  bog_purge: { xp: 150, rankPoints: 5 },
  ruins_cleanse: { xp: 110, rankPoints: 3 },

  // ── Statiques — NPC02 (commissions) ─────────────────────────────────────
  nc_thin_the_boars: { xp: 110, rankPoints: 3 },
  nc_oakheart_elite: { xp: 150, rankPoints: 5 },
  nc_fenrot_elite: { xp: 150, rankPoints: 5 },
  nc_graven_elite: { xp: 150, rankPoints: 5 },
  nc_thunderhoof_elite: { xp: 150, rankPoints: 5 },
  nc_forge_offering: { xp: 110, rankPoints: 3 },
  nc_artisans_trial: { xp: 110, rankPoints: 3 },
  // « INUTILE » (marqué au balancing) → aucune récompense de progression
  nc_scout_marsh: { xp: 0, rankPoints: 0 },
  nc_deliver_ruins: { xp: 0, rankPoints: 0 },
  nc_explore_hills: { xp: 0, rankPoints: 0 },

  // ── Maître — initiations (MST02/MST06/MST07) ────────────────────────────
  // Porte d'entrée (preuve de valeur) : équilibré comme une quête easy de départ.
  master_init_aldric: { xp: 40, rankPoints: 1 },
  master_init_vael: { xp: 40, rankPoints: 1 },
  master_init_elyndra: { xp: 40, rankPoints: 1 },
  master_init_bulgar: { xp: 40, rankPoints: 1 },

  // ── Maître martial — Aldric (Greywatch) ─────────────────────────────────
  master_sharpen_strike: { xp: 110, rankPoints: 3 },
  master_focus_cleave: { xp: 110, rankPoints: 3 },
  master_temper_resolve: { xp: 110, rankPoints: 3 },

  // ── Maître arcane — Vael (Ironhaven, Académie) — MST07 ──────────────────
  master_arcane_pulse: { xp: 110, rankPoints: 3 },
  master_soul_rend: { xp: 150, rankPoints: 5 },

  // ── Maître arcane — Elyndra (Millhaven) — MST06 ─────────────────────────
  master_court_venom: { xp: 110, rankPoints: 3 },
  master_court_curse: { xp: 150, rankPoints: 5 },

  // ── Maître berserker — Bulgar (Ironhaven) — MST07 ───────────────────────
  master_pit_frenzy: { xp: 110, rankPoints: 3 },
  master_pit_reckless: { xp: 150, rankPoints: 5 },

  // ── Église (actes de dévotion) ──────────────────────────────────────────
  church_thin_the_pack: { xp: 40, rankPoints: 1 },
  church_cleanse_specters: { xp: 110, rankPoints: 3 },
  church_break_knights: { xp: 110, rankPoints: 3 },
  church_calm_marsh: { xp: 150, rankPoints: 5 },
  church_banish_wraiths: { xp: 150, rankPoints: 5 },
  church_purge_slimes: { xp: 150, rankPoints: 5 },
}
