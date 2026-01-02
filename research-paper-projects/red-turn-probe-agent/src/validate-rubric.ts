/**
 * Rubric Validation Script
 *
 * Tests the rubric against all test examples to ensure it correctly
 * classifies conversations as containing contradictions or not.
 *
 * Stop condition: All examples must pass for the rubric to be trusted.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluateContradiction } from "./rubric.js";
import type { ChatMessage } from "./llm-client.js";

/**
 * Structure of a test example file.
 */
interface TestExample {
  readonly id: string;
  readonly type: "positive" | "negative";
  readonly description: string;
  readonly conversation: readonly ChatMessage[];
  readonly expectedResult: boolean;
  readonly rationale: string;
}

/**
 * Result of validating a single example.
 */
interface ValidationResult {
  readonly example: TestExample;
  readonly actualResult: boolean;
  readonly passed: boolean;
}

/**
 * Load all test examples from a directory.
 *
 * @param directory - Path to directory containing JSON example files
 * @returns Array of test examples
 */
function loadExamples(directory: string): TestExample[] {
  const files = readdirSync(directory).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const path = join(directory, file);
    const content = readFileSync(path, "utf-8");
    return JSON.parse(content) as TestExample;
  });
}

/**
 * Validate a single test example against the rubric.
 *
 * @param example - Test example to validate
 * @returns Validation result with pass/fail status
 */
function validateExample(example: TestExample): ValidationResult {
  const actualResult = evaluateContradiction(example.conversation);
  const passed = actualResult === example.expectedResult;

  return {
    example,
    actualResult,
    passed,
  };
}

/**
 * Print validation results in a readable format.
 *
 * @param results - Array of validation results
 */
function printResults(results: readonly ValidationResult[]): void {
  console.log("\nRubric Validation Results");
  console.log("=========================\n");

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const status = result.passed ? "✓ PASS" : "✗ FAIL";
    const icon = result.passed ? "✓" : "✗";

    console.log(`${icon} ${result.example.id}: ${result.example.description}`);
    console.log(`  Type: ${result.example.type}`);
    console.log(`  Expected: ${result.example.expectedResult}`);
    console.log(`  Actual: ${result.actualResult}`);
    console.log(`  Status: ${status}`);

    if (!result.passed) {
      console.log(`  Rationale: ${result.example.rationale}`);
      failCount++;
    } else {
      passCount++;
    }

    console.log();
  }

  // Summary
  const total = results.length;
  console.log("Summary:");
  console.log(`  Total examples: ${total}`);
  console.log(`  Passed: ${passCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(
    `  Success rate: ${((passCount / total) * 100).toFixed(1)}%`
  );

  if (failCount === 0) {
    console.log("\n✓ All examples passed! Rubric is validated.");
  } else {
    console.log(
      `\n✗ ${failCount} example(s) failed. Rubric needs refinement.`
    );
  }
}

/**
 * Main validation function.
 *
 * Loads all test examples and validates the rubric against them.
 * Exits with error code if any examples fail.
 */
async function main(): Promise<void> {
  try {
    console.log("Loading test examples...\n");

    // Load positive and negative examples
    const positiveDir = "test-examples/positive";
    const negativeDir = "test-examples/negative";

    const positiveExamples = loadExamples(positiveDir);
    const negativeExamples = loadExamples(negativeDir);

    const allExamples = [...positiveExamples, ...negativeExamples];

    console.log(`Loaded ${positiveExamples.length} positive examples`);
    console.log(`Loaded ${negativeExamples.length} negative examples`);
    console.log(`Total: ${allExamples.length} examples\n`);

    // Validate each example
    const results = allExamples.map(validateExample);

    // Print results
    printResults(results);

    // Exit with error if any failed
    const failCount = results.filter((r) => !r.passed).length;
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\nError during validation:");
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error(`  ${String(error)}`);
    }
    process.exit(1);
  }
}

// Execute validation
main();
