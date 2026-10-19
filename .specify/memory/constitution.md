<!--
Sync Impact Report
==================
Version change: 1.4.0 → 1.5.0
Changed:
  - Error overlays are global by default (Principle IX): network and server errors show the overlays
    from the QueryClient; a query whose screen renders its own error state sets the skip flags.
Added:
  - Movie detail (003-movie-detail) — tapping a movie opens the detail screen; detail image is
    the backdrop at `w1280` with prefetch on tap; principles II, VII and the feature list amended.
  - Search (002-movie-search) — search field on the movies screen, `GET /search/movie` with
    only `query` and `language`, single-page results; principles II and IX amended to match.
Modified principles:
  - Project Context and Scope — corrected where the pnpm node-linker setting must live: this
    project also has a `pnpm-workspace.yaml` (holding `minimumReleaseAgeExclude`), and once that
    file exists, pnpm 12.x sources `nodeLinker` from `pnpm-workspace.yaml`'s own key, not from
    `.npmrc`'s `node-linker` — the latter is silently ignored. `.npmrc` keeps the setting too
    (harmless, read by older tooling), but `pnpm-workspace.yaml`'s `nodeLinker: hoisted` is the
    one that actually takes effect.
  - XII. Tooling, Quality Gates and Delivery — same correction, in the pnpm bullet.
