# ADR-0013: Custom shimmer Skeleton (supersedes ADR-0012)

**Status**: Accepted
**Date**: 2026-10-18

## Context

ADR-0012 chose `moti` (`moti/skeleton`) for the shimmering skeleton placeholder, specifically via the `moti/skeleton/react-native-linear-gradient` entry point, reasoned to avoid adding an Expo dependency to this bare React Native CLI project.

During implementation (feature 001-popular-movies, Setup phase, task T019's smoke test) this was verified against the actually-installed `moti@0.30.0`: its `package.json` `exports` map only declares `.`, `./interactions`, `./skeleton`, `./svg`, `./author` — there is no `react-native-linear-gradient` (or any other bare-RN) subpath. `./skeleton` unconditionally re-exports from an internal `expo.js` file that imports `expo-linear-gradient`, which this project does not have. Jest's resolver (and Metro's, which enforces `exports` the same way) refuses to resolve a deep import straight to the internal `native.js` file that *does* use `react-native-linear-gradient`, because the `exports` field blocks any subpath not explicitly listed. Confirmed empirically: `import { Skeleton } from 'moti/skeleton'` throws `Cannot find module 'expo-linear-gradient'`; `import { Skeleton } from 'moti/skeleton/react-native-linear-gradient'` and `import { Skeleton } from 'moti/build/skeleton/native'` both throw `Cannot find module`.

In short: the entry point ADR-0012 named does not exist in the version of `moti` this project installed, and there is no way to reach the bare-RN implementation through `moti`'s public API without also installing `expo-linear-gradient` (and, transitively, Expo's module system) — which directly contradicts ADR-0012's own reason for choosing that import path.

## Decision

Drop `moti` entirely. The shimmer `Skeleton` atom (`src/components/atoms/Skeleton`) is implemented directly on top of `react-native-reanimated` (already a dependency, now `4.7.1` — see ADR-0014) and `react-native-linear-gradient` (already a dependency, `2.8.3`) — a small (~100 line), independently-written component, not a copy of `moti`'s source:

- A `SkeletonGroupContext` (React Context) lets a parent `Skeleton.Group` control whether all its child skeletons are shown, so a screen's placeholders animate in sync — the same public shape `Skeleton`/`Skeleton.Group` already used throughout this feature's tasks and components, so no downstream component changes are needed.
- The shimmer itself is a `LinearGradient` strip, offset by a `react-native-reanimated` `useSharedValue`/`withRepeat(withTiming(...))` sweeping it across the placeholder box on the UI thread (the same mechanism ADR-0012 wanted — animation off the JS thread — just without `moti` as an intermediary).
- `colorMode="dark"` and the `skeleton.base`/`skeleton.highlight` tokens from `src/theme` are applied exactly as ADR-0012 specified.
- `react-native-linear-gradient` keeps its existing use for the featured-card overlay, unaffected by this change.
- The Reanimated/worklets Babel plugin configuration from the Setup phase is unchanged (Reanimated is still a real dependency, just no longer via `moti`).

## Consequences

One fewer runtime dependency (`moti` is removed) and no Expo packages are ever added, which is now actually true rather than aspirational. The shimmer component is now ~100 lines of project-owned code to maintain instead of an external package, but it depends only on two libraries already required for other reasons (ADR-0011's data lists don't need this, but the featured-card gradient overlay already needed `react-native-linear-gradient`, and FlashList v2 already required the New Architecture that Reanimated runs well on). Any future skeleton visual refinement (e.g., a diagonal sweep, multiple simultaneous highlight bands) is a change to this project's own component, not an upstream dependency update.
