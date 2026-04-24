# Current Status

## Completed in repository

The new auth bridge and HTTPS-fronted deployment assets now exist in:

- [AuthService/README.md](/home/jb/workspace/cc.net/AuthService/README.md:1)
- [AuthService/auth_service/app.py](/home/jb/workspace/cc.net/AuthService/auth_service/app.py:1)
- [AuthService/auth_service/crypto.py](/home/jb/workspace/cc.net/AuthService/auth_service/crypto.py:1)
- [AuthService/apache/code-critic-auth.conf](/home/jb/workspace/cc.net/AuthService/apache/code-critic-auth.conf:1)
- [AuthService/shibboleth/shibboleth2.xml](/home/jb/workspace/cc.net/AuthService/shibboleth/shibboleth2.xml:1)
- [AuthService/systemd/authservice.service](/home/jb/workspace/cc.net/AuthService/systemd/authservice.service:1)

Implemented so far:

- minimal Flask service
- `GET /auth/index.php`
- `GET /auth/debug/`
- `GET /secure/`
- `GET /health`
- AES-CBC encryption compatible with current `cc.net`
- env-based configuration
- Apache HTTPS frontend template
- Shibboleth SP template for the final HTTPS identity
- systemd unit template
- repo defaults updated for Apache-fronted deployment
  - `CodeCritic/appsettings.json` points to the new HTTPS login/logout/callback URLs
  - `bin/install-service.sh` binds `cc.net` to `127.0.0.1:5000`
  - `bin/deploy.py` defaults to `127.0.0.1`

Verified locally:

- Python files compile with `python3 -m compileall AuthService`

## Important architectural conclusion

`cc.net` itself is currently intended to run as a normal host process, not as the main Docker container.

Docker is used by `cc.net` for student code execution only.

Relevant code points:

- [CodeCritic/Services/ProcessService.cs](/home/jb/workspace/cc.net/CodeCritic/Services/ProcessService.cs:58)
- [CodeCritic/Services/Execution/ExecutionCommand.cs](/home/jb/workspace/cc.net/CodeCritic/Services/Execution/ExecutionCommand.cs:30)
- [bin/install-service.sh](/home/jb/workspace/cc.net/bin/install-service.sh:12)

## Current live-host objective

The repo now assumes the target live shape is:

- Apache owns the public HTTPS frontend
- `cc.net` runs on `127.0.0.1:5000`
- `AuthService` runs on `127.0.0.1:8181`
- Shibboleth SP is exposed as `https://code-critic.nti.tul.cz/shibboleth`

The main remaining work is to align the live VM with that repo state.

## What still needs to be discovered on the host

1. Which process currently owns ports `80` and `443`
2. Whether Apache is already installed and usable as the HTTPS frontend
3. Whether TLS termination is currently local or external
4. The active published `cc.net` directory
5. The deployed `AESKey`
6. Whether the live app config still points to dead `flowdb`
7. Which certificate source should be used for Apache on `code-critic.nti.tul.cz`

## Commands to run on the live host

Run these on the live server:

```bash
ss -tulpn
systemctl list-units --type=service | grep -E 'nginx|apache|httpd|caddy|haproxy|traefik|shib'
systemctl status cc
systemctl cat cc.service
docker ps
readlink -f /home/jan-hybs/.local/bin/cc.latest
find /etc -maxdepth 3 \( -iname '*nginx*' -o -iname '*caddy*' -o -iname '*shibboleth*' -o -iname '*apache*' \)
dpkg -l | grep -E 'shibboleth|nginx|apache|caddy|haproxy'
```

If the active release path is found, also inspect:

```bash
ls -la <active-release-dir>
sed -n '1,200p' <active-release-dir>/appsettings.json
sed -n '1,200p' <active-release-dir>/appsettings.secret.json
```

## Files worth copying from the host

Highest-value files:

- active deployed `appsettings.json`
- active deployed `appsettings.secret.json`
- `/etc/systemd/system/cc.service`
- frontend web server config
- any Shibboleth configuration if present

Likely useful paths:

- `/home/jan-hybs/.local/bin/cc.latest`
- `/home/jan-hybs/projects/cc/publish/`
- `/etc/systemd/system/cc.service`
- `/etc/nginx/`
- `/etc/caddy/`
- `/etc/shibboleth/`

## URL assumption for same-host deployment

For the current target deployment, the recommended public URLs are:

- `https://<public-host>/auth/index.php`
- `https://<public-host>/secure/`
- `https://<public-host>/home/login`
- `https://<public-host>/Shibboleth.sso/Metadata`

The internal services should still listen only on localhost, for example:

- `127.0.0.1:5000` for `cc.net`
- `127.0.0.1:8181`

So the browser-facing URL is public, but both application processes stay local behind Apache.

## Federation note

TUL being an identity provider in `eduID.cz` does not automatically make the new service provider trusted.

One of these will still be required:

- registering the new SP in federation metadata
- or having TUL identity administrators explicitly trust/import the SP metadata

This is still unresolved and needs confirmation from the TUL Shibboleth administrators.

## Remaining code work after host inspection

Once the live host details are known, the next steps are:

1. Install or adapt Apache as the public HTTPS frontend
2. Move the live `cc.net` service to `127.0.0.1:5000`
3. Fill in deployment-only environment file with `AESKey`
4. Install the Shibboleth SP on the HTTPS frontend
5. Update live `LoginUrl`, `LogoutUrl`, and `ReturnUrl` to the HTTPS values
6. Validate metadata and `/auth/debug/` independently

## User-provided information already known

- contact email: `jan.brezina@tul.cz`
- `AESKey` must remain deployment-only
- target intent: deploy `AuthService` on the same server as `cc.net`
