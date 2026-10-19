# MovieExplorer

Mobile app (React Native CLI + TypeScript) that consumes the [TMDB API](https://developer.themoviedb.org/docs/getting-started) to browse popular movies, search by title and see movie details. Runs on Android and iOS.

Architecture decisions are documented in [`docs/adr/`](./docs/adr). Project rules live in [`.specify/memory/constitution.md`](./.specify/memory/constitution.md).

> Current state: the popular movies screen (header, category tabs, featured card, infinite grid, skeleton and error/empty states) is the first feature. Search and movie detail are planned as the next specs.

## Tech stack

Versions are the ones pinned in `package.json`.

### Core

| Area | Technology | Notes |
| --- | --- | --- |
| Framework | React Native 0.88 (CLI, bare workflow), React 19 | New Architecture and Hermes enabled |
| Language | TypeScript 6 (strict) | Path alias `@/src/*` |
| Package manager | pnpm | `nodeLinker: hoisted` in `pnpm-workspace.yaml` (required by React Native) |
| Runtime | Node.js `^22.13.0`, `^24.3.0`, or `>=26.0.0` | See [Prerequisites](#prerequisites) |
| Platforms | Android and iOS | Same behavior on both |

### App libraries

| Need | Package | How it is used |
| --- | --- | --- |
| Navigation | `@react-navigation/native` + `@react-navigation/native-stack` 7, `react-native-screens`, `react-native-safe-area-context` | Single native stack; route names in `src/navigation/routes.ts` |
| Server state | `@tanstack/react-query` 5 | Keys → service → hook pattern; `useInfiniteQuery` for the popular movies pagination |
| Global client state | `zustand` 5 | Two small stores: network/server error overlays and toast notifications (no persistence). Chosen over Redux to avoid boilerplate in a small app (ADR-0004) |
| HTTP | `axios` | Single `tmdbClient` (base URL and Bearer token from env, `language=es-PY` on every request, errors normalized to `AppError`) |
| Validation | `zod` 4 | Validates environment variables at startup (and forms when search arrives) |
| Lists | `@shopify/flash-list` 2 | 2-column grid with cell recycling (ADR-0011) |
| Skeleton | `react-native-reanimated` 4 (with `react-native-worklets`) + `react-native-linear-gradient` | Project-owned shimmer `Skeleton` atom (ADR-0013, supersedes the Moti choice of ADR-0012) |
| Connectivity | `@react-native-community/netinfo` | Detects offline state; reconnection refetches queries |
| Environment | `react-native-config` | Reads `.env` (`TMDB_BASE_URL`, `TMDB_ACCESS_TOKEN`) |
| UI | Custom components with `StyleSheet.create` | Atomic Design + dark theme tokens in `src/theme`; no UI library (ADR-0007) |
| Texts | Spanish (es-PY) constants in `strings.ts` files | No internationalization library |
| Dev debugging | `reactotron-react-native` | Dev only; guarded by `__DEV__` |

### Data and caching

- **API:** TMDB v3 (`GET /movie/popular`, `GET /genre/movie/list`), language `es-PY`.
- **Genres first:** the genre catalog is fetched once before the movie list (it gates the list query) and resolved by id to names.
- **Query cache:** lists `staleTime` 5 min, `gcTime` 30 min; genres `staleTime` and `gcTime` 24 h; automatic retries disabled (each manual "Reintentar" press makes exactly one request).
- **Request cancellation:** services receive the TanStack Query `AbortSignal` and pass it to Axios.
- **Pagination:** infinite scroll (threshold 0.5, no duplicate concurrent loads), capped at `min(total_pages, 500)` (TMDB limit), de-duplicated by movie id.
- **Global error handling:** the `QueryClient` routes network and server errors to the Zustand overlay stores; screens opt out per query with `meta: { skipNetworkError, skipServerError, skipNotify }` when they show their own inline error state.
- **Images:** TMDB sizes by use (`w342` grid posters, `w780` featured backdrop), explicit dimensions, placeholder and fallback, Android `resizeMethod="resize"`.

### Quality tooling

| Tool | Setup |
| --- | --- |
| ESLint | `@react-native` config + `eslint-plugin-perfectionist` (sorted objects, interfaces, JSX props), `react-native/no-inline-styles`, `react/prefer-read-only-props`, `no-console` warning, consistent type imports, `reactotron/no-tron-in-production`. `pnpm lint:check` fails on any warning |
| Prettier | Single quotes, trailing commas, arrow parens avoided |
| TypeScript | Strict, checked with `pnpm types` (`tsc --noEmit`) |
| Jest | `@react-native/jest-preset` + `@testing-library/react-native`, v8 coverage, tests colocated with the code, `react-native-config` mocked |
| Husky | `pre-commit`: `lint-staged` (ESLint `--fix` on staged JS/TS, Prettier on staged JSON/MD). `pre-push`: `commitlint` over the commits being pushed, then `pnpm pr:check` |
| commitlint | `@commitlint/config-conventional` (header max 150 chars, body lines max 100) |
| Babel | `module-resolver` (`@/src` alias), `transform-remove-console` in production builds, Zod export-namespace transform first, worklets plugin last (Reanimated 4) |

### Project structure

```
src/
├── features/      # Feature slices (movies, genres), each with its own api, hooks, components, screens
├── components/    # Shared UI (Atomic Design: atoms, molecules, organisms, templates)
├── stores/        # Global Zustand stores
├── vendors/       # Third-party wrappers (axios, react-query, react-navigation, netinfo, linear-gradient, reactotron)
├── navigation/    # Root stack, route constants, navigation types
├── hooks/         # Shared hooks
├── theme/         # Design tokens (colors, spacing, typography)
├── constants/     # env, TMDB, query cache, list tuning, texts
├── utils/         # Pure utilities
└── assets/        # Static assets
docs/adr/          # Architecture Decision Records
specs/             # Spec Kit feature specs, plans and tasks
```

### Spec-driven workflow

Features are specified with [Spec Kit](https://github.com/github/spec-kit): `.specify/memory/constitution.md` holds the global rules and each feature lives in `specs/NNN-name/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`).

## Prerequisites

Exact versions below are what `react-native@0.88` and this project's native projects actually
require (checked against `node_modules/react-native/package.json`'s `engines` field,
`android/build.gradle`, `android/gradle/wrapper/gradle-wrapper.properties` and
`node_modules/react-native/scripts/cocoapods/helpers.rb`) — not rounded guesses. Run `node -v`,
`java -version`, `pod --version` etc. to compare against your machine before continuing.

Common (both platforms):

| Tool | Required version | Check with |
| --- | --- | --- |
| Node.js | `^22.13.0`, `^24.3.0`, or `>=26.0.0` (see note below) | `node -v` |
| pnpm | Latest ([install guide](https://pnpm.io/installation)) | `pnpm -v` |
| Git | Any recent version | `git --version` |

> **Node version note:** if `node -v` doesn't satisfy the range above, install a matching version
> with [nvm](https://github.com/nvm-sh/nvm) or [Volta](https://volta.sh/) rather than changing your
> system-wide Node — `nvm install 22.13.0 && nvm use 22.13.0` (or any version in the same major line)
> is enough just for this project.

Android:

| Tool | Required version | Check with |
| --- | --- | --- |
| JDK | 17 (required to run Gradle 9.4.1) | `java -version` |
| Android Studio | Latest stable (bundles the Android SDK and an emulator) | — |
| Android SDK Platform | API 37 (`compileSdk`); API 36 (`targetSdk`); API 24 minimum (`minSdk`) — installed automatically by Android Studio's SDK Manager the first time you open the project | — |
| Android NDK | Any version. Gradle downloads the default one on the first build if none is installed (or install "NDK (Side by side)" from SDK Manager) | `ls $ANDROID_HOME/ndk` |
| Gradle | 9.4.1 (downloaded automatically by the Gradle wrapper; do not install separately) | — |

Set the `ANDROID_HOME` environment variable to your Android SDK folder and add `platform-tools` and
`emulator` to your `PATH`. Android Studio's default SDK locations are:

- **macOS:** `$HOME/Library/Android/sdk`. Add to `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
  ```
- **Linux:** `$HOME/Android/Sdk`. Add the same lines to `~/.bashrc` or `~/.zshrc` with that path.
- **Windows:** `%LOCALAPPDATA%\Android\Sdk`. Set `ANDROID_HOME` in the system environment variables and
  add `platform-tools` and `emulator` to `Path`.

Open a new terminal after changing these. `android/local.properties` is machine-specific and
git-ignored: Android Studio creates it when you open the project, and Gradle reads `ANDROID_HOME`
when it does not exist.

iOS (macOS only):

| Tool | Required version | Check with |
| --- | --- | --- |
| Xcode | `16.1` or newer | `xcodebuild -version` |
| iOS deployment target | `15.1` minimum (set automatically by the Podfile; simulators/devices below this are not supported) | — |
| CocoaPods | `1.13` or newer (not `1.15.0`/`1.15.1`, excluded by the `Gemfile`) | `pod --version` |
| Ruby | `2.6.10` or newer (see `Gemfile`) | `ruby -v` |

Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) (React Native CLI tab) for first-time Android Studio / Xcode installation steps.

## 1. Get a TMDB token

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** and request an API key (free).
3. Copy the **API Read Access Token** (the long token, not the short API key).

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your token (the base URL is already filled in `.env.example`):

```
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_ACCESS_TOKEN=your_api_read_access_token
```

`.env` is git-ignored and must never be committed. The app validates the variables at startup and fails with a clear error if one is missing.

> After changing `.env`, rebuild the app (not just reload): the values are embedded at build time.

## 3. Install dependencies

```bash
pnpm install
```

pnpm requires hoisted dependencies for React Native's Gradle setup (it hardcodes a flat
`node_modules` layout, e.g. `android/settings.gradle`'s `includeBuild("../node_modules/@react-native/gradle-plugin")`).
This is set as `nodeLinker: hoisted` in `pnpm-workspace.yaml` — **that file, not `.npmrc`**, is
what pnpm actually reads for this setting once `pnpm-workspace.yaml` exists (confirmed: pnpm
12.x silently ignores `.npmrc`'s `node-linker` in that case). Do not remove the `nodeLinker` line
from `pnpm-workspace.yaml`. If you ever see a Gradle error like `Included build
'.../node_modules/@react-native/gradle-plugin' does not exist`, this setting was lost or
overridden — run `rm -rf node_modules && pnpm install` after confirming it's still there.

iOS only — install the native pods:

```bash
cd ios && pod install && cd ..
```

Re-run `pod install` every time a dependency with native code is added or updated.

## 4. Run the app

Start Metro in one terminal (keep it running):

```bash
pnpm start
```

Then, in a second terminal, build and launch on the platform you want:

### Android

1. Open an Android emulator from Android Studio's Device Manager, **or** connect a physical
   device with USB debugging enabled (`adb devices` should list it).
2. Run:
   ```bash
   pnpm android
   ```
   First run compiles the native project, so expect it to take a few minutes; it installs and
   launches the app automatically once the build finishes.

### iOS (macOS only)

1. No manual simulator step is needed — `pnpm ios` boots the default simulator for you. To target
   a specific device instead, run `npx react-native run-ios --list-devices` to see the available
   names, then `pnpm ios -- --simulator="iPhone 16"` (or `--device` for a physical, cabled device).
2. Run:
   ```bash
   pnpm ios
   ```
   First run also builds the native project via Xcode/CocoaPods, so expect it to take a few
   minutes.

The app must build and run without errors on both platforms. If a native build fails, see
[Troubleshooting](#troubleshooting) below before re-running.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start the Metro bundler |
| `pnpm android` | Build and run on Android |
| `pnpm ios` | Build and run on iOS |
| `pnpm test` | Run tests with coverage |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:ci` | Tests with coverage for CI (`--detectOpenHandles --forceExit`) |
| `pnpm coverage` | Coverage report |
| `pnpm lint` | ESLint |
| `pnpm lint:check` | ESLint (no auto-fix, fails on warnings) |
| `pnpm types` | TypeScript check (`tsc --noEmit`) |
| `pnpm pr:check` | `lint:check` + `types` + `test` (must pass before opening a PR) |

## Troubleshooting

- **Metro cache issues:** `pnpm start --reset-cache`
- **Android build fails after dependency changes:** `cd android && ./gradlew clean && cd ..`
- **"SDK location not found":** `ANDROID_HOME` is not set in the terminal running `pnpm android`. Set it as shown in Prerequisites, open a new terminal, and run `echo $ANDROID_HOME` to confirm it prints the SDK path.
- **iOS build fails after dependency changes:** `cd ios && pod install --repo-update && cd ..`
- **"Missing environment variable" at startup:** check that `.env` exists, contains `TMDB_BASE_URL` and `TMDB_ACCESS_TOKEN`, and that you rebuilt the app.
- **TMDB returns 401:** the token is wrong or you used the short API key instead of the Read Access Token.
