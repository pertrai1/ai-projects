# PLANTS FieldGuide Evaluations

This directory contains evaluation suites for testing the quality and accuracy of the PLANTS FieldGuide AI agents using [Braintrust](https://braintrust.dev).

## Overview

We evaluate two main components:

1. **Query Router** - Tests routing accuracy (classifying questions to the right agent type)
2. **Document Retriever (RAG)** - Tests answer quality, factuality, and citation accuracy

## Setup

### Install Dependencies

```bash
npm install --save-dev braintrust autoevals
```

### Set up Braintrust

Copy the `BRAINTRUST_API_KEY` from `.env.example` to your `.env` file with your Braintrust API key.

```bash
BRAINTRUST_API_KEY=your_braintrust_key_here
```

## Running Evaluations

Run a quick evaluation to verify everything works:

```bash
npm run eval:quick
```

This runs `evaluations/run-quick.ts` which contains a subset of tests for fast iteration.

### Full Evaluation Suites

Run all routing tests:
```bash
npm run eval:routing
```

Run all RAG tests:
```bash
npm run eval:rag
```

Run everything:
```bash
npm run eval:all
```

### Individual Evaluation Files

Run specific evaluation files directly:

```bash
# All query router evaluations
braintrust eval evaluations/query-router.eval.ts

# All document retriever evaluations
braintrust eval evaluations/document-retriever.eval.ts

# Quick test only
tsx evaluations/run-quick.ts
```

**Note:** Each `.eval.ts` file contains multiple `Eval()` calls. Braintrust runs all of them when you evaluate the file.

## Understanding Results

### Query Router Metrics

- **agent_type_accuracy** (0-1): Did it route to the correct agent type?
- **confidence_accuracy** (0-1): Was the confidence level appropriate?
- **search_strategy_accuracy** (0-1): Did it choose the right search strategy?
- **overall_quality** (0-1): Weighted combination of all metrics

**Target scores:**
- agent_type_accuracy: ≥ 0.90 (90%+)
- overall_quality: ≥ 0.85 (85%+)

### Document Retriever (RAG) Metrics

- **must_include** (0-1): Does the answer contain required facts?
- **must_not_include** (0-1): Is the answer free from hallucinations?
- **citation_check** (0-1): Are sources cited when required?
- **answer_length** (0-1): Is the answer an appropriate length?
- **overall_quality** (0-1): Weighted combination of all metrics
- **AnswerRelevancy** (0-1): AutoEval LLM-as-judge relevance score

**Target scores:**
- must_include: ≥ 0.85 (85%+)
- must_not_include: 1.0 (100% - no hallucinations)
- overall_quality: ≥ 0.80 (80%+)

## Test Datasets

### Routing Test Cases
Location: `datasets/routing-test-cases.ts`

- 30+ test cases across different question types
- Categories: wetland-indicators, search-procedures, plant-status, edge-cases
- Each case includes expected agent type, confidence, and search strategy

### RAG Test Cases
Location: `datasets/rag-test-cases.ts`

- 10+ test cases for answer quality
- Categories: wetland-indicators, plant-status, taxonomy, hallucination-test
- Each case includes must-include facts and reference answers

## Adding New Test Cases

### Add a Routing Test Case

Edit `datasets/routing-test-cases.ts`:

```typescript
{
  input: "Your question here",
  expected: {
    agentType: "DEFINITION_LOOKUP", // or HOW_TO_GUIDE, COMPARISON, etc.
    confidence: "high", // or medium, low
    searchStrategy: "focused" // or broad, multi-step
  },
  metadata: {
    category: "your-category",
    difficulty: "easy", // or medium, hard
    notes: "Optional notes"
  }
}
```

### Add a RAG Test Case

Edit `datasets/rag-test-cases.ts`:

```typescript
{
  input: "Your question here",
  expected: {
    mustInclude: ["fact 1", "fact 2"], // Required in answer
    mustNotInclude: ["hallucination"], // Should NOT appear
    answerType: "definition", // or explanation, procedure, etc.
    requiresCitation: true
  },
  referenceAnswer: "The ideal answer...",
  metadata: {
    category: "your-category",
    difficulty: "easy"
  }
}
```

## Continuous Evaluation

### Before Deploying

Always run evaluations before merging prompt changes:

```bash
# 1. Make changes to agent specs
vim specs/agents/query-router.spec.yaml

# 2. Run quick eval to check impact
npm run eval:quick

# 3. If looking good, run full suite
npm run eval:all

# 4. Compare scores to baseline
# 5. Merge if scores maintain or improve
```

## Troubleshooting

### Low Scores

If scores drop below targets:

1. **Check the failures**: Braintrust UI shows which cases failed
2. **Review prompts**: Look at the system prompts in `specs/agents/`
3. **Update test cases**: If expectations changed, update datasets
4. **Iterate**: Modify prompts and re-run evals until scores improve

## Best Practices

1. **Run evals frequently** - Before and after prompt changes
2. **Track trends** - Use Braintrust UI to see score changes over time
3. **Start with quick tests** - Fast iteration with `eval:quick`
4. **Add edge cases** - When you find bugs, add them as test cases
5. **Set baselines** - Know your current scores before making changes
6. **Test categories** - Run targeted evals when changing specific agents

## Resources

- [Braintrust Documentation](https://braintrust.dev/docs)
- [AutoEvals Reference](https://www.braintrust.dev/docs/reference/autoevals/nodejs)
- [RAG Evaluation Guide](https://www.braintrust.dev/docs/guides/evals)
