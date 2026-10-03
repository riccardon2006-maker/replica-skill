# Test plan: Barline

Env: local Vite dev server, clean localStorage per test, sample data where noted.
Projects: mobile (390x844, Pixel 7 profile) and desktop (1440x900). Every spec
fails on console errors, page errors and 5xx; axe scans on each main screen.

| case | flow | type | expected | auto |
| --- | --- | --- | --- | --- |
| F01-H1 | log empty workout | happy | 3 sets logged, volume 1335 kg, saved, card on Home | e2e |
| F01-E1 | | edge: no ticked sets | "Nothing to save yet", stays on workout | e2e |
| F01-E2 | | edge: some sets unticked | warned, only ticked sets saved | e2e |
| F01-E3 | | edge: reload mid-workout | values and ticks still there | e2e |
| F01-E4 | | edge: discard | confirm, then gone, no resume bar | e2e |
| F01-E5 | | edge: leave mid-workout | resume bar on every tab | e2e |
| F01-E6 | | edge: double tap Save | exactly one workout stored | e2e |
| F01-E7 | | edge: long name, emoji, accents | no horizontal overflow | e2e |
| F01-N1 | | negative: letters in weight | ignored | e2e |
| F02-H1 | routine | happy | created, started, targets pre-filled, name carried | e2e |
| F02-H2 | | happy: changed mid-workout | offer to update routine; next start has 4 sets | e2e |
| F02-E1 | | edge: empty name | "Give the routine a name." | e2e |
| F02-E2 | | edge: more than 4 routines | 6 saved, no paywall (deliberate fix) | e2e |
| F02-E3 | | edge: superset | both exercises marked Superset in the workout | e2e |
| F03-H1 | rest timer | happy | starts at 1:30, +15s, skip closes | e2e |
| F03-E1 | | edge: next set is a drop set | no timer | e2e |
| F03-E2 | | edge: reload while resting | time keeps counting from timestamp | e2e |
| F03-E3 | | edge: rest off | no timer | e2e |
| F03-M1 | | manual: tab backgrounded on a phone, vibration at 0 | time correct on return; vibrates on Android | manual |
| F04-H1 | progress | happy | exercise chart, records, history | e2e |
| F04-H2 | | happy | heavier set -> PR shown on save | e2e |
| F04-H3 | | happy | profile totals, weekly chart, calendar | e2e |
| F04-E1 | | edge: no history | "No history yet" | e2e |
| F04-E2 | | edge: bodyweight | records in reps | e2e |
| F05-H1 | measurements | happy | entry listed | e2e |
| F05-E1 | | negative: zero | error shown | e2e |
| F05-E2 | | edge: lb then kg | 180 lb -> 81.6 kg | e2e |
| F06-H1 | edit workout | happy | edited value shown | e2e |
| F06-H2 | | happy: delete | confirm, gone | e2e |
| F06-H3 | | happy: save as routine | routine editor opens with name | e2e |
| F06-E1 | | negative: unknown id | clear message | e2e |
| S12 | custom exercise | happy + duplicate name | created and usable; duplicate refused | e2e |
| S11 | settings | RPE column, CSV export | column appears; file downloads | e2e |
| KB-1 | keyboard only | start, add, log, tick | works without a mouse | e2e |
| OFF-1 | offline | production build, DevTools offline, reload | app shell opens, logging works | manual |
| SR-1 | screen reader | VoiceOver / TalkBack through F01 | every control named | manual |
