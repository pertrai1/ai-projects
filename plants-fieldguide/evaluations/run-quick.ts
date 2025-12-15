/**
 * Quick Evaluation Runner
 *
 * Runs only the quick evaluation suites for fast iteration.
 * This is separate from the full eval files to avoid running all tests.
 */

import "dotenv/config";
import { Eval } from "braintrust";
import { agentRouter } from "../src/utils/agent-router.js";
import { quickRoutingTests } from "./datasets/routing-test-cases.js";
import { quickRAGTests } from "./datasets/rag-test-cases.js";

/**
 * Quick Routing Evaluation
 */
Eval("quick-routing", {
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
  scores: [
    // Agent type accuracy
    (args: any) => {
      const correctAgentType =
        args.output?.agentType === args.expected.agentType;
      return {
        name: "agent_type_accuracy",
        score: correctAgentType ? 1 : 0,
        metadata: {
          predicted: args.output?.agentType,
          expected: args.expected.agentType,
        },
      };
    },
    // Overall quality
    (args: any) => {
      const agentTypeCorrect =
        args.output?.agentType === args.expected.agentType;
      const confidenceCorrect =
        args.output?.confidence === args.expected.confidence;
      const strategyCorrect =
        args.output?.searchStrategy === args.expected.searchStrategy;

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
    },
  ],
  metadata: {
    description: "Quick routing evaluation for development iteration",
    version: "1.0",
  },
});

/**
 * Quick RAG Evaluation
 */
Eval("quick-rag", {
  data: () => {
    return quickRAGTests.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      const result = await agentRouter.routeAndExecute(input, false);
      return {
        answer: result.answer,
        citations: result.citations,
        routedTo: result.routedTo,
      };
    } catch (error) {
      console.error(`Error answering question: "${input}"`, error);
      return {
        answer: "",
        citations: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  scores: [
    // Must include check
    (args: any) => {
      const answer = args.output?.answer || "";
      const mustInclude = args.expected.mustInclude || [];

      if (mustInclude.length === 0) {
        return { name: "must_include", score: 1 };
      }

      const included = mustInclude.filter((phrase: string) =>
        answer.toLowerCase().includes(phrase.toLowerCase()),
      );

      const score = included.length / mustInclude.length;

      return {
        name: "must_include",
        score,
        metadata: {
          required: mustInclude,
          included: included,
          missing: mustInclude.filter((p: string) => !included.includes(p)),
        },
      };
    },
    // Citation check
    (args: any) => {
      const requiresCitation = args.expected.requiresCitation;

      if (!requiresCitation) {
        return { name: "citation_check", score: 1 };
      }

      const hasCitations =
        args.output?.citations && args.output.citations.length > 0;

      return {
        name: "citation_check",
        score: hasCitations ? 1 : 0,
        metadata: {
          citations: args.output?.citations || [],
          count: args.output?.citations?.length || 0,
        },
      };
    },
    // Overall quality
    (args: any) => {
      const answer = args.output?.answer || "";

      const mustInclude = args.expected.mustInclude || [];
      const includedCount = mustInclude.filter((phrase: string) =>
        answer.toLowerCase().includes(phrase.toLowerCase()),
      ).length;
      const includeScore =
        mustInclude.length > 0 ? includedCount / mustInclude.length : 1;

      const mustNotInclude = args.expected.mustNotInclude || [];
      const violations = mustNotInclude.filter((phrase: string) =>
        answer.toLowerCase().includes(phrase.toLowerCase()),
      );
      const noHallucinationScore = violations.length === 0 ? 1 : 0;

      const requiresCitation = args.expected.requiresCitation;
      const hasCitations =
        args.output?.citations && args.output.citations.length > 0;
      const citationScore = !requiresCitation || hasCitations ? 1 : 0;

      const wordCount = answer.split(/\s+/).length;
      const lengthScore = wordCount >= 10 && wordCount <= 500 ? 1 : 0.5;

      const overallScore =
        includeScore * 0.4 +
        noHallucinationScore * 0.3 +
        citationScore * 0.2 +
        lengthScore * 0.1;

      return {
        name: "overall_quality",
        score: overallScore,
        metadata: {
          include_score: includeScore,
          no_hallucination_score: noHallucinationScore,
          citation_score: citationScore,
          length_score: lengthScore,
        },
      };
    },
  ],
  metadata: {
    description: "Quick RAG evaluation for development iteration",
    version: "1.0",
  },
});
