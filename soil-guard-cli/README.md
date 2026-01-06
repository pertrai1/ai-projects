# Soil Guard CLI

A focused CLI tool designed to demonstrate the implementation of LLM Guardrails. This project acts as a "Soil Health Service" assistant, using parallel input and output validation to ensure AI responses remain on-topic, safe, and formatted correctly.

## Overview

The Soil Guard CLI simulates a professional agricultural assistant. It uses a middleware-inspired approach to guardrails:

- Input Guardrail: Intercepts the user's prompt to ensure it is strictly related to soil science, plants, or agriculture.
- Output Guardrail: Scrutinizes the LLM's response to prevent "hallucinated" chemical recommendations or non-professional advice.
- Parallel Execution: Runs the guardrail check and the primary LLM completion simultaneously to minimize latency.

## Key Features

- Topic Enforcement: Rejects queries about unrelated topics (e.g., weather, stocks, general tech) using a lightweight classifier model.
- Safety Filtering: Detects and flags potentially harmful or unauthorized agricultural recommendations.
- TUI Experience: Uses commander.js for command handling and chalk for color-coded status reporting in the terminal.
- Type-Safe Validation: Uses Zod to define and enforce schemas for guardrail results and structured LLM outputs.

## Suggested Capabilities

### Guarded Querying (Input Guardrail)

The core feature will be a "Topic Jail." When a user submits a query via the CLI, the program first evaluates if the query is relevant to soil health.

- If relevant: It passes the query to the LLM.
- If irrelevant: It uses chalk.yellow or chalk.red to inform the user that the request is out of scope (e.g., "I only discuss soil, not the weather").

### Soil Data Analysis (Structured Output)

Using the logic from your other projects, you can feed the tool specific soil metrics (pH levels, Nitrogen, Phosphorus, Potassium).

- Validation: The guardrail can check if the LLM's output contains a specific "Confidence Score" or "Safety Warning" before displaying it.
- Formatting: It can use chalk to color-code soil health indicators (e.g., pH 5.0 shows up in red for high acidity).

### "Human-in-the-Loop" Verification

Following the pattern of your other AI projects, the CLI can prompt the user for confirmation before "finalizing" a recommendation.

CLI Flow:

- User inputs: soil-health analyze --ph 6.5
- Guardrail verifies query.
- LLM generates a recommendation.
- Output Guardrail checks for "hallucinated chemicals."
- TUI displays the advice and asks: Is this advice safe to follow? (y/n)
