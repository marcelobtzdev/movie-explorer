# Implementation Plan: Popular Movies List

**Branch**: `001-popular-movies` | **Date**: 2026-10-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-popular-movies/spec.md`

## Summary

Scaffold the MovieExplorer React Native project (it does not exist yet) and build its main screen: a dark-themed, header + category-tabs + featured-card + "Películas Populares" grid + bottom-menu layout showing TMDB's popular movies, with genre names resolved from a pre-fetched catalog, infinite-scroll pagination with de-duplication, and full-screen skeleton / inline error / empty / footer-retry states. Only the "Populares" tab and the infinite grid are functional; everything else in the layout (other tabs, bottom-menu items, card taps) is visual-only per spec. Technical approach: React Native 0.88 (New Architecture, Hermes) + TypeScript strict, TanStack Query v5 `useInfiniteQuery` for pagination (genres query gates the movies query), Zustand v5 for the two global error-overlay stores, FlashList v2 for the grid, Moti (`moti/skeleton`) on Reanimated 3.19.5 for the skeleton (pinned below latest-4.x for verified Moti compatibility — see `research.md` §2), custom Atomic-Design components styled with `StyleSheet.create` and dark-theme tokens, no i18n library (Spanish text constants only).

## Technical Context

**Language/Version**: TypeScript 6.0.3, strict mode (see `research.md` §4 for why not the newer `typescript@7.0.2`).

**Primary Dependencies**: `react-native` 0.88.0 (New Architecture, Hermes) · `react` 19.3.1 · `@tanstack/react-query` 5.104.4 · `zustand` 5.0.15 · `axios` 1.20.0 · `zod` 4.6.7 · `@react-navigation/native` 7.5.1 + `@react-navigation/native-stack` 7.21.0 + `react-native-screens` 4.30.0 + `react-native-safe-area-context` 5.10.1 · `@shopify/flash-list` 2.3.3 · `react-native-reanimated` 3.19.5 + `react-native-linear-gradient` 2.8.3 (power a project-owned shimmer `Skeleton` atom — ADR-0013 supersedes ADR-0012's `moti` choice, which turned out to have no usable non-Expo entry point) · `@react-native-community/netinfo` 12.0.1 · `react-native-config` 1.7.2 · `reactotron-react-native` 5.3.1 (dev only). Full pin list and rationale: `research.md` §4.

**Storage**: N/A — no persistence; TanStack Query's in-memory cache only (constitution Principle IV).

**Testing**: Jest 30.5.2 (`react-native` preset) + `@testing-library/react-native` 14.1.0, colocated `*.test.ts(x)`, v8 coverage (constitution Principle XI).

**Target Platform**: Android and iOS, via React Native CLI (bare workflow); must build and run on both before the feature is done.

**Project Type**: Mobile app (single React Native project at the repo root — no separate backend/frontend split, no monorepo).

**Performance Goals**: first batch visible within 2s of launch (SC-001); smooth scroll through 100+ movies with no blank gaps (SC-002); exactly one in-flight pagination request at a time (FR-014).

**Constraints**: Spanish (es-PY) only, no i18n library; single dark theme, no theme switching; offline/lost-connectivity must keep already-loaded movies visible (FR-019); every interactive element ≥44×44 pt with an accessible label; FlashList v2 requires the New Architecture (satisfied by RN 0.88's default).

**Scale/Scope**: one screen (`movies.screen`), two feature slices (`genres`, `movies`), the shared Atomic-Design component set and app-wide infrastructure (navigation, query client, error overlays, theme) that this first feature also scaffolds.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see "Post-Design Re-check" below.*

| Principle | Status | Notes |
|---|---|---|
| I. Feature Slice Architecture | PASS | `genres` and `movies` slices under `src/features/`, each with only the layers it needs (dtos, models, mappers, api, hooks, utils, components, screens for `movies`; no `screens`/`components` for `genres`), each with a barrel `index.ts`. Shared code in `src/components`, `src/hooks`, `src/stores`, `src/theme`, `src/vendors`, `src/utils`, `src/constants`. |
| II. Navigation with React Navigation | PASS | Single native stack, `ROUTES.MOVIES` registered now (`headerShown: false`, the screen renders its own `Header`); `ROUTES.MOVIE_DETAIL` is left for the 003 spec, not added here. Category tabs / bottom menu are plain components rendered by the screen, not navigators (constitution II explicitly allows this). |
| III. Server State with TanStack Query v5 | PASS | `genresKeys`/`moviesKeys` factories; `use-movie-genres` (`useQuery`, 24h cache) gates `use-popular-movies` (`useInfiniteQuery`, `enabled: genresQuery.isSuccess`) exactly as Principle III's "Genres" subsection specifies. |
| IV. Client State with Zustand v5 | PASS | Only the two existing global stores are needed by this feature (`useNetworkErrorStore`, `useServerErrorStore`); no feature-local store is needed (there is no search term yet — that arrives with 002). `useNotificationStore` is built now as shared infrastructure per Principle IX even though this feature's own flows don't push a toast. |
| V. Forms and Validation with Zod + React Hook Form | PASS (N/A for UI) | No form in this feature (search arrives in 002). Zod is still installed now, used for `src/constants/env.ts`'s startup validation, exactly as the Technology Stack table requires from the start. `react-hook-form`/`@hookform/resolvers` are **not** installed by this plan — they arrive with 002 per the constitution's own stack table. |
| VI. UI: Custom Components and Styling | PASS | All new atoms/molecules/organisms/templates match the constitution's Atomic Design table exactly (`Avatar`, `Chip`, `Skeleton`, `CategoryTabs`, `Header`, `BottomMenu`, …); dark-theme tokens used verbatim from the constitution's color table; `Skeleton` is a project-owned shimmer component per ADR-0013 (supersedes ADR-0012, whose `moti` entry point does not exist in the published package — see `research.md` §2). |
| VII. Performance and Optimization | PASS (search/debounce sub-rules N/A) | Lists/pagination/images sub-rules all apply and are implemented (FlashList v2, `numColumns: 2`, stable `keyExtractor`/`renderItem`, `React.memo`'d cards, `onEndReached` 0.5 threshold guarded against duplicate fetches, 500-page cap, de-dup by `movieId`, TMDB image sizes `w342`/`w780`, explicit image dimensions, placeholder/fallback). The *search debounce* and *prefetch-on-press-before-navigating* sub-rules are N/A here: this feature has no search bar and no card is pressable (FR-023); both apply starting with specs 002/003. |
| VIII. Vendor Wrappers | PASS | `vendors/axios`, `vendors/react-query`, `vendors/netinfo`, `vendors/react-navigation`, `vendors/linear-gradient`, `vendors/reactotron` — all listed in the constitution's own table, all scaffolded now as shared infrastructure. (No `vendors/moti` — removed per ADR-0013.) |
| IX. TMDB Data Access, Mapping and Error Handling | PASS | `tmdbClient` baseURL from `env.TMDB_BASE_URL`; `AppError`/`handleError`; network/server error overlays with `meta.skipNetworkError`/`skipServerError` on both the genres and movies queries (this screen owns its own inline states, per spec FR-016/017); DTO→model mappers for `Movie`, `MoviePage`, `Genre`. |
| X. Naming and Code Conventions | PASS | File-naming table followed throughout tasks.md; all text through `strings.ts` constants, no hard-coded literals; `readonly` on all model/prop fields; import order and sorting rules apply (ESLint-enforced, not hand-verified in the plan). |
| XI. Testing | PASS | Full test list in tasks.md Phase 4 (and the user's test request) covers every mapper, service, hook, util, store, component and screen state introduced by this feature, colocated per the constitution. |
| XII. Tooling, Quality Gates and Delivery | PASS, with one flagged environment prerequisite | pnpm + `node-linker=hoisted`, Husky/commitlint, `pr:check` gate, README updates only where something changed. **Flag**: `react-native@0.88.0` requires Node `^22.13.0 \| ^24.3.0 \| >=26.0.0`; the current scaffolding machine has Node `20.15.1` (confirmed live). This is an environment prerequisite, not a constitution violation — tasks.md's Setup phase includes upgrading Node before `react-native init` runs (see `research.md` §1). |
| XIII. Architecture Decision Records | PASS | ADRs 0001–0011 apply as written. ADR-0012's conditional wording ("`react-native-worklets` when required") already anticipated the Reanimated-3-without-worklets path this plan takes — see `research.md` §2. ADR-0012 itself is superseded by **ADR-0013** (new, added during implementation): `moti`'s published package has no usable non-Expo entry point, so the `Skeleton` atom is a project-owned shimmer component on `react-native-reanimated` + `react-native-linear-gradient` instead — the constitution was amended to 1.1.0 to match. |

**No Complexity Tracking entries** — no principle is violated; the one flagged item (Node engine version) is an environment prerequisite handled as a Setup task, not a constitutional exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-popular-movies/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   ├── tmdb-movie-popular.md
│   └── tmdb-genre-list.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

This is a single mobile app project (Option 1 / single-project shape, adapted to React Native's own top-level layout, not a generic `src/lib/cli` split). Full structure per constitution Principle I; only the parts this feature actually populates are expanded below.

```text
movie-explorer/                        # repo root (already has .git, .claude, .specify, specs, docs, README.md)
├── index.js
├── App.tsx                            # SafeAreaProvider → ReactQueryProvider → ReactNavigationProvider → RootNavigator (+ overlays, Toast)
├── .env.example                       # TMDB_BASE_URL + TMDB_ACCESS_TOKEN placeholder
├── .npmrc                             # node-linker=hoisted
├── src/
│   ├── features/
│   │   ├── genres/
│   │   │   ├── api/genres.keys.ts, genres.service.ts
│   │   │   ├── dtos/genre-response.dto.ts
│   │   │   ├── hooks/use-movie-genres.ts
│   │   │   ├── models/genre.model.ts
│   │   │   ├── mappers/genre.mapper.ts
│   │   │   ├── utils/get-genre-names.utils.ts
│   │   │   └── index.ts
│   │   └── movies/
│   │       ├── api/movies.keys.ts, movies.service.ts
│   │       ├── components/FeaturedMovieCard/, MovieCard/, MoviesSkeleton/
│   │       ├── constants/strings.ts
│   │       ├── dtos/movie-response.dto.ts, movie-page-response.dto.ts
│   │       ├── hooks/use-popular-movies.ts
│   │       ├── models/movie.model.ts, movie-page.model.ts
│   │       ├── mappers/movie.mapper.ts
│   │       ├── screens/movies.screen.tsx
│   │       ├── utils/format-rating.utils.ts, format-card-footer.utils.ts
│   │       └── index.ts
│   ├── components/
│   │   ├── atoms/Text/, Button/, Poster/, Rating/, Avatar/, Chip/, Skeleton/
│   │   ├── molecules/EmptyState/, ErrorState/, LoadingIndicator/, CategoryTabs/
│   │   ├── organisms/Header/, BottomMenu/, NetworkErrorOverlay/, ServerErrorOverlay/, Toast/
│   │   └── templates/ScreenContainer/, ErrorBoundary/
│   ├── hooks/use-network-status.ts
│   ├── stores/notification-store.ts, error-overlay-store.ts
│   ├── theme/colors.ts, spacing.ts, typography.ts, design-system.ts
│   ├── vendors/axios/, react-query/, netinfo/, react-navigation/, linear-gradient/, reactotron/
│   ├── navigation/routes.ts, navigation.types.ts, RootNavigator.tsx
│   ├── utils/app-error.ts, network-error.ts, tmdb-image.utils.ts, test-utils.tsx
│   └── constants/env.ts, tmdb.ts, query.ts, list.ts, strings.ts
├── android/ ios/                      # generated by react-native init, merged into repo root
└── docs/adr/                          # unchanged, already has 0001–0012
```

**Structure Decision**: single React Native CLI project at the repo root (no monorepo, no separate `api/`/`frontend/` split — this is a client-only app against the third-party TMDB API). The feature introduces two new slices (`genres`, `movies`) under the existing `src/features/` layout from Principle I and populates, for the first time, the shared `src/components`, `src/hooks`, `src/stores`, `src/theme`, `src/vendors`, `src/navigation`, `src/utils`, `src/constants` directories that the constitution's structure diagram reserves — this is expected for the first feature per the Spec Kit Workflow Rules ("The first feature's plan also performs project scaffolding").

## Complexity Tracking

*No entries — see Constitution Check above; no principle is violated.*

## Post-Design Re-check

Phase 1 design (`data-model.md`, `contracts/`, `quickstart.md`) introduced no new entity, dependency, or screen behavior beyond what the Constitution Check above already evaluated: the `Genre`/`Movie`/`MoviePage` models map 1:1 onto Principle III's "Genres" subsection and Principle IX's DTO→model pattern, and the two TMDB contracts use only endpoints and error-handling flows the constitution already specifies. **Constitution Check result after Phase 1: unchanged, PASS** (same one flagged environment prerequisite, no violations).
