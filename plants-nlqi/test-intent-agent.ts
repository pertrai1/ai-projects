/**
 * Test Intent Agent
 * Verify intent parsing works correctly
 */

import dotenv from 'dotenv';
import { IntentAgent } from './src/agents/intent-agent';

dotenv.config();

// Helper to safely display array or single value
function displayValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

async function main() {
  console.log('Testing Intent Understanding Agent\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in .env');
    return;
  }

  // Initialize agent
  const intentAgent = new IntentAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Test connection
  console.log('Testing connection...');
  const connected = await intentAgent.testConnection();
  if (!connected) {
    console.error('❌ Connection failed');
    return;
  }
  console.log('Connection successful\n');

  // Test queries
  const testQueries = [
    'What native wildflowers are found in North Carolina?',
    'Show me drought-tolerant plants',
    'Find trees in Virginia that attract birds',
    'Which shrubs grow in shade and bloom in spring?',
    'Tell me about plants that need little water and attract butterflies',
    'What evergreen trees are native to NC?',
  ];

  for (const query of testQueries) {
    console.log('─'.repeat(80));
    console.log(`\nQuery: "${query}"\n`);

    const result = await intentAgent.parseIntent(query);

    console.log('Parsed Intent:');
    console.log(`  Query Type: ${result.intent.queryType}`);
    console.log(`  Confidence: ${(result.intent.confidence * 100).toFixed(1)}%`);
    console.log(`  Semantic Query: "${result.intent.semanticQuery}"`);

    if (Object.keys(result.intent.filters).length > 0) {
      console.log('\n  Filters:');

      if (result.intent.filters.states) {
        console.log(`    States: ${displayValue(result.intent.filters.states)}`);
      }

      if (result.intent.filters.nativeStatus) {
        console.log(`    Native Status: ${result.intent.filters.nativeStatus}`);
      }

      if (result.intent.filters.growthHabit) {
        console.log(`    Growth Habit: ${displayValue(result.intent.filters.growthHabit)}`);
      }

      if (result.intent.filters.characteristics) {
        const chars = result.intent.filters.characteristics;
        if (chars.waterNeeds) {
          console.log(`    Water Needs: ${chars.waterNeeds}`);
        }
        if (chars.sunRequirements) {
          console.log(`    Sun Requirements: ${displayValue(chars.sunRequirements)}`);
        }
        if (chars.bloomPeriod) {
          console.log(`    Bloom Period: ${displayValue(chars.bloomPeriod)}`);
        }
        if (chars.droughtTolerant !== undefined) {
          console.log(`    Drought Tolerant: ${chars.droughtTolerant}`);
        }
        if (chars.evergreen !== undefined) {
          console.log(`    Evergreen: ${chars.evergreen}`);
        }
      }

      if (result.intent.filters.wildlifeValue) {
        console.log(`    Wildlife Value: ${displayValue(result.intent.filters.wildlifeValue)}`);
      }
    }

    console.log(`\n   Parsing time: ${result.parsingTime}ms\n`);

    // Show any warnings
    if (result.warnings && result.warnings.length > 0) {
      console.log('   Warnings:');
      result.warnings.forEach((warning) => console.log(`    - ${warning}`));
      console.log();
    }
  }

  console.log('─'.repeat(80));
  console.log('\nAll tests completed!\n');

  // Test contextual parsing
  console.log('Testing Contextual Parsing\n');

  const firstQuery = 'What wildflowers are native to North Carolina?';
  console.log(`First query: "${firstQuery}"`);
  const firstResult = await intentAgent.parseIntent(firstQuery);
  console.log('Parsed successfully!\n');

  const followUpQuery = 'Which of those attract butterflies?';
  console.log(`Follow-up query: "${followUpQuery}"`);
  const contextualResult = await intentAgent.parseIntentWithContext(
    followUpQuery,
    firstResult.intent,
    ['RUMA2', 'ASTY', 'CORA6'] // Mock plant IDs from first result
  );

  console.log('\nContextual Intent:');
  console.log(`  Query Type: ${contextualResult.intent.queryType}`);
  console.log(`  Semantic Query: "${contextualResult.intent.semanticQuery}"`);

  if (contextualResult.intent.filters.plantIds) {
    console.log(
      `  Plant IDs Referenced: ${displayValue(contextualResult.intent.filters.plantIds)}`
    );
  }

  if (contextualResult.intent.filters.wildlifeValue) {
    console.log(`  Wildlife Value: ${displayValue(contextualResult.intent.filters.wildlifeValue)}`);
  }

  console.log(`\n   Parsing time: ${contextualResult.parsingTime}ms\n`);

  console.log('Contextual parsing works!\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
