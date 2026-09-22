# Auth Replacement Plan

## Goal

Replace the dead external `flowdb` authentication endpoint with a minimal Python app deployed on the same virtual server as `cc.net`, while keeping the existing `cc.net` login callback contract unchanged.

## Current Authentication Model

`cc.net` does not implement Shibboleth, SAML, or OIDC itself.

Instead:

1. Unauthenticated users are redirected to an external login URL.
2. That external service authenticates the user.
3. The external service builds a JSON payload with user identity data.
4. The payload is AES-encrypted using the shared `AESKey`.
5. The external service redirects the browser to:

   `/home/login/<encrypted-token>`

6. `cc.net` decrypts the token and creates its own local cookie session.

## Minimal Replacement Architecture

Use a tiny Python sidecar service on the same VM, fronted by the same web server.

- `cc.net` remains the main application.
- Apache + Shibboleth protects the new Python login endpoint.
- The Python app reads Shibboleth-provided attributes from the request.
- The Python app converts those attributes into the encrypted callback token expected by `cc.net`.

Recommended public endpoints:

- `/auth/index.php?returnurl=...`
- `/secure/`
- `/health`

Recommended internal service:

- Python app bound to `127.0.0.1:<port>`
- Apache reverse-proxies `/auth/` and `/secure/` to that port

## Implementation Plan

### 1. Confirm deployment constraints

- Confirm whether the current front web server is Apache or Nginx.
- Confirm whether Shibboleth SP (`mod_shib`) is already installed.
- Confirm the current canonical public URL of Code Critic.
- Extract the current `AESKey`.

### 2. Implement a tiny Python service

Use Flask for the first version.

Required behavior:

- `GET /auth/index.php`
  - require Shibboleth-authenticated access
  - validate `returnurl`
  - read Shibboleth attributes such as `eppn` and affiliation
  - build payload:
    - `eppn`
    - `affiliation`
    - `datetime`
  - encrypt payload exactly like `cc.net`
  - redirect to `returnurl/<token>`

- `GET /secure/`
  - simple landing page after logout, or redirect back to login

- `GET /health`
  - return `200 OK`

### 3. Match the crypto contract exactly

The replacement service must be compatible with `CodeCritic/Services/CryptoService.cs`:

- AES-CBC
- key = `AESKey`
- IV = `AESKey`
- zero padding
- base64 output
- token must stay URL-path compatible
- preserve compatibility with the historical `:` / `/` substitution

### 4. Secure redirect handling

- only allow known `returnurl` values
- reject arbitrary external URLs
- reject requests missing required Shibboleth attributes
- log enough detail for debugging without leaking secrets

### 5. Deploy on the same VM

- add a `systemd` service for the Python app
- reverse-proxy `/auth/` and `/secure/` through Apache
- protect only the login endpoint with Shibboleth
- keep `/health` unprotected

### 6. Update `cc.net` configuration

Set:

- `LoginUrl` to the new local endpoint
- `ReturnUrl` to the current `cc.net` callback endpoint

Likely values:

- `LoginUrl = https://<host>/auth/index.php`
- `ReturnUrl = https://<host>/home/login`

### 7. Patch the frontend

The React frontend currently hardcodes the dead `flowdb` URL for both login and logout. That must be changed.

Needed repo changes:

- `CodeCritic/_client/src/auth.ts`
- `CodeCritic/_client/src/components/NavMenu.tsx`

Preferred behavior:

- use the redirect URL returned by backend `203 UnauthorizedObject`
- do not hardcode the auth host in the SPA

### 8. Verify end-to-end

- unauthenticated request redirects to `/auth/index.php`
- Shibboleth login succeeds
- Python app redirects to `/home/login/<token>`
- `cc.net` creates `CC.Cookie`
- logout clears the cookie and returns to `/secure/`
- invalid token and invalid `returnurl` fail safely

## Exact Paths To Copy From Current Deployment

Copy these from the current production VM before making changes.

### Essential app configuration

- deployed `cc.net` release directory
  - the active target of `/home/jan-hybs/.local/bin/cc.latest`
- active `appsettings.json`
- active `appsettings.secret.json`
- `/etc/systemd/system/cc.service`

### Likely current application paths

Based on repository deployment scripts, these are the most likely paths:

- `/home/jan-hybs/.local/bin/cc.latest`
- `/home/jan-hybs/projects/cc/publish/<version>/www/appsettings.json`
- `/home/jan-hybs/projects/cc/publish/<version>/www/appsettings.secret.json`
- `/etc/systemd/system/cc.service`

If the symlink exists, resolve and copy the real target too.

### Web server and Shibboleth configuration

Copy whichever of these exist on the VM:

- `/etc/apache2/sites-enabled/*`
- `/etc/apache2/sites-available/*`
- `/etc/apache2/conf-enabled/*`
- `/etc/apache2/conf-available/*`
- `/etc/apache2/mods-enabled/shib*`
- `/etc/apache2/mods-available/shib*`
- `/etc/shibboleth/shibboleth2.xml`
- `/etc/shibboleth/attribute-map.xml`
- `/etc/shibboleth/attribute-policy.xml`
- `/etc/shibboleth/*.pem`
- `/etc/shibboleth/*.key`
- `/var/log/shibboleth/*`

If Nginx is used instead of Apache, copy:

- `/etc/nginx/nginx.conf`
- `/etc/nginx/sites-enabled/*`
- `/etc/nginx/sites-available/*`
- `/etc/nginx/conf.d/*`

### Application data and runtime dependencies

These are not auth-specific, but they matter if you need to reproduce the deployment:

- course root from `CourseDir`
- config root from `ConfigDir`
- Docker image names and runtime options from deployed app settings
- any helper scripts or wrapper units used by the web server or service owner

Expected defaults from the repository:

- `CourseDir = /home/jan-hybs/projects/codecritic/courses`
- `ConfigDir = /home/jan-hybs/projects/cc.net/cfg`

### Logs useful for migration debugging

- `app.log` in the active `www` directory
- journal for `cc.service`
- Apache access/error logs
- Shibboleth logs

## Exact Command-Friendly Path Checklist

If you want one compact checklist to archive from the current machine, start with:

- `/home/jan-hybs/.local/bin/cc.latest`
- `/etc/systemd/system/cc.service`
- `/home/jan-hybs/projects/cc/publish/`
- `/home/jan-hybs/projects/codecritic/courses/`
- `/home/jan-hybs/projects/cc.net/cfg/`
- `/etc/apache2/`
- `/etc/shibboleth/`
- `/var/log/shibboleth/`

## Docker Deployment Answer

`cc.net` itself is not designed to run inside Docker in the current deployment flow.

What the repository shows:

- the web application is published as a normal `.NET` app and started by `systemd`
- the active service runs `/home/jan-hybs/.local/bin/cc.latest --prod true --urls http://0.0.0.0:5000`
- student code execution is performed inside a Docker worker container created by the application

So the intended model is:

- host process for the web app
- Docker only for executing student submissions and related tooling

The relevant code points are:

- `bin/install-service.sh`
- `bin/deploy.py`
- `CodeCritic/Services/ProcessService.cs`
- `CodeCritic/Services/Execution/ExecutionCommand.cs`
