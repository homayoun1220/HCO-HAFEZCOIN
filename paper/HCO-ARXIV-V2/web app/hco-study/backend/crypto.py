"""HCO cryptographic binding utilities."""

import hashlib
import secrets
from typing import Dict

# In-memory nonce store keyed by window_id (backed by DB in production flow)
_nonce_cache: Dict[str, str] = {}


def generate_nonce(window_id: str) -> str:
    """Generate and store a random 32-byte hex nonce η_d for the given window."""
    nonce = secrets.token_hex(32)
    _nonce_cache[window_id] = nonce
    return nonce


def get_nonce(window_id: str) -> str | None:
    """Retrieve a previously generated nonce for a window."""
    return _nonce_cache.get(window_id)


def set_nonce(window_id: str, nonce: str) -> None:
    """Restore a nonce from the database."""
    _nonce_cache[window_id] = nonce


def compute_binding_tag(
    pk_v: str, window_id: str, challenge_index: int, nonce: str
) -> str:
    """Compute SHA3-256(pk_v || window_id || challenge_index || nonce)."""
    payload = f"{pk_v}|{window_id}|{challenge_index}|{nonce}".encode("utf-8")
    return hashlib.sha3_256(payload).hexdigest()
