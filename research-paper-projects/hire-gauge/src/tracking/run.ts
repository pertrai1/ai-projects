import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import type { ExperimentSpec } from '../spec/schema.js';

export interface RunMetadata {
  runId: string;
  timestamp: string;
  model: {
    provider: string;
    name: string;
    temperature: number;
  };
  promptVersion: string;
  seed: number;
  repetitions: number;
  mode: string;
  profileCount: number;
  gitCommit: string | null;
  thresholds: {
    max_interaction_magnitude: number;
    max_profile_variance: number;
  };
}

function generateRunId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `run-${date}-${time}-${random}`;
}

function getGitCommit(): string | null {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function createRun(
  spec: ExperimentSpec,
  profileCount: number,
  runsDir: string = 'runs'
): { runId: string; runDir: string; metadata: RunMetadata } {
  const runId = generateRunId();
  const runDir = join(runsDir, runId);

  if (!existsSync(runsDir)) {
    mkdirSync(runsDir, { recursive: true });
  }
  mkdirSync(runDir, { recursive: true });

  const metadata: RunMetadata = {
    runId,
    timestamp: new Date().toISOString(),
    model: {
      provider: spec.model.provider,
      name: spec.model.name,
      temperature: spec.model.temperature,
    },
    promptVersion: spec.prompt_version,
    seed: spec.seed,
    repetitions: spec.repetitions,
    mode: spec.mode,
    profileCount,
    gitCommit: getGitCommit(),
    thresholds: spec.thresholds,
  };

  return { runId, runDir, metadata };
}
