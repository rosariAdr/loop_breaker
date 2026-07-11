---
name: asset-forge
description: "Build (or extend) the Asset Forge — an industrial, prompt-driven asset-generation system for Loop Breaker where prompts are reusable parameterized DATA. Stores prompts in a manifest, regenerates images on-style, in bulk, idempotently, via Gemini (Nano Banana) with with_bg+no_bg double storage and a synchronous + Batch-API runner. Use when the user says 'asset forge', 'build the asset pipeline', 'set up asset generation', 'generate assets from a manifest', or wants prompt-as-data art generation. Perimeter is asset_forge/ only — never touches game code."
argument-hint: "[ (no arg = build the forge) | inspect-only ]"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, AskUserQuestion
---

# Asset Forge — prompt-driven asset generation

Build a system where **the prompt is reusable parameterized DATA**. We don't
store frozen images; we store prompts in a `manifest.yaml`, and a runner
regenerates them on-style, in bulk, idempotently. Two versions of every asset are
kept side by side: the raw Gemini output (`with_bg`, the source of truth) and a
derived transparent+resized version (`no_bg`).

**Stack context**: idle RPG "Loop Breaker", React 19 + Vite + Zustand + Tailwind.
**Hard perimeter**: everything lives in `asset_forge/` (+ reuse of
`scripts/process_assets.py`). **Never** modify `src/`, React, or the Zustand store.

