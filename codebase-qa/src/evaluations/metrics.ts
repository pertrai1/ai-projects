/**
 * Phase 5: Evaluation Metrics Engine
 *
 * TEACHING MOMENT — Why 4 Levels of Metrics?
 * ────────────────────────────────────────────
 * Imagine a relay race. The baton passes through 4 runners:
 *   1. Intent Router → "Did we understand the question?"
 *   2. Retriever     → "Did we find the right evidence?"
 *   3. Synthesizer   → "Did we cite the evidence faithfully?"
 *   4. Overall       → "Would a user be satisfied?"
 *
 * If Runner 1 drops the baton (wrong intent), Runners 2-3 might still look
 * OK because they did their job on the WRONG data. That's why we measure
 * each handoff independently. A system that gets 90% intent accuracy but
 * 50% retrieval recall has a retrieval problem, not an intent problem.
 *
 * This is the same principle behind "observability" in production systems:
 * you instrument each layer so you can pinpoint WHERE things break.
 */

import {
  QueryIntentType,
  RetrievedChunk,
  EvalTestCase,
  EvalMetrics,
  CodeQAResponse,
} from '../types/index.js';

// ─── Configuration ──────────────────────────────────────────────────

/**
 * Weights for combining the 3 metric levels into an overall score.
 *
 * WHY THESE WEIGHTS?
 * - Intent (0.25): Getting the intent wrong cascades into bad retrieval,
 *   but a wrong intent with good retrieval can still produce a decent answer.
 * - Retrieval (0.45): The most impactful stage. If you don't find the right
 *   code, no amount of good prompting will save you.
 * - Citation (0.30): Faithfulness matters a lot for trust. A correct but
 *   uncited answer is worse than an incorrect answer you can verify.
 */
export interface MetricWeights {
  intent: number;
  retrieval: number;
  citation: number;
}

export const DEFAULT_WEIGHTS: MetricWeights = {
  intent: 0.25,
  retrieval: 0.45,
  citation: 0.30,
};

// ─── Level 1: Intent Accuracy ───────────────────────────────────────

/**
 * Did the QueryRouter classify the intent correctly?
 *
 * This is the simplest metric: binary correct/incorrect.
 * But aggregating it by intent type reveals patterns.
 * If DEBUGGING accuracy is 60% but LOCATION is 100%, we know
 * exactly where to improve the keyword heuristics.
 */
export function calculateIntentAccuracy(
  expected: QueryIntentType,
  actual: QueryIntentType
): boolean {
  return expected === actual;
}

// ─── Level 2: Retrieval Quality ─────────────────────────────────────

/**
 * Precision@k: What fraction of retrieved chunks are relevant?
 *
 * TEACHING MOMENT: Precision answers "How much noise is in my results?"
 * If I retrieve 10 chunks but only 3 are relevant, precision = 0.3.
 * High precision means the user doesn't have to wade through junk.
 *
 * We determine "relevant" by checking if the chunk's file path matches
 * any of the expected file paths. This is a coarse measure — in a real
 * system you'd want human-labeled relevance judgments.
 *
 * @param retrieved - The chunks actually returned by the retriever
 * @param expectedPaths - The file paths we expected to see in results
 */
export function calculatePrecisionAtK(
  retrieved: RetrievedChunk[],
  expectedPaths: string[]
): number {
  if (retrieved.length === 0) return 0;
  if (expectedPaths.length === 0) return 0; // No expected paths = can't measure

  const normalizedExpected = new Set(expectedPaths.map(normalizePath));

  const relevant = retrieved.filter(chunk =>
    normalizedExpected.has(normalizePath(chunk.metadata.filePath))
  );

  return relevant.length / retrieved.length;
}

/**
 * Recall: What fraction of expected chunks were actually retrieved?
 *
 * TEACHING MOMENT: Recall answers "Did we miss anything important?"
 * If there are 3 expected files and we only found 2, recall = 0.67.
 * Low recall means important context is being lost.
 *
 * There's a classic tension between precision and recall:
 * - Retrieve MORE chunks → higher recall, lower precision (more noise)
 * - Retrieve FEWER chunks → higher precision, lower recall (miss stuff)
 * The k parameter in retrieval strategies is the main knob for this.
 */
export function calculateRecall(
  retrieved: RetrievedChunk[],
  expectedPaths: string[]
): number {
  if (expectedPaths.length === 0) return 1.0; // Nothing to find = perfect recall

  const normalizedExpected = new Set(expectedPaths.map(normalizePath));
  const retrievedPaths = new Set(retrieved.map(c => normalizePath(c.metadata.filePath)));

  let found = 0;
  Array.from(normalizedExpected).forEach(expected => {
    if (retrievedPaths.has(expected)) found++;
  });

  return found / normalizedExpected.size;
}

