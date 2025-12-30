## Context
Phase 4 introduces a real model backend while preserving the prompt-only experimental control established in earlier phases. The project relies on a single execution path with fixed decoding parameters.

## Goals / Non-Goals
- Goals: integrate OpenAI as the sole backend, use `OPENAI_API_KEY`, keep decoding parameters fixed, and allow optional completion runs from the CLI.
- Non-Goals: multiple providers, dynamic parameter tuning, routing logic, or benchmarking.

## Decisions
- Decision: Use the OpenAI API with `gpt-4o-mini` and fixed parameters (temperature 0, top_p 1, max_tokens 256) to maximize reproducibility.
- Decision: Keep prompt rendering unchanged and add an optional CLI path to execute the completion.
- Alternatives considered: supporting multiple backends or per-run parameter overrides; rejected to preserve control and minimal scope.

## Risks / Trade-offs
- Fixed parameters limit exploration but align with the experimental requirement for stable decoding.
- External API dependency introduces latency and cost; mitigated by keeping a single model and minimal usage.

## Migration Plan
- Add OpenAI client implementation and config constants.
- Update CLI to optionally execute completions.
- Document usage and environment variable requirements.

## Open Questions
- None.
