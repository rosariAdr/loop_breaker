One-sentence: The visible turn order above the arena — diamond portraits, side coded by frame colour, acting-first.

```jsx
<TurnBand
  where="Ashenvale Forest · Lv 1–8 · Turn 3"
  entries={[
    { initial: 'C', name: 'Corwin' },
    { initial: 'W', name: 'Ashwood Wolf', foe: true },
    { initial: 'R', name: 'Roswyn' },
  ]}
/>
```

This is the component that makes AGI strategic (CMB-ATB02): a slow hero shows as two consecutive enemy portraits. It takes a variable number of fighters without changing shape, which is why it survives companions (v1.61). Keep `slots` between 5 and 7 — beyond that the band stops being readable at a glance.
