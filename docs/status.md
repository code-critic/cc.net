# Current Status

## Summary

The Shibboleth recovery work is no longer in the “investigate architecture” stage.

The current state is:

- `AuthService` is deployed and running correctly on the VM
- `cc.net` has been redeployed from the current repo branch
- `cc.net` now runs only on `127.0.0.1:5000`
- the old temporary Apache `:8080` auth-only setup has been replaced on disk by the final HTTPS-oriented Apache and Shibboleth config
- `shibd` is running with the final HTTPS SP identity
- Apache is intentionally inactive because the final TLS certificate files do not exist yet

The only remaining blocker for the public cutover is the certificate for:

- `code-critic.nti.tul.cz`

## What Was Changed In The Repo

The repository now reflects the final intended deployment model:

- Apache is the public frontend on `:443`
- `cc.net` is an internal upstream on `127.0.0.1:5000`
- `AuthService` is an internal upstream on `127.0.0.1:8181`
- Shibboleth SP identity is:
  - `https://code-critic.nti.tul.cz/shibboleth`
- public auth URLs are:
  - `https://code-critic.nti.tul.cz/auth/index.php`
  - `https://code-critic.nti.tul.cz/secure/`
  - `https://code-critic.nti.tul.cz/home/login`
  - `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`

Important repo-side updates already made:

- `AuthService` deployment docs and templates were updated from the rejected `:8080` plan to the final HTTPS plan
- `CodeCritic/appsettings.json` now points to the new HTTPS `LoginUrl`, `LogoutUrl`, and `ReturnUrl`
- `bin/install-service.sh` now runs `cc.net` on `http://127.0.0.1:5000`
- `bin/deploy.py` defaults to `127.0.0.1`
- `AuthService/install_apache_shibbo.sh` now stages the final Apache/Shibboleth config and replaces `ports.conf`
- TLS request and installation steps were documented in:
  - [tls-certificate-checklist.md](/home/code-critic/projects/cc.net/docs/tls-certificate-checklist.md:1)

## Current Live VM State

### `AuthService`

Verified live:

- `systemd` unit is installed and enabled
- gunicorn is running
- bind address:
  - `127.0.0.1:8181`
- health endpoint:
  - `curl http://127.0.0.1:8181/health`
  - returned `{"errors":[],"status":"ok"}`

Operational conclusion:

- `AuthService` is ready
- environment config is valid
- AES key and allowlist config are loaded correctly

### `cc.net`

The old direct-public service was replaced with a new deploy from the current branch.

Verified live:

- active release:
  - `/home/code-critic/projects/publish/1.2.25/www`
- `cc.latest` points to:
  - `/home/code-critic/projects/publish/1.2.25/www/cc.net`
- `cc.service` runs:
  - `/home/code-critic/.local/bin/cc.latest --prod true --urls http://127.0.0.1:5000`
- Kestrel bind:
  - `127.0.0.1:5000`
- localhost response works:
  - `curl -I http://127.0.0.1:5000/`
  - returned `HTTP/1.1 200 OK`

Socket state after the redeploy:

- `127.0.0.1:5000` -> `cc.latest`
- `127.0.0.1:8181` -> `gunicorn`
- no public app listener on `:80`
- no listener on `:443` yet

Operational conclusion:

- `cc.net` is now correctly staged behind Apache
- the risky application move off public `:80` is already done

### Apache and Shibboleth

What was true before the latest staging:

- Apache was still configured only for the old temporary auth listener on `:8080`
- `/etc/apache2/ports.conf` contained only:
  - `Listen 8080`
- `/etc/apache2/sites-available/code-critic-auth.conf` was still the old temporary auth-only vhost
- `/etc/shibboleth/shibboleth2.xml` still used:
  - `http://code-critic.nti.tul.cz:8080/shibboleth`

What is true now after running `AuthService/install_apache_shibbo.sh`:

- `/etc/apache2/ports.conf` now contains:
  - `Listen 443`
- `/etc/apache2/sites-available/code-critic-auth.conf` is now the final HTTPS vhost
- `/etc/shibboleth/shibboleth2.xml` is now the final HTTPS SP config
- Shibboleth SP identity is now:
  - `https://code-critic.nti.tul.cz/shibboleth`
- `shibd` is running successfully with the new config

Apache state now:

- Apache is not usable yet because the certificate files do not exist:
  - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
  - `/etc/ssl/private/code-critic.nti.tul.cz.key`
- `apache2ctl` currently fails exactly on that missing certificate

Operational conclusion:

- Apache/Shibboleth file staging is done
- the remaining blocker is only TLS certificate installation

## Certificate Status

The old `flowdb` certificate cannot be reused.

Recovered evidence showed:

- it covered:
  - `temata.fm.tul.cz`
  - `alva.nti.tul.cz`
  - `flowdb.nti.tul.cz`
- it did not cover:
  - `code-critic.nti.tul.cz`
