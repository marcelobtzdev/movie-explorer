# Tasks: Movie Search

**Input**: `specs/002-movie-search/` (spec.md, plan.md, contracts/tmdb-search-movie.md)
**Tests**: colocated tests are required by the constitution (Principle XI); each implementation task has its test.

## Phase 1: Setup

- [X] T201 Install `react-hook-form@7.90.0` and `@hookform/resolvers@5.9.2` with exact versions (plan, Technical Context)
- [X] T202 Add `SEARCH_DEBOUNCE_MS = 300` to `src/constants/list.ts`

## Phase 2: Foundational (blocks all stories)

- [X] T203 [P] `src/hooks/use-debounced-value.ts` + test: returns the value after the delay; resets on every change; fake timers
- [X] T204 [P] `src/features/movies/stores/movies-store.ts` + test: `searchTerm`, `setSearchTerm`, `clearSearchTerm` (in-memory Zustand)
- [X] T205 [P] `src/features/movies/schemas/search.schema.ts` + test: trims, max 100, empty allowed; exports `SearchSchema`, `SearchFormData`, `resolver`, `SearchFormDefaults`
- [X] T206 [P] `src/features/movies/mappers/movie.mapper.ts`: `poster_path ?? null`; test for a misspelled `posterh` key
- [X] T207 `src/features/movies/api/movies.keys.ts`: `search(term)` key; `movies.service.ts` `searchMovies({ query, signal })` sending only `query` (test: params and signal)
- [X] T208 `src/features/movies/constants/strings.ts`: search placeholder, accessible labels, result title, empty and clear texts

## Phase 3: User Story 1 — Search movies by title (P1)

- [X] T209 `src/features/movies/hooks/use-search-movies.ts` + test: enabled only for a non-empty term and successful genres; single page; `keepPreviousData`; skip meta flags
- [X] T210 `src/features/movies/hooks/use-movie-search.ts` + test: RHF with `zodResolver`; debounced commit of the trimmed term; whitespace-only term commits empty
- [X] T211 `src/components/molecules/SearchField/` + test: value, placeholder, accessible label, clear action (44x44, accessible label), keyboard return key
- [X] T212 `movies.screen.tsx`: search field between header and tabs; popular list when the term is empty; search results with featured card and grid; section title `Resultados para «{term}»`

## Phase 4: User Story 2 — Return to the popular list (P2)

- [X] T213 Screen: clearing the field (text or clear action) shows the popular list; the clear action commits immediately
- [X] T214 Screen test: popular data reused after clearing; no request for an empty term

## Phase 5: User Story 3 — Loading, error and empty states (P3)

- [X] T215 Screen: skeleton only when no results are loaded yet; previous results stay visible while a new term loads
- [X] T216 Screen: search error state with retry repeating the same term; empty state naming the term; search field visible in every state
- [X] T217 Screen: `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` on the results list

## Phase 6: Polish

- [X] T218 Constitution amendments: Principle II.3 and the layout item (search field), Principle IX (`query` and `language` only), not-in-scope text (search bar removed from the list; filters stay out) — version 1.3.0
- [X] T219 `contracts/tmdb-search-movie.md` reviewed against the implemented request
- [X] T220 `pnpm pr:check` green (lint, types, tests)
