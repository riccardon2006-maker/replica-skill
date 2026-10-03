# Backend: Barline

## What exists now

The MVP is **local-first with no server**: all data in the browser
(`src/data/store.ts`), written on every change; the service worker caches the
app shell. There is no auth, no database, no payments yet, by design for the
"no account" angle. `schema.sql` is ready for phase 2.

Nothing in this file has been provisioned. The user creates every account
and key; Claude never does.

## Phase 2: sync (the paid tier)

1. User creates a Supabase project (dev and, later, a separate prod one).
2. Run `replica/schema.sql` as the first migration (`supabase db push`).
3. Auth: email magic link, Google, Apple (Apple required for iOS with sign-up).
   Sessions in http-only cookies via `@supabase/ssr`, or the JS client's
   secure storage in a native wrapper.
4. Sync: on every `commit()` in store.ts, queue changed rows; upsert by
   client UUID (idempotent); pull since `updated_at` cursor; last write wins per row.
5. Stripe Checkout for Sync/Lifetime, Customer Portal for cancel; webhook
   handler verifies signatures, stores event ids, handles
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`. Status in a
   `subscriptions` table, never trusted from the client.
6. Account deletion that deletes (cascades from `profiles`).

`.env.example` lists the variable names.

## Security checklist

- [x] no secrets in the repo (`.env*` ignored, none used yet)
- [x] input validated before storing (numeric regex, name length, duplicate names)
- [ ] authorisation: RLS written in schema.sql, **untested** until a project exists (test with a second user)
- [ ] rate limits on auth (Supabase defaults; check before launch)
- [ ] webhook signature checks (phase 2)
- [x] no uploads
- [x] no user data in URLs or logs (workout ids are random UUIDs)
- [x] `npm audit`: 0 vulnerabilities at install
- [ ] privacy policy listing processors (host; later Supabase, Stripe, Resend)
