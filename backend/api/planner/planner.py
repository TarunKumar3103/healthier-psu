from __future__ import annotations
import random
from typing import Dict, List, Optional, Set

MEAT_KEYWORDS = [
    "chicken", "beef", "pork", "bacon", "turkey", "sausage", "ham", "pepperoni",
    "salami", "prosciutto", "fish", "tuna", "shrimp", "crab", "lobster", "salmon",
    "tilapia", "steak", "brisket", "meatball", "hot dog", "bratwurst", "chorizo",
    "lamb", "venison", "duck", "veal", "anchov", "clam", "oyster", "mussel",
    "scallop",
]

BRAIN_KEYWORDS = [
    "salmon", "tuna", "sardine", "mackerel", "trout",
    "spinach", "kale", "broccoli", "arugula", "greens", "mixed greens",
    "walnut", "almond", "pecan",
    "blueberry", "strawberry", "berry",
    "egg", "eggs",
    "avocado",
    "oat", "oatmeal", "quinoa",
    "yogurt",
    "dark chocolate",
    "olive",
    "salad",
    "whole wheat", "whole grain",
    "lentil", "bean", "chickpea",
]

SKIN_KEYWORDS = [
    "salmon", "tuna", "sardine",
    "spinach", "kale", "broccoli", "sweet potato",
    "blueberry", "strawberry", "berry",
    "avocado",
    "cucumber", "tomato",
    "almond", "walnut", "sunflower",
    "yogurt",
    "orange", "citrus",
    "oat", "oatmeal",
    "green", "greens",
    "carrot",
    "bell pepper",
    "lentil", "bean",
]

# Maps planner meal slot → PSU menu meal period label
MEAL_PERIOD_MAP = {
    "breakfast": "Breakfast",
    "lunch": "Lunch",
    "dinner": "Dinner",
}


def _is_vegetarian(item: dict) -> bool:
    iv = item.get("is_vegetarian")
    if iv is True:
        return True
    if iv is False:
        return False
    name = (item.get("name") or "").lower()
    for kw in MEAT_KEYWORDS:
        if kw in name:
            return False
    return True


def _allowed(item: dict, vegetarian: bool, avoid_allergens: List[str]) -> bool:
    if vegetarian and not _is_vegetarian(item):
        return False
    item_allergens = [a.lower() for a in (item.get("allergens") or [])]
    for avoid in avoid_allergens:
        avoid_lower = avoid.lower()
        for ia in item_allergens:
            if avoid_lower in ia or ia in avoid_lower:
                return False
    return True


def _available_for_meal(item: dict, meal_slot: str) -> bool:
    """Return True if the item is labelled for the given meal slot.

    Items with no meal_periods data are not placed in any specific meal slot.
    """
    meal_periods = item.get("meal_periods") or []
    if not meal_periods:
        return False  # no label → don't assign to a specific meal
    target = MEAL_PERIOD_MAP.get(meal_slot)
    if target is None:
        return True  # extras — no restriction
    return target in meal_periods


def _pref_bonus(item: dict, preferences: Optional[List[str]]) -> float:
    if not preferences:
        return 0.0
    name = (item.get("name") or "").lower()
    return sum(2.5 for p in preferences if p.lower() in name)


def _station_bonus(item: dict, station_preference: Optional[str]) -> float:
    if not station_preference:
        return 0.0
    item_station = (item.get("station") or "").lower()
    pref = station_preference.lower()
    if pref and (pref in item_station or item_station in pref):
        return 6.0
    return 0.0


def _score(
    item: dict,
    protein_priority: float,
    goal_type: str = "physique",
    preferences: Optional[List[str]] = None,
    station_preference: Optional[str] = None,
) -> float:
    cal = item.get("calories") or 0
    prot = item.get("protein_g") or 0
    name = (item.get("name") or "").lower()
    bonus = _pref_bonus(item, preferences) + _station_bonus(item, station_preference)
    if goal_type == "brain":
        keyword_matches = sum(1 for kw in BRAIN_KEYWORDS if kw in name)
        cal_score = max(0.0, 1.0 - abs(cal - 350) / 600) if cal > 0 else 0.0
        return keyword_matches * 3.0 + cal_score + prot / 300 + bonus
    if goal_type == "skin":
        keyword_matches = sum(1 for kw in SKIN_KEYWORDS if kw in name)
        cal_score = max(0.0, 1.0 - abs(cal - 300) / 600) if cal > 0 else 0.0
        return keyword_matches * 3.0 + cal_score + bonus
    # physique (default)
    if cal <= 0:
        return bonus
    return protein_priority * (prot / cal) + (1 - protein_priority) * (prot / 100) + bonus


