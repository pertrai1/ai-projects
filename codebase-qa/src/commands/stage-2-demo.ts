/**
 * Stage 2 Demo: Citation Validation in Action
 *
 * This demonstrates the CitationValidator catching hallucinations in
 * realistic scenarios.
 */

import { CitationValidator } from '../validation/citation-validator.js';
import { Citation } from '../types/index.js';

// Helper to create mock citations
function createCitation(id: number, filePath: string, startLine: number, endLine: number): Citation {
  return {
    id: `cite-${id - 1}`,
    chunkId: `chunk-${id}`,
    filePath,
    startLine,
    endLine,
    snippet: `// Code from ${filePath}`,
    relevance: 0.8,
  };
}

export async function runStage2Demo() {
  console.log('\n🛡️  Stage 2 Demo: Citation Validation\n');
  console.log('=' .repeat(70));

  const validator = new CitationValidator();

  // Demo 1: Perfect answer with proper citations
  console.log('\n📗 Demo 1: Well-Cited Answer (SHOULD PASS)');
  console.log('-'.repeat(70));

  const goodAnswer = `
The AdaptiveRetriever determines k based on the query intent type [Source 1].
For ARCHITECTURE queries, it uses k=15 to retrieve broad context [Source 2],
while LOCATION queries use k=3 for precision [Source 3]. The strategy is
loaded from a YAML configuration file that maps each intent to parameters.
  `.trim();

  const goodCitations = [
    createCitation(1, 'src/retrieval/adaptive-retriever.ts', 45, 60),
    createCitation(2, 'specs/retrieval-strategies.yaml', 15, 25),
    createCitation(3, 'specs/retrieval-strategies.yaml', 30, 35),
  ];

  const result1 = validator.validateCitationReferences(goodAnswer, goodCitations);
  console.log(`\nAnswer excerpt: "${goodAnswer.substring(0, 100)}..."`);
  console.log(`\nValidation Result:`);
  console.log(`  ✓ Passed: ${result1.passed}`);
  console.log(`  ✓ Confidence: ${result1.confidence.toFixed(2)}`);
  console.log(`  ✓ Summary: ${result1.summary}`);
  if (result1.issues.length > 0) {
    console.log(`  Issues:`);
    result1.issues.forEach(issue => console.log(`    - [${issue.severity}] ${issue.message}`));
  }

  // Demo 2: Hallucinated citation
  console.log('\n\n📕 Demo 2: Hallucinated Citation (SHOULD FAIL)');
  console.log('-'.repeat(70));

  const badAnswer = `
The system implements retry logic with exponential backoff [Source 1].
The maximum retry count is configured to 5 attempts [Source 7].
After all retries fail, it throws a TimeoutError [Source 2].
  `.trim();

  const badCitations = [
    createCitation(1, 'src/utils/retry.ts', 10, 25),
    createCitation(2, 'src/utils/errors.ts', 40, 50),
  ];

  const result2 = validator.validateCitationReferences(badAnswer, badCitations);
  console.log(`\nAnswer excerpt: "${badAnswer.substring(0, 100)}..."`);
  console.log(`\nValidation Result:`);
  console.log(`  ✗ Passed: ${result2.passed}`);
  console.log(`  ✗ Confidence: ${result2.confidence.toFixed(2)}`);
  console.log(`  ✗ Summary: ${result2.summary}`);
  if (result2.issues.length > 0) {
    console.log(`  Issues Found:`);
    result2.issues.forEach(issue => {
      console.log(`    - [${issue.severity.toUpperCase()}] ${issue.message}`);
      if (issue.context) console.log(`      Context: ${issue.context}`);
    });
  }

  // Demo 3: No citations in substantive answer
  console.log('\n\n📕 Demo 3: Missing Citations (SHOULD FAIL)');
  console.log('-'.repeat(70));

  const uncitedAnswer = `
The caching layer uses Redis as the backing store with a default TTL of 3600
seconds. When a cache miss occurs, the system fetches from the PostgreSQL
database and populates the cache using a write-through strategy. This ensures
data consistency between the cache and the database.
  `.trim();

  const uncitedCitations = [
    createCitation(1, 'src/cache/redis-cache.ts', 20, 40),
    createCitation(2, 'src/cache/strategies.ts', 10, 30),
  ];

  const result3 = validator.validateCitationReferences(uncitedAnswer, uncitedCitations);
  console.log(`\nAnswer excerpt: "${uncitedAnswer.substring(0, 100)}..."`);
  console.log(`\nValidation Result:`);
  console.log(`  ✗ Passed: ${result3.passed}`);
  console.log(`  ✗ Confidence: ${result3.confidence.toFixed(2)}`);
  console.log(`  ✗ Summary: ${result3.summary}`);
  if (result3.issues.length > 0) {
    console.log(`  Issues Found:`);
    result3.issues.forEach(issue => {
      console.log(`    - [${issue.severity.toUpperCase()}] ${issue.message}`);
      if (issue.context) console.log(`      Context: ${issue.context}`);
    });
  }

  // Demo 4: Proper "I don't know" response
  console.log('\n\n📗 Demo 4: Explicit Uncertainty (SHOULD PASS)');
  console.log('-'.repeat(70));

  const uncertainAnswer = `
I could not find sufficient evidence in the codebase about the authentication
flow you're asking about. The retrieved code doesn't contain the specific
implementation details needed to answer this question.
  `.trim();

  const emptyCitations: Citation[] = [];

  const result4 = validator.validateCitationReferences(uncertainAnswer, emptyCitations);
  console.log(`\nAnswer excerpt: "${uncertainAnswer}"`);
  console.log(`\nValidation Result:`);
  console.log(`  ✓ Passed: ${result4.passed}`);
  console.log(`  ✓ Confidence: ${result4.confidence.toFixed(2)}`);
  console.log(`  ✓ Summary: ${result4.summary}`);
  console.log(`\n  → This is GOOD! The system refuses to hallucinate when evidence is weak.`);

  // Demo 5: Faithfulness Score
  console.log('\n\n📊 Demo 5: Overall Faithfulness Assessment');
  console.log('-'.repeat(70));

  const answers = [
    { text: goodAnswer, citations: goodCitations, label: 'Good Answer' },
    { text: badAnswer, citations: badCitations, label: 'Hallucinated Answer' },
    { text: uncitedAnswer, citations: uncitedCitations, label: 'Uncited Answer' },
  ];

  console.log('\nComparing faithfulness scores:\n');
  answers.forEach(({ text, citations, label }) => {
    const faithfulness = validator.calculateFaithfulness(text, citations);
    console.log(`${label}:`);
    console.log(`  Overall Score: ${faithfulness.overallScore.toFixed(2)}/1.0`);
    console.log(`  Recommendation: ${faithfulness.recommendation.toUpperCase()}`);
    console.log(`  Issues: ${faithfulness.issues.length}`);
    console.log();
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('🎓 Key Learnings from Stage 2:');
  console.log('='.repeat(70));
  console.log(`
1. Citation validation catches obvious hallucinations (invented sources)
2. Proper citation discipline makes answers verifiable
3. "I don't know" is better than hallucinated confidence
4. Validation provides a safety net for LLM-generated content
5. Scoring helps you decide: accept, review, or reject answers

Next: We'll add more sophisticated checks (line numbers, code quotes, entities)
  `);
}
