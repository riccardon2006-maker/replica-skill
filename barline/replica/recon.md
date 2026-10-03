# Recon map: Hevy (iOS / Android, plus web)

Scope: the core loop of a strength-training log: build routines, log a live
workout set by set with a rest timer, save it, see history, personal records
and progress per exercise. Body measurements. Not the social network, not the
coaching product (Hevy Coach), not Apple Watch / wearables.
For: the user's own product to sell, delivered first as a mobile-first web
app (installable PWA) so it runs on any phone with no store review.
Date: 2026-10-03

## How this recon was done (and what was not possible)

The environment's network proxy blocks direct reads of hevyapp.com,
help.hevyapp.com, apps.apple.com, Reddit and every review site tried. Only a
web search engine was reachable. So every row below comes from **search
result titles and summaries of public pages** (listed in Sources), plus the
public, widely documented behaviour of workout loggers in this category. No
account was used, no screenshots of the original were taken, nothing was
scraped. Because of this:

- `replica/screens/` is empty. replica-diff's layout score cannot be computed
  until the user adds screenshots from their own phone (see parity.md).
- Confidence in the data model is medium at best; it is inferred, not seen.
- Recommended before selling: the user opens the original on their own phone
  and walks F01 to F06 with this map, correcting rows.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | help center: features guide | https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2025-Features-Guide | title + search summary only (fetch blocked) |
| 2 | help center: set types | https://help.hevyapp.com/hc/en-us/articles/34896293707927-Set-Types-in-Hevy-Explained-Drop-Sets-Warm-Up-Sets-and-More | normal, warm-up, drop, failure; rest timer skips before a drop set |
| 3 | help center: routines | https://help.hevyapp.com/hc/en-us/articles/34953606698903-Build-a-Workout-Program-Create-Organize-Routines | routines and folders |
| 4 | help center: Pro to free | https://help.hevyapp.com/hc/en-us/articles/38279350428695-What-will-happen-to-my-account-if-I-switch-from-Pro-to-the-free-version | free: 4 routines, 7 custom exercises |
| 5 | marketing: track workouts | https://www.hevyapp.com/features/track-workouts/ | title only |
| 6 | marketing: set types | https://www.hevyapp.com/features/workout-set-types/ | title only |
| 7 | marketing: tutorial | https://www.hevyapp.com/hevy-tutorial/ | "log workouts, track progress & socialize" |
| 8 | third-party review | https://www.sensai.fit/blog/hevy-review-2026 | pricing $2.99/mo, $23.99/yr, $74.99 lifetime (search summary) |
| 9 | third-party review | https://aitoolsbakery.com/blog/hevy-review/ | free limits, gaps |
| 10 | third-party review | https://repreturn.com/hevy-app-review/ | free vs Pro |
| 11 | third-party review | https://strengthlab360.com/blogs/reviews-and-tests/hevy-workout-app-review-is-this-workout-tracker-enough-for-serious-athletes | weaknesses |
| 12 | alternatives list | https://alternativeto.net/software/hevy-workout-tracker | category neighbours |

## Core loop

Start a workout (empty or from a routine), log each set's weight and reps,
tick it done, rest timer runs, finish and save; then see progress and PRs.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | tab 1 | recent workouts as cards (own feed) | WorkoutCard, TabBar | empty, filled |
| S02 | Workout tab | tab 2 | start empty workout, list routines and folders | Button, RoutineCard, Folder | empty, filled |
| S03 | Routine editor | S02 > new / edit | name, exercises, planned sets, rest per exercise, superset, notes | Input, ExerciseBlock, SetRow | new, editing, limit reached (free) |
| S04 | Exercise picker / library | add exercise from S03/S05, tab | search and filter by muscle and equipment, multi-select | SearchInput, Chip, ExerciseRow | empty search, filled |
| S05 | Live workout | S02 start | timer, volume, sets; tick sets; rest timer; set type; RPE; notes; previous values | SetRow, RestTimer sheet, Stopwatch | in progress, minimised bar, discard confirm |
| S06 | Save workout | S05 finish | title, description, duration, volume, sets; save | Input, Stat | incomplete sets warning |
| S07 | Workout detail | tap card on S01/S08 | sets per exercise, PR badges, edit, delete, save as routine | Stat, PR badge | filled |
| S08 | Profile | tab 3 | totals, weekly chart, calendar of workouts, history | BarChart, Calendar | empty, filled |
| S09 | Exercise detail | tap exercise | history, best set, est. 1RM, charts, records | LineChart, RecordRow | no history, filled |
| S10 | Measurements | S08 | body weight and body measurements over time | Input, LineChart | empty, filled |
| S11 | Settings | S08 gear | units kg/lb, default rest, RPE toggle, export data | Toggle, Select | default |
| S12 | Custom exercise | S04 > create | name, equipment, primary muscle, type | Input, Select | new, limit reached (free) |

