One-sentence: The action console — a fixed verb column, the selected verb's contents with mana and tempo costs, and a one-line ribbon.

```jsx
<ActionGrid
  verbs={[{ id: 'attack', label: 'Attack', rank: '×1.0' }, { id: 'skills', label: 'Skills' }]}
  activeVerb="skills"
  skills={[{ name: 'Power Strike', cost: 20, rank: 'slow', description: '180 % STR, next turn pushed back.' }]}
  ribbon="180 % STR, next turn pushed back."
/>
```

Fixed size on purpose: switching verb never moves the layout, and the block stays reserved on the enemy's turn. The ribbon replaces floating tooltips, which would cover the arena at the exact moment you are choosing. Each skill shows mana **and** its tempo rank — the cost in turns (CMB-COST01). The ranks are placeholders until that grid is ratified.
