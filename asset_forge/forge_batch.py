"""Asset Forge — Batch API variant (async, ~50% cheaper, 24 h SLO).

Delegated to by `forge.py --batch`. The Gemini Batch API is a separate endpoint
from generate_content: you upload a JSONL of requests, create a job, poll it, and
download a JSONL of results within 24 h. Verified against
https://ai.google.dev/gemini-api/docs/batch-api (re-check before large runs).

Key subtleties handled here:
- WAVES: an asset with `reference: <id>` can only be submitted once <id>'s
  with_bg exists. Wave 0 = ref-less (or ref already on disk); wave N = refs
  produced in a wave < N. Never put an asset and its reference in the same wave.
- JSONL GOTCHA: in the file it's `generation_config` / `responseModalities`
  (camelCase). `key` = the asset id, used to route each result to its file.
- RESUMABLE: job names are persisted in .batch_jobs.json so an interrupted run
  resumes polling instead of resubmitting.
"""

from __future__ import annotations

import argparse
import base64
import json
import time
from pathlib import Path
from typing import Any, Optional

from forge import (
    MODEL,
    REPO_ROOT,
    _rembg_session,
    filter_entries,
    is_complete,
    load_manifest,
    out_path,
    post_process,
    raw_path,
    render_prompt,
)

STATE_FILE = Path(__file__).resolve().parent / ".batch_jobs.json"
TERMINAL = {
    "JOB_STATE_SUCCEEDED",
    "JOB_STATE_FAILED",
    "JOB_STATE_CANCELLED",
    "JOB_STATE_EXPIRED",
}
POLL_SECONDS = 45


# ── wave planning ────────────────────────────────────────────────────────────
def build_waves(pending: list[dict], all_entries: list[dict]) -> list[list[dict]]:
    """Topological grouping by reference dependency + on-disk availability."""
    done = {e["id"] for e in all_entries if raw_path(e).exists()}
    remaining = list(pending)
    waves: list[list[dict]] = []
    while remaining:
        wave = [e for e in remaining if not e.get("reference") or e["reference"] in done]
        if not wave:
            unmet = {e["id"]: e.get("reference") for e in remaining}
            raise ValueError(f"unsatisfiable references (cycle or missing ref): {unmet}")
        waves.append(wave)
        done.update(e["id"] for e in wave)
        remaining = [e for e in remaining if e not in wave]
    return waves


# ── JSONL construction ───────────────────────────────────────────────────────
def _jsonl_line(entry: dict, ref_uri: Optional[str]) -> dict:
    parts: list[dict] = [{"text": render_prompt(entry)}]
    if entry.get("reference"):
        parts.append(
            {"file_data": {"file_uri": ref_uri or f"<upload:{entry['reference']}>",
                           "mime_type": "image/png"}}
        )
    return {
        "key": entry["id"],
        "request": {
            "contents": [{"parts": parts}],
            "generation_config": {"responseModalities": ["TEXT", "IMAGE"]},
        },
    }


def _upload_reference(client: Any, types: Any, by_id: dict, ref_id: str, cache: dict) -> str:
    if ref_id in cache:
        return cache[ref_id]
    ref_raw = raw_path(by_id[ref_id])
    if not ref_raw.exists():
        raise FileNotFoundError(f"reference {ref_id!r} with_bg missing: {ref_raw}")
    up = client.files.upload(file=str(ref_raw), config=types.UploadFileConfig(mime_type="image/png"))
    cache[ref_id] = up.uri
    return up.uri


def write_wave_jsonl(
    client: Any, types: Any, n: int, wave: list[dict], by_id: dict, dry_run: bool
) -> Path:
    ref_cache: dict[str, str] = {}
    lines: list[str] = []
    for entry in wave:
        ref_uri = None
        if entry.get("reference"):
            ref_uri = (
                None if dry_run else _upload_reference(client, types, by_id, entry["reference"], ref_cache)
            )
        lines.append(json.dumps(_jsonl_line(entry, ref_uri), ensure_ascii=False))
    path = Path(__file__).resolve().parent / f"wave_{n}.jsonl"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


# ── job state persistence (resumability) ─────────────────────────────────────
def _load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {}


