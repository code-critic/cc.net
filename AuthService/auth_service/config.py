from __future__ import annotations

import os
from dataclasses import dataclass


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    aes_key: str
    allowed_return_urls: tuple[str, ...]
    default_return_url: str | None
    support_email: str
    eppn_header: str
    affiliation_header: str
    display_name_header: str
    idp_header: str
    log_level: str

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            aes_key=os.getenv("AUTHSERVICE_AES_KEY", ""),
            allowed_return_urls=tuple(
                _split_csv(os.getenv("AUTHSERVICE_ALLOWED_RETURN_URLS", ""))
            ),
            default_return_url=os.getenv("AUTHSERVICE_DEFAULT_RETURN_URL") or None,
            support_email=os.getenv("AUTHSERVICE_SUPPORT_EMAIL", "root@localhost"),
            eppn_header=os.getenv("AUTHSERVICE_EPPN_HEADER", "X-Remote-Eppn"),
            affiliation_header=os.getenv(
                "AUTHSERVICE_AFFILIATION_HEADER",
                "X-Remote-Affiliation",
            ),
            display_name_header=os.getenv(
                "AUTHSERVICE_DISPLAY_NAME_HEADER",
                "X-Remote-Display-Name",
            ),
            idp_header=os.getenv(
                "AUTHSERVICE_IDP_HEADER",
                "X-Remote-Identity-Provider",
            ),
            log_level=os.getenv("AUTHSERVICE_LOG_LEVEL", "INFO").upper(),
        )

    def validate(self) -> list[str]:
        errors: list[str] = []
        if not self.aes_key:
            errors.append("AUTHSERVICE_AES_KEY is not set.")
        else:
            try:
                key_length = len(self.aes_key.encode("ascii"))
            except UnicodeEncodeError:
                errors.append("AUTHSERVICE_AES_KEY must contain ASCII characters only.")
            else:
                if key_length not in (16, 24, 32):
                    errors.append(
                        "AUTHSERVICE_AES_KEY must be 16, 24, or 32 ASCII bytes."
                    )

        if not self.allowed_return_urls:
            errors.append("AUTHSERVICE_ALLOWED_RETURN_URLS is empty.")

        if self.default_return_url and self.default_return_url not in self.allowed_return_urls:
            errors.append(
                "AUTHSERVICE_DEFAULT_RETURN_URL must be present in "
                "AUTHSERVICE_ALLOWED_RETURN_URLS."
            )

        return errors