- it expired on:
  - `2024-04-19`

A new certificate request for `code-critic.nti.tul.cz` has already been submitted through the TCS/CESNET flow.

The repeatable request/install procedure is documented in:

- [tls-certificate-checklist.md](/home/code-critic/projects/cc.net/docs/tls-certificate-checklist.md:1)

## Current Effective Architecture

This is now the real target shape and is already mostly staged on the VM:

- browser -> Apache `:443`
- Apache -> `cc.net` on `127.0.0.1:5000`
- Apache -> `AuthService` on `127.0.0.1:8181`
- Apache + `mod_shib` own `/Shibboleth.sso/...`
- `AuthService` generates the encrypted callback token
- `cc.net` consumes `/home/login/<token>` and creates the local session

## Important Context To Preserve

### Why the old `:8080` plan was abandoned

The temporary SP identity:

- `http://code-critic.nti.tul.cz:8080/shibboleth`

was implemented and verified locally up to the IdP boundary, but it was rejected for production registration because the federation-facing frontend must be secured.

That is why the work pivoted to:

- `https://code-critic.nti.tul.cz/shibboleth`

### Why `AuthService` exists

`cc.net` does not implement Shibboleth directly.

It still expects the historical bridge pattern:

1. external auth bridge authenticates the user
2. bridge builds payload:
   - `eppn`
   - `affiliation`
   - `datetime`
3. bridge encrypts it with the shared AES key
4. browser is redirected to:
   - `/home/login/<token>`
5. `cc.net` decrypts the token and creates the local session

The crypto compatibility target is current `.NET` behavior, not the old PHP/Python implementation.

### Important implementation detail discovered during redeploy

`dotnet publish` alone was not enough for this codebase because the SPA build expected generated CSS files such as:

- `_client/src/styles/boot.css`

Those files are produced by:

- `npm run build-css`

The successful local release flow was:

1. generate CSS:
   - `npm run build-css`
2. publish:
   - `env DOTNET_CLI_HOME=/tmp dotnet publish -c Release -o /home/code-critic/projects/publish/1.2.25/www --no-restore`

Also note:

- publishing from the current branch was necessary
- the old `bin/deploy.py` download-from-GitHub behavior would not have been safe for this cutover

## Remaining Blocker

The only real blocker now is:

- final TLS certificate installation for `code-critic.nti.tul.cz`

Until the files below exist, Apache cannot start with the final vhost:

- `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- `/etc/ssl/private/code-critic.nti.tul.cz.key`

Optional if a separate chain file is needed:

- `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`

## Exact Next Step When The Certificate Arrives

1. install the certificate and key into:
   - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
   - `/etc/ssl/private/code-critic.nti.tul.cz.key`
2. if needed, install the separate chain file:
   - `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`
3. enable the Apache site:
   - `sudo a2ensite code-critic-auth`
4. validate config:
   - `sudo apache2ctl configtest`
5. restart Apache:
   - `sudo systemctl restart apache2`
6. verify:
   - `curl -k https://127.0.0.1/Shibboleth.sso/Metadata -H 'Host: code-critic.nti.tul.cz'`
   - `curl -k https://127.0.0.1/auth/debug/ -H 'Host: code-critic.nti.tul.cz'`
   - browser access to `https://code-critic.nti.tul.cz`

## Files Most Relevant For Continuation

Repo files:

- [cc_shibbo_plan.md](/home/code-critic/projects/cc.net/cc_shibbo_plan.md:1)
- [AuthService/install_apache_shibbo.sh](/home/code-critic/projects/cc.net/AuthService/install_apache_shibbo.sh:1)
- [AuthService/apache/code-critic-auth.conf](/home/code-critic/projects/cc.net/AuthService/apache/code-critic-auth.conf:1)
- [AuthService/shibboleth/shibboleth2.xml](/home/code-critic/projects/cc.net/AuthService/shibboleth/shibboleth2.xml:1)
- [tls-certificate-checklist.md](/home/code-critic/projects/cc.net/docs/tls-certificate-checklist.md:1)
- [bin/install-service.sh](/home/code-critic/projects/cc.net/bin/install-service.sh:1)

Live VM files already staged:

- `/etc/apache2/ports.conf`
- `/etc/apache2/sites-available/code-critic-auth.conf`
- `/etc/shibboleth/shibboleth2.xml`
- `/etc/code-critic/authservice.env`
- `/etc/systemd/system/authservice.service`
- `/etc/systemd/system/cc.service`

## Final Short Handoff

If resuming later, the shortest accurate summary is:

- `AuthService` works on `127.0.0.1:8181`
- `cc.net` works on `127.0.0.1:5000`
- final Apache and Shibboleth config is already staged on the VM
- `shibd` is running with the final HTTPS SP identity
- Apache is intentionally down because the TLS cert is missing
- the next action is to install the cert for `code-critic.nti.tul.cz` and start Apache
