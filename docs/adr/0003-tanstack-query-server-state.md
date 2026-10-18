# ADR-0003: TanStack Query for server state

**Status**: Accepted
**Date**: 2026-10-17

## Context

The app fetches paginated data from TMDB. Managing loading, error, caching, refetching, cancellation and pagination manually with useEffect + local state adds boilerplate and is error-prone.

## Decision

Use TanStack Query v5 for all server state, with a three-file pattern per feature: [feature].keys.ts (as const key factories), [feature].service.ts (plain async functions, no React, AbortSignal support), use-[feature].ts (thin useQuery/useInfiniteQuery wrapper). The global QueryClient is configured in src/vendors/react-query/client.ts with global error handling (overlays, see ADR-0008), no automatic retry for errors with HTTP status or network errors, explicit staleTime/gcTime, and meta flags (skipNotify, skipServerError, skipNetworkError) to opt out.

## Consequences

Uniform loading/error/cache/refetch handling without boilerplate; infinite scroll via useInfiniteQuery; automatic request cancellation and deduplication; key factories enable safe invalidation; the three-file split adds files but each concern is independently testable.