def _pick_unique(
    items: List[dict],
    cal_budget: float,
    protein_priority: float,
    used_mids: Set[str],
    rng: Optional[random.Random] = None,
    goal_type: str = "physique",
    preferences: Optional[List[str]] = None,
    station_preference: Optional[str] = None,
) -> List[dict]:
    candidates = [i for i in items if i.get("mid") not in used_mids]
    if rng is not None and len(candidates) > 1:
        noisy = [
            (item, _score(item, protein_priority, goal_type, preferences, station_preference) * (1.0 + rng.uniform(-0.35, 0.35)))
            for item in candidates
        ]
        noisy.sort(key=lambda x: x[1], reverse=True)
        candidates = [item for item, _ in noisy]
    else:
        candidates.sort(key=lambda x: _score(x, protein_priority, goal_type, preferences, station_preference), reverse=True)
    picked: List[dict] = []
    remaining = cal_budget
    for item in candidates:
        if remaining < 100:
            break
        cal = item.get("calories") or 0
        if cal <= remaining:
            picked.append(item)
            remaining -= cal
            used_mids.add(item["mid"])
    return picked


def _totals(items: List[dict]) -> dict:
    return {
        "calories": sum(i.get("calories") or 0 for i in items),
        "protein_g": sum(i.get("protein_g") or 0 for i in items),
    }


def build_plan(
    items: List[dict],
    calories_target: int,
    protein_target: int,
    vegetarian: bool,
    avoid_allergens: List[str],
    protein_priority: float,
    seed: Optional[int] = None,
    goal_type: str = "physique",
    food_preferences: Optional[List[str]] = None,
    station_preference: Optional[str] = None,
) -> dict:
    rng = random.Random(seed) if seed is not None else None
    filtered = [
        i for i in items
        if _allowed(i, vegetarian, avoid_allergens)
        and i.get("calories") is not None
        and i.get("protein_g") is not None
    ]
    if not filtered:
        return {
            "error": "No items match constraints or items missing nutrition.",
            "plan": None,
        }
    budgets = {
        "breakfast": calories_target * 0.30,
        "lunch": calories_target * 0.35,
        "dinner": calories_target * 0.35,
    }
    # Detect whether cache has any meal period data at all
    has_period_data = any(i.get("meal_periods") for i in filtered)

    used_mids: Set[str] = set()
    meals: Dict[str, dict] = {}
    for meal_name, budget in budgets.items():
        meal_items = [i for i in filtered if _available_for_meal(i, meal_name)]
        # Only fall back if the entire cache has no meal period data (old format)
        if not meal_items and not has_period_data:
            meal_items = filtered
        picked = _pick_unique(meal_items, budget, protein_priority, used_mids, rng, goal_type, food_preferences, station_preference)
        meals[meal_name] = {"items": picked, "totals": _totals(picked)}
    all_items = (
        meals["breakfast"]["items"]
        + meals["lunch"]["items"]
        + meals["dinner"]["items"]
    )
    total_protein = sum(i.get("protein_g") or 0 for i in all_items)
    protein_deficit = protein_target - total_protein
    extras: List[dict] = []
    if protein_deficit > 0:
        cal_so_far = sum(i.get("calories") or 0 for i in all_items)
        cal_buffer = calories_target * 1.10 - cal_so_far
        extra_candidates = sorted(
            [i for i in filtered if i.get("mid") not in used_mids],
            key=lambda x: (x.get("protein_g") or 0),
            reverse=True,
        )
        for item in extra_candidates:
            if cal_buffer < 100:
                break
            cal = item.get("calories") or 0
            if cal <= cal_buffer:
                extras.append(item)
                cal_buffer -= cal
                used_mids.add(item["mid"])
    meals["extras"] = {"items": extras, "totals": _totals(extras)}
    combined = all_items + extras
    low_preference_match = False
    if food_preferences:
        matched = sum(
            1 for item in combined
            if any(p.lower() in (item.get("name") or "").lower() for p in food_preferences)
        )
        low_preference_match = len(combined) == 0 or (matched / len(combined)) < 0.3
    return {
        "targets": {
            "calories_target": calories_target,
            "protein_target_g": protein_target,
        },
        "totals": _totals(combined),
        "meals": meals,
        "low_preference_match": low_preference_match,
        "notes": [
            "Planner is greedy but enforces no repeats across meals.",
            "Data comes from PSU menu scrape cache.",
        ],
    }
