# Change: Implement Milestone 0 - Define the Objective

## Why

Milestone 0 establishes the foundational decisions that constrain and focus all subsequent development. According to the ROADMAP, the goal is to "lock the project's purpose before writing code" by making three explicit, non-negotiable decisions:

1. **Target Model** - Which LLM to test
2. **Behavioral Objective** - Which failure mode to elicit
3. **Turn Limit** - Maximum conversation length (2 turns)

Without these decisions codified in the codebase, there's no clear direction for implementing the static baseline (Milestone 1), rubric definition (Milestone 2), or adaptive strategies (Milestones 3-5). The ROADMAP recommends testing for **self-contradiction/self-affirmation** as the behavioral objective, which is well-suited for a 2-turn interaction.

The stop condition for Milestone 0 is: "You can describe the behavior being tested in one sentence."

## What Changes

- Create a **test configuration** capability that defines:
  - Target LLM model (e.g., `gpt-4` or `gpt-3.5-turbo`)
  - Behavioral objective (self-contradiction/self-affirmation)
  - Maximum turn limit (2 turns)
  - One-sentence behavior description
- Implement a configuration file (`src/config.ts`) to centralize these decisions
- Add validation to ensure configuration is loaded correctly
- Update documentation to reflect the chosen objective

## Impact

- Affected specs: New capability `test-configuration`
- Affected code:
  - New file: `src/config.ts`
  - Updated: README.md (add "Current Configuration" section)
- No breaking changes (this is the first functional implementation)
- Unblocks Milestone 1 (Static Baseline) by providing clear testing parameters
- Dependencies: Requires completion of project structure setup (already done)
