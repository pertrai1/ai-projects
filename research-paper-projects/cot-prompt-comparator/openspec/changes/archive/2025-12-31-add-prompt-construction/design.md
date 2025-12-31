# Design: Add Prompt Construction

The prompt construction phase will focus on creating two distinct prompt styles: a standard prompt and a chain-of-thought prompt. The design will be minimal to ensure that the only variable being tested is the prompt structure itself.

## Standard Prompt

The standard prompt will be a simple question-and-answer format. It will take a question as input and present it directly to the model, expecting a direct answer.

**File:** `src/prompts/standardPrompt.ts`

**Function:** `standardPrompt(question: string): string`

**Example:**

```
Question: What is the capital of France?
Answer:
```

## Chain-of-Thought Prompt

The chain-of-thought prompt will encourage the model to generate intermediate reasoning steps before providing a final answer. This will be achieved by adding a simple instruction to the prompt.

**File:** `src/prompts/chainOfThoughtPrompt.ts`

**Function:** `chainOfThoughtPrompt(question: string): string`

**Example:**

```
Question: A train has 5 carriages. Each carriage has 12 rows of seats. Each row has 4 seats. How many seats are there in total?
Let's think step by step.
```

This design ensures that the prompts are consistent and that the only difference between them is the instruction to generate a chain of thought.
