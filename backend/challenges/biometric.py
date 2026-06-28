"""Biometric challenge generator — phrase repetition."""

import random
from typing import Any, Dict, Tuple

PHRASES = [
    "blue tree seven", "red cloud five", "green stone three",
    "yellow river nine", "purple moon two", "orange wind four",
    "silver leaf eight", "golden sun six", "dark forest one",
    "bright star ten", "cold winter eleven", "warm summer twelve",
    "soft rain thirteen", "hard rock fourteen", "fast wind fifteen",
    "slow river sixteen", "tall mountain seventeen", "deep ocean eighteen",
    "wide field nineteen", "narrow path twenty", "clear sky twenty one",
    "thick fog twenty two", "light snow twenty three", "heavy rain twenty four",
    "calm lake twenty five", "wild fire twenty six", "gentle breeze twenty seven",
    "sharp edge twenty eight", "smooth surface twenty nine", "rough terrain thirty",
    "ancient oak thirty one", "young sapling thirty two", "hidden cave thirty three",
    "open meadow thirty four", "secret garden thirty five", "frozen pond thirty six",
    "flowing stream thirty seven", "broken branch thirty eight", "fallen leaf thirty nine",
    "rising sun forty", "setting moon forty one", "morning dew forty two",
    "evening mist forty three", "midnight hour forty four", "dawn light forty five",
    "dusk shadow forty six", "northern wind forty seven", "southern breeze forty eight",
    "eastern gate forty nine", "western shore fifty", "central path fifty one",
    "outer ring fifty two", "inner core fifty three", "upper level fifty four",
    "lower depth fifty five", "first step fifty six", "last chance fifty seven",
    "next turn fifty eight", "previous page fifty nine", "current time sixty",
    "future plan sixty one", "past event sixty two", "present moment sixty three",
    "random word sixty four", "specific task sixty five", "general rule sixty six",
    "special case sixty seven", "normal state sixty eight", "extreme value sixty nine",
    "minimum effort seventy", "maximum gain seventy one", "average score seventy two",
    "total sum seventy three", "partial view seventy four", "complete set seventy five",
    "empty space seventy six", "full capacity seventy seven", "half measure seventy eight",
    "double check seventy nine", "triple jump eighty", "single file eighty one",
    "pair bond eighty two", "group task eighty three", "team effort eighty four",
    "solo flight eighty five", "joint venture eighty six", "shared goal eighty seven",
    "private note eighty eight", "public speech eighty nine", "formal dress ninety",
    "casual wear ninety one", "quick response ninety two", "slow reaction ninety three",
    "fast track ninety four", "safe route ninety five", "danger zone ninety six",
    "secure area ninety seven", "open access ninety eight", "locked door ninety nine",
    "hidden key one hundred",
]


def generate_challenge() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Generate a phrase repetition challenge."""
    phrase = random.choice(PHRASES)
    public = {
        "phrase": phrase,
        "delta_resp": 10.0,
    }
    private = {"phrase": phrase}
    return public, private


def verify_response(challenge: Dict[str, Any], response: Dict[str, Any]) -> bool:
    audio_b64 = response.get("audio_b64", "")
    # Real WebM recordings are much larger than placeholder filler
    return len(audio_b64) >= 500
