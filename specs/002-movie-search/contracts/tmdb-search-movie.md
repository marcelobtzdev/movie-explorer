# Contract: TMDB search movies

**Endpoint**: `GET https://api.themoviedb.org/3/search/movie` (relative path `/search/movie` on `tmdbClient`)

## Request

| Parameter | Source | Value |
|---|---|---|
| `query` | service argument | the trimmed committed search term (1 to 100 characters) |
| `language` | `tmdbClient` default params | `TMDB_LANGUAGE` (`es-PY`), the same constant as the popular list |
| `Authorization` | `tmdbClient` default headers | `Bearer` the TMDB Read Access Token from env |

Not sent: `page`, `include_adult`, `region`, `year`, `primary_release_year` (TMDB defaults apply;
`include_adult` defaults to `false`).

## Response (fields used)

Same shape as `GET /movie/popular`: `page`, `results[]`, `total_pages`, `total_results`.
Per result: `id`, `title`, `poster_path`, `backdrop_path`, `release_date`, `genre_ids`,
`vote_average`. Other fields (`overview`, `popularity`, `vote_count`, `video`, `adult`,
`original_title`, `original_language`) are ignored.

Known data quirks:

- `release_date` can be an empty string: the release year is `null`.
- `vote_average` can be `0`: the rating is `null`.
- `poster_path` and `backdrop_path` can be `null`; one real result carries a misspelled
  `posterh` key instead of `poster_path`. The mapper reads `poster_path ?? null`, so that result
  shows the placeholder.

## Pagination

Only the first page is requested (see spec, FR-007). `total_pages` is returned but not used.

## Errors

| Case | Handling |
|---|---|
| Network failure | `AppError` with network code; `meta.skipNetworkError` is set, so the screen shows the inline error state instead of the overlay |
| HTTP 5xx | `AppError` with server code; `meta.skipServerError` is set, same inline handling |
| HTTP 401 | Wrong or missing read access token (configuration error) |
| Empty `results` | Valid response; the screen shows the empty state naming the term |
| Superseded request | Cancelled through the TanStack Query `AbortSignal`; cancelled requests show no error |
