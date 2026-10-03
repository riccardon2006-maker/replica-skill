# Architecture: Barline (a rebuild of Hevy's core logging features)

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | Vite + React 19 + TypeScript, React Router | a gym log is a client app; no server rendering needed, starts instantly on a phone |
| mobile | installable PWA (manifest + service worker) now; Expo later if store presence is needed | one codebase, no store review for the MVP |
| styling | CSS custom properties from `design/tokens.json` + a small set of utility classes | tokens only, no raw hex in components |
| local data | `localStorage` behind a `Repo` interface (async signatures) | **offline-first is a product fix** (see fixes.md): logging never waits on the network |
| database (sync, phase 2) | Postgres on Supabase | RLS per user, managed backups |
| auth (phase 2) | Supabase Auth: email magic link + Google, Apple | Apple required for an iOS build with sign-up |
| payments (phase 2) | Stripe Checkout + Customer Portal | one-click cancel |
| email | Resend, only auth emails | no marketing email in MVP |
| jobs | none in MVP | |
| hosting | Vercel or Cloudflare Pages (static) | it is a static bundle |

One database. No microservices. Icons: Lucide (ISC licence). Font: Inter (OFL).

## Schema

Tables: 8. Access rules: Postgres RLS, `user_id = auth.uid()` on every user-owned
table; built-in exercises (`user_id is null`) readable by everyone.
See `schema.sql`. The browser keeps the same shapes in `localStorage`
(`src/data/types.ts`), so phase 2 sync maps 1:1.

Weights are stored **in kg, always** (`numeric(6,2)`), converted for display.
Times are `timestamptz` in UTC.

## API (phase 2, via Supabase client + RLS; MVP is the local Repo)

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| Repo.listWorkouts | history, newest first | owner | none | Workout[] | F01, F06 |
| Repo.saveWorkout | insert or update a finished workout | owner | Workout | Workout | F01, F06 |
| Repo.deleteWorkout | delete | owner | id | none | F06 |
| Repo.getActive / setActive / clearActive | the in-progress workout | owner | ActiveWorkout | none | F01, F03 |
| Repo.listRoutines / saveRoutine / deleteRoutine | routines CRUD | owner | Routine | Routine | F02 |
| Repo.listExercises / saveExercise | library + custom | owner (custom), all (built-in) | Exercise | Exercise | F01, F02 |
| Repo.listMeasurements / saveMeasurement / deleteMeasurement | body weight | owner | Measurement | none | F05 |
| Repo.getSettings / saveSettings | units, rest, RPE | owner | Settings | none | none |
| POST /api/stripe/webhook (phase 2) | subscription status | Stripe (signed) | event | 200 | none |

## The parts that bite

- **Reload mid-workout**: the active workout is written to storage on every
  change, and its `startedAt` is a timestamp, so the clock is right after reload.
- **Rest timer in background**: the timer stores an `endsAt` timestamp, never
  counts ticks, so a backgrounded tab shows the right value when it returns.
- **Units**: stored kg, display kg or lb; a set entered in lb is converted once
  on input, rounded to 0.01 kg.
- **PRs**: computed from history at save time (heaviest weight, best est. 1RM
  by Epley, most volume in a set), never stored, so editing history keeps them right.
- **Sync (phase 2)**: last-write-wins per workout row, client-generated UUIDs so
  offline inserts never collide; idempotent upserts.
- **GDPR**: export (CSV) in MVP; delete-all in Settings.

## Build order

1. Vertical slice: S02 -> S05 -> S04 -> S06 -> S01 (empty workout logged and in history).
2. Must-haves: S03 routines, S07 detail, S09 exercise detail, S11 units, resume after reload.
3. Should-haves: set types, rest per exercise, supersets, PRs, charts, S10, S12, edit workout.
4. Fixes from replica-entrepreneur: offline-first, unlimited routines/custom exercises
   and all-time stats in the free tier, "update routine with this workout's changes".
