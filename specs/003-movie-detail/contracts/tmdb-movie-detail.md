# Contract: TMDB movie detail

**Endpoint**: `GET https://api.themoviedb.org/3/movie/{movie_id}` (relative path `/movie/{movieId}` on `tmdbClient`)

## Request

| Parameter | Source | Value |
|---|---|---|
| `movieId` | route param | the id of the tapped movie (integer) |
| `language` | `tmdbClient` default params | `TMDB_LANGUAGE` (`es-PY`) |
| `Authorization` | `tmdbClient` default headers | `Bearer` the TMDB Read Access Token |

No other parameters are sent. `append_to_response` is not used: the detail needs no credits, videos or images.

## Response (fields used)

- `id` (number), `title` (string)
- `overview` (string; may be empty)
- `release_date` (string `YYYY-MM-DD`; may be empty)
- `backdrop_path` (string or `null`)
- `genres` (array of `{ id, name }`; may be empty)

Ignored: `poster_path`, `runtime`, `vote_average`, `vote_count`, `budget`, `revenue`, `status`,
`tagline`, `homepage`, `production_companies`, and the rest of the fields.

## Mapping

- `releaseDate`: the `release_date` string, or `null` when empty. The screen formats it in
  Spanish long form ("1 de marzo de 2024") or shows "Fecha no disponible".
- `backdropPath`: `backdrop_path` or `null`.
- `genres`: each `{ id, name }` mapped with `mapGenre` to `Genre { genreId, name }`.
- `overview`: the string; an empty string shows "Sin sinopsis disponible.".

## Errors

| Case | Handling |
|---|---|
| `404` | Movie not found: "not found" state with a "Volver" action; no retry; no overlay (`skipNetworkError`, `skipServerError`) |
| Network failure | Inline error state with "Reintentar"; no overlay |
| HTTP 5xx | Inline error state with "Reintentar"; no overlay |
| HTTP 401 | Configuration error (invalid read access token); generic error state |
| Superseded or unmounted request | Cancelled through the TanStack Query `AbortSignal`; no error shown |
