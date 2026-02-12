/**
 * Validation Catch Demo
 *
 * Shows what happens when the validator catches hallucinations.
 * We'll simulate LLM responses that SHOULD fail validation.
 */

import { ResponseSynthesizer } from '../agents/response-synthesizer.js';
import { QueryIntent, RetrievedChunk, Citation } from '../types/index.js';
import { CitationValidator } from '../validation/citation-validator.js';
import { LLMClient } from '../utils/llm-client.js';

// Create a mock LLM that generates BAD responses (with hallucinations)
class HallucinatingMockLLM implements LLMClient {
  private responseIndex = 0;
  private badResponses = [
    // Response 1: References non-existent sources
    `The adaptive retrieval system uses a configuration file [Source 1] to determine
     the k value. For architecture queries, k is set to 20 [Source 5], which provides
     broad coverage of the codebase [Source 10].`,

    // Response 2: Makes claims without any citations
    `The code uses a sophisticated caching mechanism with Redis as the backing store.
     The TTL is configured to 3600 seconds, and the system implements a write-through
     strategy to ensure consistency between cache and database.`,

    // Response 3: Cites sources but makes unsupported claims
    `The retry logic [Source 1] implements exponential backoff with a maximum of 10
     retries, starting at 50ms and doubling each time. This ensures robust error
     handling in distributed systems [Source 2].`,
  ];

  async complete(_prompt: string): Promise<string> {
    const response = this.badResponses[this.responseIndex % this.badResponses.length];
    this.responseIndex++;
    return response;
  }

  async classifyQuery(_query: string): Promise<QueryIntent> {
    return {
      type: 'GENERAL',
      confidence: 0.8,
      reasoning: 'Mock classification',
      entities: [],
      searchStrategy: 'broad',
    };
  }
}

