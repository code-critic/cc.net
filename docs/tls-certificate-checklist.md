# TLS Certificate Runbook for `code-critic.nti.tul.cz`

## Purpose

This document describes the repeatable process for obtaining, installing, and validating the Apache HTTPS certificate used by Code Critic.

Target public hostname:

- `code-critic.nti.tul.cz`

Target public service:

- Apache HTTPS frontend for Code Critic and Shibboleth SP

This runbook is written for the TCS server certificate request flow used through CESNET / the registered TUL organization account.

## Why the old `flowdb` certificate cannot be reused

The recovered `flowdb` Apache certificate is not suitable for this deployment because:

- it covered:
  - `temata.fm.tul.cz`
  - `alva.nti.tul.cz`
  - `flowdb.nti.tul.cz`
- it did not cover:
  - `code-critic.nti.tul.cz`
- it expired on:
  - `2024-04-19`

So a new certificate must be issued specifically for:

- `code-critic.nti.tul.cz`

## Result we want

At the end of the process we want these files on the VM:

- certificate or full chain PEM:
  - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- private key PEM:
  - `/etc/ssl/private/code-critic.nti.tul.cz.key`
- optional separate CA chain PEM:
  - `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`

And the Apache vhost should use:

```apache
SSLEngine on
SSLCertificateFile /etc/ssl/certs/code-critic.nti.tul.cz.crt
SSLCertificateKeyFile /etc/ssl/private/code-critic.nti.tul.cz.key
# SSLCertificateChainFile /etc/ssl/certs/code-critic.nti.tul.cz-chain.crt
```

Use `SSLCertificateChainFile` only if the certificate file is not already a full chain.

## Recommended approach

For the first deployment, use:

- one-time standard server certificate request

Reason:

- it is simpler and more explicit than setting up ACME immediately
- the private key can stay under local administrator control
- it is a good fit for the first HTTPS rollout

## Step 1: Prepare a safe working directory

Run on a secure administrator machine or directly on the target VM:

```bash
mkdir -p ~/tls-code-critic
cd ~/tls-code-critic
umask 077
```

This directory should temporarily contain:

- the private key
- the CSR
- later, the issued certificate files

## Step 2: Generate the private key

Generate a new RSA private key:

```bash
openssl genrsa -out code-critic.nti.tul.cz.key 4096
```

Expected result:

- `code-critic.nti.tul.cz.key`

Important:

- keep this file private
- do not send it through email
- do not commit it to git

## Step 3: Generate the CSR

Create the certificate signing request:

```bash
openssl req -new \
  -key code-critic.nti.tul.cz.key \
  -out code-critic.nti.tul.cz.csr \
  -subj "/C=CZ/O=Technická univerzita v Liberci/CN=code-critic.nti.tul.cz"
```

Expected result:

- `code-critic.nti.tul.cz.csr`

## Step 4: Verify the CSR before submission

Check the CSR subject:

```bash
openssl req -in code-critic.nti.tul.cz.csr -noout -subject
```

It should contain:

- `CN = code-critic.nti.tul.cz`

Display the PEM content for copy/paste into the form:

```bash
cat code-critic.nti.tul.cz.csr
```

You will copy the full block including:

- `-----BEGIN CERTIFICATE REQUEST-----`
- `-----END CERTIFICATE REQUEST-----`

## Step 5: Fill the TCS server certificate request form

Follow CESNET TCS (TUL is a member):
https://pki.cesnet.cz/cs/guide-server-tcs-main.html

When the TCS form says:

- `Emaily pro notifikace (odd. mezerou)`
- `Certifikát pro organizaci`
- `Požadavek ve formátu PEM`
- `DNS jméno serveru (do předmětu)`
- `DNS jména serveru (odd. mezerou)`

fill it as follows:

### `Emaily pro notifikace (odd. mezerou)`

Use:

- `pavel.exner@tul.cz`

If a shared administrator mailbox exists, that may be better for future renewals and backup coverage.

### `Certifikát pro organizaci`

Leave:

- `Technická univerzita v Liberci`

### `Požadavek ve formátu PEM`

Paste the full CSR from:

- `code-critic.nti.tul.cz.csr`

### `DNS jméno serveru (do předmětu)`

Enter:

- `code-critic.nti.tul.cz`

### `DNS jména serveru (odd. mezerou)`

For the current deployment:

- leave empty

Reason:

- we only need the one production hostname
- extra SAN names should be added only if there is a real operational need

## Step 6: Submit the request