> **STATUS — BUILT (2026, adapted).** The forge already exists under `asset_forge/`
> (style.py · templates/*.j2 · manifest.yaml · forge.py · forge_batch.py · README).
> It was **adapted to how this game actually ships**: outputs go into `public/`
> (Vite-served, committed → shipped by Vercel), NOT a separate `assets/` dir.
> Use this skill to **extend/regenerate** (add manifest rows, run `--dry-run`),
> or to rebuild. The authoritative paths are below.
>
> **Backends**: default **`pollinations`** (free, keyless); **`hf`** (free, needs
> `HF_TOKEN` — Hugging Face FLUX); **`gemini`** (paid, style-references, billing).
> Per-asset `model`/`width`/`height`/`size`/`seed`/`extra` overrides live in the
> manifest (e.g. bosses at `size:1024`, `width/height:1536`, beefy `extra:` prompt).

---

## PHASE 0 — Inspect the existing setup FIRST (gate — wait for approval)

Do this before writing anything.

1. **Read `process_assets.py`** at the repo root. Summarize its exact logic:
   rembg background removal, resize, and the per-folder size detection
   (monsters→512, buildings/deities→1024, portraits→128). The forge must
   **reuse** this logic (import/call its functions), **not duplicate** it. If it
   is not cleanly importable (e.g. logic trapped in `__main__`), plan a
   **minimal, non-destructive refactor** into reusable functions that preserves
   its current CLI behaviour. Also check `scripts/process_assets.py` if the root
   copy is absent (`Glob **/process_assets.py`).
2. **Confirm the deploy reality** (already established): in this repo `public/`
   is **committed** (DEPLOY01) and Vite serves it at site root, so committed
   `public/` assets **do** ship via GitHub → Vercel. Only `public/*/raw/` (HD
   sources) is gitignored. → The forge publishes game-ready assets **into
   `public/<folder>/`** (committed) and keeps raw sources in
   `public/<folder>/raw/` (gitignored). Anything outside `public/`, or
   uncommitted, will NOT appear on the deployed game.

**Then STOP and present the `process_assets.py` summary + the `public/` finding,
and wait for the user's validation before generating any files.**
(If invoked with `inspect-only`, stop here permanently.)

---

## PHASE 1 — Scaffold (after approval)

Create this tree (use `pathlib`; the user is on Windows; create output dirs at
runtime, not now):

```
asset_forge/
├── style.py            # locked "style bible" as constants
├── templates/
│   ├── monster.j2
│   ├── building.j2
│   ├── deity.j2
│   └── portrait.j2
├── manifest.yaml       # the asset catalog (heart of the system)
├── forge.py            # sync runner: generate + post-process
├── forge_batch.py      # Batch-API variant (async, −50%)
├── requirements.txt
├── .env.example
└── README.md
# .batch_jobs.json      # runtime batch-job state (gitignored)

public/                 # runtime outputs — where the GAME loads assets from
├── <folder>/raw/<id>.png     # with_bg RAW, background intact — SOURCE OF TRUTH (gitignored)
└── <folder>/<id>.png         # no_bg: bg removed (rembg) + resized per category (committed → ships)
```
`<folder>` by category: monster→`monsters`, building→`buildings`, deity→`deities`,
portrait→`portraits`, deco→`deco`. An optional per-entry `out:` overrides the
published path under `public/` (e.g. `portraits/<role>/<emotion>.png`).

---

## ⚠️ CRITICAL — with_bg / no_bg double storage

- Every asset exists in **two** versions:
  - `public/<folder>/raw/<id>.png` — exactly what Gemini returns, background included (gitignored).
  - `public/<folder>/<id>.png` — transparent (rembg) + resized by category
    (monster→512, building/deity→1024, portrait→128, deco→512) (committed).
- **`with_bg` is NEVER overwritten or deleted by post-processing** — it is the
  source. `no_bg` is always regenerable from it.
- If rembg fails or is missing: log a clear warning, **keep `with_bg`**, and
  continue (the user can reprocess later / via an erase.bg fallback).

---

## PHASE 2 — Files to create

### `style.py`
Encode the validated style as `STYLE_BIBLE` (a constant reused by all templates):
> painterly illustration "Studio-Ghibli × JRPG bestiary (collectible card)", a
> single creature centered full-frame in 3/4 view, a circular themed ground patch
> under the subject, swirling environment elements, faint floating glowing runes,
> a blurred themed background, a warm soft rim-light on the silhouette, a neutral
> background that eases cut-out, no text, no border, no UI.

Also add: `SIZES = {"monster": 512, "building": 1024, "deity": 1024, "portrait": 128}`.

### `templates/*.j2` (Jinja2)
One template per category. Each renders `{{ style_bible }}` + `subject`,
`universe`, `zone`, `palette` (from the manifest row). Include a conditional
block:
```jinja
{% if has_reference %}Match EXACTLY the art style, brushwork, lighting and card framing of the reference image provided.{% endif %}
```
Adapt framing per category (portrait = bust; building/deity = isolated structure/
deity; monster = full creature on themed base).

### `manifest.yaml`
List of assets. Per-entry schema:
`id`, `category` (monster|building|deity|portrait), `universe`, `zone`, `subject`,
`palette`, `reference` (optional: the `id` of another asset whose `with_bg` render
is reused as a style reference for zone coherence).
Seed with **2–3 example entries per universe** (medieval_fantasy, wushu,
tower_conquest, post_apocalyptic) to show the pattern — do **not** invent the
user's whole bestiary. **The first entry of a zone has no `reference`** (it
becomes the reference); later entries in that zone point to it.

### `forge.py` — the runner
Use the unified **`google-genai`** SDK (NOT the old `google.generativeai`). Isolate
the model in a top constant so it can be bumped (2.5 is retired on Vertex
2026-10-02 → successor `gemini-3.1-flash-image`). Read the key from
`GEMINI_API_KEY` via `python-dotenv`. Call pattern, with an optional reference
image passed in `contents`:

```python
from google import genai
from google.genai.types import GenerateContentConfig, Modality
from PIL import Image
from io import BytesIO

MODEL = "gemini-2.5-flash-image"
client = genai.Client()
contents = [prompt]                      # + optionally a PIL.Image reference
if ref_image is not None:
    contents.append(ref_image)
resp = client.models.generate_content(
    model=MODEL, contents=contents,
    config=GenerateContentConfig(response_modalities=[Modality.TEXT, Modality.IMAGE]),
)
for part in resp.candidates[0].content.parts:
    if part.inline_data:
        Image.open(BytesIO(part.inline_data.data)).save(with_bg_path)
```

Runner behaviour:
- Load `manifest.yaml`, iterate entries.
- **Idempotent**: skip an entry if BOTH `with_bg` and `no_bg` exist, unless `--force`.
- **Zone reference**: keep an in-memory `id -> with_bg path` map of produced
  assets; if an entry has `reference: <id>`, load that `with_bg` as the reference
  image for generation.
- Generate → save to `public/<folder>/raw/<id>.png` (with_bg).
- Post-process → reuse the rembg+resize logic from `scripts/process_assets.py`
  (`process_image`, size by `category`) → save to `public/<folder>/<id>.png` (no_bg,
  or the entry's `out:` override). **Never touch the raw with_bg.**
- **Retry**: exponential backoff on 429 / 503 (3 attempts).
- **CLI (argparse)**:
  - `--dry-run`: compose & print prompts WITHOUT calling the API (free template validation).
  - `--only <id>` and `--zone <zone>`: filters.
  - `--force`: regenerate even if outputs exist.
  - `--skip-bg-removal`: generate only the `with_bg`.
  - `--batch`: delegate to `forge_batch.py` (async −50%). Sync stays the default;
    `--batch` is explicit.
- Readable logs (running / ok / fail) + a final recap (generated / skipped / failed).

### `requirements.txt`
`google-genai`, `pillow`, `pyyaml`, `jinja2`, `python-dotenv`, `rembg`
(+ `onnxruntime` if required by rembg).

### `.env.example`
`GEMINI_API_KEY=` (+ note: copy to `.env`). Add `.env` to `.gitignore`.

### `forge_batch.py` — Batch-API variant (async, −50%, 24 h SLO)
Selected via `--batch` on `forge.py`, which delegates here. The Gemini Batch API
is a SEPARATE endpoint (independent of `generate_content`), billed 50% less, with
results within 24 h — ideal for a big one-shot lot without client-side queues/
retries. Works with `gemini-2.5-flash-image` (Nano Banana).

**Before writing this file, re-verify the mechanics against the current docs**
(WebFetch `https://ai.google.dev/gemini-api/docs/batch-api` — the API evolves).

Mechanics (google-genai SDK):
1. **Group into WAVES** — required because of zone references: an asset with
   `reference: <id>` can only go once `<id>`'s `with_bg` exists.
   - wave 0 = assets with no `reference` (or whose ref is already on disk)
   - wave N = assets whose reference was produced in a wave < N
   Process waves IN ORDER. Never put an asset and its reference in the same wave.
2. **Upload references** — for each reference needed by a wave, upload the
   `with_bg` image via the File API ONCE, get its URI, and reference it in the
   JSONL via a `file_data` part (fileUri + mimeType). Ref-less assets carry only a
   `text` part.
3. **Build the JSONL** — one line per asset:
   ```json
   {"key": "<id>", "request": {"contents": ["...parts..."], "generation_config": {"responseModalities": ["TEXT","IMAGE"]}}}
   ```
   ⚠️ **GOTCHA**: in the JSONL file it's `generation_config` / `responseModalities`
   (camelCase); inline it would be `config` / `response_modalities`. `key` = the
   asset id — that's what ties each result back to the right output file.
4. **Submit**:
   ```python
   uploaded = client.files.upload(file=jsonl_path, config=types.UploadFileConfig(mime_type="jsonl"))
   job = client.batches.create(
       model=MODEL,                       # gemini-2.5-flash-image
       src=uploaded.name,
       config=types.CreateBatchJobConfig(display_name=f"loop_breaker_wave_{n}"),
   )
   ```
5. **Poll** — loop `client.batches.get(name=job.name)` until a terminal state
   (JOB_STATE_SUCCEEDED / JOB_STATE_FAILED / JOB_STATE_CANCELLED), `time.sleep`
   30–60 s. Persist `job.name` in `asset_forge/.batch_jobs.json` so polling can
   RESUME after a disconnect without resubmitting.
6. **Retrieve & save** — on success, download the output JSONL
   (`client.files.download(file=job.dest.file_name)`), for each line find the asset
   by its `key`, extract the image part (`inline_data`), save to
   `with_bg/<zone>/<id>.png`, then post-process rembg+resize → `no_bg/<zone>/<id>.png`.
   A line in error is logged and skipped without crashing the wave.
7. **Idempotence** — like sync mode: only include in the JSONL assets whose
   `with_bg` OR `no_bg` is missing (unless `--force`).

Batch constraints:
- A `--batch` run must be **RESUMABLE**: if a job is still running in
  `.batch_jobs.json`, resume its polling instead of recreating one.
- `--batch --dry-run` builds & prints the wave plan + the JSONL WITHOUT submitting.
- Add `.batch_jobs.json` and temporary `*.jsonl` to `.gitignore`.

### `README.md`
Install, key config, how to add an asset (= add a manifest row), the commands
(`--dry-run` first!), when to use `--batch` vs sync, the with_bg/no_bg double-
storage explanation, and the note on the `public/` gitignore gotcha at Vercel
deploy (from Phase 0).

---

## CONSTRAINTS
- Modify NO game code (`src/`, React, Zustand). Perimeter = `asset_forge/` + a
  minimal non-destructive `process_assets.py` refactor if needed.
- Never commit an API key. `.env` gitignored.
- Paths via `pathlib` (Windows). Create output dirs on the fly.
- Typed Python, short functions, sober comments.
- Do not commit (this project: Claude propose, le dev commite — CONTRIBUTING §2).

## DONE CRITERIA (verify & show)
1. `python asset_forge/forge.py --dry-run` prints complete, coherent prompts for
   the seed entries of all 4 universes, without calling the API.
2. A real single-entry run (`--only <id>`) produces both a `with_bg` AND a `no_bg`.
3. Re-running without `--force` skips everything (idempotence).
4. `python asset_forge/forge.py --batch --dry-run` prints the wave plan + JSONL
   without submitting. A real `--batch` on 2–3 entries produces with_bg + no_bg
   after job completion, and a re-run resumes a running job instead of recreating one.
5. Show the final tree + the reused `process_assets.py` summary.

## CLOSING
Start at **Phase 0** and wait for the user's validation before generating files.
After the build, run the applicable done-criteria checks (`--dry-run` costs
nothing; a real 1-entry generation needs `GEMINI_API_KEY`) and report results.
Note: `.claude/` is gitignored here, so this skill (and any local reports) stay
local unless the user tracks them.
