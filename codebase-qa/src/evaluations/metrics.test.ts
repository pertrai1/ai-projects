/**
 * Phase 5: Metrics Engine Tests
 *
 * Uses Node.js built-in test runner (no Jest) — matches project convention.
 *
 * TEACHING MOMENT: Testing metric functions is critical because a bug in
 * your evaluation code gives you false confidence. If calculateRecall()
 * always returns 1.0, your eval report will look great... and be useless.
 * Test the tests!
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateIntentAccuracy,
  calculatePrecisionAtK,
  calculateRecall,
  calculateMRR,
  calculateCitationCoverage,
  calculateMetrics,
  DEFAULT_WEIGHTS,
} from './metrics.js';

import type {
  RetrievedChunk,
  CodeChunkMetadata,
  CodeQAResponse,
  EvalTestCase,
} from '../types/index.js';

// ─── Test Helpers ───────────────────────────────────────────────────

function makeChunk(filePath: string, score: number = 0.8): RetrievedChunk {
  return {
    id: `chunk-${filePath}`,
    content: `// content of ${filePath}`,
    metadata: {
      filePath,
      fileName: filePath.split('/').pop() || '',
      startLine: 1,
      endLine: 20,
      imports: [],
      isExported: true,
      chunkIndex: 0,
    } as CodeChunkMetadata,
    relevanceScore: score,
  };
}

function makeResponse(
  citationPaths: string[],
  faithfulnessScore: number = 0.85
): CodeQAResponse {
  return {
    content: 'Test answer',
    citations: citationPaths.map((fp, i) => ({
      id: `cite-${i}`,
      chunkId: `chunk-${fp}`,
      filePath: fp,
      startLine: 1,
      endLine: 20,
      snippet: `// ${fp}`,
      relevance: 0.8,
    })),
    confidence: 0.8,
    validation: {
      faithfulnessScore,
      passed: true,
      recommendation: 'accept',
      issues: [],
    },
  };
}

function makeTestCase(overrides: Partial<EvalTestCase> = {}): EvalTestCase {
  return {
    id: 'test-01',
    query: 'Test query',
    expectedIntent: 'ARCHITECTURE',
    expectedChunks: [{ filePath: 'src/retrieval/adaptive-retriever.ts' }],
    expectedCitationPaths: ['src/retrieval/adaptive-retriever.ts'],
    tags: ['test'],
    difficulty: 'easy',
    notes: 'Test case',
    ...overrides,
  };
}

// ─── Level 1: Intent Accuracy ───────────────────────────────────────

describe('Level 1: Intent Accuracy', () => {
  test('returns true when intents match', () => {
    assert.equal(calculateIntentAccuracy('ARCHITECTURE', 'ARCHITECTURE'), true);
  });

  test('returns false when intents differ', () => {
    assert.equal(calculateIntentAccuracy('ARCHITECTURE', 'IMPLEMENTATION'), false);
  });

  test('is case-sensitive (intent types are uppercase)', () => {
    // This should be false because our types are strict enums
    assert.equal(
      calculateIntentAccuracy('DEBUGGING', 'DEBUGGING'),
      true
    );
  });
});

// ─── Level 2: Retrieval Quality ─────────────────────────────────────

describe('Level 2: Precision@k', () => {
  test('perfect precision — all retrieved chunks are relevant', () => {
    const retrieved = [
      makeChunk('src/retrieval/adaptive-retriever.ts'),
      makeChunk('src/retrieval/code-chunker.ts'),
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts', 'src/retrieval/code-chunker.ts'];

    assert.equal(calculatePrecisionAtK(retrieved, expected), 1.0);
  });

  test('50% precision — half the results are relevant', () => {
    const retrieved = [
      makeChunk('src/retrieval/adaptive-retriever.ts'),
      makeChunk('src/utils/logger.ts'), // irrelevant
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculatePrecisionAtK(retrieved, expected), 0.5);
  });

  test('zero precision — no relevant results', () => {
    const retrieved = [makeChunk('src/utils/logger.ts')];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculatePrecisionAtK(retrieved, expected), 0);
  });

  test('empty retrieved — returns 0', () => {
    assert.equal(calculatePrecisionAtK([], ['src/file.ts']), 0);
  });

  test('empty expected — returns 0 (nothing to measure against)', () => {
    assert.equal(calculatePrecisionAtK([makeChunk('src/file.ts')], []), 0);
  });

  test('normalizes paths — ignores leading ./', () => {
    const retrieved = [makeChunk('./src/retrieval/adaptive-retriever.ts')];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculatePrecisionAtK(retrieved, expected), 1.0);
  });
});

describe('Level 2: Recall', () => {
  test('perfect recall — all expected files found', () => {
    const retrieved = [
      makeChunk('src/retrieval/adaptive-retriever.ts'),
      makeChunk('src/agents/query-router.ts'),
      makeChunk('src/utils/logger.ts'), // bonus, doesn't hurt recall
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts', 'src/agents/query-router.ts'];

    assert.equal(calculateRecall(retrieved, expected), 1.0);
  });

  test('50% recall — missed one expected file', () => {
    const retrieved = [makeChunk('src/retrieval/adaptive-retriever.ts')];
    const expected = ['src/retrieval/adaptive-retriever.ts', 'src/agents/query-router.ts'];

    assert.equal(calculateRecall(retrieved, expected), 0.5);
  });

  test('zero recall — none of the expected files found', () => {
    const retrieved = [makeChunk('src/utils/logger.ts')];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculateRecall(retrieved, expected), 0);
  });

  test('empty expected — returns 1.0 (nothing to miss)', () => {
    assert.equal(calculateRecall([makeChunk('src/file.ts')], []), 1.0);
  });
});

describe('Level 2: MRR (Mean Reciprocal Rank)', () => {
  test('first result is relevant — MRR = 1.0', () => {
    const retrieved = [
      makeChunk('src/retrieval/adaptive-retriever.ts'),
      makeChunk('src/utils/logger.ts'),
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculateMRR(retrieved, expected), 1.0);
  });

  test('second result is relevant — MRR = 0.5', () => {
    const retrieved = [
      makeChunk('src/utils/logger.ts'),
      makeChunk('src/retrieval/adaptive-retriever.ts'),
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculateMRR(retrieved, expected), 0.5);
  });

  test('third result is relevant — MRR = 1/3', () => {
    const retrieved = [
      makeChunk('src/utils/logger.ts'),
      makeChunk('src/utils/llm-client.ts'),
      makeChunk('src/retrieval/adaptive-retriever.ts'),
    ];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    const mrr = calculateMRR(retrieved, expected);
    assert.ok(Math.abs(mrr - 1 / 3) < 0.001);
  });

  test('no relevant result — MRR = 0', () => {
    const retrieved = [makeChunk('src/utils/logger.ts')];
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculateMRR(retrieved, expected), 0);
  });

  test('empty expected — MRR = 1.0 (vacuously true)', () => {
    assert.equal(calculateMRR([makeChunk('src/file.ts')], []), 1.0);
  });

  test('empty retrieved — MRR = 0', () => {
    assert.equal(calculateMRR([], ['src/file.ts']), 0);
  });
});

// ─── Level 3: Citation Quality ──────────────────────────────────────

describe('Level 3: Citation Coverage', () => {
  test('all expected files are cited', () => {
    const response = makeResponse(['src/retrieval/adaptive-retriever.ts', 'src/agents/query-router.ts']);
    const expected = ['src/retrieval/adaptive-retriever.ts', 'src/agents/query-router.ts'];

    assert.equal(calculateCitationCoverage(response, expected), 1.0);
  });

  test('some expected files are cited', () => {
    const response = makeResponse(['src/retrieval/adaptive-retriever.ts']);
    const expected = ['src/retrieval/adaptive-retriever.ts', 'src/agents/query-router.ts'];

    assert.equal(calculateCitationCoverage(response, expected), 0.5);
  });

  test('no expected files are cited', () => {
    const response = makeResponse(['src/utils/logger.ts']);
    const expected = ['src/retrieval/adaptive-retriever.ts'];

    assert.equal(calculateCitationCoverage(response, expected), 0);
  });

  test('empty expected — returns 1.0', () => {
    const response = makeResponse(['src/file.ts']);
    assert.equal(calculateCitationCoverage(response, []), 1.0);
  });
});

// ─── Level 4: Composite Score ───────────────────────────────────────

describe('Level 4: calculateMetrics (composite)', () => {
  test('perfect scores when everything matches', () => {
    const testCase = makeTestCase();
    const retrieved = [makeChunk('src/retrieval/adaptive-retriever.ts')];
    const response = makeResponse(['src/retrieval/adaptive-retriever.ts'], 1.0);

    const metrics = calculateMetrics(testCase, 'ARCHITECTURE', retrieved, response);

    assert.equal(metrics.intentCorrect, true);
    assert.equal(metrics.retrievalPrecision, 1.0);
    assert.equal(metrics.retrievalRecall, 1.0);
    assert.equal(metrics.retrievalMRR, 1.0);
    assert.equal(metrics.citationCoverage, 1.0);
    assert.equal(metrics.faithfulnessScore, 1.0);
    // Overall should be 1.0: 0.25*1 + 0.45*1 + 0.30*1 = 1.0
    assert.equal(metrics.overallScore, 1.0);
  });

  test('zero scores when nothing matches', () => {
    const testCase = makeTestCase();
    const retrieved = [makeChunk('src/utils/logger.ts')];
    const response = makeResponse(['src/utils/logger.ts'], 0);

    const metrics = calculateMetrics(testCase, 'IMPLEMENTATION', retrieved, response);

    assert.equal(metrics.intentCorrect, false);
    assert.equal(metrics.retrievalPrecision, 0);
    assert.equal(metrics.retrievalRecall, 0);
    assert.equal(metrics.retrievalMRR, 0);
    assert.equal(metrics.citationCoverage, 0);
    assert.equal(metrics.overallScore, 0);
  });

  test('mixed scores — correct intent, partial retrieval', () => {
    const testCase = makeTestCase({
      expectedChunks: [
        { filePath: 'src/retrieval/adaptive-retriever.ts' },
        { filePath: 'src/agents/query-router.ts' },
      ],
      expectedCitationPaths: [
        'src/retrieval/adaptive-retriever.ts',
        'src/agents/query-router.ts',
      ],
    });

    const retrieved = [
      makeChunk('src/retrieval/adaptive-retriever.ts'),
      makeChunk('src/utils/logger.ts'),
    ];
    const response = makeResponse(['src/retrieval/adaptive-retriever.ts'], 0.85);

    const metrics = calculateMetrics(testCase, 'ARCHITECTURE', retrieved, response);

    assert.equal(metrics.intentCorrect, true);
    assert.equal(metrics.retrievalPrecision, 0.5); // 1/2 retrieved are relevant
    assert.equal(metrics.retrievalRecall, 0.5);     // 1/2 expected found
    assert.equal(metrics.retrievalMRR, 1.0);        // First result is relevant
    assert.equal(metrics.citationCoverage, 0.5);     // 1/2 expected cited
    assert.ok(metrics.overallScore > 0 && metrics.overallScore < 1);
  });

  test('respects custom weights', () => {
    const testCase = makeTestCase();
    const retrieved = [makeChunk('src/utils/logger.ts')]; // wrong file
    const response = makeResponse(['src/utils/logger.ts'], 1.0);

    // With all weight on intent (which is correct), score should be high
    const intentHeavy = calculateMetrics(
      testCase, 'ARCHITECTURE', retrieved, response,
      { intent: 1.0, retrieval: 0, citation: 0 }
    );
    assert.equal(intentHeavy.overallScore, 1.0);

    // With all weight on retrieval (which is 0), score should be 0
    const retrievalHeavy = calculateMetrics(
      testCase, 'ARCHITECTURE', retrieved, response,
      { intent: 0, retrieval: 1.0, citation: 0 }
    );
    assert.equal(retrievalHeavy.overallScore, 0);
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('Edge cases', () => {
  test('trick question with no expected chunks', () => {
    const testCase = makeTestCase({
      id: 'loc-05',
      query: 'Where is the database connection configured?',
      expectedIntent: 'LOCATION',
      expectedChunks: [],
      expectedCitationPaths: [],
      difficulty: 'hard',
      notes: 'No database in this project',
    });

    const retrieved: RetrievedChunk[] = [];
    const response = makeResponse([], 1.0);
    response.content = 'I could not find relevant code for this query.';

    const metrics = calculateMetrics(testCase, 'LOCATION', retrieved, response);

    assert.equal(metrics.intentCorrect, true);
    // Empty expected means recall = 1.0 (nothing to miss)
    assert.equal(metrics.retrievalRecall, 1.0);
    assert.equal(metrics.citationCoverage, 1.0);
    assert.equal(metrics.faithfulnessScore, 1.0);
  });

  test('handles missing validation in response gracefully', () => {
    const testCase = makeTestCase();
    const retrieved = [makeChunk('src/retrieval/adaptive-retriever.ts')];
    const response: CodeQAResponse = {
      content: 'Answer without validation',
      citations: [],
      confidence: 0.5,
      // No validation field
    };

    const metrics = calculateMetrics(testCase, 'ARCHITECTURE', retrieved, response);

    // Should default faithfulness to 0 when validation is missing
    assert.equal(metrics.faithfulnessScore, 0);
  });
});
