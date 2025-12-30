# Change: Add QA and translation prompt templates

## Why
Phase 6 expands the system to additional task categories without changing architecture. This tests whether the same prompt pipeline can support QA and translation through prompt text alone.

## What Changes
- Add minimal QA and English→Spanish translation prompt templates.
- Keep a single execution path with no task routing logic.
- Add a Phase 6 observations template under `observations/`.

## Impact
- Affected specs: task-expansion, experimental-skeleton
- Affected code: prompt template registry and observations artifacts.
