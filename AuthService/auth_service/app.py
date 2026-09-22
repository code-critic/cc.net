from __future__ import annotations

from html import escape
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


def _read_identity_headers(request, settings: Settings) -> dict[str, str]:
    return {
        "eppn": request.headers.get(settings.eppn_header, "").strip(),
        "affiliation": request.headers.get(settings.affiliation_header, "").strip(),
        "display_name": request.headers.get(settings.display_name_header, "").strip(),
        "idp": request.headers.get(settings.idp_header, "").strip(),
    }


def _missing_identity_response(app: Flask, identity: dict[str, str], settings: Settings):
    app.logger.warning(
        "Missing identity headers eppn=%r affiliation=%r display_name=%r idp=%r",
        identity["eppn"],
        identity["affiliation"],
        identity["display_name"],
        identity["idp"],
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


def _render_debug_page(
    *,
    settings: Settings,
    identity: dict[str, str],
    payload: dict[str, str],
    token: str,
    callback_target: str | None,
) -> str:
    rows = [
        ("Shibboleth eppn", identity["eppn"] or "(missing)"),
        ("Shibboleth affiliation", identity["affiliation"] or "(missing)"),
        ("Shibboleth display name", identity["display_name"] or "(empty)"),
        ("Shibboleth IdP", identity["idp"] or "(empty)"),
        ("Encrypted token", token),
        ("Decrypted payload", jsonify(payload).get_data(as_text=True)),
        ("Configured callback", callback_target or "(none)"),
    ]

    row_html = "".join(
        "<tr>"
        f"<th style=\"text-align:left;padding:8px 12px;vertical-align:top;\">{escape(label)}</th>"
        f"<td style=\"padding:8px 12px;\"><pre style=\"margin:0;white-space:pre-wrap;\">{escape(value)}</pre></td>"
        "</tr>"
        for label, value in rows
    )

    callback_html = ""
    if callback_target:
        callback_html = (
            f"<p><a href=\"{escape(callback_target, quote=True)}\">"
            "Continue to Code Critic callback"
            "</a></p>"
        )

    login_target = settings.default_return_url
    relogin_html = ""
    if login_target:
        auth_url = f"/auth/index.php?returnurl={quote(login_target, safe='')}"
        relogin_html = (
            f"<p><a href=\"{escape(auth_url, quote=True)}\">"
            "Run production login redirect"
            "</a></p>"
        )

    return (
        "<html><body style=\"font-family:sans-serif;max-width:1100px;margin:2rem auto;"
        "padding:0 1rem;line-height:1.5;\">"
        "<h1>Code Critic AuthService Debug</h1>"
        "<p>This page confirms the Shibboleth headers received by AuthService and "
        "shows the exact token payload generated for Code Critic.</p>"
        "<table style=\"border-collapse:collapse;width:100%;\">"
        f"{row_html}"
        "</table>"
        f"{callback_html}"
        f"{relogin_html}"
        "</body></html>"
    )


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

    @app.get("/auth/debug/")
    def auth_debug():
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

        identity = _read_identity_headers(request, settings)
        if not identity["eppn"] or not identity["affiliation"]:
            return _missing_identity_response(app, identity, settings)

        payload = _build_payload(
            eppn=identity["eppn"],
            affiliation=identity["affiliation"],
        )
        token = encrypt_payload(payload, settings.aes_key)

        return_url = request.args.get("returnurl", "").strip()
        callback_target = None
        if return_url:
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
            callback_target = f"{_normalize_url(return_url)}/{quote(token, safe=':')}"

        return _render_debug_page(
            settings=settings,
            identity=identity,
            payload=payload,
            token=token,
            callback_target=callback_target,
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

        identity = _read_identity_headers(request, settings)
        if not identity["eppn"] or not identity["affiliation"]:
            return _missing_identity_response(app, identity, settings)

        payload = _build_payload(
            eppn=identity["eppn"],
            affiliation=identity["affiliation"],
        )
        token = encrypt_payload(payload, settings.aes_key)
        target = f"{_normalize_url(return_url)}/{quote(token, safe=':')}"

        app.logger.info(
            "Authenticated eppn=%s idp=%s target=%s",
            identity["eppn"],
            identity["idp"] or "unknown",
            _normalize_url(return_url),
        )
        return redirect(target, code=302)

    return app
