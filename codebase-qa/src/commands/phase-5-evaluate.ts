/**
 * Phase 5 CLI Command: Evaluation Framework
 *
 * Runs the full evaluation pipeline and reports results.
 *
 * TEACHING MOMENT — Why a Separate Command?
 * ──────────────────────────────────────────
 * The eval runner (eval-runner.ts) contains the logic. This file is just
 * the CLI "adapter" — it translates command-line flags into function args.
 *
 * This separation of concerns means:
 * 1. The eval runner can be imported and used programmatically (e.g., in CI)
 * 2. The CLI can change without touching the core logic
 * 3. Testing is easier (test the runner, not the CLI parsing)
 *
 * It's the same pattern as how Express routes are thin wrappers around
 * service functions. The "glue" layer should be as thin as possible.
 */

import { runEvaluation, EvalRunnerOptions } from '../evaluations/eval-runner.js';

export async function runPhase5Evaluate(options: {
  intent?: string;
  difficulty?: string;
  id?: string;
}): Promise<void> {
  const evalOptions: EvalRunnerOptions = {
    intentFilter: options.intent,
    difficultyFilter: options.difficulty,
    idFilter: options.id,
  };

  await runEvaluation(evalOptions);
}
