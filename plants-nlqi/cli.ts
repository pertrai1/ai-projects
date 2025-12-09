#!/usr/bin/env node
/**
 * Plants NLQI - Interactive CLI
 * Command-line interface for querying the USDA PLANTS database
 */

import dotenv from 'dotenv';
import * as readline from 'readline';
import { PlantsNLQI } from './src/core/plants-nlqi';

dotenv.config();

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function printBanner() {
  console.log(colors.green + colors.bright);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🌿 PLANTS Natural Language Query Interface         ║');
  console.log('║              USDA PLANTS Database Explorer                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

function printHelp() {
  console.log(colors.cyan + '\n📚 Example queries:' + colors.reset);
  console.log('  • "What native wildflowers are found in North Carolina?"');
  console.log('  • "Show me drought-tolerant plants"');
  console.log('  • "Which plants attract pollinators?"');
  console.log('  • "Find shrubs that grow in shade"');
  console.log('  • "What trees bloom in spring?"');
  console.log(colors.dim + '\nType "exit" or "quit" to exit\n' + colors.reset);
}

async function initializeSystem(): Promise<PlantsNLQI | null> {
  console.log(colors.dim + 'Initializing system...' + colors.reset);

  // Check environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(colors.yellow + '⚠️  ANTHROPIC_API_KEY not found in .env' + colors.reset);
    return null;
  }
  if (!process.env.VOYAGE_API_KEY) {
    console.error(colors.yellow + '⚠️  VOYAGE_API_KEY not found in .env' + colors.reset);
    return null;
  }
  if (!process.env.PINECONE_API_KEY) {
    console.error(colors.yellow + '⚠️  PINECONE_API_KEY not found in .env' + colors.reset);
    return null;
  }
  if (!process.env.PINECONE_INDEX_NAME) {
    console.error(colors.yellow + '⚠️  PINECONE_INDEX_NAME not found in .env' + colors.reset);
    return null;
  }

  try {
    const nlqi = new PlantsNLQI({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      voyageApiKey: process.env.VOYAGE_API_KEY,
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: process.env.PINECONE_INDEX_NAME,
    });

    // Run health check
    const health = await nlqi.healthCheck();

    if (!health.overall) {
      console.error(colors.yellow + '\n❌ System health check failed:' + colors.reset);
      console.error('  Claude:', health.claude ? '✅' : '❌');
      console.error('  Pinecone:', health.pinecone ? '✅' : '❌');
      console.error(
        colors.dim + '\nCheck your API keys and ensure Pinecone index is created.\n' + colors.reset
      );
      return null;
    }

    console.log(colors.green + '✅ System ready!\n' + colors.reset);
    return nlqi;
  } catch (error) {
    console.error(colors.yellow + '❌ Failed to initialize system:' + colors.reset, error);
    return null;
  }
}

async function processQuery(nlqi: PlantsNLQI, query: string) {
  const startTime = Date.now();

  console.log(colors.dim + '\n🔍 Searching...' + colors.reset);

  try {
    const result = await nlqi.query(query, 5);
    const duration = Date.now() - startTime;

    // Print results header
    console.log(
      colors.blue +
        colors.bright +
        '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        colors.reset
    );

    // Print matching plants
    console.log(colors.magenta + colors.bright + '🌱 Matching Plants:' + colors.reset);
    result.plants.forEach((match, i) => {
      const scoreBar = '█'.repeat(Math.round(match.score * 10));
      console.log(
        `\n  ${i + 1}. ${colors.bright}${match.plant.scientificName}${colors.reset} ` +
          `${colors.dim}(${match.plant.commonNames[0]})${colors.reset}`
      );
      console.log(
        `     ${colors.cyan}${scoreBar}${colors.reset} ${colors.dim}${(match.score * 100).toFixed(1)}% match${colors.reset}`
      );
      console.log(`     ${match.plant.growthHabit.join(', ')} • ${match.plant.duration}`);
    });

    // Print answer
    console.log(colors.blue + colors.bright + '\n💬 Answer:' + colors.reset);
    console.log(colors.dim + '─'.repeat(70) + colors.reset);
    console.log(result.answer);
    console.log(colors.dim + '─'.repeat(70) + colors.reset);

    // Print metadata
    console.log(
      colors.dim +
        `\n⏱️  Completed in ${duration}ms (${result.metadata.totalResults} results)\n` +
        colors.reset
    );
  } catch (error) {
    console.error(colors.yellow + '\n❌ Error processing query:' + colors.reset, error);
  }
}

async function runInteractiveMode(nlqi: PlantsNLQI) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.green + '🌿 Query> ' + colors.reset,
  });

  printHelp();
  rl.prompt();

  rl.on('line', async (line: string) => {
    const query = line.trim();

    if (!query) {
      rl.prompt();
      return;
    }

    if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
      console.log(colors.green + '\n👋 Thanks for using Plants NLQI!\n' + colors.reset);
      rl.close();
      process.exit(0);
    }

    if (query.toLowerCase() === 'help') {
      printHelp();
      rl.prompt();
      return;
    }

    await processQuery(nlqi, query);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(colors.green + '\n👋 Goodbye!\n' + colors.reset);
    process.exit(0);
  });
}

async function main() {
  printBanner();

  const nlqi = await initializeSystem();

  if (!nlqi) {
    console.log(
      colors.yellow +
        '\n⚠️  Failed to initialize. Please check your configuration.\n' +
        colors.reset
    );
    process.exit(1);
  }

  // Check if query was passed as argument
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Single query mode
    const query = args.join(' ');
    await processQuery(nlqi, query);
    process.exit(0);
  } else {
    // Interactive mode
    await runInteractiveMode(nlqi);
  }
}

main().catch((error) => {
  console.error(colors.yellow + '❌ Fatal error:' + colors.reset, error);
  process.exit(1);
});
