# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of Poker Planning seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [@Slashgear](https://github.com/Slashgear) or by opening a [Security Advisory](https://github.com/Slashgear/poker-planning/security/advisories/new).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English or French.

## Security Features

This project implements several security measures:

- **Rate Limiting**: 60 requests per minute per IP address (production only)
- **Input Validation**: Strict validation for votes, names, and room codes
- **Content Security Policy (CSP)**: Prevents XSS and clickjacking attacks (production only)
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Body Size Limiting**: Maximum 1KB request body size
- **Redis TLS**: Secure connection to Redis in production

## Known Security Considerations

- Room codes are 6-character alphanumeric strings. While this provides reasonable security for short-lived sessions, consider the room lifetime (2 hours) when using for sensitive information.
- Session cookies use `httpOnly` and `sameSite: 'Lax'` for CSRF protection.
- Rate limiting is disabled in development/test environments to allow E2E testing.