export async function runValidationCatchDemo() {
  console.log('\n🔍 Validation Catch Demo: Seeing Validation in Action\n');
  console.log('='.repeat(70));
  console.log('This demo shows what happens when validators catch hallucinations.\n');

  const badLLM = new HallucinatingMockLLM();
  const synthesizer = new ResponseSynthesizer(badLLM);
  const validator = new CitationValidator();

  // Test Case 1: Hallucinated citation references
  console.log('📕 Test 1: Hallucinated Citation References');
  console.log('-'.repeat(70));

  const mockChunks1: RetrievedChunk[] = [
    {
      id: 'chunk-1',
      content: '// Code from adaptive-retriever.ts',
      relevanceScore: 0.9,
      metadata: {
        filePath: 'src/retrieval/adaptive-retriever.ts',
        startLine: 45,
        endLine: 60,
        scopeName: 'AdaptiveRetriever.retrieve',
      },
    },
    {
      id: 'chunk-2',
      content: '// Code from retrieval-strategies.yaml',
      relevanceScore: 0.8,
      metadata: {
        filePath: 'specs/retrieval-strategies.yaml',
        startLine: 10,
        endLine: 20,
        scopeName: 'ARCHITECTURE strategy',
      },
    },
  ];

  const intent1: QueryIntent = {
    type: 'IMPLEMENTATION',
    confidence: 0.9,
    reasoning: 'Test',
    entities: [],
    searchStrategy: 'focused',
  };

  const response1 = await synthesizer.synthesize(
    'How does adaptive retrieval work?',
    intent1,
    mockChunks1
  );

  console.log(`Answer:\n${response1.content}\n`);
  console.log(`Citations Provided: ${response1.citations.length}`);
  response1.citations.forEach((c, i) => {
    console.log(`  [Source ${i + 1}] ${c.filePath}:${c.startLine}-${c.endLine}`);
  });

  if (response1.validation) {
    const v = response1.validation;
    console.log(`\n${v.passed ? '✓' : '✗'} Validation: ${v.recommendation.toUpperCase()}`);
    console.log(`📊 Faithfulness Score: ${v.faithfulnessScore.toFixed(2)}/1.0`);
    if (v.issues.length > 0) {
      console.log(`Issues Detected:`);
      v.issues.forEach(issue => {
        console.log(`  ✗ [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }
  }

  // Test Case 2: No citations in substantive answer
  console.log('\n\n📕 Test 2: No Citations in Substantive Answer');
  console.log('-'.repeat(70));

  const mockChunks2: RetrievedChunk[] = [
    {
      id: 'chunk-1',
      content: '// Cache implementation',
      relevanceScore: 0.7,
      metadata: {
        filePath: 'src/cache/cache.ts',
        startLine: 10,
        endLine: 30,
        scopeName: 'Cache.get',
      },
    },
  ];

  const response2 = await synthesizer.synthesize(
    'How does caching work?',
    intent1,
    mockChunks2
  );

  console.log(`Answer:\n${response2.content}\n`);
  console.log(`Citations Provided: ${response2.citations.length}`);

  if (response2.validation) {
    const v = response2.validation;
    console.log(`\n${v.passed ? '✓' : '✗'} Validation: ${v.recommendation.toUpperCase()}`);
    console.log(`📊 Faithfulness Score: ${v.faithfulnessScore.toFixed(2)}/1.0`);
    if (v.issues.length > 0) {
      console.log(`Issues Detected:`);
      v.issues.forEach(issue => {
        console.log(`  ✗ [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }
  }

  // Test Case 3: Claims not supported by citations
  console.log('\n\n📕 Test 3: Unsupported Claims (subtle hallucination)');
  console.log('-'.repeat(70));
  console.log('NOTE: This type requires more sophisticated validation (Checks 2-4)');
  console.log('Our current Check 1 may not catch this - showing limitation!\n');

  const mockChunks3: RetrievedChunk[] = [
    {
      id: 'chunk-1',
      content: 'function retry(fn) { /* simple retry */ }',
      relevanceScore: 0.8,
      metadata: {
        filePath: 'src/utils/retry.ts',
        startLine: 10,
        endLine: 25,
        scopeName: 'retry',
      },
    },
    {
      id: 'chunk-2',
      content: '// Error handling',
      relevanceScore: 0.6,
      metadata: {
        filePath: 'src/utils/errors.ts',
        startLine: 5,
        endLine: 15,
        scopeName: 'ErrorHandler',
      },
    },
  ];

  const response3 = await synthesizer.synthesize(
    'How does retry logic work?',
    intent1,
    mockChunks3
  );

  console.log(`Answer:\n${response3.content}\n`);
  console.log(`Citations Provided: ${response3.citations.length}`);

  if (response3.validation) {
    const v = response3.validation;
    console.log(`\n${v.passed ? '✓' : '✗'} Validation: ${v.recommendation.toUpperCase()}`);
    console.log(`📊 Faithfulness Score: ${v.faithfulnessScore.toFixed(2)}/1.0`);
    if (v.issues.length > 0) {
      console.log(`Issues Detected:`);
      v.issues.forEach(issue => {
        console.log(`  ✗ [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    } else {
      console.log(`⚠️  No issues detected - but the answer makes specific claims`);
      console.log(`   (10 retries, 50ms, exponential backoff) not in the citations!`);
      console.log(`   This shows Check 1 has limitations - we need Checks 2-4.`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('🎓 Key Learnings:');
  console.log('='.repeat(70));
  console.log(`
1. Check 1 catches OBVIOUS hallucinations (invented citations, missing citations)
2. Subtle hallucinations (unsupported claims) need more sophisticated checks
3. Validation provides a safety net - but not 100% perfect
4. Trade-off: Strict validation may reject good answers, lenient misses bad ones
5. This is why we'll add Checks 2-4 later (for deeper validation)

Next: We can either add more checks, or move to Stage 3 (prompt engineering)
to reduce hallucinations at the source!
  `);
}
