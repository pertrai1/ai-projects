/**
 * CLI with Conversation Mode
 * Interactive command-line interface
 */

import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { PlantsNLQI } from './src/core/plants-nlqi';

dotenv.config();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function printBanner() {
  console.log('\n' + '═'.repeat(80));
  console.log(colorize('PLANTS NLQI - Natural Language Query Interface', 'green'));
  console.log(colorize('  Enhanced with Conversation Memory & Hybrid Search', 'cyan'));
  console.log('═'.repeat(80) + '\n');
}

function printHelp() {
  console.log(colorize('\nAvailable Commands:', 'cyan'));
  console.log('  ' + colorize('help', 'yellow') + '     - Show this help message');
  console.log('  ' + colorize('new', 'yellow') + '      - Start a new conversation');
  console.log('  ' + colorize('summary', 'yellow') + '  - Show conversation summary');
  console.log('  ' + colorize('exit', 'yellow') + '     - Exit the program');
  console.log('  ' + colorize('quit', 'yellow') + '     - Exit the program');

  console.log(colorize('\nExample Queries:', 'cyan'));
  console.log('  • What native wildflowers are found in North Carolina?');
  console.log('  • Show me drought-tolerant plants');
  console.log('  • Which of those attract butterflies? ' + colorize('(follow-up)', 'gray'));
  console.log('  • Find trees that grow in shade and bloom in spring');
  console.log('  • What about shrubs instead? ' + colorize('(follow-up)', 'gray'));
  console.log();
}

function printScoreBar(score: number): string {
  const barLength = Math.round(score * 10);
  return colorize('█'.repeat(barLength), 'cyan');
}

async function processQuery(nlqi: PlantsNLQI, query: string, conversationId: string) {
  const startTime = Date.now();

  try {
    console.log(colorize('\nSearching...', 'gray'));

    const result = await nlqi.query(query, conversationId);
    const duration = Date.now() - startTime;

    // Display results
    console.log('\n' + colorize('Response:', 'blue'));
    console.log('─'.repeat(80));
    console.log(result.answer);
    console.log('─'.repeat(80));

    if (result.plants.length > 0) {
      console.log(colorize(`\n${result.plants.length} Matching Plants:`, 'green'));

      result.plants.slice(0, 5).forEach((match, i) => {
        const plant = match.plant;
        const scorePercent = (match.score * 100).toFixed(1);

        console.log(
          `\n${i + 1}. ${colorize(plant.scientificName, 'magenta')} (${plant.commonNames[0]})`
        );
        console.log(`   ${printScoreBar(match.score)} ${scorePercent}%`);
        console.log(`   ${plant.growthHabit.join(', ')} • ${plant.duration}`);

        // Show characteristics
        const chars: string[] = [];
        if (plant.characteristics.waterNeeds) {
          chars.push(`Water: ${plant.characteristics.waterNeeds}`);
        }
        if (plant.characteristics.sunRequirements) {
          chars.push(`Sun: ${plant.characteristics.sunRequirements.join(', ')}`);
        }
        if (plant.characteristics.wildlifeValue && plant.characteristics.wildlifeValue.length > 0) {
          chars.push(`Wildlife: ${plant.characteristics.wildlifeValue.slice(0, 2).join(', ')}`);
        }
        if (chars.length > 0) {
          console.log(`   ${colorize(chars.join(' • '), 'gray')}`);
        }
      });

      if (result.plants.length > 5) {
        console.log(colorize(`\n   ... and ${result.plants.length - 5} more plants`, 'gray'));
      }
    }

    // Display metadata
    console.log(colorize(`\nSearch Info:`, 'cyan'));
    console.log(`   Strategy: ${result.metadata.searchType}`);
    console.log(`   Results: ${result.metadata.totalResults}`);
    console.log(`   Time: ${duration}ms`);
    console.log();
  } catch (error) {
    console.error(colorize(`\n❌ Error: ${error}`, 'yellow'));
    console.log();
  }
}