Added sections: none
Removed sections: none
Rationale: discovered only after a real `pnpm android` run failed with `Included build
  '.../node_modules/@react-native/gradle-plugin' does not exist` — confirmed via
  `node_modules/.modules.yaml` that `nodeLinker` was resolving to `isolated` despite `.npmrc`
  saying otherwise, and that adding `nodeLinker: hoisted` to `pnpm-workspace.yaml` is what
  actually fixes it (see `specs/001-popular-movies/research.md`'s eighth finding). PATCH: a
  factual correction to where an existing requirement's setting lives, not a change to what is
  required.
Follow-up: `pnpm-workspace.yaml` now carries `nodeLinker: hoisted`; `README.md` and
  `docs/adr/0001-react-native-cli-and-typescript.md` updated to match.
Templates requiring follow-up: none — this command does not modify dependent templates;
  /speckit-plan, /speckit-tasks and /speckit-analyze read this constitution at runtime.
Follow-up TODOs: none.
-->

# MovieExplorer Constitution

## Project Context and Scope

MovieExplorer is a mobile app that consumes the TMDB (The Movie Database) API and presents
movie information clearly and efficiently. It is a technical assessment: it demonstrates good
mobile-development practices and an efficient, scalable app.

Technology: the project uses React Native CLI (bare workflow) and TypeScript in strict mode.
Zustand is the global state manager (justified in ADR-0004). Navigation uses React Navigation.
The package manager is pnpm, configured to hoist every dependency (`nodeLinker: hoisted` in
`pnpm-workspace.yaml` — the setting that actually takes effect once that file exists, not
`.npmrc`'s `node-linker`; required for React Native's Gradle setup, which hardcodes a flat
`node_modules` layout). Supported platforms are Android AND iOS; the app MUST compile and run
without errors
on both.

### Functional scope

The current functional scope is the following:

1. **Movie list**: a list of movies from the TMDB endpoint `GET /movie/popular`. Each grid
   item shows the poster image, the rating badge (`vote_average`, shown with one decimal), the
   title and a footer with the release year (from `release_date`) and the genre names, in the
   form "2023 • Acción / Aventura". Genre names come from `GET /genre/movie/list`, which is
   requested before the list and resolved by genre id (see Principle III).
2. **Movie detail**: tapping a grid card, the featured card or a search result opens a detail
   screen with a higher-resolution backdrop image, title, release date (in Spanish long form),
   genre names and synopsis (`overview`). Data comes from `GET /movie/{movieId}`.
3. **Search**: a search field on the list screen, between the header and the category tabs,
   searches movies by title with `GET /search/movie` (sending only `query` and `language`). The
   typed text is debounced; the results use the same layout as the popular list. An empty search
   shows the popular list again. Search shows the first page of results only (see Principle IX).
4. **UI states**: loading, error and empty list are visible to the user on every data-driven
   screen. While the first batch loads, the movies screen shows a full-screen skeleton.
5. **Main screen layout**: the movies screen has a header with the visible app name
   "MovieExplorer", the subtitle of the active category and a static avatar; category tabs
   (Populares, Mejor Valoradas, En Cartelera); a featured card showing the first movie of the
   list (wide image, rating, release year and genre names); the
   section title "Películas Populares" followed by the grid with the remaining movies; and a
   bottom menu (Populares, Cartelera, Mejor Valoradas, Favoritos). Only Populares is
   functional: the other category tabs and bottom-menu items are visual only, do nothing when
   pressed and are exposed to accessibility as unavailable. The visible app name
   "MovieExplorer" is also the app display name.

### Not in the current scope

The following are not part of the current scope. They can be added later when requirements
change, through a spec and a constitution amendment: TV series, user accounts or
authentication, favorites/watchlist, persisted or offline storage of app data, functional
category selection beyond Populares, genre filters, sorting, pull-to-refresh,
cast/crew/trailers/reviews/recommendations, share, theme switching (the app uses a single
dark theme), a language switcher, push notifications, analytics, crash reporting, deep links,
tablet-specific layouts, and animations beyond functional feedback.

Also not in the current scope, because they arrive with later specs or are not needed:
filters beyond the search field, a grid/list view toggle,
featured-card actions (detail button, save, share), bookmark icons, movie runtime, and any
extra content in the footer of grid cards (labels such as "IMAX" or "OSCAR WINNER", arrows or
call-to-action icons): the card footer contains only the release year and the genre names.

### Technology stack

The stack below is the reference for every plan. Each need is covered by the package listed;
versions are the latest stable release compatible with the React Native version chosen at
scaffolding time (the plan records the exact versions in `research.md`). Other packages can be
added following the dependency rule of Principle XII.

| Need | Package or approach |
|---|---|
| App framework | `react-native` (CLI, New Architecture, Hermes), `react`, TypeScript strict |
| Navigation | `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context` |
| Server state and pagination | `@tanstack/react-query` v5 (`useInfiniteQuery`) |
| Client state | `zustand` v5 |
| HTTP | `axios` |
| Validation | `zod` (installed from the start: environment validation) |
| Forms | `react-hook-form`, `@hookform/resolvers` (installed when the first form exists, with the search spec) |
| Environment variables | `react-native-config` + Zod validation |
| Lists | `@shopify/flash-list` v2 |
| Images | React Native `Image` (with `Image.prefetch`), custom `Poster` atom with placeholder |
| Skeleton loading | A project-owned shimmer component (`src/components/atoms/Skeleton`) built directly on `react-native-reanimated` and `react-native-linear-gradient` — no third-party skeleton package (ADR-0013, supersedes ADR-0012) |
| Icons | Emoji glyphs and text/`View` shapes (no package) |
| Gradients | `react-native-linear-gradient` (required by the Moti skeleton; also used for the featured-card overlay), wrapped in `vendors/linear-gradient` |
| Connectivity | `@react-native-community/netinfo` |
| Texts | Spanish (es-PY) text constants in `src/constants/strings.ts` and `src/features/[feature]/constants/strings.ts`; no internationalization library |
| Styling and components | Custom components with `StyleSheet.create` and `src/theme` tokens |
| Unit and component tests | `jest` (`react-native` preset), `@testing-library/react-native` |
| Lint and format | `eslint` (`@react-native` config, `eslint-plugin-perfectionist`), `prettier` |
| Git hooks | `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` |
| Production console removal | `babel-plugin-transform-remove-console` |
| Path alias | `babel-plugin-module-resolver` + `tsconfig` paths |
| Dev debugging | `reactotron-react-native` (dev only) |
| Package manager | `pnpm` with `nodeLinker: hoisted` (`pnpm-workspace.yaml`) |

### Priorities when trade-offs arise

When trade-offs arise, priorities are resolved in this order, derived from the assessment
criteria:

1. Functionality (all specs met, compiles on Android and iOS).
2. Code quality (correct TypeScript, well-structured components, separation of
   responsibilities).
3. Architecture (project organization, business logic, state management).
4. User experience (loading/error states, smooth navigation, clear interface).
5. React Native best practices (optimized lists, image handling, performance).

## Core Principles

### I. Feature Slice Architecture (NON-NEGOTIABLE)

All business-domain code lives in `src/features/[feature-name]/`. Each feature is
self-contained and exposes its public API only through its root `index.ts` barrel; other
modules and features import from that barrel. Code used by two or more features moves to the
shared layers (`src/components`, `src/hooks`, `src/shared`, `src/utils`, `src/stores`).

The top-level structure is:

```
movie-explorer/
├── index.js            # React Native entry point
├── App.tsx             # Root component — mounts providers and the navigator
├── src/
│   ├── features/       # Domain feature slices
│   ├── components/     # Shared UI (Atomic Design)
│   ├── hooks/          # Shared hooks
│   ├── stores/         # Global Zustand stores
│   ├── theme/          # Design system tokens
│   ├── vendors/        # Third-party library wrappers
│   ├── navigation/     # Navigators, route constants and navigation types
│   ├── shared/         # Cross-feature types and constants
│   ├── utils/          # Pure utility functions
│   ├── constants/      # App-level constants (env, TMDB, list tuning)
│   └── assets/         # Images, fonts
├── android/ ios/       # Native projects (React Native CLI)
├── docs/adr/           # Architecture Decision Records (only documentation folder)
└── scripts/            # Build and maintenance scripts
```

Application layers have dependencies flowing downward:

`navigation/` (Routing, React Navigation) → `features/` (Domain: screens → hooks → services →
vendors) → `components/` (Shared UI: atoms · molecules · organisms · templates).

Feature inventory (each feature is introduced by its own Spec Kit spec):

| Feature | Responsibility |
|---|---|
| movies | Popular movies list, search (002), list UI states, pagination |
| movie-detail | Detail screen of a single movie |

Internal structure of a feature (a layer is created only when there is something to put in
it):

```
src/features/[feature]/
├── api/
│   ├── [feature].service.ts        # HTTP calls — plain async functions, no React
│   └── [feature].keys.ts           # TanStack Query key factories
├── hooks/
│   └── use-[feature].ts            # useQuery / useInfiniteQuery wrapping the service
├── screens/
│   └── [feature].screen.tsx        # Full screen, orchestrates hooks + components
├── components/                     # UI components local to this feature
├── stores/
│   └── [feature]-store.ts          # Zustand store local to this feature
├── models/
│   └── [entity].model.ts           # Domain entity interfaces (camelCase, readonly)
├── types/
│   └── [feature].types.ts          # Local TypeScript types
├── schemas/
│   └── [form].schema.ts            # Zod schemas + RHF resolver exports
├── mappers/
│   └── [entity].mapper.ts          # DTO → model transformation functions
├── dtos/
│   └── [response]-response.dto.ts  # Raw API response shapes (snake_case, as TMDB returns them)
├── errors/
│   └── [feature]-error.ts          # Feature-specific error class
├── utils/
│   └── [feature].utils.ts          # Pure utility functions specific to the feature
└── index.ts                        # Public API — barrel export
```

Public API rule — a feature's exports are imported from its root barrel:

```ts
// ✅ correct
import { useMovieDetail } from "@/src/features/movie-detail"
// ❌ wrong — bypasses the public API
import { useMovieDetail } from "@/src/features/movie-detail/hooks/use-movie-detail"
```

### II. Navigation with React Navigation

Navigation uses React Navigation (`@react-navigation/native` and
`@react-navigation/native-stack`) with a single native stack navigator that has two screens:
`Movies` (the list, initial route) and `MovieDetail` (receives `{ movieId: number }`).

```
src/navigation/
├── routes.ts              # ROUTES constant
├── navigation.types.ts    # RootStackParamList + typed screen props
└── RootNavigator.tsx      # The native stack
```

Rules:

- All route names are defined as constants in `src/navigation/routes.ts` (`ROUTES` object,
  `as const`) and used for every navigation call.
- Navigation is fully typed through `RootStackParamList` (typed `useNavigation` / route props).
- Screens receive only primitive params (`movieId`); the detail screen fetches its own data.
- The category tabs and the bottom menu are custom visual components rendered by the Movies
  screen, not React Navigation navigators; navigation remains one native stack.

```ts
// ✅ correct
navigation.navigate(ROUTES.MOVIE_DETAIL, { movieId })
// ❌ wrong
navigation.navigate("MovieDetail", { movie })
```

Provider tree — `App.tsx` mounts providers in this order:

```
SafeAreaProvider
  └── ReactQueryProvider
        └── ReactNavigationProvider (NavigationContainer + theme)
              └── <RootNavigator />
```

The `ErrorOverlay` components (network and server, Principle IX) and the `Toast` are rendered
once at the root, inside `ReactNavigationProvider`, above the navigator.

### III. Server State with TanStack Query v5

All remote data is managed with TanStack Query v5. Fetching follows the three-layer pattern
keys → service → hook, so data is always loaded through query hooks.

Query keys factory (`[feature].keys.ts`): factory objects returning `as const` tuples, enabling
precise invalidation.

```ts
export const moviesKeys = {
  all: ['movies'] as const,
  popular: () => [...moviesKeys.all, 'popular'] as const,
  search: (term: string) => [...moviesKeys.all, 'search', term] as const,
}
export const genresKeys = {
  all: ['genres'] as const,
  movie: () => [...genresKeys.all, 'movie'] as const,
}
export const movieDetailKeys = {
  all: ['movie-detail'] as const,
  detail: (movieId: number) => [...movieDetailKeys.all, movieId] as const,
}
```

Service (`[feature].service.ts`): plain object with async functions. No React, no hooks.
Receives the `AbortSignal` from React Query, returns typed domain models (it calls the mapper
before returning).

```ts
export const moviesService = {
  getPopular: async ({ page, signal }: { page: number; signal?: AbortSignal }): Promise<MoviePage> => {
    const { data } = await tmdbClient.get('/movie/popular', { params: { page }, signal })
    return mapMoviePage(data)
  },
}
```

Hook (`use-[feature].ts`): thin wrapper around `useQuery` / `useInfiniteQuery` connecting keys
and service. The list uses `useInfiniteQuery` with `getNextPageParam` and `initialPageParam`.

**Genres**: the genre catalog is small (about 20 entries), so it is fetched once with
`GET /genre/movie/list` (`genres.service.ts`, `use-movie-genres.ts` in the `genres` feature
slice) **before** the movie list: the popular-movies query has `enabled: genresQuery.isSuccess`,
so the first batch is requested after the genres arrive. The genres query uses a long cache
(`staleTime` and `gcTime` from `src/constants/query.ts`, 24 hours), since the catalog almost
never changes. The model is `Genre { genreId, name }`. Movies keep only `genreIds`; the screen
builds a lookup once per genres response (`useMemo`, a `Map` by `genreId`) and resolves names
with `getGenreNames(genreIds, lookup, limit)` (pure util: ids without a match are skipped).
Components receive the already-resolved names as props. Genre loading and genre errors are part
of the screen's initial states: while genres or the first batch load the screen shows the
skeleton; if the genres request fails, the screen shows the initial error state and "Reintentar"
re-requests the failed query (genres first, then the list).

The `QueryClient` is configured in `src/vendors/react-query/client.ts`, with:

- Global error handling via `QueryCache.onError` / `MutationCache.onError` (see Principle IX).
- Retry logic: automatic retries are disabled both for errors that carry an HTTP status code
  (`AppError` with `statusCode`) and for network errors. Each manual "Reintentar" press
  produces exactly 1 network call.
- Default cache times: `staleTime` 5 minutes for lists and search; `staleTime` 10 minutes for
  movie detail; `gcTime` 30 minutes. Values live in `src/constants/query.ts`.
- Overlays are global by default: every query or mutation error that is a network error (no HTTP
  status) or a server error (500) shows its overlay through the `QueryCache` / `MutationCache`
  handlers. A query whose screen renders its own error state (inline error, retry or footer retry)
  MUST set `meta: { skipNetworkError: true, skipServerError: true }` so the error is not shown
  twice. `meta.skipNotify` suppresses toasts. Every data query of this app that has inline error
  states sets both skip flags.

### IV. Client State with Zustand v5

All client state is managed with Zustand v5 (justification and the alternatives considered,
including Redux, are in ADR-0004). React Context is used for providers of library
infrastructure. Server data lives in TanStack Query and is not copied into Zustand.

Stores declare state fields and actions in the same interface:

```ts
export interface MoviesStore {
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  clearSearchTerm: () => void
}
export const useMoviesStore = create<MoviesStore>()((set) => ({
  searchTerm: '',
  setSearchTerm: (searchTerm) => set(() => ({ searchTerm })),
  clearSearchTerm: () => set(() => ({ searchTerm: '' })),
}))
```

Components consume stores through selectors (`useStore((s) => s.field)`) to avoid unnecessary
re-renders. Stores can be read outside React with `.getState()` (services, Axios interceptors,
QueryCache handlers).

All stores are in-memory: the app has no persistence layer and React Query's cache is
in-memory only. If requirements change and persistence is needed, it is introduced through a
spec and an ADR.

Store inventory:

| Store | File | Persisted | Lifetime | Purpose |
|---|---|---|---|---|
| `useMoviesStore` | `src/features/movies/stores/movies-store.ts` | No | in-memory | Holds the debounced committed `searchTerm` used by the list query |
| `useNotificationStore` | `src/stores/notification-store.ts` | No | in-memory | Toast messages |
| `useNetworkErrorStore` | `src/stores/error-overlay-store.ts` | No | in-memory | Network error overlay |
| `useServerErrorStore` | `src/stores/error-overlay-store.ts` | No | in-memory | Server error overlay |

### V. Forms and Validation with Zod + React Hook Form

The only form is the search field. It uses React Hook Form for state and Zod for the schema,
bridged with `zodResolver` from `@hookform/resolvers/zod`. Each schema file
(`[form].schema.ts`) exports: the schema, the inferred TypeScript type (`z.infer`), the
resolver, and the default form values. Error messages come from the Spanish text constants
(`src/features/[feature]/constants/strings.ts`).

```ts
// src/features/movies/schemas/search.schema.ts
export const SearchSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100, SEARCH_STRINGS.maxLength),
})
export type SearchFormData = z.infer<typeof SearchSchema>
export const resolver = zodResolver(SearchSchema)
export const SearchFormDefaults: SearchFormData = { query: '' }
```

An empty or whitespace-only query is valid and means "show the popular list".

Environment variables are validated at startup with a Zod schema inside
`src/constants/env.ts`; the app fails fast with a clear error when a required variable is
missing.

### VI. UI: Custom Components and Styling

UI components are custom, built on top of React Native primitives (`View`, `Text`,
`Pressable`, `Image`, `ActivityIndicator`, `TextInput`, etc.) and styled with
`StyleSheet.create` and the design tokens of `src/theme`. Custom styling is preferred over UI
component libraries and styling systems (React Native Paper, NativeBase, Tamagui, Gluestack,
React Native Elements, UI Kitten, NativeWind, styled-components, etc.) because it keeps full
control over look, behavior and accessibility. If requirements change, a UI library can be
adopted for a given need when it is justified in the plan and recorded in an ADR.

This principle only concerns how components are built and styled. Other packages (for
example for lists, icons, images or animations) can be used following the dependency rule of
Principle XII. Data lists use FlashList (Principle VII). Packages required by React Navigation
(`react-native-screens`, `react-native-safe-area-context`) are part of the infrastructure.

Atomic Design is used for shared components in `src/components/`:

| Level | Folder | Examples | Description |
|---|---|---|---|
| Atom | `atoms/` | Button, Text, TextInput, Poster, Rating, Icon, Avatar, Chip, Skeleton | Primitive, indivisible UI elements (`Skeleton` is a custom shimmer component, ADR-0013) |
| Molecule | `molecules/` | SearchField, EmptyState, ErrorState, LoadingIndicator, CategoryTabs | Composed atoms, still generic |
| Organism | `organisms/` | Header, BottomMenu, NetworkErrorOverlay, ServerErrorOverlay, Toast | Complex components with internal logic (`BottomMenu` is visual only) |
| Template | `templates/` | ScreenContainer, ErrorBoundary | Page-level layouts and structural wrappers |

Feature-specific components (e.g., `FeaturedMovieCard`, `MovieCard`, `MoviesSkeleton`) live in
`src/features/[feature]/components/`. Each component lives in its own folder with a co-located
test:

```
components/atoms/Button/
├── Button.tsx           # component AND its StyleSheet.create block, in the same file
├── Button.test.tsx
└── index.ts             # re-exports Button
```

**Styles live in the same file as the component or screen they style** — a `StyleSheet.create`
call at the bottom of the `.tsx` file, not in a separate `ComponentName.styles.ts`. Keeping the
JSX and its styles in one file keeps the two in sync by construction (no cross-file scrolling to
check what a style name maps to) and makes a component's true size visible at a glance. Inline
style objects on JSX elements are still flagged by `react-native/no-inline-styles`; only the
single `StyleSheet.create` block at the end of the file is exempt.

**A large `StyleSheet.create` block is a decomposition signal, not something to extract into its
own file.** When a component's styles grow long enough to make the file hard to scan (as a
rough guide: noticeably more style keys than JSX elements, or the kind of length where you have
to scroll past styles to find the logic), that is evidence the component is doing too much and
should be split into smaller child components — each with its own small, co-located style
block — rather than filed away in a same-sized-but-separate `.styles.ts`. Moving styles to
another file hides the signal instead of acting on it.

