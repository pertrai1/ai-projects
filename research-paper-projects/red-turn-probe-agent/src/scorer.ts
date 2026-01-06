/**
 * Strategy Scorer Module
 *
 * Implements bandit-style learning for strategy selection using epsilon-greedy algorithm.
 * Tracks success rates for each strategy-category pair to enable learning which strategies work best.
 *
 * Milestone 5: Scored Strategy Selection
 */

import type { ResponseCategory } from "./classifier.js";
import type { StrategyName } from "./templates.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";

/**
 * Score data for a single strategy-category pair.
 */
export interface StrategyScore {
  readonly attempts: number;
  readonly successes: number;
  readonly successRate: number;
}

/**
 * Score matrix: category → strategy → score.
 */
export type ScoreMatrix = Record<
  ResponseCategory,
  Record<StrategyName, StrategyScore>
>;

/**
 * Result of epsilon-greedy strategy selection.
 */
export interface ScoredSelection {
  readonly strategy: StrategyName;
  readonly method: "exploit" | "explore";
  readonly score: number;
}

/**
 * Directory for score persistence.
 */
const SCORES_DIR = "scores";

/**
 * File name for persisted scores.
 */
const SCORES_FILE = "strategy-scores.json";

/**
 * Get candidate strategies for a response category.
 *
 * For "unclear" category, only default strategy is allowed.
 * For all other categories, all non-default strategies are candidates.
 *
 * @param category - Response category
 * @returns Array of candidate strategy names
 */
export function getCandidateStrategies(
  category: ResponseCategory
): StrategyName[] {
  if (category === "unclear") {
    return ["default"];
  }
  // Allow exploration across all non-default strategies
  return ["escalate", "accuse", "exploit-nuance"];
}

/**
 * Strategy scorer tracks success rates and enables epsilon-greedy selection.
 */
export class StrategyScorer {
  private scores: ScoreMatrix;
  private exploitCount = 0;
  private exploreCount = 0;

  constructor(initialScores?: ScoreMatrix) {
    if (initialScores) {
      this.scores = initialScores;
    } else {
      this.scores = this.initializeScores();
    }
  }

  /**
   * Initialize all strategy-category pairs to 0/0.
   */
  private initializeScores(): ScoreMatrix {
    const categories: ResponseCategory[] = [
      "confident",
      "hesitant",
      "hedging",
      "unclear",
    ];
    const strategies: StrategyName[] = [
      "escalate",
      "accuse",
      "exploit-nuance",
      "default",
    ];

    const scores = {} as ScoreMatrix;

    for (const category of categories) {
      scores[category] = {} as Record<StrategyName, StrategyScore>;
      for (const strategy of strategies) {
        scores[category][strategy] = {
          attempts: 0,
          successes: 0,
          successRate: 0.0,
        };
      }
    }

    return scores;
  }

  /**
   * Get success rate for a strategy-category pair.
   *
   * @param category - Response category
   * @param strategy - Strategy name
   * @returns Success rate (0.0 to 1.0)
   */
  getSuccessRate(category: ResponseCategory, strategy: StrategyName): number {
    return this.scores[category][strategy].successRate;
  }

  /**
   * Get score data for a strategy-category pair.
   *
   * @param category - Response category
   * @param strategy - Strategy name
   * @returns Strategy score
   */
  getScore(category: ResponseCategory, strategy: StrategyName): StrategyScore {
    return this.scores[category][strategy];
  }

  /**
   * Update score after a run completes.
   *
   * @param category - Response category
   * @param strategy - Strategy used
   * @param success - Whether contradiction was detected
   */
  updateScore(
    category: ResponseCategory,
    strategy: StrategyName,
    success: boolean
  ): void {
    const score = this.scores[category][strategy];
    const newAttempts = score.attempts + 1;
    const newSuccesses = score.successes + (success ? 1 : 0);
    const newSuccessRate = newSuccesses / newAttempts;

    this.scores[category][strategy] = {
      attempts: newAttempts,
      successes: newSuccesses,
      successRate: newSuccessRate,
    };
  }

