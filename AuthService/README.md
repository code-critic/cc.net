# AuthService

Minimal Python sidecar that replaces the old external `flowdb` login bridge for `cc.net`.

It is designed to run on the same VM as `cc.net` and sit behind Apache + Shibboleth SP:

1. Apache protects `/auth/index.php` with Shibboleth.
2. Apache forwards a small set of trusted identity headers to this app.
3. This app builds the JSON payload expected by `cc.net`.
4. This app encrypts the payload using the shared `AESKey`.
5. This app redirects the user to `cc.net` callback:
   `http://code-critic.example.org/home/login/<token>`

## Why this exists

`cc.net` does not implement Shibboleth directly. It only expects an encrypted callback token. The relevant code is:

- [CodeCritic/Controllers/HomeController.cs](/home/jb/workspace/cc.net/CodeCritic/Controllers/HomeController.cs:48)
- [CodeCritic/Services/CryptoService.cs](/home/jb/workspace/cc.net/CodeCritic/Services/CryptoService.cs:118)

## Implemented here

- Flask application with routes:
  - `GET /auth/index.php`
  - `GET /auth/debug/`
  - `GET /secure/`
  - `GET /health`
- AES-CBC encryption compatible with the current `.NET` code
- strict allowlist for `returnurl`
- browser debug page for Shibboleth attribute and token inspection
- CLI helper for decrypting generated tokens
- Apache reverse-proxy template
- Shibboleth SP config template for eduID.cz federation
- systemd unit template
- environment file template without secrets

## Layout

- `auth_service/`
  - application code
- `apache/`
  - Apache vhost snippet
- `shibboleth/`
  - SP templates
- `systemd/`
  - service unit

## Deployment model

The current phase 1 deployment is:

- `cc.net` remains on public `:80`
- Apache + Shibboleth SP on `:8080`
- Shibboleth SP integrated with Apache
- `AuthService` on `127.0.0.1:8181`
- callback back to `http://code-critic.nti.tul.cz/home/login`

This keeps the current `cc.net` process unchanged while moving only the auth bridge onto a dedicated Shibboleth-aware listener.

The later target deployment is:

- Apache in front of the whole site
- `cc.net` moved behind localhost
- HTTPS everywhere
- final public URLs without the temporary `:8080` auth port

## Configuration

Copy `.env.example` to a deployment-only environment file, for example:

- `/etc/code-critic/authservice.env`

Key settings:

- `AUTHSERVICE_AES_KEY`
- `AUTHSERVICE_ALLOWED_RETURN_URLS`
- `AUTHSERVICE_DEFAULT_RETURN_URL`
- `AUTHSERVICE_SUPPORT_EMAIL`

The AES key must be the same value currently used by `cc.net` in deployed `appsettings.secret.json`.

### What `AUTHSERVICE_AES_KEY` is for

`AUTHSERVICE_AES_KEY` is the shared secret used to encrypt the auth payload that `cc.net` receives on:

- `/home/login/<token>`

It is not a new independent secret for the bridge. For this migration it must exactly match the AES key already used by the deployed `cc.net` instance, otherwise:

- `AuthService` will generate tokens
- `cc.net` will fail to decrypt them
- login will break even if Shibboleth succeeds

Current deployment evidence shows the existing `cc.net` key is stored in:

- `projects/publish/1.2.24/www/appsettings.secret.json`

For phase 1, that same value should be copied into:

- `/etc/code-critic/authservice.env`

Do not generate a fresh key for this migration unless you also rotate `cc.net` to use the same new key at the same time.

If you ever do need to generate a replacement key in the future, it must be:

- ASCII only
- 16, 24, or 32 bytes long

but again, for the current recovery work the correct source is the existing deployed `cc.net` secret.

## Installation on the VM

The repository contains a helper script that installs `AuthService` into the agreed publish path, creates the Python virtual environment, installs dependencies, installs the `systemd` unit, and optionally starts the service.

The script always reads the release version from:

- `AuthService/version`

### Install or update the release

```bash
cd /home/code-critic/projects/cc.net/AuthService
bash install_authservice.sh
```

This creates:

- versioned release directory:
  - `/home/code-critic/projects/publish/AuthService-<version>`
- stable active path:
  - `/home/code-critic/projects/publish/AuthService`
- environment file if missing:
  - `/etc/code-critic/authservice.env`
