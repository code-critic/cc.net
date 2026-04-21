# Temporary TUL IdP Registration Request for Code Critic

## Purpose

This is a temporary phase-1 Shibboleth Service Provider registration for restoring login to Code Critic while the main application still runs on public HTTP `:80`.

The current recovery architecture is:

- `cc.net` remains on `http://code-critic.nti.tul.cz`
- Apache + Shibboleth SP run on `http://code-critic.nti.tul.cz:8080`
- the Shibboleth-protected bridge forwards the authenticated user back to `cc.net`

## SP Details

- SP entity ID:
  - `http://code-critic.nti.tul.cz:8080/shibboleth`
- SP metadata URL:
  - `http://code-critic.nti.tul.cz:8080/Shibboleth.sso/Metadata`
- Service entry used for testing:
  - `http://code-critic.nti.tul.cz:8080/auth/debug/`
- Administrative / technical contact:
  - `pavel.exner@tul.cz`

## Request

Please register or enable this Service Provider in the TUL Shibboleth IdP so that users can authenticate to the temporary phase-1 Code Critic login bridge.

At the moment, the IdP responds with:

- `Web Login Service - Unsupported Request`
- `The application you have accessed is not registered for use with this service.`

This indicates the request reaches the IdP correctly, but the SP is not yet registered or permitted.

## Important Temporary Nature

This registration is intended only for the temporary recovery phase.

The planned final production identity is:

- `https://code-critic.nti.tul.cz/shibboleth`

When Code Critic is later moved behind Apache with HTTPS enabled, the SP registration should be updated from the temporary HTTP `:8080` identity to the final HTTPS identity.

## Suggested Short Request Text

Hello,

please register or allow the following temporary Shibboleth SP for Code Critic:

- entity ID: `http://code-critic.nti.tul.cz:8080/shibboleth`
- metadata: `http://code-critic.nti.tul.cz:8080/Shibboleth.sso/Metadata`

This is a temporary phase-1 recovery setup for Code Critic. The current login attempt reaches the TUL IdP but is rejected as an unregistered application.

Technical contact:

- `pavel.exner@tul.cz`

Later, this temporary registration will be replaced by the final HTTPS SP:

- `https://code-critic.nti.tul.cz/shibboleth`
