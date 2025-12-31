# cli-flags-for-reasoning Specification

## Purpose
TBD - created by archiving change add-cli-flags-for-reasoning-output. Update Purpose after archive.
## Requirements
### Requirement: CLI Flag Control for Reasoning Output

Users SHALL be able to specify which reasoning prompt types to include in the evaluation via command-line flags.

#### Scenario: Include only Standard Prompt

Given the CLI is executed with the `--standard` flag,
When the evaluation process runs,
Then only the "Standard Prompt" type is included in the evaluation and API calls.

#### Scenario: Include multiple specific Prompt Types

Given the CLI is executed with `--cot` and `--verbose-cot` flags,
When the evaluation process runs,
Then only the "Chain-of-Thought" and "Verbose Chain-of-Thought" prompt types are included in the evaluation and API calls.

#### Scenario: Default to all Prompt Types

Given the CLI is executed without any specific prompt type flags,
When the evaluation process runs,
Then all five prompt types (Standard, Chain-of-Thought, Concise Chain-of-Thought, Verbose Chain-of-Thought, Reasoning After Answer) are included in the evaluation and API calls.

#### Scenario: Unknown Flag Handling

Given the CLI is executed with an unknown flag (e.g., `--invalid-flag`),
When the CLI attempts to parse the arguments,
Then `commander.js` should display an error message indicating an unknown option and exit gracefully.

