# ADR-0009: TMDB access via a dedicated Axios client

**Status**: Accepted
**Date**: 2026-10-17

## Context

The app consumes the public TMDB REST API with no backend of our own. Credentials, base URL, language, cancellation and error normalization need a single configuration point.

## Decision

Wrap Axios in src/vendors/axios/tmdb-client.ts with base URL (TMDB_BASE_URL from the environment, which includes the API version: https://api.themoviedb.org/3), Authorization: Bearer header (API Read Access Token from TMDB_ACCESS_TOKEN via react-native-config), the language parameter TMDB_LANGUAGE, and a response interceptor that converts errors to AppError via handleError. Services are the only callers and forward the AbortSignal; DTOs (snake_case) are converted to camelCase readonly models by mappers; responses are typed but not runtime-validated. Image URLs are built only by src/utils/tmdb-image.utils.ts. The token is bundled with the app, which is accepted for a read-only token over public data; it must never be committed (.env.example holds placeholders).

## Consequences

One place to change auth, base URL or language; consistent error handling and cancellation; the token has no secret-grade protection (a proxy/BFF would require a new ADR); TMDB rate limits are handled as regular HTTP errors by screens.
