# Fixes and angle: Barline

## Evidence status, read this first

- **User reviews: 0 collected** (see feedback.md). The three lists below are
  therefore built from **public pricing facts** and **third-party review
  articles**, found by web search, not from user reviews. Every theme is
  marked **thin** until real reviews are added.
- Two "gaps" that third-party articles claim were checked against the
  original's own help center and **are not gaps**, so they are parity, not fixes:
  - "requires an internet connection to log": the original logs offline and syncs later
    (search summary of https://hevycoach.com/features/client-app/).
  - "no option to update a routine after changing it mid-workout": the original has it
    (https://help.hevyapp.com/hc/en-us/articles/38387296276375-Update-Routine-vs-Keep-Original-Routine).

## 1. What they hate (thin)

| problem | evidence | sources |
| --- | --- | --- |
| Free plan caps: 4 routines, 7 custom exercises, ~3 months of graph history | pricing facts, consistent across 4 pages | help article "What will happen to my account if I switch from Pro to the free version?" (https://help.hevyapp.com/hc/en-us/articles/38279350428695-What-will-happen-to-my-account-if-I-switch-from-Pro-to-the-free-version); https://www.sensai.fit/blog/hevy-review-2026; https://aitoolsbakery.com/blog/hevy-review/; https://push-pull.app/blog/push-pull-vs-hevy |

This is a fact about the product, not a measured complaint. Whether users
*hate* it is unproven until reviews are read.

## 2. What is missing (thin, single-source claims from review articles)

| request | source |
| --- | --- |
| adaptive programming / progressive overload suggestions in free tier | https://strengthlab360.com/blogs/reviews-and-tests/hevy-workout-app-review-is-this-workout-tracker-enough-for-serious-athletes (search summary) |
| nutrition tracking | same, plus https://repreturn.com/hevy-app-review/ (search summary) |
| more than one progress photo per day | search summary, source page unclear: treat as unverified |

## 3. What is unsolved (hypothesis, not evidence)

People who train for years and want their **whole** history graphed without
a subscription. Built on the pricing fact above, unproven as a market.

## Fix plan (built in this MVP)

| fix | size | skill | evidence | status |
| --- | --- | --- | --- | --- |
| No caps on routines or custom exercises in the free app | S | build | pricing fact | done (F02-E2 test saves 6 routines) |
| All-time charts and records free | S | build | pricing fact | done (S09 "Progress, all time") |
| Export every workout to CSV from Settings, free | S | build | your data is yours; not checked whether the original gates it | done |
| Private by default: no account needed, data on the device | M | build | positioning, no evidence of demand yet | done |

Each is a row in `features.csv` with `original` = `no`.

## Angle (pick one after reading real reviews)

```
A. For lifters who hit a free-plan wall at routine five,
   Barline keeps every routine, exercise and chart free, forever.
   Evidence: pricing fact (4 sources). User demand: not measured.

B. For lifters who want their log private,
   Barline works with no account and keeps the data on your phone, exportable any time.
   Evidence: none yet. Hypothesis.

C. For people who just want a fast log, no feed,
   Barline is the gym notebook with a rest timer and a graph, nothing else.
   Evidence: alternativeto.net lists several "no social" alternatives (e.g. Volm), which
   suggests demand exists: https://alternativeto.net/software/hevy-workout-tracker
```

**Recommended: A**, because it is the only one tied to a verifiable fact.
Re-rank after 100+ real reviews.