## Flows

```
F01 Log an empty workout
    S02 -> S05 -> S04 (add exercise) -> S05 (fill sets, tick) -> S06 -> S07
    happy path clicks: ~10 for one exercise with 3 sets
    edge: no exercises added, sets left unticked, discard workout, reload mid-workout

F02 Create a routine and start it
    S02 -> S03 -> S04 -> S03 (sets, rest) -> save -> S02 -> start -> S05
    edge: empty name, duplicate exercise, superset pair, reorder

F03 Rest timer
    S05 tick a set -> timer counts down -> +15s / -15s / skip
    edge: next set is a drop set (timer does not start), page in background

F04 Review progress on an exercise
    S08 or S07 -> S09 (history, est. 1RM, best set, chart)
    edge: no history, bodyweight exercise (no weight)

F05 Log body weight / measurements
    S08 -> S10 -> add entry -> chart
    edge: decimal input, unit switch

F06 Edit or delete a past workout
    S01 -> S07 -> edit / delete / save as routine
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger | default, pressed, focus, disabled | all |
| TabBar | 3 tabs (Home, Workout, Profile) | active | all |
| WorkoutCard | feed | default | S01, S08 |
| RoutineCard | with Start button, menu | default | S02 |
| ExerciseBlock | logging, editing | with notes, superset | S03, S05, S07 |
| SetRow | normal, warm-up (W), drop (D), failure (F) | pending, done, with RPE, with "previous" | S03, S05 |
| RestTimer | bottom sheet / bar | running, done | S05 |
| SearchInput + Chip filters | muscle, equipment | | S04 |
| Stat | duration, volume, sets, PRs | | S05, S06, S07, S08 |
| Charts | bar (weekly), line (exercise, body weight) | empty | S08, S09, S10 |
| Calendar | month | days with workouts | S08 |
| Modal / ConfirmDialog | destructive | | S05, S07 |

## Inferred data model

```
User         id, username, units (kg|lb), default_rest_s, rpe_enabled
             evidence: S11, source 2 (RPE in settings)   confidence: medium
Exercise     id, name, equipment, primary_muscle, other_muscles,
             type (weight_reps | bodyweight_reps | weighted_bodyweight |
             assisted_bodyweight | duration | distance_duration),
             custom (bool), user_id (custom only)
             evidence: S04, S12, source 4 (custom exercise limit)   confidence: medium
Routine      id, user_id, folder_id, title, notes, position
             evidence: S02, S03, source 3   confidence: high
RoutineExercise  id, routine_id, exercise_id, position, rest_s, notes, superset_id
             RoutineSet  id, routine_exercise_id, type, weight, reps
Workout      id, user_id, title, description, started_at, ended_at, routine_id
             evidence: S05, S06, S07   confidence: high
WorkoutExercise  id, workout_id, exercise_id, position, notes, superset_id
WorkoutSet   id, workout_exercise_id, position, type (normal|warmup|drop|failure),
             weight_kg, reps, duration_s, distance_m, rpe, done
             evidence: source 2   confidence: high
Measurement  id, user_id, date, body_weight_kg, body_fat_pct, waist_cm, ...
             evidence: S10, source 8 (Pro adds more measurements)   confidence: medium
```

Relationships: User 1-n Routine, Routine 1-n RoutineExercise 1-n RoutineSet,
User 1-n Workout 1-n WorkoutExercise 1-n WorkoutSet, Exercise 1-n
(Routine|Workout)Exercise, User 1-n Measurement.

## Feature matrix

See `features.csv`. Must: 17, should: 11, could: 6, skip: 5.

## Out of scope (cannot or should not be cloned)

- The social network and its users (followers, likes, comments, discovery):
  the network is what the app owns. A follow system can be built later, but
  the people cannot be cloned.
- Their exercise demo videos and illustrations: owned assets. The clone ships
  a library of exercise *names* (common, generic) with no media.
- Hevy Coach (coaching marketplace) and Hevy Trainer programming content.
- Wearable apps (Apple Watch, Wear OS) and Apple Health / Google Fit sync:
  native only, not possible in a web build.
- Paid Pro gating as-is: replaced on purpose (see fixes.md).

## Size

Screens 12, flows 6, entities 8. Hard parts: a live workout that survives
reload and offline; a rest timer that is correct when the tab is in the
background; unit conversion kg/lb stored once; PR detection. Size: M (a few
weeks for a production version; the build here is the web MVP).
