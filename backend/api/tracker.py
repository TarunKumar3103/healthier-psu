from __future__ import annotations
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import List

DATA_DIR = Path(__file__).parent / "data"


def _tracker_path(email: str) -> Path:
    safe = email.replace("@", "_at_").replace(".", "_").replace("+", "_plus_")
    return DATA_DIR / f"tracker_{safe}.json"


def _load(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"entries": []}


def _save(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def add_entry(
    email: str,
    plan_label: str,
    calories: int,
    protein_g: int,
    goal_type: str,
    meals: dict | None = None,
) -> str:
    path = _tracker_path(email)
    data = _load(path)
    entries = data.get("entries", [])
    entry_id = datetime.now().isoformat()
    entry: dict = {
        "id": entry_id,
        "date": date.today().isoformat(),
        "plan_label": plan_label,
        "calories": calories,
        "protein_g": protein_g,
        "goal_type": goal_type,
    }
    if meals:
        entry["meals"] = meals
    entries.append(entry)
    data["entries"] = entries
    _save(path, data)
    return entry_id


def remove_entry(email: str, entry_id: str) -> bool:
    path = _tracker_path(email)
    data = _load(path)
    entries = data.get("entries", [])
    new_entries = [e for e in entries if e.get("id") != entry_id]
    if len(new_entries) == len(entries):
        return False
    data["entries"] = new_entries
    _save(path, data)
    return True


def get_week_entries(email: str) -> List[dict]:
    path = _tracker_path(email)
    data = _load(path)
    entries = data.get("entries", [])
    today = date.today()
    week_start = today - timedelta(days=6)
    result = []
    for e in entries:
        try:
            d = date.fromisoformat(e.get("date", ""))
            if week_start <= d <= today:
                result.append(e)
        except (ValueError, TypeError):
            pass
    return sorted(result, key=lambda x: x.get("date", ""), reverse=True)
