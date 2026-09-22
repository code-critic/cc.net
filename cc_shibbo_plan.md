# Code Critic Shibboleth Recovery Plan

## Goal

Restore Code Critic login by replacing the dead `flowdb` authentication bridge with `cc.net/AuthService`, while keeping the current `cc.net` application contract as stable as possible.

The current minimum acceptable working state is:

- Apache becomes the public HTTPS frontend for `code-critic.nti.tul.cz`
- Shibboleth SP is exposed only on `https://code-critic.nti.tul.cz/shibboleth`
- `cc.net` runs as an internal upstream behind Apache
- `AuthService` runs on the same VM on localhost behind Apache
- the callback contract to `cc.net` remains unchanged

This means the earlier temporary HTTP auth-only design is no longer the active target.

## Why the Plan Changed

The earlier recovery path attempted to keep `cc.net` public on HTTP and expose Apache + Shibboleth only on a temporary auth listener:

- `http://code-critic.nti.tul.cz:8080/shibboleth`

That path was implemented and validated locally up to the TUL IdP boundary, but registration of that temporary SP was rejected.

The IdP response was clear in substance:

- central authentication requires a secured public frontend
- non-SSL is acceptable only for internal hops behind the proxy

Operational consequence:

- the temporary HTTP `:8080` SP should be treated as abandoned for production registration
- the recovery path must move directly to the HTTPS-fronted deployment

## Admin and Contact Person

If providing a personal contact is required, use:

- Pavel Exner, `pavel.exner@tul.cz`

## Main Sources and Evidence

This plan is based on current repository work, current deployment evidence, historical `flowdb` evidence, and the latest AuthService handoff summary.

### Current `cc.net` sources

These describe what the current application expects today.

- `projects/cc.net/CodeCritic/Controllers/HomeController.cs`
  - current login redirect behavior
  - current `returnurl` usage
  - current `/home/login/<token>` callback endpoint
- `projects/cc.net/CodeCritic/Services/CryptoService.cs`
  - current AES contract used by `cc.net`
  - this is the real compatibility target for the replacement bridge
- `projects/cc.net/CodeCritic/_client/src/auth.ts`
  - SPA login redirect behavior
- `projects/cc.net/CodeCritic/_client/src/components/NavMenu.tsx`
  - SPA logout redirect behavior
- `projects/cc.net/AuthService/`
  - new bridge implementation and deployment templates
- `projects/cc.net/AuthService/COLLEAGUE_STATUS_SUMMARY.md`
  - latest handoff summary of what was implemented and verified

### Current deployment evidence

These describe the real running `cc.net` deployment.

- `projects/publish/1.2.24/www/appsettings.json`
  - current deployed `LoginUrl`
  - current deployed `ReturnUrl`
- `projects/publish/1.2.24/www/appsettings.secret.json`
  - deployed `AESKey`
- `projects/publish/1.2.24/www/app.log`
  - evidence that users are still being redirected to dead `flowdb`
- live host inspection results gathered during planning
  - `cc.service` runs `cc.net` directly
  - there was no active public HTTPS frontend in front of the app
  - Docker is not used to host the web app, only worker and monitoring services

### Historical `flowdb` evidence

This is critical because it shows what the old auth bridge actually did.

- `projects/flowdb-essential/README.md`
  - curated overview of the old stack
- `projects/flowdb-essential/SERVICE-EVIDENCE.md`
  - evidence of how the old system was started and wired
- `projects/flowdb-essential/var/www/html/secure/index.php`
  - the old PHP Shibboleth bridge
- `projects/flowdb-essential/etc/apache2/sites-available/shib-sp.conf`
  - old Apache Shibboleth protection rules
- `projects/flowdb-essential/etc/shibboleth/shibboleth2.xml`
  - old SP configuration and IdP/entity wiring
- `projects/flowdb-essential/home/automate/codecritic/src/www/auth.py`
  - old Python callback consumer
- `projects/flowdb-essential/home/automate/codecritic/src/utils/crypto.py`
  - old Python crypto behavior
- `projects/codecritic/`
  - full old repository for additional reference when needed

## What the Historical Evidence Proves

The recovered `flowdb` data confirms that the old auth system was conceptually simple.

Historical flow:

1. Apache protected `/secure` using Shibboleth.
2. Shibboleth exposed attributes such as `eppn` and `affiliation`.
3. PHP read those attributes.
4. PHP created a small JSON payload:
   - `eppn`
   - `affiliation`
   - `datetime`
5. PHP encrypted the payload.
6. PHP redirected the browser to `/login/<token>` on the application side.
7. The application decrypted the token and created its local session.

Important conclusion:

- the old `flowdb` bridge was small and only served as an auth handoff
- this strongly supports the design of replacing it with a similarly small bridge

Important caution:

