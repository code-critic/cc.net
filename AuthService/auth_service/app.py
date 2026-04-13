from __future__ import annotations

import logging
from datetime import datetime, timezone
from urllib.parse import quote, urlsplit

from flask import Flask, jsonify, redirect, request

from .config import Settings
from .crypto import encrypt_payload


def _normalize_url(value: str) -> str:
    return value.rstrip("/")


def _is_allowed_return_url(url: str, settings: Settings) -> bool:
    if not url:
        return False
    parsed = urlsplit(url)
    if not parsed.scheme or not parsed.netloc:
        return False
    normalized = _normalize_url(url)
    return normalized in {_normalize_url(item) for item in settings.allowed_return_urls}


def _build_payload(eppn: str, affiliation: str) -> dict[str, str]:
    return {
        "eppn": eppn,
        "affiliation": affiliation,
        "datetime": datetime.now(timezone.utc).strftime("%Y%m%d--%H%M%S"),
    }


def create_app() -> Flask:
    app = Flask(__name__)
    settings = Settings.from_env()
    app.config["SETTINGS"] = settings

    logging.basicConfig(level=settings.log_level)

    @app.get("/health")
    def health():
        errors = settings.validate()
        status = "ok" if not errors else "degraded"
        return jsonify({"status": status, "errors": errors}), 200

    @app.get("/secure/")
    def secure():
        login_target = settings.default_return_url
        if login_target:
            auth_url = f"/auth/index.php?returnurl={quote(login_target, safe='')}"
            return (
                "<html><body>"
                "<h1>Code Critic AuthService</h1>"
                "<p>Your local application session was cleared.</p>"
                f'<p><a href="{auth_url}">Log in again</a></p>'
                "</body></html>"
            )

        return (
            "<html><body>"
            "<h1>Code Critic AuthService</h1>"
            "<p>Your local application session was cleared.</p>"
            "</body></html>"
        )

    @app.get("/auth/index.php")
    def login_bridge():
        errors = settings.validate()
        if errors:
            app.logger.error("Configuration error: %s", "; ".join(errors))
            return (
                jsonify(
                    {
                        "error": "server_misconfigured",
                        "message": "AuthService configuration is incomplete.",
                        "details": errors,
                    }
                ),
                500,
            )

        return_url = request.args.get("returnurl", "")
        if not _is_allowed_return_url(return_url, settings):
            return (
                jsonify(
                    {
                        "error": "invalid_returnurl",
                        "message": "Return URL is not in the allowlist.",
                        "support": settings.support_email,
                    }
                ),
                400,
            )

        eppn = request.headers.get(settings.eppn_header, "").strip()
        affiliation = request.headers.get(settings.affiliation_header, "").strip()
        display_name = request.headers.get(settings.display_name_header, "").strip()
        idp = request.headers.get(settings.idp_header, "").strip()

        if not eppn or not affiliation:
            app.logger.warning(
                "Missing identity headers eppn=%r affiliation=%r display_name=%r idp=%r",
                eppn,
                affiliation,
                display_name,
                idp,
            )
            return (
                jsonify(
                    {
                        "error": "missing_attributes",
                        "message": "Expected Shibboleth attributes were not forwarded.",
                        "required_headers": [
                            settings.eppn_header,
                            settings.affiliation_header,
                        ],
                        "support": settings.support_email,
                    }
                ),
                401,
            )

        payload = _build_payload(eppn=eppn, affiliation=affiliation)
        token = encrypt_payload(payload, settings.aes_key)
        target = f"{_normalize_url(return_url)}/{quote(token, safe=':')}"

        app.logger.info(
            "Authenticated eppn=%s idp=%s target=%s",
            eppn,
            idp or "unknown",
            _normalize_url(return_url),
        )
        return redirect(target, code=302)

    return app