/**
 * MRR (Mean Reciprocal Rank): How high did the FIRST relevant result rank?
 *
 * TEACHING MOMENT: MRR captures "How much scrolling does the user have to do?"
 * If the first relevant result is at position 1, MRR = 1.0 (perfect).
 * If it's at position 3, MRR = 1/3 = 0.33.
 * If no relevant result exists, MRR = 0.
 *
 * This is especially important for code Q&A because the synthesizer
 * typically only uses the top 3-4 chunks. A relevant result at position 8
 * might as well not exist.
 */
export function calculateMRR(
  retrieved: RetrievedChunk[],
  expectedPaths: string[]
): number {
  if (expectedPaths.length === 0) return 1.0;
  if (retrieved.length === 0) return 0;

  const normalizedExpected = new Set(expectedPaths.map(normalizePath));

  for (let i = 0; i < retrieved.length; i++) {
    if (normalizedExpected.has(normalizePath(retrieved[i].metadata.filePath))) {
      return 1 / (i + 1); // 1-indexed rank
    }
  }

  return 0; // No relevant result found
}

// ─── Level 3: Citation Quality ──────────────────────────────────────

/**
 * Citation Coverage: Do the citations reference the expected files?
 *
 * This is different from retrieval recall because it measures what the
 * SYNTHESIZER chose to cite, not what the RETRIEVER found. The synthesizer
 * might retrieve the right chunks but not cite them (or cite wrong ones).
 *
 * @param response - The full pipeline response with citations
 * @param expectedCitationPaths - Files we expected to see cited
 */
export function calculateCitationCoverage(
  response: CodeQAResponse,
  expectedCitationPaths: string[]
): number {
  if (!expectedCitationPaths || expectedCitationPaths.length === 0) return 1.0;

  const normalizedExpected = new Set(expectedCitationPaths.map(normalizePath));
  const citedPaths = new Set(response.citations.map(c => normalizePath(c.filePath)));

  let found = 0;
  Array.from(normalizedExpected).forEach(expected => {
    if (citedPaths.has(expected)) found++;
  });

  return found / normalizedExpected.size;
}

// ─── Level 4: Overall Composite Score ───────────────────────────────

/**
 * Calculate the full set of metrics for a single test case.
 *
 * This is the main entry point — it runs all 4 levels and returns
 * a unified EvalMetrics object.
 */
export function calculateMetrics(
  testCase: EvalTestCase,
  actualIntent: QueryIntentType,
  retrieved: RetrievedChunk[],
  response: CodeQAResponse,
  weights: MetricWeights = DEFAULT_WEIGHTS
): EvalMetrics {
  // Level 1: Intent
  const intentCorrect = calculateIntentAccuracy(testCase.expectedIntent, actualIntent);

  // Level 2: Retrieval
  const expectedPaths = testCase.expectedChunks.map(c => c.filePath);
  const retrievalPrecision = calculatePrecisionAtK(retrieved, expectedPaths);
  const retrievalRecall = calculateRecall(retrieved, expectedPaths);
  const retrievalMRR = calculateMRR(retrieved, expectedPaths);

  // Level 3: Citation
  const faithfulnessScore = response.validation?.faithfulnessScore ?? 0;
  const citationCoverage = calculateCitationCoverage(
    response,
    testCase.expectedCitationPaths ?? []
  );

  // Level 4: Weighted composite
  // TEACHING MOMENT: We convert boolean intentCorrect to 0/1 for the weighted average.
  // We average the sub-metrics within each level before weighting.
  const intentScore = intentCorrect ? 1.0 : 0.0;
  const retrievalScore = (retrievalPrecision + retrievalRecall + retrievalMRR) / 3;
  const citationScore = (faithfulnessScore + citationCoverage) / 2;

  const overallScore =
    weights.intent * intentScore +
    weights.retrieval * retrievalScore +
    weights.citation * citationScore;

  return {
    intentCorrect,
    actualIntent,
    retrievalPrecision,
    retrievalRecall,
    retrievalMRR,
    faithfulnessScore,
    citationCoverage,
    overallScore: Number(overallScore.toFixed(4)),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Normalize file paths for comparison.
 * Strips leading './' and lowercases for consistent matching.
 */
function normalizePath(p: string): string {
  return p.replace(/^\.\//, '').toLowerCase();
}
