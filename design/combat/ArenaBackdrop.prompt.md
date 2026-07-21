One-sentence: The painted arena plate for a hunting spot, with an elite ambience layer laid over the same painting.

```jsx
<ArenaBackdrop zone="ashenvale_forest" />
<ArenaBackdrop zone="hollow_crypt" rank="elite" />
<ArenaBackdrop zone="thornmarsh" src="/arenas/thornmarsh.png" />
```

One plate per hunting spot (`ASSET_PROMPTS` §11). `rank="elite"` does NOT swap the image — it overlays a darkened sky, embers and a red vignette, so five illustrations cover ten encounters and the contrast only has to be validated once. Without `src` you get the CSS stand-in used in the mockups.
