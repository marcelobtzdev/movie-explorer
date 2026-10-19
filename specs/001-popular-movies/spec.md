# Feature Specification: Popular Movies List

**Feature Branch**: `001-popular-movies`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "Feature: Popular movies list (short name: popular-movies). The app, named MovieExplorer, shows on its main screen the currently most popular movies so users can quickly discover what is trending. The screen has a header (app name, subtitle, static avatar), category tabs (Populares, Mejor Valoradas, En Cartelera; only Populares works), a featured card with the first movie, the section 'Películas Populares' with a two-column grid of the remaining movies (poster, rating badge, title, and a footer with release year and genre names), and a bottom menu (Populares, Cartelera, Mejor Valoradas, Favoritos; only Populares works). Movies load automatically while scrolling (infinite scroll, no button, no duplicates). The first load shows a full-screen skeleton; errors, empty results and failures when loading more have clear states. Search, filters, movie detail navigation and anything outside the project constitution's current scope are out of scope."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the popular movies (Priority: P1)

When a user opens the app, they land on the main screen of MovieExplorer. They see the app name with the subtitle "Populares" and a static avatar, a row of category tabs, a featured card with the first popular movie, the section title "Películas Populares" and, below it, a two-column grid with the remaining popular movies, plus a bottom menu.

The featured card shows the movie's wide image, its rating, its title, its genre names and its release year. Each grid card shows the poster, a rating badge over the top-right corner of the poster, the title on a single line and a footer with the release year and genre names (for example "2023 • Acción / Aventura").

**Why this priority**: This is the first thing every user sees and the sole reason to open the app at this stage. It is the minimum independently shippable and demonstrable slice.

**Independent Test**: Launch the app with a working connection and confirm the main screen displays the header, tabs, featured card, section title, two-column grid and bottom menu with the data described above, without any other feature (search, detail) existing.

**Acceptance Scenarios**:

1. **Given** the app has just launched and the movie data service responds successfully, **When** the main screen finishes loading, **Then** the user sees the header ("MovieExplorer", subtitle "Populares", avatar), the category tabs with "Populares" active, the featured card, the section title "Películas Populares", a two-column grid and the bottom menu.
2. **Given** the service returns a list of movies, **When** the screen renders, **Then** the featured card shows the first movie of the list and the grid shows the remaining movies in the order returned, without repeating the featured movie.
3. **Given** a grid movie, **When** its card renders, **Then** it shows the poster, a rating badge with a star and the rating with one decimal, the title on one line (ellipsis if it overflows) and a footer with the release year and up to two genre names (for example "2023 • Acción / Aventura"), with no other labels or icons.
4. **Given** the featured movie, **When** its card renders, **Then** it shows the wide image, the rating with one decimal over "/ 10 TMDB", the title, up to three genre names and the release year.
5. **Given** a movie with no poster (or no wide image for the featured card), **When** its card renders, **Then** a neutral placeholder is shown instead of a broken or empty image area.
6. **Given** a movie has no rating value, **When** its card renders, **Then** a dash is shown in place of a number.
7. **Given** a movie has no release date, **When** its card renders, **Then** a dash is shown in place of the year.
8. **Given** the list contains exactly one movie, **When** the screen renders, **Then** only the featured card is shown, with no grid and no empty message.
9. **Given** the user taps a category tab other than "Populares" or a bottom-menu item other than "Populares", **When** the tap happens, **Then** nothing changes, and those elements are exposed to accessibility as unavailable.
10. **Given** the user taps a movie card or the featured card, **When** the tap happens, **Then** nothing happens.

---

### User Story 2 - Keep browsing (Priority: P2)

As the user scrolls down, more popular movies load automatically and are appended to the grid, so they can keep discovering movies without tapping any button. No movie ever appears twice, and scrolling stays smooth with no blank gaps or jumps. There is no "load more" button and no page counter.

**Why this priority**: Extends the value of Story 1 by letting users explore beyond the first batch, but the app is already useful and testable with Story 1 alone.

**Independent Test**: With Story 1 working, scroll to the bottom of the loaded movies and confirm more movies are fetched and appended automatically, a small loading indicator appears at the bottom meanwhile, and no movie id appears more than once.

**Acceptance Scenarios**:

