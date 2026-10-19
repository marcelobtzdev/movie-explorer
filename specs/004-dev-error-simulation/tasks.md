# Tasks: Development error simulation

- [X] T401 `src/vendors/dev-error-simulator/simulator.ts` + test: modes, fail-three counter, reset on mode change
- [X] T402 `src/vendors/dev-error-simulator/interceptor.ts` + test: request interceptor replaces the adapter with one that rejects with a real-shaped `AxiosError`; normalized by `handleError`
- [X] T403 `src/vendors/dev-error-simulator/menu.ts` + test: registers one `DevSettings` menu item per mode
- [X] T404 `src/vendors/axios/tmdb-client.ts`: attach the interceptor only when `__DEV__`
- [X] T405 `index.js`: register the menu only when `__DEV__`
- [X] T406 Constitution: vendor row for the dev-only simulator; version bump
- [X] T407 README: how to activate the simulation and what each mode shows
- [X] T408 `pnpm pr:check` green
