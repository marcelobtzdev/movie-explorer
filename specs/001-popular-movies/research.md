# Research: Popular Movies List

**Feature**: 001-popular-movies | **Date**: 2026-10-18

All versions below were checked live against the npm registry on 2026-10-18 (not recalled from training data, since package releases move faster than the model's knowledge cutoff). Each entry is Decision / Rationale / Alternatives considered.

## 1. React Native version

**Decision**: `react-native` `0.88.0` (latest stable, released 2026-10-15), New Architecture enabled (RN default since 0.76+), Hermes enabled (RN default).

**Rationale**: Matches the Technical Context instruction ("latest stable release at scaffolding time"). New Architecture is required anyway by FlashList v2 (see §3).

**Alternatives considered**: An older 0.8x line would avoid the Node engine bump below, but the task explicitly asks for latest stable and to flag incompatibilities rather than silently downgrading.

**⚠️ Blocking environment gap found**: `react-native@0.88.0` declares `engines.node: "^22.13.0 || ^24.3.0 || >= 26.0.0"`. The scaffolding machine currently reports `node v20.15.1` (confirmed via `node --version`), which is **outside** that range; `npx react-native init` emits `EBADENGINE` warnings and the generated project's own tooling (Metro, Gradle plugin, codegen — all pinned to `0.88.0`/`0.87.1`) is not guaranteed to run correctly on Node 20. This is not a stack choice this plan can silently work around — it is an environment prerequisite. **Action required in the Setup phase of tasks.md**: upgrade the scaffolding/dev machine's Node to `22.13+`, `24.3+`, or `26+` (the project has no `.nvmrc`/Volta pin yet; the first Setup task creates one, e.g. pinning Node `22.13.0` as the lowest satisfying LTS-track version) **before** running `react-native init`. If the user cannot upgrade Node on this machine, the alternative is to pin `react-native` to the newest `0.8x` release whose `engines.node` is satisfied by Node 20.15 — that would be a scope change to the Technical Context ("latest stable" → "latest Node-20-compatible") and must be confirmed with the user, not assumed silently; this plan proceeds with `0.88.0` per the explicit instruction and flags the Node upgrade as a Setup task.

## 2. Reanimated / Worklets / Moti / Gradient compatibility (ADR-0012, superseded by ADR-0013)

**Decision**: `react-native-reanimated` `3.19.5` (latest stable 3.x, released 2025-12-22) — **not** the newer `4.7.1` line. No `react-native-worklets` package (it is a Reanimated-4-only peer). `react-native-linear-gradient` `2.8.3`. **`moti` is not used — see the superseding finding below.**

**Superseding finding (confirmed during implementation, T019's smoke test)**: `moti@0.30.0`'s published `exports` map (`.`, `./interactions`, `./skeleton`, `./svg`, `./author` only) has no bare-RN entry point. `moti/skeleton` unconditionally imports `expo-linear-gradient` via an internal `expo.js` file; the bare-RN implementation (`native.js`, which does use `react-native-linear-gradient`) exists in the package's `build/` output but is **not reachable** through any public import path — `moti/skeleton/react-native-linear-gradient` and a deep import straight to `moti/build/skeleton/native` both fail to resolve under Jest (and would fail identically under Metro, which enforces `exports` the same way). Verified empirically with three failing import attempts. **ADR-0012 is superseded by ADR-0013**: the `Skeleton` atom is now ~100 lines of project-owned code built directly on `react-native-reanimated` + `react-native-linear-gradient`, with the same public `Skeleton`/`Skeleton.Group` shape. `moti` was removed from `package.json`.

**Rationale**: `moti`'s last publish is `0.30.0` (2025-01-29, peer dependency `"react-native-reanimated": "*"` — permissive but not evidence of testing). `moti`'s own npm description still frames itself as "powered by Reanimated 3"; no Moti release exists since Reanimated 4 went GA, and Reanimated 4 is a ground-up native rewrite (separate `react-native-worklets` peer package, new JSI worklets runtime) rather than an additive change, so there is a real, undocumented risk that Moti's `Skeleton`/gradient internals (built against Reanimated 3's shared-value and style internals) break under Reanimated 4's engine. `react-native-reanimated@3.19.5` is still actively maintained in parallel with the 4.x line (released 2025-12-22, well after Reanimated 4's GA), works with both the old and the New Architecture, and is the version Moti is actually verified against. ADR-0012 already anticipated this exact branch ("`react-native-worklets` when required" — it is *not* required here), so this is a version-pinning decision inside the already-accepted stack, not a stack change requiring a new ADR.

