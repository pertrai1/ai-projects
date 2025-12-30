# Change: Add prompt ablation studies workflow

## Why
Phase 5 requires controlled prompt variants for summarization and side-by-side outputs using the same inputs and fixed model parameters. This supports observing prompt sensitivity consistent with zero-shot task induction.

## What Changes
- Add multiple minimal summarization prompt variants for ablation.
- Extend the CLI with a mode that runs multiple templates in one command and prints side-by-side outputs.
- Support input from file or stdin for repeatable comparisons.
- Add an observations directory with a Phase 5 log template.

## Impact
- Affected specs: prompt-ablation, experimental-skeleton, model-integration
- Affected code: prompt template registry, CLI input handling, and new observations artifact.
