#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APACHE_SOURCE="$SCRIPT_DIR/apache/code-critic-auth.conf"
APACHE_PORTS_SOURCE="$SCRIPT_DIR/apache/ports-https.conf"
APACHE_SERVERNAME_SOURCE="$SCRIPT_DIR/apache/servername.conf"
SHIB_SOURCE_DIR="$SCRIPT_DIR/shibboleth"

APACHE_SITE_NAME="code-critic-auth"
APACHE_SITE_TARGET="/etc/apache2/sites-available/${APACHE_SITE_NAME}.conf"
APACHE_SERVERNAME_TARGET="/etc/apache2/conf-available/code-critic-servername.conf"
APACHE_PORTS_TARGET="/etc/apache2/ports.conf"
SHIB_DIR="/etc/shibboleth"
TLS_CERT_FILE="/etc/ssl/certs/code-critic.nti.tul.cz.crt"
TLS_KEY_FILE="/etc/ssl/private/code-critic.nti.tul.cz.key"

usage() {
    cat <<'EOF'
Usage:
  ./install_apache_shibbo.sh

What it does:
  - installs the Apache HTTPS frontend for Code Critic
  - replaces Apache listeners with the HTTPS layout
  - installs a global ServerName snippet for Apache
  - installs the AuthService Shibboleth templates into /etc/shibboleth
  - enables required Apache modules and the auth site
  - enables ssl and the HTTPS site
  - if the TLS certificate is present:
    - config-tests Apache
    - restarts shibd and apache2
  - if the TLS certificate is not present:
    - installs all config files anyway
    - restarts shibd
    - stops apache2 so the VM does not keep serving the old :8080 config

Assumptions:
  - Apache and Shibboleth SP packages are already installed
  - AuthService is already installed and running on 127.0.0.1:8181
  - cc.net is already running on 127.0.0.1:5000
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
require_command shib-keygen

certs_ready() {
    [[ -f "$TLS_CERT_FILE" && -f "$TLS_KEY_FILE" ]]
}

if [[ ! -d /etc/apache2 ]]; then
    echo "/etc/apache2 does not exist. Apache does not appear to be installed." >&2
    exit 1
fi

if [[ ! -d "$SHIB_DIR" ]]; then
    echo "$SHIB_DIR does not exist. Shibboleth SP does not appear to be installed." >&2
    exit 1
fi

sudo install -m 644 "$APACHE_SOURCE" "$APACHE_SITE_TARGET"
sudo install -m 644 "$APACHE_PORTS_SOURCE" "$APACHE_PORTS_TARGET"
sudo install -m 644 "$APACHE_SERVERNAME_SOURCE" "$APACHE_SERVERNAME_TARGET"
sudo install -m 644 "$SHIB_SOURCE_DIR/shibboleth2.xml" "$SHIB_DIR/shibboleth2.xml"
sudo install -m 644 "$SHIB_SOURCE_DIR/attribute-map.xml" "$SHIB_DIR/attribute-map.xml"
sudo install -m 644 "$SHIB_SOURCE_DIR/metadata-template.xml" "$SHIB_DIR/metadata-template.xml"

if ! sudo test -f "$SHIB_DIR/sp-key.pem" || ! sudo test -f "$SHIB_DIR/sp-cert.pem"; then
    sudo shib-keygen \
        -o "$SHIB_DIR" \
        -h "code-critic.nti.tul.cz" \
        -e "https://code-critic.nti.tul.cz/shibboleth"
fi

sudo a2enmod headers proxy proxy_http shib ssl
sudo a2enconf code-critic-servername
sudo a2dissite 000-default default-ssl >/dev/null 2>&1 || true
sudo a2ensite "$APACHE_SITE_NAME"

sudo systemctl restart shibd

if certs_ready; then
    sudo apache2ctl configtest
    sudo systemctl restart apache2

    echo "Apache/Shibboleth HTTPS frontend installed."
    echo "Site: $APACHE_SITE_TARGET"
    echo "Ports config: $APACHE_PORTS_TARGET"
    echo "Shibboleth config dir: $SHIB_DIR"
    echo
    echo "Useful checks:"
    echo "  sudo systemctl status apache2 --no-pager"
    echo "  sudo systemctl status shibd --no-pager"
    echo "  curl http://127.0.0.1:8181/health"
    echo "  curl -k https://127.0.0.1/Shibboleth.sso/Metadata -H 'Host: code-critic.nti.tul.cz'"
else
    sudo a2dissite "$APACHE_SITE_NAME" >/dev/null 2>&1 || true
    sudo systemctl stop apache2 >/dev/null 2>&1 || true
    sudo systemctl reset-failed apache2 >/dev/null 2>&1 || true

    cat <<EOF
Apache/Shibboleth HTTPS config staged, but Apache was left inactive because TLS files are missing:
  - $TLS_CERT_FILE
  - $TLS_KEY_FILE

Installed:
  Site: $APACHE_SITE_TARGET
  Ports config: $APACHE_PORTS_TARGET
  Shibboleth config dir: $SHIB_DIR

Next steps after the certificate arrives:
  1. Install the certificate and key to the paths above.
  2. Run:
     sudo a2ensite $APACHE_SITE_NAME
     sudo apache2ctl configtest
     sudo systemctl restart apache2
  3. Verify:
     curl -k https://127.0.0.1/Shibboleth.sso/Metadata -H 'Host: code-critic.nti.tul.cz'
EOF
fi
