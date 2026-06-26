"""Reasoning challenge generator — numeric sequence completion."""

import random
from typing import Any, Dict, Tuple


def generate_challenge() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Generate a numeric sequence challenge."""
    seq_type = random.choice(["arithmetic", "geometric", "fibonacci", "square"])

    if seq_type == "arithmetic":
        a = random.randint(1, 20)
        d = random.randint(2, 8)
        sequence = [a, a + d, a + 2 * d, a + 3 * d]
        correct_answer = a + 4 * d
    elif seq_type == "geometric":
        a = random.randint(2, 5)
        r = random.randint(2, 4)
        sequence = [a, a * r, a * r**2, a * r**3]
        correct_answer = a * r**4
    elif seq_type == "fibonacci":
        a = random.randint(1, 8)
        b = random.randint(1, 8)
        sequence = [a, b, a + b, a + 2 * b]
        correct_answer = a + 3 * b
    else:  # square
        start = random.randint(1, 5)
        sequence = [
            start**2,
            (start + 1) ** 2,
            (start + 2) ** 2,
            (start + 3) ** 2,
        ]
        correct_answer = (start + 4) ** 2

    public = {
        "sequence": sequence,
        "sequence_type": seq_type,
        "delta_resp": 12.0,
    }
    private = {"correct_answer": correct_answer}
    return public, private


def verify_response(challenge: Dict[str, Any], response: Dict[str, Any]) -> bool:
    try:
        return int(response.get("answer", "")) == challenge.get("correct_answer")
    except (ValueError, TypeError):
        return False
