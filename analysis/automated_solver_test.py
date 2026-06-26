#!/usr/bin/env python3
"""
Automated solver benchmark: Gemini 2.0 Flash on HCO perceptual & reasoning challenges.

Usage:
    pip install google-genai pillow
    export GOOGLE_API_KEY=your_key
    python automated_solver_test.py
"""

from __future__ import annotations

import base64
import csv
import io
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

# Challenge generators live in ../backend
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from challenges.perceptual import (  # noqa: E402
    generate_challenge as gen_perceptual,
    verify_response as verify_perceptual,
)
from challenges.reasoning import (  # noqa: E402
    generate_challenge as gen_reasoning,
    verify_response as verify_reasoning,
)

try:
    from google import genai
except ImportError as exc:
    raise SystemExit(
        "google-genai is required: pip install google-genai"
    ) from exc

from PIL import Image  # noqa: E402

SOLVER = "gemini-2.0-flash"
MODEL_NAME = "gemini-2.0-flash"
TRIALS_PER_FAMILY = 200
RATE_LIMIT_SLEEP = 4.0  # free tier ≈ 15 req/min
OUTPUT_CSV = Path(__file__).resolve().parent / "solver_results.csv"

PERCEPTUAL_PROMPT = (
    "You see one original image and 4 option images labeled 0, 1, 2, 3.\n"
    "Which option best matches the original? Reply with one digit only: 0, 1, 2, or 3."
)

REASONING_PROMPT = (
    "What is the next number in this sequence? Reply with one number only.\n"
    "Sequence: {n1}, {n2}, {n3}, {n4}, ?"
)


@dataclass
class TrialResult:
    solver: str
    family: str
    trial: int
    latency: float
    correct: bool
    passed: bool
    latency_fail: bool
    correctness_fail: bool
    response_raw: str
    error: str


def _b64_to_pil(b64_str: str) -> Image.Image:
    return Image.open(io.BytesIO(base64.b64decode(b64_str))).convert("RGB")


def _parse_digit(text: str) -> int:
    stripped = (text or "").strip()
    if not stripped:
        raise ValueError("empty response")
    digit = int(stripped[0])
    if digit not in range(4):
        raise ValueError(f"expected digit 0-3, got {digit}")
    return digit


def _parse_number(text: str) -> int:
    stripped = (text or "").strip()
    if not stripped:
        raise ValueError("empty response")
    token = stripped.split()[0].rstrip(".,;")
    return int(token)


def _call_with_timeout(fn: Callable[[], Any], timeout: float) -> Any:
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn)
        return future.result(timeout=timeout)


def _outcome(
    latency: float,
    delta_resp: float,
    correct: bool,
) -> Tuple[bool, bool, bool]:
    latency_fail = latency > delta_resp
    correctness_fail = (not correct) and (not latency_fail)
    passed = correct and (not latency_fail)
    return passed, latency_fail, correctness_fail


def _run_perceptual_trial(client: genai.Client, trial: int) -> TrialResult:
    public, private = gen_perceptual()
    challenge = {**public, **private}
    delta_resp = public["delta_resp"]

    original = _b64_to_pil(public["original_b64"])
    options = [_b64_to_pil(b64) for b64 in public["options"]]

    contents: List[Any] = [
        PERCEPTUAL_PROMPT,
        "Original image:",
        original,
    ]
    for idx, img in enumerate(options):
        contents.extend([f"Option {idx}:", img])

    t_start = time.time()
    response_raw = ""
    error = ""

    try:
        def _invoke() -> Any:
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
            )

        response = _call_with_timeout(_invoke, timeout=delta_resp)
        t_end = time.time()
        latency = t_end - t_start
        response_raw = response.text or ""
        selected = _parse_digit(response_raw)
        correct = verify_perceptual(challenge, {"selected_index": selected})
    except FuturesTimeoutError:
        t_end = time.time()
        latency = t_end - t_start
        correct = False
        error = "timeout"
    except Exception as exc:  # noqa: BLE001
        t_end = time.time()
        latency = t_end - t_start
        correct = False
        error = str(exc)

    passed, latency_fail, correctness_fail = _outcome(latency, delta_resp, correct)

    return TrialResult(
        solver=SOLVER,
        family="perceptual",
        trial=trial,
        latency=latency,
        correct=correct,
        passed=passed,
        latency_fail=latency_fail,
        correctness_fail=correctness_fail,
        response_raw=response_raw,
        error=error,
    )