Styles are defined with `StyleSheet.create` (inline styles are flagged by
`react-native/no-inline-styles`) and take colors, spacing and font sizes from `designSystem`.
There is a single dark theme.

Design system tokens in `src/theme/`:

| File | Export | Description |
|---|---|---|
| `colors.ts` | `colors` | Semantic color palette |
| `spacing.ts` | `spacing` | Scale: xs(4) sm(8) md(12) lg(16) xl(20) xlWide(24) xxl(32) xxxl(42) |
| `typography.ts` | `typography` | Font families and sizes |
| `design-system.ts` | `designSystem` | Composed object `{ colors, spacing, typography }` |

Color values of the dark theme:

| Token | Value |
|---|---|
| `primary.main` / `primary.contrast` | `#D93025` / `#FFFFFF` |
| `accent` (stars, active bottom-menu item) | `#FBBF24` |
| `background.base` (screens) | `#0F1219` |
| `background.surface` (cards) | `#1A1D26` |
| `background.elevated` (chips, inactive tabs) | `#242834` |
| `text.primary` / `text.secondary` / `text.onPrimary` | `#E7E7EE` / `#B8A4A0` / `#FFFFFF` |
| `border` | `#2A2E3A` |
| `rating.background` | `rgba(15, 18, 25, 0.8)` with `text.primary` text |
| `skeleton.base` / `skeleton.highlight` | `#1E222C` / `#2A2F3C` |
| `status.error` / `status.warning` / `status.success` | `#F87171` / `#F59E0B` / `#22C55E` |
| `overlay.scrim` | `rgba(0, 0, 0, 0.6)` |

