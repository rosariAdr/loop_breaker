// NPC01 — Panneau de dialogue (rend un nœud + ses options, navigue l'arbre).
// Réutilisable dans le panneau PNJ (couche B portrait) ou en standalone.
import { useState } from 'react'
import { getNode } from '../data/dialogues'

export default function DialoguePanel({ dialogue, speaker, onClose }) {
  const [nodeId, setNodeId] = useState(dialogue?.startId ?? null)
  const node = getNode(dialogue, nodeId)
  if (!dialogue || !node) return null

  const choose = (opt) => {
    if (opt.nextId == null) { onClose?.(); return }
    setNodeId(opt.nextId)
  }

  return (
    <div className="dlg-panel" data-testid="dialogue-panel">
      {speaker && <div className="npc-eyebrow">{speaker}</div>}
      <div className="dlg-text">“{node.text}”</div>
      <div className="dlg-options">
        {node.options.map((o, i) => (
          <button key={i} className="pbtn dlg-opt" onClick={() => choose(o)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
