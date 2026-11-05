"""Locked style bible + category config for the Asset Forge.

Single source of truth for the visual style fragment reused by every template,
and for the category -> (public folder, target size) mapping. Sizes mirror
scripts/process_assets.py DEFAULT_SIZES so the two stay consistent.
"""

from __future__ import annotations

# The validated house style, injected verbatim into every prompt template.
STYLE_BIBLE: str = (
    'Painterly illustration in the style of a "Studio-Ghibli x JRPG bestiary '
    'collectible card": a single subject centered full-frame in a 3/4 view, '
    "with a circular themed ground patch beneath it, swirling environment "
    "elements, faint floating glowing runes, a blurred themed background, and a "
    "warm soft rim-light tracing the silhouette. Keep a clean neutral background "
    "that eases cut-out. No text, no border, no UI, no watermark."
)

# Square export size (px) per category. Kept in sync with process_assets.py.
SIZES: dict[str, int] = {
    "monster": 512,
    "building": 1024,
    "deity": 1024,
    "portrait": 128,
    "deco": 512,
}

# category -> game folder under public/ (where the running game loads assets from)
# and the Jinja template used to compose the prompt.
CATEGORY_FOLDER: dict[str, str] = {
    "monster": "monsters",
    "building": "buildings",
    "deity": "deities",
    "portrait": "portraits",
    "deco": "deco",
}

TEMPLATE_FILE: dict[str, str] = {
    "monster": "monster.j2",
    "building": "building.j2",
    "deity": "deity.j2",
    "portrait": "portrait.j2",
    "deco": "building.j2",  # props reuse the isolated-structure framing
}

CATEGORIES = tuple(CATEGORY_FOLDER.keys())
