# ADR-0002: Feature Slice Architecture

**Status**: Accepted
**Date**: 2026-10-17

## Context

The app has two business domains today (movies list/search and movie detail) and must be scalable. A flat or purely type-based structure (/screens, /hooks, /services) makes it hard to find all code of one domain as the app grows.

## Decision

Each business domain lives in src/features/[feature-name]/ with a consistent internal layer structure (api/, hooks/, screens/, components/, stores/, models/, types/, schemas/, mappers/, dtos/, errors/, utils/). Each feature exposes a public API only through its root index.ts barrel; other features or the navigation layer import only from this barrel. Shared UI lives in src/components/ following Atomic Design.

## Consequences

Domain code is co-located, reducing context switching; onboarding is faster; boundaries are enforced by the index.ts contract; some patterns (keys, service, hook) are intentionally duplicated across features to keep each independently understandable; moving or deleting a feature is straightforward.
