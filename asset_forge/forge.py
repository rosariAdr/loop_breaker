"""Asset Forge — synchronous runner.

Prompts are DATA (manifest.yaml). This runner composes each prompt from a Jinja
template + the style bible, generates the image via Gemini (google-genai), saves
the RAW result (with_bg, source of truth) under public/<folder>/raw/<id>.png,
then post-processes it (rembg + resize, reused from scripts/process_assets.py)
into the shipped game asset public/<folder>/<id>.png (no_bg).

Sync is the default. `--batch` delegates to forge_batch.py (async, -50%).

Design notes:
- google-genai and rembg are imported LAZILY so `--dry-run` runs with only
  pyyaml + jinja2 installed.
- with_bg is NEVER overwritten by post-processing; no_bg is regenerable from it.
- Paths adapt to how the game actually loads assets (from public/), so generated
  files are immediately usable and shipped via GitHub -> Vercel once committed.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from io import BytesIO
from pathlib import Path
from typing import Any, Optional

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from style import (  # noqa: E402  (local module, after sys.path tweak)
    CATEGORY_FOLDER,
    SIZES,
    STYLE_BIBLE,
    TEMPLATE_FILE,
)

# Model isolated so it can be bumped. gemini-2.5-flash-image ("Nano Banana") is
# retired on Vertex 2026-10-02 -> successor "gemini-3.1-flash-image".
MODEL = "gemini-2.5-flash-image"

REPO_ROOT = Path(__file__).resolve().parents[1]
PUBLIC = REPO_ROOT / "public"
SCRIPTS = REPO_ROOT / "scripts"
TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
DEFAULT_MANIFEST = Path(__file__).resolve().parent / "manifest.yaml"

_JINJA = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(disabled_extensions=("j2",), default=False),
    trim_blocks=True,
    lstrip_blocks=True,
)


# ── manifest & paths ─────────────────────────────────────────────────────────
def load_manifest(path: Path) -> list[dict[str, Any]]:
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    entries = data.get("assets", [])
    for e in entries:
        cat = e.get("category")
        if cat not in CATEGORY_FOLDER:
            raise ValueError(f"{e.get('id')}: unknown category {cat!r}")
    return entries


def folder_for(entry: dict) -> str:
    return CATEGORY_FOLDER[entry["category"]]


def raw_path(entry: dict) -> Path:
    """with_bg source of truth (gitignored via public/*/raw/)."""
    return PUBLIC / folder_for(entry) / "raw" / f"{entry['id']}.png"


def out_path(entry: dict) -> Path:
    """no_bg shipped game asset the running game loads from public/."""
    override = entry.get("out")
    if override:
        return PUBLIC / override
    return PUBLIC / folder_for(entry) / f"{entry['id']}.png"


def final_size(entry: dict) -> int:
    """Final square px of the game-ready no_bg — per-entry `size:` overrides the category default."""
    return int(entry.get("size", SIZES[entry["category"]]))


def is_complete(entry: dict, skip_bg: bool) -> bool:
    # "Done" = the game-ready asset exists. The raw with_bg is only a regeneration
    # source; if it's missing (e.g. committed art with no raw kept), the asset is
    # still treated as done — so bulk runs only make what's MISSING and never
    # clobber existing art. Use --force to deliberately regenerate.
    if skip_bg:
        return raw_path(entry).exists()
    return out_path(entry).exists()


# ── prompt composition ───────────────────────────────────────────────────────
def render_prompt(entry: dict, include_reference: bool = True) -> str:
    # `include_reference` is False for backends that can't take a reference image
    # (e.g. pollinations) — the style bible carries coherence instead.
    template = _JINJA.get_template(TEMPLATE_FILE[entry["category"]])
    rendered = template.render(
        style_bible=STYLE_BIBLE,
        subject=entry.get("subject", ""),
        universe=entry.get("universe", ""),
        zone=entry.get("zone", ""),
        palette=entry.get("palette", ""),
        has_reference=include_reference and bool(entry.get("reference")),
    ).strip()
    extra = str(entry.get("extra", "")).strip()  # per-entry scale/detail emphasis
    if extra:
        rendered += "\n" + extra
    return rendered


# ── generation + post-processing ─────────────────────────────────────────────
def _rembg_session() -> Optional[Any]:
    try:
        import rembg  # lazy: only needed for no_bg
    except ImportError:
        print("  ! rembg unavailable — will keep with_bg and skip background removal")
        return None
    return rembg.new_session("u2net")


def load_reference_image(ref_id: str, by_id: dict[str, dict]) -> Any:
    """Load a produced with_bg as a PIL reference image for style coherence."""
    ref_entry = by_id.get(ref_id)
    if ref_entry is None:
        raise ValueError(f"reference id {ref_id!r} not found in manifest")
    ref_raw = raw_path(ref_entry)
    if not ref_raw.exists():
        raise FileNotFoundError(
            f"reference {ref_id!r} has no with_bg yet ({ref_raw}); generate it first"
        )
    from PIL import Image

    return Image.open(ref_raw).convert("RGBA")


_TRANSIENT = (
    "429", "500", "502", "503", "504", "RESOURCE_EXHAUSTED", "UNAVAILABLE",
    "timed out", "timeout", "Connection", "URLError", "reset",
)


def _with_retry(fn, *args, attempts: int = 3, **kwargs):
    delay = 2.0
    for i in range(attempts):
        try:
            return fn(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001 — inspect message for transient codes
            msg = str(exc)
            transient = any(t in msg for t in _TRANSIENT)
            if i == attempts - 1 or not transient:
                raise
            print(f"  ~ transient error ({msg[:60]}…) — retry in {delay:.0f}s")
            time.sleep(delay)
            delay *= 2


# Raw generation size for the keyless backend; rembg then resizes to the category size.
GEN_SIZE = 1024


def generate_pollinations(
    prompt: str, dst: Path, *, width: int, height: int, model: str, seed: Optional[int]
) -> bool:
    """Free, keyless text-to-image via pollinations.ai. No reference image."""
    import urllib.parse
    import urllib.request

    q: dict[str, Any] = {"width": width, "height": height, "nologo": "true", "model": model}
    if seed is not None:
        q["seed"] = seed
    url = (
        "https://image.pollinations.ai/prompt/"
        + urllib.parse.quote(prompt, safe="")
        + "?"
        + urllib.parse.urlencode(q)
    )
    req = urllib.request.Request(url, headers={"User-Agent": "loop-breaker-asset-forge"})
    with urllib.request.urlopen(req, timeout=240) as resp:  # noqa: S310 — fixed https host
        data = resp.read()
    if not data or len(data) < 2000:  # too small = an error page, not an image
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(data)
    return True


def generate_hf(
    prompt: str, dst: Path, *, model: str, token: str, width: int, height: int
) -> bool:
    """Free-tier text-to-image via the Hugging Face Inference API (e.g. FLUX.1-schnell).

    Needs HF_TOKEN. `x-wait-for-model` makes HF wait through a cold start instead
    of returning 503.
    """
    import json
    import urllib.request

    url = "https://api-inference.huggingface.co/models/" + model
    body = json.dumps(
        {"inputs": prompt, "parameters": {"width": width, "height": height}}
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "image/png",
            "x-wait-for-model": "true",
        },
    )
    with urllib.request.urlopen(req, timeout=300) as resp:  # noqa: S310 — fixed https host
        data = resp.read()
    if not data or len(data) < 2000:
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(data)
    return True


def generate_with_bg(client: Any, prompt: str, ref_image: Any, dst: Path) -> bool:
    from google.genai.types import GenerateContentConfig, Modality
    from PIL import Image

    contents: list[Any] = [prompt]
    if ref_image is not None:
        contents.append(ref_image)
    resp = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=GenerateContentConfig(response_modalities=[Modality.TEXT, Modality.IMAGE]),
    )
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None):
            dst.parent.mkdir(parents=True, exist_ok=True)
            Image.open(BytesIO(part.inline_data.data)).save(dst)
            return True
    return False


def post_process(entry: dict, session: Any) -> bool:
    """rembg + resize with_bg -> no_bg, reusing scripts/process_assets.py."""
    src, dst = raw_path(entry), out_path(entry)
    if session is None:
        print(f"  ! kept with_bg only for {entry['id']} (no rembg)")
        return False
    sys.path.insert(0, str(SCRIPTS))
    import process_assets  # reuse, never duplicate

    ok = process_assets.process_image(src, dst, final_size(entry), session)
    if not ok:
        print(f"  ! background removal failed for {entry['id']} — with_bg preserved")
    return bool(ok)


# ── run ──────────────────────────────────────────────────────────────────────
def filter_entries(entries: list[dict], only: Optional[str], zone: Optional[str]) -> list[dict]:
    out = entries
    if only:
        out = [e for e in out if e["id"] == only]
    if zone:
        out = [e for e in out if e.get("zone") == zone]
    return out


def run_sync(args: argparse.Namespace) -> int:
    all_entries = load_manifest(args.manifest)
    by_id = {e["id"]: e for e in all_entries}
    entries = filter_entries(all_entries, args.only, args.zone)

    generated = skipped = failed = 0
    client: Any = None
    session: Any = "unloaded"  # sentinel: load rembg lazily on first need

    for entry in entries:
        eid = entry["id"]
        if not args.force and is_complete(entry, args.skip_bg_removal):
            print(f"  ⏭  {eid} — already present, skipped")
            skipped += 1
            continue

        prompt = render_prompt(entry, include_reference=(args.backend == "gemini"))
        if args.dry_run:
            print(f"\n=== {eid}  [{entry['category']} · {entry.get('universe')} · {entry.get('zone')}] ===")
            print(f"→ with_bg: {raw_path(entry).relative_to(REPO_ROOT)}")
            print(f"→ no_bg  : {out_path(entry).relative_to(REPO_ROOT)}")
            if entry.get("reference"):
                print(f"→ style reference: {entry['reference']}")
            print(prompt)
            continue

        try:
            print(f"  ⚙  {eid} — generating ({args.backend})…", flush=True)
            w = int(entry.get("width", GEN_SIZE))
            h = int(entry.get("height", GEN_SIZE))
            if args.backend == "pollinations":
                ok = _with_retry(
                    generate_pollinations, prompt, raw_path(entry),
                    width=w, height=h, model=entry.get("model", "flux"), seed=entry.get("seed"),
                )
            elif args.backend == "hf":
                token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
                if not token:
                    raise RuntimeError("HF_TOKEN not set — put it in asset_forge/.env")
                ok = _with_retry(
                    generate_hf, prompt, raw_path(entry),
                    model=args.hf_model, token=token, width=w, height=h,
                )
            else:  # gemini
                if client is None:
                    from google import genai

                    client = genai.Client()
                ref_image = (
                    load_reference_image(entry["reference"], by_id)
                    if entry.get("reference")
                    else None
                )
                ok = _with_retry(generate_with_bg, client, prompt, ref_image, raw_path(entry))
            if not ok:
                print(f"  ✗ {eid} — no image returned")
                failed += 1
                continue
            if not args.skip_bg_removal:
                if session == "unloaded":
                    session = _rembg_session()
                post_process(entry, session)
            print(f"  ✓ {eid}")
            generated += 1
        except Exception as exc:  # noqa: BLE001 — report and continue the batch
            print(f"  ✗ {eid} — {exc}")
            failed += 1

    print("\n" + "─" * 52)
    verb = "would generate" if args.dry_run else "generated"
    print(f"  {verb}: {generated if not args.dry_run else len(entries) - skipped}   skipped: {skipped}   failed: {failed}")
    print("─" * 52)
    return 1 if failed else 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Asset Forge — prompt-driven asset generation.")
    p.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST, help="manifest.yaml path")
    p.add_argument(
        "--backend",
        choices=["pollinations", "hf", "gemini"],
        default=os.environ.get("FORGE_BACKEND", "pollinations"),
        help="image backend: pollinations (free, keyless — default) · hf (free, needs HF_TOKEN) · gemini (paid)",
    )
    p.add_argument(
        "--hf-model",
        default="black-forest-labs/FLUX.1-schnell",
        help="Hugging Face model repo id for --backend hf",
    )
    p.add_argument("--dry-run", action="store_true", help="compose & print prompts, no API call")
    p.add_argument("--only", metavar="ID", help="only this asset id")
    p.add_argument("--zone", metavar="ZONE", help="only assets in this zone")
    p.add_argument("--force", action="store_true", help="regenerate even if outputs exist")
    p.add_argument("--skip-bg-removal", action="store_true", help="generate with_bg only")
    p.add_argument("--batch", action="store_true", help="delegate to the Batch API (async, -50%%)")
    return p


def _load_env() -> None:
    """Load asset_forge/.env into os.environ so genai.Client() finds GEMINI_API_KEY.

    No-op if python-dotenv isn't installed or the file is absent (dry-run needs
    neither). The key can also be provided directly as an environment variable.
    """
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(Path(__file__).resolve().parent / ".env")


def main() -> int:
    args = build_parser().parse_args()
    if args.batch and args.backend != "gemini":
        print("Note: --batch is a Gemini-only feature; running sync with the free backend.")
        args.batch = False
    if not args.dry_run and args.backend in ("gemini", "hf"):
        _load_env()
    if args.batch:
        from forge_batch import run_batch  # lazy: only when explicitly requested

        return run_batch(args)
    return run_sync(args)


if __name__ == "__main__":
    raise SystemExit(main())
