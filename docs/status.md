# Current Status

## Completed in repository

The new auth bridge has been started in:

- [AuthService/README.md](/home/jb/workspace/cc.net/AuthService/README.md:1)
- [AuthService/auth_service/app.py](/home/jb/workspace/cc.net/AuthService/auth_service/app.py:1)
- [AuthService/auth_service/crypto.py](/home/jb/workspace/cc.net/AuthService/auth_service/crypto.py:1)
- [AuthService/apache/code-critic-auth.conf](/home/jb/workspace/cc.net/AuthService/apache/code-critic-auth.conf:1)
- [AuthService/shibboleth/shibboleth2.xml](/home/jb/workspace/cc.net/AuthService/shibboleth/shibboleth2.xml:1)
- [AuthService/systemd/authservice.service](/home/jb/workspace/cc.net/AuthService/systemd/authservice.service:1)

Implemented so far:

- minimal Flask service
- `GET /auth/index.php`
- `GET /secure/`
- `GET /health`
- AES-CBC encryption compatible with current `cc.net`
- env-based configuration
- Apache reverse-proxy template
- Shibboleth SP template for eduID.cz-style deployment
- systemd unit template

Verified locally:

- Python files compile with `python3 -m compileall AuthService`

## Important architectural conclusion

`cc.net` itself is currently intended to run as a normal host process, not as the main Docker container.

Docker is used by `cc.net` for student code execution only.

Relevant code points:

- [CodeCritic/Services/ProcessService.cs](/home/jb/workspace/cc.net/CodeCritic/Services/ProcessService.cs:58)
- [CodeCritic/Services/Execution/ExecutionCommand.cs](/home/jb/workspace/cc.net/CodeCritic/Services/Execution/ExecutionCommand.cs:30)
- [bin/install-service.sh](/home/jb/workspace/cc.net/bin/install-service.sh:12)

## Current unknowns on the live host

The host does not appear to have a normal Apache layout under `/etc/apache2`.

That means one of these is likely true:

- the frontend web server is `nginx`
- the frontend web server is `caddy`
- a reverse proxy is running in Docker
- `cc.net` is exposed more directly than expected
- TLS termination happens elsewhere

This must be identified on the live server before finalizing deployment config for `AuthService`.

## What still needs to be discovered on the host

1. Which process owns ports `80` and `443`
2. Which web server or proxy terminates TLS
3. Whether Shibboleth SP is already installed
4. The actual public hostname used by users
5. The deployed `ReturnUrl`
6. The deployed `AESKey`
7. The active published `cc.net` directory

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

If `AuthService` is deployed on the same server as `cc.net`, the recommended public URLs are:

- `https://<public-host>/auth/index.php`
- `https://<public-host>/home/login`

The Python service itself should still listen only on localhost, for example:

- `127.0.0.1:8181`

So the browser-facing URL is public, but the service process is local behind the reverse proxy.

## Federation note

TUL being an identity provider in `eduID.cz` does not automatically make the new service provider trusted.

One of these will still be required:

- registering the new SP in federation metadata
- or having TUL identity administrators explicitly trust/import the SP metadata

This is still unresolved and needs confirmation from the TUL Shibboleth administrators.

## Remaining code work after host inspection

Once the live host details are known, the next steps are:

1. Adjust the reverse-proxy config to the actual frontend server
2. Fill in final public hostname and contact email
3. Fill in deployment-only environment file with `AESKey`
4. Add any missing Shibboleth metadata details required by TUL
5. Patch `cc.net` frontend so it no longer hardcodes the dead `flowdb` URLs

## User-provided information already known

- contact email: `jan.brezina@tul.cz`
- `AESKey` must remain deployment-only
- target intent: deploy `AuthService` on the same server as `cc.net`
