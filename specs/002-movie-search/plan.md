# Implementation Plan: Movie Search

**Branch**: `002-movie-search` | **Spec**: [spec.md](./spec.md)

## Summary

Add a search field above the category tabs. The field is a React Hook Form form validated with
Zod; its trimmed value is debounced 300 ms and committed to a Zustand store. The committed term
selects the list query: the popular infinite query when empty, or a single-page search query
(`GET /search/movie`, parameters `query` and `language` only) otherwise. The results reuse the
popular list layout and states.

## Technical Context

Same stack and conventions as `specs/001-popular-movies/plan.md`. New dependencies, all pinned
to exact versions:

| Package | Version | Why |
|---|---|---|
| `react-hook-form` | 7.90.0 | The search field is the only form; the constitution's Forms row (Principle V) |
| `@hookform/resolvers` | 5.9.2 | `zodResolver` bridge; 5.x declares `zod` `^4.0.0` as a supported peer |

No other dependency is added. Zod (4.6.7), Zustand (5.0.15) and TanStack Query (5.104.4) are
already installed.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Project structure | PASS | Search code lives in `features/movies` (stores, schemas, hooks) and in shared `components/molecules/SearchField` and `hooks/use-debounced-value` |
| II. Feature behavior | PASS, amended | Principle II.3 and the main-screen layout (item 5) are updated for the search field; filters stay out of scope |
| III. Data flow | PASS | `keys → service → hook`; the search hook uses `tmdbClient` through the service |
| IV. State | PASS | Only the committed term lives in `useMoviesStore`; server data stays in TanStack Query |
| V. Forms | PASS | React Hook Form + Zod schema in `schemas/search.schema.ts`; default values exported |
| VI. Styling | PASS | Styles in each component file; the search field and clear action stay small |
| VII. Performance | PASS | 300 ms debounce, `keepPreviousData`, cancelled superseded requests via `AbortSignal`, `keyboardDismissMode="on-drag"` |
| VIII. UI states | PASS | Loading, error, empty and results states defined in the spec (FR-009 to FR-013) |
| IX. TMDB access | PASS, amended | The endpoint line changes from `include_adult=false` to `query` and `language` only |
| X–XIII | PASS | Tests colocated; string constants; ADR not needed (no new architecture decision beyond the form library already in the stack) |

## Project Structure

```text
src/
├── components/molecules/SearchField/      # presentational input + clear action (styles inline)
├── constants/list.ts                      # + SEARCH_DEBOUNCE_MS = 300
├── hooks/use-debounced-value.ts           # reusable debounce hook
└── features/movies/
    ├── api/movies.keys.ts                 # + search(term) key
    ├── api/movies.service.ts              # + searchMovies({ query, signal })
    ├── constants/strings.ts               # + search strings
    ├── hooks/use-search-movies.ts         # useQuery, single page, keepPreviousData
    ├── hooks/use-movie-search.ts          # RHF form + debounce + store commit
    ├── mappers/movie.mapper.ts            # poster_path normalized to null
    ├── schemas/search.schema.ts           # Zod schema, type, resolver, defaults
    ├── stores/movies-store.ts             # Zustand: committed searchTerm
    └── screens/movies.screen.tsx          # search field + switch between popular and search
```

## Design decisions

1. **Form and commit flow.** `useMovieSearch` owns the React Hook Form instance (`zodResolver`).
   The field value is debounced with `useDebouncedValue(value, 300)`; the trimmed result is
   written to `useMoviesStore.setSearchTerm`. The clear action writes an empty term immediately,
   so clearing does not wait for the pause.
2. **Query selection.** `usePopularMovies` stays unchanged. `useSearchMovies({ term, enabled })`
   runs only for a non-empty term and `enabled` also requires the genres query to be successful,
   the same gate as the popular list. `placeholderData: keepPreviousData` keeps old results on
   screen while a new term loads (FR-010).
3. **Single page.** The search query has no `getNextPageParam`; the screen never asks for more
   results (FR-007). The response is mapped with the existing `mapMoviePage`.
4. **Request parameters.** The service sends `{ params: { query } }`. The `language` parameter
   already comes from the shared `tmdbClient` defaults, so every request gets `es-PY` (FR-004).
5. **Poster key.** The mapper uses `dto.poster_path ?? null`, so a response with a misspelled
   key still renders the placeholder instead of passing `undefined` into the Poster atom.

## Open decisions (for the user)

- **Pagination of search results.** Today the search shows only the first page (up to 20
  movies; the example response reports 39). Supporting more results needs `page` in the request
  and an infinite query, the same as the popular list. This plan does not add it because the
  agreed request contains only `query` and `language`.

## Testing approach

- Unit tests for the store, the schema, the debounce hook, the service (params and signal), the
  search hook (gating, term trimming, single page), the mapper poster fallback, `SearchField`.
- Screen tests for the three user stories: debounced request, switching back to popular, the
  loading, error and empty states, and the keyboard props on the list.
- Jest fake timers for the 300 ms debounce; `await render(...)` as in the popular list tests.
