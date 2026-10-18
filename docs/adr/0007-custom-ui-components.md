# ADR-0007: Custom UI components and styling

**Status**: Accepted
**Date**: 2026-10-17

## Context

The app is small and visually simple, and the assessment evaluates component structure, separation of responsibilities and React Native best practices. UI component kits and styling systems add dependency weight, impose their own design language and hide the practices being evaluated.

## Decision

Build UI components as custom components on React Native primitives, organized by Atomic Design in src/components/, styled with StyleSheet.create and tokens from src/theme. Custom styling is preferred over UI component libraries and styling systems (e.g., React Native Paper, NativeBase, Tamagui, Gluestack, React Native Elements, UI Kitten, NativeWind, styled-components).

This is a preference, not a hard ban: if requirements change, a UI library can be adopted for a specific need when it is justified in the plan and recorded in an ADR. The decision only concerns how components are built and styled; other packages (for lists, icons, images, animations, etc.) can be used following the dependency rule of the constitution. Data lists use FlashList (ADR-0011). Packages required by React Navigation (react-native-screens, react-native-safe-area-context) are part of the infrastructure.

## Consequences

Full control over look, behavior and accessibility; no design language imposed by a kit; more initial work to build and test basic components; every shared component carries its own tests and accessibility attributes; adopting a UI library later stays possible through an ADR.