Typography uses system fonts (no bundled font files): weights regular 400, medium 500, bold
700; sizes/line heights xs 12/16, sm 14/20, md 16/22, lg 18/24, xl 22/30, xxl 28/36.

```ts
import { designSystem } from "@/src/theme"
const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background.base,
    padding: designSystem.spacing.lg,
  },
})
```

Skeleton loading: the `Skeleton` atom in `src/components/atoms/Skeleton` is a project-owned
component (shimmer effect, animation on the UI thread through `react-native-reanimated`, the
gradient sweep via `react-native-linear-gradient`), as recorded in ADR-0013 (supersedes
ADR-0012, which had assumed a `moti` entry point that does not exist in the published
package). It is the only skeleton API used by screens; it applies the `skeleton.base` /
`skeleton.highlight` tokens (dark mode colors). All blocks of a screen are grouped in one
`Skeleton.Group` (a React Context provided by the same component) so they animate in sync, and
the skeleton screen mirrors the dimensions of the final layout to avoid layout shift.

UI states (present on every data-driven screen, all visible to the user):

- Movies list screen: loading (a full-screen skeleton, `MoviesSkeleton`, that mirrors the
  final layout: category tabs, featured card, section title and grid placeholders, with the
  real header and bottom menu); error (`ErrorState` with message and a retry action); empty
  (`EmptyState`; when searching it mentions the searched term; when there is no term and no
  data it shows a generic empty message); success (featured card + grid); pagination loading
  (footer spinner, `LoadingIndicator`, while fetching the next page); pagination error (footer
  with a retry action that keeps the already loaded items). Error and empty states are
  centered between the category tabs and the bottom menu, which stay visible. When the list
  has only one movie, only the featured card is shown, with no grid and no empty message.
- MovieDetail screen: loading; error (`ErrorState` with retry); not found (HTTP 404 → dedicated
  message); success.
- Missing poster images show a placeholder, and failed image loads fall back to the
  placeholder.

Accessibility: every interactive element has `accessibilityRole` and `accessibilityLabel`;
touch targets are at least 44x44 pt; images have an accessible description or are marked
decorative; text respects system font scaling; screens respect safe areas on both platforms;
the search field uses `keyboardShouldPersistTaps="handled"` on the list and dismisses the
keyboard on scroll (`keyboardDismissMode="on-drag"`).

### VII. Performance and Optimization (NON-NEGOTIABLE)

