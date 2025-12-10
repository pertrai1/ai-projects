/**
 * Test Query Refinement Service
 * Verify refinement and validation works correctly
 */

import dotenv from 'dotenv';
import { IntentAgent } from './src/agents/intent-agent';
import { QueryRefinementService } from './src/services/query-refinement.service';

dotenv.config();

async function main() {
  console.log('Testing Query Refinement Service\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in .env');
    return;
  }

  // Initialize services
  const intentAgent = new IntentAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const refinementService = new QueryRefinementService();

  // Test queries
  const testQueries = [
    'Find drought-tolerant wildflowers in North Carolina',
    'Show me shade plants that bloom in spring and summer',
    'What trees in Virginia attract birds and butterflies?',
  ];

  for (const query of testQueries) {
    console.log('─'.repeat(80));
    console.log(`\nQuery: "${query}"\n`);

    // Parse intent
    const parseResult = await intentAgent.parseIntent(query);
    console.log('Original Intent:');
    console.log(`  Query Type: ${parseResult.intent.queryType}`);
    console.log(`  Confidence: ${(parseResult.intent.confidence * 100).toFixed(1)}%`);
    console.log(`  Semantic Query: "${parseResult.intent.semanticQuery}"`);

    // Refine intent
    const refinedIntent = refinementService.refineIntent(parseResult.intent);

    console.log('\nRefined Intent:');
    console.log(`  Semantic Query: "${refinedIntent.semanticQuery}"`);

    // Show what changed
    if (refinedIntent.filters.states) {
      console.log(`  States (normalized): ${refinedIntent.filters.states.join(', ')}`);
    }

    if (refinedIntent.filters.growthHabit) {
      console.log(`  Growth Habits: ${refinedIntent.filters.growthHabit.join(', ')}`);
    }

    if (refinedIntent.filters.wildlifeValue) {
      console.log(`  Wildlife Values: ${refinedIntent.filters.wildlifeValue.join(', ')}`);
    }

    if (refinedIntent.filters.characteristics) {
      const chars = refinedIntent.filters.characteristics;
      console.log('\n  Characteristics:');
      if (chars.waterNeeds) {
        console.log(`    Water Needs: ${chars.waterNeeds}`);
      }
      if (chars.sunRequirements) {
        console.log(`    Sun Requirements: ${chars.sunRequirements.join(', ')}`);
      }
      if (chars.bloomPeriod) {
        console.log(`    Bloom Periods: ${chars.bloomPeriod.join(', ')}`);
      }
    }

    // Get filters summary
    const summary = refinementService.getFiltersSummary(refinedIntent.filters);
    console.log(`\nFilters Summary: ${summary}`);

    // Check if has filters
    const hasFilters = refinementService.hasFilters(refinedIntent);
    console.log(`\nHas Filters: ${hasFilters ? 'Yes' : 'No'}`);

    // Expand with synonyms
    const expansions = refinementService.expandQueryWithSynonyms(refinedIntent.semanticQuery);
    if (expansions.length > 1) {
      console.log('\nQuery Expansions:');
      expansions.forEach((exp, i) => {
        console.log(`  ${i + 1}. "${exp}"`);
      });
    }

    console.log();
  }

  console.log('─'.repeat(80));
  console.log('\nAll tests completed!\n');

  // Test edge cases
  console.log('Testing Edge Cases\n');

  // Test with malformed data
  console.log('Test 1: Handling invalid state names');
  const testIntent1 = await intentAgent.parseIntent('Plants in Narnia and Atlantis');
  const refined1 = refinementService.refineIntent(testIntent1.intent);
  console.log(`  Original states: ${testIntent1.intent.filters.states || 'none'}`);
  console.log(`  Refined states: ${refined1.filters.states || 'none'}`);
  console.log();

  // Test with mixed case and variations
  console.log('Test 2: Normalizing variations');
  const testIntent2 = await intentAgent.parseIntent('Wildflowers in n.c. and virginia');
  const refined2 = refinementService.refineIntent(testIntent2.intent);
  console.log(`  Normalized states: ${refined2.filters.states?.join(', ') || 'none'}`);
  console.log();

  // Test semantic query refinement
  console.log('Test 3: Semantic query refinement (removing stop words)');
  const testIntent3 = await intentAgent.parseIntent(
    'Can you show me some of the best drought-tolerant plants that are native?'
  );
  const refined3 = refinementService.refineIntent(testIntent3.intent);
  console.log(`  Original: "${testIntent3.intent.semanticQuery}"`);
  console.log(`  Refined: "${refined3.semanticQuery}"`);
  console.log();

  console.log('Edge case tests completed!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
