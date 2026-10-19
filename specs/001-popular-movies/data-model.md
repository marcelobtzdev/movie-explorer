# Data Model: Popular Movies List

**Feature**: 001-popular-movies | **Date**: 2026-10-18

All models are domain entities (`src/features/[feature]/models/*.model.ts`): camelCase, `readonly` fields, produced by pure mappers from TMDB DTOs (see `contracts/`). None are persisted (constitution Principle IV: all state in-memory, server state lives only in the TanStack Query cache).

## Genre

Source: `genres` feature slice. Represents one movie category from the TMDB genre catalog, used to resolve a movie's `genreIds` to display names.

| Field | Type | Notes |
|---|---|---|
| `genreId` | `number` | TMDB's `id`; stable identifier, used as the `Map` key for lookup |
| `name` | `string` | Already in the request's language (`es-PY`) because TMDB resolves translation server-side for this endpoint; never empty per the TMDB contract |

**Validation / derivation rules**:
- No field is optional; `mapGenre` is a 1:1 field rename (`id` → `genreId`).
- The full catalog (~19 entries) is fetched once (`use-movie-genres`, `staleTime`/`gcTime` 24h) and turned into a `Map<number, string>` by the screen (`useMemo`, once per successful response) for O(1) lookup.

**Relationships**: a `Movie.genreIds` entry that has no matching `Genre.genreId` in the catalog is skipped (not an error) when resolving display names (`getGenreNames`).

## Movie (list item)

Source: `movies` feature slice. One popular movie as shown on the main screen (featured card or grid card — the same model powers both; the screen, not the model, decides which movie is "featured").

| Field | Type | Notes |
|---|---|---|
| `movieId` | `number` | TMDB's `id`; stable identifier, used as the de-duplication key across pages and as FlashList's `keyExtractor` |
| `title` | `string` | Shown as-is; TMDB returns the title in the requested language when a translation exists, otherwise its original-language title (spec FR-020, Assumptions) |
| `posterPath` | `string \| null` | Relative TMDB path (e.g. `/ngl2...jpg`); `null` → grid card shows the placeholder (FR-007/FR-003) |
| `backdropPath` | `string \| null` | Relative TMDB path; `null` → featured card shows the placeholder (FR-007/FR-003) |
| `releaseYear` | `number \| null` | Derived from `release_date`; `null` when the date is missing/empty → UI shows a dash (FR-008) |
| `genreIds` | `readonly number[]` | Resolved to display names by the screen via the `Genre` lookup, not stored as names on the model |
| `voteAverage` | `number \| null` | `null` when TMDB reports `0` or omits the field (TMDB's own convention for "not yet rated") → UI shows a dash (FR-008); otherwise rendered with exactly one decimal |

**Validation / derivation rules** (all in `mapMovie`, pure, no side effects):
- `releaseYear = parseReleaseYear(release_date)`: `null` if `release_date` is `""`/missing, otherwise the 4-digit year parsed from the `YYYY-MM-DD` string.
- `voteAverage = vote_average > 0 ? vote_average : null`.
- Fields the UI never reads (`overview`, `popularity`, `vote_count`, `adult`, etc.) are not copied onto the model — the DTO carries them, the model does not.

**Identity / uniqueness rule**: `movieId` is the de-duplication key used by `use-popular-movies`'s `select` when flattening pages (FR-011/SC-005); the same id is never rendered twice regardless of how many fetched pages contain it (TMDB pages can overlap).

**Derived, not stored, per spec**:
- "Featured" is not a model field. The screen computes `featured = movies[0]` and `gridMovies = movies.slice(1)` from the flattened, de-duplicated list every render; because de-duplication and page order are stable, `movies[0]` is always the first record of the first page and never changes identity as later pages load (spec FR-004, Acceptance Scenario 2).
- Display-ready strings (`formatRating`, `formatCardFooter`) are computed by pure `utils`, not stored on the model, so the model stays a plain data-transfer shape.

## MoviePage (loaded batch)

Source: `movies` feature slice. One fetched page from `GET /movie/popular`, the unit `useInfiniteQuery` accumulates.

| Field | Type | Notes |
|---|---|---|
| `movies` | `readonly Movie[]` | This page's results, in TMDB's returned order |
| `page` | `number` | Echoes the requested page number; used to compute the next `pageParam` |
| `totalPages` | `number` | TMDB's `total_pages`, capped by TMDB itself at 500; `getNextPageParam` stops requesting once `page >= min(totalPages, 500)` (FR-013) |

**State transitions** (owned by `useInfiniteQuery`, not the model itself):

```
idle → loading (first page) → success (page 1 loaded)
success → fetching-next-page (scroll-triggered) → success (page N appended)
success → fetching-next-page → error (page N failed; pages 1..N-1 stay visible, FR-017)
success (last page reached) → success (hasNextPage = false; no further fetch, FR-013)
```

No entity models this as a stored field; `hasNextPage`, `isFetchingNextPage`, and the error object are TanStack Query's own derived state, read directly by the screen.

## Entity relationship summary

```
Genre (catalog, fetched once)
  ▲ resolved-by-id (genreIds → names), never embedded
  │
Movie (one TMDB result) ───belongs-to──▶ MoviePage (one fetched page)
  │
  └─ flattened + de-duplicated across all loaded MoviePages ──▶ the screen's single ordered movie list
       └─ movies[0] = featured, movies[1..] = grid
```