The app is optimized. These rules are mandatory and are verified in plan, tasks and review:

**Search and debounce:**

- The search input value is debounced 300 ms (constant `SEARCH_DEBOUNCE_MS` in
  `src/constants/list.ts`, via a reusable `useDebouncedValue` hook in `src/hooks/`) before
  being committed to `useMoviesStore.searchTerm`; only the committed trimmed term feeds the
  query key, so a TMDB search request fires after the debounce and not on every keystroke.
- When the committed term is empty the list uses the popular query; otherwise the search
  query. The search query is enabled only for a non-empty term.
- In-flight requests are cancelled when superseded: services receive the `AbortSignal` from
  TanStack Query and pass it to Axios; cancelled requests do not show errors or overlays.
- The search query uses `placeholderData: keepPreviousData`, so switching terms keeps the
  previous results visible instead of flashing an empty screen.

**Lists (virtualization and pagination):**

- Every data list uses `FlashList` from `@shopify/flash-list` (cell-recycling list, more
  optimized than the built-in lists), see ADR-0011.
- The FlashList major version is the one compatible with the project's React Native
  architecture, chosen and recorded in the first plan (v2 requires the New Architecture; with
  v1, `estimatedItemSize` is set to the average card height).
- The movie list is a grid with a fixed number of columns (`numColumns: 2`) and cards of a
  uniform, known height; `keyExtractor` returns a stable id string; `renderItem` is a stable
  function (`useCallback`) rendering a `React.memo`'d `MovieCard` whose props are primitives or
  stable references, and list props reference stable functions and objects instead of inline
  ones.
- Because FlashList recycles cells, list items derive everything from props (no local state
  tied to a specific item), do not set a `key` prop inside the item, and receive any external
  state they read through `extraData`.
- List tuning is set explicitly and centralized in `src/constants/list.ts`: `numColumns` 2,
  `drawDistance` 250 and, only when FlashList v1 is used, `estimatedItemSize`.
- Pagination is infinite scroll via `useInfiniteQuery`: `onEndReached` with
  `onEndReachedThreshold` 0.5; a next-page fetch is guarded (`hasNextPage &&
  !isFetchingNextPage && no error`) so it never fires twice; `getNextPageParam` stops at
  `min(total_pages, 500)` because TMDB caps pages at 500; items are de-duplicated by `movieId`
  when flattening pages (TMDB pages can overlap); flattening happens in the hook's `select`,
  not during render.
- Data transformation (mapping DTO → model) happens in services/`select`, outside render
  paths.

**Images:**

- Image sizes are requested by use: grid cards use the poster at TMDB size `w342`; the
  featured card uses the backdrop at `w780`; the detail screen uses the backdrop at `w1280`
  (higher resolution as required). Sizes are constants (`TMDB_IMAGE_SIZES` in
  `src/constants/tmdb.ts`).
- Every image has explicit width/height (not layout-computed from the image),
  `resizeMode="cover"`, and the placeholder/fallback described in Principle VI. With the
  React Native `Image` component, `fadeDuration` is set explicitly on Android and
  `resizeMethod="resize"` is used on Android so images are decoded at the displayed size
  (lower memory use than the default).
- Images rendered inside lists belong to memoized item components, so FlashList recycling
  does not re-render them unnecessarily; image `source` objects are stable between renders.
- The `Poster` atom is the single place that builds an image with its placeholder, fallback
  and the rules above, so every screen gets the same optimizations.
- On item press, before navigating, the app prefetches the `w1280` backdrop (errors ignored) with
  `Image.prefetch` (or the equivalent of the image library in use) so the detail image appears
  quickly.
- Image URLs are built by `src/utils/tmdb-image.utils.ts`.

**Re-renders and runtime:**

- Zustand selectors are used; derived values are computed with `useMemo` when they are
  non-trivial; callbacks passed to memoized children are stable.
- Hermes stays enabled on both platforms.
- `console` calls are stripped from production builds (Principle X).
- Render paths do constant work per item; list-wide computations happen in `select` or
  `useMemo`.

### VIII. Vendor Wrappers

Third-party infrastructure libraries are accessed through wrappers in
`src/vendors/[library]/`, which provide a single configuration point, hide library-specific
APIs behind a stable interface, and ease testing and future swaps.

| File | Wraps | Purpose |
|---|---|---|
| `vendors/axios/tmdb-client.ts` | axios | Configured `tmdbClient` instance (base URL from `env.TMDB_BASE_URL`, Authorization header from env, language param, error interceptor) |
| `vendors/react-query/client.ts` | `@tanstack/react-query` | Configured `QueryClient` with global error handling, retry logic and cache times |
| `vendors/react-query/ReactQueryProvider.tsx` | `QueryClientProvider` | Provider component |
| `vendors/netinfo/index.ts` | `@react-native-community/netinfo` | Connectivity subscription used by `useNetworkStatus` |
| `vendors/react-navigation/ReactNavigationProvider.tsx` | `@react-navigation/native` | `NavigationContainer` + theme provider |
| `vendors/linear-gradient/index.ts` | `react-native-linear-gradient` | `LinearGradient` used by the featured card overlay and the skeleton shimmer |
| `vendors/reactotron/index.ts` | `reactotron-react-native` | Dev-only Reactotron instance (imported only inside `__DEV__`) |

No monitoring/analytics/crash-reporting SDK is configured at this time. If one is added, it
gets its own vendor wrapper (a no-op when its env vars are absent) and an ADR.

### IX. TMDB Data Access, Mapping and Error Handling