**Alternatives considered**: (a) `react-native-reanimated@4.7.1` + `react-native-worklets@0.13.0` (paired per Reanimated 4's own peerDependencies, which require `react-native: "0.86 - 0.88"` — satisfied by RN 0.88) — rejected for this plan because Moti's compatibility with it is unverified and Moti is unmaintained relative to it; (b) drop Moti and build a custom shimmer with Reanimated 4 directly — rejected as an unrequested stack change (ADR-0012 fixes Moti); this is left as a documented fallback if the Setup-phase smoke test below fails. (c) FlashList v2 strictly requires the New Architecture at runtime regardless of the Reanimated line chosen, and Reanimated 3.19.5 fully supports the New Architecture, so this pin does not conflict with §3.

**Follow-up verification task** (added to tasks.md Setup phase): after scaffolding, render one `Skeleton.Group` with a `Skeleton` block on both platforms and confirm the shimmer animates; if it does not, fall back to alternative (a) or (b) above and update this file.

## 3. FlashList v2 vs New Architecture

**Decision**: `@shopify/flash-list` `2.3.3` (latest stable).

**Rationale**: FlashList v2 is a ground-up rewrite that is New-Architecture-only (throws at runtime on the old architecture per Shopify's own docs); RN 0.88 ships the New Architecture by default, so no conflict. v2 also removes the `estimatedItemSize` requirement (automatic sizing), simplifying `src/constants/list.ts` tuning to `numColumns` and `drawDistance` only, as ADR-0011 already anticipated.

**Alternatives considered**: FlashList v1 — rejected, not needed since the New Architecture is available.

## 4. Package versions pinned for the Technology Stack table

All checked against npm registry `latest` dist-tag on 2026-10-18 unless noted:

| Package | Version | Notes |
|---|---|---|
| `react-native` | 0.88.0 | §1 |
| `react` / `react-test-renderer` / `@types/react` | 19.3.1 / 19.3.1 / ^19.1.1 | Exact peer of `react-native@0.88.0` |
| `typescript` | **6.0.3** (not latest `7.0.2`) | See rationale below |
| `@tanstack/react-query` | 5.104.4 | v5, `useInfiniteQuery` |
| `zustand` | 5.0.15 | |
| `axios` | 1.20.0 | |
| `zod` | 4.6.7 | `@hookform/resolvers@5.9.2` explicitly supports `zod ^3.25.0 \|\| ^4.0.0`, so no conflict even though the search spec (002) isn't built yet |
| `react-hook-form` | 7.90.0 | Installed with the search spec (002), per constitution — not installed by this plan |
| `@hookform/resolvers` | 5.9.2 | Same as above |
| `@react-navigation/native` | 7.5.1 | |
| `@react-navigation/native-stack` | 7.21.0 | |
| `react-native-screens` | 4.30.0 | |
| `react-native-safe-area-context` | 5.10.1 | |
| `@shopify/flash-list` | 2.3.3 | §3 |
| `react-native-reanimated` | 3.19.5 | §2 — used directly by the custom `Skeleton` atom (ADR-0013), not via `moti` |
| `react-native-linear-gradient` | 2.8.3 | §2 |
| `@react-native-community/netinfo` | 12.0.1 | |
| `reactotron-react-native` | 5.3.1 | dev only |
| `react-native-config` | 1.7.2 | |
| `eslint` | 10.13.0 | |
| `@react-native/eslint-config` | 0.88.0 | matched to RN version |
| `eslint-plugin-perfectionist` | 5.12.1 | |
| `prettier` | 3.9.10 | |
| `husky` | 9.1.7 | |
| `lint-staged` | 17.6.0 | |
| `@commitlint/cli` / `@commitlint/config-conventional` | 21.2.4 / 21.2.4 | |
| `babel-plugin-transform-remove-console` | 6.9.4 | |
| `babel-plugin-module-resolver` | 5.0.3 | path alias |
| `jest` | 30.5.2 | |
| `@testing-library/react-native` | 14.1.0 | |

**TypeScript decision detail**: the registry's `latest` tag for `typescript` is `7.0.2` — this is the new Go-native-ported compiler line (a from-scratch rewrite, not an incremental release over 6.x). No evidence was found that Metro/the RN tooling chain, `@react-native/typescript-config`, or the broader ecosystem (ESLint TS tooling, ts-jest-less Babel-based type stripping) has settled on it yet; it is also only weeks old at the time of scaffolding. For a project whose Definition of Done depends on `tsc --noEmit` passing reliably in CI, this plan pins `typescript@6.0.3` (latest stable release on the proven, classic-compiler 6.x line, released 2026-04-16) instead. This is a research/stability decision within "TypeScript strict mode" as fixed by the constitution, not a change to any constitutional rule, and can be revisited in a later plan once TS 7 has wider ecosystem validation.

**Seventh finding (writing `App.test.tsx`, T074)**: Jest's own module resolution (unlike Metro's, used in the real app) does not prefer a package's `.native.js`/`.native.tsx` file over its plain `.js`/`.tsx` counterpart by default. `@react-navigation/native`'s `useDocumentTitle` has a real (web, touches `document`) implementation and a `.native.tsx` no-op; Metro picks the no-op correctly in the actual app, but Jest picked the web one, crashing with `ReferenceError: document is not defined` purely as a test-environment artifact — the real app was never broken. **Fix**: `jest.config.js`'s `moduleFileExtensions` now lists the `native.*` extensions before the plain ones, so Jest's resolver mimics Metro's platform-extension preference for every package, not just `react-native` itself.

**Eighth finding (reported by the user after the implementation session: `pnpm android` failed with `Included build '.../node_modules/@react-native/gradle-plugin' does not exist`)**: pnpm 12.3.4 was silently installing with `nodeLinker: "isolated"` even though `.npmrc` declared `node-linker=hoisted` — confirmed by reading `node_modules/.modules.yaml` after a full clean reinstall (`rm -rf node_modules && pnpm install`), which still showed `"nodeLinker": "isolated"` and a `publicHoistPattern` of `[]`. In isolated mode, only packages **directly** listed in `movie-explorer`'s own `package.json` get a top-level `node_modules/<pkg>` symlink; packages that are only *transitive* dependencies of `react-native` itself (`@react-native/gradle-plugin`, `@react-native/codegen`, `@react-native/community-cli-plugin`, `@react-native/virtualized-lists`, `@react-native/asset-utils`, `@react-native/normalize-colors`, etc. — all confirmed present in `node_modules/react-native/package.json`'s own `dependencies` and physically present in the pnpm store) are not. React Native's Gradle setup hardcodes a flat-layout assumption (`android/settings.gradle`: `includeBuild("../node_modules/@react-native/gradle-plugin")`), so the Android build fails outright without them at the top level — this is exactly the long-documented pnpm+React Native incompatibility `node-linker=hoisted` is supposed to prevent. **Root cause**: this project also has a `pnpm-workspace.yaml` (auto-created earlier by pnpm itself, to hold `minimumReleaseAgeExclude` entries from a `pnpm add`). With that file present, pnpm 12.x appears to source project-level settings like the node linker from `pnpm-workspace.yaml`'s own `nodeLinker` key, not from `.npmrc`'s `node-linker` — `.npmrc`'s setting was simply never applied once `pnpm-workspace.yaml` existed. **Fix**: added `nodeLinker: hoisted` directly to `pnpm-workspace.yaml` (kept `.npmrc`'s `node-linker=hoisted` too, for tooling that still reads `.npmrc`, but `pnpm-workspace.yaml` is now the one that actually takes effect — confirmed via `node_modules/.modules.yaml` showing `"nodeLinker": "hoisted"` and every `@react-native/*` transitive package present at the top level after a clean reinstall). `pod install` and the full `pnpm pr:check` were re-run clean afterward.

No package outside the constitution's Technology Stack table was added.

**Correction found during scaffolding (T006)**: `jest@30.5.2` (the version this file originally pinned from npm's bare `latest` tag) is **not** used. The scaffolded project's `@react-native/jest-preset@0.88.0` depends on `babel-jest`, `jest-environment-node` and `@jest/create-cache-key-function` all pinned to `^29.7.0` — Jest 29-family internals, not compatible with a Jest 30 runtime. `@testing-library/react-native@14.1.0`'s own peer dependency (`"jest": ">=29.0.0"`) is satisfied either way, so there is no reason to force 30.x. **Final pin: `jest@29.7.0`** (latest stable 29.x), matching what the RN 0.88 template itself installs by default.

**Second correction found during scaffolding (T010)**: `eslint@10.13.0` (this file's original pin, again from npm's bare `latest` tag) is also **not** used. `@react-native/eslint-config@0.88.0` declares `peerDependencies.eslint: "^8.0.0 || ^9.0.0"` — ESLint 10 is outside that range. **Final pin: `eslint@8.57.1`** (what the RN 0.88 template itself resolves to), kept on the legacy `.eslintrc.js` config format the template already uses rather than migrating to ESLint 9's flat config, which was not requested and would be an unrelated scope change.

**Third finding during scaffolding (T013, Jest config)**: `@react-native/jest-preset@0.88.0`'s default `transformIgnorePatterns` (`node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)`) assumes a flat `node_modules` layout. Under pnpm's `.pnpm` nested content-addressable store (used even with `node-linker=hoisted`, which only flattens the top-level symlinks, not the physical `.pnpm/<encoded-name>/node_modules/...` paths Jest actually resolves and tests against), this pattern matches and **ignores** `@react-native/jest-preset`'s own setup file and every other RN-ecosystem package, causing `SyntaxError: Cannot use import statement outside a module`. Verified empirically (regex traced against real resolved paths) and fixed in `jest.config.js` with a pnpm-aware pattern that optionally skips one `.pnpm/<pkg>/node_modules/` hop before checking the package allowlist, extended to cover every RN-ecosystem package this project installs (`@shopify/flash-list`, `moti`, `react-native-reanimated`, `react-native-linear-gradient`, `react-native-config`, `react-native-screens`, `react-native-safe-area-context`, `@react-navigation`) in addition to `react-native`/`@react-native(-community)?`.

**Fourth finding (T013, Jest setup)**: `react-native-reanimated@3.19.5` has no `react-native-reanimated/jestSetup` module (that path belongs to a different/older convention). The correct call for this version is `require('react-native-reanimated').setUpTests()` in the Jest setup file, confirmed by inspecting the installed package (it ships `jestUtils.ts`/`lib/module/jestUtils.js` exporting `setUpTests`, not a `jestSetup.js`).

**Fifth finding (discovered while writing the first component tests)**: `@testing-library/react-native@14.1.0`'s `render` (and `renderHook`'s `rerender`/`unmount`) is **async** — `render()` returns `Promise<RenderResult>`, not `RenderResult` directly (confirmed from the package's own `.d.ts`: `export declare function render<T>(...): Promise<{...}>`). Calling it synchronously returns a pending `Promise`, and the library's `screen` singleton never gets wired up, producing a confusing `` `render` function has not been called `` error from every `screen.getByX` call — looks like a setup bug but is actually a missed `await`. **Every test from here on must `await render(...)`** (the project's `src/utils/test-utils.tsx` wrapper is a plain async-compatible passthrough, not changed in shape, just always awaited at the call site) and test functions using it must be `async`. The same applies to `fireEvent`/`fireEvent.press`/`.changeText`/`.scroll`/`.layout` and to `renderHook` itself (confirmed from their `.d.ts` files: all return `Promise`) — **always `await fireEvent...(...)`** and **`await renderHook(...)`** too, especially when the event handler triggers a state update whose re-render the assertion depends on (a missed `await` there doesn't error, it just silently asserts against the pre-update render).

**Sixth-and-a-half finding (writing `NetworkErrorOverlay`/`ServerErrorOverlay`/`Toast`, T052–T054)**: two more `@testing-library/react-native@14` quirks, both verified with isolated minimal reproductions:
1. React Native's `Modal` component does not reliably re-render its children when its `visible` prop toggles from `false` to `true` *after* the test has already rendered once with `visible={false}` in the same test file — the content silently never appears in `screen` queries even though the store state is correct. **Fix**: for components gated behind `Modal`, set the store state the test needs *before* calling `render(...)`, not after — never toggle `Modal`'s visibility via a second act/render inside the same test and expect `screen` to pick it up.
2. Calling `act(() => store.hide())` (synchronous, no `async`) inside a shared `afterEach` corrupts the *next* test's `render()`/`screen` tracking in this RTL version (reproduced: removing `act()` from `afterEach` — plain `store.hide()` with only a benign "not wrapped in act" dev warning — fixes it; keeping `act()` in `afterEach` breaks the following test even though the hook itself looks correct). **Fix**: never wrap cleanup-only store resets in `afterEach` with `act()`; call the store action directly. For an update made *inside* a test that the test's own assertions depend on, `await act(async () => {})` (not the sync form) is what reliably flushes — consistent with the `use-network-status` finding above.
3. Separately (writing `use-popular-movies.test.tsx`): running a single hook-test file in isolation that exercises `useInfiniteQuery` can hang indefinitely at the Jest process level after all tests pass (TanStack Query's internal cache-GC timer not clearing) — this is exactly what the project's `test:ci` script's `--forceExit --detectOpenHandles` flags already exist to paper over; no code change needed, just confirms those flags are load-bearing, not vestigial.

Also: Jest fake timers (`jest.useFakeTimers()`) combined with `await act(async () => {})` do not reliably flush a pending state update in this setup — the combination produced a stuck pre-update render in a `setTimeout`-based auto-hide test. Rather than fight that interaction, the auto-hide behavior is tested by asserting `setTimeout`/`clearTimeout` were called with the right arguments (`jest.spyOn(global, 'setTimeout'/'clearTimeout')`) instead of actually advancing fake time through an `act()` boundary.

**Sixth finding (writing the `Skeleton` atom, T060)**: `react-native-reanimated@3.19.5`'s `Animated.View` type triggers `TS2589` ("Type instantiation is excessively deep and possibly infinite") in this project — reproduced in a minimal 10-line file, independent of any style-prop content (even `shimmerStyle as any` on the prop didn't help; the recursion happens while resolving `Animated.View`'s own component type, confirmed by it also failing on a bare `const x: React.ComponentType<...> = Animated.View` assignment). Tested on both `typescript@5.9.3` and `typescript@6.0.3` — not a TS-6-specific regression. Also checked for duplicate `react-native-reanimated`/`react`/`@types/react` installs in the pnpm store (a real, separate stale-residue issue found and fixed via `pnpm prune` after removing `moti`, which had pulled in a differently peer-hashed copy) — deduplicating did not fix this particular error, so it is not a duplicate-instance problem. This matches a known general class of bug (complex animated-component HOC generics clashing with newer React type defs — see e.g. `react-spring`/`styled-components`' `css` prop causing the identical error, closed upstream as a type-checker limitation, not a logic bug). **Fix**: `const AnimatedView = Animated.View as unknown as React.ComponentType<{ children?; style? }>` — erase the type fully with `as unknown as` (a direct cast to the target type still triggers the same recursion, since TypeScript still partially structurally compares the two sides) — then use `AnimatedView` in JSX instead of `Animated.View` directly. No dependency changes were needed; this is purely a local type-level workaround in `Skeleton.tsx`.

## 5. React Native CLI `init` flags for scaffolding without nesting

`npx @react-native-community/cli init --help` (checked live) confirms the flags needed to generate the project outside the repo and move it in without double-initializing:

- `--directory <string>` — generate into an explicit path (used to target a sibling temp directory, e.g. `../movie-explorer-scaffold`, instead of nesting a new folder under the repo root).
- `--title <string>` — display name (`"MovieExplorer"`).
- `--package-name <string>` — Android `applicationId` / iOS bundle id in one flag (`com.movieexplorer`).
- `--skip-install` — skip the CLI's own dependency install; pnpm installs afterward.
- `--install-pods [boolean]` — set `false` at generation time; this plan runs `pod install` manually after the files are merged into the repo root (running it before the merge would point CocoaPods at the wrong `ios/` path).
- `--skip-git-init` — the repo root already has its own `.git`; never let the scaffolder re-init git.
- `--pm <yarn|npm|bun>` — no `pnpm` option exists on the CLI itself; this plan uses `--skip-install` and installs with `pnpm` separately, so this flag is irrelevant (left at its default).

**Decision**: `npx @react-native-community/cli@latest init MovieExplorer --directory <sibling-temp-dir> --title MovieExplorer --package-name com.movieexplorer --skip-install --install-pods false --skip-git-init`, then move the generated tree into the repo root per the merge rules in tasks.md, then `pnpm install`, then `pod install` inside `ios/`.

## 6. TMDB `es-PY` language support on `/movie/popular` and `/genre/movie/list`

**Finding**: no authoritative TMDB documentation was found confirming or denying that `es-PY` (Spanish, Paraguay) has its own translation set distinct from `es-MX`/`es-ES`; TMDB's translations are community-contributed and the v3 API performs **no automatic server-side language fallback** (confirmed independently) — a field without a translation for the exact requested locale can return empty rather than falling back to another Spanish variant.

**Decision**: keep `TMDB_LANGUAGE = "es-PY"` exactly as already fixed by the constitution (Principle IX, Naming and Code Conventions) — this value is a constitutional decision this plan does not have authority to change, and this plan did not find positive evidence requiring a change to `es-MX`. The spec's own Assumptions section already accepts the consequence ("movie titles appear in Spanish when the service provides one, otherwise as provided"), and the mapper's existing null-handling conventions (dash for missing rating/year) extend naturally to a title/genre name that TMDB returns untranslated. No action needed; this is not a gap this plan introduces.

**Alternatives considered**: switching the request language to `es-MX` for broader community-translation coverage — not adopted because it would silently override an explicit constitutional value without the empirical evidence the user asked this research to produce first.

## 7. React Native `Image` caching on iOS for this list

**Decision**: keep the plain React Native `Image` component (as already fixed by the constitution's Principle VII and Technology Stack table) — no image-caching library (e.g. `react-native-fast-image`, `expo-image`) is added.

**Rationale**: iOS's `Image` component is backed by `SDWebImage`-free `NSURLCache`-based disk+memory caching since RN's Fabric image pipeline matured; for a grid of ~20 unique poster/backdrop URLs per page fetched over `https://image.tmdb.org`, repeat renders (recycled FlashList cells re-requesting the same URL) are served from cache, not re-downloaded, which is sufficient for the success criteria (first batch in 2s, 100+ movies without blank gaps). Principle VII already requires explicit width/height, `resizeMode="cover"`, `resizeMethod="resize"` on Android and `fadeDuration` on Android — these are the load-bearing optimizations, not the cache backend.

**Alternatives considered**: adding `react-native-fast-image` or `expo-image` for more aggressive caching/prefetch controls — rejected as an unrequested new dependency; nothing in the spec's success criteria requires it, and Principle XII requires justifying new dependencies in the plan, which this plan does not do absent a demonstrated problem. Revisit with an ADR if a real device test shows poster re-fetching on scroll-back.

## 8. Emoji glyphs for tab/menu icons on Android and iOS

**Decision**: render emoji characters as plain `Text` content (no icon font/package), as already fixed by the Technology Stack table ("Icons: Emoji glyphs and text/View shapes").

**Rationale**: both platforms ship system color-emoji fonts (Apple Color Emoji on iOS, Noto Color Emoji on Android) that React Native's `Text` renders through the OS text layer with zero extra configuration or bundle size; this is standard, well-established RN practice and needed no live verification beyond confirming no package is required.

## 9. react-native-config native setup

**Decision**: `react-native-config@1.7.2`, wired natively per its own installation docs: Android applies the `react-native-config` Gradle plugin in `android/app/build.gradle` (reads `.env` into `BuildConfig`/`resValues` at build time); iOS adds the `Config.xcconfig` include generated by the library's Fastlane-free manual step to `Info.plist`/build settings so `ReactNativeConfig` is available at runtime via `Config.TMDB_BASE_URL` / `Config.TMDB_ACCESS_TOKEN`, consumed only through `src/constants/env.ts`'s Zod-validated `env` object.
