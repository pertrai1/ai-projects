#!/usr/bin/env tsx

import dotenv from "dotenv";
import ora from "ora";
import chalk from "chalk";
import { loadDataset, getDatasetStats } from "./utils/dataset-loader.js";
import { BraintrustEvaluator } from "../src/agents/braintrust-evaluator.js";
import { displayReport, exportJSON } from "./reporters/console-reporter.js";
import { SqlGenerationWorkflow } from "../src/workflows/sql-generation.js";
import { SchemaLoader } from "../src/agents/schema-loader.js";
import { QueryGenerator } from "../src/agents/query-generator.js";
import { SqlValidator } from "../src/agents/sql-validator.js";
import { QueryExecutor } from "../src/agents/query-executor.js";
import { LLMClient } from "../src/utils/llm-client.js";
import { SpecLoader } from "../src/tools/spec-loader.js";
import { calculateTableAccuracy } from "./metrics/table-accuracy.js";
import { calculateSafetyValidation } from "./metrics/safety-validation.js";
import { calculateValidationAccuracy } from "./metrics/validation-accuracy.js";
import { calculateQueryCorrectness } from "./metrics/query-correctness.js";
import {
  EvaluationRecord,
  MetricResults,
  EvalTestCase,
} from "../src/types/index.js";

// Load environment variables
dotenv.config();

interface EvalOptions {
  dataset?: string;
  category?: string;
  sample?: number;
  ci?: boolean;
  json?: boolean;
  local?: boolean;
  verbose?: boolean;
}

/**
 * Main evaluation runner
 */
