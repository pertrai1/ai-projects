# Installing Braintrust Evaluations

## Step 1: Install NPM Dependencies

```bash
cd plants-fieldguide
npm install --save-dev braintrust autoevals
```

## Step 2: Verify Installation

```bash
npx braintrust --version
```

## Step 3: Run Your First Evaluation

```bash
npm run eval:quick
```

This runs a quick test to verify everything works. Expected runtime: 1-2 minutes.

## What Was Set Up

### Files Created

```
plants-fieldguide/
├── evaluations/
│   ├── README.md                        # Full documentation
│   ├── SETUP.md                         # Setup guide
│   ├── query-router.eval.ts            # Routing evaluation suite
│   ├── document-retriever.eval.ts      # RAG evaluation suite
│   └── datasets/
│       ├── routing-test-cases.ts       # 30+ routing test cases
│       └── rag-test-cases.ts          # 10+ RAG test cases
```

### Package.json Scripts Added

- `npm run eval:quick` - Quick test (10 routing + 5 RAG cases)
- `npm run eval:routing` - All routing tests
- `npm run eval:rag` - All RAG tests
- `npm run eval:all` - Complete test suite

## Test Coverage

### Query Router Evaluations
- Definition lookups (FACW, wetland indicators, etc.)
- How-to questions (search procedures)
- Comparisons (native vs introduced, FACW vs FAC)
- Data retrieval (show me plants, list plants)
- General Q&A
- Edge cases

### RAG Evaluations
- Answer accuracy (must include required facts)
- Hallucination resistance (must not make up facts)
- Citation quality
- Answer relevance
- Answer length appropriateness

## Metrics Tracked

### Routing Metrics
- `agent_type_accuracy` - Correct agent type selected
- `confidence_accuracy` - Appropriate confidence level
- `search_strategy_accuracy` - Correct search strategy
- `overall_quality` - Weighted combination

### RAG Metrics
- `must_include` - Required facts present
- `must_not_include` - No hallucinations
- `citation_check` - Sources cited
- `answer_length` - Appropriate length
- `overall_quality` - Weighted combination
- `AnswerRelevancy` - LLM-as-judge relevance

## Quick Reference

```bash
# Install
npm install --save-dev braintrust autoevals

# Quick test (recommended first run)
npm run eval:quick

# Full suite
npm run eval:all

# Individual suites
npm run eval:routing
npm run eval:rag

# Specific eval
npx braintrust eval evaluations/query-router.eval.ts --filter query-router-quick
```

## Support

For questions or issues:
- See `evaluations/README.md` for detailed docs
- Check `evaluations/SETUP.md` for setup troubleshooting
- Visit [Braintrust Documentation](https://braintrust.dev/docs)
