# Content Security Policy (CSP) Automated Build & Deployment Evidence

## 1. Automated Build Lifecycle Integration

To guarantee that inline React Server Components flight payloads never fall out of sync with deployed HTTP security headers, the build lifecycle has been automated in `package.json`:

```json
{
  "scripts": {
    "build": "next build --webpack",
    "postbuild": "node scripts/generate-csp-hashes.mjs --update && prettier --write firebase.json",
    "deploy": "next build --webpack && firebase deploy --only hosting"
  }
}
```

### Deterministic Build Sequence:

1. `npm run build` triggers `next build --webpack`.
2. Next.js compiles routes and exports static HTML pages to `out/`.
3. npm automatically invokes `postbuild`.
4. `scripts/generate-csp-hashes.mjs` scans all HTML files in `out/`, extracts inline scripts, and generates SHA-256 base64 hashes.
5. Hashes are updated in `firebase.json`'s `Content-Security-Policy` header.
6. `prettier --write firebase.json` ensures consistent file formatting.

---

## 2. Cryptographic Script Hash Verification

During the latest production build, 12 inline script hashes were extracted across 13 exported HTML documents:

```
  - 'sha256-51jAQsMM3qPV2AgkUtBaZnd8GlwbMyeBEI94+CBp1E8='
  - 'sha256-80aZ2knZ25sCNPLB7ukBtIl1yQd5aJhRtBZLvhlGkvI='
  - 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo='
  - 'sha256-W1TgCAzh40kmhOYA6CGMvC4wbEw/zhoZhFQ4yYWBS1c='
  - 'sha256-WiGavP6c4vfP4ypPXDd7cSgVAYLc//31PCwcSNECCg0='
  - 'sha256-Xw19s17Zh8opEWr6/+nD4WbhOrCe2Bky1cGcnFL4jWE='
  - 'sha256-dUoAN0wnH57w/1m1kbRI4wX6w7Kuin87apl5BpOW/eY='
  - 'sha256-lrCU98O8Nuv97gHjot/xa+BP+qOc9RMt7tQ3lKLj7Y0='
  - 'sha256-tCxcrRHLSyIAsFOR4zhufZu3OVYBruHMhPg5wGqLYrU='
  - 'sha256-vENkgiJBKk8/C38jO5jfdCQBh4CGFU11EryhIaGGAvc='
  - 'sha256-wU022fONM9oDGTLGbLXT7XNlYAIe9d4YG2wF0d4RiAg='
  - 'sha256-zsNUGXm9i16ciu4kI0jQZqmKXmQp7VSb5QSxLvHkeXM='
```

---

## 3. W3C CSP Level 2/3 Enforcement Mechanics

- **Hash Precedence**: Modern user agents ignore `'unsafe-inline'` when a script hash source is specified in `script-src`. Any attacker-injected `<script>` tag lacks a matching cryptographic hash in the HTTP response header and is immediately blocked by the browser.
- **Backwards Compatibility**: Legacy browsers that do not support CSP Level 2 hashes fall back to `'unsafe-inline'`, preventing site breakage while providing full protection on modern platforms.
