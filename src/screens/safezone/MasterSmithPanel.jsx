import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'
import { RARITY_CONFIG, createEquipmentInstance } from '../../data/equipment'
import { resolveCraftOutcome, concentrationGain, rollConcentrationBump } from '../../utils/crafting'
import { MASTER_RECIPES } from '../../data/recipes'
import CraftingMinigame from '../../components/CraftingMinigame'
import { Panel } from './Panel'

// Z06 — Maître forgeron : recettes Rare/Epic via mini-jeu de forge
export default function MasterSmithPanel({ onBack }) {
  const { hero, spendGold, removeResource, addEquipmentToInventory, addHeroDebuff } = useGameStore()
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false)

  const recipe = MASTER_RECIPES.find((r) => r.id === selected)
  const hasIngredients = recipe
    ? Object.entries(recipe.ingredients).every(
        ([id, q]) => (hero.inventory.resources[id] ?? 0) >= q,
      )
    : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canForge = hasIngredients && hasGold

  const handleForge = () => {
    if (!canForge || !recipe) return
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
    const outcome = resolveCraftOutcome(
      recipe.rarity,
      tier,
      rollConcentrationBump(hero.concentration),
    ) // STA03
    if (outcome.success) {
      const item = createEquipmentInstance(recipe.templateId, outcome.rarity)
      addEquipmentToInventory(item)
      const bonus = outcome.rarity !== recipe.rarity ? ` (${tier}! → ${outcome.rarity})` : ''
      setMsg(`✓ ${item.name} forged!${bonus}`)
    } else {
      addHeroDebuff('burnt_hands', 7, outcome.permanentDebuff)
      setMsg(
        outcome.severity === 'catastrophe'
          ? '✗ Catastrophe! The masterwork shatters — Burnt Hands (permanent).'
          : '✗ Botched! Burnt Hands (7 days).',
      )
    }
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <Panel title="🛠 Master Smith" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "A master at the anvil eyes your materials. 'Only the worthy leave with steel.'"
      </p>
      <div className="flex flex-col gap-1.5" style={{ maxWidth: '500px' }}>
        {MASTER_RECIPES.map((r) => {
          const rc = RARITY_CONFIG[r.rarity]
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
              data-testid={`master-recipe-${r.id}`}
              className="text-left px-3 py-2 rounded text-xs"
              style={{
                background: selected === r.id ? 'rgba(212,160,23,.2)' : 'rgba(201,169,110,.18)',
                border: `1px solid ${selected === r.id ? rc.color : 'var(--parchment-shadow)'}`,
                opacity: ok ? 1 : 0.55,
                fontFamily: 'Cinzel, serif',
              }}
            >
              <span style={{ color: rc.color }}>{r.name}</span>
              <span style={{ color: 'var(--ink-soft)', marginLeft: '0.5rem' }}>
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
          onClick={handleForge}
          disabled={!canForge}
          className="mt-3 px-4 py-2 rounded text-sm"
          style={{
            fontFamily: 'Cinzel, serif',
            background: canForge ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
            color: canForge ? 'var(--amber-deep)' : 'var(--ink-soft)',
            border: `1px solid ${canForge ? '#6a5018' : 'var(--parchment-shadow)'}`,
            cursor: canForge ? 'pointer' : 'not-allowed',
          }}
        >
          🛠 Forge {recipe.name}
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
        mode="forge"
        title={`Master Forge — ${recipe?.name ?? ''}`}
        onComplete={handleComplete}
      />
    </Panel>
  )
}
