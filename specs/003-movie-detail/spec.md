# Feature Specification: Movie Detail

**Feature Branch**: `003-movie-detail`
**Created**: 2026-10-19
**Status**: Draft
**Input**: Tapping a movie opens a detail screen with more information: synopsis, genres, release date and a higher-resolution image (constitution, Principle II.2).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open a movie's detail (Priority: P1)

A user taps a movie in the popular list, in the search results or the featured card. A detail screen opens with the movie's large image, title, release date, genres and synopsis.

**Why this priority**: the detail screen is the reason tapping a movie exists; every other story depends on it.

**Independent Test**: from the popular list, tap a grid card and confirm the detail shows that movie's title, date, genres, synopsis and image.

**Acceptance Scenarios**:

1. **Given** the popular list, **When** the user taps a grid card, **Then** the detail screen for that movie opens.
2. **Given** the popular list, **When** the user taps the featured card, **Then** the detail screen for that movie opens.
3. **Given** search results, **When** the user taps a result, **Then** the detail screen for that movie opens.
4. **Given** the detail screen is open, **When** the data loads, **Then** it shows the backdrop image, the title, the release date in Spanish (for example "1 de marzo de 2024"), the genre names and the synopsis under "Sinopsis".
5. **Given** the user taps a movie, **When** the detail opens, **Then** the backdrop image was already prefetched so it appears without a visible delay on a typical connection.

---

### User Story 2 - Go back to the list (Priority: P2)

The user goes back to the list from the detail with the back action on the screen or the system back gesture, and the list keeps its scroll position and its loaded movies.

**Why this priority**: leaving the detail must never lose the user's place in the list.

**Independent Test**: scroll the list, open a movie, go back, and confirm the list is in the same state.

**Acceptance Scenarios**:

1. **Given** the detail is open, **When** the user taps "Volver", **Then** the previous screen is shown.
2. **Given** the detail is open, **When** the user uses the system back gesture or button, **Then** the previous screen is shown.
3. **Given** the user came back from the detail, **When** the list is shown, **Then** the loaded movies, the search term and the scroll position are unchanged.

---

### User Story 3 - Understand the state of the detail (Priority: P3)

While the detail loads, a loading state mirrors the final layout. If the movie cannot be loaded, an error message with a retry action is shown. If TMDB does not know the movie, a "not found" message with a way back is shown.

**Why this priority**: the same clarity rules as the list apply to the detail.

**Independent Test**: simulate a slow, failing and not-found detail and confirm each state is visible and actionable.

**Acceptance Scenarios**:

1. **Given** the detail is loading, **When** the screen is shown, **Then** a loading skeleton with the same layout is visible and the header, back action and bottom menu stay visible.
2. **Given** the request fails for a connection or server reason, **When** the error is shown, **Then** an error message with a "Reintentar" action is visible, and retry repeats only the detail request.
3. **Given** TMDB responds "not found" for the movie, **When** the error is shown, **Then** the message "No encontramos esta película." and a "Volver" action are visible.

---

### Edge Cases

- A movie without a backdrop image shows the placeholder "Sin imagen" in the image area.
- A movie without a synopsis shows "Sin sinopsis disponible." under "Sinopsis".
- A movie without a release date shows "Fecha no disponible" instead of the date.
- A movie with no genres does not show the genre row.
- A long title wraps onto as many lines as needed; the detail does not truncate it.
- A movie whose genre names are missing from the response shows only the names that exist.
- If the connection is lost while the detail is open, the content already shown stays visible.
- The synopsis and the rest of the content scroll when they do not fit on the screen; the header and the bottom menu stay fixed.
- The detail respects the safe areas and system font scaling; the back action has a 44x44 pt touch target.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tapping a grid card, the featured card or a search result MUST open the detail screen for that movie. This replaces the "tapping does nothing" rule of the popular list (`specs/001-popular-movies/spec.md`, FR-023).
- **FR-002**: The detail screen MUST request `GET /movie/{movieId}` with the constant `language` (`es-PY`) and show the movie's title, release date, genre names and synopsis (`overview`).
- **FR-003**: The detail MUST show the movie's backdrop image at TMDB size `w1280`, full width, with a bottom gradient that keeps the title readable.
- **FR-004**: The release date MUST be shown in Spanish long form ("1 de marzo de 2024"); a missing or empty date shows "Fecha no disponible".
- **FR-005**: The genre names MUST be shown as chips in the order TMDB returns them; no genre row is shown when there are no genres.
- **FR-006**: The synopsis MUST appear under the heading "Sinopsis"; an empty synopsis shows "Sin sinopsis disponible.".
- **FR-007**: The header (app name and subtitle "Populares") and the bottom menu MUST stay visible on the detail screen. The bottom menu items remain visual only, as in the list.
- **FR-008**: The detail MUST have a back action "Volver" (touch target at least 44x44 pt) that calls navigation back.
- **FR-009**: The system back gesture and button MUST return to the previous screen with its state preserved.
- **FR-010**: While the detail loads, a skeleton MUST mirror the final layout: image block, title bar, date bar, chip bars and synopsis lines.
- **FR-011**: A failed detail request (network or server) MUST show an error state with "Reintentar" that repeats only the detail request.
- **FR-012**: A `404` response MUST show "No encontramos esta película." with a "Volver" action; it MUST NOT show the retry action.
- **FR-013**: When the user taps a movie, its backdrop image MUST be prefetched before navigation; a prefetch failure is ignored.
- **FR-014**: All visible texts MUST come from the detail string constants in Spanish (es-PY).

### Key Entities

- **Movie detail**: movie id, title, synopsis (`overview`), release date (`release_date`), backdrop path (`backdrop_path`) and genres (`genres`: id and name). Its shape is defined in `contracts/tmdb-movie-detail.md`.

## Success Criteria *(mandatory)*

- **SC-001**: The detail content is visible within 1 second of the tap when the detail was already cached, and within 2 seconds on a typical connection otherwise.
- **SC-002**: From the list, a user reaches the detail and returns to the list in two taps or fewer.
- **SC-003**: In every failure case (error, not found, connection lost) the user sees an explanatory message and an action that leads on (retry or back).
- **SC-004**: Returning from the detail keeps the list's loaded movies and scroll position.
- **SC-005**: The detail works the same way on Android and iOS.

## Assumptions

- The detail image uses the backdrop at `w1280` instead of the poster at `w780` required by the constitution's previous wording. The design shows a wide hero image; the poster would be cropped. The constitution is amended to match (Principle VII, Images).
- Runtime, rating, cast, trailers, reviews, share, favorites and bookmark actions are not shown: they are out of scope (constitution) and the design does not show them on the detail.
- The genre names come from the detail response, so the genre catalog is not needed on the detail screen.
- The bottom menu on the detail screen has the same items as the list, all visual only.
- The header subtitle on the detail is "Populares", as in the design.
- The detail screen has no poster fallback: a missing backdrop shows the placeholder.
