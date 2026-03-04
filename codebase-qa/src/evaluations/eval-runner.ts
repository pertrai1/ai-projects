/**
 * Phase 5: Evaluation Runner
 *
 * The main evaluation harness. Runs test cases through the FULL pipeline
 * (route -> retrieve -> synthesize) and measures quality at 4 levels.
 *
 * TEACHING MOMENT — Why a Harness, Not Just Tests?
 * ─────────────────────────────────────────────────
 * Unit tests verify that individual functions work correctly.
 * An evaluation harness measures how well the SYSTEM works as a whole.
 *
 * Think of it like this:
 * - Unit test: "Does the engine start?" (yes/no)
 * - Eval harness: "How fast does the car go, how much fuel does it use,
 *   and how comfortable is the ride?" (continuous metrics)
 *
 * The harness also supports filtering (by intent, difficulty, or ID) so you
 * can zoom into specific failure modes. And it saves results as JSON so you
 * can track improvement over time — like a dashboard for your RAG system.
 */

import fs from 'fs';
import path from 'path';
import {
  EvalTestCase,
  EvalMetrics,
  EvalReport,
  QueryIntentType,
} from '../types/index.js';
import { ingestCodebase } from '../scripts/ingest-codebase.js';
import { QueryRouter } from '../agents/query-router.js';
import { AdaptiveRetriever } from '../retrieval/adaptive-retriever.js';
import { ResponseSynthesizer } from '../agents/response-synthesizer.js';
import { calculateMetrics, DEFAULT_WEIGHTS, MetricWeights } from './metrics.js';

// ─── Configuration ──────────────────────────────────────────────────

export interface EvalRunnerOptions {
  /** Filter to only run test cases with this intent type */
  intentFilter?: string;
  /** Filter to only run test cases with this difficulty */
  difficultyFilter?: string;
  /** Run only this specific test case ID */
  idFilter?: string;
  /** Score threshold for "passing" (default 0.5) */
  passThreshold?: number;
  /** Custom metric weights */
  weights?: MetricWeights;
}

// ─── Main Runner ────────────────────────────────────────────────────

export async function runEvaluation(options: EvalRunnerOptions = {}): Promise<EvalReport> {
  const {
    intentFilter,
    difficultyFilter,
    idFilter,
    passThreshold = 0.5,
    weights = DEFAULT_WEIGHTS,
  } = options;

  console.log('\n' + '='.repeat(60));
  console.log('Phase 5: Evaluation Framework');
  console.log('='.repeat(60));

  // ── Step 1: Load test cases ──────────────────────────────────────
  const datasetPath = path.resolve(process.cwd(), 'evaluations/datasets/eval-test-cases.json');
  const rawData: Array<EvalTestCase | { _comment?: string }> = JSON.parse(
    fs.readFileSync(datasetPath, 'utf-8')
  );

  // Filter out comment objects (they have _comment but no id)
  let testCases = rawData.filter(
    (item): item is EvalTestCase => 'id' in item && typeof (item as EvalTestCase).id === 'string'
  );

  console.log(`\nLoaded ${testCases.length} test cases from dataset.`);

  // ── Step 2: Apply filters ────────────────────────────────────────
  if (idFilter) {
    testCases = testCases.filter(tc => tc.id === idFilter);
    console.log(`Filtered by ID '${idFilter}': ${testCases.length} case(s)`);
  }
  if (intentFilter) {
    const upper = intentFilter.toUpperCase();
    testCases = testCases.filter(tc => tc.expectedIntent === upper);
    console.log(`Filtered by intent '${upper}': ${testCases.length} case(s)`);
  }
  if (difficultyFilter) {
    testCases = testCases.filter(tc => tc.difficulty === difficultyFilter.toLowerCase());
    console.log(`Filtered by difficulty '${difficultyFilter}': ${testCases.length} case(s)`);
  }

  if (testCases.length === 0) {
    console.log('\nNo test cases match the given filters. Exiting.');
    return createEmptyReport(options);
  }

  // ── Step 3: Ingest the codebase ──────────────────────────────────
  // TEACHING MOMENT: We ingest once and reuse for all test cases.
  // In a real eval you might test different ingestion strategies too.
  console.log('\nIngesting codebase...');
  const { vectorStore } = await ingestCodebase('./', {
    maxFiles: 150,
    strategy: 'semantic-with-lookahead',
  });

  // ── Step 4: Initialize pipeline components ───────────────────────
  const router = new QueryRouter();
  const retriever = await AdaptiveRetriever.create(vectorStore);
  const synthesizer = new ResponseSynthesizer();

  // ── Step 5: Run each test case ───────────────────────────────────
  console.log(`\nRunning ${testCases.length} test cases...\n`);

  const results: Array<{
    testCase: EvalTestCase;
    metrics: EvalMetrics;
    failureReason?: string;
  }> = [];

  for (const testCase of testCases) {
    process.stdout.write(`  ${testCase.id}: "${testCase.query.substring(0, 50)}..." `);

    try {
      // Run the full pipeline
      const intent = await router.routeQuery(testCase.query);
      const search = await retriever.retrieve(testCase.query, intent);
      const response = await synthesizer.synthesize(testCase.query, intent, search.results);

      // Calculate metrics
      const metrics = calculateMetrics(
        testCase,
        intent.type as QueryIntentType,
        search.results,
        response,
        weights
      );

      // Determine pass/fail
      const passed = metrics.overallScore >= passThreshold;
      let failureReason: string | undefined;

      if (!passed) {
        failureReason = buildFailureReason(testCase, metrics);
      }

      results.push({ testCase, metrics, failureReason });

      // Print inline result
      const icon = passed ? '\u2713' : '\u2717';
      console.log(`${icon} (score: ${metrics.overallScore.toFixed(2)})`);
    } catch (error) {
      // If the pipeline throws, record as a failure
      const errMsg = error instanceof Error ? error.message : String(error);
      results.push({
        testCase,
        metrics: {
          intentCorrect: false,
          actualIntent: 'GENERAL',
          retrievalPrecision: 0,
          retrievalRecall: 0,
          retrievalMRR: 0,
          faithfulnessScore: 0,
          citationCoverage: 0,
          overallScore: 0,
        },
        failureReason: `Pipeline error: ${errMsg}`,
      });
      console.log(`\u2717 (ERROR: ${errMsg.substring(0, 60)})`);
    }
  }

  // ── Step 6: Build the report ─────────────────────────────────────
  const report = buildReport(results, passThreshold, weights, options);

  // ── Step 7: Print the report ─────────────────────────────────────
  printReport(report);

  // ── Step 8: Save results ─────────────────────────────────────────
  saveReport(report);

  return report;
}

