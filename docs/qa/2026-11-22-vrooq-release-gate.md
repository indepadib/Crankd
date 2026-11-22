# VROOQ release gate — interactions / TV / For You

Environment: isolated Supabase staging, never production. Dependencies: #54 → #56 → #52.

## Security acceptance
- Anonymous users cannot read or insert individual interactions.
- User A can read, insert, delete only A's interactions; impersonating B is denied.
- Two concurrent likes from A on one post produce exactly one row; unlike removes it.
- Like counts match actual interactions across accounts and refreshes.
- Privileged trigger owner, grants, and search_path reviewed; direct invocation forbidden.
- post_comments username spoofing and moderation assessed separately.
- Rollback and data retention reviewed.

## Product acceptance
- VROOQ TV shows real videos only; no fake likes, comments or checkout.
- Login required for like; failed requests do not change visible state.
- Repeated taps disabled while pending; refresh and account switch reflect server truth.
- Feed and TV counts reconcile after refresh.
- For You with no interactions returns posts; staging-seeded signals affect ranking without leaks.
- Share/deep links work on iOS Safari, Android Chrome, and desktop.
- Keyboard and screen-reader behavior verified.

## Release decision
No production migrations or dependent PR merge without passing tests, green CI and documented evidence. User provides final release acceptance.