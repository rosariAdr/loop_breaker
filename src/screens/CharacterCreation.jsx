import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function CharacterCreation() {
  const { renameHero } = useGameStore()
  const [name, setName] = useState('')

  const handleBegin = () => {
    renameHero(name)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #08060e 0%, #050408 100%)' }}
    >
      <div className="w-full max-w-sm mx-4 flex flex-col gap-8 items-center text-center">
        {/* Titre */}
        <div>
          <p
            style={{
              fontFamily: 'Cinzel, serif',
              color: '#d4af70',
              fontSize: '2rem',
              letterSpacing: '0.1em',
            }}
          >
            The Wanderer Awakes
          </p>
          <p
            style={{
              color: '#4a3a2a',
              fontSize: '0.85rem',
              marginTop: '0.6rem',
              fontStyle: 'italic',
            }}
          >
            A soul adrift between worlds... What name do you carry?
          </p>
        </div>

        {/* Input nom */}
        <div className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
            maxLength={24}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded text-center outline-none"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1rem',
              background: '#0a0808',
              color: '#d4af70',
              border: '1px solid #3a2818',
              caretColor: '#d4af70',
            }}
            autoFocus
          />
          <p style={{ color: '#2a2018', fontSize: '0.7rem' }}>Leave blank to remain The Wanderer</p>
        </div>

        {/* Bouton */}
        <button
          onClick={handleBegin}
          className="px-10 py-3 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            letterSpacing: '0.08em',
            background: '#0a1208',
            color: '#80c040',
            border: '1px solid #305020',
          }}
        >
          ⚔ Begin the Journey
        </button>

        {/* Flavour */}
        <p
          style={{ color: '#2a2018', fontSize: '0.72rem', fontStyle: 'italic', maxWidth: '280px' }}
        >
          Each death brings rebirth. Each run, a chance to go further.
        </p>
      </div>
    </div>
  )
}
