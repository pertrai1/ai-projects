/**
 * Braintrust Evaluation: Query Router Accuracy
 *
 * This evaluates how accurately the query-router agent classifies
 * user questions into the correct agent type.
 *
 * Run with: npx braintrust eval evaluations/query-router.eval.ts
 */

import "dotenv/config";
import { Eval } from "braintrust";
import { agentRouter } from "../src/utils/agent-router.js";
import {
  routingTestCases,
  quickRoutingTests,
  testsByCategory,
  type RoutingTestCase,
} from "./datasets/routing-test-cases.js";

/**
 * Custom scorer: Exact match for agent type
 */
function agentTypeAccuracy(args: {
  input: string;
  output: any;
  expected: RoutingTestCase["expected"];
}) {
  const correctAgentType = args.output?.agentType === args.expected.agentType;
  return {
    name: "agent_type_accuracy",
    score: correctAgentType ? 1 : 0,
    metadata: {
      predicted: args.output?.agentType,
      expected: args.expected.agentType,
    },
  };
}

/**
 * Custom scorer: Confidence level appropriateness
 * Gives partial credit for reasonable confidence levels
 */
function confidenceAccuracy(args: {
  input: string;
  output: any;
  expected: RoutingTestCase["expected"];
}) {
  const predictedConfidence = args.output?.confidence;
  const expectedConfidence = args.expected.confidence;

  // Exact match gets full score
  if (predictedConfidence === expectedConfidence) {
    return { name: "confidence_accuracy", score: 1 };
  }

  // High vs medium or medium vs low gets partial credit
  const confidenceLevels = { high: 2, medium: 1, low: 0 };
  const diff = Math.abs(
    confidenceLevels[predictedConfidence as keyof typeof confidenceLevels] -
      confidenceLevels[expectedConfidence as keyof typeof confidenceLevels],
  );

  // 1 level off = 0.5 score, 2 levels off = 0
  const score = Math.max(0, 1 - diff * 0.5);

  return {
    name: "confidence_accuracy",
    score,
    metadata: {
      predicted: predictedConfidence,
      expected: expectedConfidence,
    },
  };
}

/**
 * Custom scorer: Search strategy appropriateness
 */
function searchStrategyAccuracy(args: {
  input: string;
  output: any;
  expected: RoutingTestCase["expected"];
}) {
  const correctStrategy =
    args.output?.searchStrategy === args.expected.searchStrategy;
  return {
    name: "search_strategy_accuracy",
    score: correctStrategy ? 1 : 0,
    metadata: {
      predicted: args.output?.searchStrategy,
      expected: args.expected.searchStrategy,
    },
  };
}

/**
 * Custom scorer: Overall routing quality
 * Combines all three metrics with weights
 */
function overallRoutingQuality(args: {
  input: string;
  output: any;
  expected: RoutingTestCase["expected"];
}) {
  const agentTypeCorrect = args.output?.agentType === args.expected.agentType;
  const confidenceCorrect =
    args.output?.confidence === args.expected.confidence;
  const strategyCorrect =
    args.output?.searchStrategy === args.expected.searchStrategy;

  // Agent type is most important (50%), then strategy (30%), then confidence (20%)
  const score =
    (agentTypeCorrect ? 0.5 : 0) +
    (strategyCorrect ? 0.3 : 0) +
    (confidenceCorrect ? 0.2 : 0);

  return {
    name: "overall_quality",
    score,
    metadata: {
      agent_type_match: agentTypeCorrect,
      confidence_match: confidenceCorrect,
      strategy_match: strategyCorrect,
    },
  };
}

/**
 * Main Evaluation: Full routing test suite
 *
 * Tests all routing scenarios across different question types
 */
Eval("query-router-full-suite", {
  data: () => {
    return routingTestCases.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      // Get routing decision without executing the specialized agent
      const routing = await agentRouter.getRouting(input);
      return routing;
    } catch (error) {
      console.error(`Error routing query: "${input}"`, error);
      return {
        agentType: "GENERAL_QA",
        confidence: "low",
        searchStrategy: "broad",
        reasoning: "Error occurred during routing",
        keywords: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  scores: [
    agentTypeAccuracy,
    confidenceAccuracy,
    searchStrategyAccuracy,
    overallRoutingQuality,
  ],
  metadata: {
    description: "Full evaluation of query router across all test cases",
    version: "1.0",
  },
});

/**
 * Quick Evaluation
 *
 * Use this for rapid iteration during development
 * Run with: npx braintrust eval evaluations/query-router.eval.ts
 */
Eval("query-router-quick", {
  data: () => {
    return quickRoutingTests.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      const routing = await agentRouter.getRouting(input);
      return routing;
    } catch (error) {
      console.error(`Error routing query: "${input}"`, error);
      return {
        agentType: "GENERAL_QA",
        confidence: "low",
        searchStrategy: "broad",
        reasoning: "Error occurred during routing",
        keywords: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  scores: [agentTypeAccuracy, overallRoutingQuality],
  metadata: {
    description: "Quick evaluation for development iteration",
    version: "1.0",
  },
});

/**
 * Category-Specific Evaluation: Wetland Indicators
 *
 * Tests routing accuracy for wetland-related questions specifically
 */
Eval("query-router-wetland-indicators", {
  data: () => {
    const wetlandTests = testsByCategory["wetland-indicators"] || [];
    return wetlandTests.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      const routing = await agentRouter.getRouting(input);
      return routing;
    } catch (error) {
      console.error(`Error routing query: "${input}"`, error);
      return {
        agentType: "GENERAL_QA",
        confidence: "low",
        searchStrategy: "broad",
        reasoning: "Error occurred during routing",
        keywords: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  scores: [
    agentTypeAccuracy,
    confidenceAccuracy,
    searchStrategyAccuracy,
    overallRoutingQuality,
  ],
  metadata: {
    description: "Focused evaluation on wetland indicator questions",
    category: "wetland-indicators",
    version: "1.0",
  },
});

/**
 * Edge Cases Evaluation
 *
 * Tests challenging cases that might be ambiguous or difficult to route
 */
Eval("query-router-edge-cases", {
  data: () => {
    const edgeCases = testsByCategory["edge-cases"] || [];
    return edgeCases.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      const routing = await agentRouter.getRouting(input);
      return routing;
    } catch (error) {
      console.error(`Error routing query: "${input}"`, error);
      return {
        agentType: "GENERAL_QA",
        confidence: "low",
        searchStrategy: "broad",
        reasoning: "Error occurred during routing",
        keywords: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  scores: [
    agentTypeAccuracy,
    confidenceAccuracy,
    searchStrategyAccuracy,
    overallRoutingQuality,
  ],
  metadata: {
    description: "Tests difficult and ambiguous routing scenarios",
    category: "edge-cases",
    version: "1.0",
  },
});
