#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR"

PUBLISH_ROOT="/home/code-critic/projects/publish"
ACTIVE_DIR="$PUBLISH_ROOT/AuthService"
ENV_DIR="/etc/code-critic"
ENV_FILE="$ENV_DIR/authservice.env"
SERVICE_NAME="authservice"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
VERSION_FILE="$SOURCE_DIR/version"
START_SERVICE=0

usage() {
    cat <<'EOF'
Usage:
  ./install_authservice.sh [--start]

What it does:
  - copies AuthService into /home/code-critic/projects/publish
  - reads the release version from the local version file
  - installs into a versioned release directory
  - repoints the stable AuthService symlink
  - creates/updates the Python virtual environment
  - installs Python dependencies
  - installs the systemd unit file
  - optionally starts/restarts the service

Options:
  --start             start/restart the authservice systemd unit after install
  -h, --help          show this help

Notes:
  - The version is always read from ./version.
  - The script creates /etc/code-critic/authservice.env from .env.example only
    if that file does not already exist.
  - The service will not be started if AUTHSERVICE_AES_KEY is still empty.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --start)
            START_SERVICE=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            usage >&2
            exit 1
            ;;
    esac
done

if [[ ! -f "$VERSION_FILE" ]]; then
    echo "Missing version file: $VERSION_FILE" >&2
    exit 1
fi

VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
if [[ -z "$VERSION" ]]; then
    echo "Version file is empty: $VERSION_FILE" >&2
    exit 1
fi

RELEASE_DIR="$PUBLISH_ROOT/AuthService-$VERSION"

copy_release() {
    rm -rf "$RELEASE_DIR"
    mkdir -p "$RELEASE_DIR"

    tar \
        --exclude='.venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='install_authservice.sh' \
        -cf - -C "$SOURCE_DIR" . \
    | tar -xf - -C "$RELEASE_DIR"
}

ensure_active_symlink() {
    if [[ "$RELEASE_DIR" != "$ACTIVE_DIR" ]]; then
        ln -sfn "$RELEASE_DIR" "$ACTIVE_DIR"
    fi
}

ensure_venv() {
    if [[ ! -x "$ACTIVE_DIR/.venv/bin/python" ]]; then
        python3 -m venv "$ACTIVE_DIR/.venv"
    fi

    "$ACTIVE_DIR/.venv/bin/pip" install --upgrade pip
    "$ACTIVE_DIR/.venv/bin/pip" install -r "$ACTIVE_DIR/requirements.txt"
}

install_env_file() {
    sudo mkdir -p "$ENV_DIR"

    if [[ ! -f "$ENV_FILE" ]]; then
        sudo install -m 600 "$ACTIVE_DIR/.env.example" "$ENV_FILE"
        echo "Created $ENV_FILE from .env.example"
        echo "Edit it before starting the service."
    fi
}

install_service_file() {
    sudo install -m 644 "$ACTIVE_DIR/systemd/authservice.service" "$SERVICE_FILE"
    sudo systemctl daemon-reload
}

env_is_ready() {
    sudo test -f "$ENV_FILE" || return 1

    local aes_line
    aes_line="$(sudo grep -E '^AUTHSERVICE_AES_KEY=' "$ENV_FILE" || true)"
    [[ -n "$aes_line" ]] || return 1
    [[ "$aes_line" != "AUTHSERVICE_AES_KEY=" ]] || return 1
}

start_service() {
    if ! env_is_ready; then
        echo "Refusing to start $SERVICE_NAME because $ENV_FILE is not fully configured." >&2
        echo "At minimum, set AUTHSERVICE_AES_KEY before using --start." >&2
        exit 1
    fi

    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl restart "$SERVICE_NAME"
    sudo systemctl status "$SERVICE_NAME" --no-pager
}

if [[ "$START_SERVICE" -eq 1 ]]; then
    install_service_file
    start_service
else
    copy_release
    ensure_active_symlink
    ensure_venv
    install_env_file
    install_service_file

    echo "AuthService installed at: $ACTIVE_DIR"
    echo "Versioned release dir: $RELEASE_DIR"
    echo "Environment file: $ENV_FILE"
    echo "Systemd unit: $SERVICE_FILE"

    cat <<EOF

Next steps:
  1. Edit $ENV_FILE and set AUTHSERVICE_AES_KEY.
  2. Start the service:
     bash $ACTIVE_DIR/install_authservice.sh --start

Useful checks:
  - sudo systemctl status $SERVICE_NAME --no-pager
  - curl http://127.0.0.1:8181/health
EOF
fi
