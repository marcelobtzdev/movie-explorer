# Quickstart: Popular Movies List

**Feature**: 001-popular-movies | **Date**: 2026-10-18

This guide validates the feature end-to-end after `/speckit-implement` completes. It does not duplicate implementation code — see `data-model.md` and `contracts/` for the data shapes, and `tasks.md` for the build steps.

## Prerequisites

1. Node satisfying `react-native@0.88.0`'s `engines.node` (`^22.13.0`, `^24.3.0`, or `>=26.0.0` — see `research.md` §1). Verify: `node --version`.
2. pnpm installed, with `node-linker=hoisted` in the repo's `.npmrc` (required for React Native's native linking).
3. Android: Android Studio + an emulator or device; `ANDROID_HOME` set. iOS (macOS only): Xcode + CocoaPods, a simulator or device.
4. A TMDB account and a **TMDB API Read Access Token** (not the v3 API key) from https://www.themoviedb.org/settings/api.
5. `.env` created from `.env.example` at the repo root:
   ```
   TMDB_BASE_URL=https://api.themoviedb.org/3
   TMDB_ACCESS_TOKEN=<your TMDB Read Access Token>
   ```
   The app fails fast at startup with a clear message if either is missing or malformed (Zod validation in `src/constants/env.ts`).

## Install

```sh
pnpm install
cd ios && pod install && cd ..
```

## Run and validate the primary flow (maps to spec User Story 1, P1)

```sh
pnpm android   # or: pnpm ios
```

Expected, within ~2 seconds of the app opening (SC-001):
- Header shows "MovieExplorer", subtitle "Populares", a static avatar.
- Category tabs row ("Populares" active; the other two do nothing when tapped).
- A featured card for the first popular movie (wide image, rating `X.X / 10 TMDB`, title, up to 3 genre names, release year).
- Section title "Películas Populares" followed by a two-column grid of the remaining movies (poster, rating badge, 1-line title, "YYYY • Genre1 / Genre2" footer).
- A bottom menu ("Populares" active; the other three items do nothing when tapped).
- Tapping any card (featured or grid) does nothing (FR-023).

## Validate infinite scroll (User Story 2, P2)

1. Scroll to near the bottom of the grid repeatedly.
2. Expected: a small spinner appears at the list's footer while the next page loads, then more cards append with no blank gap; no movie's poster/title repeats (SC-005). Scroll continuously past 100 movies without any button (SC-002).
3. Turn off network mid-scroll (airplane mode) right as a next page would load. Expected: already-loaded movies stay visible, and a footer message with a "Reintentar" action appears in place of the spinner (FR-017). Turn network back on and tap "Reintentar": the failed page loads and appends normally.
4. Scroll all the way to TMDB's last available page (or mock `total_pages` low in a test). Expected: no further fetch attempt, no error, no footer indicator (FR-013).

## Validate loading / error / empty states (User Story 3, P3)

- **Cold start, slow/no network**: expected the full-screen skeleton (tab/featured/section/grid placeholders, real header and bottom menu visible) until content or an error arrives (FR-015).
- **Initial failure** (airplane mode before first load, or an invalid `TMDB_ACCESS_TOKEN`): expected a centered error message + "Reintentar" between the tabs and the bottom menu; header/tabs/bottom menu stay visible (FR-016). Tapping "Reintentar" re-requests genres first, then the movie list.
- **Empty result**: not reproducible against the real TMDB `popular` endpoint (it is never empty); validate via the `movies.screen.test.tsx` suite's mocked empty response instead (see Testing below) — expected a centered friendly empty message (FR-018).
- **Exactly one movie**: validate via the mocked single-item response — expected only the featured card, no grid, no empty message (Acceptance Scenario 8).

## Validate edge cases

- A movie with `poster_path: null` (and the featured movie with `backdrop_path: null`) → neutral placeholder, not a broken image.
- A movie with `vote_average: 0` → dash instead of a number.
- A movie with `release_date: ""` → dash instead of a year.
- A long title → clamped to the card's line limit (2 lines featured / 1 line grid) with an ellipsis, card height unchanged.
- Enable the system's largest font-scaling setting (Android: Settings → Display → Font size; iOS: Settings → Accessibility → Larger Text) → text scales, layout does not break, no clipped/overlapping text.
- VoiceOver/TalkBack: focus a grid card → announces "{title}, {year}, valoración {rating}" (or the "sin valoración"/"año desconocido" variants); focus an inactive tab/bottom-menu item → announced as unavailable; every retry action has an accessible label and a tappable area of at least 44×44 pt.

## Run the quality gate

```sh
pnpm pr:check   # = lint:check && types && test
```

Expected: `lint:check` (ESLint, zero warnings) and `types` (`tsc --noEmit`, TypeScript 6.0.3) pass; `test` (Jest + `@testing-library/react-native`, coverage) passes with the test list enumerated in `tasks.md` (mappers, services, `use-popular-movies`, `use-movie-genres`, `getGenreNames`, format utils, error-overlay flows, `use-network-status`, env validation, all new atoms/molecules/organisms, `MoviesSkeleton`, and every `movies.screen` state from this guide).

## Build verification (both platforms, constitution Definition of Done)

```sh
pnpm android
pnpm ios
```

Both must build and launch without errors; this is a hard gate before the feature is considered done (constitution Principle XII).
