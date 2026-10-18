# MovieExplorer

Mobile app (React Native CLI + TypeScript) that consumes the [TMDB API](https://developer.themoviedb.org/docs/getting-started) to browse popular movies, search by title and see movie details. Runs on Android and iOS.

Architecture decisions are documented in [`docs/adr/`](./docs/adr). Project rules live in [`.specify/memory/constitution.md`](./.specify/memory/constitution.md).

## Prerequisites

Common:

- Node.js (LTS) and [pnpm](https://pnpm.io/installation)
- Git
- JDK compatible with the React Native version in use (JDK 17 recommended)

Android:

- Android Studio with the Android SDK, platform tools and an emulator (or a physical device with USB debugging)
- `ANDROID_HOME` environment variable set and `platform-tools` in your `PATH`

iOS (macOS only):

- Xcode (latest stable) with the command line tools
- CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- Ruby compatible with CocoaPods

Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) (React Native CLI tab) if any of the above is missing.

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

pnpm requires `node-linker=hoisted` for React Native. It is already set in `.npmrc`; do not remove it.

iOS only — install the native pods:

```bash
cd ios && pod install && cd ..
```

Re-run `pod install` every time a dependency with native code is added or updated.

## 4. Run the app

Start Metro in one terminal:

```bash
pnpm start
```

Then, in another terminal:

```bash
pnpm android   # Android emulator or connected device
pnpm ios       # iOS simulator (macOS only)
```

The app must build and run without errors on both platforms.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start the Metro bundler |
| `pnpm android` | Build and run on Android |
| `pnpm ios` | Build and run on iOS |
| `pnpm test` | Run tests with coverage |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint:check` | ESLint (no auto-fix, fails on warnings) |
| `pnpm types` | TypeScript check (`tsc --noEmit`) |
| `pnpm pr:check` | `lint:check` + `types` + `test` (must pass before opening a PR) |
## Troubleshooting

- **Metro cache issues:** `pnpm start --reset-cache`
- **Android build fails after dependency changes:** `cd android && ./gradlew clean && cd ..`
- **iOS build fails after dependency changes:** `cd ios && pod install --repo-update && cd ..`
- **"Missing environment variable" at startup:** check that `.env` exists, contains `TMDB_BASE_URL` and `TMDB_ACCESS_TOKEN`, and that you rebuilt the app.
- **TMDB returns 401:** the token is wrong or you used the short API key instead of the Read Access Token.
