#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APACHE_SOURCE="$SCRIPT_DIR/apache/code-critic-auth.conf"
APACHE_PORTS_SOURCE="$SCRIPT_DIR/apache/ports-phase1.conf"
APACHE_SERVERNAME_SOURCE="$SCRIPT_DIR/apache/servername.conf"
SHIB_SOURCE_DIR="$SCRIPT_DIR/shibboleth"

APACHE_SITE_NAME="code-critic-auth"
APACHE_SITE_TARGET="/etc/apache2/sites-available/${APACHE_SITE_NAME}.conf"
APACHE_SERVERNAME_TARGET="/etc/apache2/conf-available/code-critic-servername.conf"
SHIB_DIR="/etc/shibboleth"

usage() {
    cat <<'EOF'
Usage:
  ./install_apache_shibbo_phase1.sh

What it does:
  - installs the phase-1 Apache :8080 auth vhost
  - replaces Apache port listeners with the phase-1 :8080-only layout
  - installs a global ServerName snippet for Apache
  - installs the AuthService Shibboleth templates into /etc/shibboleth
  - enables required Apache modules and the auth site
  - disables the default Apache :80 sites
  - config-tests Apache
  - restarts apache2 and shibd

Assumptions:
  - Apache and Shibboleth SP packages are already installed
  - AuthService is already installed and running on 127.0.0.1:8181
  - you are intentionally deploying the temporary HTTP :8080 auth listener
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

require_command() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Missing required command: $cmd" >&2
        exit 1
    fi
}

require_command sudo
require_command a2enmod
require_command a2ensite
require_command apache2ctl
require_command systemctl

if [[ ! -d /etc/apache2 ]]; then
    echo "/etc/apache2 does not exist. Apache does not appear to be installed." >&2
    exit 1
fi

if [[ ! -d "$SHIB_DIR" ]]; then
    echo "$SHIB_DIR does not exist. Shibboleth SP does not appear to be installed." >&2
    exit 1
fi

sudo install -m 644 "$APACHE_SOURCE" "$APACHE_SITE_TARGET"
sudo install -m 644 "$APACHE_PORTS_SOURCE" /etc/apache2/ports.conf
sudo install -m 644 "$APACHE_SERVERNAME_SOURCE" "$APACHE_SERVERNAME_TARGET"
sudo install -m 644 "$SHIB_SOURCE_DIR/shibboleth2.xml" "$SHIB_DIR/shibboleth2.xml"
sudo install -m 644 "$SHIB_SOURCE_DIR/attribute-map.xml" "$SHIB_DIR/attribute-map.xml"
sudo install -m 644 "$SHIB_SOURCE_DIR/metadata-template.xml" "$SHIB_DIR/metadata-template.xml"

sudo a2enmod headers proxy proxy_http shib
sudo a2enconf code-critic-servername
sudo a2dissite 000-default default-ssl >/dev/null 2>&1 || true
sudo a2ensite "$APACHE_SITE_NAME"

sudo apache2ctl configtest
sudo systemctl restart shibd
sudo systemctl restart apache2

echo "Apache/Shibboleth phase-1 auth listener installed."
echo "Site: $APACHE_SITE_TARGET"
echo "Shibboleth config dir: $SHIB_DIR"
echo
echo "Useful checks:"
echo "  sudo systemctl status apache2 --no-pager"
echo "  sudo systemctl status shibd --no-pager"
echo "  curl http://127.0.0.1:8080/health"