**TMDB access**: all calls go through `tmdbClient` (`src/vendors/axios/tmdb-client.ts`) and a
feature service; components and hooks use the service through hooks. Endpoints used:
`GET /movie/popular`, `GET /genre/movie/list`, `GET /search/movie` (sending only `query` and
`language`; `include_adult` keeps TMDB's default `false`), `GET /movie/{movieId}`.
The base URL comes from env and already includes the API version
(`TMDB_BASE_URL=https://api.themoviedb.org/3`), so `tmdbClient` uses `env.TMDB_BASE_URL` as its
`baseURL` and services call relative paths such as `/movie/popular`. The credential is the TMDB API Read Access Token sent as
`Authorization: Bearer <token>`, read from env (`TMDB_ACCESS_TOKEN`). Both variables are loaded
with `react-native-config` from a git-ignored `.env` file and validated with Zod in
`src/constants/env.ts` (`TMDB_BASE_URL` as a URL). The token is never committed, and a
`.env.example` with placeholders and the base URL is maintained. The
request language param is the constant `TMDB_LANGUAGE` in `src/constants/tmdb.ts`
(`es-PY`), sent on every request, including the genre list.

**DTO → model mapper pattern**: TMDB responses are snake_case DTOs; domain models are camelCase
and readonly. Mappers are pure functions and services call them before returning data to
hooks. API responses are typed (DTO interfaces) but not runtime-validated.

```ts
// DTO (raw API response)
interface MovieResponse { id: number; title: string; poster_path: string | null; backdrop_path: string | null; release_date: string; genre_ids: number[]; vote_average: number }
// Model (domain)
interface Movie { readonly movieId: number; readonly title: string; readonly posterPath: string | null; readonly backdropPath: string | null; readonly releaseYear: number | null; readonly genreIds: readonly number[]; readonly voteAverage: number | null }
// Mapper
export const mapMovie = (dto: MovieResponse): Movie => ({
  backdropPath: dto.backdrop_path,
  genreIds: dto.genre_ids,
  movieId: dto.id,
  posterPath: dto.poster_path,
  releaseYear: parseReleaseYear(dto.release_date),
  title: dto.title,
  voteAverage: dto.vote_average > 0 ? dto.vote_average : null,
})
```

The `/movie/popular` response also carries other fields (overview, popularity, vote_count,
etc.) that the list does not use. `releaseYear` is `null` when `release_date` is missing or
empty, and `voteAverage` is `null` when TMDB reports no rating (`0` or missing); in both cases
the UI shows a dash. The genre list response (`{ genres: [{ id, name }] }`) is mapped to
`Genre { genreId, name }` by `mapGenre`. The `MovieDetail` model additionally carries
`overview` and `genres` (readonly array of `Genre`).

`AppError` (`src/utils/app-error.ts`) is the central error class:

```ts
class AppError extends Error {
  code: string
  statusCode: number | undefined
  details: Record<string, unknown> | null
  type: string | undefined
  errors: string[] | undefined
}
```

`handleError(error)` in the same file converts `AxiosError` responses into `AppError` and is
registered as the Axios response interceptor in `tmdb-client.ts`. Cancelled requests
(`axios.isCancel`) are ignored and never shown to the user. Features can define their own
domain error classes extending `Error` in `[feature]/errors/[feature]-error.ts`.

**Notifications**: `useNotificationStore` + `useNotification` hook form a pub/sub for toast
messages. Any code, including non-React services, can push with
`useNotificationStore.getState().notify(...)`. The root subscribes and renders the `Toast`.

**NETWORK ERROR FLOW** (`statusCode === undefined`: no connectivity, DNS failure, timeout,
ECONNABORTED, connection refused; cancellations excluded):

- Detection: `isNetworkError(error)` in `src/utils/network-error.ts` → true when
  `AppError.statusCode === undefined`.
- Trigger:
  - `QueryCache.onError` → `isNetworkError` → `useNetworkErrorStore.show(() => query.fetch())`
  - `MutationCache.onError` → `isNetworkError` → `useNetworkErrorStore.show(() => store.hide())`
  - Queries store their own `query.fetch` as the retry callback. (The app has no mutations
    today; the mutation behavior is kept for future-proofing: `store.hide` closes the overlay so
    the user can re-submit manually.)
- Store (`src/stores/error-overlay-store.ts`, created by the shared
  `createErrorOverlayStore()` factory): `isVisible` (Modal visibility), `isRetrying` (true while
  a manual retry is in flight), `isExhausted` (true after `MAX_RETRIES = 3` manual presses),
  `retryCount`, `refetch` (callback to re-execute the failing request).
- Key behaviors: `show()` is idempotent (if already visible it only resets `isRetrying` to
  false); `retry()` increments `retryCount` atomically and sets `isExhausted` in the same
  `set()` call; `hide()` resets all fields to initial state.
- `shouldRetry(failureCount, error)`: `isNetworkError` → false (no automatic retries; each
  manual press = exactly 1 call).
- Query flow: query fails → `shouldRetry` false → `queryCache.onError` →
  `show(() => query.fetch())` → overlay visible, `retryCount = 0` → user presses "Reintentar" →
  `retry()`: `retryCount = 1`, `isRetrying = true`, `query.fetch()` → if it succeeds,
  `queryCache.onSuccess` with `networkStore.isVisible` → `hide()`; if it fails again,
  `onError` → `show()` (already visible) → `isRetrying = false`, "Reintentar" re-enabled →
  after 3 presses `isExhausted = true` and "Entendido" is shown → "Entendido" calls `hide()`.
- Connection restoration (`src/hooks/use-network-status.ts`): NetInfo offline → online ⇒ if
  `networkStore.isVisible` → `hide()`; `queryClient.invalidateQueries()` (refetches only queries
  with active observers; unmounted ones refetch lazily on remount); Toast
  "Conexión restablecida, actualizando datos...".
- Suppress with `meta: { skipNetworkError: true }` when the screen renders its own error state.

**SERVER ERROR FLOW** (`statusCode === 500`: the server responded but failed internally):

- Detection: `isServerError(error)` → true when `AppError.statusCode === 500`.
- Trigger:
  - `QueryCache.onError` → `isServerError` → `useServerErrorStore.show(() => query.fetch())`
  - `MutationCache.onError` → `isServerError` → `useServerErrorStore.show(() => store.hide())`
  - `useServerErrorStore` shares the `createErrorOverlayStore()` factory with
    `useNetworkErrorStore` (independent Zustand instances, identical structure and fields).
- `shouldRetry`: `statusCode !== undefined` → false (no automatic retries for any HTTP error).
- Query flow: identical to the network query flow except: `queryCache.onSuccess` hides the
  server overlay only when `serverStore.isRetrying === true` (so unrelated successful queries
  on the same screen do not close it prematurely).
- Differences vs network overlay: trigger `statusCode === 500` (vs `undefined`); red error icon
  (vs yellow warning); title "Ocurrió un problema en el servidor" (vs "Hubo un problema de
  conexión"); no auto-close on reconnect (`useNetworkStatus` does not close the server
  overlay); `onSuccess` closes only when `isRetrying = true`.
- Suppress with `meta: { skipServerError: true }` when the screen renders its own error state.

Other HTTP errors (401 invalid token, 404 not found, 429 rate limit) are handled by the owning
screen with its own error state (404 on detail → "not found" state; others → generic
`ErrorState` with a retry action), optionally with a toast; they do not trigger the overlays.

Known gaps (accepted): after "Entendido" the screen remains in error state with no global
retry UI, so each screen implements its own error state (Principle VI); an in-flight query on
unmount may still fire `onError` and show the overlay on the next screen (rare).

### X. Naming and Code Conventions

File naming:

| Artifact | Pattern | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `Button.tsx` |
| Screen component | `kebab-case.screen.tsx` | `movies.screen.tsx` |
| Service | `kebab-case.service.ts` | `movies.service.ts` |
| Query keys | `kebab-case.keys.ts` | `movies.keys.ts` |
| Hook | `use-kebab-case.ts` | `use-popular-movies.ts` |
| Store | `kebab-case-store.ts` | `movies-store.ts` |
| Zustand store test | `kebab-case-store.test.ts` | `movies-store.test.ts` |
| Model | `kebab-case.model.ts` | `movie.model.ts` |
| Types | `kebab-case.types.ts` | `movies.types.ts` |
| Schema (Zod) | `kebab-case.schema.ts` | `search.schema.ts` |
| Mapper | `kebab-case.mapper.ts` | `movie.mapper.ts` |
| DTO | `kebab-case-response.dto.ts` | `movie-response.dto.ts` |
| Test | `[source-file].test.ts(x)` | `use-popular-movies.test.ts` |
| Error class | `kebab-case-error.ts` | `movie-detail-error.ts` |
| Utility | `kebab-case.utils.ts` | `tmdb-image.utils.ts` |

Barrel exports: every component folder has an `index.ts` re-exporting the public symbol
(`export { Button } from "./Button"`); feature public APIs go through the feature root
`index.ts` (`export * from "./screens/movies.screen"`).

**TypeScript:**

- Strict mode is enabled; types use `unknown` with narrowing instead of `any`, and narrowing
  is preferred over non-null assertions (`!`).
- Type-only imports use `import type` (ESLint-enforced).
- All component prop interfaces mark every field `readonly` (`react/prefer-read-only-props`).
- Domain model interfaces use `readonly` on all fields.
- Query keys and route constants use `as const`.
- Path alias: absolute imports use `"@/src/..."` (configured in tsconfig and babel module
  resolver).

**Import order** (eslint-plugin-perfectionist, alphabetical within groups, no blank lines
between groups): 1) type imports 2) react 3) react-native 4) third-party packages 5) absolute
`@/` imports in order: types, navigation, hooks, stores, services, providers, vendors,
constants, components, assets 6) parent directory (`../`) 7) relative in order: types,
constants, hooks, services, utils, components.

