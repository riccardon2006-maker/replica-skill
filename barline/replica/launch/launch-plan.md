# Launch plan: Barline

1. **Before anything public:** run the trademark and domain checks in
   brand.md, then collect 100+ real reviews of the original (feedback.md) and
   re-rank the angle. If users do not care about the free-plan caps, change the angle.
2. **Beta list:** a one-field email form on `/welcome`, needs a backend
   (Resend audience or a Supabase table). Target 50 lifters.
3. **Analytics and errors live:** Plausible or Umami (no cookie banner), Sentry.
4. **Where unhappy users talk:** the Reddit and forum threads found while
   collecting reviews (none collected yet). Post as yourself, say what you
   built, never pretend to be a user.
5. **Show HN / Product Hunt:** lead with "a lifting log with nothing locked,
   works offline with no account", link the live app, not a waitlist.
6. **First 10 users by hand:** people at your own gym. Watch them log one
   workout without help; count the taps; fix what trips them.
7. **Stores later:** the listing in listing.json passes listing.py. An iOS
   build needs a wrapper (Capacitor or Expo) and Apple's 4.1 review: lead
   the screenshots with the free-caps fix and the brand, not the parity screens.
