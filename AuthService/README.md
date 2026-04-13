# AuthService

Minimal Python sidecar that replaces the old external `flowdb` login bridge for `cc.net`.

It is designed to run on the same VM as `cc.net` and sit behind Apache + Shibboleth SP:

1. Apache protects `/auth/index.php` with Shibboleth.
2. Apache forwards a small set of trusted identity headers to this app.
3. This app builds the JSON payload expected by `cc.net`.
4. This app encrypts the payload using the shared `AESKey`.
5. This app redirects the user to `cc.net` callback:
   `https://code-critic.example.org/home/login/<token>`

## Why this exists

`cc.net` does not implement Shibboleth directly. It only expects an encrypted callback token. The relevant code is:

- [CodeCritic/Controllers/HomeController.cs](/home/jb/workspace/cc.net/CodeCritic/Controllers/HomeController.cs:48)
- [CodeCritic/Services/CryptoService.cs](/home/jb/workspace/cc.net/CodeCritic/Services/CryptoService.cs:118)

## Implemented here

- Flask application with routes:
  - `GET /auth/index.php`
  - `GET /secure/`
  - `GET /health`
- AES-CBC encryption compatible with the current `.NET` code
- strict allowlist for `returnurl`
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

The intended deployment is:

- Apache on public `:443`
- Shibboleth SP integrated with Apache
- `AuthService` on `127.0.0.1:8181`
- `cc.net` on its existing local port

This keeps Shibboleth state and trust decisions in Apache/SP and keeps the Python app small.

## Configuration

Copy `.env.example` to a deployment-only environment file, for example:

- `/etc/code-critic/authservice.env`

Key settings:

- `AUTHSERVICE_AES_KEY`
- `AUTHSERVICE_ALLOWED_RETURN_URLS`
- `AUTHSERVICE_DEFAULT_RETURN_URL`
- `AUTHSERVICE_SUPPORT_EMAIL`

The AES key must be the same value currently used by `cc.net` in deployed `appsettings.secret.json`.

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
   Example: `code-critic.nti.tul.cz`

2. Canonical callback URL to allow.
   Example: `https://code-critic.nti.tul.cz/home/login`

3. Contact email to publish in SP metadata.
   Example: admin or service owner address.

4. Whether the service should be registered in `eduID.cz` federation.
   This is the default assumption in the templates.

5. Whether TUL requires a particular IdP selection flow.
   Current template uses the eduID.cz discovery service.

6. Whether TUL releases `eduPersonPrincipalName` and `eduPersonScopedAffiliation` to new SPs by default.

7. Paths where you want the deployed files installed on the VM.
   Current templates assume:
   - `/opt/code-critic/AuthService`
   - `/etc/code-critic/authservice.env`
   - `/etc/shibboleth/*`

8. Which Unix user should run the service.
   Current template uses `www-data` as a placeholder.

## Notes

- No secrets are committed here.
- No Shibboleth keys or certs are generated in the repository.
- Backend access should remain bound to localhost only.
- The current React frontend still hardcodes the dead `flowdb` URL, so `cc.net` itself also needs a small patch after this service is deployed.
