import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'
import { alchemyQuantity, concentrationGain } from '../../utils/crafting'
import { ALCHEMY_RECIPES } from '../../data/recipes'
import CraftingMinigame from '../../components/CraftingMinigame'
import { Panel } from './Panel'

// Z04 + CRF02 — Alchimiste : brassage de potions via mini-jeu de dosage
export default function AlchemyPanel({ onBack }) {
  const { hero, spendGold, removeResource, addConsumable, addHeroDebuff } = useGameStore()
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false)

  const recipe = ALCHEMY_RECIPES.find((r) => r.id === selected)
  const hasIngredients = recipe
    ? Object.entries(recipe.ingredients).every(
        ([id, q]) => (hero.inventory.resources[id] ?? 0) >= q,
      )
    : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canBrew = hasIngredients && hasGold

  const handleBrew = () => {
    if (!canBrew || !recipe) return
    Object.entries(recipe.ingredients).forEach(([id, q]) => removeResource(id, q))
    spendGold(recipe.gold)
    setMsg(null)
    setMinigameOpen(true)
  }

  const handleComplete = ({ tier }) => {
    setMinigameOpen(false)
    useGameStore.getState().spendVigor(3) // STA01 — un craft coûte de la vigueur
    useGameStore.getState().incrementCraftCount() // Q05 — compteur de crafts
    useGameStore.getState().gainConcentration(concentrationGain(tier)) // STA03 — gain de Concentration
    const qty = alchemyQuantity(tier)
    if (qty > 0) {
      addConsumable(recipe.output, qty)
      const flair = tier === 'perfect' ? ' (Perfect!)' : tier === 'good' ? ' (Good!)' : ''
      setMsg(`✓ Brewed ${qty}× ${recipe.name}${flair}`)
    } else {
      const permanent = tier === 'catastrophe'
      addHeroDebuff('poisoned', 7, permanent)
      setMsg(
        permanent
          ? '✗ Catastrophe! The brew turns toxic — Poisoned (permanent).'
          : '✗ Botched brew — Poisoned (7 days).',
      )
    }
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <Panel title="⚗️ Alchemy Workshop" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "The alchemist gestures at the bubbling tubes. 'Steady hands, steady brew.'"
      </p>
      <div className="flex flex-col gap-1.5" style={{ maxWidth: '460px' }}>
        {ALCHEMY_RECIPES.map((r) => {
          const ok =
            Object.entries(r.ingredients).every(
              ([id, q]) => (hero.inventory.resources[id] ?? 0) >= q,
            ) && hero.inventory.gold >= r.gold
          return (
            <button
              key={r.id}
              onClick={() => {
                setSelected(r.id)
                setMsg(null)
              }}
              data-testid={`alchemy-recipe-${r.id}`}
              className="text-left px-3 py-2 rounded text-xs"
              style={{
                background: selected === r.id ? 'rgba(160,110,220,.16)' : 'rgba(201,169,110,.12)',
                border: `1px solid ${selected === r.id ? '#5a40b0' : '#1a1620'}`,
                opacity: ok ? 1 : 0.55,
                fontFamily: 'Cinzel, serif',
              }}
            >
              <span style={{ color: '#b090e0' }}>{r.name}</span>
              <span style={{ color: '#6a5a7a', marginLeft: '0.5rem' }}>
                {Object.entries(r.ingredients)
                  .map(([id, q]) => `${RESOURCES[id]?.name ?? id}×${q}`)
                  .join(', ')}{' '}
                · {r.gold}g
              </span>
            </button>
          )
        })}
      </div>

      {recipe && (
        <button
          onClick={handleBrew}
          disabled={!canBrew}
          className="mt-3 px-4 py-2 rounded text-sm"
          style={{
            fontFamily: 'Cinzel, serif',
            background: canBrew ? 'rgba(160,110,220,.16)' : 'rgba(201,169,110,.12)',
            color: canBrew ? '#b090e0' : '#4a3a5a',
            border: `1px solid ${canBrew ? '#5a40b0' : '#1a1620'}`,
            cursor: canBrew ? 'pointer' : 'not-allowed',
          }}
        >
          ⚗️ Brew {recipe.name}
        </button>
      )}
      {msg && (
        <p
          style={{
            color: msg.startsWith('✗') ? '#c06040' : 'var(--forest-deep)',
            fontSize: '0.82rem',
            fontFamily: 'Cinzel, serif',
            marginTop: '0.5rem',
          }}
        >
          {msg}
        </p>
      )}

      <CraftingMinigame
        open={minigameOpen}
        mode="alchemy"
        title={`Brew — ${recipe?.name ?? ''}`}
        onComplete={handleComplete}
      />
    </Panel>
  )
}
