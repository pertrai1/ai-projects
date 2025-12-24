import fs from "fs/promises";
import path from "path";
import { EvalDataset, EvalTestCase } from "../../src/types/index.js";

export interface DatasetLoadOptions {
  category?: string;
  sample?: number;
}

/**
 * Load and validate evaluation dataset from JSON file
 *
 * @param datasetPath - Path to dataset JSON file (defaults to data/evals/sql-test-cases.json)
 * @param options - Filtering and sampling options
 * @returns Array of test cases
 */
export async function loadDataset(
  datasetPath?: string,
  options: DatasetLoadOptions = {}
): Promise<Array<EvalTestCase & { id: string }>> {
  try {
    // Default path
    const filePath =
      datasetPath ||
      path.join(process.cwd(), "data", "evals", "sql-test-cases.json");

    // Read and parse JSON
    const fileContent = await fs.readFile(filePath, "utf-8");
    const dataset: EvalDataset = JSON.parse(fileContent);

    // Validate dataset structure
    if (!dataset.testCases || !Array.isArray(dataset.testCases)) {
      throw new Error("Invalid dataset: missing 'testCases' array");
    }

    let testCases = dataset.testCases;

    // Validate each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      if (!testCase.id) {
        throw new Error(`Invalid test case at index ${i}: missing 'id'`);
      }
      if (!testCase.question && testCase.question !== "") {
        throw new Error(
          `Invalid test case at index ${i}: missing 'question'`
        );
      }
      if (testCase.shouldPass === undefined) {
        throw new Error(
          `Invalid test case at index ${i}: missing 'shouldPass'`
        );
      }
      if (!testCase.category) {
        throw new Error(
          `Invalid test case at index ${i}: missing 'category'`
        );
      }
    }

    // Filter by category if specified
    if (options.category) {
      testCases = testCases.filter((tc) => tc.category === options.category);
      console.log(
        `Filtered to ${testCases.length} test cases (category: ${options.category})`
      );
    }

    // Sample if specified
    if (options.sample && options.sample < testCases.length) {
      testCases = testCases.slice(0, options.sample);
      console.log(`Sampled first ${testCases.length} test cases`);
    }

    console.log(
      `✅ Loaded ${testCases.length} test cases from ${path.basename(filePath)}`
    );
    console.log(`   Dataset version: ${dataset.version}`);
    console.log(`   Created: ${dataset.created}`);

    return testCases;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load dataset: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get summary statistics about a dataset
 */
export function getDatasetStats(
  testCases: Array<EvalTestCase & { id: string }>
): Record<string, any> {
  const stats = {
    total: testCases.length,
    byCategory: {} as Record<string, number>,
    shouldPass: 0,
    shouldFail: 0,
  };

  for (const testCase of testCases) {
    // Count by category
    stats.byCategory[testCase.category] =
      (stats.byCategory[testCase.category] || 0) + 1;

    // Count pass/fail
    if (testCase.shouldPass) {
      stats.shouldPass++;
    } else {
      stats.shouldFail++;
    }
  }

  return stats;
}
