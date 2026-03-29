from __future__ import annotations
import json
from datetime import date, datetime
from pathlib import Path
from typing import Any, List, Optional, Tuple

DATA_DIR = Path(__file__).parent / "data"
CACHE_PATH = DATA_DIR / "cache.json"
SAMPLE_CACHE_PATH = DATA_DIR / "sample_cache.json"
NUTRITION_CACHE_PATH = DATA_DIR / "nutrition_cache.json"
RAW_DEBUG_DIR = DATA_DIR / "raw_debug"


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def load_json(path: Path) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def _cache_path_for(location_id: Optional[str]) -> Path:
    if location_id and location_id != "0":
        return DATA_DIR / f"cache_{location_id}.json"
    return CACHE_PATH


def is_cache_stale(meta: dict) -> bool:
    last = meta.get("last_refreshed")
    if not last or last == "never":
        return True
    try:
        cached_date = datetime.fromisoformat(last).date()
        return cached_date < date.today()
    except (ValueError, TypeError):
        return True


def load_items_with_meta(location_id: Optional[str] = None) -> Tuple[dict, list]:
    paths = [
        _cache_path_for(location_id),
        CACHE_PATH,
        SAMPLE_CACHE_PATH,
    ]
    for p in paths:
        if p.exists():
            try:
                data = load_json(p)
                meta = data.get("meta", {})
                items = data.get("items", [])
                return meta, items
            except Exception:
                continue
    return {"source": "sample", "last_refreshed": "never"}, []


def save_items(items: list, source: str, location_id: Optional[str] = None) -> None:
    path = _cache_path_for(location_id)
    obj = {
        "meta": {
            "source": source,
            "last_refreshed": now_iso(),
            "location_id": location_id or "0",
        },
        "items": items,
    }
    save_json(path, obj)


def load_nutrition_cache() -> dict:
    if NUTRITION_CACHE_PATH.exists():
        try:
            return load_json(NUTRITION_CACHE_PATH)
        except Exception:
            pass
    return {}


def save_nutrition_cache(ncache: dict) -> None:
    save_json(NUTRITION_CACHE_PATH, ncache)


def save_raw_debug(filename: str, content: str) -> None:
    RAW_DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    dest = RAW_DEBUG_DIR / filename
    dest.write_text(content, encoding="utf-8")
