import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ExperimentMetrics } from '../metrics/compute.js';
import type { ExperimentResult } from '../experiment/runner.js';

export interface WriteResultsConfig {
  outputDir: string;
  metrics: ExperimentMetrics;
  rawResult: ExperimentResult;
}

export function writeResults(config: WriteResultsConfig): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dirName = `${config.metrics.experimentId}-${timestamp}`;
  const resultDir = join(config.outputDir, dirName);

  mkdirSync(resultDir, { recursive: true });

  const metricsPath = join(resultDir, 'metrics.json');
  writeFileSync(metricsPath, JSON.stringify(config.metrics, null, 2));

  const rawPath = join(resultDir, 'raw-results.json');
  writeFileSync(rawPath, JSON.stringify(config.rawResult, null, 2));

  return resultDir;
}