- the old PHP bridge was talking to the old Python `codecritic`, not to current `cc.net`
- therefore we should copy the old behavioral contract, not blindly copy all old implementation details

Specifically:

- preserve the payload shape
- preserve the use of Shibboleth-supplied identity attributes
- follow current `cc.net` crypto behavior, not old PHP/Python crypto behavior

## Current Recovery Architecture

### High-level architecture

The active recovery design is now HTTPS-fronted from the beginning.

- Apache listens publicly on `https://code-critic.nti.tul.cz`
- Apache terminates TLS for the public frontend
- Apache + `mod_shib` own the Shibboleth handler endpoints and protected auth routes
- Apache proxies normal application traffic to internal `cc.net`
- Apache proxies `/auth/...` and `/secure/` to internal `AuthService`
- `cc.net` and `AuthService` remain separate internal processes

Concrete runtime shape:

- browser -> Apache `:443`
- Apache + `mod_shib` own `/Shibboleth.sso/...` and SP-facing paths
- Apache -> `cc.net` on localhost
- Apache -> `AuthService` on `127.0.0.1:8181`

### Deployment consequence

Once Apache owns `code-critic.nti.tul.cz:443`, browser-facing traffic for Code Critic also goes through Apache.

This does **not** require a major `cc.net` application redesign. It means only:

- Apache becomes the public frontend
- `cc.net` moves behind a reverse proxy operationally
- the application contract itself stays the same

Internal non-TLS hops remain acceptable:

- Apache -> `cc.net`
- Apache -> `AuthService`

### `cc.net` behavior to keep

The application contract should remain unchanged.

- keep `/home/login/<token>` as the callback endpoint
- keep local cookie and session creation inside `cc.net`
- keep the backend auth model where `cc.net` receives an encrypted token from an external login service

### `AuthService` behavior

`AuthService` acts as the replacement bridge for `flowdb`.

Required behavior:

- `GET /auth/index.php`
  - requires Shibboleth-authenticated access
  - validates `returnurl`
  - reads forwarded Shibboleth identity attributes
  - builds payload:
    - `eppn`
    - `affiliation`
    - `datetime`
  - encrypts the payload using current `cc.net` crypto compatibility
  - redirects to `returnurl/<token>`
- `GET /secure/`
  - landing page after logout
  - should allow re-login without involving `cc.net`
- `GET /health`
  - unprotected health check
- `GET /auth/debug/`
  - Shibboleth-protected browser debug page for rollout and troubleshooting

### Auth bridge test mode

An independent test path is required so the auth bridge can be verified without depending on the full `cc.net` flow.

The browser test path should:

- be protected by Shibboleth
- show the received identity values
- show the generated token
- decrypt the token and show the resulting payload again
- support visual verification during rollout and troubleshooting

The CLI helper should:

- accept a token
- decrypt it with the configured AES key
- print the decoded JSON payload

### Frontend changes required in `cc.net`

Even if backend config is updated, the SPA must not hardcode the old `flowdb` host.

Required changes:

- `CodeCritic/_client/src/auth.ts`
  - use the redirect returned by backend `203 UnauthorizedObject`
- `CodeCritic/_client/src/components/NavMenu.tsx`
  - use the logout redirect returned by backend configuration

These changes are already valid for the HTTPS-fronted design and remain required.

## Public URL Shape

The public browser-facing URLs should now be:

- SP entity ID:
  - `https://code-critic.nti.tul.cz/shibboleth`
- metadata URL:
  - `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
- auth login entrypoint:
  - `https://code-critic.nti.tul.cz/auth/index.php`
- auth debug page:
  - `https://code-critic.nti.tul.cz/auth/debug/`
- auth logout landing page:
  - `https://code-critic.nti.tul.cz/secure/`
- `cc.net` callback endpoint:
  - `https://code-critic.nti.tul.cz/home/login`

Configured application values should therefore become:

- `LoginUrl = https://code-critic.nti.tul.cz/auth/index.php`
- `ReturnUrl = https://code-critic.nti.tul.cz/home/login`
- `LogoutUrl = https://code-critic.nti.tul.cz/secure/`

## Shibboleth SP Decision

Shibboleth SP will be installed directly on the `code-critic` VM and integrated with Apache on the final HTTPS frontend.

Protected browser-facing routes:

- `/auth/index.php`
- `/auth/debug/`

Unprotected browser-facing routes:

- `/health`
- `/secure/`

Initial required Shibboleth attributes:

- `eppn`
- `affiliation`

Configuration sources to use during implementation:

- recovered old Apache protection rules in `projects/flowdb-essential/etc/apache2/sites-available/shib-sp.conf`
- recovered old SP config in `projects/flowdb-essential/etc/shibboleth/shibboleth2.xml`
- current `AuthService` Shibboleth template in `projects/cc.net/AuthService/shibboleth/shibboleth2.xml`
- current `AuthService` attribute map in `projects/cc.net/AuthService/shibboleth/attribute-map.xml`

