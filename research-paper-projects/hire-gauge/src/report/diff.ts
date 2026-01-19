import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metrics, MainEffect, InteractionEffect } from '../metrics/effects.js';
import type { RunMetadata } from '../tracking/run.js';

export interface EffectDelta {
  name: string;
  oldValue: number;
  newValue: number;
  delta: number;
  isRegression: boolean;
}

export interface DiffReport {
  runA: { id: string; promptVersion: string };
  runB: { id: string; promptVersion: string };
  mainEffectDeltas: EffectDelta[];
  interactionEffectDeltas: EffectDelta[];
  regressions: string[];
  summary: string;
}

function loadRunData(runDir: string): { metadata: RunMetadata; metrics: Metrics } {
  const metadataPath = join(runDir, 'run_metadata.json');
  const metricsPath = join(runDir, 'metrics.json');

  const metadata: RunMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  const metrics: Metrics = JSON.parse(readFileSync(metricsPath, 'utf-8'));

  return { metadata, metrics };
}

function computeMainEffectDeltas(
  oldEffects: MainEffect[],
  newEffects: MainEffect[],
  regressionThreshold: number
): EffectDelta[] {
  const deltas: EffectDelta[] = [];
  const oldByFactor = new Map(oldEffects.map((e) => [e.factor, e]));

  for (const newEffect of newEffects) {
    const oldEffect = oldByFactor.get(newEffect.factor);
    const oldValue = oldEffect?.effectSize ?? 0;
    const newValue = newEffect.effectSize;
    const delta = newValue - oldValue;

    deltas.push({
      name: newEffect.factor,
      oldValue,
      newValue,
      delta,
      isRegression: Math.abs(delta) > regressionThreshold,
    });
  }

  return deltas;
}

function computeInteractionDeltas(
  oldEffects: InteractionEffect[],
  newEffects: InteractionEffect[],
  regressionThreshold: number
): EffectDelta[] {
  const deltas: EffectDelta[] = [];
  const oldByFactors = new Map(oldEffects.map((e) => [e.factors.join('×'), e]));

  for (const newEffect of newEffects) {
    const key = newEffect.factors.join('×');
    const oldEffect = oldByFactors.get(key);
    const oldValue = oldEffect?.effectSize ?? 0;
    const newValue = newEffect.effectSize;
    const delta = newValue - oldValue;

    const isRegression =
      Math.abs(newValue) > Math.abs(oldValue) && Math.abs(delta) > regressionThreshold;

    deltas.push({
      name: newEffect.factors.join(' × '),
      oldValue,
      newValue,
      delta,
      isRegression,
    });
  }

  return deltas;
}

export function generateDiff(
  runDirA: string,
  runDirB: string,
  regressionThreshold: number = 0.1
): DiffReport {
  const dataA = loadRunData(runDirA);
  const dataB = loadRunData(runDirB);

  const mainEffectDeltas = computeMainEffectDeltas(
    dataA.metrics.mainEffects,
    dataB.metrics.mainEffects,
    regressionThreshold
  );

  const interactionEffectDeltas = computeInteractionDeltas(
    dataA.metrics.interactionEffects,
    dataB.metrics.interactionEffects,
    regressionThreshold
  );

  const regressions: string[] = [];
  for (const delta of [...mainEffectDeltas, ...interactionEffectDeltas]) {
    if (delta.isRegression) {
      regressions.push(
        `${delta.name}: ${delta.oldValue.toFixed(3)} → ${delta.newValue.toFixed(3)} (Δ ${delta.delta >= 0 ? '+' : ''}${delta.delta.toFixed(3)})`
      );
    }
  }

  const summary =
    regressions.length === 0
      ? 'No significant regressions detected'
      : `⚠️ ${regressions.length} potential regression(s) detected`;

  return {
    runA: { id: dataA.metadata.runId, promptVersion: dataA.metadata.promptVersion },
    runB: { id: dataB.metadata.runId, promptVersion: dataB.metadata.promptVersion },
    mainEffectDeltas,
    interactionEffectDeltas,
    regressions,
    summary,
  };
}

export function formatDiffReport(diff: DiffReport): string {
  const lines: string[] = [];

  lines.push('# Prompt Regression Report');
  lines.push('');
  lines.push('## Comparison');
  lines.push('');
  lines.push(`- **Run A**: ${diff.runA.id} (prompt: ${diff.runA.promptVersion})`);
  lines.push(`- **Run B**: ${diff.runB.id} (prompt: ${diff.runB.promptVersion})`);
  lines.push('');

  lines.push(`## Summary`);
  lines.push('');
  lines.push(`**${diff.summary}**`);
  lines.push('');

  if (diff.regressions.length > 0) {
    lines.push('### Regressions');
    lines.push('');
    for (const reg of diff.regressions) {
      lines.push(`- ⚠️ ${reg}`);
    }
    lines.push('');
  }

  lines.push('## Main Effect Changes');
  lines.push('');
  lines.push('| Factor | Old | New | Delta |');
  lines.push('|--------|-----|-----|-------|');
  for (const delta of diff.mainEffectDeltas) {
    const deltaStr = delta.delta >= 0 ? `+${delta.delta.toFixed(3)}` : delta.delta.toFixed(3);
    lines.push(`| ${delta.name} | ${delta.oldValue.toFixed(3)} | ${delta.newValue.toFixed(3)} | ${deltaStr} |`);
  }
  lines.push('');

  lines.push('## Interaction Effect Changes');
  lines.push('');
  lines.push('| Interaction | Old | New | Delta |');
  lines.push('|-------------|-----|-----|-------|');
  for (const delta of diff.interactionEffectDeltas) {
    const deltaStr = delta.delta >= 0 ? `+${delta.delta.toFixed(3)}` : delta.delta.toFixed(3);
    lines.push(`| ${delta.name} | ${delta.oldValue.toFixed(3)} | ${delta.newValue.toFixed(3)} | ${deltaStr} |`);
  }

  return lines.join('\n');
}
