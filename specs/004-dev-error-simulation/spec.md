# Feature Specification: Development error simulation

**Feature Branch**: `004-dev-error-simulation`
**Created**: 2026-10-19
**Status**: Draft
**Input**: A way to see how the list, search and detail behave when requests fail, without changing the TMDB token and without rebuilding the app.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simulate a failure from the developer menu (Priority: P1)

A developer opens the React Native development menu and picks a failure mode. The next TMDB requests fail in that way, and the list, search and detail show their error states exactly as they would for a real failure.

**Independent Test**: pick "sin conexión" in the menu, open the list, and confirm the inline error state with "Reintentar" appears.

**Acceptance Scenarios**:

1. **Given** the app runs in development, **When** the developer picks "Simular: sin conexión", **Then** the next TMDB requests fail as network errors (no HTTP status).
2. **Given** a mode is active, **When** the developer picks "Simular: servidor 500", **Then** requests fail with HTTP 500.
3. **Given** a mode is active, **When** the developer picks "Simular: 401", **Then** requests fail with HTTP 401.
4. **Given** the developer picks "Simular: fallar 3 y recuperar", **When** requests are made, **Then** the next three fail as network errors and the requests after that succeed.
5. **Given** any mode is active, **When** the developer picks "Simular: normal", **Then** requests succeed again.

---

### User Story 2 - Production is never affected (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a production build (`__DEV__` is false), **When** the app starts, **Then** no menu item is registered and no request is altered.
2. **Given** the developer changes the mode, **When** the app is reloaded, **Then** the mode returns to "normal".

## Requirements *(mandatory)*

- **FR-001**: The simulation MUST only be active when `__DEV__` is true.
- **FR-002**: The modes MUST be: normal, network, server 500, 401, and "fail three and recover".
- **FR-003**: A simulated failure MUST go through the same error normalization as a real failure, so screens receive the same `AppError` shape.
- **FR-004**: Changing the mode MUST take effect on the next request, without reinstalling the app or changing `.env`.
- **FR-005**: The mode MUST reset to normal on reload.
- **FR-006**: The simulation covers TMDB requests made through `tmdbClient` only.

## Assumptions

- Simulated failures happen in the client, not in the network: timeouts and connections that drop mid-response are not simulated.
- Menu labels are in Spanish, as all user-visible developer texts in the project.
