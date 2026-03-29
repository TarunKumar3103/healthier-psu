from __future__ import annotations
import hashlib
import json
import re
import secrets
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
USERS_FILE = DATA_DIR / "users.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"


def _load(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _save(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def name_from_email(email: str) -> str:
    local = email.split("@")[0]
    parts = re.split(r"[._\-+]", local)
    return " ".join(p.capitalize() for p in parts if p)


def _create_session(email: str) -> str:
    token = secrets.token_urlsafe(32)
    sessions = _load(SESSIONS_FILE)
    sessions[token] = {"email": email, "created_at": datetime.now().isoformat()}
    _save(SESSIONS_FILE, sessions)
    return token


def register(email: str, password: str):
    users = _load(USERS_FILE)
    key = email.lower().strip()
    if key in users:
        return None, "Email already registered."
    users[key] = _hash(password)
    _save(USERS_FILE, users)
    return _create_session(key), None


def login(email: str, password: str):
    users = _load(USERS_FILE)
    key = email.lower().strip()
    if key not in users or users[key] != _hash(password):
        return None, "Invalid email or password."
    return _create_session(key), None


def get_email_by_token(token: str):
    sessions = _load(SESSIONS_FILE)
    entry = sessions.get(token)
    return entry["email"] if entry else None


def revoke_token(token: str) -> None:
    sessions = _load(SESSIONS_FILE)
    sessions.pop(token, None)
    _save(SESSIONS_FILE, sessions)
