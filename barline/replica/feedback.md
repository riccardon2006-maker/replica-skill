# Feedback: Hevy

**Sample size: 0 reviews.** `reviews.py` was run on `reviews.csv` and exited 2:
no usable rows.

Why: this environment's network policy blocks the App Store page and its
reviews RSS feed, Google Play, Reddit, Hacker News's Algolia API, G2,
Trustpilot, justuseapp.com and the original's own site. Only a search engine
was reachable, and search-result summaries are not verbatim reviews, so none
were copied into the sheet. Nothing here is invented.

To fill it (about an hour, by hand, as the skill describes):

1. App Store reviews RSS: `https://itunes.apple.com/us/rss/customerreviews/id=1458862350/sortBy=mostRecent/json`
   (app id from the public App Store URL). Copy rows into `reviews.csv`.
2. Google Play listing `https://play.google.com/store/apps/details?id=com.hevy`, sort by newest, 1 to 3 stars.
3. Reddit search: "hevy alternative", "switched from hevy", "hevy pro worth it".
4. Then: `python3 ../../replica-entrepreneur/reviews.py reviews.csv --out feedback.md`
