# Contract: `GET /genre/movie/list` (TMDB)

Consumed by: `src/features/genres/api/genres.service.ts` (`genresService.getMovieGenres`).

## Request

```
GET {TMDB_BASE_URL}/genre/movie/list?language=es-PY
Authorization: Bearer {TMDB_ACCESS_TOKEN}
```

- Same base client, same `language` constant as the movies contract.
- Requested once per app session (long cache: `staleTime`/`gcTime` 24h from `src/constants/query.ts`), **before** the first `movie/popular` call — `use-popular-movies` sets `enabled: genresQuery.isSuccess` so the movie list waits for the catalog (constitution Principle III, "Genres").
- The `AbortSignal` from the query hook is forwarded to axios.

## Response (fields used)

```json
{
  "genres": [
    { "id": 28, "name": "Acción" },
    { "id": 12, "name": "Aventura" },
    { "id": 878, "name": "Ciencia ficción" }
  ]
}
```

~19 entries total; TMDB resolves `name` to the requested `language` server-side (no further translation needed client-side).

| Field | Used as | Notes |
|---|---|---|
| `genres[].id` | `Genre.genreId` | Lookup key |
| `genres[].name` | `Genre.name` | Shown as-is |

## Resolution rule

The screen builds a `Map<number, string>` from the full catalog once per successful response (`useMemo`). `getGenreNames(genreIds, lookup, limit)` (pure util) maps a movie's `genreIds` to names in their original order, silently skipping any id that has no entry in the catalog (spec edge case: "A genre id that has no match in the catalog is skipped and not shown") — this is not treated as an error.

## Error cases

| Condition | `AppError.statusCode` | Screen behavior |
|---|---|---|
| No connectivity / timeout | `undefined` | Treated as an initial-load failure exactly like a failed first movie page: the screen's initial `ErrorState` + "Reintentar"; the retry re-requests the failed query first (genres, then the movie list) (spec Assumptions: "a failed genre request is handled like a failed initial load"). `meta.skipNetworkError: true` (screen owns its inline states). |
| TMDB 5xx | `500` | Same as above; `meta.skipServerError: true`. |
| Cancelled | n/a | Never surfaced. |
| Successful response, `genres: []` | n/a | Not expected in practice (TMDB's catalog is never empty); if it occurred, `getGenreNames` would simply resolve no names for any movie (dash/omitted genre segment in the footer), not an error — the movie list itself would still render. |
