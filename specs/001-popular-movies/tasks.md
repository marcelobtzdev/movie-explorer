# Tasks: Popular Movies List

**Input**: Design documents from `/specs/001-popular-movies/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included — constitution Principle XI is NON-NEGOTIABLE for logic ("every service, mapper, hook, store, util and schema has tests; every screen and every shared component with behavior has tests"), and the plan's test list requires them.

**Organization**: Phase 1–2 build the project and its shared infrastructure (required once, before any user story). Phases 3–5 map to spec.md's three user stories (P1, P2, P3), each independently testable per its own Acceptance Scenarios. Phase 6 polishes across all stories.

**Post-completion note (constitution v1.2.0)**: tasks below that mention a separate `ComponentName.styles.ts` file reflect the convention in place when they were written and executed. The constitution was later amended so that a component's styles live in the same `.tsx` file as the component (a `StyleSheet.create` block at the end of the file), not a sibling file — every component built by this plan was refactored accordingly after the fact. Treat any `.styles.ts` mention below as historical; the actual files no longer exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3, per spec.md's priorities
- File paths are exact, relative to the repo root

## Path Conventions

Single React Native CLI project at the repo root (no monorepo). Paths follow `plan.md`'s Project Structure: `src/features/{genres,movies}/...` for domain code, `src/{components,hooks,stores,theme,vendors,navigation,utils,constants}/...` for shared infrastructure.

---

## Phase 1: Setup (Project Scaffolding)

**Purpose**: The project does not exist yet (constitution: "The first feature's plan also performs project scaffolding"). This phase creates it and configures all tooling.

- [X] T001 Check `node --version` against `react-native@0.88.0`'s required range (`^22.13.0 || ^24.3.0 || >= 26.0.0`, per `research.md` §1); if the current Node is outside this range, upgrade it (e.g. via nvm/volta) before continuing, and add a root `.nvmrc` pinning `22.13.0`
- [X] T002 Scaffold the React Native project into a sibling temp directory (NOT inside the repo): `npx @react-native-community/cli@latest init MovieExplorer --directory ../movie-explorer-scaffold --title MovieExplorer --package-name com.movieexplorer --skip-install --install-pods false --skip-git-init` (flags verified live in `research.md` §5)
- [X] T003 Move the generated files from `../movie-explorer-scaffold` into the repo root, merging rather than overwriting: never touch `.git`, `.claude`, `.specify`, `specs`, `docs`; keep the existing `README.md`; merge the generated `.gitignore` into the existing one and add a `.env` entry; remove the template `App.tsx` and `__tests__/` (replaced later by ours and by colocated tests); delete `../movie-explorer-scaffold` once merged
- [X] T004 Set `package.json` `"name"` to `"movie-explorer"` and confirm `displayName`/app name references `"MovieExplorer"` in `app.json`
- [X] T005 [P] Create root `.npmrc` with `node-linker=hoisted`
- [X] T006 Install dependencies with pnpm, pinned to the exact versions recorded in `research.md` §4 (not whatever `latest` resolves to at install time): `react-native@0.88.0`, `react@19.3.1`, `typescript@6.0.3`, `@tanstack/react-query@5.104.4`, `zustand@5.0.15`, `axios@1.20.0`, `zod@4.6.7`, `@react-navigation/native@7.5.1`, `@react-navigation/native-stack@7.21.0`, `react-native-screens@4.30.0`, `react-native-safe-area-context@5.10.1`, `@shopify/flash-list@2.3.3`, `moti@0.30.0`, `react-native-reanimated@3.19.5`, `react-native-linear-gradient@2.8.3`, `@react-native-community/netinfo@12.0.1`, `react-native-config@1.7.2`, `reactotron-react-native@5.3.1` (dev), plus the tooling devDependencies listed in T009–T012
- [X] T007 [P] Run `pod install` inside `ios/` (after T003/T006, so CocoaPods sees the final `ios/` path and the installed RN version)
- [X] T008 [P] Configure `tsconfig.json`: TypeScript strict mode, path alias `@/src/*`
- [X] T009 [P] Configure `babel.config.js`: `babel-plugin-module-resolver` (matching the `@/src/*` alias), `babel-plugin-transform-remove-console` (production only), with the Reanimated Babel plugin configured **last** in the plugins array (constitution XI / ADR-0012)
- [X] T010 [P] Configure ESLint: `@react-native/eslint-config` base + `eslint-plugin-perfectionist` (sort-objects, sort-interfaces, sort-jsx-props, sort-array-includes) + `react/prefer-read-only-props` + `react-native/no-inline-styles` + `no-console: warn` + `consistent-type-imports` (`import type`)
- [X] T011 [P] Configure Prettier (`.prettierrc`) and wire `lint-staged` (`"*.{js,jsx,ts,tsx}": eslint --fix --max-warnings=0 --no-warn-ignored`, `"*.{json,md}": prettier --write`)
- [X] T012 [P] Configure Husky (`pre-commit` → `lint-staged`, `pre-push` → commitlint + quality checks) and commitlint (`@commitlint/config-conventional`, header max 150 chars, body line max 100)
- [X] T013 [P] Configure Jest: `react-native` preset, v8 coverage provider, coverage exclusions per constitution XI (`*.d.ts`, `*.test.*`, `*.mock.*`, `*.stories.*`, `**/types.ts`, `**/constants.ts`, `**/styles.ts`, `**/strings.ts`, `src/constants/**`, `src/assets/**`, `src/vendors/**`, `src/utils/test-utils.tsx`, DTO files), `TZ=UTC`, `haste.defaultPlatform: 'ios'`, a setup file mocking `react-native-config` and including `@shopify/flash-list/jestSetup` and the Reanimated Jest mock
- [X] T014 Add `package.json` scripts: `start`, `android`, `ios`, `test` (`jest --coverage`), `test:watch`, `test:ci` (`jest --coverage --detectOpenHandles --forceExit`), `coverage`, `lint:check` (`eslint . --max-warnings=0`), `types` (`tsc --noEmit`), `pr:check` (`lint:check && types && test`)
- [X] T015 [P] Create `.env.example` at the repo root with `TMDB_BASE_URL=https://api.themoviedb.org/3` and a `TMDB_ACCESS_TOKEN=` placeholder; ensure `.env` is git-ignored (T003's merge)
- [X] T016 Configure `react-native-config` natively for Android (apply the Gradle plugin in `android/app/build.gradle` so `.env` values reach `BuildConfig`)
- [X] T017 Configure `react-native-config` natively for iOS (add the `Config.xcconfig` include so `ReactNativeConfig`/`Config.*` resolves at runtime)
- [X] T018 Update `README.md` only where a script, command or prerequisite now differs from what it already documents (TMDB token instructions, `.env` setup, install/run commands, links to `docs/adr/`)
- [X] T019 [P] Smoke-test `moti`'s `Skeleton` (via `moti/skeleton/react-native-linear-gradient`) against this project's installed `react-native-reanimated@3.19.5`; **result: FAILED** — the entry point does not exist in `moti@0.30.0`'s published `exports` map (confirmed with 3 failing import attempts under Jest). Recorded in `research.md` §2; `moti` dropped, ADR-0013 written superseding ADR-0012 (user-approved: vendor a custom shimmer). The `Skeleton` atom (T060) is a project-owned component instead.

**Checkpoint**: `pnpm android` and `pnpm ios` build and launch the default template screen on both platforms; `pnpm pr:check` runs (even with nothing to lint/test yet) before any feature code is written.

---

## Phase 2: Foundational (Shared Infrastructure)

**Purpose**: Theme, constants, utils, vendors, stores, navigation shell, and the shared Atomic-Design component set that both feature slices and the screen depend on. **Blocks all user stories.**

### Theme

- [X] T020 [P] `src/theme/colors.ts` — the dark-theme token values exactly as fixed by the constitution's color table (`primary.main` `#D93025`, `primary.contrast` `#FFFFFF`, `accent` `#FBBF24`, `background.base` `#0F1219`, `background.surface` `#1A1D26`, `background.elevated` `#242834`, `text.primary` `#E7E7EE`, `text.secondary` `#B8A4A0`, `text.onPrimary` `#FFFFFF`, `border` `#2A2E3A`, `rating.background` `rgba(15, 18, 25, 0.8)`, `skeleton.base` `#1E222C`, `skeleton.highlight` `#2A2F3C`, `status.error` `#F87171`, `status.warning` `#F59E0B`, `status.success` `#22C55E`, `overlay.scrim` `rgba(0, 0, 0, 0.6)`)
- [X] T021 [P] `src/theme/spacing.ts` — scale `xs(4) sm(8) md(12) lg(16) xl(20) xlWide(24) xxl(32) xxxl(42)`
- [X] T022 [P] `src/theme/typography.ts` — system fonts only (no bundled font files); weights regular 400, medium 500, bold 700; sizes/line-heights `xs 12/16, sm 14/20, md 16/22, lg 18/24, xl 22/30, xxl 28/36`
- [X] T023 `src/theme/design-system.ts` — composed `designSystem = { colors, spacing, typography }` (depends on T020–T022)

### Constants

- [X] T024 [P] `src/constants/tmdb.ts` — `TMDB_LANGUAGE = "es-PY"`, `TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/"`, `TMDB_IMAGE_SIZES` (poster `w342`, backdrop `w780`)
- [X] T025 [P] `src/constants/query.ts` — `staleTime` 5 min for lists, `staleTime`/`gcTime` 24h for the genre catalog, `gcTime` 30 min default
- [X] T026 [P] `src/constants/list.ts` — `numColumns: 2`, `drawDistance: 250` (FlashList v2 needs no `estimatedItemSize`, per `research.md` §3)
- [X] T027 [P] `src/constants/strings.ts` — shared Spanish (es-PY) text constants used app-wide (e.g. the app name `"MovieExplorer"`), as an `as const` object
- [X] T028 `src/constants/env.ts` — Zod schema validating `TMDB_BASE_URL` (as a URL) and `TMDB_ACCESS_TOKEN` (non-empty string) from `react-native-config`; fails fast at startup with a clear message when either is missing or malformed (depends on T016/T017)
- [X] T029 [P] `src/constants/env.test.ts` — valid env passes; missing/malformed `TMDB_BASE_URL` or `TMDB_ACCESS_TOKEN` throws with a clear message

### Utils

- [X] T030 [P] `src/utils/app-error.ts` — `AppError` class (`code`, `statusCode?`, `details`, `type?`, `errors?`) and `handleError(error)` converting `AxiosError` → `AppError`
- [X] T031 [P] `src/utils/app-error.test.ts`
- [X] T032 [P] `src/utils/network-error.ts` — `isNetworkError(error)` (`statusCode === undefined`, cancellations excluded) and `isServerError(error)` (`statusCode === 500`)
- [X] T033 [P] `src/utils/network-error.test.ts`
- [X] T034 [P] `src/utils/tmdb-image.utils.ts` — builds a full image URL from a relative TMDB path + a `TMDB_IMAGE_SIZES` entry; returns `null`/placeholder signal when the path is `null`
- [X] T035 [P] `src/utils/tmdb-image.utils.test.ts` — valid path → correct URL; `null` path → placeholder signal
- [X] T036 [P] `src/utils/test-utils.tsx` — custom `render` wrapping `QueryClientProvider` (fresh `QueryClient` per call, `retry: false`) and re-exporting `@testing-library/react-native`

### Stores

- [X] T037 [P] `src/stores/error-overlay-store.ts` — `createErrorOverlayStore()` factory (`isVisible`, `isRetrying`, `isExhausted`, `retryCount`, `refetch`; `show()` idempotent, `retry()` increments atomically and sets `isExhausted` after `MAX_RETRIES = 3`, `hide()` resets) and its two instances `useNetworkErrorStore` / `useServerErrorStore`
- [X] T038 [P] `src/stores/error-overlay-store.test.ts` — `show`/`retry`/`hide` behavior, the 3-retry exhaustion rule, independence of the two store instances
- [X] T039 [P] `src/stores/notification-store.ts` — `useNotificationStore` (toast message queue/state) + `useNotification` hook
- [X] T040 [P] `src/stores/notification-store.test.ts`

### Vendors

- [X] T041 [P] `src/vendors/axios/tmdb-client.ts` — axios instance, `baseURL: env.TMDB_BASE_URL`, `Authorization: Bearer ${env.TMDB_ACCESS_TOKEN}` header, `language` param set to `TMDB_LANGUAGE` on every request, response interceptor calling `handleError` (depends on T028, T030)
- [X] T042 [P] `src/vendors/axios/tmdb-client.test.ts` — auth header present, language param present, error interceptor maps an Axios error to `AppError`, cancelled requests are not converted to a shown error
- [X] T043 `src/vendors/react-query/client.ts` — `QueryClient` with `shouldRetry` disabled for network and status-coded errors, cache times from `src/constants/query.ts`, `QueryCache.onError`/`MutationCache.onError` routing to `useNetworkErrorStore`/`useServerErrorStore` per `isNetworkError`/`isServerError`, honoring `meta.skipNotify`/`skipNetworkError`/`skipServerError` (depends on T032, T037, T025)
- [X] T044 [P] `src/vendors/react-query/ReactQueryProvider.tsx` — wraps `QueryClientProvider` with the client from T043
- [X] T045 [P] `src/vendors/netinfo/index.ts` — `@react-native-community/netinfo` connectivity subscription wrapper
- [X] T046 [P] `src/vendors/reactotron/index.ts` — Reactotron instance, imported only inside a `__DEV__` guard
- [X] T047 [P] `src/vendors/react-navigation/ReactNavigationProvider.tsx` — `NavigationContainer` with a dark navigation theme built from `src/theme` tokens (depends on T020)
- [X] T048 ~~`src/vendors/moti/index.ts`~~ — **removed**: T019's smoke test found `moti@0.30.0` has no usable non-Expo entry point (`moti/skeleton/react-native-linear-gradient` does not resolve). ADR-0013 supersedes ADR-0012; the `moti` dependency was uninstalled. No vendor wrapper is needed — `Skeleton` (T060) uses `react-native-reanimated` and `react-native-linear-gradient` (T049) directly.
- [X] T049 [P] `src/vendors/linear-gradient/index.ts` — re-exports `LinearGradient` from `react-native-linear-gradient`

### Shared hook

- [X] T050 `src/hooks/use-network-status.ts` — on NetInfo offline→online: hide the network overlay if visible, `queryClient.invalidateQueries()`, push a "Conexión restablecida, actualizando datos..." toast (depends on T045, T037, T039, T043)
- [X] T051 [P] `src/hooks/use-network-status.test.ts`

### Error-overlay UI (organisms)

- [X] T052 [P] `src/components/organisms/NetworkErrorOverlay/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — modal bound to `useNetworkErrorStore`, "Hubo un problema de conexión" title, "Reintentar"/"Entendido" actions, yellow warning icon
- [X] T053 [P] `src/components/organisms/ServerErrorOverlay/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — modal bound to `useServerErrorStore`, "Ocurrió un problema en el servidor" title, red error icon, no auto-close on reconnect
- [X] T054 [P] `src/components/organisms/Toast/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — bound to `useNotificationStore`

### Shared Atomic Design components

- [X] T055 [P] `src/components/atoms/Text/` — typography-token-driven text atom
- [X] T056 [P] `src/components/atoms/Button/` — accessible button (`accessibilityRole="button"`, `accessibilityLabel`, ≥44×44 pt touch target)
- [X] T057 [P] `src/components/atoms/Avatar/` — circular avatar, fixed size prop, centered initial text
- [X] T058 [P] `src/components/atoms/Chip/` — pill-shaped label, active/inactive style variants
- [X] T059 [P] `src/components/atoms/Rating/` — renders a star glyph + a pre-formatted rating string (dash included) passed as a prop; no formatting logic of its own
- [X] T060 [P] `src/components/atoms/Skeleton/` — project-owned shimmer component (ADR-0013) built directly on `react-native-reanimated` (`useSharedValue`/`withRepeat(withTiming(...))` sweeping a `LinearGradient` strip on the UI thread) and `react-native-linear-gradient` (T049); `colorMode="dark"` and the `skeleton.base`/`skeleton.highlight` tokens; exposes a `Skeleton.Group` (React Context) so callers group blocks that must animate in sync (depends on T049, T020)
- [X] T061 [P] `src/components/atoms/Poster/` — the single place building an image with placeholder ("Sin imagen") for a missing path and fallback to the same placeholder on load error; explicit width/height, `resizeMode="cover"`, `resizeMethod="resize"` + explicit `fadeDuration` on Android, stable `source` object (depends on T034)
- [X] T062 [P] `src/components/molecules/EmptyState/` — centered icon/illustration + message text prop
- [X] T063 [P] `src/components/molecules/ErrorState/` — centered message + "Reintentar" `Button`, `onRetry` callback prop, accessible label and ≥44×44 pt target
- [X] T064 [P] `src/components/molecules/LoadingIndicator/` — small centered/footer spinner, exposed to accessibility as a busy indicator
- [X] T065 [P] `src/components/molecules/CategoryTabs/` — horizontally scrollable pill row; active tab styled `primary.main`/`text.onPrimary`/bold; inactive tabs styled `background.elevated`/`text.primary`, no-op `onPress`, `accessibilityState={{ disabled: true }}`
- [X] T066 [P] `src/components/templates/ScreenContainer/` — `SafeAreaView`-based wrapper applying `background.base` and horizontal padding `spacing.lg`
- [X] T067 [P] `src/components/templates/ErrorBoundary/` — React error boundary with a minimal fallback UI
- [X] T068 [P] `src/components/organisms/Header/` — app name "MovieExplorer" + a `subtitle` prop + a static, non-pressable `Avatar`; no search icon
- [X] T069 [P] `src/components/organisms/BottomMenu/` — fixed bar, safe-area bottom padding, an `items` prop where every item except the active one is a no-op with `accessibilityState={{ disabled: true }}`; each item ≥44×44 pt

### Navigation and app root

- [X] T070 `src/navigation/routes.ts` — `ROUTES` `as const` object with `MOVIES` only (`MOVIE_DETAIL` is added by spec 003, not here)
- [X] T071 `src/navigation/navigation.types.ts` — `RootStackParamList` with a single `Movies: undefined` route, typed `useNavigation`/route props
- [X] T072 `src/navigation/RootNavigator.tsx` — single native stack registering only `ROUTES.MOVIES` with `headerShown: false` (depends on T070, T071)
- [X] T073 `App.tsx` — mounts `SafeAreaProvider` → `ReactQueryProvider` (T044) → `ReactNavigationProvider` (T047) → `RootNavigator` (T072), with `NetworkErrorOverlay`, `ServerErrorOverlay` and `Toast` (T052–T054) rendered once at the root above the navigator
- [X] T074 [P] `App.test.tsx` — smoke test: renders without throwing

**Checkpoint**: the app boots to an empty native stack with the error overlays and toast mounted; all shared infrastructure the user stories need now exists and is unit-tested. No user-visible movies screen yet.

---

## Phase 3: User Story 1 — See the popular movies (Priority: P1) 🎯 MVP

**Goal**: Opening the app shows the full main-screen layout (header, tabs, featured card, section title, two-column grid, bottom menu) populated from one successfully loaded page of TMDB's popular movies, with genre names resolved and all per-card edge cases (missing poster/backdrop, missing rating, missing year, long titles) handled.

**Independent Test**: Launch the app with a working connection; per `quickstart.md`'s primary-flow section, confirm the header/tabs/featured-card/section-title/grid/bottom-menu all render with real data, the featured card is `movies[0]` and never repeated in the grid, and tapping any card does nothing — all without pagination or the skeleton/error/empty states existing yet.

### Tests for User Story 1

- [X] T079 [P] [US1] `src/features/genres/mappers/genre.mapper.test.ts` — `mapGenre` renames `id`→`genreId` 1:1, copies `name` unchanged
- [X] T080 [P] [US1] `src/features/genres/api/genres.service.test.ts` — calls `GET /genre/movie/list` with `language=es-PY`, forwards the `AbortSignal` to `tmdbClient`, returns mapped `Genre[]`
- [X] T082 [P] [US1] `src/features/genres/hooks/use-movie-genres.test.ts` — `useQuery` with 24h `staleTime`/`gcTime`, `meta.skipNetworkError`/`skipServerError` both `true`
- [X] T084 [P] [US1] `src/features/genres/utils/get-genre-names.utils.test.ts` — preserves the order of `genreIds`; respects a `limit`; silently skips an id with no match in the lookup (per spec edge case)
- [X] T091 [P] [US1] `src/features/movies/mappers/movie.mapper.test.ts` — `release_date: ""`/missing → `releaseYear: null`; `vote_average: 0` → `voteAverage: null`; a normal result maps every field 1:1 per `data-model.md`'s `Movie` table
- [X] T096 [P] [US1] `src/features/movies/api/movies.service.test.ts` — calls `GET /movie/popular` with `page`/`language=es-PY`, forwards the `AbortSignal`, returns a mapped `MoviePage`
- [X] T098 [P] [US1] `src/features/movies/utils/format-rating.utils.test.ts` — a numeric rating formats to exactly one decimal; `null` formats to `"–"`
- [X] T100 [P] [US1] `src/features/movies/utils/format-card-footer.utils.test.ts` — `(2023, ["Acción", "Aventura"])` → `"2023 • Acción / Aventura"`; `null` year → leading `"–"`; empty genre list → no bullet/names segment
- [X] T102 [P] [US1] `src/features/movies/hooks/use-popular-movies.test.ts` (baseline) — the movies query is `enabled: false` until `use-movie-genres` succeeds; once enabled, the first page's `select` flattens to a `Movie[]` array
- [X] T107 [P] [US1] `src/features/movies/screens/movies.screen.test.tsx` (baseline) — Header/CategoryTabs/section-title/BottomMenu present; `FeaturedMovieCard` renders `movies[0]`; the grid excludes that same movie; a list of exactly one movie renders only the featured card (no grid, no empty message); pressing the featured card or any grid card triggers no navigation/callback; the two non-"Populares" tabs and the three non-"Populares" bottom-menu items are inert and exposed as `accessibilityState={{ disabled: true }}`

### Implementation for User Story 1

- [X] T075 [P] [US1] `src/features/genres/dtos/genre-response.dto.ts` — `{ genres: { id: number; name: string }[] }`
- [X] T076 [P] [US1] `src/features/genres/models/genre.model.ts` — `interface Genre { readonly genreId: number; readonly name: string }`
- [X] T077 [P] [US1] `src/features/genres/mappers/genre.mapper.ts` — `mapGenre(dto): Genre`
- [X] T078 [P] [US1] `src/features/genres/api/genres.keys.ts` — `genresKeys.all` / `genresKeys.movie()`
- [X] T081 [US1] `src/features/genres/api/genres.service.ts` — `genresService.getMovieGenres({ signal })`, calls `/genre/movie/list` via `tmdbClient`, maps each entry through `mapGenre` (depends on T041, T077, T078)
- [X] T083 [US1] `src/features/genres/hooks/use-movie-genres.ts` — `useQuery` wrapping `genresService.getMovieGenres`, `staleTime`/`gcTime` from `src/constants/query.ts`, `meta: { skipNetworkError: true, skipServerError: true }` (depends on T081, T025)
- [X] T085 [P] [US1] `src/features/genres/utils/get-genre-names.utils.ts` — `getGenreNames(genreIds, lookup: Map<number,string>, limit)`, pure, order-preserving, skips unmatched ids
- [X] T086 [P] [US1] `src/features/movies/dtos/movie-response.dto.ts` — `{ id, title, poster_path, backdrop_path, release_date, genre_ids, vote_average, ... }` (ignored fields not typed)
- [X] T087 [US1] `src/features/genres/index.ts` — public barrel (`useMovieGenres`, `Genre`, `getGenreNames`)
- [X] T088 [P] [US1] `src/features/movies/models/movie.model.ts` — `Movie` per `data-model.md` (`movieId`, `title`, `posterPath`, `backdropPath`, `releaseYear: number | null`, `genreIds: readonly number[]`, `voteAverage: number | null`), all `readonly`
- [X] T089 [P] [US1] `src/features/movies/dtos/movie-page-response.dto.ts` — `{ page, results: MovieResponse[], total_pages, total_results }`
- [X] T090 [P] [US1] `src/features/movies/models/movie-page.model.ts` — `MoviePage { readonly movies: readonly Movie[]; readonly page: number; readonly totalPages: number }`
- [X] T092 [US1] `src/features/movies/mappers/movie.mapper.ts` — `mapMovie(dto): Movie` (`releaseYear = parseReleaseYear(release_date)`, `voteAverage = vote_average > 0 ? vote_average : null`) and `mapMoviePage(dto): MoviePage` (depends on T086, T088, T089, T090)
- [X] T093 [P] [US1] `src/features/movies/api/movies.keys.ts` — `moviesKeys.all` / `moviesKeys.popular()`
- [X] T094 [US1] `src/features/movies/api/movies.service.ts` — `moviesService.getPopular({ page, signal })`, calls `/movie/popular` via `tmdbClient` with `page` + `language=es-PY`, maps via `mapMoviePage` (depends on T041, T092, T093)
- [X] T095 [P] [US1] `src/features/movies/utils/format-rating.utils.ts` — `formatRating(voteAverage: number | null): string` → one decimal or `"–"`
- [X] T097 [P] [US1] `src/features/movies/utils/format-card-footer.utils.ts` — `formatCardFooter(releaseYear: number | null, genreNames: readonly string[]): string`
- [X] T099 [US1] `src/features/movies/hooks/use-popular-movies.ts` (baseline) — `useInfiniteQuery`, `initialPageParam: 1`, `enabled: genresQuery.isSuccess`, `select` flattens pages to a `Movie[]` (full pagination guard/dedup logic completed in US2), `meta: { skipNetworkError: true, skipServerError: true }` (depends on T083, T094)
- [X] T101 [US1] `src/features/movies/constants/strings.ts` — feature texts: subtitle `"Populares"`, chip `"#1 TENDENCIA"`, rating suffix `"/ 10 TMDB"`, placeholder `"Sin imagen"`, section title `"Películas Populares"`
- [X] T103 [US1] `src/features/movies/components/FeaturedMovieCard/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — full-width card, `aspectRatio` 1.2, `Poster`-style backdrop at `w780` with a `LinearGradient` scrim (transparent → `background.base`), `"#1 TENDENCIA"` `Chip`, rating pill (`Rating` + `"/ 10 TMDB"`), 2-line-clamped title, up to 3 genre `Chip`s, release year (or `"–"`), placeholder text `"Sin imagen"` when no backdrop, not pressable
- [X] T104 [US1] `src/features/movies/components/MovieCard/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — fixed-height card, `Poster` at `w342` (2:3 ratio) with an overlaid rating badge, 1-line-ellipsis title, footer from `formatCardFooter`, not pressable, `accessibilityLabel` `"{title}, {year}, valoración {rating}"` with `"año desconocido"`/`"sin valoración"` fallbacks
- [X] T105 [US1] `src/features/movies/screens/movies.screen.tsx` (baseline) — `ScreenContainer` → `Header` (subtitle `"Populares"`) → `CategoryTabs` → `FeaturedMovieCard` for `movies[0]` → section title → one `FlashList` (`numColumns: 2`, `movies.slice(1)`, stable `keyExtractor`/`renderItem`, `React.memo`'d `MovieCard`) → `BottomMenu`; success-state rendering only (loading/error/empty wired in US3, pagination UI wired in US2) (depends on T083, T099, T103, T104, T065, T068, T069, T066)
- [X] T106 [US1] `src/features/movies/index.ts` — public barrel (`MoviesScreen`, and anything 002/003 will need)

**Checkpoint**: User Story 1 is independently functional — the full static layout renders real popular movies with genre names, every per-card edge case (placeholder, dash rating, dash year, title clamp) is handled, and nothing is pressable. Demonstrable without pagination or refined loading/error states.

---

## Phase 4: User Story 2 — Keep browsing (Priority: P2)

**Goal**: Scrolling toward the end of the grid automatically fetches and appends more pages, never repeating a movie, with a footer spinner while fetching, a footer retry on failure that preserves already-loaded movies, and a clean stop (no error) once TMDB's pages are exhausted.

**Independent Test**: With US1 working, per `quickstart.md`'s pagination section: scroll to the bottom repeatedly and confirm pages append with a footer spinner and no duplicate movie ids; simulate a footer failure and confirm loaded movies stay and a retry appears; reach the last page and confirm no further fetch/error/indicator.

### Tests for User Story 2

- [X] T109 [P] [US2] `src/features/movies/hooks/use-popular-movies.test.ts` additions — `getNextPageParam` returns `page + 1` while `page < min(totalPages, 500)`, else `undefined`; `select` de-duplicates by `movieId` across overlapping pages (spec FR-011/SC-005); the pagination guard condition (`hasNextPage && !isFetchingNextPage && no error`) is exercised
- [X] T112 [P] [US2] `src/features/movies/screens/movies.screen.test.tsx` additions — footer `LoadingIndicator` shown while `isFetchingNextPage`; a failed next-page fetch keeps all previously loaded cards visible and shows a footer "Reintentar" that re-fetches only the failed page; reaching the last page shows no footer indicator and triggers no further fetch; repeatedly triggering `onEndReached` while a fetch is in flight does not start a second request

### Implementation for User Story 2

- [X] T108 [US2] `src/features/movies/hooks/use-popular-movies.ts` — complete the pagination contract: `getNextPageParam(lastPage) { return lastPage.page < Math.min(lastPage.totalPages, 500) ? lastPage.page + 1 : undefined }`; confirm `select`'s flattening de-duplicates by `movieId` across every loaded page, not just within one page (depends on T099)
- [X] T110 [US2] `src/features/movies/screens/movies.screen.tsx` — wire the `FlashList`'s `onEndReached` (`onEndReachedThreshold: 0.5`) guarded by `hasNextPage && !isFetchingNextPage && !isError`, calling `fetchNextPage`; `ListFooterComponent` renders `LoadingIndicator` while `isFetchingNextPage` (depends on T105, T108, T064)
- [X] T111 [US2] `src/features/movies/screens/movies.screen.tsx` — on a next-page failure, `ListFooterComponent` instead renders the footer error text + a "Reintentar" `Button` that calls `fetchNextPage` again for only the failed page, with all previously loaded items still rendered (depends on T110)
- [X] T113 [P] [US2] `src/features/movies/constants/strings.ts` — add the footer error text `"No se pudieron cargar más películas"` (reuses the existing `"Reintentar"` label)

**Checkpoint**: User Stories 1 and 2 both work independently — infinite scroll is smooth, duplicate-free, and resilient to a mid-scroll failure.

---

## Phase 5: User Story 3 — Understand what is happening (Priority: P3)

**Goal**: The screen always communicates its state: a full-screen skeleton while genres or the first page load, a centered error + retry if either initial request fails (retrying genres first, then the list), and a centered empty message if the service returns zero movies — all with the header, tabs and bottom menu still visible.

**Independent Test**: With US1/US2 working, per `quickstart.md`'s states section: force a slow/failed first load and confirm the skeleton then the error+retry appear (header/tabs/bottom-menu visible throughout); mock a zero-movie response and confirm the empty message; confirm "Reintentar" re-requests genres before the movie list.

### Tests for User Story 3

- [X] T119 [P] [US3] `src/features/movies/screens/movies.screen.test.tsx` additions — while `useMovieGenres`/`usePopularMovies` are loading, `MoviesSkeleton` renders (and no cards/error/empty do) with `Header`/`BottomMenu` still present; a genres-query failure shows the initial `ErrorState` and its "Reintentar" refetches genres then the movie list; a first-page movies failure shows the same initial `ErrorState`; a successful zero-movie response shows the `EmptyState` with `Header`/tabs/`BottomMenu` present
- [X] T120 [P] [US3] `src/features/movies/components/MoviesSkeleton/MoviesSkeleton.test.tsx` — renders 3 tab-pill blocks, one featured-sized block, one section-title bar, and a 2×2 grid of card-shaped blocks (poster + title + footer bars), all inside a single `Skeleton.Group`, exposed to accessibility as one busy region labeled `"Cargando películas"`

### Implementation for User Story 3

- [X] T114 [US3] `src/features/movies/components/MoviesSkeleton/` (`.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`) — one `Skeleton.Group` containing: 3 tab-pill `Skeleton` blocks, a featured-card-sized `Skeleton` block, a section-title-bar `Skeleton` block, and 4 `Skeleton` card blocks (2 rows × 2, each poster+title+footer) matching `MovieCard`'s dimensions; wrapped so the whole group is one accessible busy region labeled `"Cargando películas"` (depends on T060)
- [X] T115 [US3] `src/features/movies/screens/movies.screen.tsx` — while `genresQuery.isLoading || moviesQuery.isLoading` (first page only), render `MoviesSkeleton` in place of the tabs/featured/grid area, keeping the real `Header` and `BottomMenu`; suppress cards, error and empty states during this time (depends on T114, T105)
- [X] T116 [US3] `src/features/movies/screens/movies.screen.tsx` — when `genresQuery.isError` or the first-page `moviesQuery.isError`, render the centered `ErrorState` (title `"No pudimos cargar las películas"`, message `"Revisa tu conexión e inténtalo de nuevo."`, action `"Reintentar"`) between the tabs area and the bottom menu, with `Header`/tabs/`BottomMenu` still visible; `onRetry` calls `genresQuery.refetch()` and, on its success, `moviesQuery.refetch()` (depends on T115, T083, T099)
- [X] T117 [US3] `src/features/movies/screens/movies.screen.tsx` — when the movies query succeeds with zero movies, render the centered `EmptyState` (`"No hay películas para mostrar"`) in the same area, `Header`/tabs/`BottomMenu` still visible (depends on T116)
- [X] T118 [US3] `src/features/movies/constants/strings.ts` — add `skeletonRegionLabel: "Cargando películas"`, `initialErrorTitle: "No pudimos cargar las películas"`, `initialErrorMessage: "Revisa tu conexión e inténtalo de nuevo."`, `retryAction: "Reintentar"`, `emptyMessage: "No hay películas para mostrar"`

**Checkpoint**: All three user stories are independently functional and tested; every spec.md Acceptance Scenario across P1/P2/P3 is implemented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories, not new behavior.

- [X] T121 [P] Accessibility pass: confirm every interactive element introduced in this feature (both `ErrorState` "Reintentar" buttons, the inert `CategoryTabs`/`BottomMenu` items) exposes `accessibilityRole`/`accessibilityLabel` and a ≥44×44 pt touch target; confirm system font scaling does not clip or overlap text in `Header`, cards, or state messages
- [X] T122 [P] Run `pnpm pr:check` (`lint:check && types && test`) and fix any failures
- [ ] T123 [P] Run `pnpm android` and `pnpm ios`; confirm both build and launch without errors (constitution Definition of Done)
- [X] T124 Execute every scenario in `quickstart.md` against the real TMDB API (with a real `.env` token) and record the outcome of each — **partial**: validated the live TMDB contract directly (popular movies + genre list endpoints, es-PY translation behavior, data shapes match the DTOs/mappers exactly) since no Android/Xcode toolchain is available in this environment to run the actual app end-to-end; full on-device quickstart walkthrough is still pending a real build
- [X] T125 [P] Update `README.md` again if anything changed during implementation that wasn't already covered by T018
- [X] T126 Final review: confirm every `spec.md` Functional Requirement (FR-001…FR-023) and Success Criterion (SC-001…SC-006) is met by the implemented screen

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies; must finish before Foundational (the project doesn't exist until T001–T019 run)
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories**
- **User Story 1 (Phase 3)**: depends on Foundational; no dependency on US2/US3
- **User Story 2 (Phase 4)**: depends on Foundational **and** on US1's `use-popular-movies` baseline (T099) and `movies.screen` baseline (T105) existing to extend — not independently buildable before US1, but independently *testable* once built (its own Acceptance Scenarios don't require US3's states to exist)
- **User Story 3 (Phase 5)**: depends on Foundational **and** on US1's screen (T105) and hooks (T083, T099) to wrap with loading/error/empty states — independently testable via its own Acceptance Scenarios without US2's pagination UI being exercised
- **Polish (Phase 6)**: depends on all three user stories being complete

### Parallel Opportunities

- All `[P]` Setup tasks (T005, T007–T013, T015, T019) once T001–T004/T006 land
- All `[P]` Foundational tasks within Theme / Constants / Utils / Stores / Vendors / shared Atomic-Design components — most of Phase 2 is parallel because each file is independent; only T023, T028, T043, T050, T060–T061, T072–T073 have real same-phase dependencies (noted inline)
- Within US1, every dto/model/mapper/key/util file and its test (T075–T078, T080, T084, T086, T088–T091, T093, T095–T098, T100, T102) in parallel (T087, the genres barrel, is sequential — it depends on T085); the two component tasks (T103, T104) in parallel with each other once T092/T095/T097 land; T105 (the screen) only after T083, T099, T103, T104 land
- Within US2 and US3, the respective `[P]` test-only additions can run alongside their sibling implementation tasks once the single shared file they both touch (`movies.screen.tsx`) is not being edited concurrently by two tasks

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1)
2. **STOP and VALIDATE**: run `quickstart.md`'s primary-flow section against a real TMDB token
3. This is already a demonstrable MVP: the full dark-themed layout with real popular movies, genre names, and every per-card edge case — just without infinite scroll or refined loading/error states (those use simple defaults from TanStack Query's own `isLoading`/`isError` until US2/US3 land)

### Incremental Delivery

1. Setup + Foundational → project exists, boots to an empty stack
2. Add US1 → validate independently → demonstrable MVP
3. Add US2 → validate independently → infinite scroll complete
4. Add US3 → validate independently → polished states complete
5. Polish → full spec compliance confirmed