  /**
   * Select strategy using epsilon-greedy algorithm.
   *
   * With probability epsilon, explore (random selection).
   * With probability 1-epsilon, exploit (choose highest-scoring).
   *
   * @param category - Response category
   * @param epsilon - Exploration rate (0.0 to 1.0)
   * @returns Selected strategy with method and score
   */
  selectWithScoring(
    category: ResponseCategory,
    epsilon: number
  ): ScoredSelection {
    const candidates = getCandidateStrategies(category);

    // Exploration: random selection
    if (Math.random() < epsilon) {
      const strategy =
        candidates[Math.floor(Math.random() * candidates.length)]!;
      const score = this.getSuccessRate(category, strategy);
      this.exploreCount++;
      return { strategy, method: "explore", score };
    }

    // Exploitation: choose highest-scoring strategy
    let bestStrategy = candidates[0]!;
    let bestScore = this.getSuccessRate(category, bestStrategy);

    for (const strategy of candidates.slice(1)) {
      const score = this.getSuccessRate(category, strategy);
      // Break ties randomly
      if (score > bestScore || (score === bestScore && Math.random() < 0.5)) {
        bestStrategy = strategy;
        bestScore = score;
      }
    }

    this.exploitCount++;
    return { strategy: bestStrategy, method: "exploit", score: bestScore };
  }

  /**
   * Get all scores for statistics display.
   *
   * @returns Complete score matrix
   */
  getAllScores(): ScoreMatrix {
    return this.scores;
  }

  /**
   * Get selection method counts.
   *
   * @returns Object with exploit and explore counts
   */
  getSelectionCounts(): { exploit: number; explore: number } {
    return {
      exploit: this.exploitCount,
      explore: this.exploreCount,
    };
  }

  /**
   * Reset all scores to 0/0.
   */
  resetScores(): void {
    this.scores = this.initializeScores();
    this.exploitCount = 0;
    this.exploreCount = 0;
  }

  /**
   * Serialize scores to JSON-compatible object.
   */
  toJSON(): Record<string, Record<string, { attempts: number; successes: number }>> {
    const json: Record<string, Record<string, { attempts: number; successes: number }>> = {};

    for (const category of Object.keys(this.scores)) {
      json[category] = {};
      for (const strategy of Object.keys(this.scores[category as ResponseCategory])) {
        const score = this.scores[category as ResponseCategory][strategy as StrategyName];
        json[category]![strategy] = {
          attempts: score.attempts,
          successes: score.successes,
        };
      }
    }

    return json;
  }

  /**
   * Load scores from JSON-compatible object.
   */
  static fromJSON(json: Record<string, Record<string, { attempts: number; successes: number }>>): StrategyScorer {
    const scores = {} as ScoreMatrix;

    for (const category of Object.keys(json)) {
      scores[category as ResponseCategory] = {} as Record<StrategyName, StrategyScore>;
      for (const strategy of Object.keys(json[category]!)) {
        const data = json[category]![strategy]!;
        const successRate = data.attempts > 0 ? data.successes / data.attempts : 0.0;
        scores[category as ResponseCategory][strategy as StrategyName] = {
          attempts: data.attempts,
          successes: data.successes,
          successRate,
        };
      }
    }

    return new StrategyScorer(scores);
  }
}

/**
 * Ensure scores directory exists.
 */
function ensureScoresDirectory(): void {
  if (!existsSync(SCORES_DIR)) {
    mkdirSync(SCORES_DIR, { recursive: true });
  }
}

/**
 * Get path to scores file.
 */
function getScoresPath(): string {
  return join(SCORES_DIR, SCORES_FILE);
}

/**
 * Save scores to JSON file.
 *
 * @param scorer - Strategy scorer instance
 */
export function saveScores(scorer: StrategyScorer): void {
  try {
    ensureScoresDirectory();
    const json = scorer.toJSON();
    const path = getScoresPath();
    writeFileSync(path, JSON.stringify(json, null, 2), "utf-8");
  } catch (error) {
    console.warn("Warning: Failed to save scores:", error);
  }
}

/**
 * Load scores from JSON file.
 *
 * @returns Loaded score matrix, or undefined if file doesn't exist or is invalid
 */
export function loadScores(): StrategyScorer | undefined {
  try {
    const path = getScoresPath();
    if (!existsSync(path)) {
      return undefined;
    }

    const content = readFileSync(path, "utf-8");
    const json = JSON.parse(content);

    // Basic validation
    if (typeof json !== "object" || json === null) {
      console.warn("Warning: Invalid scores file format");
      return undefined;
    }

    return StrategyScorer.fromJSON(json);
  } catch (error) {
    console.warn("Warning: Failed to load scores:", error);
    return undefined;
  }
}

/**
 * Delete persisted scores file.
 */
export function deleteScores(): void {
  try {
    const path = getScoresPath();
    if (existsSync(path)) {
      unlinkSync(path);
    }
  } catch (error) {
    console.warn("Warning: Failed to delete scores:", error);
  }
}

/**
 * Get path to scores file for display.
 */
export function getScoresFilePath(): string {
  return getScoresPath();
}
