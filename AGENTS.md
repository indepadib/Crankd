# VROOQ — Engineering & Product Working Agreement

This document applies to future coding agents working in this repository. It is a project-level guide, not proof that any external skill is installed or available in every execution environment.

## Objective

Build VROOQ as an automotive community where a vehicle has a lasting digital identity. Preserve the existing web (Next.js), mobile (Expo), and Supabase architecture unless a migration is explicitly approved. Do not present mock data, mock payments, artificial engagement, or simulated verification as real.

## Delivery rules

1. Audit the actual code and behavior before changing it. Separate confirmed findings from hypotheses.
2. Plan a narrow, testable change; propose a branch and PR rather than editing production blindly.
3. Security first: least privilege, RLS on exposed data, ownership checks, protected proof documents, never a service-role key in browser code.
4. Maintain accessible forms and navigation, mobile responsiveness, keyboard behavior, sufficient contrast, reduced-motion preferences, and visible loading/error/empty states.
5. Keep design restrained and coherent with the existing dark automotive identity; prioritize typography and hierarchy over effects.
6. Use honest, concise copy. Remove invented social proof, invented metrics, and deceptive empty-state placeholders.
7. Check signup, login, account recovery, garage creation, posting, content discovery, and marketplace journeys end-to-end before calling a feature complete.
8. If an automated build, runtime test, deployment check, or live-site inspection was not executed, state that clearly.
9. Never deploy database migrations or payment functions without reviewing the live schema, environment configuration, and rollback plan.
10. Maintain a prioritized change log with expected user impact and verification evidence.

## Free upstream skill references

These are third-party open-source references, not dependencies vendored into this repository. Consult the actual instructions when the corresponding task applies; review updates, licenses, and any scripts before execution.

- [Apple Design — Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/apple-design): responsive feedback, interruptible motion, accessibility, restraint. Apply during interaction and UI reviews.
- [Grill Me — Matt Pocock](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me): challenge open product/architecture decisions and document the trade-offs. Do not turn straightforward bug fixes into unnecessary interviews.
- [Humanizer — Siqi Chen](https://github.com/blader/humanizer): review landing-page and in-product copy for generic AI language without changing factual claims.
- [Video Agent Skills — Melvyn Malherbe](https://github.com/Melvynx/video-agent-skills): video scripts, editing and publishing workflows when actual footage/assets and distribution intent are supplied. Do not treat demo assets as a real video production.
- [Marketing Skills — Corey Haines](https://github.com/coreyhaines31/marketingskills): positioning, signup conversion, onboarding, SEO, analytics and acquisition. Ground decisions in `.agents/product-marketing.md` and measured data, not guesses.

At review time these upstream repositories published MIT licenses. Keep original attribution/license notices when copying substantial portions of source material.

## Review gates

- Product: user journey defined; empty, success, error and offline states intentional.
- Design: responsive, tap targets, keyboard/focus, reduced-motion, fast perceived response, no aesthetic clutter.
- Engineering: auth, authorization, data integrity, input validation, no fake success, no secrets, no broken links.
- Growth: truthful positioning, useful first-session activation, measurable events, no vanity metrics presented as traction.
- Release: lint, typecheck, build, smoke tests, and reviewer signoff. Record unavailable checks explicitly.

## Current status

See `docs/AUDIT-2026-11-21.md` for evidence and the next priorities. Changes proposed in PRs are not live until merged and deployed.
