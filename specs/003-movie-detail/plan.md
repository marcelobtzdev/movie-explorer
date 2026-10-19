# Implementation Plan: Movie Detail

**Branch**: `003-movie-detail` | **Spec**: [spec.md](./spec.md)

## Summary

Tapping a movie (grid card, featured card or search result) prefetches its backdrop and opens a
detail screen in the single native stack. The detail screen loads `GET /movie/{movieId}` through
a feature slice (`movie-detail`) and shows the backdrop, title, Spanish release date, genre chips
and synopsis, inside the same header and bottom menu as the list.

## Technical Context

Same stack and conventions as the previous specs. No new packages: React Navigation native stack,
TanStack Query, Axios `tmdbClient`, Zod-free (the response is not runtime-validated, as in the
constitution), and the existing shared atoms and molecules.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Project structure | PASS | New slice `src/features/movie-detail`; shared pieces in `components/`, `constants/`, `utils/` |
| II. Navigation | PASS, amended | `ROUTES.MOVIE_DETAIL` and `RootStackParamList` gain `MovieDetail: { movieId }`; params are primitives only |
| III. Data flow | PASS | `movieDetailKeys` → service → `useMovieDetail`; mapping in the mapper, not in render |
| IV. State | PASS | No store: the detail is server data in TanStack Query; the selected movie id travels in the route |
| V. Forms | N/A | No form on this screen |
| VI. Styling | PASS | Styles in each component file; the detail uses the shared `Header`, `BottomMenu`, `Poster`, `Chip`, `Text`, `Button` |
| VII. Performance and images | PASS, amended | Backdrop at `w1280` (was poster `w780` for the detail); prefetch on press; `Poster` handles the placeholder |
| VIII. UI states | PASS | Loading skeleton, error with retry, not found, success (spec FR-010 to FR-012) |
| IX. TMDB access | PASS | `tmdbClient` with `language` default; `404` handled by the screen, no overlay |
| X–XIII | PASS | Tests colocated; strings in constants; no new architecture decision (ADR not needed) |

## Project Structure

```text
src/
├── constants/
│   ├── bottom-menu.ts                    # BOTTOM_MENU_ITEMS moved here, shared by list and detail
│   ├── query.ts                          # + DETAIL_STALE_TIME (10 min)
│   └── tmdb.ts                           # + TMDB_IMAGE_SIZES.detailBackdrop = 'w1280'
├── navigation/
│   ├── routes.ts                         # + MOVIE_DETAIL: 'MovieDetail'
│   ├── navigation.types.ts               # RootStackParamList with MovieDetail params
│   └── RootNavigator.tsx                 # registers MovieDetail
├── utils/tmdb-image.utils.ts             # + prefetchTmdbImage (errors ignored)
└── features/
    ├── movies/
    │   ├── components/FeaturedMovieCard  # pressable; onPress(movieId)
    │   ├── components/MovieCard          # pressable; onPress(movieId)
    │   └── screens/movies.screen.tsx     # navigates; prefetch before navigation
    └── movie-detail/
        ├── api/movie-detail.keys.ts      # movieDetailKeys.detail(movieId)
        ├── api/movie-detail.service.ts   # getDetail({ movieId, signal })
        ├── dtos/movie-detail-response.dto.ts
        ├── mappers/movie-detail.mapper.ts
        ├── models/movie-detail.model.ts
        ├── hooks/use-movie-detail.ts     # useQuery, staleTime 10 min, skip meta flags
        ├── utils/format-release-date.utils.ts
        ├── constants/strings.ts
        ├── components/MovieDetailSkeleton/
        ├── screens/movie-detail.screen.tsx
        └── index.ts
```

## Design decisions

1. **Route and params.** `MovieDetail` receives `{ movieId: number }` only (constitution II). The
   screen reads the id with the typed `useRoute` and fetches its own data.
2. **Cards become buttons.** `MovieCard` and `FeaturedMovieCard` take `onPress(movie)` (the whole
   `Movie`, so the list can read its backdrop for the prefetch) and use a `Pressable` root with
   `accessibilityRole="button"`. The accessibility label is unchanged. The list screen owns the
   navigation so the cards stay presentational.
3. **Prefetch before navigation.** The list's press handler calls
   `prefetchTmdbImage(backdropUrl)` (fire and forget, errors ignored), then navigates. The URL is
   built by `buildTmdbImageUrl` with `TMDB_IMAGE_SIZES.detailBackdrop`, so the image is cached
   when the detail mounts.
4. **Caching.** The detail query uses `staleTime` 10 minutes and the default `gcTime` 30 minutes
   (constitution, Principle IX). Going back and opening the same movie again uses the cache.
5. **Error and not-found states.** `skipNetworkError` and `skipServerError` are set, so the
   screen owns its states. A `404` is detected through `AppError.statusCode === 404` and shows
   the not-found state with a "Volver" action and no retry.
6. **Date formatting.** `formatReleaseDate` is a pure function that splits the ISO date and maps
   the month number to a Spanish month name. It does not depend on the device locale, so the
   output is the same on Android and iOS.
7. **Bottom menu shared.** `BOTTOM_MENU_ITEMS` moves to `src/constants/bottom-menu.ts` so both
   screens render the same menu.

## Testing approach

- Unit tests: mapper, service (params and signal), `formatReleaseDate` (including empty and
  invalid input), `prefetchTmdbImage` (errors ignored), keys.
- Hook test: `useMovieDetail` (enabled by id, skip flags, 404 status exposed).
- Component tests: `MovieDetailSkeleton`; `MovieCard` and `FeaturedMovieCard` press calls
  `onPress` with the id.
- Screen tests: success content, backdrop placeholder, empty synopsis, missing date, no genres,
  loading, error with retry (only the detail request), 404 without retry, back action calls
  `goBack`, prefetch before navigation from the list.
- Navigator: the list screen tests mock `useNavigation`; the App smoke test keeps rendering the
  navigator.
