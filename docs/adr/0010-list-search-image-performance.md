# ADR-0010: List, search and image performance strategy

**Status**: Accepted
**Date**: 2026-10-17

## Context

Efficiency is an explicit evaluation criterion: optimized lists, image handling and performance considerations, plus debounce and good pagination.

## Decision

(1) Search input is debounced 300 ms; only the committed trimmed term feeds the query key; the search query is enabled only for non-empty terms; superseded requests are cancelled through AbortSignal; keepPreviousData avoids empty flashes. (2) The list is a FlashList grid (2 columns, ADR-0011) with uniform-height cards, stable keyExtractor and renderItem, a React.memo'd MovieCard, and explicit tuning centralized in src/constants/list.ts (numColumns 2, drawDistance 250, and estimatedItemSize only with FlashList v1). (3) Pagination is infinite scroll with useInfiniteQuery, onEndReachedThreshold 0.5, guarded against duplicate fetches, capped at min(total_pages, 500) (TMDB limit), with de-duplication by movieId. (4) Images are requested at the size needed (w342 in the list, w780 in the detail), always with explicit dimensions, placeholder and error fallback; the detail image is prefetched on item press. (5) Zustand selectors, stable callbacks and mapping outside render prevent unnecessary re-renders and work. (6) Caching: staleTime 5 min (lists/search) and 10 min (detail), gcTime 30 min, in-memory only.

## Consequences

Smooth scrolling and low memory use on mid-range devices; fewer redundant network calls; uniform card heights constrain the card design; every rule above must be covered by tests or review checklist items.