def _run_reasoning_trial(client: genai.Client, trial: int) -> TrialResult:
    public, private = gen_reasoning()
    challenge = {**public, **private}
    delta_resp = public["delta_resp"]
    seq = public["sequence"]

    prompt = REASONING_PROMPT.format(n1=seq[0], n2=seq[1], n3=seq[2], n4=seq[3])

    t_start = time.time()
    response_raw = ""
    error = ""

    try:
        def _invoke() -> Any:
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

        response = _call_with_timeout(_invoke, timeout=delta_resp)
        t_end = time.time()
        latency = t_end - t_start
        response_raw = response.text or ""
        answer = _parse_number(response_raw)
        correct = verify_reasoning(challenge, {"answer": answer})
    except FuturesTimeoutError:
        t_end = time.time()
        latency = t_end - t_start
        correct = False
        error = "timeout"
    except Exception as exc:  # noqa: BLE001
        t_end = time.time()
        latency = t_end - t_start
        correct = False
        error = str(exc)

    passed, latency_fail, correctness_fail = _outcome(latency, delta_resp, correct)

    return TrialResult(
        solver=SOLVER,
        family="reasoning",
        trial=trial,
        latency=latency,
        correct=correct,
        passed=passed,
        latency_fail=latency_fail,
        correctness_fail=correctness_fail,
        response_raw=response_raw,
        error=error,
    )


def _print_progress(result: TrialResult, total: int) -> None:
    print(
        f"[{result.family}] Trial {result.trial}/{total} — "
        f"latency: {result.latency:.1f}s — "
        f"correct: {result.correct} — "
        f"passed: {result.passed}"
        + (f" — error: {result.error}" if result.error else "")
    )


def _save_results(results: List[TrialResult], path: Path) -> None:
    fieldnames = [
        "solver",
        "family",
        "trial",
        "latency",
        "correct",
        "passed",
        "latency_fail",
        "correctness_fail",
        "response_raw",
        "error",
    ]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for row in results:
            writer.writerow(
                {
                    "solver": row.solver,
                    "family": row.family,
                    "trial": row.trial,
                    "latency": f"{row.latency:.4f}",
                    "correct": row.correct,
                    "passed": row.passed,
                    "latency_fail": row.latency_fail,
                    "correctness_fail": row.correctness_fail,
                    "response_raw": row.response_raw,
                    "error": row.error,
                }
            )


def _summarize_family(results: List[TrialResult]) -> Dict[str, Optional[float]]:
    if not results:
        return {
            "success_pct": None,
            "mean_latency": None,
            "latency_fail_pct": None,
            "correctness_fail_pct": None,
        }

    n = len(results)
    return {
        "success_pct": 100.0 * sum(r.passed for r in results) / n,
        "mean_latency": sum(r.latency for r in results) / n,
        "latency_fail_pct": 100.0 * sum(r.latency_fail for r in results) / n,
        "correctness_fail_pct": 100.0 * sum(r.correctness_fail for r in results) / n,
    }


def _print_summary(all_results: List[TrialResult]) -> None:
    by_family: Dict[str, List[TrialResult]] = {}
    for row in all_results:
        by_family.setdefault(row.family, []).append(row)

    print("\nSummary")
    print(f"{'Family':<14}| {'Success%':>9} | {'Mean Latency':>13} | {'Latency Fail%':>14} | {'Correctness Fail%':>18}")
    print("-" * 78)

    for family in ("perceptual", "reasoning", "attention", "biometric"):
        if family in ("attention", "biometric"):
            print(f"{family:<14}| {'N/A':>9} | {'N/A':>13} | {'N/A':>14} | {'N/A':>18}")
            continue

        stats = _summarize_family(by_family.get(family, []))
        print(
            f"{family:<14}| {stats['success_pct']:>8.1f}% | "
            f"{stats['mean_latency']:>10.2f}s | "
            f"{stats['latency_fail_pct']:>13.1f}% | "
            f"{stats['correctness_fail_pct']:>17.1f}%"
        )


def main() -> None:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise SystemExit("GOOGLE_API_KEY environment variable is not set")

    client = genai.Client(api_key=api_key)

    results: List[TrialResult] = []
    runners: List[Tuple[str, Callable[[genai.Client, int], TrialResult]]] = [
        ("perceptual", _run_perceptual_trial),
        ("reasoning", _run_reasoning_trial),
    ]

    print(f"Solver: {SOLVER}")
    print(f"Trials per family: {TRIALS_PER_FAMILY}")
    print(f"Rate limit sleep: {RATE_LIMIT_SLEEP}s between calls")
    print(f"Output: {OUTPUT_CSV}\n")

    for family, runner in runners:
        print(f"=== {family} ===")
        for trial in range(1, TRIALS_PER_FAMILY + 1):
            result = runner(client, trial)
            results.append(result)
            _print_progress(result, TRIALS_PER_FAMILY)

            if trial < TRIALS_PER_FAMILY or family != runners[-1][0]:
                time.sleep(RATE_LIMIT_SLEEP)

    _save_results(results, OUTPUT_CSV)
    _print_summary(results)
    print(f"\nSaved {len(results)} rows to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
