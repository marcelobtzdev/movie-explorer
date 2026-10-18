# ADR-0012: Moti Skeleton for loading placeholders

**Status**: Accepted
**Date**: 2026-10-18

## Context

The movies screen shows a full-screen skeleton while the first batch loads, so the user sees the final layout immediately instead of a spinner. React Native has no built-in skeleton component. A convincing skeleton uses a shimmer effect (a highlight sweeping across the blocks), which needs gradients and animations running off the JavaScript thread. Moti (`moti/skeleton`) provides this on top of `react-native-reanimated`, with synchronized animation across blocks and a small API.

## Decision

Skeleton placeholders use `Skeleton` from `moti/skeleton`.

- Packages: `moti`, `react-native-reanimated` (with `react-native-worklets` when the Reanimated version requires it) and `react-native-linear-gradient` (bare React Native, so the `moti/skeleton/react-native-linear-gradient` entry point is used and no Expo package is added). The compatible versions with the project's React Native version are chosen and recorded in the first plan.
- Native setup is part of the scaffolding: the Reanimated/worklets Babel plugin is configured as the last Babel plugin, and `pod install` is run for iOS.
- Moti and the gradient package are imported only inside vendor wrappers (`src/vendors/moti`, `src/vendors/linear-gradient`); the `Skeleton` atom in `src/components/atoms/Skeleton` is the single skeleton API for the app and applies the `skeleton.base` / `skeleton.highlight` tokens.
- Skeleton blocks of a screen are grouped inside one `Skeleton.Group` so they animate together, and `MoviesSkeleton` mirrors the dimensions of the final layout so there is no layout shift when content arrives.
- Because `react-native-reanimated` is now part of the project, it can be used for other animations when a spec needs them; components rely on the dependency rule of the constitution.

## Consequences

A polished shimmer effect with animation on the UI thread; three extra dependencies and one extra Babel plugin to configure; Jest needs the Reanimated mock in the setup file; version compatibility between Reanimated, Moti and the React Native version is verified when scaffolding.
