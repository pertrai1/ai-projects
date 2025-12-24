import chalk from "chalk";
import { EvaluationSummary } from "../../src/types/index.js";

/**
 * Format and display evaluation summary to console
 */
export function displayReport(summary: EvaluationSummary): void {
  console.log("\n");
  console.log(
    chalk.bold.cyan("╔════════════════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("║       QueryCraft Evaluation Report             ║")
  );
  console.log(
    chalk.bold.cyan("╚════════════════════════════════════════════════╝")
  );
  console.log();

  // Experiment info
  console.log(chalk.bold("Experiment:"), summary.experimentId);
  console.log(
    chalk.bold("Duration:"),
    formatDuration(summary.totalDuration)
  );
  console.log();

  // Test summary
  const passRate = (summary.passedTests / summary.totalTests) * 100;
  console.log(
    chalk.bold("Total Tests:"),
    chalk.white(summary.totalTests.toString()),
    " | ",
    chalk.bold("Passed:"),
    chalk.green(summary.passedTests.toString()),
    " | ",
    chalk.bold("Failed:"),
    chalk.red(summary.failedTests.toString()),
    ` (${passRate.toFixed(0)}%)`
  );
  console.log();

  // Metrics
  console.log(chalk.bold.underline("Metrics:"));

  const qc = summary.averageMetrics.queryCorrectness;
  const qcThreshold = summary.thresholdStatus.queryCorrectness;
  console.log(
    formatMetricLine(
      "Query Correctness:",
      qc,
      qcThreshold.threshold,
      qcThreshold.passed
    )
  );

  const ta = summary.averageMetrics.tableAccuracy;
  console.log(
    "  " +
      chalk.bold("Table Accuracy:").padEnd(30) +
      chalk.white(ta.toFixed(2)) +
      chalk.gray(" / N/A")
  );

  const sv = summary.averageMetrics.safetyValidation;
  const svThreshold = summary.thresholdStatus.safetyValidation;
  console.log(
    formatMetricLine(
      "Safety Validation:",
      sv,
      svThreshold.threshold,
      svThreshold.passed
    )
  );

  const va = summary.averageMetrics.validationAccuracy;
  const vaThreshold = summary.thresholdStatus.validationAccuracy;
  console.log(
    formatMetricLine(
      "Validation Accuracy:",
      va,
      vaThreshold.threshold,
      vaThreshold.passed
    )
  );

  const cc = summary.confidenceCalibration;
  const ccStatus =
    cc >= 0.8 ? "well-calibrated" : cc >= 0.5 ? "moderate" : "poor";
  console.log(
    "  " +
      chalk.blue("ℹ") +
      " " +
      chalk.bold("Confidence Calibration:").padEnd(29) +
      chalk.white(cc.toFixed(2)) +
      chalk.gray(` (${ccStatus})`)
  );
  console.log();

  // By category
  console.log(chalk.bold.underline("By Category:"));
  const categories = Object.entries(summary.byCategory).sort(
    (a, b) => b[1].total - a[1].total
  );

  for (const [category, stats] of categories) {
    const catPassRate = (stats.passed / stats.total) * 100;
    const icon = stats.passed === stats.total ? "✓" : stats.passed > 0 ? "~" : "✗";
    const color =
      stats.passed === stats.total
        ? chalk.green
        : stats.passed > 0
          ? chalk.yellow
          : chalk.red;

    console.log(
      "  " +
        color(icon) +
        " " +
        chalk.bold(category.padEnd(20)) +
        color(`${stats.passed}/${stats.total} passed`) +
        chalk.gray(` (${catPassRate.toFixed(0)}%)`)
    );
  }
  console.log();

  // Overall status
  const allThresholdsPassed =
    qcThreshold.passed && svThreshold.passed && vaThreshold.passed;

  if (allThresholdsPassed) {
    console.log(
      chalk.green.bold("✅ Overall: PASSED") +
        chalk.gray(" (all thresholds met)")
    );
  } else {
    const failedThresholds = [];
    if (!qcThreshold.passed) failedThresholds.push("Query Correctness");
    if (!svThreshold.passed) failedThresholds.push("Safety Validation");
    if (!vaThreshold.passed) failedThresholds.push("Validation Accuracy");

    console.log(
      chalk.red.bold("❌ Overall: FAILED") +
        chalk.gray(` (${failedThresholds.length} threshold(s) not met)`)
    );
    console.log(
      chalk.red("   Failed: ") + chalk.white(failedThresholds.join(", "))
    );
  }

  console.log();
}

/**
 * Format a metric line with threshold comparison
 */
function formatMetricLine(
  label: string,
  actual: number,
  threshold: number,
  passed: boolean
): string {
  const icon = passed ? chalk.green("✓") : chalk.red("✗");
  const status = passed ? chalk.green("PASS") : chalk.red("FAIL");

  return (
    "  " +
    icon +
    " " +
    chalk.bold(label.padEnd(29)) +
    chalk.white(actual.toFixed(2)) +
    chalk.gray(` / ${threshold.toFixed(2)}`) +
    " " +
    status
  );
}

/**
 * Format duration in ms to human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Export summary as JSON
 */
export async function exportJSON(
  summary: EvaluationSummary,
  outputPath: string
): Promise<void> {
  const fs = await import("fs/promises");
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        ...summary,
        timestamp: summary.timestamp.toISOString(),
      },
      null,
      2
    )
  );
  console.log(chalk.gray(`📄 JSON report exported to: ${outputPath}`));
}
