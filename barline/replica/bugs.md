# Bugs: Barline

Found by the e2e suite (first run: 48 passed, 22 failed across 2 viewports).

### BUG-001: saving a workout lands on the Train tab instead of the saved workout
- Severity: S2
- Flow / case: F01 / F01-H1, F06-H1..H3
- Screen: S06
- Steps: log a set, Finish, Save workout.
- Expected: the saved workout opens with "Saved. Nice work."
- Actual: redirected to /workout; the workout was saved but the confirmation and PRs never showed.
- Evidence: failing tests F01-H1, F04-H2, F06-H1 (waiting for "Edit workout").
- Cause: clearing the active workout re-rendered S06, whose "no workout -> /workout" redirect beat the navigate call.
- Status: fixed (savedRef guard in SaveWorkout.tsx), tests kept.

### BUG-002: empty-state titles are not headings
- Severity: S3 (screen readers cannot jump to them)
- Screens: S01, S07, S09, S03
- Evidence: getByRole('heading', { name: 'No workouts yet' }) not found.
- Status: fixed (Empty renders an h2).

### BUG-003: set rows used ARIA row roles without cells
- Severity: S3 (axe: aria-required-children)
- Screen: S05 with RPE on
- Status: fixed (rows are labelled groups: "Set 1", header hidden from AT).

### BUG-004: "Last" column truncated at 390px
- Severity: S4
- Screen: S05
- Status: fixed (numbers only, unit in the column header, full text in the label).

Final run: **72 passed, 0 failed** (mobile 390x844 + desktop 1440x900),
axe clean on every scanned screen, 13 unit tests passed.
Open: S1 0, S2 0, S3 0, S4 0.

## To check (not reproduced)

- Rest timer vibration on Android when the screen is locked (needs a real phone).
- iOS Safari evicts localStorage for sites not added to the Home Screen after 7 days
  without a visit. Installed PWAs are exempt. Phase 2 sync is the real answer;
  until then the app should nudge users to install and to export.