Submit the form after confirming:

- CSR belongs to the same private key you generated
- main DNS name is exactly `code-critic.nti.tul.cz`
- no accidental extra DNS names were entered

After submission, keep:

- the private key
- the CSR
- any confirmation or ticket reference from the portal

## Step 7: Store the request artifacts safely

Keep these files until the certificate is installed and verified:

- `code-critic.nti.tul.cz.key`
- `code-critic.nti.tul.cz.csr`

Recommended:

- archive them in a secure admin location
- record the request date and requester identity

## Step 8: Receive the issued certificate

When the certificate is issued, you will typically receive one of these:

- server certificate PEM
- full chain PEM
- certificate plus separate intermediate or CA chain bundle

Before installation, verify:

- the certificate is for `code-critic.nti.tul.cz`
- it is still valid
- the issuer is what you expect

Useful command:

```bash
openssl x509 -in code-critic.nti.tul.cz.crt -noout -subject -issuer -dates -ext subjectAltName
```

Expected:

- `code-critic.nti.tul.cz` appears in the subject or SAN

## Step 9: Install the certificate files on the VM

Install the files into the expected Apache locations:

- certificate or full chain:
  - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- private key:
  - `/etc/ssl/private/code-critic.nti.tul.cz.key`
- optional separate chain:
  - `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`

Recommended permissions:

- `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
  - owner: `root:root`
  - mode: `0644`
- `/etc/ssl/private/code-critic.nti.tul.cz.key`
  - owner: `root:root`
  - mode: `0600`
- `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`
  - owner: `root:root`
  - mode: `0644`

If the issuer provides a fullchain file:

- install that content as:
  - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- do not use `SSLCertificateChainFile`

If the issuer provides leaf certificate and separate chain:

- leaf cert:
  - `/etc/ssl/certs/code-critic.nti.tul.cz.crt`
- chain:
  - `/etc/ssl/certs/code-critic.nti.tul.cz-chain.crt`
- enable `SSLCertificateChainFile` in Apache

## Step 10: Verify that the private key matches the certificate

Check key syntax:

```bash
openssl rsa -in /etc/ssl/private/code-critic.nti.tul.cz.key -check -noout
```

Compare certificate and key modulus:

```bash
openssl x509 -noout -modulus -in /etc/ssl/certs/code-critic.nti.tul.cz.crt | openssl md5
openssl rsa -noout -modulus -in /etc/ssl/private/code-critic.nti.tul.cz.key | openssl md5
```

The hashes must match.

## Step 11: Verify Apache configuration before restart

Run:

```bash
apache2ctl configtest
```

Expected:

- `Syntax OK`

If Apache uses a separate chain file, confirm the vhost matches the installed file layout.

The active Apache template is:

- [AuthService/apache/code-critic-auth.conf](/home/code-critic/projects/cc.net/AuthService/apache/code-critic-auth.conf:1)

## Step 12: Restart Apache and validate HTTPS

After the certificate is installed and Apache config is valid:

```bash
sudo systemctl restart apache2
```

Then verify:

```bash
openssl s_client -connect code-critic.nti.tul.cz:443 -servername code-critic.nti.tul.cz </dev/null
curl -I https://code-critic.nti.tul.cz/
curl https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata
```

Confirm:

- Apache answers on `https://code-critic.nti.tul.cz`
- the presented certificate matches `code-critic.nti.tul.cz`
- the Shibboleth metadata endpoint is reachable

## Step 13: Continue with Shibboleth rollout

Once TLS is working, continue with:

- Apache HTTPS frontend activation
- Shibboleth SP registration using:
  - `https://code-critic.nti.tul.cz/shibboleth`
- metadata URL:
  - `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
- `AuthService` behind Apache
- `cc.net` behind Apache on `127.0.0.1:5000`

## Quick form summary

For future repeat requests, use this exact form mapping:

- `Emaily pro notifikace (odd. mezerou)`
  - `pavel.exner@tul.cz`
- `Certifikát pro organizaci`
  - `Technická univerzita v Liberci`
- `Požadavek ve formátu PEM`
  - full contents of `code-critic.nti.tul.cz.csr`
- `DNS jméno serveru (do předmětu)`
  - `code-critic.nti.tul.cz`
- `DNS jména serveru (odd. mezerou)`
  - leave empty

## Decision

Until a valid certificate for `code-critic.nti.tul.cz` is installed and Apache presents it successfully, the HTTPS Shibboleth frontend remains blocked on TLS provisioning.
