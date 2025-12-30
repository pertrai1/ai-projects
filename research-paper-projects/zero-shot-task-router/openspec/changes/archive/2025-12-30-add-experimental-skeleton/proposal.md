# Change: Add experimental skeleton CLI and prompt pipeline

## Why
Phase 2 of the roadmap requires a minimal experimental skeleton that constructs prompts as first-class objects and outputs the exact prompt text. The research paper in the README motivates this as a controlled interface for zero-shot task induction.

## What Changes
- Introduce a prompt template abstraction and prompt construction pipeline.
- Add a CLI command (Commander + Chalk) that accepts flags and prints the constructed prompt text.
- Provide a stub language model client interface for future integration without real model calls.

## Impact
- Affected specs: experimental-skeleton
- Affected code: new TypeScript sources for CLI, prompt templates, and stub client; package.json scripts remain unchanged.
