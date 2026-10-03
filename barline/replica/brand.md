# Brand: Barline

## Name

Angle (fixes.md, option A): every routine, exercise and chart free.

20 candidates: Barline, Platebook, Repledger, Liftnote, Ironpage, Setcard,
Gripnote, Benchmark Log, Loadline, Tally, Racked, Chalkline, Notch, Grindbook,
Kilo, Steadyset, Barpath, Logbar, Plateau (rejected: means "stall"), Spotter.

Cut to 5 (not similar in sound, look or meaning to the original's name; short;
spellable):

| name | why |
| --- | --- |
| **Barline** (chosen) | the bar you lift + the line your progress draws; also a music term (a measure), so it reads as rhythm and structure |
| Chalkline | gym chalk + a straight line; longer |
| Loadline | load = weight; a ship's load line is a known term |
| Setcard | a card per set: very literal |
| Notch | short, "notch it up"; likely crowded |

## Checks (none run yet: this environment cannot reach these sites)

| check | Barline | Chalkline | Loadline | Setcard | Notch |
| --- | --- | --- | --- | --- | --- |
| USPTO tmsearch.uspto.gov, classes 9 and 42 | to run | to run | to run | to run | to run |
| EUIPO eSearch / TMview | to run | to run | to run | to run | to run |
| Canada trademarks database | to run | to run | to run | to run | to run |
| WIPO Global Brand Database | to run | to run | to run | to run | to run |
| domain (barline.app, getbarline.com) | to run | to run | to run | to run | to run |
| App Store and Play exact name | to run | to run | to run | to run | to run |
| handles X, Instagram, TikTok, GitHub | to run | to run | to run | to run | to run |
| web: "name + workout app" | to run | to run | to run | to run | to run |

Screening only, not legal clearance. If any row for Barline comes back taken
in class 9/42, switch to the next name: the code uses the name in only a few
places (index.html, manifest, Home title, CSV filename, sw.js cache key).

## Palette

Dark-first neutrals plus **Ember** `#ff8a3d` as the accent (orange family; the
original's accent is a blue, so no nearby hue). All 16 text/background pairs
pass AA (contrast.py, 0 failures). The original's exact brand hex was not
measured (no screenshots were possible), so `brand.json` lists no colours;
add them after measuring from your own phone.

## Logo brief

- Idea: a barbell seen side-on whose bar continues into a rising line.
- Mark: symbol + wordmark; symbol alone for the app icon.
- Must read at 16px (favicon) and as a 1024px app icon with no transparency.
- Deliverables: SVG, 1024x1024 iOS icon, favicon set, 1200x630 social image.
- Must not resemble the original's mark: no shared shape, colour pair or
  letterform trick. Put their logo beside the drafts and check.
- Placeholder in the repo: `public/icon.svg` (plain bar and two plates).

## Voice: direct, calm, a bit dry

| word | not |
| --- | --- |
| direct | not blunt |
| calm | not flat |
| dry | not sarcastic |

| do | don't |
| --- | --- |
| "Tick at least one set as done, then finish." | "Oops! Something went wrong 😅" |
| "Saved. Nice work." | "AMAZING WORKOUT, BEAST!!!" |
| "Make as many as you need. There is no limit." | "Upgrade to unlock more" |
| "Every set you logged in this session will be gone." | "Are you sure?" |
| numbers first, adjectives last | hype words |

The 10 most-seen strings in the clone were written in this voice from the
start (Start empty workout, Empty bar, Add exercise, Finish, Save workout,
Saved. Nice work., No workouts yet, Nothing to save yet, Discard this
workout?, No history yet).

## Sweep

`python3 ../../replica-brand/sweep.py .. --config brand.json` from this
folder (or `python3 ../replica-brand/sweep.py . --config replica/brand.json`
from `barline/`): **Clean**, exit 0, on 2026-10-03.
