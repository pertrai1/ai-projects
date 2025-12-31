---
change-id: add-cli-flags-for-reasoning-output
---

## Design for CLI Flag Control for Reasoning Output

### Overview

This design outlines the integration of `commander.js` into the `cot-prompt-comparator` CLI to enable granular control over which reasoning prompt types are executed during evaluation. The primary goal is to allow users to specify desired prompt types via command-line flags, thereby optimizing execution time and API usage.

### Architectural Changes

The core changes will involve modifications to `src/index.ts` (the CLI entry point) and `src/runner.ts` (where prompt types are currently defined and executed).

#### `src/index.ts` Modifications

1.  **`commander.js` Integration:** The `main` function in `src/index.ts` will be refactored to initialize `commander.js`.
2.  **Command Definition:** A main command (e.g., `run` or the default command) will be defined.
3.  **Option Definitions:** For each reasoning prompt type, a corresponding boolean option (flag) will be added.
    *   `--standard`: To include the Standard Prompt.
    *   `--cot`: To include the Chain-of-Thought Prompt.
    *   `--concise-cot`: To include the Concise Chain-of-Thought Prompt.
    *   `--verbose-cot`: To include the Verbose Chain-of-Thought Prompt.
    *   `--reasoning-after-answer`: To include the Reasoning After Answer Prompt.
4.  **Default Behavior:** If no specific prompt type flags are provided, all prompt types will be selected by default. This ensures backward compatibility and a sensible default.
5.  **Argument Parsing:** `commander.js` will parse `process.argv` to extract the values of these flags.
6.  **Passing Options:** The parsed options (an object containing boolean flags for each prompt type) will be passed as an argument to the `run` function in `src/runner.ts`.

#### `src/runner.ts` Modifications

1.  **`run` Function Signature:** The `run` function will be updated to accept an `options` object as an argument. This object will contain the boolean flags indicating which prompt types to execute.
2.  **Prompt Type Filtering:** Inside the `run` function, the `promptTypes` array (which currently lists all five prompt types) will be dynamically filtered based on the `options` object.
    *   If a specific flag (e.g., `options.standard`) is `true`, the corresponding prompt type will be included.
    *   If no flags are explicitly set (indicating the default behavior), all prompt types will be included.
3.  **Conditional Execution:** The `for...of promptTypes` loop will then iterate only over the filtered list of prompt types, ensuring that API calls are made only for the selected types.

### Data Flow

`src/index.ts` (CLI Entry)
  -> `commander.js` (Parses `process.argv` into `options` object)
  -> `run(options)` in `src/runner.ts` (Receives `options`)
  -> `src/runner.ts` (Filters `promptTypes` array based on `options`)
  -> `genAI.models.generateContent` (API calls made only for selected prompt types)

### Trade-offs and Considerations

*   **Default Behavior:** Maintaining the "run all by default" behavior ensures that existing scripts or user habits are not broken.
*   **Clarity:** The flags will make the CLI's behavior explicit and easier to understand for users.
*   **Complexity:** Introduces a small amount of additional logic in `src/index.ts` for CLI parsing and in `src/runner.ts` for filtering. This is considered acceptable given the benefits.
*   **Future Expansion:** This pattern can be easily extended to add more flags for other aspects of the evaluation (e.g., model selection, task filtering) in the future.
