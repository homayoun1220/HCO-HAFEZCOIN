"""Attention challenge generator — dot-following task."""

import math
import random
from typing import Any, Dict, List, Tuple

CANVAS_W = 400
CANVAS_H = 400
MARGIN = 40


def _random_waypoint(t: float, rng: random.Random) -> Dict[str, float]:
    return {
        "x": rng.uniform(MARGIN, CANVAS_W - MARGIN),
        "y": rng.uniform(MARGIN, CANVAS_H - MARGIN),
        "t": t,
    }


def generate_challenge() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Generate a dot-following attention challenge."""
    rng = random.Random()
    speed = rng.uniform(40, 60)
    duration = 10.0

    num_waypoints = rng.randint(8, 14)
    waypoints: List[Dict[str, float]] = []
    t = 0.0
    x = rng.uniform(MARGIN, CANVAS_W - MARGIN)
    y = rng.uniform(MARGIN, CANVAS_H - MARGIN)
    waypoints.append({"x": x, "y": y, "t": 0.0})

    for _ in range(num_waypoints - 1):
        nx = rng.uniform(MARGIN, CANVAS_W - MARGIN)
        ny = rng.uniform(MARGIN, CANVAS_H - MARGIN)
        dist = math.sqrt((nx - x) ** 2 + (ny - y) ** 2)
        dt = dist / speed
        t += dt
        if t > duration:
            break
        waypoints.append({"x": nx, "y": ny, "t": t})
        x, y = nx, ny

    if waypoints[-1]["t"] < duration:
        waypoints.append({"x": x, "y": y, "t": duration})

    path_end = waypoints[-1]["t"]
    # Stop while the dot is still on the path — never after the path ends
    earliest = waypoints[1]["t"] if len(waypoints) > 1 else path_end * 0.5
    stop_time = rng.uniform(max(earliest, path_end * 0.65), path_end)

    # Interpolate position at stop_time for verification
    def _pos_at(t: float) -> Dict[str, float]:
        if t <= waypoints[0]["t"]:
            return {"x": waypoints[0]["x"], "y": waypoints[0]["y"]}
        for i in range(len(waypoints) - 1):
            a, b = waypoints[i], waypoints[i + 1]
            if a["t"] <= t <= b["t"]:
                frac = (t - a["t"]) / (b["t"] - a["t"]) if b["t"] != a["t"] else 0
                return {
                    "x": a["x"] + (b["x"] - a["x"]) * frac,
                    "y": a["y"] + (b["y"] - a["y"]) * frac,
                }
        last = waypoints[-1]
        return {"x": last["x"], "y": last["y"]}

    stop_position = _pos_at(stop_time)

    public = {
        "waypoints": waypoints,
        "stop_time": stop_time,
        "canvas_size": {"w": CANVAS_W, "h": CANVAS_H},
        "delta_resp": 15.0,
    }
    private = {"stop_position": stop_position}
    return public, private


def verify_response(challenge: Dict[str, Any], response: Dict[str, Any]) -> bool:
    click = response.get("click", {})
    stop = challenge.get("stop_position", {})
    dx = click.get("x", -999) - stop.get("x", 0)
    dy = click.get("y", -999) - stop.get("y", 0)
    return math.sqrt(dx**2 + dy**2) <= 40
