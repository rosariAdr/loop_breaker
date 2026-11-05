"""
Loop Breaker — Batch background remover + resizer
==================================================
Usage :
    python process_assets.py                          # mode interactif
    python process_assets.py -i input/ -o output/     # dossiers explicites
    python process_assets.py -i input/ -o output/ -s 512   # taille cible

Dépendances :
    pip install rembg pillow onnxruntime
"""

import argparse
import sys
from pathlib import Path

# ── Tailles cibles par défaut selon le dossier source ──────────────────────
DEFAULT_SIZES = {
    "monsters":  512,
    "buildings": 1024,
    "deities":   1024,
    "deco":      512,
    "portraits": 128,
}
FALLBACK_SIZE = 512

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def get_default_size(input_dir: Path) -> int:
    """Devine la taille cible à partir du nom du dossier parent."""
    for part in input_dir.parts:
        if part.lower() in DEFAULT_SIZES:
            return DEFAULT_SIZES[part.lower()]
    return FALLBACK_SIZE


def process_image(src: Path, dst: Path, size: int, session) -> bool:
    """Détourage + redimensionnement d'une image. Retourne True si succès."""
    from PIL import Image
    import rembg

    try:
        with Image.open(src) as img:
            img_rgba = img.convert("RGBA")

            # ── Suppression du fond ────────────────────────────────────────
            result = rembg.remove(img_rgba, session=session)

            # ── Redimensionnement en gardant le ratio, canvas carré ────────
            result.thumbnail((size, size), Image.LANCZOS)
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            offset = (
                (size - result.width)  // 2,
                (size - result.height) // 2,
            )
            canvas.paste(result, offset, result)

            dst.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(dst, format="PNG", optimize=True)
        return True

    except Exception as e:
        print(f"  ✗ Erreur sur {src.name} : {e}")
        return False


def run(input_dir: Path, output_dir: Path, size: int, overwrite: bool) -> None:
    try:
        import rembg
        from PIL import Image  # noqa: F401
    except ImportError:
        print("❌  Dépendances manquantes. Lance :")
        print("       pip install rembg pillow onnxruntime")
        sys.exit(1)

    images = [f for f in input_dir.rglob("*") if f.suffix.lower() in SUPPORTED_EXTS]

    if not images:
        print(f"⚠️  Aucune image trouvée dans : {input_dir}")
        sys.exit(0)

    print(f"\n📂  Source  : {input_dir}")
    print(f"📂  Sortie  : {output_dir}")
    print(f"📐  Taille  : {size}×{size} px")
    print(f"🖼️  Images  : {len(images)} fichier(s) trouvé(s)")
    print(f"🔄  Écraser : {'oui' if overwrite else 'non (skip si déjà existant)'}")
    print()

    # ── Chargement du modèle rembg une seule fois ──────────────────────────
    print("⏳  Chargement du modèle rembg (1ʳᵉ fois = téléchargement ~100 Mo)…")
    session = rembg.new_session("u2net")
    print("✅  Modèle prêt.\n")

    ok = skipped = failed = 0

    for src in sorted(images):
        # Reconstruit le chemin relatif dans output_dir
        rel = src.relative_to(input_dir)
        dst = (output_dir / rel).with_suffix(".png")

        if dst.exists() and not overwrite:
            print(f"  ⏭  {src.name} — déjà traité, ignoré")
            skipped += 1
            continue

        print(f"  ⚙️  {src.name} → {dst.name}", end="  ", flush=True)
        success = process_image(src, dst, size, session)
        if success:
            print("✓")
            ok += 1
        else:
            failed += 1

    print(f"\n{'─'*48}")
    print(f"  ✅ Traités   : {ok}")
    print(f"  ⏭  Ignorés   : {skipped}")
    print(f"  ❌ Échoués   : {failed}")
    print(f"{'─'*48}")
    print(f"  Résultat dans : {output_dir}\n")


def interactive_mode() -> tuple[Path, Path, int, bool]:
    print("\n🎮  Loop Breaker — Batch asset processor")
    print("────────────────────────────────────────")

    input_str  = input("📂  Dossier source  [ex: public/monsters/raw]  : ").strip()
    input_dir  = Path(input_str)
    if not input_dir.exists():
        print(f"❌  Dossier introuvable : {input_dir}")
        sys.exit(1)

    default_size = get_default_size(input_dir)
    output_str = input(f"📂  Dossier sortie  [ex: public/monsters]       : ").strip()
    output_dir = Path(output_str)

    size_str = input(f"📐  Taille cible px [{default_size}]                  : ").strip()
    size = int(size_str) if size_str.isdigit() else default_size

    overwrite_str = input("🔄  Écraser les fichiers existants ? [o/N]      : ").strip().lower()
    overwrite = overwrite_str in ("o", "oui", "y", "yes")

    return input_dir, output_dir, size, overwrite


def main():
    parser = argparse.ArgumentParser(
        description="Détourage + redimensionnement batch des assets Loop Breaker."
    )
    parser.add_argument("-i", "--input",  type=Path, help="Dossier source")
    parser.add_argument("-o", "--output", type=Path, help="Dossier de sortie")
    parser.add_argument("-s", "--size",   type=int,  help="Taille cible en px (carré)")
    parser.add_argument("--overwrite", action="store_true", help="Écraser les fichiers existants")
    args = parser.parse_args()

    # Mode interactif si pas d'arguments
    if not args.input and not args.output:
        input_dir, output_dir, size, overwrite = interactive_mode()
    else:
        if not args.input or not args.output:
            parser.error("--input et --output sont requis ensemble.")
        input_dir  = args.input
        output_dir = args.output
        size       = args.size or get_default_size(input_dir)
        overwrite  = args.overwrite

        if not input_dir.exists():
            print(f"❌  Dossier introuvable : {input_dir}")
            sys.exit(1)

    run(input_dir, output_dir, size, overwrite)


if __name__ == "__main__":
    main()
