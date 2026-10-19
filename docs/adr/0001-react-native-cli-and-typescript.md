# ADR-0001: React Native CLI and TypeScript

**Status**: Accepted
**Date**: 2026-10-17

## Context

The assessment requires a mobile app built with React Native CLI and TypeScript, compatible with Android and iOS, with performance and best practices evaluated.

## Decision

Use a bare React Native project created with the React Native CLI (not Expo) and TypeScript in strict mode. Hermes stays enabled. pnpm is the package manager with every dependency hoisted (`nodeLinker: hoisted` in `pnpm-workspace.yaml` — not `.npmrc`, which pnpm silently ignores for this setting once `pnpm-workspace.yaml` exists; required by React Native's Gradle tooling, which hardcodes a flat `node_modules` layout). Environment values are loaded with react-native-config from a git-ignored .env and validated with Zod at startup.

## Consequences

Full control over native projects (android/, ios/); no dependency on Expo services (no EAS, no Expo modules); native setup is manual (e.g., react-native-config); builds must be verified on both platforms.
