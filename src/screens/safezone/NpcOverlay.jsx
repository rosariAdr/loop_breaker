import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { portraitSrc } from '../../data/portraits'
import { getDialogue, FALLBACK_DIALOGUE, BUILDING_DIALOGUE_ID } from '../../data/dialogues'
import DialoguePanel from '../../components/DialoguePanel'

// NPC04 — arbre de dialogue par bâtiment (repli générique sinon)
// DLG01 — source unique du mapping bâtiment → dialogue (cf. data/dialogues.js).
const TALK_ID = BUILDING_DIALOGUE_ID

// UI05 — PNJ par bâtiment (portrait pixel couche B + dialogue + action d'entrée)
const NPCS = {
  inn: {
    role: 'marta',
    name: 'Marta',
    title: 'Innkeeper',
    icon: '🛏',
    cta: 'Rest at the Inn',
    line: "Welcome, traveler. Weary bones find rest here — and the ale's not bad either.",
  },
  church: {
    role: null,
    fallback: '⛪',
    name: 'Brother Caelum',
    title: 'Cleric',
    icon: '🙏',
    cta: 'Enter the Church',
    line: 'The Old Gods still listen, child. Pledge your heart, and their favor shall guide your blade.',
  },
  merchant: {
    role: 'merchant',
    name: 'Goodwife Pell',
    title: 'Merchant',
    icon: '🎒',
    cta: 'Browse the wares',
    line: 'Fresh from the road! Potions, blades, trinkets — all fairly priced, I swear it on me cart.',
  },
  blacksmith: {
    role: 'smith',
    name: 'Bram',
    title: 'Blacksmith',
    icon: '🔨',
    cta: 'To the forge',
    line: "Steel and fire, that's all a man needs. Bring me ore and I'll bring you ruin for your foes.",
  },
  master_smith: {
    role: 'smith',
    name: 'Master Hollis',
    title: 'Master Smith',
    icon: '🛠',
    cta: 'Master forge',
    line: "Only the finest work leaves my anvil. Rare materials, rare results — that's the bargain.",
  },
  knight_trainer: {
    role: 'aldric',
    name: 'Sir Aldric',
    title: 'Knight Trainer',
    icon: '⚔',
    cta: 'Train with Aldric',
    line: "So you'd learn the blade? Steel is patient, lad. Train, and I'll make a hero of you yet.",
  },
  alchemy: {
    role: 'mage',
    name: 'Vesna',
    title: 'Alchemist',
    icon: '⚗',
    cta: 'Enter the lab',
    line: 'Mind the dosage — a hair too much and the draught turns to poison. Shall we brew?',
  },
  academy: {
    role: 'mage',
    name: 'Archmagus Oren',
    title: 'Academy Master',
    icon: '📜',
    cta: 'Enter the Academy',
    line: "Knowledge has a price, and a value. Learn a technique — or part with one you've outgrown.",
  },
  // GLD01 — la Guilde des Aventuriers (ville uniquement) : reprend le tableau de quêtes + informateurs
  guild: {
    role: null,
    fallback: '⚜',
    name: 'Guildmaster Doran',
    title: 'Adventurers’ Guild',
    icon: '⚜',
    cta: 'Enter the Guild',
    line: 'Proven blades only past this hall. Take a commission, share a drink, hear what the road whispers.',
  },
}

// IMM01 — actions par bâtiment. L'auberge s'exécute INLINE (repos + feedback,
// pas de 2e fenêtre). Les autres bâtiments ouvrent encore leur panneau via
// onEnter (kind 'panel') — migration vers le corps du panneau en IMM02.
function buildingActions(building, npc, isCity = false) {
  const talk = { ico: '💬', label: 'Talk', kind: 'talk' } // NPC04
  if (building === 'inn') {
    // GLD01 — en ville, le tableau de quêtes est déplacé à la Guilde ; l'auberge
    // ne propose plus que repos + informateurs. Au village, l'auberge garde son board.
    const acts = [{ ico: '🛏', label: 'Rest at the Inn', kind: 'rest', primary: true }]
    acts.push({ ico: '⏳', label: 'Wait', kind: 'wait' }) // WAIT01 — patienter jusqu'à une heure cible
    if (!isCity) acts.push({ ico: '📜', label: 'Quest Board', kind: 'nav', screen: 'quest_board' })
    acts.push({ ico: '🕵', label: 'Ask around', kind: 'panel' }) // TAV01 — informateurs
    acts.push(talk)
    return acts
  }
  if (building === 'guild') {
    // GLD01 — la Guilde des Aventuriers : commissions (tableau de quêtes) + informateurs
    return [
      { ico: '📜', label: 'Guild Board', kind: 'nav', screen: 'quest_board', primary: true },
      { ico: '🕵', label: 'Informants', kind: 'panel' },
      talk,
    ]
  }
  return [{ ico: npc.icon, label: npc.cta, kind: 'panel', primary: true }, talk]
}

