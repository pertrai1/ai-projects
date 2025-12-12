import { evaluate } from "@lmnr-ai/lmnr";
import { toolOrderCorrect, toolsAvoided, llmJudge } from "./evaluators.ts";
import type {
  MultiTurnEvalData,
  MultiTurnTarget,
  MultiTurnResult,
} from "./types.ts";
import dataset from "./data/agent-multiturn.json" with { type: "json" };
import { multiTurnWithMocks } from "./executors.ts";

/**
 * Multi-Turn Agent Evaluation
 *
 * Tests full agent behavior with mocked tools:
 * 1. Fresh task: User's first message, check tools + order + LLM judge
 * 2. Mid-conversation: Pre-filled messages, check continuation behavior
 * 3. Negative: Ensure wrong tool category not used (file vs shell)
 *
 * All tools are mocked to return fixed values for deterministic testing.
 *
 * Evaluators:
 * - toolOrderCorrect: Did tools get called in expected sequence?
 * - toolsAvoided: Were forbidden tools not called?
 * - llmJudge: Does the final response make sense given the task and results?
 */

// Executor that runs multi-turn agent with mocked tools
const executor = async (data: MultiTurnEvalData): Promise<MultiTurnResult> => {
  return multiTurnWithMocks(data);
};

// Run the evaluation
evaluate({
  data: dataset as unknown as Array<{
    data: MultiTurnEvalData;
    target: MultiTurnTarget;
  }>,
  executor,
  evaluators: {
    // Check if tools were called in the expected order
    toolOrder: (output, target) => {
      if (!target) return 1;
      return toolOrderCorrect(output, target);
    },
    // Check if forbidden tools were avoided
    toolsAvoided: (output, target) => {
      if (!target?.forbiddenTools?.length) return 1;
      return toolsAvoided(output, target);
    },
    // LLM judge to evaluate output quality
    outputQuality: async (output, target) => {
      if (!target) return 1;
      return llmJudge(output, target);
    },
  },
  config: {
    projectApiKey: process.env.LMNR_API_KEY,
  },
  groupName: "agent-multiturn",
});
