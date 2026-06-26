"""Perceptual challenge generator — abstract shape matching."""

import base64
import io
import random
from typing import Any, Dict, List, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

NUM_BASE_IMAGES = 50
IMAGE_SIZE = 200


def _generate_base_shape(seed: int) -> Image.Image:
    """Generate an abstract geometric shape image."""
    rng = random.Random(seed)
    img = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), (20, 20, 30))
    draw = ImageDraw.Draw(img)

    num_shapes = rng.randint(3, 6)
    for _ in range(num_shapes):
        color = (
            rng.randint(60, 255),
            rng.randint(60, 255),
            rng.randint(60, 255),
        )
        shape_type = rng.choice(["circle", "triangle", "rectangle"])
        x = rng.randint(20, IMAGE_SIZE - 60)
        y = rng.randint(20, IMAGE_SIZE - 60)
        size = rng.randint(25, 70)

        if shape_type == "circle":
            draw.ellipse([x, y, x + size, y + size], fill=color)
        elif shape_type == "triangle":
            points = [
                (x + size // 2, y),
                (x, y + size),
                (x + size, y + size),
            ]
            draw.polygon(points, fill=color)
        else:
            w = size
            h = rng.randint(size // 2, size)
            draw.rectangle([x, y, x + w, y + h], fill=color)

    return img


# Pre-generate 50 base images at module load
_BASE_IMAGES: List[Image.Image] = [
    _generate_base_shape(i) for i in range(NUM_BASE_IMAGES)
]


def _apply_transformation(img: Image.Image, rng: random.Random) -> Image.Image:
    """Apply random noise, rotation, and color jitter."""
    result = img.copy()

    angle = rng.uniform(-15, 15)
    result = result.rotate(angle, fillcolor=(20, 20, 30), expand=False)

    arr = np.array(result, dtype=np.float32)
    noise = rng.gauss(0, 30)
    noise_arr = np.random.normal(0, 30, arr.shape).astype(np.float32)
    arr = np.clip(arr + noise_arr, 0, 255).astype(np.uint8)
    result = Image.fromarray(arr)

    enhancer = ImageEnhance.Color(result)
    result = enhancer.enhance(rng.uniform(0.7, 1.3))
    enhancer = ImageEnhance.Brightness(result)
    result = enhancer.enhance(rng.uniform(0.8, 1.2))

    return result


def _to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def generate_challenge() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Generate a perceptual matching challenge."""
    rng = random.Random()
    base_idx = rng.randint(0, NUM_BASE_IMAGES - 1)
    original = _BASE_IMAGES[base_idx]

    original_b64 = _to_b64(original)

    correct_transformed = _apply_transformation(original, rng)
    options = [correct_transformed]
    for i in range(3):
        distractor_base = _BASE_IMAGES[(base_idx + i + 1) % NUM_BASE_IMAGES]
        options.append(_apply_transformation(distractor_base, random.Random(rng.randint(0, 999999))))

    correct_index = rng.randint(0, 3)
    correct_img = options[0]
    options[0] = options[correct_index]
    options[correct_index] = correct_img

    options_b64 = [_to_b64(opt) for opt in options]

    public = {
        "original_b64": original_b64,
        "options": options_b64,
        "delta_resp": 8.0,
    }
    private = {"correct_index": correct_index}
    return public, private


def verify_response(challenge: Dict[str, Any], response: Dict[str, Any]) -> bool:
    return response.get("selected_index") == challenge.get("correct_index")
