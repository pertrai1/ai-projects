#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import pino from 'pino';
import 'dotenv/config';

import { loadSpec, SpecValidationError, computeFactorialSize } from '../spec/loader.js';
import { runAudit } from '../index.js';
import { generateDiff, formatDiffReport } from '../report/diff.js';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});

async function executeAudit(specPath: string): Promise<void> {
  try {
    logger.info({ specPath }, 'Loading specification');
    const spec = loadSpec(specPath);

    const factorialSize = computeFactorialSize(spec);
    const totalEvaluations = factorialSize * spec.repetitions;

    console.log('');
    console.log(chalk.cyan('═'.repeat(42)));
    console.log(chalk.cyan.bold('  HireGauge Audit'));
    console.log(chalk.cyan('═'.repeat(42)));
    console.log(`  ${chalk.dim('Model:')}       ${chalk.white(spec.model.provider)}/${chalk.bold(spec.model.name)}`);
    console.log(`  ${chalk.dim('Mode:')}        ${chalk.white(spec.mode)}`);
    console.log(`  ${chalk.dim('Profiles:')}    ${chalk.yellow(factorialSize)}`);
    console.log(`  ${chalk.dim('Repetitions:')} ${chalk.white(spec.repetitions)}`);
    console.log(`  ${chalk.dim('Total Evals:')} ${chalk.yellow.bold(totalEvaluations)}`);
    console.log(`  ${chalk.dim('Prompt:')}      ${chalk.white(spec.prompt_version)}`);
    console.log(`  ${chalk.dim('Seed:')}        ${chalk.white(spec.seed)}`);
    console.log(chalk.cyan('═'.repeat(42)));
    console.log('');

    const result = await runAudit(spec, logger);

    console.log('');
    console.log(chalk.cyan('═'.repeat(42)));
    console.log(chalk.cyan.bold('  Results'));
    console.log(chalk.cyan('═'.repeat(42)));
    console.log(`  ${chalk.dim('Run ID:')}    ${chalk.white(result.runId)}`);
    console.log(`  ${chalk.dim('Artifacts:')} ${chalk.blue.underline(result.runDir + '/')}`);

    if (result.gateEvaluation.allPassed) {
      console.log(`  ${chalk.dim('Gates:')}     ${chalk.green.bold(result.gateEvaluation.summary)}`);
    } else {
      console.log(`  ${chalk.dim('Gates:')}     ${chalk.red.bold(result.gateEvaluation.summary)}`);
    }
    console.log(chalk.cyan('═'.repeat(42)));
    console.log('');

    if (!result.success) {
      console.log(chalk.red.bold('✗ Quality gates FAILED.') + chalk.dim(' See report for details.'));
      process.exit(1);
    }

    console.log(chalk.green.bold('✓ Audit completed successfully.'));
    process.exit(0);
  } catch (err) {
    if (err instanceof SpecValidationError) {
      console.error(chalk.red.bold('\n✗ Specification validation failed:'));
      for (const error of err.errors) {
        console.error(chalk.red(`  • ${error}`));
      }
      process.exit(1);
    }

    logger.error({ error: err instanceof Error ? err.message : String(err) }, 'Audit failed');
    console.error(chalk.red.bold('\n✗ Audit failed:'), err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

const program = new Command();

program
  .name('hire-gauge')
  .description('LLM hiring decision evaluation system')
  .version('1.0.0')
  .option('-s, --spec <path>', 'Path to experiment specification YAML file')
  .action(async (options) => {
    if (options.spec) {
      await executeAudit(options.spec);
    } else {
      program.help();
    }
  });

program
  .command('diff <runA> <runB>')
  .description('Compare results between two runs')
  .option('-t, --threshold <number>', 'Regression threshold', '0.1')
  .action((runA, runB, options) => {
    try {
      const threshold = parseFloat(options.threshold);
      const diff = generateDiff(runA, runB, threshold);
      const report = formatDiffReport(diff);
      console.log(report);

      if (diff.regressions.length > 0) {
        process.exit(1);
      }
      process.exit(0);
    } catch (err) {
      console.error(chalk.red('Diff failed:'), err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
