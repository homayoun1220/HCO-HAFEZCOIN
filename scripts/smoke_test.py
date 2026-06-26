#!/usr/bin/env python3
"""End-to-end API smoke test — simulates a full 20-trial study session."""

import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
TRIALS_PER_FAMILY = 5
FAMILIES = ["perceptual", "reasoning", "attention", "biometric"]


def req(method: str, path: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    with urllib.request.urlopen(request, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main() -> int:
    print(f"Smoke test → {BASE}\n")

    health = req("GET", "/api/health")
    print(f"✓ health: {health['status']}")

    session = req("POST", "/api/session/start", {
        "prolific_pid": "SMOKE_TEST",
        "study_id": "SMOKE",
    })
    sid = session["session_id"]
    order = session["block_order"]
    print(f"✓ session: {sid[:8]}… order={order}")

    passed = 0
    trial_num = 0
    for family in order:
        for t_idx in range(TRIALS_PER_FAMILY):
            trial_num += 1
            ch = req("POST", "/api/challenge/issue", {
                "session_id": sid,
                "family": family,
                "trial_index": t_idx,
            })
            cid = ch["challenge_id"]

            if family == "perceptual":
                response = {"selected_index": 0}
            elif family == "reasoning":
                response = {"answer": "42"}
            elif family == "attention":
                response = {"click": {"x": 200, "y": 200}}
            else:
                response = {"audio_b64": "x" * 200}

            result = req("POST", "/api/challenge/submit", {
                "session_id": sid,
                "challenge_id": cid,
                "response": response,
            })
            if result.get("passed"):
                passed += 1
            print(
                f"  trial {trial_num:2d}/20 [{family:11s}] "
                f"latency={result['latency']:.2f}s passed={result['passed']}"
            )

    done = req("POST", "/api/session/complete", {"session_id": sid})
    print(f"\n✓ complete: code={done['completion_code']} score={done['score']}")

    export_req = urllib.request.Request(f"{BASE}/api/admin/export")
    with urllib.request.urlopen(export_req, timeout=30) as resp:
        csv_lines = resp.read().decode().strip().splitlines()
    print(f"✓ export: {len(csv_lines) - 1} trial rows in CSV")

    print(f"\nResult: {passed}/20 passed in smoke test")
    print("Smoke test PASSED")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"Smoke test FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
