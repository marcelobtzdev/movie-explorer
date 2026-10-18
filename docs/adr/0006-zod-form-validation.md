# ADR-0006: Zod for form validation

**Status**: Accepted
**Date**: 2026-10-17

## Context

The search field needs runtime validation with localized messages alongside React Hook Form, and environment variables need validation at startup. Valibot was the initial candidate in the reference documentation; the team chose Zod instead.

## Decision

Use Zod as the schema library, integrated with React Hook Form via zodResolver from @hookform/resolvers/zod. Each form has a [form].schema.ts exporting the schema, the inferred type (z.infer<typeof Schema>), the resolver and a DefaultValues constant. Error messages come from the Spanish text constants of the feature (strings.ts). Zod also validates environment variables in src/constants/env.ts.

## Consequences

Types are inferred from the schema with no duplication; one validation library across forms and env; React Hook Form remains the form state manager; Zod has a larger bundle than Valibot, accepted for its ecosystem and familiarity.
