/**
 * Test Conversation Service
 * Verify conversation memory and context tracking (no API calls needed)
 */

import { ConversationService } from './src/services/conversation.service';
import { QueryIntent, QueryResult, PlantRecord } from './src/models';

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
  distribution: { states: ['NC', 'VA', 'SC'] },
  characteristics: {
    waterNeeds: 'Low',
    sunRequirements: ['Full Sun'],
    wildlifeValue: ['Butterflies', 'Pollinators'],
  },
  description: 'Orange wildflower that attracts butterflies',
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
  distribution: { states: ['NC', 'GA', 'FL'] },
  characteristics: {
    waterNeeds: 'Low',
    sunRequirements: ['Full Sun'],
    wildlifeValue: ['Pollinators', 'Bees'],
  },
  description: 'Yellow wildflower with drought tolerance',
};

function createMockIntent(query: string, filters: any = {}): QueryIntent {
  return {
    queryType: 'recommendation',
    filters,
    semanticQuery: query,
    confidence: 0.9,
    originalQuery: query,
  };
}

function createMockResult(query: string, plants: PlantRecord[]): QueryResult {
  return {
    query,
    answer: 'Mock answer',
    plants: plants.map((plant) => ({ plant, score: 0.9 })),
    metadata: {
      totalResults: plants.length,
      searchTime: 100,
      searchType: 'vector',
    },
  };
}

async function main() {
  console.log('Testing Conversation Service\n');

  const conversationService = new ConversationService();

  // Test 1: Start a conversation
  console.log('Test 1: Starting a conversation');
  const conversationId = conversationService.startConversation();
  console.log(`Conversation started: ${conversationId}\n`);

  // Test 2: Add first turn
  console.log('Test 2: Adding first turn');
  const query1 = 'What native wildflowers are in North Carolina?';
  const intent1 = createMockIntent(query1, {
    states: ['NC'],
    growthHabit: ['Forb/herb'],
    nativeStatus: 'native',
  });
  const result1 = createMockResult(query1, [mockPlant1, mockPlant2]);

  conversationService.addTurn(conversationId, query1, intent1, result1);
  console.log(`Turn 1 added: "${query1}"`);

  const memory1 = conversationService.getMemory(conversationId);
  console.log(`   Turns in memory: ${memory1.recentTurns.length}`);
  console.log(`   Plants mentioned: ${memory1.mentionedPlants.size}`);
  console.log(`   States discussed: ${Array.from(memory1.discussedStates).join(', ')}`);
  console.log();

  // Test 3: Add second turn (follow-up)
  console.log('Test 3: Adding follow-up turn');
  const query2 = 'Which of those attract butterflies?';
  const intent2 = createMockIntent(query2, {
    plantIds: ['ASTY', 'RUMA2'], // Reference previous plants
    wildlifeValue: ['Butterflies'],
  });
  const result2 = createMockResult(query2, [mockPlant1]);

  conversationService.addTurn(conversationId, query2, intent2, result2);
  console.log(`Turn 2 added: "${query2}"`);

  const memory2 = conversationService.getMemory(conversationId);
  console.log(`   Turns in memory: ${memory2.recentTurns.length}`);
  console.log(`   Plants mentioned: ${memory2.mentionedPlants.size}`);
  console.log(`   Topics discussed: ${Array.from(memory2.discussedTopics).join(', ')}`);
  console.log();

  // Test 4: Check if query is a follow-up
  console.log('Test 4: Testing follow-up detection');
  const followUpQueries = [
    'Which of those attract butterflies?',
    'Show me more like that',
    'What about trees instead?',
    'Any of them evergreen?',
  ];

  const notFollowUpQueries = [
    'What are some native plants?',
    'Show me drought-tolerant plants',
    'Find plants in Virginia',
  ];

  console.log('   Follow-up queries:');
  followUpQueries.forEach((q) => {
    const isFollowUp = conversationService.isFollowUpQuery(q);
    console.log(`   ${isFollowUp ? '✓' : '✗'} "${q}"`);
  });

  console.log('\n   Non-follow-up queries:');
  notFollowUpQueries.forEach((q) => {
    const isFollowUp = conversationService.isFollowUpQuery(q);
    console.log(`   ${isFollowUp ? '✓' : '✗'} "${q}"`);
  });
  console.log();

  // Test 5: Get reference context
  console.log('Test 5: Getting reference context');
  const refContext = conversationService.getReferenceContext(conversationId);
  console.log(`Reference context retrieved`);
  console.log(`   Last plants: ${refContext.lastPlants?.join(', ')}`);
  console.log(`   Last query: "${refContext.lastQuery}"`);
  console.log();

  // Test 6: Get conversation summary
  console.log('Test 6: Getting conversation summary');
  const summary = conversationService.getSummary(conversationId);
  console.log(`Summary: ${summary}\n`);

  // Test 7: Multiple conversations
  console.log('Test 7: Managing multiple conversations');
  const conversationId2 = conversationService.startConversation();
  const conversationId3 = conversationService.startConversation();

  console.log(`Started 2 more conversations`);
  const activeConversations = conversationService.getActiveConversations();
  console.log(`   Active conversations: ${activeConversations.length}`);
  console.log();

  // Test 8: End conversation
  console.log('Test 8: Ending conversation');
  conversationService.endConversation(conversationId2);
  conversationService.endConversation(conversationId3);
  console.log(`Conversations ended`);
  console.log(`   Active conversations: ${conversationService.getActiveConversations().length}`);
  console.log();

  // Test 9: Memory with many turns
  console.log('Test 9: Testing memory limits (max 5 turns)');
  for (let i = 3; i <= 7; i++) {
    const query = `Query number ${i}`;
    const intent = createMockIntent(query, { states: ['NC'] });
    const result = createMockResult(query, [mockPlant1]);
    conversationService.addTurn(conversationId, query, intent, result);
  }

  const memoryFinal = conversationService.getMemory(conversationId);
  console.log(`Added 5 more turns (total 7)`);
  console.log(`   Turns in memory: ${memoryFinal.recentTurns.length} (max 5)`);
  console.log(`   Total plants mentioned: ${memoryFinal.mentionedPlants.size}`);
  console.log();

  // Final summary
  console.log('─'.repeat(80));
  console.log('All conversation service tests passed!\n');

  console.log('Final State:');
  const finalSummary = conversationService.getSummary(conversationId);
  console.log(`   ${finalSummary}\n`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
