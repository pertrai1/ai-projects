import { initLogger } from "braintrust";
import fs from "fs/promises";
import path from "path";
import {
  BraintrustConfig,
  EvaluationRecord,
  EvaluationSummary,
} from "../types/index.js";

/**
 * Braintrust Evaluator Agent
 * Handles initialization, logging, and management of Braintrust experiments
 */
export class BraintrustEvaluator {
  private config: BraintrustConfig;
  private logger: ReturnType<typeof initLogger> | null = null;
  private localLogPath: string | null = null;
  private records: EvaluationRecord[] = [];
  private experimentStartTime: Date | null = null;

  constructor(config: Partial<BraintrustConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.BRAINTRUST_API_KEY,
      projectName: config.projectName || "querycraft-sql-generation",
      localMode: config.localMode || !process.env.BRAINTRUST_API_KEY,
    };

    // If no API key and not explicitly local mode, warn and switch to local
    if (!this.config.apiKey && !config.localMode) {
      console.warn(
        "⚠️  BRAINTRUST_API_KEY not found - switching to local logging mode"
      );
      this.config.localMode = true;
    }
  }

  /**
   * Initialize Braintrust experiment
   * Returns experiment ID
   */
  async initExperiment(
    name?: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    this.experimentStartTime = new Date();
    const experimentId =
      name || `eval-${new Date().toISOString().split("T")[0]}`;

    if (this.config.localMode) {
      // Local mode: create log file
      const resultsDir = path.join(process.cwd(), "evals", "results");
      await fs.mkdir(resultsDir, { recursive: true });

      this.localLogPath = path.join(
        resultsDir,
        `${experimentId}-${Date.now()}.json`
      );

      console.log(`📝 Local logging enabled: ${this.localLogPath}`);
      return experimentId;
    }

    try {
      // Cloud mode: initialize Braintrust
      this.logger = initLogger({
        projectName: this.config.projectName,
        apiKey: this.config.apiKey,
      });

      console.log(
        `✅ Braintrust experiment initialized: ${this.config.projectName}/${experimentId}`
      );
      return experimentId;
    } catch (error) {
      console.error("❌ Failed to initialize Braintrust:", error);
      console.log("⚠️  Falling back to local logging mode");

      // Fallback to local mode
      this.config.localMode = true;
      return this.initExperiment(name, metadata);
    }
  }

  /**
   * Log an evaluation result
   */
  async logResult(record: EvaluationRecord): Promise<void> {
    // Store record for aggregation
    this.records.push(record);

    if (this.config.localMode) {
      // Local mode: records are stored in memory, will be written on finalize
      return;
    }

    try {
      // Cloud mode: log to Braintrust
      if (!this.logger) {
        throw new Error("Experiment not initialized");
      }

      this.logger.log({
        input: {
          id: (record.testCase as any).id,
          question: record.testCase.question,
          category: record.testCase.category,
        },
        output: {
          query: record.generated.query,
          explanation: record.generated.explanation,
          confidence: record.generated.confidence,
        },
        scores: {
          queryCorrectness: record.metrics.queryCorrectness,
          tableAccuracy: record.metrics.tableAccuracy,
          safetyValidation: record.metrics.safetyValidation,
          validationAccuracy: record.metrics.validationAccuracy,
        },
        metadata: {
          passed: record.passed,
          duration: record.duration,
          timestamp: record.timestamp.toISOString(),
          error: record.error,
        },
      });
    } catch (error) {
      console.error("⚠️  Failed to log to Braintrust:", error);
      // Don't throw - evaluation should continue
    }
  }

  /**
   * Finalize experiment and return summary
   */
  async finalizeExperiment(experimentId: string): Promise<EvaluationSummary> {
    const endTime = new Date();
    const totalDuration = this.experimentStartTime
      ? endTime.getTime() - this.experimentStartTime.getTime()
      : 0;

    // Calculate summary statistics
    const summary = this.calculateSummary(experimentId, totalDuration);

    if (this.config.localMode && this.localLogPath) {
      // Write results to local file
      await fs.writeFile(
        this.localLogPath,
        JSON.stringify(
          {
            experimentId,
            summary,
            records: this.records.map((r) => ({
              ...r,
              timestamp: r.timestamp.toISOString(),
            })),
          },
          null,
          2
        )
      );

      console.log(`\n📊 Results saved to: ${this.localLogPath}`);
    } else if (this.logger) {
      // Flush Braintrust logs
      try {
        await this.logger.flush();
        console.log("\n✅ Results logged to Braintrust dashboard");
      } catch (error) {
        console.error("⚠️  Failed to flush Braintrust logs:", error);
      }
    }

    return summary;
  }

  /**
   * Calculate summary statistics from recorded results
   */
  private calculateSummary(
    experimentId: string,
    totalDuration: number
  ): EvaluationSummary {
    const totalTests = this.records.length;
    const passedTests = this.records.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    // Calculate average metrics
    const sumMetrics = this.records.reduce(
      (acc, r) => ({
        queryCorrectness: acc.queryCorrectness + r.metrics.queryCorrectness,
        tableAccuracy: acc.tableAccuracy + r.metrics.tableAccuracy,
        safetyValidation: acc.safetyValidation + r.metrics.safetyValidation,
        validationAccuracy:
          acc.validationAccuracy + r.metrics.validationAccuracy,
      }),
      {
        queryCorrectness: 0,
        tableAccuracy: 0,
        safetyValidation: 0,
        validationAccuracy: 0,
      }
    );

    const averageMetrics = {
      queryCorrectness: sumMetrics.queryCorrectness / totalTests,
      tableAccuracy: sumMetrics.tableAccuracy / totalTests,
      safetyValidation: sumMetrics.safetyValidation / totalTests,
      validationAccuracy: sumMetrics.validationAccuracy / totalTests,
    };

    // Group by category
    const byCategory: Record<string, any> = {};
    for (const record of this.records) {
      const category = record.testCase.category;
      if (!byCategory[category]) {
        byCategory[category] = {
          total: 0,
          passed: 0,
          failed: 0,
          averageMetrics: {
            queryCorrectness: 0,
            tableAccuracy: 0,
            safetyValidation: 0,
            validationAccuracy: 0,
          },
        };
      }

      byCategory[category].total++;
      if (record.passed) {
        byCategory[category].passed++;
      } else {
        byCategory[category].failed++;
      }

      byCategory[category].averageMetrics.queryCorrectness +=
        record.metrics.queryCorrectness;
      byCategory[category].averageMetrics.tableAccuracy +=
        record.metrics.tableAccuracy;
      byCategory[category].averageMetrics.safetyValidation +=
        record.metrics.safetyValidation;
      byCategory[category].averageMetrics.validationAccuracy +=
        record.metrics.validationAccuracy;
    }

    // Calculate averages per category
    for (const category of Object.keys(byCategory)) {
      const count = byCategory[category].total;
      byCategory[category].averageMetrics.queryCorrectness /= count;
      byCategory[category].averageMetrics.tableAccuracy /= count;
      byCategory[category].averageMetrics.safetyValidation /= count;
      byCategory[category].averageMetrics.validationAccuracy /= count;
    }

    // Check thresholds (from specs/evals/sql-generation.eval.yaml)
    const thresholdStatus = {
      queryCorrectness: {
        threshold: 0.8,
        actual: averageMetrics.queryCorrectness,
        passed: averageMetrics.queryCorrectness >= 0.8,
      },
      safetyValidation: {
        threshold: 1.0,
        actual: averageMetrics.safetyValidation,
        passed: averageMetrics.safetyValidation >= 1.0,
      },
      validationAccuracy: {
        threshold: 0.9,
        actual: averageMetrics.validationAccuracy,
        passed: averageMetrics.validationAccuracy >= 0.9,
      },
    };

    // Calculate confidence calibration
    const confidenceCalibration = this.calculateConfidenceCalibration();

    return {
      experimentId,
      timestamp: new Date(),
      totalTests,
      passedTests,
      failedTests,
      averageMetrics,
      byCategory,
      thresholdStatus,
      confidenceCalibration,
      totalDuration,
    };
  }

  /**
   * Calculate confidence calibration from records
   */
  private calculateConfidenceCalibration(): number {
    const groups = new Map([
      ["high", { total: 0, correct: 0 }],
      ["medium", { total: 0, correct: 0 }],
      ["low", { total: 0, correct: 0 }],
    ]);

    for (const record of this.records) {
      const confidence = record.generated.confidence;
      const isCorrect = record.metrics.queryCorrectness >= 0.5;

      const group = groups.get(confidence);
      if (group) {
        group.total++;
        if (isCorrect) {
          group.correct++;
        }
      }
    }

    // Calculate deviation from expected accuracies
    const expected = { high: 0.9, medium: 0.7, low: 0.4 };
    let totalDeviation = 0;
    let groupCount = 0;

    for (const [level, group] of groups.entries()) {
      if (group.total > 0) {
        const accuracy = group.correct / group.total;
        const expectedAcc = expected[level as keyof typeof expected];
        totalDeviation += Math.abs(accuracy - expectedAcc);
        groupCount++;
      }
    }

    if (groupCount === 0) return 0;

    return Math.max(0, 1.0 - totalDeviation / groupCount);
  }
}
