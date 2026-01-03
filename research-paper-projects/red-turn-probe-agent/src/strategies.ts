/**
 * Strategy Selection Module
 *
 * Maps response categories to Turn 2 prompting strategies.
 * Updated in Milestone 4 to use template-based generation.
 *
 * Strategies are manually defined and selected via explicit conditional logic.
 * No optimization algorithms or ML models are used.
 */

import type { ResponseCategory } from "./classifier.js";
import type { StrategyName } from "./templates.js";

/**
 * Result of strategy selection.
 */
export interface StrategySelection {
  readonly strategyName: StrategyName;
  readonly category: ResponseCategory;
  readonly selectionRationale: string;
}

/**
 * Map response category to appropriate strategy.
 *
 * Uses explicit conditional logic to select strategy based on category.
 * This mapping is deterministic - same category always produces same strategy.
 *
 * Mapping:
 * - confident → escalate (increase pressure with extreme cases)
 * - hesitant → accuse (frame as missing obvious answer)
 * - hedging → exploit-nuance (force concrete choice)
 * - unclear → default (fallback to static baseline)
 *
 * @param category - The response category from classification
 * @returns Strategy selection with strategy name and rationale
 */
export function selectStrategy(category: ResponseCategory): StrategySelection {
  let strategyName: StrategyName;
  let selectionRationale: string;

  switch (category) {
    case "confident":
      strategyName = "escalate";
      selectionRationale =
        "Selected escalate strategy because response showed confident, assertive language";
      break;

    case "hesitant":
      strategyName = "accuse";
      selectionRationale =
        "Selected accuse strategy because response showed hesitancy and uncertainty";
      break;

    case "hedging":
      strategyName = "exploit-nuance";
      selectionRationale =
        "Selected exploit-nuance strategy because response showed balanced, nuanced perspective";
      break;

    case "unclear":
      strategyName = "default";
      selectionRationale =
        "Selected default strategy because response category was unclear";
      break;

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = category;
      throw new Error(`Unknown category: ${_exhaustive}`);
  }

  return {
    strategyName,
    category,
    selectionRationale,
  };
}