// ─── Report Building ────────────────────────────────────────────────

function buildReport(
  results: Array<{ testCase: EvalTestCase; metrics: EvalMetrics; failureReason?: string }>,
  passThreshold: number,
  weights: MetricWeights,
  options: EvalRunnerOptions
): EvalReport {
  const totalCases = results.length;
  const passed = results.filter(r => r.metrics.overallScore >= passThreshold).length;
  const failed = totalCases - passed;

  // Intent accuracy by type
  const intentByType: Record<string, { correct: number; total: number; accuracy: number }> = {};
  for (const r of results) {
    const type = r.testCase.expectedIntent;
    if (!intentByType[type]) {
      intentByType[type] = { correct: 0, total: 0, accuracy: 0 };
    }
    intentByType[type].total++;
    if (r.metrics.intentCorrect) intentByType[type].correct++;
  }
  for (const type of Object.keys(intentByType)) {
    const entry = intentByType[type];
    entry.accuracy = entry.total > 0 ? entry.correct / entry.total : 0;
  }

  const intentCorrectTotal = results.filter(r => r.metrics.intentCorrect).length;

  // Retrieval averages
  const avgPrecision = avg(results.map(r => r.metrics.retrievalPrecision));
  const avgRecall = avg(results.map(r => r.metrics.retrievalRecall));
  const avgMRR = avg(results.map(r => r.metrics.retrievalMRR));

  // Citation averages
  const avgFaithfulness = avg(results.map(r => r.metrics.faithfulnessScore));
  const avgCoverage = avg(results.map(r => r.metrics.citationCoverage));

  // Overall
  const overallScore = avg(results.map(r => r.metrics.overallScore));

  return {
    timestamp: new Date().toISOString(),
    totalCases,
    passed,
    failed,
    intentAccuracy: {
      overall: totalCases > 0 ? intentCorrectTotal / totalCases : 0,
      byType: intentByType,
    },
    retrievalQuality: {
      avgPrecision: Number(avgPrecision.toFixed(4)),
      avgRecall: Number(avgRecall.toFixed(4)),
      avgMRR: Number(avgMRR.toFixed(4)),
    },
    citationQuality: {
      avgFaithfulness: Number(avgFaithfulness.toFixed(4)),
      avgCoverage: Number(avgCoverage.toFixed(4)),
    },
    overallScore: Number(overallScore.toFixed(4)),
    results,
    config: {
      passThreshold,
      weights,
      filters: {
        intent: options.intentFilter,
        difficulty: options.difficultyFilter,
        id: options.idFilter,
      },
    },
  };
}