## Registration and Trust Setup

The Shibboleth registration request should now target the final HTTPS SP only.

Required SP identity:

- `https://code-critic.nti.tul.cz/shibboleth`

Required metadata URL:

- `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`

Technical contact:

- `pavel.exner@tul.cz`

The earlier temporary HTTP SP remains relevant only as historical background:

- `http://code-critic.nti.tul.cz:8080/shibboleth`

That path was useful for local validation, but it is no longer the active production design.

## What Was Already Implemented

The repository already contains substantial work that remains applicable.

Implemented in `AuthService`:

- minimal Flask service
- `GET /auth/index.php`
- `GET /auth/debug/`
- `GET /secure/`
- `GET /health`
- AES-CBC encryption compatible with current `cc.net`
- env-based configuration
- browser debug page
- CLI decrypt helper
- systemd unit template
- install script

Implemented in `cc.net`:

- frontend login flow no longer depends on hardcoded `flowdb`
- frontend logout flow no longer depends on hardcoded `flowdb`
- backend support for computed login and logout redirects

Historically attempted and validated locally:

- Apache + Shibboleth on temporary HTTP `:8080`
- direct TUL IdP configuration
- local metadata loading
- SP keypair generation
- `AuthService` behind Apache

That earlier work still helps as operational experience, but it should not remain the active public deployment target.

## Deployment Work Required

Apache must:

- serve a TLS certificate for `code-critic.nti.tul.cz`
- expose the Shibboleth SP on the final HTTPS host
- serve `/Shibboleth.sso/...`
- proxy `/auth/` and `/secure/` to `AuthService`
- proxy application paths to `cc.net`

`cc.net` must:

- run as an internal upstream instead of directly owning the public frontend
- continue to accept `/home/login/<token>` callbacks
- use the final HTTPS `LoginUrl`, `ReturnUrl`, and `LogoutUrl`

`AuthService` must:

- remain on localhost
- continue using the deployed `AESKey` shared with `cc.net`
- keep allowlist validation for `returnurl`

## Test Plan

- confirm Apache answers on `https://code-critic.nti.tul.cz`
- confirm Shibboleth metadata is reachable at `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
- confirm protected auth entrypoint is `https://code-critic.nti.tul.cz/auth/index.php`
- confirm `/auth/debug/` works behind Shibboleth on the HTTPS frontend
- confirm unauthenticated `cc.net` access still yields a backend-provided redirect to the HTTPS auth entrypoint
- confirm successful IdP login redirects to `https://code-critic.nti.tul.cz/home/login/<token>`
- confirm `cc.net` creates its local session after token callback
- confirm logout clears the app session and redirects to `https://code-critic.nti.tul.cz/secure/`
- confirm no public browser flow depends on plain HTTP `:8080`

## Decisions Already Made

- keep current `cc.net` backend auth contract unchanged
- replace dead `flowdb` with `cc.net/AuthService`
- preserve payload fields:
  - `eppn`
  - `affiliation`
  - `datetime`
- keep crypto compatibility aligned with current `cc.net`
- keep the SPA changes that remove hardcoded `flowdb`
- keep independent auth test tooling:
  - browser debug page
  - CLI decrypt helper
- treat the HTTP `:8080` SP as rejected for production use
- move directly to the HTTPS-fronted Apache deployment

## Open Items Still Needed

- final Apache TLS certificate source and installation method
- final Apache virtual host layout for:
  - app proxying
  - auth proxying
  - Shibboleth handler endpoints
- final internal bind address and port for `cc.net`
- final deployed `LoginUrl`, `ReturnUrl`, and `LogoutUrl` update in production config
- final IdP registration and trust confirmation for the HTTPS SP
- final browser-debug endpoint exposure policy:
  - temporary rollout aid only
  - or kept available behind Shibboleth for ongoing diagnostics

## Implementation Order

Recommended execution order:

1. Update the deployment plan and registration request to the HTTPS SP identity.
2. Put Apache in front of the public host with TLS enabled.
3. Move `cc.net` behind Apache onto an internal listener.
4. Expose Shibboleth SP on the final HTTPS frontend.
5. Proxy `/auth/...` and `/secure/` to `AuthService`.
6. Update deployed `cc.net` configuration to the final HTTPS URLs.
7. Verify `/auth/debug/` and metadata independently.
8. Verify full login flow through `cc.net`.

## Practical Principle

The guiding principle for this recovery is:

- copy the old `flowdb` bridge only where it defines the real auth contract
- use current `cc.net` as the source of truth for crypto compatibility and callback behavior
- accept Apache as the public HTTPS frontend
- keep the first production-capable recovery step as small as possible
- avoid unnecessary `cc.net` application redesign while moving it behind the reverse proxy operationally
