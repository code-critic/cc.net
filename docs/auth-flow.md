# Authentication Flow

## Purpose

This document explains how the current Shibboleth recovery architecture works end to end, starting from the moment a user opens:

- `https://code-critic.nti.tul.cz`

It also includes a compact diagram of the request flow and the responsibilities of Apache, Shibboleth, `AuthService`, and `cc.net`.

## High-Level Architecture

The public and internal components are split like this:

- browser
- Apache on public `:443`
- Shibboleth SP inside Apache
- `cc.net` on `127.0.0.1:5000`
- `AuthService` on `127.0.0.1:8181`

Public hostname:

- `https://code-critic.nti.tul.cz`

Shibboleth SP identity:

- `https://code-critic.nti.tul.cz/shibboleth`

## Compact Diagram

```text
Browser
  |
  v
Apache :443  +  mod_shib
  | \
  |  \-- /Shibboleth.sso/... handled locally by Shibboleth SP
  |
  +-- /auth/...   -> AuthService 127.0.0.1:8181
  +-- /secure/... -> AuthService 127.0.0.1:8181
  +-- /health     -> AuthService 127.0.0.1:8181
  \-- everything else -> cc.net 127.0.0.1:5000
```

## Browser Login Flow

### 1. User opens the site

The user enters:

- `https://code-critic.nti.tul.cz`

in the browser.

### 2. Browser connects to Apache

DNS resolves the hostname to the Code Critic VM.

The browser connects to:

- Apache on port `443`

Apache presents the TLS certificate for:

- `code-critic.nti.tul.cz`

### 3. Apache proxies the main application request

The request for `/` is not a Shibboleth handler path and not an AuthService path.

Apache forwards it to:

- `http://127.0.0.1:5000`

which is the internal `cc.net` service.

### 4. `cc.net` serves the SPA

`cc.net` returns the initial HTML, JavaScript, and CSS for the web application.

The browser loads the SPA.

### 5. The SPA asks who the current user is

The frontend calls:

- `/home/whoami`

That request goes:

- browser -> Apache -> `cc.net`

### 6. `cc.net` checks its local application session

`cc.net` does **not** check Shibboleth directly.

It only checks whether the user already has its own local app session cookie.

Possible outcomes:

- authenticated:
  - `cc.net` returns the user object
- unauthenticated:
  - `cc.net` returns an unauthorized response containing the login redirect URL

### 7. SPA redirects the browser to the login bridge

If unauthenticated, the frontend redirects the browser to:

- `https://code-critic.nti.tul.cz/auth/index.php?returnurl=https://code-critic.nti.tul.cz/home/login`

This URL is generated from backend config, not hardcoded in the SPA.

### 8. Apache protects `/auth/index.php` with Shibboleth

Apache sees that:

- `/auth/index.php`

is a Shibboleth-protected location.

`mod_shib` intercepts the request.

### 9. Shibboleth sends the browser to the TUL IdP

If no Shibboleth session exists yet, the browser is redirected to:

- `https://shibbo.tul.cz/idp/shibboleth`

The user authenticates there.

### 10. IdP returns the browser to the SP

After successful authentication, the IdP returns the browser to the Shibboleth SP on the Code Critic server.

The Shibboleth handlers live under:

- `/Shibboleth.sso/...`

and are handled locally by Apache + `mod_shib`.

### 11. Apache receives trusted user attributes

After the Shibboleth session is established, Apache has trusted identity attributes such as:

- `eppn`
- `affiliation`

### 12. Apache forwards the request to `AuthService`

Apache proxies:

- `/auth/index.php`

to:

- `http://127.0.0.1:8181/auth/index.php`

Before forwarding, Apache injects trusted headers such as:

- `X-Remote-Eppn`
- `X-Remote-Affiliation`
- `X-Remote-Display-Name`
- `X-Remote-Identity-Provider`

### 13. `AuthService` validates the request

`AuthService` checks:

- that the configuration is valid
- that the `returnurl` is on the allowlist
- that the required identity headers are present

### 14. `AuthService` builds the auth payload

It creates a payload containing:

- `eppn`
- `affiliation`
- `datetime`

### 15. `AuthService` encrypts the payload

It encrypts the payload using the same AES key and crypto contract expected by `cc.net`.

This is the compatibility bridge that preserves the old external-login contract.

### 16. `AuthService` redirects back to `cc.net`

It creates:

- `https://code-critic.nti.tul.cz/home/login/<token>`

and returns an HTTP redirect.

### 17. Browser follows the callback

The browser requests:

- `/home/login/<token>`

Apache forwards that request to:

- `cc.net` on `127.0.0.1:5000`

### 18. `cc.net` decrypts the token

`cc.net`:

- decrypts the token
- reconstructs the user
- creates its own local session cookie

### 19. User enters the application

After successful local session creation, `cc.net` redirects the browser into the application, typically to:

- `/courses`

From this point on, normal app requests go through Apache to `cc.net`, and the user stays logged in by the `cc.net` session cookie.

## Logout Flow

### 1. SPA asks `cc.net` to log out

The frontend calls:

- `/home/logout`

`cc.net` clears its local application session cookie.

### 2. SPA asks for logout target

The frontend then obtains the configured logout redirect target from the backend.

That target is:

- `https://code-critic.nti.tul.cz/secure/`

### 3. Browser goes to `/secure/`

Apache proxies:

- `/secure/`

to:

- `AuthService` on `127.0.0.1:8181`

### 4. `AuthService` shows a post-logout landing page

The page explains that the local app session was cleared and offers a link back to login.

This is application logout, not necessarily full IdP single logout.

## Responsibilities By Component

### Browser

- follows redirects
- stores cookies
- loads the SPA
- talks only to the public `https://code-critic.nti.tul.cz` frontend

### Apache

- owns the public hostname
- terminates TLS
- proxies requests to internal services
- hosts `mod_shib`
- protects `/auth/index.php` and `/auth/debug/`

### Shibboleth SP

- speaks SAML with the TUL IdP
- establishes the Shibboleth session
- provides trusted identity attributes to Apache

### `AuthService`

- reads trusted identity headers
- validates `returnurl`
- builds the compatibility payload
- encrypts the payload for `cc.net`
- redirects to `/home/login/<token>`

### `cc.net`

- serves the main application
- owns the local application session
- consumes `/home/login/<token>`
- does not implement Shibboleth directly

## Why This Architecture Exists

`cc.net` still expects the old bridge-style login contract:

- external auth bridge authenticates user
- bridge creates encrypted token
- browser is redirected to `/home/login/<token>`
- `cc.net` creates its own local session

So `AuthService` exists as the translation bridge between:

- Shibboleth identity flow
- existing `cc.net` token login flow

## Important Operational Notes

- `cc.net` must stay reachable on:
  - `127.0.0.1:5000`
- `AuthService` must stay reachable on:
  - `127.0.0.1:8181`
- Apache must own the public frontend on:
  - `:443`
- `/Shibboleth.sso/...` must stay local to Apache and must not be proxied to either backend

## Related Files

- [cc_shibbo_plan.md](/home/code-critic/projects/cc.net/cc_shibbo_plan.md:1)
- [status.md](/home/code-critic/projects/cc.net/docs/status.md:1)
- [code-critic-auth.conf](/home/code-critic/projects/cc.net/AuthService/apache/code-critic-auth.conf:1)
- [shibboleth2.xml](/home/code-critic/projects/cc.net/AuthService/shibboleth/shibboleth2.xml:1)