// ─── Console Output ─────────────────────────────────────────────────

function printReport(report: EvalReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('Phase 5 Evaluation Results');
  console.log('='.repeat(60));
  console.log(`Test Cases: ${report.totalCases} | Passed: ${report.passed} | Failed: ${report.failed}`);

  // Intent accuracy
  const intentPct = (report.intentAccuracy.overall * 100).toFixed(1);
  const intentCorrectCount = Object.values(report.intentAccuracy.byType)
    .reduce((sum, v) => sum + v.correct, 0);
  console.log(`\nIntent Accuracy: ${intentPct}% (${intentCorrectCount}/${report.totalCases})`);

  const intentTypes = Object.entries(report.intentAccuracy.byType)
    .map(([type, data]) => `${type}: ${(data.accuracy * 100).toFixed(0)}%`)
    .join(' | ');
  console.log(`  ${intentTypes}`);

  // Retrieval quality
  console.log(`\nRetrieval Quality:`);
  console.log(`  Avg Precision@k: ${report.retrievalQuality.avgPrecision.toFixed(2)} | ` +
    `Avg Recall: ${report.retrievalQuality.avgRecall.toFixed(2)} | ` +
    `Avg MRR: ${report.retrievalQuality.avgMRR.toFixed(2)}`);

  // Citation quality
  console.log(`\nCitation Quality:`);
  console.log(`  Avg Faithfulness: ${report.citationQuality.avgFaithfulness.toFixed(2)} | ` +
    `Avg Coverage: ${report.citationQuality.avgCoverage.toFixed(2)}`);

  // Overall
  console.log(`\nOverall Score: ${report.overallScore.toFixed(2)}`);

  // Failures
  const failures = report.results.filter(r => r.failureReason);
  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  ${f.testCase.id}: ${f.failureReason}`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

// ─── Result Persistence ─────────────────────────────────────────────

function saveReport(report: EvalReport): void {
  const resultsDir = path.resolve(process.cwd(), 'evaluations/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Use ISO timestamp but replace colons for filesystem safety
  const timestamp = report.timestamp.replace(/:/g, '-').replace(/\./g, '-');
  const filePath = path.join(resultsDir, `${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  console.log(`Results saved to: ${filePath}`);
}

// ─── Helpers ────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function buildFailureReason(testCase: EvalTestCase, metrics: EvalMetrics): string {
  const reasons: string[] = [];

  if (!metrics.intentCorrect) {
    reasons.push(`Expected ${testCase.expectedIntent}, got ${metrics.actualIntent} (intent mismatch)`);
  }
  if (metrics.retrievalRecall < 0.5) {
    const expectedFiles = testCase.expectedChunks.map(c => c.filePath.split('/').pop()).join(', ');
    reasons.push(`Expected ${expectedFiles} in results, low recall (retrieval miss)`);
  }
  if (metrics.faithfulnessScore < 0.5) {
    reasons.push(`Faithfulness ${metrics.faithfulnessScore.toFixed(2)} (citation problem)`);
  }

  return reasons.length > 0 ? reasons.join('; ') : 'Score below threshold';
}

function createEmptyReport(options: EvalRunnerOptions): EvalReport {
  return {
    timestamp: new Date().toISOString(),
    totalCases: 0,
    passed: 0,
    failed: 0,
    intentAccuracy: { overall: 0, byType: {} },
    retrievalQuality: { avgPrecision: 0, avgRecall: 0, avgMRR: 0 },
    citationQuality: { avgFaithfulness: 0, avgCoverage: 0 },
    overallScore: 0,
    results: [],
    config: {
      passThreshold: options.passThreshold ?? 0.5,
      weights: options.weights ?? DEFAULT_WEIGHTS,
      filters: {
        intent: options.intentFilter,
        difficulty: options.difficultyFilter,
        id: options.idFilter,
      },
    },
  };
}

// ─── Direct execution support ───────────────────────────────────────
// Allows `npm run eval` to work (package.json points to dist/evaluations/eval-runner.js)

const isDirectExecution = process.argv[1]?.endsWith('eval-runner.js') ||
  process.argv[1]?.endsWith('eval-runner.ts');

if (isDirectExecution) {
  runEvaluation().catch(err => {
    console.error('Evaluation failed:', err);
    process.exit(1);
  });
}
