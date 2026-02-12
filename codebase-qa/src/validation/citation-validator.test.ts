/**
 * Citation Validator Test Cases (Stage 2 Learning)
 *
 * These tests demonstrate REALISTIC hallucination scenarios and how
 * the validator catches them.
 *
 * PEDAGOGICAL NOTE: Each test includes:
 * - A realistic scenario description
 * - What the LLM claimed
 * - What we actually provided
 * - What the validator should detect
 */

import { CitationValidator } from './citation-validator.js';
import { Citation } from '../types/index.js';

// Helper to create mock citations
function createMockCitation(id: number, filePath: string, startLine: number, endLine: number): Citation {
  return {
    id: `cite-${id - 1}`,
    chunkId: `chunk-${id}`,
    filePath,
    startLine,
    endLine,
    snippet: `// Code snippet from ${filePath}:${startLine}-${endLine}`,
    relevance: 0.8,
  };
}

describe('CitationValidator - Check 1: Citation Reference Validation', () => {
  const validator = new CitationValidator();

  test('Scenario 1: Perfect citation usage - should PASS', () => {
    // The LLM properly cites all provided sources
    const answer = `
The adaptive retrieval system decides k based on query intent [Source 1].
For architecture queries, it uses k=15 to get broad coverage [Source 2].
For location queries, it uses k=3 for precision [Source 3].
    `.trim();

    const citations = [
      createMockCitation(1, 'src/retrieval/adaptive-retriever.ts', 45, 60),
      createMockCitation(2, 'specs/retrieval-strategies.yaml', 10, 20),
      createMockCitation(3, 'specs/retrieval-strategies.yaml', 30, 35),
    ];

    const result = validator.validateCitationReferences(answer, citations);

    console.log('\n📗 Scenario 1: Perfect citation usage');
    console.log('Result:', result.summary);
    console.log('Passed:', result.passed);
    console.log('Confidence:', result.confidence);
    console.log('Issues:', result.issues.length);

    expect(result.passed).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.issues).toHaveLength(0);
  });

  test('Scenario 2: Hallucinated citation reference - should FAIL', () => {
    // The LLM references [Source 5] but we only provided 3 citations
    // This is a CLEAR hallucination!
    const answer = `
The retry logic uses exponential backoff [Source 1].
The maximum retry count is configured in the settings [Source 5].
    `.trim();

    const citations = [
      createMockCitation(1, 'src/utils/retry.ts', 10, 25),
      createMockCitation(2, 'src/config/settings.ts', 50, 60),
      createMockCitation(3, 'src/utils/logger.ts', 100, 110),
    ];

    const result = validator.validateCitationReferences(answer, citations);

    console.log('\n📕 Scenario 2: Hallucinated citation reference');
    console.log('Result:', result.summary);
    console.log('Passed:', result.passed);
    console.log('Issues:');
    result.issues.forEach(issue => {
      console.log(`  - [${issue.severity}] ${issue.message}`);
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('missing_citation');
    expect(result.issues[0].message).toContain('[Source 5]');
  });

  test('Scenario 3: No citations in substantive answer - should FAIL', () => {
    // The LLM makes specific claims but doesn't cite ANY sources
    // This is dangerous - user can't verify the claims!
    const answer = `
The caching system uses Redis with a TTL of 3600 seconds. When a cache miss
occurs, the system fetches from the database and updates the cache. The
implementation uses a write-through strategy to ensure consistency.
    `.trim();

    const citations = [
      createMockCitation(1, 'src/cache/redis-cache.ts', 20, 40),
      createMockCitation(2, 'src/cache/cache-strategy.ts', 10, 30),
    ];

    const result = validator.validateCitationReferences(answer, citations);

    console.log('\n📕 Scenario 3: No citations in substantive answer');
    console.log('Result:', result.summary);
    console.log('Passed:', result.passed);
    console.log('Issues:');
    result.issues.forEach(issue => {
      console.log(`  - [${issue.severity}] ${issue.message}`);
    });

    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].message).toContain('no citation references');
  });

  test('Scenario 4: Insufficient evidence response - should PASS', () => {
    // The LLM correctly says it couldn't find evidence
    // This is GOOD behavior - explicit refusal instead of hallucination
    const answer = `I could not find relevant code for this query in the codebase.`;

    const citations = []; // No citations because nothing was found

    const result = validator.validateCitationReferences(answer, citations);

    console.log('\n📗 Scenario 4: Insufficient evidence response');
    console.log('Result:', result.summary);
    console.log('Passed:', result.passed);

    expect(result.passed).toBe(true);
  });

  test('Scenario 5: Unused citations - should WARN', () => {
    // We provided 4 citations but the LLM only used 2 of them
    // This suggests the LLM might be ignoring evidence
    const answer = `
The query router classifies intent using keyword matching [Source 1].
It returns a confidence score between 0 and 1 [Source 2].
    `.trim();

    const citations = [
      createMockCitation(1, 'src/agents/query-router.ts', 20, 30),
      createMockCitation(2, 'src/agents/query-router.ts', 40, 50),
      createMockCitation(3, 'src/types/index.ts', 10, 15), // Not used
      createMockCitation(4, 'src/utils/logger.ts', 5, 10),  // Not used
    ];

    const result = validator.validateCitationReferences(answer, citations);

    console.log('\n📙 Scenario 5: Unused citations');
    console.log('Result:', result.summary);
    console.log('Passed:', result.passed);
    console.log('Issues:');
    result.issues.forEach(issue => {
      console.log(`  - [${issue.severity}] ${issue.message}`);
      console.log(`    Context: ${issue.context}`);
    });

    expect(result.passed).toBe(true); // Not an error, just a warning
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].severity).toBe('warning');
  });

  test('Scenario 6: Faithfulness score calculation', () => {
    const answer = `
The code does X [Source 1] and Y [Source 10].
    `.trim();

    const citations = [
      createMockCitation(1, 'src/file.ts', 10, 20),
    ];

    const faithfulness = validator.calculateFaithfulness(answer, citations);

    console.log('\n📊 Scenario 6: Faithfulness score');
    console.log('Overall Score:', faithfulness.overallScore);
    console.log('Citation Reference Score:', faithfulness.citationReferenceScore);
    console.log('Recommendation:', faithfulness.recommendation);
    console.log('Issues:', faithfulness.issues.length);

    expect(faithfulness.recommendation).toBe('reject'); // Has hallucinated citation
    expect(faithfulness.overallScore).toBeLessThan(0.5);
  });
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Citation Validator Tests\n');
  console.log('=' .repeat(60));

  // Note: These are demonstration tests, not actual test framework tests
  // In a real project, you'd use Jest, Vitest, etc.
  console.log('\nThese tests demonstrate how the validator catches hallucinations.');
  console.log('Run with a proper test framework for actual validation.\n');
}
