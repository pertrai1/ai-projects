/**
 * Braintrust Evaluation: Document Retriever (RAG) Quality
 *
 * This evaluates the quality of answers from the document-retriever agent,
 * including retrieval quality, answer accuracy, and citation validity.
 *
 * Run with: npx braintrust eval evaluations/document-retriever.eval.ts
 */

import "dotenv/config";
import { Eval } from "braintrust";
import { AnswerRelevancy } from "autoevals";
import { agentRouter } from "../src/utils/agent-router.js";
import {
  ragTestCases,
  quickRAGTests,
  ragTestsByCategory,
  type RAGTestCase,
} from "./datasets/rag-test-cases.js";

/**
 * Custom scorer: Must Include Check
 * Verifies that required facts appear in the answer
 */
function mustIncludeScore(args: {
  input: string;
  output: any;
  expected: RAGTestCase["expected"];
}) {
  const answer = args.output?.answer || "";
  const mustInclude = args.expected.mustInclude || [];

  if (mustInclude.length === 0) {
    return { name: "must_include", score: 1 }; // No requirements
  }

  const included = mustInclude.filter((phrase) =>
    answer.toLowerCase().includes(phrase.toLowerCase()),
  );

  const score = included.length / mustInclude.length;

  return {
    name: "must_include",
    score,
    metadata: {
      required: mustInclude,
      included: included,
      missing: mustInclude.filter((p) => !included.includes(p)),
    },
  };
}

/**
 * Custom scorer: Must Not Include Check
 * Verifies that hallucinated or incorrect facts don't appear
 */
function mustNotIncludeScore(args: {
  input: string;
  output: any;
  expected: RAGTestCase["expected"];
}) {
  const answer = args.output?.answer || "";
  const mustNotInclude = args.expected.mustNotInclude || [];

  if (mustNotInclude.length === 0) {
    return { name: "must_not_include", score: 1 }; // No restrictions
  }

  const violations = mustNotInclude.filter((phrase) =>
    answer.toLowerCase().includes(phrase.toLowerCase()),
  );

  const score = violations.length === 0 ? 1 : 0;

  return {
    name: "must_not_include",
    score,
    metadata: {
      forbidden: mustNotInclude,
      violations: violations,
    },
  };
}

/**
 * Custom scorer: Citation Check
 * Verifies that answers include citations when required
 */
function citationScore(args: {
  input: string;
  output: any;
  expected: RAGTestCase["expected"];
}) {
  const requiresCitation = args.expected.requiresCitation;

  if (!requiresCitation) {
    return { name: "citation_check", score: 1 }; // Not required
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
}

/**
 * Custom scorer: Answer Length Appropriateness
 * Checks that answers are neither too short nor too long
 */
function answerLengthScore(args: { input: string; output: any }) {
  const answer = args.output?.answer || "";
  const wordCount = answer.split(/\s+/).length;

  // Too short (< 10 words) or too long (> 500 words) gets penalized
  let score = 1;
  if (wordCount < 10) {
    score = wordCount / 10; // Partial credit for very short answers
  } else if (wordCount > 500) {
    score = Math.max(0, 1 - (wordCount - 500) / 500); // Penalty for verbosity
  }

  return {
    name: "answer_length",
    score,
    metadata: {
      word_count: wordCount,
      is_appropriate: wordCount >= 10 && wordCount <= 500,
    },
  };
}

/**
 * Custom scorer: Overall RAG Quality
 * Combines multiple quality signals
 */
function overallRAGQuality(args: {
  input: string;
  output: any;
  expected: RAGTestCase["expected"];
}) {
  const answer = args.output?.answer || "";

  // Check must include (40% weight)
  const mustInclude = args.expected.mustInclude || [];
  const includedCount = mustInclude.filter((phrase) =>
    answer.toLowerCase().includes(phrase.toLowerCase()),
  ).length;
  const includeScore =
    mustInclude.length > 0 ? includedCount / mustInclude.length : 1;

  // Check must not include (30% weight)
  const mustNotInclude = args.expected.mustNotInclude || [];
  const violations = mustNotInclude.filter((phrase) =>
    answer.toLowerCase().includes(phrase.toLowerCase()),
  );
  const noHallucinationScore = violations.length === 0 ? 1 : 0;

  // Check citations (20% weight)
  const requiresCitation = args.expected.requiresCitation;
  const hasCitations =
    args.output?.citations && args.output.citations.length > 0;
  const citationScore = !requiresCitation || hasCitations ? 1 : 0;

  // Check answer exists and is reasonable length (10% weight)
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
}

/**
 * Main Evaluation: Full RAG test suite
 *
 * Tests answer quality across different question types
 */
Eval("document-retriever-full-suite", {
  data: () => {
    return ragTestCases.map((testCase) => ({
      input: testCase.input,
      expected: testCase.expected,
      metadata: testCase.metadata,
    }));
  },
  task: async (input: string) => {
    try {
      // Route and execute to get the answer
      const result = await agentRouter.routeAndExecute(input, false);
      return {
        answer: result.answer,
        citations: result.citations,
        routedTo: result.routedTo,
        confidence: result.routingConfidence,
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
    mustIncludeScore,
    mustNotIncludeScore,
    citationScore,
    answerLengthScore,
    overallRAGQuality,
    // Braintrust AutoEvals - these use LLM-as-judge
    (args: any) =>
      AnswerRelevancy({
        input: args.input,
        output: args.output?.answer || "",
      }),
  ],
  metadata: {
    description: "Full RAG evaluation across all test cases",
    version: "1.0",
  },
});

/**
 * Quick Evaluation
 *
 * Use this for rapid iteration during development
 */
Eval("document-retriever-quick", {
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
  scores: [mustIncludeScore, citationScore, overallRAGQuality],
  metadata: {
    description: "Quick RAG evaluation for development iteration",
    version: "1.0",
  },
});

/**
 * Wetland Indicators Evaluation
 *
 * Focused test on wetland-related questions
 */
Eval("document-retriever-wetland-indicators", {
  data: () => {
    const wetlandTests = ragTestsByCategory["wetland-indicators"] || [];
    return wetlandTests.map((testCase) => ({
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
    mustIncludeScore,
    mustNotIncludeScore,
    citationScore,
    overallRAGQuality,
    (args: any) =>
      AnswerRelevancy({
        input: args.input,
        output: args.output?.answer || "",
      }),
  ],
  metadata: {
    description: "RAG evaluation focused on wetland indicator questions",
    category: "wetland-indicators",
    version: "1.0",
  },
});

/**
 * Hallucination Resistance Test
 *
 * Tests that the system doesn't make up answers for non-existent concepts
 */
Eval("document-retriever-hallucination-test", {
  data: () => {
    const hallucinationTests = ragTestsByCategory["hallucination-test"] || [];
    return hallucinationTests.map((testCase) => ({
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
  scores: [mustNotIncludeScore, overallRAGQuality],
  metadata: {
    description: "Tests resistance to hallucination and making up facts",
    category: "hallucination-test",
    version: "1.0",
  },
});
