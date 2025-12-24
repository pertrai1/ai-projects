import { MetricCalculatorResult, ConfidenceGroup } from "../../src/types/index.js";
import { SqlGenerationOutput } from "../../src/types/index.js";

/**
 * Calculate confidence calibration metric
 * Measures how well confidence scores predict actual correctness
 *
 * This is an aggregate metric that requires all test results
 *
 * @param results - Array of test results with confidence and correctness
 * @returns Calibration score between 0.0 (poor) and 1.0 (perfect)
 */
export async function calculateConfidenceCalibration(
  results: Array<{
    generated: SqlGenerationOutput;
    queryCorrectness: number;
  }>
): Promise<MetricCalculatorResult> {
  try {
    // Require minimum number of results for meaningful calibration
    if (results.length < 10) {
      return {
        score: 0.0,
        reasoning: `Insufficient data for calibration (need ≥ 10 cases, got ${results.length})`,
      };
    }

    // Group results by confidence level
    const groups: Map<string, ConfidenceGroup> = new Map([
      ["high", { confidence: "high", total: 0, correct: 0, accuracy: 0 }],
      ["medium", { confidence: "medium", total: 0, correct: 0, accuracy: 0 }],
      ["low", { confidence: "low", total: 0, correct: 0, accuracy: 0 }],
    ]);

    // Count correct queries per confidence group
    for (const result of results) {
      const confidence = result.generated.confidence;
      const isCorrect = result.queryCorrectness >= 0.5; // Consider 0.5+ as correct

      const group = groups.get(confidence);
      if (group) {
        group.total++;
        if (isCorrect) {
          group.correct++;
        }
      }
    }

    // Calculate accuracy per group
    for (const group of groups.values()) {
      if (group.total > 0) {
        group.accuracy = group.correct / group.total;
      }
    }

    // Calculate calibration score
    // Ideal: high confidence → high accuracy, low confidence → low accuracy
    // We use a correlation-like metric

    const highGroup = groups.get("high")!;
    const mediumGroup = groups.get("medium")!;
    const lowGroup = groups.get("low")!;

    // Expected accuracies for well-calibrated system
    const expectedHigh = 0.9; // High confidence should be ~90% accurate
    const expectedMedium = 0.7; // Medium confidence should be ~70% accurate
    const expectedLow = 0.4; // Low confidence should be ~40% accurate

    // Calculate deviation from expected accuracies
    let totalDeviation = 0;
    let groupsWithData = 0;

    if (highGroup.total > 0) {
      totalDeviation += Math.abs(highGroup.accuracy - expectedHigh);
      groupsWithData++;
    }

    if (mediumGroup.total > 0) {
      totalDeviation += Math.abs(mediumGroup.accuracy - expectedMedium);
      groupsWithData++;
    }

    if (lowGroup.total > 0) {
      totalDeviation += Math.abs(lowGroup.accuracy - expectedLow);
      groupsWithData++;
    }

    if (groupsWithData === 0) {
      return {
        score: 0.0,
        reasoning: "No confidence data available",
      };
    }

    // Average deviation
    const avgDeviation = totalDeviation / groupsWithData;

    // Convert to score (lower deviation = higher score)
    const score = Math.max(0, 1.0 - avgDeviation);

    // Generate reasoning
    let reasoning = `Calibration score: ${score.toFixed(2)}. `;
    reasoning += `High: ${highGroup.total > 0 ? `${(highGroup.accuracy * 100).toFixed(0)}%` : "N/A"} `;
    reasoning += `(expected ~90%), `;
    reasoning += `Medium: ${mediumGroup.total > 0 ? `${(mediumGroup.accuracy * 100).toFixed(0)}%` : "N/A"} `;
    reasoning += `(expected ~70%), `;
    reasoning += `Low: ${lowGroup.total > 0 ? `${(lowGroup.accuracy * 100).toFixed(0)}%` : "N/A"} `;
    reasoning += `(expected ~40%). `;

    if (score >= 0.8) {
      reasoning += "Well-calibrated confidence levels.";
    } else if (score >= 0.5) {
      reasoning += "Moderate calibration - some deviation from expected.";
    } else {
      reasoning += "Poor calibration - confidence levels do not predict accuracy well.";
    }

    return {
      score,
      reasoning,
    };
  } catch (error) {
    return {
      score: 0.0,
      error: `Failed to calculate confidence calibration: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
