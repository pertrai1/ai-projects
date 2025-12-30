# Change: Add baseline summarization prompt template

## Why
Phase 3 of the roadmap establishes a deliberately weak summarization baseline to make zero-shot task emergence and failure visible. The research paper motivates using minimal prompt conditioning as a controlled baseline.

## What Changes
- Add a minimal summarization prompt template with intentionally sparse phrasing.
- Wire the baseline template into the existing prompt template registry.
- Document baseline usage via the CLI to keep experiments reproducible.

## Impact
- Affected specs: baseline-summarization, experimental-skeleton
- Affected code: prompt template registry and CLI usage docs.