async function runEvaluation(options: EvalOptions = {}): Promise<number> {
  const startTime = Date.now();

  console.log(chalk.bold.cyan("\n🚀 QueryCraft Evaluation Framework\n"));

  // Load dataset
  const spinner = ora("Loading test dataset...").start();
  const testCases = await loadDataset(options.dataset, {
    category: options.category,
    sample: options.sample,
  });

  const stats = getDatasetStats(testCases);
  spinner.succeed(
    `Loaded ${testCases.length} test cases (${stats.shouldPass} should pass, ${stats.shouldFail} should fail)`
  );

  // Initialize Braintrust
  const evaluator = new BraintrustEvaluator({
    localMode: options.local || !process.env.BRAINTRUST_API_KEY,
  });

  const experimentId = await evaluator.initExperiment();

  // Initialize workflow with all agents
  const llmClient = new LLMClient({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });
  const specLoader = new SpecLoader();

  const schemaLoader = new SchemaLoader("./data/schemas");
  const queryGenerator = new QueryGenerator(llmClient, specLoader);
  const sqlValidator = new SqlValidator(llmClient, specLoader);
  const queryExecutor = new QueryExecutor({
    maxResultRows: 100,
    queryTimeout: 5000,
  });

  const workflow = new SqlGenerationWorkflow(
    schemaLoader,
    queryGenerator,
    sqlValidator,
    queryExecutor,
    { executeQueries: false } // Don't execute queries during eval
  );

  // Run evaluations
  const progressSpinner = options.ci
    ? null
    : ora("Starting evaluation...").start();

  const records: EvaluationRecord[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const testNum = i + 1;

    if (progressSpinner) {
      progressSpinner.text = `Evaluating: ${testNum}/${testCases.length} - ${testCase.question.substring(0, 50)}...`;
    } else if (options.ci) {
      console.log(`[${testNum}/${testCases.length}] ${testCase.question}`);
    }

    try {
      const record = await evaluateTestCase(testCase, workflow, options);
      records.push(record);
      await evaluator.logResult(record);

      if (options.verbose) {
        console.log(
          chalk.gray(
            `  → ${record.passed ? chalk.green("✓") : chalk.red("✗")} ${testCase.id}: correctness=${record.metrics.queryCorrectness.toFixed(2)}`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`\n❌ Failed to evaluate test case ${testCase.id}:`),
        error
      );

      // Create error record
      const errorRecord: EvaluationRecord = {
        testCase,
        generated: {
          query: "",
          explanation: "",
          confidence: "low",
          isValid: false,
          safetyChecks: false,
          errors: [error instanceof Error ? error.message : String(error)],
          canExecute: false,
          schemaUsed: "",
        },
        metrics: {
          queryCorrectness: 0,
          tableAccuracy: 0,
          safetyValidation: 0,
          validationAccuracy: 0,
          error: error instanceof Error ? error.message : String(error),
        },
        passed: false,
        duration: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };

      records.push(errorRecord);
      await evaluator.logResult(errorRecord);
    }
  }

  if (progressSpinner) {
    progressSpinner.succeed(
      `Completed ${testCases.length} test cases in ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );
  }

  // Finalize and get summary
  const summary = await evaluator.finalizeExperiment(experimentId);

  // Display report
  displayReport(summary);

  // Export JSON if requested
  if (options.json) {
    const jsonPath = `evals/results/${experimentId}.json`;
    await exportJSON(summary, jsonPath);
  }

  // Return exit code
  const allThresholdsPassed =
    summary.thresholdStatus.queryCorrectness.passed &&
    summary.thresholdStatus.safetyValidation.passed &&
    summary.thresholdStatus.validationAccuracy.passed;

  return allThresholdsPassed ? 0 : 1;
}

/**
 * Evaluate a single test case
 */
async function evaluateTestCase(
  testCase: EvalTestCase & { id: string },
  workflow: SqlGenerationWorkflow,
  options: EvalOptions
): Promise<EvaluationRecord> {
  const startTime = Date.now();

  // Execute workflow with timeout
  const timeoutMs = 30000; // 30 seconds
  const result = await Promise.race([
    workflow.execute({
      question: testCase.question,
      database: "ecommerce",
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Execution timeout")), timeoutMs)
    ),
  ]);

  const generated = result as any;

  // Calculate all metrics in parallel
  const [queryCorrectness, tableAccuracy, safetyValidation, validationAccuracy] =
    await Promise.all([
      calculateQueryCorrectness(
        generated.query,
        testCase.expectedQuery || "",
        undefined
      ),
      calculateTableAccuracy(
        generated.query,
        testCase.expectedTables || []
      ),
      calculateSafetyValidation(
        {
          isValid: generated.isValid,
          syntaxValid: true,
          schemaValid: true,
          safetyValid: generated.safetyChecks,
          complexityScore: "low",
          errors: generated.errors,
        },
        testCase.shouldPass
      ),
      calculateValidationAccuracy(
        {
          isValid: generated.isValid,
          syntaxValid: true,
          schemaValid: true,
          safetyValid: generated.safetyChecks,
          complexityScore: "low",
          errors: generated.errors,
        },
        testCase.shouldPass
      ),
    ]);

  const metrics: MetricResults = {
    queryCorrectness: queryCorrectness.score,
    tableAccuracy: tableAccuracy.score,
    safetyValidation: safetyValidation.score,
    validationAccuracy: validationAccuracy.score,
    error: queryCorrectness.error || tableAccuracy.error || safetyValidation.error || validationAccuracy.error,
  };

  // Determine if test passed
  // A test passes if safety validation is correct (critical)
  // and either the query should fail (and does) or should pass with reasonable correctness
  const passed = testCase.shouldPass
    ? metrics.safetyValidation === 1.0 &&
      metrics.validationAccuracy === 1.0 &&
      metrics.queryCorrectness >= 0.5
    : metrics.safetyValidation === 1.0 && metrics.validationAccuracy === 1.0;

  const duration = Date.now() - startTime;

  return {
    testCase,
    generated,
    metrics,
    passed,
    duration,
    timestamp: new Date(),
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: EvalOptions = {
    ci: args.includes("--ci"),
    json: args.includes("--json"),
    local: args.includes("--local"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };

  // Parse --category
  const categoryIndex = args.indexOf("--category");
  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    options.category = args[categoryIndex + 1];
  }

  // Parse --sample
  const sampleIndex = args.indexOf("--sample");
  if (sampleIndex !== -1 && args[sampleIndex + 1]) {
    options.sample = parseInt(args[sampleIndex + 1], 10);
  }

  // Parse --dataset
  const datasetIndex = args.indexOf("--dataset");
  if (datasetIndex !== -1 && args[datasetIndex + 1]) {
    options.dataset = args[datasetIndex + 1];
  }

  runEvaluation(options)
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error(chalk.red("\n❌ Evaluation failed:"), error);
      process.exit(1);
    });
}

export { runEvaluation };
