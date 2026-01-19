import { writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Profile } from '../dataset/profile.js';
import type { EvaluationResult } from '../evaluation/llm.js';
import type { RunMetadata } from './run.js';
import type { Metrics } from '../metrics/effects.js';

export interface ArtifactWriter {
  writeInputs(profiles: Profile[]): void;
  appendRawOutput(result: EvaluationResult): void;
  appendParsedOutput(result: EvaluationResult): void;
  writeMetrics(metrics: Metrics): void;
  writeReport(report: string): void;
  writeMetadata(metadata: RunMetadata): void;
}

export function createArtifactWriter(runDir: string): ArtifactWriter {
  const inputsPath = join(runDir, 'inputs.jsonl');
  const rawOutputsPath = join(runDir, 'raw_outputs.jsonl');
  const parsedOutputsPath = join(runDir, 'parsed_outputs.jsonl');
  const metricsPath = join(runDir, 'metrics.json');
  const reportPath = join(runDir, 'report.md');
  const metadataPath = join(runDir, 'run_metadata.json');

  return {
    writeInputs(profiles: Profile[]): void {
      const lines = profiles.map((p) =>
        JSON.stringify({
          id: p.id,
          index: p.index,
          factors: p.factors,
          naturalLanguage: p.naturalLanguage,
        })
      );
      writeFileSync(inputsPath, lines.join('\n') + '\n');
    },

    appendRawOutput(result: EvaluationResult): void {
      const line = JSON.stringify({
        profileId: result.profileId,
        repetition: result.repetition,
        rawResponse: result.rawResponse,
        success: result.success,
        retryCount: result.retryCount,
        error: result.error,
      });
      appendFileSync(rawOutputsPath, line + '\n');
    },

    appendParsedOutput(result: EvaluationResult): void {
      const line = JSON.stringify({
        profileId: result.profileId,
        repetition: result.repetition,
        score: result.output?.score ?? null,
        justification: result.output?.justification ?? null,
        success: result.success,
      });
      appendFileSync(parsedOutputsPath, line + '\n');
    },

    writeMetrics(metrics: Metrics): void {
      writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    },

    writeReport(report: string): void {
      writeFileSync(reportPath, report);
    },

    writeMetadata(metadata: RunMetadata): void {
      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    },
  };
}
