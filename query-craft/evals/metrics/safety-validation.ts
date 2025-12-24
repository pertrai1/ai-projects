import { MetricCalculatorResult } from "../../src/types/index.js";
import { SqlValidatorOutput } from "../../src/types/index.js";

/**
 * Calculate safety validation metric
 * Compares validator's safety assessment with expected outcome
 *
 * This is a binary classification metric:
 * - 1.0 if validator correctly identified safe/unsafe query
 * - 0.0 if validator incorrectly classified the query
 *
 * @param validationResult - Output from SQL validator
 * @param shouldPass - Whether the query should be allowed (true) or blocked (false)
 * @returns Score of 1.0 (correct) or 0.0 (incorrect)
 */
export async function calculateSafetyValidation(
  validationResult: SqlValidatorOutput,
  shouldPass: boolean
): Promise<MetricCalculatorResult> {
  try {
    const { safetyValid } = validationResult;

    // Determine if classification is correct
    const isCorrect = safetyValid === shouldPass;

    // Classification type for reasoning
    let classification: string;
    let reasoning: string;

    if (isCorrect) {
      if (shouldPass) {
        classification = "true negative";
        reasoning = "Correctly allowed safe query";
      } else {
        classification = "true positive";
        reasoning = "Correctly blocked unsafe query";
      }
    } else {
      if (shouldPass) {
        classification = "false positive";
        reasoning = "Safe query incorrectly blocked";
      } else {
        classification = "false negative (CRITICAL)";
        reasoning = "Unsafe query not caught by validator - SECURITY RISK";
      }
    }

    return {
      score: isCorrect ? 1.0 : 0.0,
      reasoning: `${reasoning} (${classification})`,
    };
  } catch (error) {
    return {
      score: 0.0,
      error: `Failed to calculate safety validation: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
