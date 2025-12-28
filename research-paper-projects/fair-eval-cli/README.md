# FairEval-CLI

A **FairEval-style CLI tool** for pairwise evaluation of LLM responses that mitigates positional bias using calibrated evaluation procedures.

This project is a practical implementation inspired by the research paper **_[Large Language Models are not Fair Evaluators](llms-are-not-fair-evaluators.pdf)_**, which demonstrates that naïvely using LLMs as judges leads to severe and exploitable ordering bias, and proposes simple but effective calibration strategies to fix it .

---

## Why This Project Exists

Most “LLM-as-a-judge” setups do something like:

1. Show a prompt
2. Show Response A then Response B
3. Ask an LLM which is better

The paper shows this is **fundamentally flawed**:

- Merely swapping the order of responses can flip the evaluation result.
- Strong models (GPT-4) and weaker ones (ChatGPT) both exhibit positional bias.
- Single-pass judgments are unstable and self-contradictory.

**FairEval-CLI** treats evaluation as a _statistical procedure_, not a single API call.

---

## What FairEval-CLI Does

`FairEval-CLI` performs **pairwise response evaluation** using two key calibration strategies from the paper:

### 1. Multiple Evidence Calibration (MEC)

- The evaluator is forced to:
  - Generate **evaluation evidence first**
  - Then assign numeric scores

- This process is repeated `k` times to reduce variance.

### 2. Balanced Position Calibration (BPC)

- Each comparison is evaluated **twice**:
  - (A, B)
  - (B, A)

- Scores are mapped back and **averaged across both positions**, canceling positional bias.

The final output includes:

- Calibrated scores for A and B
- Win / lose / tie decision
- Confidence estimate based on disagreement across samples

---

## Features

- Evidence-first evaluation prompts (no verdict-first bias)
- Multiple sampling per position (`--k`)
- Automatic position swapping and aggregation
- Human-readable or JSON output
- File, inline, or stdin inputs
- OpenAI-compatible (supports gateways via `OPENAI_BASE_URL`)

---

## Requirements

- **Node.js 18+** (uses built-in `fetch`)
- An OpenAI-compatible API key

---

## Installation

```bash
git clone https://github.com/pertrai1/ai-projects.git
cd air-projects/research-paper-projects/fair-eval-cli
npm install
npm run build
```

---

## Configuration

Create a `.env` file:

```bash
OPENAI_API_KEY="your_api_key_here"
# Optional (for proxies / gateways):
OPENAI_BASE_URL="https://api.openai.com/v1"
```

---

## CLI Usage

### Basic Evaluation

```bash
node dist/index.js eval \
  --prompt "Explain closures in JavaScript" \
  --a-file response_a.txt \
  --b-file response_b.txt
```

### With Explicit Calibration Controls

```bash
node dist/index.js eval \
  --prompt-file prompt.txt \
  --a-file response_a.txt \
  --b-file response_b.txt \
  --criteria helpfulness,accuracy,clarity \
  --k 3 \
  --temperature 1.0 \
  --model gpt-4 \
  --verbose
```

### Read from stdin

```bash
cat response_a.txt | node dist/index.js eval \
  --prompt "What is dependency injection?" \
  --a-file - \
  --b-file response_b.txt
```

### JSON Output (for CI / automation)

```bash
node dist/index.js eval \
  --prompt "Write a SQL query to find duplicates" \
  --a-file a.txt \
  --b-file b.txt \
  --json
```

---

## Output Example

```text
Result
  Winner:      A wins
  Score (A):   8.12
  Score (B):   7.01
  Confidence:  high

Run settings
  Model:       gpt-4
  k:           3
  Temperature: 1
  Criteria:    helpfulness, accuracy, clarity
```

---

## How Confidence Is Computed

Confidence is derived from the **variance of score differences across all calibrated samples**:

- **High**: very stable across runs
- **Medium**: some disagreement
- **Low**: unstable → human review recommended

This is a lightweight analogue of the paper’s BPDE metric.

---

## Project Structure

```
src/
├── index.ts              # CLI entry point
├── core/
│   ├── prompts.ts        # Evidence-first prompt templates
│   ├── evaluator.ts      # OpenAI-compatible LLM client
│   ├── parser.ts         # Strict JSON parsing + validation
│   ├── runPairwiseEval.ts# MEC + BPC implementation
├── utils/
│   ├── readInput.ts      # File / stdin handling
│   └── math.ts           # Mean / variance helpers
```

---

## Limitations

- No human-in-the-loop calibration yet (HITLC)
- Cost scales with `2 × k` evaluator calls
- Assumes evaluator follows JSON constraints (defensive parsing mitigates this)

---

## Research Reference

This tool is directly inspired by:

> **Peiyi Wang et al.**
> _Large Language Models are not Fair Evaluators_
> arXiv:2305.17926

If you use this project in research or tooling, you should cite the paper .

---

## Philosophy

LLMs are **useful but noisy annotators**.

If you treat them like a single, deterministic oracle, you will get misleading results.
If you treat them like a biased, stochastic process—and calibrate accordingly—you get something genuinely useful.
