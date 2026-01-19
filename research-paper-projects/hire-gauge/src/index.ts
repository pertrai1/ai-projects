import type { Logger } from 'pino';
import chalk from 'chalk';
import type { ExperimentSpec } from './spec/schema.js';
import { generateProfiles, getExpectedProfileCount } from './dataset/factorial.js';
import { loadPromptTemplate } from './evaluation/prompt.js';
import { createLLMClient, type EvaluationResult } from './evaluation/llm.js';
import { createRun } from './tracking/run.js';
import { createArtifactWriter } from './tracking/artifacts.js';
import { computeVariance } from './metrics/variance.js';
import { computeMetrics, type Metrics } from './metrics/effects.js';
import { evaluateGates, type GateEvaluation } from './gates/evaluator.js';
import { generateReport } from './report/generator.js';

export interface AuditResult {
  runId: string;
  runDir: string;
  metrics: Metrics;
  gateEvaluation: GateEvaluation;
  success: boolean;
}

export async function runAudit(spec: ExperimentSpec, logger: Logger): Promise<AuditResult> {
  logger.info({ seed: spec.seed, mode: spec.mode }, 'Starting audit');

  const profiles = generateProfiles(spec);
  const expectedCount = getExpectedProfileCount(spec);

  if (profiles.length !== expectedCount) {
    throw new Error(`Profile count mismatch: got ${profiles.length}, expected ${expectedCount}`);
  }

  logger.info({ profileCount: profiles.length }, 'Generated profiles');

  const { runId, runDir, metadata } = createRun(spec, profiles.length);
  const artifacts = createArtifactWriter(runDir);

  logger.info({ runId, runDir }, 'Created run directory');

  artifacts.writeInputs(profiles);
  artifacts.writeMetadata(metadata);

  const promptTemplate = loadPromptTemplate(spec.prompt_version);
  logger.info({ promptVersion: spec.prompt_version }, 'Loaded prompt template');

  const llmClient = createLLMClient(spec.model, promptTemplate, logger);

  const results: EvaluationResult[] = [];
  const totalEvaluations = profiles.length * spec.repetitions;
  let completedCount = 0;
  let failedCount = 0;

  logger.info(
    { totalEvaluations, profiles: profiles.length, repetitions: spec.repetitions },
    'Starting evaluations'
  );

  for (const profile of profiles) {
    for (let rep = 1; rep <= spec.repetitions; rep++) {
      const pct = Math.round(((completedCount + 1) / totalEvaluations) * 100);
      const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
      process.stdout.write(
        `\r  ${chalk.cyan(bar)} ${chalk.yellow(completedCount + 1)}/${chalk.dim(totalEvaluations)} ${chalk.dim(`(${pct}%)`)}`
      );

      const result = await llmClient.evaluate(profile.id, profile.naturalLanguage, rep);
      results.push(result);

      artifacts.appendRawOutput(result);
      artifacts.appendParsedOutput(result);

      completedCount++;
      if (!result.success) failedCount++;
    }
  }

  process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear progress line

  logger.info({ completed: completedCount, failed: failedCount }, 'Evaluations complete');

  const varianceSummary = computeVariance(results, spec.thresholds.max_profile_variance);
  const metrics = computeMetrics(spec, profiles, varianceSummary, totalEvaluations, failedCount);

  artifacts.writeMetrics(metrics);
  logger.info('Computed and saved metrics');

  const gateEvaluation = evaluateGates(metrics, spec.thresholds);
  logger.info({ allPassed: gateEvaluation.allPassed }, 'Evaluated quality gates');

  const report = generateReport(metadata, metrics, gateEvaluation);
  artifacts.writeReport(report);
  logger.info({ runDir }, 'Generated report');

  return {
    runId,
    runDir,
    metrics,
    gateEvaluation,
    success: gateEvaluation.allPassed,
  };
}
