# Phase 2: Intent Classification & Routing

## Overview
Phase 2 introduces "intelligence" into the RAG pipeline. Instead of treating every query the same (search → answer), we first classify the **intent** of the query. This allows us to downstream optimize retrieval strategies (Phase 3).

## Architecture
The system uses a `QueryRouter` agent that acts as a front-end classifier.

**Input**: User query string
**Output**: `QueryIntent` object containing:
- `type`: The intent classification (e.g., ARCHITECTURE, LOCATION)
- `confidence`: 0-1 score
- `entities`: Extracted key terms (function names, files)
- `reasoning`: Why this classification was chosen

## Intent Types

| Intent Type | User Need | Retrieval Strategy (Preview) |
|-------------|-----------|------------------------------|
| `LOCATION` | "Where is X?" | High precision, low K, exact name match |
| `ARCHITECTURE` | "How does X work?" | High recall, high K, broad context |
| `IMPLEMENTATION` | "How is X implemented?" | Semantic search + code structure |
| `DEPENDENCY` | "What depends on X?" | Structural search (imports/references) |
| `USAGE` | "How do I use X?" | Search for tests and examples |
| `DEBUGGING` | "Why did X fail?" | Search for error handlers and edge cases |
| `COMPARISON` | "X vs Y?" | Retrieve both entities for side-by-side |

## Implementation Details
For this educational phase, we implemented a `MockLLMClient` that uses heuristic keyword matching to simulate an LLM. This allows testing the *pipeline* without incurring API costs.

### Key Learnings from "Mock" Implementation
Our mock implementation revealed why **LLMs are superior to keyword matching**:

**The "Fixed" Bug**:
One of our test cases failed:
- **Query**: "What is the difference between semantic and *fixed* chunking?"
- **Expected**: `COMPARISON`
- **Actual**: `DEBUGGING`
- **Why**: The keyword rule for `DEBUGGING` looked for the substring "fix" (as in "bug fix"). It incorrectly matched "fixed" in "fixed chunking".

**Lesson**: Simple keyword matching lacks *semantic understanding*. An LLM understands that "fixed" here refers to a strategy type, not a repair action.

## Future Improvements (Real LLM)
When switching to a real LLM (Phase 3+), we will:
1. Use a strict system prompt defining the intent categories.
2. Use "Chain of Thought" reasoning to verify classification before outputting the tag.
3. Extract entities more reliably (distinguishing `validateToken` the function from "token validation" the concept).

## Results
- **Accuracy**: 90% (9/10 correct) on the test set.
- **Latency**: <1ms (Mock), ~500ms (Real LLM expected).
