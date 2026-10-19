# Feature Specification: Movie Search

**Feature Branch**: `002-movie-search`
**Created**: 2026-10-19
**Status**: Draft
**Input**: Search bar on the movies screen that searches movies by title with TMDB `GET /search/movie`; an empty search shows the popular list again (constitution, Principle II.3).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search movies by title (Priority: P1)

A user types part of a movie title in the search field above the category tabs. After a short pause, the list shows the movies whose titles match, laid out like the popular list: the first result as the featured card and the rest as a two-column grid.

**Why this priority**: searching is the core of this feature and the only way to find a specific movie.

**Independent Test**: type a title on the movies screen and confirm the list shows the matching movies in the same layout as the popular list.

**Acceptance Scenarios**:

1. **Given** the movies screen with the popular list, **When** the user types "fight club" and stops typing for 300 ms, **Then** the list shows the search results for "fight club" and the request was sent once for that term.
2. **Given** the user keeps typing, **When** each keystroke happens within 300 ms of the previous one, **Then** no search request is sent until the user pauses.
3. **Given** search results are shown, **When** the first result is displayed, **Then** it is the featured card and the remaining results are in the grid, with no duplicate movie.
4. **Given** the user types only spaces, **When** the pause ends, **Then** the popular list is shown and no search request is sent.

---

### User Story 2 - Return to the popular list (Priority: P2)

A user clears the search field, either by deleting the text or with the clear action, and the popular list comes back.

**Why this priority**: without a way back, a search would hide the default content.

**Independent Test**: search, clear the field, and confirm the popular list is shown again.

**Acceptance Scenarios**:

1. **Given** search results are shown, **When** the user deletes the text, **Then** after the pause the popular list is shown and its data is reused without a new request if it is still fresh.
2. **Given** search results are shown, **When** the user taps the clear action, **Then** the field is emptied and the popular list is shown immediately, without waiting for the pause.

---

### User Story 3 - Understand what is happening while searching (Priority: P3)

The user always knows the state of the search: while the first results load, a loading state is shown; if the search fails, a message with a retry action is shown; if nothing matches, a friendly empty message is shown that names the searched term. The search field stays visible in every state.

**Why this priority**: the same clarity rules as the popular list apply to search.

**Independent Test**: simulate a slow, failing and empty search and confirm each state is visible and the field stays available.

**Acceptance Scenarios**:

1. **Given** no results are loaded yet, **When** the first search for a term is in flight, **Then** the loading skeleton is shown.
2. **Given** results for a previous term are shown, **When** the user types a new term, **Then** the previous results stay visible until the new results arrive.
3. **Given** the search request fails, **When** the error is shown, **Then** an error message and a retry action are visible, and the retry repeats the search for the same term.
4. **Given** the search returns no movies, **When** the result is shown, **Then** an empty message names the searched term, for example "No encontramos películas para «fight club»".

---

### Edge Cases

- Whitespace around the term is ignored: "  dune  " searches for "dune".
- A term longer than 100 characters is not accepted by the field (the field stops at 100 characters).
- Special characters are sent as typed and encoded by the HTTP client; no client-side filtering.
- A movie without a poster shows the placeholder; a title with no release date shows a dash for the year, exactly as in the popular list.
- A search result that TMDB returns with a misspelled poster key (for example `posterh`) shows the placeholder instead of breaking the list.
- If the connection is lost while a search is shown, the results already on screen stay visible.
- A search that is superseded by a newer term is cancelled; its late response never replaces the newer results.
- The keyboard is dismissed when the user scrolls the results; tapping a result does nothing (there is no detail screen yet).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The movies screen MUST show a search field between the header and the category tabs, with the placeholder "Buscar películas" and the accessible label "Buscar películas".
- **FR-002**: The search field MUST debounce the typed text by 300 ms before it triggers a request. Only the trimmed committed term feeds the request.
- **FR-003**: When the committed term is empty after trimming, the screen MUST show the popular list and MUST NOT send a search request.
- **FR-004**: When the committed term is not empty, the screen MUST request `GET /search/movie` with only the `query` parameter (the trimmed term) and the constant `language` (`es-PY`) already used by the popular list. No `page`, `include_adult`, `region`, `year` or `primary_release_year` parameter is sent.
- **FR-005**: The search results MUST be laid out like the popular list: the first result as the featured card, the remaining results in the two-column grid, and no movie repeated.
- **FR-006**: The section title MUST read `Resultados para «{term}»` while search results are shown, and "Películas Populares" otherwise.
- **FR-007**: The search MUST show only the first page of results returned by TMDB. No further pages are requested (see Assumptions).
- **FR-008**: The search field MUST have a clear action (accessible label "Borrar búsqueda", touch target at least 44x44 pt) that empties the field and shows the popular list immediately.
- **FR-009**: While a search is loading and no results are shown yet, the loading skeleton MUST be shown.
- **FR-010**: While a new term loads, the previous results MUST stay visible until the new results arrive.
- **FR-011**: When a search fails and no results are loaded for it, an error state MUST show the message "No pudimos cargar las películas" with a "Reintentar" action that repeats the search for the same term.
- **FR-012**: When a search returns no movies, an empty state MUST show "No encontramos películas para «{term}»".
- **FR-013**: The search field MUST remain visible and usable in the loading, error and empty states.
- **FR-014**: Tapping the search field MUST open the keyboard with the search return key; scrolling the results MUST dismiss the keyboard; taps on the results MUST keep working while the keyboard is open.
- **FR-015**: Search requests that are superseded or unmounted MUST be cancelled, and their late responses MUST NOT replace the current results.
- **FR-016**: All visible texts MUST come from the feature string constants in Spanish (es-PY).

### Key Entities

- **Search term**: the trimmed text the user committed after the pause; at most 100 characters.
- **Movie** and **Movie page**: the same entities as the popular list (see `specs/001-popular-movies/data-model.md`). The search response has the same page shape (`page`, `results`, `total_pages`, `total_results`).

## Success Criteria *(mandatory)*

- **SC-001**: A search for a title shows its results within 2 seconds on a typical mobile connection, measured from the end of the 300 ms pause.
- **SC-002**: Typing a term of ten characters sends at most one search request.
- **SC-003**: In every failure case (error, no results, connection lost) the user sees an explanatory message and, when applicable, a retry action; the search field stays available.
- **SC-004**: Clearing the search shows the popular list within 300 ms when it is still cached.
- **SC-005**: The same movie never appears twice in the results.
- **SC-006**: The search behaves the same way on Android and iOS.

## Assumptions

- The search returns only the first page TMDB provides (up to 20 movies) because the agreed request contains only `query` and `language`. Showing more results needs the `page` parameter and infinite scrolling; this is a follow-up decision (see plan, Open decisions).
- The search covers movies only. TV series are out of scope (constitution), so the placeholder says "películas" even though the design mock says "películas o series".
- The header subtitle keeps showing "Populares" during a search, because the category tabs do not change.
- The category tabs stay visual and inactive during a search, exactly as on the popular list.
- The "include adult" option stays at TMDB's default (`false`), so adult titles are not returned.
- Tapping a result does nothing yet; the detail screen is a later spec.