**Sorting** (ESLint-enforced, production code): object keys (`perfectionist/sort-objects`),
interface fields (`sort-interfaces`), JSX props (`sort-jsx-props`: multiline first, then
alphabetical), array includes (`sort-array-includes`). Test files are exempt from some rules.

**Other rules:**

- Styles use `StyleSheet.create` (see Principle VI).
- `console` calls are for temporary debugging (`no-console = warn`;
  `babel-plugin-transform-remove-console` strips calls in production builds). A deliberate
  placeholder log carries: `// eslint-disable-next-line no-console -- <reason>`.
- Reactotron is imported inside a `__DEV__` guard (`reactotron/no-tron-in-production = error`):
  `if (__DEV__) { require("@/src/vendors/reactotron") }`.
- Navigation uses `ROUTES` constants (Principle II).
- Environment variables are accessed through the `env` object in `src/constants/env.ts`;
  feature code reads configuration from it and not from `react-native-config` directly.
- Language: the app is in Spanish (es-PY) only and has no internationalization library. Every
  user-facing string lives in a text constants file (`src/constants/strings.ts` for shared
  texts, `src/features/[feature]/constants/strings.ts` for feature texts), exported as `as
  const` objects, so components contain no hard-coded literals. The TMDB request language is
  the constant `TMDB_LANGUAGE = "es-PY"` in `src/constants/tmdb.ts`.
- Functions and components stay small and single-purpose; code comments explain why, not what.

### XI. Testing (NON-NEGOTIABLE for Logic)

Stack: Jest (runner, with the `react-native` preset), `@testing-library/react-native`
(component and hook rendering), v8 (coverage provider).

Commands: `pnpm test` (all tests with coverage) · `pnpm test:watch` (no coverage) ·
`pnpm test:ci` (forceExit + detectOpenHandles) · `pnpm coverage` (report to `/coverage`).

Every service, mapper, hook, store, util and schema has tests; every screen and every shared
component with behavior has tests. Changes to logic are merged together with their tests.
There is no numeric coverage threshold; reviewers reject untested logic. Debounce, pagination
guards, de-duplication and the error-overlay flows have tests.

File placement: tests are colocated with the source file (`use-popular-movies.ts` +
`use-popular-movies.test.ts`), named `[subject].test.ts` or `[subject].test.tsx`.

Coverage scope: collected from `src/**/*.{ts,tsx}` excluding `*.d.ts`, `*.test.*`, `*.mock.*`,
`*.stories.*`; `**/types.ts`, `**/constants.ts`; `**/strings.ts`, `src/constants/**`,
`src/assets/**`; `src/vendors/**`; `src/utils/test-utils.tsx`; DTO files. Styles are no longer a
separate excludable file (they live inside each component/screen file per Principle VI); a
`StyleSheet.create` call does not need its own exclusion since rendering the component already
exercises it.

Test structure:

- Fixtures are organized in named constant groups at the top of the file: MOCK CALLBACKS
  (`const MOCK_CALLBACKS = { SET_TERM: jest.fn() }`), MOCK STATE (mutable state objects reset in
  `beforeEach`), MOCK DATA (inputs), MOCK RETURN VALUES (API responses), EXPECTED VALUES
  (assertions).
- `describe` grouping: the outer `describe` identifies type and name ("Screen: MoviesScreen",
  "Hook: usePopularMovies", "Component: Button"); inner describes group by behaviour category
  ("Rendering", "Return Shape", "Pagination", "Error State"...).
- Each test follows Arrange / Act / Assert with inline comments `// Arrange`, `// Act`,
  `// Assert`, and names like "should call moviesService.getPopular with the given page".

