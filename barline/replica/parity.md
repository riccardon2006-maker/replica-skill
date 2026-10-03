# Parity: Barline vs Hevy (core logging slice)

Date: 2026-10-03

| measure | score |
| --- | --- |
| **feature parity** (parity.py) | **97.5 / 100**, must-haves 17 of 17 |
| layout score per screen (imgdiff.py) | **not computed**: no screenshots of the original (network blocked, no account used) |
| open bugs | S1 0, S2 0 |

Read the 97.5 with care: the feature matrix comes from a recon built on
search-result summaries of public pages, not on using the original. A real
walkthrough will almost certainly add rows (and lower the score). It measures
the slice in scope, not "all of Hevy": the social network, exercise media,
wearables, health sync and coaching are left out on purpose.

## Missing, in build order

1. [should] other body measurements (waist, arms, body fat...) and progress photos: S10 is weight-only
2. [could] warm-up calculator
3. setting: pre-fill from last session instead of routine targets (found in the build, not yet a matrix row)
4. importer from other apps' CSV exports (positioning: switching cost)
5. drag-and-drop reordering (buttons work today)

## Layout diff, to run

Take screenshots of the original on your own phone at 390x844, same state as
`clone-screens/` (sample-sized data, same tab), save as `screens/S01.png`...:

    python3 ../../replica-diff/imgdiff.py screens/S05.png clone-screens/S05.png --json > diffs/S05.json
    python3 ../../replica-diff/parity.py features.csv --visual diffs/*.json --markdown > parity.md

## Behaviour diff (from the original's help docs, not hands-on)

| flow | original does | clone does | fix or keep |
| --- | --- | --- | --- |
| F01 log | start empty, add, tick, finish | same; ticking an empty set copies last time's numbers | keep |
| F03 rest | timer skips before drop sets | same, plus skips inside a superset until the last exercise | keep |
| F02 routine changed | "Update routine / keep original" on finish | checkbox on the save screen | keep |
| sign-up | account required | none | keep (the angle) |
| happy-path taps, 1 exercise x 3 sets | not measured | 10 (Start, Add, pick, Add 1, 3x tick, Finish, Save ticked, Save) | measure the original by hand |

## Verdict

**Shippable as a web MVP** by the skill's rule (all must-haves, feature score
80+, no open S1/S2). **Not yet "better than the original"**: the fixes are
built, but the evidence that users want them is thin (0 reviews collected).
