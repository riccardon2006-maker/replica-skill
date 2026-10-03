# Pricing: Barline

## The market (read 2026-10-03, from search-result summaries; recheck before launch)

| app | free plan | paid | source |
| --- | --- | --- | --- |
| the original | unlimited logging; 4 routines, 7 custom exercises, ~3 months of charts | $2.99/mo, $23.99/yr, $74.99 lifetime (US) | https://www.sensai.fit/blog/hevy-review-2026, https://help.hevyapp.com/hc/en-us/articles/38279350428695-What-will-happen-to-my-account-if-I-switch-from-Pro-to-the-free-version |
| others in the category | see https://alternativeto.net/software/hevy-workout-tracker | | |

Reviewer complaints about price and billing: **not measured** (0 reviews, see feedback.md).

## Model

The log is free with no caps. Revenue comes from things that cost money to run.

| tier | for | price | what |
| --- | --- | --- | --- |
| Free | everyone | $0 | everything in the app today, on one device |
| Sync | lifters with two devices or who want a backup | $1.99/mo or $14.99/yr | cloud backup and sync across devices (phase 2, not built) |
| Lifetime | people who hate subscriptions | $39 once | Sync forever |

Annual is ~37% off monthly. No per-seat anything.

Billing rules built in from day one: one-click cancel in the Stripe Customer
Portal, a renewal email 7 days before every annual renewal, no trial that
silently converts.

## Stripe products to create (the user creates them, test mode first)

- Product "Barline Sync": prices `sync_monthly` $1.99/month, `sync_yearly` $14.99/year
- Product "Barline Lifetime": price `lifetime` $39 one-time
