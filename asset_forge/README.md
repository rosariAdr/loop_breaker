# Asset Forge — prompt-driven asset generation

Prompts are **reusable, parameterized DATA**. We don't store frozen images; we
store prompts in [`manifest.yaml`](manifest.yaml) and regenerate images on-style,
in bulk, idempotently, via Gemini ("Nano Banana"). Every asset is kept in two
versions:

- **`with_bg`** — the raw Gemini output, background intact. **Source of truth,
  never overwritten.**
- **`no_bg`** — transparent (rembg) + resized per category. The file the game
  actually loads.

## Where files land (adapted to this game)

This game (Vite) loads assets from **`public/`**, and Vercel ships whatever is
**committed** in the GitHub repo. So the forge writes straight into `public/`:

| Version | Path | Git |
|---|---|---|
| `with_bg` (raw source) | `public/<folder>/raw/<id>.png` | **gitignored** (`public/*/raw/`) — big, local-only |
| `no_bg` (game-ready) | `public/<folder>/<id>.png` | **committed** → served by Vite, shipped by Vercel |

`<folder>` by category: `monster→monsters`, `building→buildings`, `deity→deities`,
`portrait→portraits`, `deco→deco`. Sizes reuse `scripts/process_assets.py`
(`monsters 512 · buildings/deities 1024 · portraits 128 · deco 512`).

> **Deploy note (corrected).** In this repo `public/` is **committed** (DEPLOY01),
> so generated `no_bg` assets ship automatically once committed — no separate
> asset delivery needed. Only the `raw/` HD sources are excluded. An asset that is
> *not* under `public/` (or not committed) will **not** appear on the deployed
> game.

The background removal is **reused** from `scripts/process_assets.py` (not
duplicated). If `rembg` is missing/fails, the forge logs a warning, **keeps the
`with_bg`**, and continues — you can reprocess later (or via erase.bg).

## Backends (image source)

| Backend | Cost | Key | Style references |
|---|---|---|---|
| **pollinations** *(default)* | **free** | none | no — the style bible carries coherence |
| **hf** (Hugging Face FLUX) | **free** | `HF_TOKEN` (free) | no |
| **gemini** | paid (see Google's pricing page) | `GEMINI_API_KEY` + billing | yes (reference image) |

Pick per run with `--backend pollinations|hf|gemini`, or set a default via the
`FORGE_BACKEND` env var. **The default is free and keyless — it just works.**
Gemini image generation needs a **billing-enabled** key (free tier is text-only).

### Per-asset generation params (optional, in the manifest)
Any entry may override generation: `model` · `width`/`height` (source resolution)
· `size` (final px) · `seed` · `extra` (extra prompt text appended). Example: the
3 bosses use `size: 1024`, `width/height: 1536` and an `extra:` with
"colossal, hulking, low-angle heroic shot…" so they render **bigger and sharper**
than the 512px surface monsters.

## Install

```bash
pip install -r asset_forge/requirements.txt
```

Deps by need: `pyyaml`+`jinja2` (prompts, always) · `rembg`+`onnxruntime`
(background removal → no_bg) · `google-genai`+`python-dotenv` (**gemini backend
only**). `--dry-run` needs only pyyaml+jinja2.

**Gemini key** (only for `--backend gemini`), on cmd.exe:
```cmd
copy asset_forge\.env.example asset_forge\.env
notepad asset_forge\.env
```
Set `GEMINI_API_KEY=...` and save. `.env` is gitignored.

## Add an asset = add a manifest row

Edit [`manifest.yaml`](manifest.yaml):

```yaml
- id: mf_dire_boar
  category: monster
  universe: medieval_fantasy
  zone: ashenvale
  subject: "a Dire Boar, a hulking tusked boar with a bristling mane"
  palette: "mossy greens, autumn browns, warm amber"
  reference: mf_ashwood_wolf   # reuse the zone anchor's render for style coherence
  # out: "portraits/foo/talk.png"   # optional: override the published path under public/
```

**Style references** keep a zone coherent: the **first** entry of a zone has no
`reference` (it becomes the anchor); later entries point at it, and the forge
feeds that anchor's `with_bg` back into the model as a reference image.
Portraits can use `out:` to land under `public/portraits/<role>/<emotion>.png`.

## Commands

Always `--dry-run` first (free — composes & prints prompts, no API call):

```bash
python asset_forge/forge.py --dry-run                 # compose & print prompts (free, no gen)
python asset_forge/forge.py --only malachar           # one asset — FREE (pollinations, no key)
python asset_forge/forge.py --zone thornmarsh         # one zone
python asset_forge/forge.py --force                   # regenerate existing
python asset_forge/forge.py --skip-bg-removal         # with_bg only
python asset_forge/forge.py --backend gemini --only malachar   # paid path (needs key + billing)
```

Idempotent: an entry is skipped when its **game-ready `no_bg`** already exists
(unless `--force`) — so you can add new zones/worlds to the manifest and run once;
it only makes what's missing and never clobbers existing art.

## Sync vs `--batch`

- **Sync (default)** — immediate, one request at a time. Use for a few assets or
  quick iteration.
- **`--batch`** — the Gemini **Batch API**: async, **~50% cheaper**, results
  within 24 h. Use for a big one-shot lot.

```bash
python asset_forge/forge.py --batch --dry-run   # prints the wave plan + JSONL, submits nothing
python asset_forge/forge.py --batch             # submit + poll + collect
```

Batch specifics:
- **Waves**: assets are grouped so a `reference` is always produced in an earlier
  wave than the asset that uses it.
- **Resumable**: job names are saved in `asset_forge/.batch_jobs.json`
  (gitignored). If a run is interrupted, re-running `--batch` **resumes polling**
  the in-flight job instead of resubmitting.
- Temp `wave_*.jsonl` files and `.batch_jobs.json` are gitignored.

## Model

Set in `forge.py`: `MODEL = "gemini-2.5-flash-image"`. Note it retires on Vertex
**2026-10-02** → successor `gemini-3.1-flash-image`; bump the one constant when
needed.

## Perimeter

`asset_forge/` only (+ reuse of `scripts/process_assets.py`). No game code
(`src/`, React, Zustand) is touched. Never commit `.env`.
