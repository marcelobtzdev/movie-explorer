# ADR-0011: FlashList for all data lists

**Status**: Accepted
**Date**: 2026-10-17

## Context

The app's main screen is a long, paginated grid of movie cards with images. The assessment evaluates optimized lists and performance. FlatList creates and destroys cells as the user scrolls, which costs CPU and memory with image-heavy items and can cause blank areas and dropped frames on mid-range devices. FlashList (`@shopify/flash-list`) recycles cells instead of recreating them, giving smoother scrolling and lower memory use with a mostly compatible API.

## Decision

Every data list uses `FlashList`.

- The FlashList major version is the one compatible with the project's React Native architecture, chosen and recorded in the first plan (v2 requires the New Architecture; with v1, `estimatedItemSize` is set).
- The movie list is a 2-column grid of uniform-height cards with a stable `keyExtractor`, a stable `renderItem` and a `React.memo`'d `MovieCard`.
- Because cells are recycled, items derive everything from props (no position-specific local state), do not set a `key` prop inside the item, and receive any external state they read through `extraData`.
- Tuning lives in `src/constants/list.ts`: `numColumns` 2, `drawDistance` 250 and, for v1 only, `estimatedItemSize`.
- Pagination uses `onEndReached` with `onEndReachedThreshold` 0.5, guarded against duplicate fetches (ADR-0010); footer states use `ListFooterComponent`.
- The Jest setup includes `@shopify/flash-list/jestSetup`.

## Consequences

Smoother scrolling and lower memory use on long image lists; one extra dependency; cell recycling imposes constraints on item components (stateless items, careful `extraData`); the New Architecture requirement of FlashList v2 is checked when scaffolding the project; tests need the FlashList Jest setup.
