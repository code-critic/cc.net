#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

RELEASE_ROOT="${RELEASE_ROOT:-$PROJECT_ROOT/publish}"
LATEST_LINK="${LATEST_LINK:-/home/code-critic/.local/bin/cc.latest}"
SERVICE_NAME="${SERVICE_NAME:-cc.service}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:5000/}"

usage() {
    cat <<EOF
Usage:
  $0 <version>
  $0 --list

Examples:
  $0 1.2.25
  $0 1.2.26

Environment overrides:
  RELEASE_ROOT=$RELEASE_ROOT
  LATEST_LINK=$LATEST_LINK
  SERVICE_NAME=$SERVICE_NAME
  LOCAL_URL=$LOCAL_URL
EOF
}

run_systemctl() {
    if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
        systemctl "$@"
    else
        sudo systemctl "$@"
    fi
}

list_releases() {
    find "$RELEASE_ROOT" \
        -mindepth 3 \
        -maxdepth 3 \
        -type f \
        -path "$RELEASE_ROOT/*/www/cc.net" \
        -printf '%h\n' \
        | sed "s#^$RELEASE_ROOT/##; s#/www\$##" \
        | sort -V
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

if [[ "${1:-}" == "--list" || -z "${1:-}" ]]; then
    list_releases
    exit 0
fi

version="$1"
target="$RELEASE_ROOT/$version/www/cc.net"

if [[ ! -x "$target" ]]; then
    echo "Release executable not found or not executable: $target" >&2
    echo >&2
    echo "Available releases:" >&2
    list_releases >&2
    exit 1
fi

previous="$(readlink -f "$LATEST_LINK" 2>/dev/null || true)"

echo "Switching Code Critic release"
echo "  previous: ${previous:-"(none)"}"
echo "  target:   $target"
echo

ln -sfn "$target" "$LATEST_LINK"

echo "Restarting $SERVICE_NAME"
run_systemctl restart "$SERVICE_NAME"

echo
run_systemctl status "$SERVICE_NAME" --no-pager

if command -v curl >/dev/null 2>&1; then
    echo
    echo "Checking $LOCAL_URL"
    curl -fsSI "$LOCAL_URL" | sed -n '1,8p'
fi

echo
echo "Active release: $(readlink -f "$LATEST_LINK")"
