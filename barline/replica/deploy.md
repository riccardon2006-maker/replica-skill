# Deploy checklist: Barline

Date: 2026-10-03  Go from user: **not yet** (nothing has been deployed)

## Preflight

- [x] e2e suite green: 72 passed / 72 (mobile + desktop), unit 13 / 13
- [x] no open S1 or S2 bugs
- [x] parity: all must-haves done (17/17), feature score 97.5 (see parity.md caveats)
- [x] rebrand sweep clean (`sweep.py` exit 0)
- [x] store listing passes (`listing.py` exit 0, 0 warnings)
- [x] production build passes (`npm run build`)
- [ ] privacy policy and terms live: **not written**. With no server the only processor is the host; write them before launch
- [x] account deletion: no accounts; "Delete all data" in Settings works
- [ ] favicon, titles, OG image are yours: favicon and title yes (placeholder icon); **no OG image yet**, logo brief in brand.md
- [ ] trademark and domain checks in brand.md: **all "to run"**

Blocking before a public launch: the three unchecked rows above, plus
collecting real reviews (fixes.md) if the angle is going to be marketed.

## Production (when the user says go)

It is a static site: `npm run build` -> `dist/`. Default host: Vercel or
Cloudflare Pages. Needs an SPA fallback so deep links work:

- Vercel: `vercel.json` -> `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Cloudflare Pages / Netlify: `public/_redirects` -> `/*  /index.html  200`

No env vars, no database, no Stripe in the MVP.

## Domain (after the user buys it)

| record | name | value |
| --- | --- | --- |
| A | @ | the host's apex IP (Vercel shows it in Domains) |
| CNAME | www | `cname.vercel-dns.com` (Vercel) or `<project>.pages.dev` (Cloudflare) |

Pick apex or www as canonical and redirect the other. HTTPS is automatic;
check it. Email DNS (SPF/DKIM/DMARC) only when phase 2 sends email.

## Watch

- [ ] error tracking (Sentry browser SDK)
- [ ] uptime check on `/` (any free pinger)
- [ ] analytics: Plausible or Umami (no cookie banner)
- [ ] core flow done on the live site, desktop and phone, added to Home Screen
