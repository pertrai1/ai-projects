# Design: Add Concise vs. Verbose Reasoning Extension

This extension will explore how the verbosity of the reasoning affects the model's performance.

## Concise Chain-of-Thought Prompt

This prompt will encourage the model to provide a brief, high-level overview of its reasoning.

**File:** `src/prompts/conciseChainOfThoughtPrompt.ts`

**Function:** `conciseChainOfThoughtPrompt(question: string): string`

**Example:**

```
Question: A train has 5 carriages. Each carriage has 12 rows of seats. Each row has 4 seats. How many seats are there in total?
Briefly, what is the reasoning?
```

## Verbose Chain-of-Thought Prompt

This prompt will encourage the model to provide a detailed, step-by-step explanation of its reasoning.

**File:** `src/prompts/verboseChainOfThoughtPrompt.ts`

**Function:** `verboseChainOfThoughtPrompt(question: string): string`

**Example:**

```
Question: A train has 5 carriages. Each carriage has 12 rows of seats. Each row has 4 seats. How many seats are there in total?
Let's think step by step, explaining each calculation in detail.
```

## Runner and Analyzer Updates

The `src/runner.ts` and `src/analyzer.ts` files will be updated to include the two new prompt types. The runner will execute the prompts and store the results, and the analyzer will include the new prompt types in the accuracy calculations.