1. **Given** the user has scrolled near the end of the loaded movies and more are available, **When** the scroll position crosses that threshold, **Then** the next batch loads automatically and is appended to the grid, with a small loading indicator at the bottom during the fetch.
2. **Given** movies from multiple loaded batches, **When** the combined list is displayed, **Then** no movie appears more than once, and the featured movie remains the first movie of the first batch.
3. **Given** the user has scrolled to the end of all movies the service can provide, **When** no further batches exist, **Then** no additional load is attempted and no error is shown.
4. **Given** a slow connection while a batch is loading, **When** the user repeatedly scrolls to the end, **Then** only one load request is in flight at a time and the indicator remains visible until it completes.
5. **Given** loading the next batch fails (for example connectivity drops mid-scroll), **When** the failure occurs, **Then** the loaded movies remain visible and a retry action appears at the bottom in place of the indicator.

---

### User Story 3 - Understand what is happening (Priority: P3)

At every point the user can tell the state of the screen: loading the first time (a full-screen skeleton), an error that blocks the first load with a retry action, an empty result, or a failure while loading more (Story 2's footer retry).

**Why this priority**: Builds trust and prevents the perception of a broken app, but the screen is functional (Stories 1 and 2) before these states are refined.

**Independent Test**: Simulate a slow network, a failed initial load and a successful load with zero movies; confirm each produces its own distinct Spanish-language state, and that the error state has a working retry action.

**Acceptance Scenarios**:

1. **Given** the app has just launched and the first batch has not arrived, **When** the main screen is shown, **Then** a full-screen skeleton mirroring the final layout (tab placeholders, featured-card placeholder, section-title placeholder and grid-card placeholders) is displayed between the real header and the real bottom menu, and no movie cards, error or empty messages are shown.
2. **Given** the initial load fails (no connection or service failure), **When** the failure is detected, **Then** a clear, centered error message in Spanish with a "Reintentar" action is shown between the tabs and the bottom menu, and no partial or stale content is shown.
3. **Given** the user taps the retry action after an initial failure, **When** the request is made, **Then** the screen returns to the skeleton and then shows either the content or the error state again.
4. **Given** the service responds successfully with zero movies, **When** loading finishes, **Then** a friendly, centered empty-state message in Spanish is shown instead of a blank screen or an error.

---

### Edge Cases

- A movie without a poster or wide image shows a neutral placeholder; an image that fails to load falls back to the same placeholder.
- Grid card titles are limited to one line with an ellipsis; all grid cards keep the same height.
- A movie with no rating shows a dash ("–"); a rating of zero from the service counts as no rating.
- A movie with no release date shows a dash in place of the year; a movie with no genres omits the separator and the names.
- Genre names come from the genre catalog, which is loaded before the movie list. A genre id that has no match in the catalog is skipped and not shown.
- Once the service indicates there are no more movies, scrolling to the end does not trigger another load and does not show an error.
- On a slow connection the skeleton or footer indicator remains visible until content arrives or the request fails; repeatedly reaching the end of the list while a load is in flight does not start a duplicate load.
- If connectivity is lost while movies are visible, they remain on screen; loss of connectivity only affects the in-flight or next load, per Story 2.
- Header, category tabs and bottom menu stay visible in the error and empty states.
- All visible text is in Spanish (es-PY); movie titles appear in Spanish when the service provides one, otherwise as provided.
- The screen respects safe areas, scales with the system font size and every interactive element (the retry actions) exposes an accessible label and a touch target of at least 44x44 pt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The main screen MUST be the first screen shown when the app opens, on both Android and iOS, and MUST display the popular movies as described in this spec.
- **FR-002**: The header MUST show the app name "MovieExplorer", the subtitle "Populares" and a static avatar that is not interactive. It MUST NOT include a search icon.
- **FR-003**: The screen MUST show category tabs "Populares", "Mejor Valoradas" and "En Cartelera", with "Populares" active. The other tabs MUST do nothing when pressed and MUST be exposed to accessibility as unavailable.
- **FR-004**: The screen MUST show a featured card with the first movie of the list, containing its wide image, its rating with one decimal and "/ 10 TMDB", its title (up to two lines), up to three genre names and its release year. The featured movie MUST NOT be repeated in the grid and MUST remain the first movie of the first batch as more batches load.
- **FR-005**: The screen MUST show the section title "Películas Populares" followed by a two-column grid with the remaining movies.
- **FR-006**: Each grid card MUST show the poster, a rating badge over the poster's top-right corner (star plus rating with exactly one decimal), the title on a single line with an ellipsis for overflow, and a footer with only the release year and up to two genre names in the form "2023 • Acción / Aventura". The footer MUST NOT contain labels, arrows or other icons.
- **FR-007**: The system MUST show a neutral placeholder when a movie has no poster or wide image, and MUST fall back to it if the image fails to load.
- **FR-008**: The system MUST show a dash when a movie has no rating (including a zero rating) and a dash in place of the year when there is no release date.
- **FR-009**: The screen MUST show a bottom menu with "Populares" (active), "Cartelera", "Mejor Valoradas" and "Favoritos". Only "Populares" is functional; the other items MUST do nothing when pressed and MUST be exposed to accessibility as unavailable.
- **FR-010**: The system MUST automatically load and append more popular movies when the user scrolls near the end of the loaded movies, with no "load more" button and no page counter.
- **FR-011**: The system MUST never display the same movie more than once across all loaded batches.
- **FR-012**: The system MUST show a small loading indicator at the bottom of the list while an additional batch is being fetched.
- **FR-013**: The system MUST stop attempting to load more movies, without showing an error, once the service indicates no further movies are available.
- **FR-014**: The system MUST prevent duplicate concurrent load requests: while a batch is loading, additional scroll-triggered attempts MUST be ignored until it completes.
- **FR-015**: While the genre catalog and the first batch load, the system MUST show a full-screen skeleton that mirrors the final layout (three tab placeholders, featured-card placeholder, section-title placeholder and grid-card placeholders), keeping the real header and bottom menu visible, and MUST NOT show movie cards, error messages or empty messages.
- **FR-016**: When the initial load fails (the genre catalog or the first batch; no connectivity or service failure), the system MUST show a clear, centered error message with a "Reintentar" action that re-attempts the initial load; header, tabs and bottom menu remain visible.
- **FR-017**: When a subsequent load fails, the system MUST keep the loaded movies visible and show a retry action at the bottom of the list; the action MUST re-attempt only the failed batch.
- **FR-018**: When the service successfully returns zero movies, the system MUST show a friendly, centered empty-state message; header, tabs and bottom menu remain visible.
- **FR-019**: The system MUST keep loaded movies visible if connectivity is lost after the initial load succeeded.
- **FR-020**: All user-facing text MUST be in Spanish (es-PY); movie titles are shown in the language the service provides.
- **FR-021**: The screen MUST respect safe areas and scale its text according to the system font size.
- **FR-022**: Every interactive element (retry actions) MUST expose an accessible label and a touch target of at least 44x44 pt. Movie cards MUST expose a label with title, year and rating.
- **FR-023**: Tapping a movie card or the featured card MUST NOT navigate or trigger any action in this feature (the detail screen is specified separately).

### Key Entities

- **Movie (list item)**: A single popular movie. Attributes: a stable identifier (used to prevent duplicates), a title, a poster image reference (may be absent), a wide image reference (may be absent), a release year (may be absent), a list of genre ids (resolved to names through the genre catalog), and a rating (may be absent; average user score shown with one decimal).
- **Genre**: A movie category from the genre catalog. Attributes: an identifier and a name (in Spanish). The catalog is small and is loaded once, before the first batch of movies.
- **Movie Page (loaded batch)**: One fetched batch of movies, used to drive infinite scroll. Attributes: the ordered movies it contains and whether a further batch is available.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a typical mobile connection, the first batch of movies becomes visible within 2 seconds of opening the app.
- **SC-002**: A user can scroll continuously through at least 100 movies without pressing any button and without ever seeing a blank gap in the grid.
- **SC-003**: 100% of movie cards shown display an image or its placeholder, a title and a rating or a dash — never a blank or broken card.
- **SC-004**: In every failure scenario (initial load fails, zero movies, loading more fails) the user sees an explanatory message and, where applicable, a working retry action; the screen is never left blank.
- **SC-005**: Across a full browsing session, no movie identifier appears more than once in the displayed list.
- **SC-006**: The screen behaves identically — layout, states, behavior — on Android and iOS.

## Assumptions

- Movies are displayed in the order the service returns them (no client-side sorting or filtering); the first one is the featured movie.
- The release year comes from the release date provided by the service; genre names come from the genre catalog, which is requested before the movie list; the first screen state (skeleton, error) covers both requests, and a failed genre request is handled like a failed initial load (error state with "Reintentar").
- The tabs and bottom menu other than "Populares" are visual only in this feature; category switching, favorites and other sections are out of scope.
- The app has a single dark theme.
- No search bar, filter button, grid/list toggle, featured-card buttons, bookmark icons or runtime information exist in this feature.
- Tapping a movie has no effect in this feature.
- This feature's plan is also responsible for the initial project setup (the project does not exist yet), as required by the project constitution.
- The target language for all text and for the data requested from the service is Spanish (es-PY); the app has no internationalization and no other language is supported.
- "Rating" is the average user score (one decimal) provided by the service; no separate critic score is introduced.
- An "error" covers both connectivity failures and failures reported by the service; no distinction in message content is required.
