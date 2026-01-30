/**
 * Phase 1 Experiment Command
 *
 * Runs chunking experiments and produces a detailed report
 *
 * Usage:
 *   npm start experiment phase-1 /path/to/codebase
 */

import { runChunkingExperiments, getExampleTestQueries } from '../evaluations/phase-1-tests.js';
import { globalLogger, LogLevel } from '../utils/logger.js';

export async function runPhase1Experiment(codebaseDir: string): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ Phase 1: Code-Aware Chunking Experiment                       ║
║                                                                ║
║ This experiment compares 3 chunking strategies:               ║
║ 1. Fixed-size (baseline)                                       ║
║ 2. Semantic (by function)                                      ║
║ 3. Semantic with lookahead (context-aware)                    ║
╚════════════════════════════════════════════════════════════════╝
  `);

  globalLogger.setMinLevel(LogLevel.INFO);

  try {
    // Get test queries
    const testQueries = getExampleTestQueries();
    console.log(`\n📊 Running experiments with ${testQueries.length} test queries...\n`);

    // Run experiments
    const experiments = await runChunkingExperiments(codebaseDir, testQueries);

    // Display results
    displayResults(experiments);

    // Save results to file
    const resultsPath = './phase-1-results.json';
    const fs = await import('fs/promises');
    await fs.writeFile(resultsPath, JSON.stringify(experiments, null, 2));
    console.log(`\n✅ Results saved to ${resultsPath}`);
  } catch (error) {
    console.error('❌ Experiment failed:', error);
    process.exit(1);
  }
}

function displayResults(experiments: any[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 1 EXPERIMENT RESULTS: CHUNKING STRATEGIES COMPARISON');
  console.log('='.repeat(80));

  // Summary table
  console.log('\n📋 SUMMARY TABLE\n');
  console.log('Strategy          | Chunks | Avg Size | Token Eff | Precision | Recall | MRR');
  console.log('-'.repeat(80));

  for (const exp of experiments) {
    const row = `${exp.strategy.padEnd(17)} | ${exp.statistics.totalChunks
      .toString()
      .padEnd(6)} | ${exp.statistics.avgChunkSize.toString().padEnd(8)} | ${exp.statistics.tokenEfficiency
      .toFixed(2)
      .padEnd(9)} | ${exp.retrieval.metrics.precision.toFixed(2).padEnd(9)} | ${exp.retrieval.metrics.recall
      .toFixed(2)
      .padEnd(6)} | ${exp.retrieval.metrics.mrr.toFixed(3)}`;
    console.log(row);
  }

  // Detailed breakdown
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED BREAKDOWN');
  console.log('='.repeat(80));

  for (const exp of experiments) {
    console.log(`\n🔹 ${exp.strategy.toUpperCase()}`);
    console.log('-'.repeat(40));

    console.log('\n  Chunking Statistics:');
    console.log(`    • Total chunks: ${exp.statistics.totalChunks}`);
    console.log(`    • Avg chunk size: ${exp.statistics.avgChunkSize} characters`);
    console.log(`    • Token efficiency: ${exp.statistics.tokenEfficiency.toFixed(2)} chunks/1000 tokens`);

    console.log('\n  Retrieval Metrics:');
    console.log(`    • Precision: ${(exp.retrieval.metrics.precision * 100).toFixed(1)}%`);
    console.log(`    • Recall: ${(exp.retrieval.metrics.recall * 100).toFixed(1)}%`);
    console.log(`    • MRR (Mean Reciprocal Rank): ${exp.retrieval.metrics.mrr.toFixed(3)}`);
    console.log(`    • Avg relevance score: ${exp.retrieval.metrics.avgRelevanceScore.toFixed(3)}`);
    console.log(`    • Avg search time: ${exp.retrieval.avgSearchTime.toFixed(2)}ms`);

    console.log('\n  Trade-off Analysis:');
    console.log(`    • Speed vs Quality: ${exp.tradeoffs.speedVsQuality}`);
    console.log(`    • Token vs Recall: ${exp.tradeoffs.tokenVsRecall}`);
    console.log(`    • Complexity: ${exp.tradeoffs.complexity}`);
  }

  // Learning insights
  console.log('\n' + '='.repeat(80));
  console.log('KEY LEARNING INSIGHTS');
  console.log('='.repeat(80));

  const fixedExp = experiments.find((e) => e.strategy === 'fixed');
  const semanticExp = experiments.find((e) => e.strategy === 'semantic');
  const lookaheadExp = experiments.find((e) => e.strategy === 'semantic-lookahead');

  if (fixedExp && semanticExp) {
    const chunkDiff = fixedExp.statistics.totalChunks - semanticExp.statistics.totalChunks;
    const precisionDiff = semanticExp.retrieval.metrics.precision - fixedExp.retrieval.metrics.precision;

    console.log(`\n1. CHUNKING STRATEGY MATTERS`);
    console.log(`   Fixed strategy created ${Math.abs(chunkDiff)} ${chunkDiff > 0 ? 'more' : 'fewer'} chunks than semantic`);
    console.log(`   Semantic achieved ${Math.abs(precisionDiff * 100).toFixed(1)}% ${precisionDiff > 0 ? 'higher' : 'lower'} precision`);

    console.log(`\n2. CHUNK SIZE AFFECTS RETRIEVAL`);
    console.log(`   Fixed: avg ${fixedExp.statistics.avgChunkSize}chars`);
    console.log(`   Semantic: avg ${semanticExp.statistics.avgChunkSize}chars`);
    console.log(`   Smaller chunks = more results, but less context per result`);

    console.log(`\n3. TOKEN EFFICIENCY TRADE-OFF`);
    console.log(`   Fixed is ${(fixedExp.statistics.tokenEfficiency / semanticExp.statistics.tokenEfficiency).toFixed(1)}x more token-efficient`);
    console.log(`   But semantic retrieval quality is ${((semanticExp.retrieval.metrics.precision / fixedExp.retrieval.metrics.precision - 1) * 100).toFixed(1)}% better`);
  }

  console.log(`\n4. LOOKAHEAD PROVIDES CONTEXT`);
  if (lookaheadExp && semanticExp) {
    const recallImprovement = lookaheadExp.retrieval.metrics.recall - semanticExp.retrieval.metrics.recall;
    console.log(`   Adding lookahead changed recall by ${(recallImprovement * 100).toFixed(1)}%`);
    console.log(`   Useful when context of related code matters`);
  }

  console.log(`\n5. ONE-SIZE-FITS-ALL DOESN'T WORK`);
  console.log(`   Different query types may benefit from different strategies`);
  console.log(`   → LOCATION queries need high precision (semantic)`);
  console.log(`   → ARCHITECTURE queries need high recall (fixed)`);
  console.log(`   → Next phase: adaptive retrieval per intent`);

  // Recommendation
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATION FOR PHASE 2+');
  console.log('='.repeat(80));

  const bestRecall = experiments.reduce((best, exp) =>
    exp.retrieval.metrics.recall > best.retrieval.metrics.recall ? exp : best
  );
  const bestPrecision = experiments.reduce((best, exp) =>
    exp.retrieval.metrics.precision > best.retrieval.metrics.precision ? exp : best
  );

  console.log(`\n✨ Based on this experiment:`);
  console.log(`   • ${bestRecall.strategy}: Best for high-recall scenarios (ARCHITECTURE, USAGE)`);
  console.log(`   • ${bestPrecision.strategy}: Best for high-precision scenarios (LOCATION, IMPLEMENTATION)`);
  console.log(`   • Phase 2: Implement intent routing to choose strategy per query type`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const codebaseDir = process.argv[2] || '.';
  runPhase1Experiment(codebaseDir);
}
