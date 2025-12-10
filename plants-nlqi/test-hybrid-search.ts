/**
 * Test Hybrid Search
 * Verify hybrid search combines vector + filtering correctly
 */

import dotenv from 'dotenv';
import { IntentAgent } from './src/agents/intent-agent';
import { QueryRefinementService } from './src/services/query-refinement.service';
import { HybridSearchService } from './src/search/hybrid-search.service';

dotenv.config();

async function main() {
  console.log('Testing Hybrid Search Service\n');

  // Validate environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set');
    return;
  }
  if (!process.env.VOYAGE_API_KEY) {
    console.error('❌ VOYAGE_API_KEY not set');
    return;
  }
  if (!process.env.PINECONE_API_KEY) {
    console.error('❌ PINECONE_API_KEY not set');
    return;
  }
  if (!process.env.PINECONE_INDEX_NAME) {
    console.error('❌ PINECONE_INDEX_NAME not set');
    return;
  }

  // Initialize services
  const intentAgent = new IntentAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const refinementService = new QueryRefinementService();

  const hybridSearch = new HybridSearchService({
    voyageApiKey: process.env.VOYAGE_API_KEY,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME,
  });

  console.log('All services initialized\n');

  // Test queries
  const testQueries = [
    {
      query: 'What native wildflowers are found in North Carolina?',
      description: 'State + growth habit filtering',
    },
    {
      query: 'Show me drought-tolerant plants',
      description: 'Water needs characteristic filtering',
    },
    {
      query: 'Find trees that attract birds',
      description: 'Growth habit + wildlife value filtering',
    },
    {
      query: 'Which plants grow in shade and bloom in spring?',
      description: 'Sun requirements + bloom period filtering',
    },
  ];

  for (const test of testQueries) {
    console.log('═'.repeat(80));
    console.log(`\nQuery: "${test.query}"`);
    console.log(`Testing: ${test.description}\n`);

    // Parse intent
    const parseResult = await intentAgent.parseIntent(test.query);
    console.log('Parsed Intent:');
    console.log(`  Query Type: ${parseResult.intent.queryType}`);
    console.log(`  Confidence: ${(parseResult.intent.confidence * 100).toFixed(1)}%`);

    // Refine intent
    const refinedIntent = refinementService.refineIntent(parseResult.intent);
    console.log('\nRefined Intent:');
    console.log(`  Semantic Query: "${refinedIntent.semanticQuery}"`);

    // Show filters being applied
    if (refinedIntent.filters.states) {
      console.log(`  States: ${refinedIntent.filters.states.join(', ')}`);
    }
    if (refinedIntent.filters.growthHabit) {
      console.log(`  Growth Habits: ${refinedIntent.filters.growthHabit.join(', ')}`);
    }
    if (refinedIntent.filters.wildlifeValue) {
      console.log(`  Wildlife: ${refinedIntent.filters.wildlifeValue.join(', ')}`);
    }
    if (refinedIntent.filters.characteristics) {
      const chars = refinedIntent.filters.characteristics;
      if (chars.waterNeeds) {
        console.log(`  Water Needs: ${chars.waterNeeds}`);
      }
      if (chars.sunRequirements) {
        console.log(`  Sun: ${chars.sunRequirements.join(', ')}`);
      }
      if (chars.bloomPeriod) {
        console.log(`  Bloom: ${chars.bloomPeriod.join(', ')}`);
      }
    }

    // Perform hybrid search
    console.log('\nSearching...');
    const searchResult = await hybridSearch.search(refinedIntent, 5);

    console.log(`\nSearch Results:`);
    console.log(`  Strategy: ${searchResult.searchStrategy}`);
    console.log(`  Vector Results: ${searchResult.vectorResultCount}`);
    console.log(`  Filtered Results: ${searchResult.filteredResultCount}`);

    if (searchResult.plants.length === 0) {
      console.log('\n   No plants found matching criteria\n');
      continue;
    }

    console.log('\nTop Plants:');
    searchResult.plants.forEach((plant, i) => {
      const score = searchResult.scores.get(plant.id) || 0;
      const scoreBar = '█'.repeat(Math.round(score * 10));
      console.log(`\n  ${i + 1}. ${plant.scientificName} (${plant.commonNames[0]})`);
      console.log(`     ${scoreBar} ${(score * 100).toFixed(1)}%`);
      console.log(`     ${plant.growthHabit.join(', ')} • ${plant.duration}`);

      // Show why it matched
      const matchReasons: string[] = [];
      if (refinedIntent.filters.states) {
        const matchingStates = plant.distribution.states.filter((s) =>
          refinedIntent.filters.states!.includes(s)
        );
        if (matchingStates.length > 0) {
          matchReasons.push(`States: ${matchingStates.join(', ')}`);
        }
      }
      if (refinedIntent.filters.characteristics?.waterNeeds) {
        if (plant.characteristics.waterNeeds === refinedIntent.filters.characteristics.waterNeeds) {
          matchReasons.push(`Water: ${plant.characteristics.waterNeeds}`);
        }
      }
      if (refinedIntent.filters.wildlifeValue) {
        const matchingWildlife = plant.characteristics.wildlifeValue?.filter((w) =>
          refinedIntent.filters.wildlifeValue!.includes(w)
        );
        if (matchingWildlife && matchingWildlife.length > 0) {
          matchReasons.push(`Wildlife: ${matchingWildlife.join(', ')}`);
        }
      }
      if (matchReasons.length > 0) {
        console.log(`     ✓ ${matchReasons.join(' • ')}`);
      }
    });

    console.log();
  }

  console.log('═'.repeat(80));
  console.log('\nAll hybrid search tests completed!\n');

  // Comparison test: Vector-only vs Hybrid
  console.log('Comparison: Vector-Only vs Hybrid Search\n');

  const comparisonQuery = 'drought-tolerant wildflowers in North Carolina';
  console.log(`Query: "${comparisonQuery}"\n`);

  // Parse and refine
  const compIntent = refinementService.refineIntent(
    (await intentAgent.parseIntent(comparisonQuery)).intent
  );

  // Vector-only (no filters)
  console.log(' Vector-Only Search (no filters):');
  const vectorOnlyIntent = { ...compIntent, filters: {} };
  const vectorOnly = await hybridSearch.search(vectorOnlyIntent, 5);
  console.log(`   Results: ${vectorOnly.plants.length} plants`);
  console.log(
    `   Top: ${vectorOnly.plants[0]?.scientificName} (${vectorOnly.plants[0]?.commonNames[0]})`
  );

  // Hybrid (with filters)
  console.log('\n Hybrid Search (with filters):');
  const hybrid = await hybridSearch.search(compIntent, 5);
  console.log(`   Results: ${hybrid.plants.length} plants`);
  console.log(`   Top: ${hybrid.plants[0]?.scientificName} (${hybrid.plants[0]?.commonNames[0]})`);

  console.log('\nHybrid search applies filters to get more relevant results!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
