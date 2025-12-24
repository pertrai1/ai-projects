import { MetricCalculatorResult } from "../../src/types/index.js";
import { SqlValidatorOutput } from "../../src/types/index.js";

/**
 * Calculate validation accuracy metric
 * Compares validator's overall validation result with expected outcome
 *
 * This checks if the validator correctly identified valid/invalid SQL
 * considering syntax, schema, and safety checks
 *
 * @param validationResult - Output from SQL validator
 * @param shouldPass - Whether the query should pass validation
 * @returns Score of 1.0 (correct) or 0.0 (incorrect)
 */
export async function calculateValidationAccuracy(
  validationResult: SqlValidatorOutput,
  shouldPass: boolean
): Promise<MetricCalculatorResult> {
  try {
    const { isValid, syntaxValid, schemaValid, safetyValid, errors } =
      validationResult;

    // Determine if validation result matches expectation
    const isCorrect = isValid === shouldPass;

    let reasoning: string;
    let validationType: string;

    if (isCorrect) {
      if (shouldPass) {
        validationType = "correct acceptance";
        reasoning = "Valid query correctly validated";
      } else {
        validationType = "correct rejection";
        // Categorize the error
        const errorCategory = categorizeError(errors);
        reasoning = `Invalid query correctly rejected (${errorCategory})`;
      }
    } else {
      if (shouldPass) {
        validationType = "false rejection";
        // This is a problem - valid query was rejected
        const errorCategory = categorizeError(errors);
        reasoning = `Valid query incorrectly rejected (${errorCategory}) - Investigation needed`;
      } else {
        validationType = "false acceptance";
        reasoning = "Invalid query incorrectly accepted - Validator failed to catch error";
      }
    }

    return {
      score: isCorrect ? 1.0 : 0.0,
      reasoning: `${reasoning} (${validationType})`,
    };
  } catch (error) {
    return {
      score: 0.0,
      error: `Failed to calculate validation accuracy: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Categorize validation errors for better reporting
 */
function categorizeError(errors: string[]): string {
  if (errors.length === 0) {
    return "unknown";
  }

  const errorText = errors.join(" ").toLowerCase();

  if (
    errorText.includes("table") &&
    (errorText.includes("not exist") || errorText.includes("does not exist"))
  ) {
    return "schema violation - table not found";
  }

  if (
    errorText.includes("column") &&
    (errorText.includes("not exist") || errorText.includes("does not exist"))
  ) {
    return "schema violation - column not found";
  }

  if (
    errorText.includes("drop") ||
    errorText.includes("delete") ||
    errorText.includes("update") ||
    errorText.includes("insert")
  ) {
    return "safety violation - dangerous operation";
  }

  if (errorText.includes("syntax") || errorText.includes("parse")) {
    return "syntax error";
  }

  if (errorText.includes("injection") || errorText.includes("sql injection")) {
    return "safety violation - SQL injection";
  }

  return "other validation error";
}
