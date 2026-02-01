#!/usr/bin/env node

/**
 * CLI entry point for Codebase Q&A system
 */

import { Command } from 'commander';
import { discoverCodeFiles, getFileStats } from './utils/file-discovery.js';
import { ASTParser } from './parser/ast-parser.js';
import { readFile } from './utils/file-discovery.js';
import { globalLogger, LogLevel } from './utils/logger.js';
import { runPhase1Experiment } from './commands/phase-1-experiment.js';
import { phase2Experiment } from './commands/phase-2-experiment.js';
import { phase3Experiment } from './commands/phase-3-experiment.js';
import { runPhase3Ablation } from './commands/phase-3-ablation.js';
import { ingestCodebase } from './scripts/ingest-codebase.js';
import { runPhase4Demo } from './commands/phase-4-demo.js';

const program = new Command();

program
  .name('codebase-qa')
  .description('Educational RAG system for code understanding with adaptive retrieval')
  .version('0.1.0');

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
      console.log(`
✓ Found ${stats.totalFiles} code files`);
      console.log(`  Total size: ${formatBytes(stats.totalSize)}`);
      console.log(`
  By language:`);
      for (const [lang, count] of Object.entries(stats.byLanguage)) {
        console.log(`    - ${lang}: ${count} files`);
      }
    } catch (error) {
      console.error('✗ Discovery failed:', error);
      process.exit(1);
    }
  });

program
  .command('analyze <path>')
  .description('Analyze code structure of a file')
  .action((filePath: string) => {
    globalLogger.info(`Analyzing ${filePath}...`);
    try {
      const content = readFile(filePath);
      const parser = new ASTParser();
      const structure = parser.parseFile(filePath, content);
      console.log(`
✓ Analyzed ${filePath}`);
      console.log(`
  Language: ${structure.language}`);
      console.log(`  Code nodes found: ${structure.nodes.length}`);
    } catch (error) {
      console.error('✗ Analysis failed:', error);
      process.exit(1);
    }
  });

program
  .command('ingest <path>')
  .description('Ingest a codebase to build vector index')
  .action(async (path: string) => {
    globalLogger.info(`Ingesting codebase from ${path}...`);
    try {
      await ingestCodebase(path);
    } catch (error) {
      console.error('✗ Ingestion failed:', error);
      process.exit(1);
    }
  });

program
  .command('experiment <phase>')
  .description('Run experiments for a specific phase')
  .action(async (phase: string) => {
    try {
      if (phase === 'phase-1') {
        await runPhase1Experiment('./');
      } else if (phase === 'phase-2') {
        await phase2Experiment();
      } else if (phase === 'phase-3') {
        await phase3Experiment();
      } else if (phase === 'phase-3-ablation') {
        await runPhase3Ablation();
      } else if (phase === 'phase-4') {
        await runPhase4Demo();
      } else {
        console.error(`✗ Unknown phase: ${phase}`);
        console.log('Available phases: phase-1, phase-2, phase-3, phase-3-ablation, phase-4');
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ Experiment failed:', error);
      process.exit(1);
    }
  });

program
  .command('ask <query>')
  .description('Ask a question about the codebase')
  .action((query: string) => {
    console.log('\n⚠ Ask command not yet implemented (Phase 2+)');
    console.log(`  Query: "${query}"`);
  });

program.parse(process.argv);

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
