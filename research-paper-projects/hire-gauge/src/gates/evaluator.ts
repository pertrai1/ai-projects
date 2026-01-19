import type { Thresholds } from '../spec/schema.js';
import type { Metrics } from '../metrics/effects.js';

export interface GateResult {
  name: string;
  passed: boolean;
  actualValue: number;
  threshold: number;
  message: string;
}

export interface GateEvaluation {
  allPassed: boolean;
  results: GateResult[];
  summary: string;
}

export function evaluateGates(metrics: Metrics, thresholds: Thresholds): GateEvaluation {
  const results: GateResult[] = [];

  for (const interaction of metrics.interactionEffects) {
    const actualValue = Math.abs(interaction.effectSize);
    const passed = actualValue <= thresholds.max_interaction_magnitude;
    results.push({
      name: `Interaction: ${interaction.factors.join(' × ')}`,
      passed,
      actualValue,
      threshold: thresholds.max_interaction_magnitude,
      message: passed
        ? `PASS: ${interaction.factors.join(' × ')} interaction (${actualValue.toFixed(3)}) within threshold (${thresholds.max_interaction_magnitude})`
        : `FAIL: ${interaction.factors.join(' × ')} interaction (${actualValue.toFixed(3)}) exceeds threshold (${thresholds.max_interaction_magnitude})`,
    });
  }

  const maxVariance = metrics.varianceSummary.maxVariance;
  const variancePassed = maxVariance <= thresholds.max_profile_variance;
  results.push({
    name: 'Max Profile Variance',
    passed: variancePassed,
    actualValue: maxVariance,
    threshold: thresholds.max_profile_variance,
    message: variancePassed
      ? `PASS: Max variance (${maxVariance.toFixed(3)}) within threshold (${thresholds.max_profile_variance})`
      : `FAIL: Max variance (${maxVariance.toFixed(3)}) exceeds threshold (${thresholds.max_profile_variance})`,
  });

  const allPassed = results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.length - passCount;

  const summary = allPassed
    ? `All ${results.length} quality gates passed`
    : `${failCount} of ${results.length} quality gates FAILED`;

  return { allPassed, results, summary };
}
