#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { evaluationTasks } from './fixtures/tasks.js';
import { defaultAgents } from './config/agents.js';
import { createLLMClient } from './llm/client.js';
import { runExperiment } from './experiment/runner.js';
import { computeMetrics } from './metrics/compute.js';
import { writeResults } from './results/writer.js';
import type { Condition } from './schema/experiment.js';
import type { ExperimentMetrics } from './metrics/compute.js';

const program = new Command();

program
  .name('expert-probe')
  .description('Evaluation harness for measuring expertise dilution in multi-agent LLM systems')
  .version('0.1.0');

function printMetricsSummary(metrics: ExperimentMetrics): void {
  console.log('');
  console.log(chalk.bold(`Experiment: ${metrics.experimentId}`));
  console.log(chalk.dim(`Condition: ${metrics.condition}`));
  console.log(chalk.dim(`Tasks: ${metrics.totalTasks}`));
  console.log('');
  console.log(`  Expert Accuracy:  ${chalk.green((metrics.expertAccuracy * 100).toFixed(1))}%  (${metrics.expertCorrectCount}/${metrics.totalTasks})`);
  console.log(`  Team Accuracy:    ${chalk.yellow((metrics.teamAccuracy * 100).toFixed(1))}%  (${metrics.teamCorrectCount}/${metrics.totalTasks})`);

  const deltaColor = metrics.accuracyDelta < 0 ? chalk.red : metrics.accuracyDelta > 0 ? chalk.green : chalk.dim;
  const deltaSign = metrics.accuracyDelta >= 0 ? '+' : '';
  console.log(`  Accuracy Delta:   ${deltaColor(`${deltaSign}${(metrics.accuracyDelta * 100).toFixed(1)}%`)}`);
  console.log('');

  console.log(chalk.bold('  Per-task breakdown:'));
  for (const tm of metrics.taskMetrics) {
    const expertIcon = tm.expertCorrect ? chalk.green('\u2713') : chalk.red('\u2717');
    const teamIcon = tm.teamCorrect ? chalk.green('\u2713') : chalk.red('\u2717');
    console.log(`    ${tm.taskId}: Expert ${expertIcon}  Team ${teamIcon}  (correct: ${tm.correctAnswer})`);
  }
  console.log('');
}

program
  .command('run')
  .description('Run the expertise dilution experiment')
  .option('-c, --condition <condition>', 'Condition: expert-hidden or expert-revealed (default: both)')
  .option('-m, --model <model>', 'LLM model to use', 'gpt-4o-mini')
  .option('-t, --temperature <temp>', 'Temperature for LLM calls', '0')
  .option('-o, --output-dir <dir>', 'Output directory for results', 'results')
  .action(async (options: { condition?: string; model: string; temperature: string; outputDir: string }) => {
    const conditions: Condition[] = options.condition
      ? [options.condition as Condition]
      : ['expert-hidden', 'expert-revealed'];

    const client = createLLMClient({
      model: options.model,
      temperature: parseFloat(options.temperature),
    });

    const tasksMap = new Map(evaluationTasks.map((t) => [t.id, t.correctAnswer]));
    const taskIds = evaluationTasks.map((t) => t.id);

    console.log(chalk.bold('\nExpertProbe - Expertise Dilution Experiment'));
    console.log(chalk.dim(`Model: ${options.model}  |  Tasks: ${evaluationTasks.length}  |  Conditions: ${conditions.join(', ')}\n`));

    for (const condition of conditions) {
      console.log(chalk.blue(`\nRunning condition: ${condition}...`));

      const result = await runExperiment({
        experimentId: `${condition}-${Date.now()}`,
        condition,
        tasks: evaluationTasks,
        agents: [...defaultAgents],
        client,
      });

      const metrics = computeMetrics(result, tasksMap);
      const resultDir = writeResults({
        outputDir: options.outputDir,
        metrics,
        rawResult: result,
      });

      printMetricsSummary(metrics);
      console.log(chalk.dim(`  Results saved to: ${resultDir}`));
    }

    console.log(chalk.bold('\nExperiment complete.\n'));
  });

program.parse();