- systemd unit:
  - `/etc/systemd/system/authservice.service`

### Edit the environment file

```bash
sudoedit /etc/code-critic/authservice.env
```

At minimum set:

```dotenv
AUTHSERVICE_AES_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
AUTHSERVICE_ALLOWED_RETURN_URLS=http://code-critic.nti.tul.cz/home/login
AUTHSERVICE_DEFAULT_RETURN_URL=http://code-critic.nti.tul.cz/home/login
AUTHSERVICE_SUPPORT_EMAIL=pavel.exner@tul.cz
```

### Start the service

```bash
cd /home/code-critic/projects/cc.net/AuthService
bash install_authservice.sh --start
```

### Useful checks

```bash
sudo systemctl status authservice --no-pager
curl http://127.0.0.1:8181/health
```

## Expected Shibboleth attributes

The app expects Apache to pass:

- `X-Remote-Eppn`
- `X-Remote-Affiliation`

Optional:

- `X-Remote-Display-Name`
- `X-Remote-Identity-Provider`

`X-Remote-Affiliation` should contain scoped affiliations such as:

- `member@tul.cz;employee@tul.cz;student@tul.cz`

That matches the current `cc.net` payload model better than plain `eduPersonAffiliation`.

## Independent bridge testing

To verify Shibboleth and token generation without involving `cc.net`:

- open `/auth/debug/` behind Shibboleth
  - shows received Shibboleth attributes
  - shows the encrypted token
  - shows the decrypted payload again for visual inspection
  - accepts an optional `returnurl` query parameter and shows the final callback URL
- run the CLI helper:

```bash
python3 decrypt_token.py '<token>'
```

If `AUTHSERVICE_AES_KEY` is not loaded in the shell environment, you can override it:

```bash
python3 decrypt_token.py '<token>' --aes-key '<AUTHSERVICE_AES_KEY>'
```

For the agreed phase 1 browser flow, the intended URLs are:

- auth login entrypoint:
  - `http://code-critic.nti.tul.cz:8080/auth/index.php`
- auth debug page:
  - `http://code-critic.nti.tul.cz:8080/auth/debug/`
- auth logout landing page:
  - `http://code-critic.nti.tul.cz:8080/secure/`
- `cc.net` callback:
  - `http://code-critic.nti.tul.cz/home/login`

## Online references used

These templates are based on:

- eduID.cz technical overview:
  - https://www.eduid.cz/en/tech/summary
- eduID.cz Shibboleth SP guide:
  - https://www.eduid.cz/cs/tech/sp/shibboleth
- eduID.cz metadata publication:
  - https://www.eduid.cz/en/tech/metadata-publication
- TUL public site for organization details:
  - https://www.tul.cz/

Inference:

- I did not find a public TUL-specific Shibboleth SP guide.
- The federation-facing templates therefore use standard eduID.cz SP configuration and TUL organization placeholders.
- The final entity registration and attribute release still need confirmation from TUL or federation administrators.

## Information still needed from you

1. Public hostname for the new auth endpoint.
   Current working decision:
   - `code-critic.nti.tul.cz`

2. Canonical callback URL to allow.
   Current working decision:
   - `http://code-critic.nti.tul.cz/home/login`

3. Contact email to publish in SP metadata.
   Current working decision:
   - `pavel.exner@tul.cz`

4. Whether the service should be registered in `eduID.cz` federation.
   This is the default assumption in the templates.

5. Whether TUL requires a particular IdP selection flow.
   Current template uses the eduID.cz discovery service.

6. Whether TUL releases `eduPersonPrincipalName` and `eduPersonScopedAffiliation` to new SPs by default.

7. Paths where you want the deployed files installed on the VM.
   Current working decision:
   - `/home/code-critic/projects/publish/AuthService`
   - `/etc/code-critic/authservice.env`
   - `/etc/shibboleth/*`

8. Which Unix user should run the service.
   Current working decision:
   - `code-critic`

9. Which SP entity ID should be used.
   Current working decision:
   - `https://code-critic.nti.tul.cz/shibboleth`

## Notes

- No secrets are committed here.
- No Shibboleth keys or certs are generated in the repository.
- Backend access should remain bound to localhost only.
- The phase 1 templates intentionally target HTTP on `:8080` for auth only.
- The long-term SP identity remains `https://code-critic.nti.tul.cz/shibboleth` even though phase 1 uses a temporary auth port.
