# Barline

A fast, offline-first strength-training log: routines, live workouts with a
rest timer, set types, supersets, RPE, personal records, all-time charts,
body weight, CSV export. No account; data stays on the device.

Built with the Replica skill pack (`../replica-*`) as a clean-room rebuild of
the core logging features of a popular workout tracker, then rebranded. No
code, assets, copy or media of the original were used. Planning files,
evidence and caveats are in `replica/`: start with `replica/parity.md`.

```bash
npm install
npm run dev          # http://localhost:5173  (try "Explore with sample data")
npm test             # unit tests (vitest)
npm run e2e          # Playwright, mobile + desktop, axe checks
npm run build        # static site in dist/
npm run tokens       # regenerate src/styles/tokens.css from replica/design/tokens.json
node scripts/screens.mjs   # screenshots into replica/clone-screens (dev server running)
```

Routes: `/` home, `/workout` train, `/active` live workout, `/profile`,
`/exercises`, `/measurements`, `/settings`, `/welcome` landing, `/design` primitives.
