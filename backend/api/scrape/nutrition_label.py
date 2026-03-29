from __future__ import annotations
import re
from typing import Dict, List, Optional
from urllib.parse import parse_qs, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE = "https://www.absecom.psu.edu/menus/"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) PSU-Macro-Planner/1.0"}


def parse_mid_from_url(url: str) -> Optional[str]:
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    mids = qs.get("mid", [])
    return mids[0] if mids else None


def nutrition_url_from_mid(mid: str) -> str:
    return urljoin(BASE, f"user-pages/nutrition-label.cfm?mid={mid}")


def fetch_nutrition_html(mid: str, timeout: int = 25) -> str:
    url = nutrition_url_from_mid(mid)
    resp = requests.get(url, headers=HEADERS, timeout=timeout)
    resp.raise_for_status()
    return resp.text


def _find_number_after_label(text: str, label: str) -> Optional[float]:
    idx = text.find(label)
    if idx == -1:
        return None
    snippet = text[idx + len(label): idx + len(label) + 300]
    m = re.search(r"(\d+(?:\.\d+)?)", snippet)
    if m:
        return float(m.group(1))
    return None


def parse_nutrition(html: str) -> Dict:
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(separator=" ")
    calories_val = _find_number_after_label(text, "Calories")
    protein_val = _find_number_after_label(text, "Protein")
    calories = int(calories_val) if calories_val is not None else None
    protein_g = int(protein_val) if protein_val is not None else None
    allergens: List[str] = []
    for marker in ("Contains", "Allergens", "CONTAINS"):
        idx = text.find(marker)
        if idx != -1:
            after = text[idx:]
            colon_idx = after.find(":")
            if colon_idx != -1:
                allergen_str = after[colon_idx + 1: colon_idx + 300]
                tokens = re.split(r"[,;/]", allergen_str)
                for tok in tokens:
                    tok = tok.strip()
                    if 1 <= len(tok) <= 25:
                        allergens.append(tok.lower())
                break
    allergens = sorted(set(allergens))
    return {"calories": calories, "protein_g": protein_g, "allergens": allergens}
