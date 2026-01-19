# Change: Implement HireGauge Evaluation System

## Why

The HireGauge project aims to translate a research paper on LLM behavior in hiring decisions into an executable evaluation system. Currently, the project exists only as a README specification with no implementation code. This proposal defines the complete roadmap to build a production-grade CLI tool that runs controlled experiments to audit how LLMs implicitly weigh candidate attributes in hiring scenarios.

## What Changes

This is a greenfield implementation organized into 8 core capabilities:

1. **CLI Core** - Command-line interface with `commander`, spec loading, validation, and run orchestration
2. **Experiment Specification** - YAML-based experiment config with `zod` schema validation
3. **Synthetic Dataset Generation** - Full factorial design profile generator
4. **LLM Evaluation Engine** - Structured prompting, output validation, retry logic
5. **Run Tracking** - Artifact persistence and run metadata management
6. **Metrics Analysis** - Main effects, interaction effects, variance computation
7. **Quality Gates** - Threshold-based bias and robustness guardrails
8. **Prompt Regression** - Multi-version prompt comparison and diff reporting

## Impact

- **Affected specs**: All 8 capabilities are NEW (no existing specs)
- **Affected code**: Entire codebase will be created from scratch
- **New dependencies**: commander, zod, dotenv, pino, yaml, openai/anthropic SDK
- **Deliverables**: Working CLI that produces audit reports from experiment specs

## Phased Delivery

### Phase 1: Foundation (Capabilities 1-3)
Build the core infrastructure: CLI entry point, experiment specification parsing, and synthetic data generation. At the end of this phase, `npm run audit --spec specs/experiment.yaml` will validate a spec and generate synthetic profiles.

### Phase 2: Evaluation Pipeline (Capabilities 4-5)
Integrate LLM evaluation with output validation and run tracking. At the end of this phase, the CLI will execute experiments against an LLM and persist all artifacts.

### Phase 3: Analysis & Reporting (Capabilities 6-8)
Add statistical analysis, quality gates, and prompt regression testing. At the end of this phase, the system will be fully functional per the README acceptance criteria.

## Success Criteria

The project is complete when:
1. A clean install followed by `npm run audit -- --spec specs/experiment.yaml` produces a full audit run
2. The final report answers: What signals does the model prioritize? Do evaluation standards change across groups? How stable are results?
3. All artifacts are saved, validated, and human-readable
4. Quality gates enforce thresholds and fail runs when exceeded
