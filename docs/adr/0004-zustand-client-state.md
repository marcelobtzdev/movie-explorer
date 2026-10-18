# ADR-0004: Zustand for client state (Redux rejected)

**Status**: Accepted
**Date**: 2026-10-17

## Context

The assessment asks for Redux or the global state manager of our choice with a justification. Client state in this app is small: the committed search term, toast notifications and two error-overlay states. Server data is already owned by TanStack Query (ADR-0003).

## Decision

Use Zustand v5 for all client state. Stores are plain create<Interface>()() calls with state and actions in the same interface, consumed through selectors. Redux/Redux Toolkit was rejected because it adds boilerplate that is unnecessary for an app that is not complex: actions, reducers, slices, store provider wiring and typed hooks, in exchange for features (middleware ecosystem, devtools time-travel, normalized entity adapters) the app does not need. Zustand needs no provider, has a minimal API, supports fine-grained selectors that limit re-renders, and can be read outside React with .getState() (services, Axios interceptors, QueryCache handlers). No store is persisted: the app has no persistence requirement; adding persistence (e.g., MMKV) requires a new ADR.

## Consequences

Strongly typed stores with minimal boilerplate; fewer files and concepts to learn; consumers must always use selectors to avoid unnecessary re-renders; no built-in devtools time travel (Reactotron/log middleware can be used in development if needed).
