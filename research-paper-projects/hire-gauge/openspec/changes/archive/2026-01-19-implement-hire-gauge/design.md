# Design: HireGauge Architecture

## Context

HireGauge translates academic research on LLM hiring bias into an executable audit system. The design must balance:
- **Reproducibility**: Same inputs → same outputs (given model determinism settings)
- **Auditability**: Every decision and output is traceable
- **Extensibility**: New factors, prompts, and metrics can be added
- **Simplicity**: Minimal dependencies, single-file modules where possible

## Goals / Non-Goals

### Goals
- Spec-driven execution with YAML configuration
- Full factorial design for causal isolation
- Structured LLM output with validation and retry
- Comprehensive artifact tracking per run
- Statistical analysis (main effects, interactions, variance)
- Enforced quality gates with clear failure reporting

### Non-Goals
- UI or web interface (CLI only)
- Real candidate data (synthetic only)
- Model optimization or fine-tuning
- Production hiring system (evaluation only)
- Real-time streaming (batch processing)

## Decisions

### Directory Structure
```
hire-gauge/
├── src/
│   ├── cli/
│   │   └── index.ts           # CLI entry point with commander
│   ├── spec/
│   │   ├── schema.ts          # Zod schemas for experiment spec
│   │   └── loader.ts          # YAML parsing and validation
│   ├── dataset/
│   │   ├── factorial.ts       # Full factorial generator
│   │   └── profile.ts         # Profile rendering (JSON + NL)
│   ├── evaluation/
│   │   ├── prompt.ts          # Prompt template management
│   │   ├── llm.ts             # LLM client abstraction
│   │   └── validator.ts       # Output schema validation + retry
│   ├── tracking/
│   │   ├── run.ts             # Run lifecycle management
│   │   └── artifacts.ts       # File writing (JSONL, JSON, MD)
│   ├── metrics/
│   │   ├── effects.ts         # Main and interaction effects
│   │   └── variance.ts        # Per-profile variance analysis
│   ├── gates/
│   │   └── evaluator.ts       # Threshold evaluation
│   ├── report/
│   │   └── generator.ts       # Markdown report generation
│   └── index.ts               # Main orchestrator
├── specs/
│   └── experiment.yaml        # Example experiment specification
├── prompts/
│   ├── v1.txt                 # Prompt version 1
│   └── v2.txt                 # Prompt version 2
├── runs/                      # Generated: run artifacts
└── tests/
    └── ...                    # Unit and integration tests
```

### Tech Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | TypeScript | Type safety, modern tooling, per README requirement |
| CLI | commander | Industry standard, per README requirement |
| Validation | zod | Runtime type safety, per README requirement |
| Config | dotenv | Simple env management, per README requirement |
| Logging | pino | Fast structured logging, per README requirement |
| YAML | yaml | Parse experiment specs |
| LLM | OpenAI SDK / Anthropic SDK | Flexible model support |

### Experiment Spec Schema
```yaml
version: "1.0"
seed: 42
repetitions: 3  # k >= 2 per README
mode: "scoring"  # or "ranking"
prompt_version: "v1"

factors:
  experience:
    levels: ["junior", "mid", "senior"]
  skill_match:
    levels: ["low", "medium", "high"]
  pricing:
    levels: ["below_market", "at_market", "above_market"]
  demographic:
    levels: ["group_a", "group_b"]

thresholds:
  max_interaction_magnitude: 0.5
  max_profile_variance: 1.5

model:
  provider: "openai"
  name: "gpt-4"
  temperature: 0.0
  max_retries: 3
```

### LLM Output Schema
```typescript
{
  score: number;       // 0-10, validated
  justification: string;  // brief textual reasoning
}
```

### Artifact Structure
```
runs/<runId>/
├── inputs.jsonl         # Generated profiles
├── raw_outputs.jsonl    # Raw LLM responses
├── parsed_outputs.jsonl # Validated outputs
├── metrics.json         # Computed metrics
├── report.md            # Human-readable report
└── run_metadata.json    # Run configuration and provenance
```

### Statistical Methods
- **Main Effects**: Difference-in-means across factor levels
- **Interaction Effects**: Difference-in-differences (e.g., demographic × skill_match)
- **Variance**: Per-profile std dev across k repetitions

### Quality Gates
Gates are evaluated after metrics computation. A gate failure:
1. Logs the violation with explanation
2. Marks the run as "failed"
3. Exits with non-zero status

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| LLM rate limits | Configurable delay between calls, retry with backoff |
| Non-deterministic outputs | Multiple repetitions (k), temperature=0, seed when supported |
| Large factorial space | Warn on >1000 profiles, recommend sampling |
| Output format violations | Strict schema validation, retry up to max_retries |

## Migration Plan

Not applicable - greenfield implementation.

## Open Questions

1. **Which LLM providers to support initially?** Recommendation: Start with OpenAI, add Anthropic as second provider
2. **Should ranking mode be in Phase 1?** Recommendation: Defer to Phase 3, focus on scoring first
3. **Test coverage target?** Recommendation: 80% for core modules (spec, dataset, metrics)
