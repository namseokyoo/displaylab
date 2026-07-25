# Delta E Search Landing Implementation Plan

**Goal:** Turn Display Lab’s existing Delta E calculator into a focused, indexable answer page without duplicating calculation logic.

## Scope

1. Add `/delta-e-calculator` to the React router as a lazy-loaded page.
2. Render the existing `DeltaECalculator` unchanged inside a standalone page.
3. Add English search-facing copy: CIEDE2000/CIE94/CIE76 explanation, three bounded worked examples, FAQ section, canonical metadata, and combined SoftwareApplication + FAQPage JSON-LD.
4. Update the route test before implementation, then run test/lint/type-check/build and production smoke after deploy.

## Non-goals

- No new Delta E math or tolerance/quality acceptance claim.
- No analytics, AdFit configuration, ad-account, paid promotion, or fabricated traffic/revenue change.
- No alteration of the existing color-calculator route.

## Verification

- Router test resolves `/delta-e-calculator`.
- Existing `delta-e` math tests and app test pass.
- `npm run lint`, `npm run type-check`, and `npm run build` pass.
- Deployed route exposes its title, calculator form, FAQ, canonical URL, and JSON-LD in production.
