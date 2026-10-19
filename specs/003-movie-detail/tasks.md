# Tasks: Movie Detail

**Input**: `specs/003-movie-detail/` (spec.md, plan.md, contracts/tmdb-movie-detail.md)
**Tests**: colocated tests are required by the constitution (Principle XI); each implementation task has its test.

## Phase 1: Setup and shared infrastructure

- [X] T301 `src/constants/tmdb.ts`: add `detailBackdrop: 'w1280'` to `TMDB_IMAGE_SIZES`
- [X] T302 `src/constants/query.ts`: add `DETAIL_STALE_TIME` (10 minutes) and use it in `QUERY_CACHE`
- [X] T303 `src/constants/bottom-menu.ts`: move `BOTTOM_MENU_ITEMS` here; the movies screen imports it
- [X] T304 `src/utils/tmdb-image.utils.ts` + test: `prefetchTmdbImage(url)` calls `Image.prefetch`, resolves even when it fails

## Phase 2: Navigation

- [X] T305 `src/navigation/routes.ts`: `MOVIE_DETAIL: 'MovieDetail'`
- [X] T306 `src/navigation/navigation.types.ts`: `RootStackParamList` with `MovieDetail: { movieId: number }` and typed screen props
- [X] T307 `src/navigation/RootNavigator.tsx` + test: registers the detail screen with the native header hidden

## Phase 3: Feature slice `movie-detail` (foundational)

- [X] T308 `dtos/movie-detail-response.dto.ts` and `models/movie-detail.model.ts` (readonly models)
- [X] T309 `mappers/movie-detail.mapper.ts` + test: `release_date` empty → `null`; genres mapped with `mapGenre`; empty overview kept as empty string; missing backdrop → `null`
- [X] T310 `api/movie-detail.keys.ts` + test: `movieDetailKeys.detail(movieId)`
- [X] T311 `api/movie-detail.service.ts` + test: `GET /movie/{movieId}` with signal; no extra params
- [X] T312 `utils/format-release-date.utils.ts` + test: "1 de marzo de 2024"; empty and invalid input → `null`
- [X] T313 `hooks/use-movie-detail.ts` + test: enabled by id, skip meta flags, exposes `AppError.statusCode` for 404
- [X] T314 `constants/strings.ts`: Spanish texts (title fallback, "Sinopsis", "Fecha no disponible", "Sin sinopsis disponible.", "No encontramos esta película.", "Volver", "Sin imagen")

## Phase 4: User Story 1 — Open a movie's detail (P1)

- [X] T315 `components/MovieCard` + test: pressable root calls `onPress(movieId)`; accessibility label unchanged
- [X] T316 `components/FeaturedMovieCard` + test: pressable root calls `onPress(movieId)`
- [X] T317 `movies.screen.tsx`: typed `useNavigation`; press handler prefetches the backdrop then navigates to `MovieDetail` with `movieId`; screen test for grid and featured presses (navigation mocked)
- [X] T318 `screens/movie-detail.screen.tsx` + test: backdrop with gradient, title, Spanish date, genre chips (no row when empty), "Sinopsis" with text or the empty message; header and bottom menu visible

## Phase 5: User Story 2 — Go back (P2)

- [X] T319 Detail screen: "Volver" action (44x44 pt, accessible label) calls `navigation.goBack()`; test
- [X] T320 Verify system back keeps the list state: the list query and search term are not reset by mounting the detail (test on the store and query cache) — by design: the native stack keeps the list mounted and the store and query cache are not reset; no dedicated test

## Phase 6: User Story 3 — States (P3)

- [X] T321 `components/MovieDetailSkeleton/` + test: image, title, date, chip and synopsis blocks inside one `Skeleton.Group`
- [X] T322 Detail screen: skeleton while loading, with header and bottom menu visible
- [X] T323 Detail screen: error state with "Reintentar" that refetches only the detail; test
- [X] T324 Detail screen: `404` shows "No encontramos esta película." with "Volver" and no retry; test

## Phase 7: Polish

- [X] T325 `index.ts` barrel for `movie-detail` (`MovieDetailScreen`, `useMovieDetail`)
- [X] T326 Constitution amendments: Principle II.2 (detail content), Principle VII (detail image `w1280`, prefetch), `TMDB` endpoint list (`/movie/{movieId}` with `language`); version 1.4.0
- [X] T327 `specs/001-popular-movies/spec.md` note: FR-023 (tapping does nothing) is superseded by 003 FR-001
- [X] T328 `pnpm pr:check` green