export default function NpcOverlay({
  building,
  onClose,
  onEnter,
  showPanel,
  panel,
  isCity = false,
  // UI11 — split B : bouton Talk + contenu additionnel (ex. Pray) rendus SOUS le portrait
  // (colonne gauche), pour les bâtiments qui s'ouvrent directement en mode panneau.
  showSideTalk = false,
  sideContent = null,
}) {
  const npc = NPCS[building]
  const { sleep, setScreen, waitUntilHour } = useGameStore()
  const [flash, setFlash] = useState(null)
  const [talkDlg, setTalkDlg] = useState(null) // NPC04 — dialogue en cours
  const [waitHour, setWaitHour] = useState(null) // WAIT01 — heure cible sélectionnée (null = fermé)
  if (!npc) return null
  const src = npc.role ? portraitSrc(npc.role, 'talk') : null
  const actions = buildingActions(building, npc, isCity)
  const expanded = showPanel || talkDlg

  const run = (a) => {
    if (a.kind === 'rest') {
      sleep()
      const d = useGameStore.getState().world.dayCount
      setFlash(
        `You rest by the hearth — HP and Mana fully restored. Dawn breaks: it is now Day ${d}.`,
      )
    } else if (a.kind === 'nav') {
      setScreen(a.screen)
    } else if (a.kind === 'panel') {
      onEnter()
    } else if (a.kind === 'talk') {
      setTalkDlg(getDialogue(TALK_ID[building]) ?? FALLBACK_DIALOGUE)
    } else if (a.kind === 'wait') {
      // WAIT01 — ouvre le sélecteur, pré-réglé sur l'heure suivante
      setWaitHour((useGameStore.getState().world.tickCount + 1) % 24)
    }
  }

  return (
    <div className="npc-scrim" onClick={onClose}>
      <div
        className={`npc-panel ${expanded ? 'has-panel' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="npc-portrait">
          <div
            className="pframe"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {src ? (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  imageRendering: 'pixelated',
                }}
              />
            ) : (
              <span style={{ fontSize: 84 }}>{npc.fallback || '🧑'}</span>
            )}
          </div>
          <div className="pname">{npc.name}</div>
          <div className="t-label">{npc.title}</div>
          {/* UI11 — colonne gauche du split B : Talk dédié + extras (ex. section Pray) */}
          {showSideTalk && (
            <button
              className="pbtn"
              data-testid="side-talk"
              style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
              onClick={() => setTalkDlg(getDialogue(TALK_ID[building]) ?? FALLBACK_DIALOGUE)}
            >
              <span className="pbtn-ico">💬</span>Talk
            </button>
          )}
          {sideContent}
        </div>
        <div className="npc-body">
          {talkDlg ? (
            // NPC04 — conversation (arbre de dialogue) dans la même fenêtre.
            // UI11 — prioritaire sur le panneau : Talk reste accessible depuis le split B,
            // et sa fermeture revient au panneau (ou à l'intro).
            <div className="npc-panel-host">
              <DialoguePanel
                dialogue={talkDlg}
                speaker={`${npc.name} — ${npc.title}`}
                onClose={() => setTalkDlg(null)}
              />
            </div>
          ) : showPanel ? (
            // IMM02 — panneau fonctionnel rendu DANS la même fenêtre (plus de 2e fenêtre)
            <div className="npc-panel-host">{panel}</div>
          ) : (
            <>
              <div className="npc-eyebrow">
                {npc.name} — {npc.title}
              </div>
              <div className="npc-dialogue">“{flash || npc.line}”</div>
              <div className="npc-actions">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    className={`pbtn ${a.primary ? 'primary' : ''}`}
                    onClick={() => run(a)}
                  >
                    <span className="pbtn-ico">{a.ico}</span>
                    {a.label}
                  </button>
                ))}
                <button className="pbtn" onClick={onClose}>
                  <span className="pbtn-ico">✕</span>Leave
                </button>
              </div>
              {/* WAIT01 — sélecteur d'heure cible (auberge). N'apparaît qu'après clic « Wait ». */}
              {waitHour !== null && (
                <div className="npc-wait" data-testid="wait-selector">
                  <label>
                    Wait until{' '}
                    <select
                      value={waitHour}
                      onChange={(e) => setWaitHour(Number(e.target.value))}
                      data-testid="wait-hour"
                    >
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="pbtn primary"
                    onClick={() => {
                      waitUntilHour(waitHour)
                      const { dayCount, tickCount } = useGameStore.getState().world
                      setFlash(
                        `You wait. It is now Day ${dayCount}, ${String(tickCount).padStart(2, '0')}:00 — no rest taken.`,
                      )
                      setWaitHour(null)
                    }}
                  >
                    Confirm
                  </button>
                  <button className="pbtn" onClick={() => setWaitHour(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
