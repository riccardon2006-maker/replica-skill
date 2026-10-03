# Components: Barline

All values come from `tokens.json` via `src/styles/tokens.css`. Rendered in
isolation at `/design` (screenshot: `../clone-screens/design-system.png`).

```
Button
  variants  primary, secondary, ghost, danger, success
  sizes     sm 32px, md 40px, lg 48px; block = full width
  states    default, hover, focus-visible (2px ring, accent), disabled (45% opacity)
  tokens    bg accent / surface-2, text on-accent / text, radius md, font sm/600
  a11y      real <button> or <Link>; icon-only buttons carry aria-label
  used on   all

TabBar      Home / Train / You, fixed bottom, 64px; active = text, inactive = text-muted; <nav aria-label="Main">
ResumeBar   above TabBar while a workout runs; link "Resume workout in progress"
TopBar      sticky 56px; back button (aria-label "Back"), title h1, actions slot
Card        surface, 1px border, radius lg, padding 16; .link variant hover border-input
List        surface rows 56px min, 1px dividers; rows are links or buttons
Input/Select/Textarea  44px min, surface bg, border-input 1px (3.6:1 on surface), label above in text-muted
NumInput    numeric text input that accepts partial decimals ("62."), rejects letters, selects on focus
Chip        32px pill filter, aria-pressed; pressed = accent bg
Badge       pill, warning text, for PR and Superset
SetRow      grid: type | last | weight | reps | (RPE) | done; done row bg done-row;
            type button W/D/F/1..n opens the set menu; check button aria-pressed
RestTimer   fixed bottom sheet: progress bar (accent), mm:ss role=timer, −15s, +15s, Skip;
            "Rest over" announced via aria-live
Dialog      bottom sheet on phones, centred at ≥600px; role=dialog, aria-modal, focus first field,
            Escape closes, focus returns to the opener
Confirm     Dialog with Cancel + destructive/primary action
Stat        label (xs, muted) over value (bold, tabular numbers), 3-column grid
BarChart / LineChart  SVG, tokens only, role=img with a text summary in aria-label
Calendar    7-column month grid, trained days filled accent, today outlined
Segmented   .seg buttons with aria-pressed
Empty       icon, h2 title, body, action
```
