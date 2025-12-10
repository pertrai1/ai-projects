/**
 * Test PlantsNLQI
 * Quick test to verify the complete RAG pipeline works
 */

import dotenv from 'dotenv';
import { PlantsNLQI } from './src/core/plants-nlqi';

dotenv.config();

async function main() {
  console.log('Testing Plants NLQI\n');

  // Initialize the system
  const nlqi = new PlantsNLQI({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    voyageApiKey: process.env.VOYAGE_API_KEY!,
    pineconeApiKey: process.env.PINECONE_API_KEY!,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME!,
  });

  // Health check
  console.log('Running health check...');
  const health = await nlqi.healthCheck();
  console.log('Health Status:', health);

  if (!health.overall) {
    console.error('❌ System not healthy. Check your API keys and Pinecone index.');
    return;
  }

  console.log('System healthy!\n');

  // Test queries
  const queries = [
    'What native wildflowers are found in North Carolina?',
    'Show me drought-tolerant plants',
    'Which plants attract pollinators?',
  ];

  for (const query of queries) {
    console.log('─'.repeat(80));
    console.log(`\nQuery: "${query}"\n`);

    const result = await nlqi.query(query, 3);

    console.log(`Search time: ${result.metadata.searchTime}ms`);
    console.log(`Results found: ${result.metadata.totalResults}\n`);

    console.log('Top Plants:');
    result.plants.forEach((match, i) => {
      console.log(
        `  ${i + 1}. ${match.plant.scientificName} (${match.plant.commonNames[0]}) - Score: ${match.score.toFixed(3)}`
      );
    });

    console.log(`\nAnswer:\n${result.answer}\n`);
  }

  console.log('─'.repeat(80));
  console.log('\nAll tests completed!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