def _save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _poll(client: Any, job_name: str) -> Any:
    while True:
        job = client.batches.get(name=job_name)
        st = job.state.name
        print(f"    · {job_name}: {st}")
        if st in TERMINAL:
            return job
        time.sleep(POLL_SECONDS)


def _collect(client: Any, job: Any, by_id: dict, args: argparse.Namespace, session: Any) -> None:
    content = client.files.download(file=job.dest.file_name)
    if isinstance(content, (bytes, bytearray)):
        content = content.decode("utf-8")
    for line in content.splitlines():
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
            key = obj.get("key")
            resp = obj.get("response")
            if not resp:
                print(f"    ✗ {key}: {obj.get('error') or 'no response'}")
                continue
            parts = resp["candidates"][0]["content"]["parts"]
            data = next(
                (p.get("inlineData") or p.get("inline_data") for p in parts
                 if p.get("inlineData") or p.get("inline_data")),
                None,
            )
            if not data or not data.get("data"):
                print(f"    ✗ {key}: no image part")
                continue
            entry = by_id[key]
            dst = raw_path(entry)
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(base64.b64decode(data["data"]))
            print(f"    ✓ {key} -> {dst.relative_to(REPO_ROOT)}")
            if not args.skip_bg_removal:
                post_process(entry, session)
        except Exception as exc:  # noqa: BLE001 — a bad line must not kill the wave
            print(f"    ✗ line skipped: {exc}")


# ── driver ───────────────────────────────────────────────────────────────────
def run_batch(args: argparse.Namespace) -> int:
    all_entries = load_manifest(args.manifest)
    by_id = {e["id"]: e for e in all_entries}
    entries = filter_entries(all_entries, args.only, args.zone)
    pending = [e for e in entries if args.force or not is_complete(e, args.skip_bg_removal)]

    if not pending:
        print("Nothing to do — all outputs present (use --force to regenerate).")
        return 0

    waves = build_waves(pending, all_entries)
    print(f"Batch plan: {len(pending)} asset(s) in {len(waves)} wave(s).")
    for n, wave in enumerate(waves):
        print(f"  wave {n}: {[e['id'] for e in wave]}")

    if args.dry_run:
        # No SDK import here — dry-run must work with only pyyaml + jinja2.
        for n, wave in enumerate(waves):
            path = write_wave_jsonl(client=None, types=None, n=n, wave=wave, by_id=by_id, dry_run=True)
            print(f"\n--- {path.name} (not submitted) ---")
            print(path.read_text(encoding="utf-8").rstrip())
        print("\nDry-run: no upload, no job submitted.")
        return 0

    from google import genai
    from google.genai import types

    client = genai.Client()
    state = _load_state()
    session: Any = None if args.skip_bg_removal else _rembg_session()

    for n, wave in enumerate(waves):
        name = f"loop_breaker_wave_{n}"
        rec = state.get(name, {})
        if rec.get("status") == "collected":
            print(f"wave {n} ({name}): already collected — skipping")
            continue

        if rec.get("job_name"):
            print(f"wave {n}: resuming job {rec['job_name']}")
            job = _poll(client, rec["job_name"])
        else:
            print(f"wave {n}: submitting {len(wave)} request(s)…")
            jsonl = write_wave_jsonl(client, types, n, wave, by_id, dry_run=False)
            uploaded = client.files.upload(
                file=str(jsonl), config=types.UploadFileConfig(mime_type="jsonl")
            )
            job = client.batches.create(
                model=MODEL, src=uploaded.name,
                config=types.CreateBatchJobConfig(display_name=name),
            )
            state[name] = {"job_name": job.name, "status": "running"}
            _save_state(state)
            job = _poll(client, job.name)

        if job.state.name != "JOB_STATE_SUCCEEDED":
            print(f"wave {n}: job ended {job.state.name} — stopping (re-run to retry).")
            state[name] = {"job_name": job.name, "status": "failed"}
            _save_state(state)
            return 1

        _collect(client, job, by_id, args, session)
        state[name] = {"job_name": job.name, "status": "collected"}
        _save_state(state)

    print("Batch complete.")
    return 0