Mocking patterns: mock a service with
`jest.mock("../api/movies.service", () => ({ moviesService: { getPopular: (...args: unknown[]) => mockGetPopular(...args) } }))`;
mock a Zustand store as a selector function mirroring how components consume it
(`useMoviesStore: (selector) => selector({ searchTerm: MOCK_STATE.searchTerm, setSearchTerm: MOCK_CALLBACKS.SET_TERM })`),
using an object reference for state that changes between tests and resetting it in
`beforeEach`; mock a child component with a minimal test double exposing only what the test
needs (`View`/`Pressable` with `testID`); for hooks using TanStack Query create a fresh
`QueryClient` per suite with `defaultOptions { queries: { retry: false }, mutations: { retry: false } }`
and a `createWrapper()`; use jest fake timers to test debounce.

Custom render: `src/utils/test-utils.tsx` exports a `render` wrapping `QueryClientProvider` and
`I18nextProvider` (and the navigation container when needed) and re-exports everything from
`@testing-library/react-native`; tests import `render` from `"@/src/utils/test-utils"`.

Environment: `TZ=UTC` for all runs; `haste.defaultPlatform: 'ios'` in the Jest config;
`react-native-config` is mocked in the Jest setup, and the Jest setup includes
`@shopify/flash-list/jestSetup` so FlashList can render in tests, and
`react-native-reanimated`'s own test setup (`setUpTests()`) so the `Skeleton` atom's shimmer
animation renders in tests (ADR-0013). The Reanimated Babel plugin is the last
plugin in `babel.config.js`. Tests run against mocked
data and never need the real TMDB API.

### XII. Tooling, Quality Gates and Delivery

- The package manager is pnpm (with `nodeLinker: hoisted` in `pnpm-workspace.yaml` — not
  `.npmrc`, which pnpm 12.x ignores for this setting once `pnpm-workspace.yaml` exists); the
  pnpm lockfile is the only
  lockfile committed.
- Commits follow Conventional Commits (`@commitlint/config-conventional`), enforced by Husky.
  Format: `<type>(<optional scope>): <description>` + optional body. Types: `feat`, `fix`,
  `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `build`, `ci`, `revert`. Header max 150
  characters; body lines max 100. Examples: `feat(movies): add debounced movie search` ·
  `fix(movies): stop duplicate next-page requests` · `test(movies): add movie mapper unit
  tests`.
- Husky hooks: `pre-commit` runs lint-staged (`"*.{js,jsx,ts,tsx}": eslint --fix
  --max-warnings=0 --no-warn-ignored`; `"*.{json,md}": prettier --write`); `pre-push` is defined
  in `.husky/pre-push` (commitlint and quality checks).
- PR quality gate: before opening a PR, `pnpm pr:check` (= `lint:check && types && test`) MUST
  pass. `lint:check` is ESLint without auto-fix and fails on any warning; `types` is
  `tsc --noEmit`; `test` is `jest --coverage --detectOpenHandles`.
- Run scripts: `pnpm android` and `pnpm ios` build and run the app; the app MUST build without
  errors on both platforms before any feature is considered done.
- Dependencies: a new runtime dependency is justified in the plan and complements the existing
  stack; a library that replaces or conflicts with a stack decision in this constitution is
  introduced through a new or superseding ADR first. Versions are pinned through the pnpm
  lockfile.
- A root `README.md` explains how to obtain a TMDB token, how to create `.env` from
  `.env.example`, how to install and run on Android and iOS, and the scripts; it links to
  `docs/adr/` and leaves architecture content to the constitution and the ADRs.
- Definition of Done for any task: code follows the rules here, tests written and passing,
  `pnpm pr:check` green, app builds and runs on Android and iOS, user-facing strings localized,
  accessibility attributes present, loading/error/empty states implemented, performance rules
  of Principle VII applied, and no secrets committed.

### XIII. Architecture Decision Records (ADRs)

ADRs are not part of Spec Kit but are project documentation, stored in `docs/adr/` as
`NNNN-kebab-title.md` (sequential 4-digit number). Each ADR contains: Title, Status (Proposed
| Accepted | Deprecated | Superseded by ADR-NNNN), Context, Decision, Consequences. ADRs are
kept as history: a changed decision is recorded by a new ADR that supersedes the old one, and
in-place edits fix inaccuracies. Any change to a stack, library, architecture or convention
decision defined in this constitution comes with an ADR (and a constitution amendment) before
`/speckit-plan` uses it. Every `plan.md` lists the ADRs relevant to the feature.

Current ADRs:

| ADR | Title |
|---|---|
| 0001 | React Native CLI and TypeScript |
| 0002 | Feature slice architecture |
| 0003 | TanStack Query for server state |
| 0004 | Zustand for client state (Redux rejected) |
| 0005 | React Navigation native stack |
| 0006 | Zod for form validation |
| 0007 | Custom UI components and styling |
| 0008 | Centralized network and server error overlays |
| 0009 | TMDB access via a dedicated Axios client |
| 0010 | List, search and image performance strategy |
| 0011 | FlashList for all data lists |
| 0012 | Moti Skeleton for loading placeholders (superseded by ADR-0013) |
| 0013 | Custom shimmer Skeleton |

## Spec Kit Workflow Rules

- One spec per feature lives under `specs/NNN-short-name/` (sequential numbering). The
  constitution is the global document. Planned specs, ordered by functionality: 001
  popular-movies (list, pagination, UI states; includes project scaffolding), 002 movie-search,
  003 movie-detail. Specs stay within the scope defined above; extending the scope goes through
  a constitution amendment.
- `spec.md` describes WHAT and WHY (user stories with priorities P1/P2/P3, each independently
  testable); technology choices belong to `plan.md`, which decides HOW and passes a
  Constitution Check against all principles above and the relevant ADRs.
- `plan.md` uses the Project Structure defined in Principle I; any deviation is justified in
  Complexity Tracking.
- The first feature's plan also performs project scaffolding (React Native CLI app,
  TypeScript strict, tooling: ESLint/Prettier/Husky/commitlint/Jest, path alias, theme tokens,
  vendors, providers, navigation, env handling).
- Technical standards live in this constitution and `docs/adr/`; there are no per-topic
  architecture documents.

## Governance

This constitution supersedes all other practices. Amendments are made through
`/speckit-constitution` (or a direct edit that also updates the version, `LAST_AMENDED_DATE`
and a Sync Impact Report), with the related ADR. Versioning is semantic: MAJOR for removing or
redefining a principle, MINOR for adding a principle or materially expanding guidance
(including changes to scope), PATCH for clarifications. Compliance is checked in every plan
(Constitution Check), by `/speckit-analyze` (a constitution conflict is CRITICAL), and in code
review. Violations require explicit justification in the plan's Complexity Tracking table.

**Version**: 1.5.0 | **Ratified**: 2026-10-17 | **Last Amended**: 2026-10-19
