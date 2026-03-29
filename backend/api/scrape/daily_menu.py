from __future__ import annotations
import re
from datetime import date
from typing import Dict, List, Tuple
from urllib.parse import parse_qs, urlparse

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.absecom.psu.edu/menus/user-pages/daily-menu.cfm"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) PSU-Macro-Planner/1.0"}


def _today_str() -> str:
    today = date.today()
    return f"{today.month}/{today.day}/{str(today.year)[2:]}"


def fetch_daily_menu_html(date_str: str | None = None, campus_id: str = "0", timeout: int = 25) -> str:
    if date_str is None:
        date_str = _today_str()
    payload = {
        "selMenuDate": date_str,
        "selMeal": "",
        "selCampus": campus_id,
    }
    resp = requests.post(BASE_URL, data=payload, headers=HEADERS, timeout=timeout)
    resp.raise_for_status()
    return resp.text


def extract_nutrition_links(html: str) -> List[str]:
    soup = BeautifulSoup(html, "lxml")
    seen: set = set()
    links: List[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "nutrition-label.cfm" in href and "mid=" in href:
            if href not in seen:
                seen.add(href)
                links.append(href)
    return links


def extract_item_names_near_links(html: str, links: List[str]) -> Dict[str, str]:
    soup = BeautifulSoup(html, "lxml")
    link_set = set(links)
    mid_to_name: Dict[str, str] = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "nutrition-label.cfm" not in href or "mid=" not in href:
            continue
        if href not in link_set:
            continue
        parsed = urlparse(href)
        qs = parse_qs(parsed.query)
        mids = qs.get("mid", [])
        if not mids:
            continue
        mid = mids[0]
        if mid in mid_to_name:
            continue
        text = a.get_text(strip=True)
        if not text:
            parent = a.parent
            if parent:
                text = parent.get_text(strip=True)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            mid_to_name[mid] = text
    return mid_to_name


def get_menu_mids_and_names(html: str) -> Tuple[List[str], Dict[str, dict]]:
    """Parse menu HTML in document order, extracting mid, name, station, and meal_periods.

    Returns:
        mids: ordered list of unique mids
        mid_to_meta: {mid: {name, station, meal_periods: list[str]}}
    """
    soup = BeautifulSoup(html, "lxml")

    mid_to_meta: Dict[str, dict] = {}
    mids_ordered: List[str] = []

    current_meal_period = ""
    current_station = ""

    MEAL_PERIODS = ["Breakfast", "Lunch", "Dinner", "Late Night"]

    # Station labels that are actually just meal-period buffet sections
    # e.g. "Breakfast", "Breakfast Entrees", "Lunch Desserts", "Dinner" → "Buffet"
    _BUFFET_PREFIXES = tuple(p.lower() for p in MEAL_PERIODS)

    def _normalize_station(label: str) -> str:
        """Collapse meal-period-named sections (Breakfast Entrees, Lunch Desserts …) into 'Buffet'."""
        if not label:
            return label
        lower = label.lower()
        for prefix in _BUFFET_PREFIXES:
            if lower == prefix or lower.startswith(prefix + " "):
                return "Buffet"
        return label

    for el in soup.find_all(["h1", "h2", "a"]):
        cls = el.get("class", [])

        if el.name == "h1" and "menu-header" in cls:
            text = el.get_text(separator=" ", strip=True)
            current_meal_period = ""
            for period in MEAL_PERIODS:
                if period in text:
                    current_meal_period = period
                    break
            current_station = ""

        elif el.name == "h2" and "category-header" in cls:
            raw_label = el.get("aria-label", "").strip() or el.get_text(strip=True).strip()
            current_station = _normalize_station(raw_label)

        elif el.name == "a":
            href = el.get("href", "")
            if "nutrition-label.cfm" not in href or "mid=" not in href:
                continue
            parsed = urlparse(href)
            qs = parse_qs(parsed.query)
            mid_list = qs.get("mid", [])
            if not mid_list:
                continue
            mid = mid_list[0]

            name = (el.get("aria-label") or el.get_text(strip=True) or "").strip()
            name = re.sub(r"\s+", " ", name).strip()
            if not name:
                continue

            if mid not in mid_to_meta:
                mid_to_meta[mid] = {
                    "name": name,
                    "station": current_station,
                    "meal_periods": [],
                }
                mids_ordered.append(mid)

            if current_meal_period and current_meal_period not in mid_to_meta[mid]["meal_periods"]:
                mid_to_meta[mid]["meal_periods"].append(current_meal_period)

    return mids_ordered, mid_to_meta
