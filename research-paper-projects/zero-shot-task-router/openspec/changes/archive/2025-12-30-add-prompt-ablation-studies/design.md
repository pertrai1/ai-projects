## Context
Phase 5 introduces prompt ablation studies by running multiple prompt variants against the same input and model parameters. The existing CLI supports single-template runs with an optional OpenAI completion mode.

## Goals / Non-Goals
- Goals: add minimal summarization variants, enable multi-template runs in one command, and accept file/stdin inputs for repeatability.
- Non-Goals: task routing, multiple model backends, or parameter tuning.

## Decisions
- Decision: Add a dedicated CLI mode that takes a list of template ids and produces labeled outputs for each template in sequence.
- Decision: Allow input via file path or stdin to ensure reproducible prompt ablations.
- Decision: Keep output formatting minimal and text-based to avoid introducing a reporting subsystem.

## Risks / Trade-offs
- The multi-template run increases CLI surface area, but keeps core logic unchanged.
- Side-by-side output formatting may need iteration to stay readable across terminals.

## Migration Plan
- Add new prompt variants.
- Implement multi-template CLI mode with file/stdin input resolution.
- Add observations template under `observations/`.

## Open Questions
- None.
