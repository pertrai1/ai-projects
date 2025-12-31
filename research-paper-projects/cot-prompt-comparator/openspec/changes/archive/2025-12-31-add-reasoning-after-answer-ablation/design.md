# Design: Add Reasoning-After-Answer Ablation Extension

This extension will explore how asking for reasoning after the answer affects the model's performance.

## Reasoning-After-Answer Prompt

This prompt will ask the model to provide the answer first, and then provide the reasoning.

**File:** `src/prompts/reasoningAfterAnswerPrompt.ts`

**Function:** `reasoningAfterAnswerPrompt(question: string): string`

**Example:**

```
Question: A train has 5 carriages. Each carriage has 12 rows of seats. Each row has 4 seats. How many seats are there in total?
Answer:
Now, explain your reasoning.
```

## Runner and Analyzer Updates

The `src/runner.ts` and `src/analyzer.ts` files will be updated to include the new prompt type. The runner will execute the prompt and store the results, and the analyzer will include the new prompt type in the accuracy calculations.
