#!/usr/bin/env node

/**
 * CLI entry point for Codebase Q&A system
 *
 * Usage:
 *   codebase-qa discover /path/to/codebase
 *   codebase-qa ingest /path/to/codebase
 *   codebase-qa ask "How does authentication work?"
 */

import { Command } from 'commander';
import { discoverCodeFiles, getFileStats } from './utils/file-discovery.js';
import { ASTParser } from './parser/ast-parser.js';
import { readFile } from './utils/file-discovery.js';
import { globalLogger, LogLevel } from './utils/logger.js';
import { runPhase1Experiment } from './commands/phase-1-experiment.js';
import { phase2Experiment } from './commands/phase-2-experiment.js';

const program = new Command();

program
  .name('codebase-qa')
  .description('Educational RAG system for code understanding with adaptive retrieval')
  .version('0.1.0');

/**
 * Discover command: Find all code files in a directory
 */
program
  .command('discover <path>')
  .description('Discover code files in a directory')
  .option('-v, --verbose', 'Show detailed output')
  .action((path: string, options: any) => {
    if (options.verbose) {
      globalLogger.setMinLevel(LogLevel.DEBUG);
    }

    globalLogger.info(`Discovering code files in ${path}...`);

    try {
      const files = discoverCodeFiles(path);
      const stats = getFileStats(files);

      console.log(`\n✓ Found ${stats.totalFiles} code files`);
      console.log(`  Total size: ${formatBytes(stats.totalSize)}`);
      console.log(`\n  By language:`);

      for (const [lang, count] of Object.entries(stats.byLanguage)) {
        console.log(`    - ${lang}: ${count} files`);
      }

      if (options.verbose) {
        console.log(`\n  Files discovered:`);
        files.slice(0, 10).forEach((f) => {
          console.log(`    - ${f.path}`);
        });
        if (files.length > 10) {
          console.log(`    ... and ${files.length - 10} more`);
        }
      }
    } catch (error) {
      console.error('✗ Discovery failed:', error);
      process.exit(1);
    }
  });

/**
 * Analyze command: Analyze code structure
 */
program
  .command('analyze <path>')
  .description('Analyze code structure of a file')
  .action((filePath: string) => {
    globalLogger.info(`Analyzing ${filePath}...`);

    try {
      const content = readFile(filePath);
      const parser = new ASTParser();
      const structure = parser.parseFile(filePath, content);

      console.log(`\n✓ Analyzed ${filePath}`);
      console.log(`\n  Language: ${structure.language}`);
      console.log(`  Code nodes found: ${structure.nodes.length}`);
      console.log(`  Imports: ${structure.imports.length}`);
      console.log(`  Exports: ${structure.exports.length}`);
      console.log(`  Dependencies: ${structure.dependencies.length}`);

      if (structure.nodes.length > 0) {
        console.log(`\n  Code structure:`);
        structure.nodes.forEach((node) => {
          console.log(`    - ${node.type}: ${node.name} (lines ${node.startLine}-${node.endLine})`);
        });
      }

      if (structure.imports.length > 0) {
        console.log(`\n  Imports:`);
        structure.imports.slice(0, 5).forEach((imp) => {
          console.log(`    - ${imp}`);
        });
        if (structure.imports.length > 5) {
          console.log(`    ... and ${structure.imports.length - 5} more`);
        }
      }
    } catch (error) {
      console.error('✗ Analysis failed:', error);
      process.exit(1);
    }
  });

/**
 * Ingest command: Build vector index from codebase
 * (Placeholder for Phase 1)
 */
program
  .command('ingest <path>')
  .description('Ingest a codebase to build vector index')
  .option('-o, --output <path>', 'Output index path')
  .action((path: string) => {
    globalLogger.info(`Ingesting codebase from ${path}...`);
    console.log('\n⚠ Ingest command not yet implemented (Phase 1)');
    console.log('  This phase will:');
    console.log('    1. Discover all code files');
    console.log('    2. Apply semantic chunking');
    console.log('    3. Create embeddings');
    console.log('    4. Build HNSW index');
  });

/**
 * Experiment command: Run Phase experiments
 */
program
  .command('experiment <phase> <path>')
  .description('Run experiments for a specific phase')
  .action(async (phase: string, path: string) => {
    try {
      if (phase === 'phase-1') {
        await runPhase1Experiment(path);
      } else if (phase === 'phase-2') {
        await phase2Experiment(path);
      } else {
        console.error(`✗ Unknown phase: ${phase}`);
        console.log('Available phases: phase-1 (chunking), phase-2 (intent)');
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ Experiment failed:', error);
      process.exit(1);
    }
  });

/**
 * Ask command: Query the system
 * (Placeholder for Phase 2+)
 */
program
  .command('ask <query>')
  .description('Ask a question about the codebase')
  .action((query: string) => {
    console.log('\n⚠ Ask command not yet implemented (Phase 2+)');
    console.log(`  Query: "${query}"`);
    console.log('  This phase will:');
    console.log('    1. Route query to appropriate intent type');
    console.log('    2. Use adaptive retrieval strategy');
    console.log('    3. Generate cited answer');
  });

/**
 * Help command
 */
program
  .command('help')
  .description('Show detailed help')
  .action(() => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  Codebase Q&A - Educational RAG System for Code              ║
║                                                               ║
║  Learn how to build intelligent code-aware RAG systems       ║
║  that understand query intent and adapt retrieval.           ║
╚═══════════════════════════════════════════════════════════════╝

PHASES:

Phase 0 (Current): Foundation & Setup
  - Discover code files
  - Parse code structure (AST)
  - Understand code as data

Phase 1: Code-Aware Chunking
  - Semantic vs fixed chunking
  - Chunk metadata preservation
  - Experiment on retrieval quality

Phase 2: Intent Classification
  - Query intent types (8 types)
  - Entity extraction
  - Confidence scoring

Phase 3: Adaptive Retrieval (CORE LEARNING)
  - Parameter tuning per intent
  - Ablation studies
  - Trade-off analysis

Phase 4-7: Generation, Evaluation, Conversation, Documentation

COMMANDS:

  discover <path>        Find all code files
  analyze <path>         Analyze code structure
  experiment <phase> <path>  Run phase experiments (e.g., experiment phase-1 /path)
  ingest <path>          Build vector index (Phase 1)
  ask <query>            Ask a question (Phase 2+)

OPTIONS:

  -v, --verbose          Detailed output
  -h, --help             Show this help

LEARNING:

  Read: docs/LEARNING.md - Complete learning guide
  Read: docs/PLAN.md    - Implementation plan with concepts

    `);
  });

/**
 * Handle no command
 */
if (process.argv.length < 3) {
  program.outputHelp();
}

program.parse(process.argv);

/**
 * Utility function: Format bytes to human-readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
