# TUL IdP Registration Request for Code Critic

## Purpose

This request is for the production-facing HTTPS Shibboleth Service Provider used to restore login to Code Critic.

The current recovery architecture is:

- Apache is the public HTTPS frontend on `https://code-critic.nti.tul.cz`
- Apache + Shibboleth SP are exposed on that HTTPS frontend
- `cc.net` runs internally behind Apache
- the Shibboleth-protected bridge forwards the authenticated user back to `cc.net`

## SP Details

- SP entity ID:
  - `https://code-critic.nti.tul.cz/shibboleth`
- SP metadata URL:
  - `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`
- Service entry used for testing:
  - `https://code-critic.nti.tul.cz/auth/debug/`
- Administrative / technical contact:
  - `pavel.exner@tul.cz`

## Request

Please register or enable this Service Provider in the TUL Shibboleth IdP so that users can authenticate to the Code Critic login bridge.

At the moment, the IdP responds with:

- `Web Login Service - Unsupported Request`
- `The application you have accessed is not registered for use with this service.`

This indicates the request reaches the IdP correctly, but the SP is not yet registered or permitted.

## Suggested Short Request Text

Hello,

please register or allow the following Shibboleth SP for Code Critic:

- entity ID: `https://code-critic.nti.tul.cz/shibboleth`
- metadata: `https://code-critic.nti.tul.cz/Shibboleth.sso/Metadata`

This is the HTTPS-fronted recovery setup for Code Critic. The current login attempt reaches the TUL IdP but is rejected as an unregistered application.

Technical contact:

- `pavel.exner@tul.cz`