async function runInteractiveMode() {
  printBanner();

  // Validate environment
  if (
    !process.env.ANTHROPIC_API_KEY ||
    !process.env.VOYAGE_API_KEY ||
    !process.env.PINECONE_API_KEY
  ) {
    console.error(colorize('❌ Missing required API keys in .env file', 'yellow'));
    console.error('   Required: ANTHROPIC_API_KEY, VOYAGE_API_KEY, PINECONE_API_KEY');
    process.exit(1);
  }

  if (!process.env.PINECONE_INDEX_NAME) {
    console.error(colorize('❌ PINECONE_INDEX_NAME not set in .env file', 'yellow'));
    process.exit(1);
  }

  console.log(colorize('Initializing system...', 'gray'));

  const nlqi = new PlantsNLQI({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    voyageApiKey: process.env.VOYAGE_API_KEY,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME,
    enableConversations: true,
  });

  // Health check
  console.log(colorize('Running health check...', 'gray'));
  const health = await nlqi.healthCheck();

  if (health.status !== 'healthy') {
    console.error(colorize('System health check failed', 'yellow'));
    console.error('   Services:', health.services);
  } else {
    console.log(colorize('All systems operational\n', 'green'));
  }

  // Start conversation
  let conversationId = nlqi.startConversation();
  console.log(colorize(`Conversation started (ID: ${conversationId.substring(0, 8)}...)`, 'cyan'));

  printHelp();

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize('> ', 'green'),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input === 'help') {
      printHelp();
      rl.prompt();
      return;
    }

    if (input === 'exit' || input === 'quit') {
      console.log(colorize('\nGoodbye!\n', 'cyan'));
      rl.close();
      process.exit(0);
    }

    if (input === 'new') {
      nlqi.endConversation(conversationId);
      conversationId = nlqi.startConversation();
      console.log(
        colorize(`\nNew conversation started (ID: ${conversationId.substring(0, 8)}...)`, 'cyan')
      );
      console.log();
      rl.prompt();
      return;
    }

    if (input === 'summary') {
      try {
        const summary = nlqi.getConversationSummary(conversationId);
        console.log(colorize('\nConversation Summary:', 'cyan'));
        console.log(`   ${summary}\n`);
      } catch (error) {
        console.log(colorize('\nNo conversation history yet\n', 'gray'));
      }
      rl.prompt();
      return;
    }

    // Process as query
    await processQuery(nlqi, input, conversationId);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(colorize('\nGoodbye!\n', 'cyan'));
    process.exit(0);
  });
}

async function runSingleQuery(query: string) {
  // Validate environment
  if (
    !process.env.ANTHROPIC_API_KEY ||
    !process.env.VOYAGE_API_KEY ||
    !process.env.PINECONE_API_KEY
  ) {
    console.error('❌ Missing required API keys in .env file');
    process.exit(1);
  }

  if (!process.env.PINECONE_INDEX_NAME) {
    console.error('❌ PINECONE_INDEX_NAME not set in .env file');
    process.exit(1);
  }

  const nlqi = new PlantsNLQI({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    voyageApiKey: process.env.VOYAGE_API_KEY,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME,
    enableConversations: false,
  });

  console.log(colorize(`\nQuery: "${query}"\n`, 'cyan'));

  const result = await nlqi.query(query);

  console.log(colorize('Response:', 'blue'));
  console.log('─'.repeat(80));
  console.log(result.answer);
  console.log('─'.repeat(80));

  if (result.plants.length > 0) {
    console.log(colorize(`\n${result.plants.length} Matching Plants:`, 'green'));
    result.plants.slice(0, 5).forEach((match, i) => {
      const plant = match.plant;
      console.log(
        `  ${i + 1}. ${plant.scientificName} (${plant.commonNames[0]}) - ${(match.score * 100).toFixed(1)}%`
      );
    });
  }

  console.log();
}

// Main
const args = process.argv.slice(2);

if (args.length > 0) {
  // Single query mode
  const query = args.join(' ');
  runSingleQuery(query).catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
} else {
  // Interactive mode
  runInteractiveMode().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}
