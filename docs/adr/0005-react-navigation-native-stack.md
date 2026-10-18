# ADR-0005: React Navigation with a native stack

**Status**: Accepted
**Date**: 2026-10-17

## Context

The assessment requires React Navigation. The app has two screens (list and detail) and needs smooth, native-feeling transitions on Android and iOS.

## Decision

Use @react-navigation/native with @react-navigation/native-stack (native transitions via react-native-screens). One RootNavigator with two screens, Movies and MovieDetail. Route names are centralized in src/navigation/routes.ts (ROUTES, as const) and typed through RootStackParamList; screens receive only primitive params (movieId) and fetch their own data.

## Consequences

Native-performance transitions; end-to-end type safety for navigation; a single source of truth for route names; no tab/drawer navigators exist, so adding one requires a spec and a constitution amendment.
