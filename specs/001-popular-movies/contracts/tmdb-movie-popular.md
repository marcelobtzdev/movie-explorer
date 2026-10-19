# Contract: `GET /movie/popular` (TMDB)

Consumed by: `src/features/movies/api/movies.service.ts` (`moviesService.getPopular`).

## Request

```
GET {TMDB_BASE_URL}/movie/popular?page={page}&language=es-PY
Authorization: Bearer {TMDB_ACCESS_TOKEN}
```

- `TMDB_BASE_URL` = `env.TMDB_BASE_URL` (includes the API version, e.g. `https://api.themoviedb.org/3`); the service calls the relative path `/movie/popular`.
- `page`: 1-based, supplied by `useInfiniteQuery`'s `pageParam` (`initialPageParam: 1`).
- `language`: the constant `TMDB_LANGUAGE` (`es-PY`), sent on every request (constitution Principle IX).
- The `AbortSignal` from the query hook is forwarded to axios so a superseded/cancelled request never surfaces an error (constitution Principle VII).

## Response (fields used)

```json
{
  "page": 1,
  "results": [
    {
      "id": 640146,
      "title": "Ant-Man and the Wasp: Quantumania",
      "poster_path": "/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg",
      "backdrop_path": "/gMJngTNfaqCSCqGD4y8lVMZXKDn.jpg",
      "release_date": "2023-02-15",
      "genre_ids": [28, 12, 878],
      "vote_average": 6.5
    }
  ],
  "total_pages": 41253,
  "total_results": 825050
}
```

| Field | Used as | Notes |
|---|---|---|
| `page` | `MoviePage.page` | Echo of the request |
| `results[].id` | `Movie.movieId` | Stable id; de-duplication key |
| `results[].title` | `Movie.title` | As TMDB returns it (Spanish when translated) |
| `results[].poster_path` | `Movie.posterPath` | Nullable |
| `results[].backdrop_path` | `Movie.backdropPath` | Nullable; featured card's wide image |
| `results[].release_date` | `Movie.releaseYear` | Parsed to a 4-digit year; `null` if missing/empty |
| `results[].genre_ids` | `Movie.genreIds` | Resolved to names via the `genres` slice, not embedded here |
| `results[].vote_average` | `Movie.voteAverage` | `null` when TMDB reports `0` (not yet rated) |
| `total_pages` | `MoviePage.totalPages` | TMDB caps this at `500`; `getNextPageParam` stops at `min(total_pages, 500)` |

Ignored fields (present in the real response, not mapped): `overview`, `popularity`, `vote_count`, `adult`, `original_language`, `original_title`, `video`.

## Pagination limits

- TMDB never serves a page beyond `500`, regardless of the real `total_pages` value; `getNextPageParam` returns `undefined` once `page >= min(total_pages, 500)`, which both stops further fetches and suppresses any error (spec FR-013, edge case "reaching the end").
- TMDB's own pages can contain overlapping movies across requests (its popularity ranking shifts between calls); `use-popular-movies`'s `select` de-duplicates by `movieId` when flattening all loaded pages (spec FR-011, SC-005).

## Error cases

| Condition | `AppError.statusCode` | Screen behavior |
|---|---|---|
| No connectivity / timeout / DNS failure | `undefined` | First page → initial `ErrorState` + "Reintentar" (FR-016). Later page → footer retry, loaded movies stay visible (FR-017). Query `meta.skipNetworkError: true` so the global network overlay does not also fire for this screen's own query (the screen owns its inline error states). |
| TMDB 5xx | `500` | Same as above; `meta.skipServerError: true` for the same reason. |
| TMDB 401 (bad token) / 429 (rate limit) | `401` / `429` | Treated as a generic initial-load or footer failure by this screen (no dedicated message per status code in this feature); shown via the same `ErrorState`/footer-retry UI. |
| Cancelled (superseded request) | n/a (`axios.isCancel`) | Never surfaced to the UI. |
| Successful response, `results: []` on page 1 | n/a | `EmptyState` (FR-018), not an error. |
