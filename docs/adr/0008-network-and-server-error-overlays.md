# ADR-0008: Centralized network and server error overlays

**Status**: Accepted
**Date**: 2026-10-17

## Context

Network failures (no HTTP response) and server failures (HTTP 500) need consistent user feedback and a controlled retry experience, without hidden automatic retries.

## Decision

Two independent Zustand stores (useNetworkErrorStore and useServerErrorStore) created by one createErrorOverlayStore() factory drive modal overlays. QueryCache.onError / MutationCache.onError classify errors with isNetworkError (statusCode undefined, cancellations excluded) and isServerError (statusCode 500). Queries retry with their own query.fetch; mutations (none today) only close the overlay. Maximum 3 manual retries (MAX_RETRIES), then "Entendido". No automatic React Query retries. The network overlay auto-closes on reconnection (useNetworkStatus + invalidateQueries); the server overlay never does and only closes on success when isRetrying is true. Per-query opt-outs via meta.skipNetworkError / meta.skipServerError / meta.skipNotify. Other HTTP errors (401, 404, 429) are handled by the owning screen with its own error state.

## Consequences

Uniform, predictable error UX; each manual press equals exactly one network call; screens must still implement their own error state after the overlay is dismissed; an in-flight query on unmount may rarely show the overlay on the next screen.
