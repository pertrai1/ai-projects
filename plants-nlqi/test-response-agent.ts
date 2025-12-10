/**
 * Test Enhanced Response Agent
 * Verify context-aware response generation (minimal API calls)
 */

import dotenv from 'dotenv';
import { ResponseAgent } from './src/agents/response-agent';
import { ConversationService } from './src/services/conversation.service';
import { ConversationMemory, PlantRecord, QueryIntent, QueryResult } from './src/models';

dotenv.config();

// Mock plant data
const mockPlant1: PlantRecord = {
  id: 'ASTY',
  scientificName: 'Asclepias tuberosa',
  commonNames: ['Butterfly Weed'],
  symbol: 'ASTY',
  family: 'Asclepiadaceae',
  duration: 'Perennial',
  growthHabit: ['Forb/herb'],
  nativeStatus: [{ state: 'NC', status: 'Native' }],
  distribution: { states: ['NC', 'VA', 'SC'], regions: ['Southeast'] },
  characteristics: {
    height: { min: 1, max: 2.5, unit: 'feet' },
    bloomPeriod: 'Late Spring to Summer',
    flowerColor: ['Orange', 'Yellow'],
    sunRequirements: ['Full Sun'],
    waterNeeds: 'Low',
    wildlifeValue: ['Butterflies', 'Pollinators', 'Bees'],
  },
  description: 'Butterfly Weed is a showy native milkweed with brilliant orange flowers.',
};

const mockPlant2: PlantRecord = {
  id: 'RUMA2',
  scientificName: 'Rudbeckia maxima',
  commonNames: ['Great Coneflower'],
  symbol: 'RUMA2',
  family: 'Asteraceae',
  duration: 'Perennial',
  growthHabit: ['Forb/herb'],
  nativeStatus: [{ state: 'NC', status: 'Native' }],
  distribution: { states: ['NC', 'GA', 'FL'], regions: ['Southeast'] },
  characteristics: {
    height: { min: 3, max: 6, unit: 'feet' },
    bloomPeriod: 'Late Spring to Early Summer',
    flowerColor: ['Yellow'],
    sunRequirements: ['Full Sun', 'Partial Shade'],
    waterNeeds: 'Low',
    wildlifeValue: ['Pollinators', 'Butterflies', 'Bees', 'Birds'],
  },
  description: 'Great Coneflower is a striking native wildflower with large yellow petals.',
};

const mockPlant3: PlantRecord = {
  id: 'CORA6',
  scientificName: 'Coreopsis verticillata',
  commonNames: ['Threadleaf Coreopsis'],
  symbol: 'CORA6',
  family: 'Asteraceae',
  duration: 'Perennial',
  growthHabit: ['Forb/herb'],
  nativeStatus: [{ state: 'NC', status: 'Native' }],
  distribution: { states: ['NC', 'SC', 'GA'], regions: ['Southeast'] },
  characteristics: {
    height: { min: 1, max: 3, unit: 'feet' },
    bloomPeriod: 'Late Spring to Fall',
    flowerColor: ['Yellow'],
    sunRequirements: ['Full Sun'],
    waterNeeds: 'Low',
    wildlifeValue: ['Pollinators', 'Butterflies', 'Bees'],
  },
  description: 'Threadleaf Coreopsis is a long-blooming native wildflower.',
};

async function main() {
  console.log('Testing Enhanced Response Agent\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in .env');
    return;
  }

  // Initialize services
  const responseAgent = new ResponseAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const conversationService = new ConversationService();

  // Test connection
  console.log('Testing connection...');
  const connected = await responseAgent.testConnection();
  if (!connected) {
    console.error('❌ Connection failed');
    return;
  }
  console.log('Connection successful\n');

  console.log('═'.repeat(80));
  console.log('Test 1: Initial Response (No Context)');
  console.log('═'.repeat(80));

  const query1 = 'What native wildflowers are found in North Carolina?';
  console.log(`\nQuery: "${query1}"\n`);

  console.log('Generating response without conversation context...\n');
  const response1 = await responseAgent.generateResponse(
    query1,
    [mockPlant1, mockPlant2, mockPlant3],
    undefined, // No memory
    false // Not a follow-up
  );

  console.log('Response:');
  console.log('─'.repeat(80));
  console.log(response1);
  console.log('─'.repeat(80));

  // Simulate adding this to conversation
  const conversationId = conversationService.startConversation();
  const mockIntent1: QueryIntent = {
    queryType: 'recommendation',
    filters: { states: ['NC'], growthHabit: ['Forb/herb'], nativeStatus: 'native' },
    semanticQuery: 'native wildflowers',
    confidence: 0.95,
    originalQuery: query1,
  };
  const mockResult1: QueryResult = {
    query: query1,
    answer: response1,
    plants: [mockPlant1, mockPlant2, mockPlant3].map((p) => ({ plant: p, score: 0.9 })),
    metadata: { totalResults: 3, searchTime: 1000, searchType: 'hybrid' },
  };
  conversationService.addTurn(conversationId, query1, mockIntent1, mockResult1);

  console.log('\nResponse 1 complete\n');

  // Test 2: Follow-up with context
  console.log('═'.repeat(80));
  console.log('Test 2: Follow-up Response (With Context)');
  console.log('═'.repeat(80));

  const query2 = 'Which of those attract butterflies?';
  console.log(`\nQuery: "${query2}"`);
  console.log('(Follow-up referencing previous plants)\n');

  // Get conversation memory
  const memory = conversationService.getMemory(conversationId);

  console.log('Conversation Memory:');
  console.log(`  Previous turns: ${memory.recentTurns.length}`);
  console.log(`  Plants mentioned: ${memory.mentionedPlants.size}`);
  console.log(`  Topics: ${Array.from(memory.discussedTopics).join(', ')}\n`);

  console.log('Generating context-aware response...\n');
  const response2 = await responseAgent.generateResponse(
    query2,
    [mockPlant1], // Only Butterfly Weed matches
    memory,
    true // This is a follow-up
  );

  console.log('Response:');
  console.log('─'.repeat(80));
  console.log(response2);
  console.log('─'.repeat(80));

  console.log('\nNotice how the response:');
  console.log('   • References the previous conversation');
  console.log('   • Uses natural language like "Of the wildflowers..."');
  console.log('   • Acknowledges this is a follow-up question\n');

  console.log('Response 2 complete\n');

  // Test 3: No results with context
  console.log('═'.repeat(80));
  console.log('Test 3: No Results Response (With Context)');
  console.log('═'.repeat(80));

  const query3 = 'Which ones are trees?';
  console.log(`\nQuery: "${query3}"`);
  console.log('(No matches - all previous plants are wildflowers)\n');

  console.log('Generating no-results response with context...\n');
  const response3 = await responseAgent.generateResponse(
    query3,
    [], // No matching plants
    memory,
    true
  );

  console.log('Response:');
  console.log('─'.repeat(80));
  console.log(response3);
  console.log('─'.repeat(80));

  console.log('\nNotice how the response:');
  console.log('   • Acknowledges we were discussing wildflowers');
  console.log('   • Explains why there are no tree matches');
  console.log('   • Remains helpful and encouraging\n');

  console.log('Response 3 complete\n');

  console.log('═'.repeat(80));
  console.log('All enhanced response agent tests completed!');
  console.log('═'.repeat(80));
  console.log('\nKey Improvements:');
  console.log('   • Responses reference conversation context');
  console.log('   • Follow-ups are handled naturally');
  console.log('   • No-results responses are context-aware');
  console.log('   • Conversation flows more naturally\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
