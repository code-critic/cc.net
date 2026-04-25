# Current Status

## Summary

The Shibboleth recovery work is no longer in the “investigate architecture” stage.

The current state is:

- `AuthService` is deployed and running correctly on the VM
- `cc.net` has been redeployed from the current repo branch
- `cc.net` now runs only on `127.0.0.1:5000`
- the old temporary Apache `:8080` auth-only setup has been replaced by the final HTTPS-oriented Apache and Shibboleth config
- `shibd` is running with the final HTTPS SP identity
- Apache is running on `:443`
- the TLS certificate and intermediate chain for `code-critic.nti.tul.cz` are installed and verified
- public HTTPS access to `cc.net` works
- public Shibboleth metadata works
- protected AuthService routes redirect to the TUL IdP as expected

The remaining work is no longer TLS installation. The next operational step is federation/SP metadata review and registration for:

- `https://code-critic.nti.tul.cz/shibboleth`

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
- `AuthService/apache/code-critic-auth.conf` includes the HARICA/GEANT intermediate chain file:
  - `/etc/ssl/certs/harica-geant-tls-1.pem`
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
- Apache now listens publicly on `:443`

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
- Apache is running successfully with the new HTTPS vhost
- Apache proxies `/` to `cc.net` on `127.0.0.1:5000`
- Apache proxies AuthService paths to `127.0.0.1:8181`
- Apache + `mod_shib` own `/Shibboleth.sso/...`

TLS state now:

- `/etc/ssl/certs/code-critic.nti.tul.cz.crt` is installed
- `/etc/ssl/private/code-critic.nti.tul.cz.key` is installed
- `/etc/ssl/certs/harica-geant-tls-1.pem` is installed as the intermediate chain
- Apache vhost uses:
  - `SSLCertificateFile /etc/ssl/certs/code-critic.nti.tul.cz.crt`
  - `SSLCertificateKeyFile /etc/ssl/private/code-critic.nti.tul.cz.key`
  - `SSLCertificateChainFile /etc/ssl/certs/harica-geant-tls-1.pem`
- `apache2ctl configtest` returns:
  - `Syntax OK`
- `openssl s_client -connect code-critic.nti.tul.cz:443 -servername code-critic.nti.tul.cz </dev/null` now reports:
  - `Verification: OK`
  - `Verify return code: 0 (ok)`

Operational conclusion:

- Apache/Shibboleth public HTTPS cutover is live
- TLS and chain presentation are correct
- the public service is now past the certificate blocker

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

The new certificate for `code-critic.nti.tul.cz` has been issued, installed, and verified.

Verified certificate details from the live HTTPS service:

- subject CN:
  - `code-critic.nti.tul.cz`
- issuer:
  - `GEANT TLS RSA 1`
- chain:
  - `code-critic.nti.tul.cz`
  - `GEANT TLS RSA 1`
  - `HARICA TLS RSA Root CA 2021`
- validity:
  - `NotBefore: Apr 24 15:56:39 2026 GMT`
  - `NotAfter: Nov 9 15:56:38 2026 GMT`

The repeatable request/install procedure is documented in:

- [tls-certificate-checklist.md](/home/code-critic/projects/cc.net/docs/tls-certificate-checklist.md:1)

## Current Effective Architecture

This is now the real live shape on the VM:

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

There is no longer a TLS blocker.

Remaining operational work:

1. review the generated SP metadata
2. provide/register SP metadata for:
   - `https://code-critic.nti.tul.cz/shibboleth`
3. confirm IdP/federation acceptance
4. perform an end-to-end login test through:
   - `https://code-critic.nti.tul.cz/auth/debug/`
   - `https://code-critic.nti.tul.cz/secure/`
   - `https://code-critic.nti.tul.cz/home/login`

The generated Shibboleth metadata endpoint is:

- `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`

Current metadata observations:

- `entityID` is correct:
  - `https://code-critic.nti.tul.cz/shibboleth`
- generated endpoints are HTTPS
- the old temporary `http://code-critic.nti.tul.cz:8080/shibboleth` reference has been removed from the SP key metadata
- the generated metadata still includes Shibboleth's built-in warning comment:
  - `This is example metadata only. Do *NOT* supply it as is without review...`

That warning is emitted by the Shibboleth `MetadataGenerator` handler, not by the local `metadata-template.xml`. For registration, save and review a static copy of the generated metadata, remove only the warning comment if appropriate, and submit the reviewed static XML.

## Verified Public Checks

The following public checks now work:

- TLS chain:
  - `openssl s_client -connect code-critic.nti.tul.cz:443 -servername code-critic.nti.tul.cz </dev/null`
  - result: `Verify return code: 0 (ok)`
- `cc.net` through Apache:
  - `curl -I https://code-critic.nti.tul.cz/`
  - result: `HTTP/1.1 200 OK`
  - server header: `Kestrel`
- Shibboleth metadata:
  - `curl https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
  - result: metadata XML with `entityID="https://code-critic.nti.tul.cz/shibboleth"`
- protected AuthService debug route:
  - `curl https://code-critic.nti.tul.cz/auth/debug/`
  - result: `302 Found` redirect to `https://shibbo.tul.cz/idp/profile/SAML2/Redirect/SSO?...`

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
- `/etc/shibboleth/metadata-template.xml`
- `/etc/shibboleth/sp-cert.pem`
- `/etc/shibboleth/sp-key.pem`
- `/etc/code-critic/authservice.env`
- `/etc/systemd/system/authservice.service`
- `/etc/systemd/system/cc.service`
- `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- `/etc/ssl/private/code-critic.nti.tul.cz.key`
- `/etc/ssl/certs/harica-geant-tls-1.pem`

## Final Short Handoff

If resuming later, the shortest accurate summary is:

- `AuthService` works on `127.0.0.1:8181`
- `cc.net` works on `127.0.0.1:5000`
- Apache works publicly on `https://code-critic.nti.tul.cz`
- TLS certificate and chain are installed and verify correctly
- final Apache and Shibboleth config is staged and active on the VM
- `shibd` is running with the final HTTPS SP identity
- Shibboleth metadata works at `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
- protected AuthService routes redirect to the TUL IdP
- the next action is SP metadata review/registration and then an end-to-end login test
