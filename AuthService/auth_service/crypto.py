from __future__ import annotations

import base64
import json
from dataclasses import dataclass

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


BLOCK_SIZE = 16


def _zero_pad(data: bytes) -> bytes:
    pad_length = (-len(data)) % BLOCK_SIZE
    if pad_length == 0:
        return data
    return data + (b"\x00" * pad_length)


def _strip_zero_padding(data: bytes) -> bytes:
    return data.rstrip(b"\x00")


def _build_cipher(key: bytes) -> Cipher:
    return Cipher(algorithms.AES(key), modes.CBC(key))


def encrypt_payload(payload: dict[str, str], aes_key: str) -> str:
    plaintext = json.dumps(payload, separators=(",", ":")).encode("ascii")
    key = aes_key.encode("ascii")
    encryptor = _build_cipher(key).encryptor()
    ciphertext = encryptor.update(_zero_pad(plaintext)) + encryptor.finalize()
    return base64.b64encode(ciphertext).decode("ascii").replace("/", ":")


def decrypt_token(token: str, aes_key: str) -> dict[str, str]:
    key = aes_key.encode("ascii")
    raw = base64.b64decode(token.replace(":", "/"))
    decryptor = _build_cipher(key).decryptor()
    plaintext = decryptor.update(raw) + decryptor.finalize()
    return json.loads(_strip_zero_padding(plaintext).decode("ascii"))
