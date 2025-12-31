---
change-id: add-cli-flags-for-reasoning-output
---

## Tasks

This document outlines the tasks required to implement CLI flags for controlling reasoning output.

### Phase 1: CLI Argument Parsing with Commander.js

1.  **Modify `src/index.ts` to import `commander`:**
    *   Add `import { Command } from 'commander';`
2.  **Initialize `commander` program:**
    *   Create a new `Command()` instance.
3.  **Define CLI options for each prompt type:**
    *   Add options like `.option('--standard', 'Include Standard Prompt')` for each of the five prompt types.
    *   Ensure these options are boolean flags.
4.  **Parse CLI arguments:**
    *   Call `program.parse(process.argv)`.
5.  **Extract parsed options:**
    *   Get the options object from `program.opts()`.
6.  **Pass options to `run` function:**
    *   Modify the `main` function to pass the extracted options to `run()`.
    *   Example: `await run(options);`

### Phase 2: Filtering Prompt Types in `src/runner.ts`

1.  **Update `run` function signature:**
    *   Modify `export const run = async () => { ... }` to `export const run = async (options: { [key: string]: boolean }) => { ... }`.
2.  **Implement prompt type filtering logic:**
    *   Inside the `run` function, before the `for (const promptType of promptTypes)` loop, filter the `promptTypes` array based on the `options` object.
    *   If no prompt type flags are set (i.e., `options` is empty or all relevant flags are `false`), default to including all prompt types.
    *   Otherwise, include only the prompt types for which the corresponding flag is `true`.
3.  **Update `extractAnswer` call in `src/runner.ts`:**
    *   The `extractAnswer` function now requires `expectedAnswer`. Ensure it's passed correctly. (This was already done in previous steps, but worth re-checking).

### Phase 3: Verification and Testing

1.  **Manual Testing:**
    *   Run `npm start` (should run all prompt types).
    *   Run `npm start -- --standard` (should only run Standard Prompt).
    *   Run `npm start -- --cot --verbose-cot` (should only run CoT and Verbose CoT).
    *   Run `npm start -- --non-existent-flag` (should show `commander.js` error for unknown option).
2.  **Build and Type Check:**
    *   Run `npm run build` and `npm run type-check` to ensure no TypeScript errors.

### Phase 4: Documentation

1.  **Update `README.md`:**
    *   Add a section explaining the new CLI flags and their usage.
