# ADR-0014: Reanimated 4 and react-native-worklets for React Native 0.88

**Status**: Accepted
**Date**: 2026-10-18

## Context

ADR-0013 built the `Skeleton` atom on `react-native-reanimated` `3.19.5`. Building the Android app against React Native `0.88.0` failed: `react-native-reanimated@3.19.5` imports internal `uimanager` classes (`UIImplementation`, `layoutanimation`, `UIManagerModuleListener`) that React Native 0.88 no longer provides, so `:react-native-reanimated:compileDebugJavaWithJavac` fails.

`research.md` §2 had rejected Reanimated 4 only because `moti` (ADR-0012) was unverified against it. ADR-0013 removed `moti`, so that reason no longer applies.

Reanimated 4.7.1 declares `react-native: "0.86 - 0.88"` and `react-native-worklets: "0.13.x"` as peer dependencies. `react-native-worklets@0.13.0` declares the same React Native range.

## Decision

- Use `react-native-reanimated@4.7.1` (exact version) and `react-native-worklets@0.13.0` (exact version).
- The Babel plugin is `react-native-worklets/plugin` and remains the last plugin in `babel.config.js`.
- Jest uses Reanimated's own resolver (`react-native-reanimated/jest/resolver.js`) and `setUpTests()` in `jest.setup.js`. `react-native-worklets` is added to the `transformIgnorePatterns` allowlist.
- `eslint-plugin-perfectionist` is pinned to `4.14.0`. Versions `4.15.x` and later are ESM-only and do not load under the ESLint 8 legacy config this project uses (ADR-0001 / constitution tooling).

## Consequences

- The `Skeleton` atom keeps the same public API. Its TS2589 workaround (`as unknown as React.ComponentType`) is still in place.
- Reanimated 4 uses the worklets runtime, so animations still run on the UI thread, as ADR-0013 requires.
- Future Reanimated upgrades must stay within the React Native range declared by Reanimated's peer dependencies.
