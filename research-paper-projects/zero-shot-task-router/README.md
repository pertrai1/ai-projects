# Zero-Shot Task Router

_A Prompt-Conditioned Language Model Research Project_

---

## Overview

This repository is part of a series of **small research projects** investigating the behavior, limitations, and evaluation of large language models under constrained and controlled settings.

This project focuses on **zero-shot task induction**: evaluating whether a single language model can perform multiple natural language processing tasks when the _only_ mechanism for task specification is natural language itself.

The system is implemented as a TypeScript-based CLI and is intended as an **experimental harness**, not an end-user application.

---

## Research Motivation

Most NLP systems rely on explicit task supervision, whether through labeled datasets, task-specific fine-tuning, or architectural specialization. However, prior work demonstrates that large language models trained purely on next-token prediction can exhibit **unsupervised multitask behavior** when conditioned appropriately in text.

This project adopts the perspective that:

> **Task specification is an interface problem, not a modeling problem.**

Rather than asking _what task should be run_, this work asks:

- How is a task described?
- How sensitive is behavior to that description?
- Where does zero-shot task induction fail?

---

## Research Question

> To what extent can prompt-level task conditioning replace explicit task routing in language-model-based systems?

Supporting questions include:

- Which textual signals are required to induce a task?
- How stable is task behavior across prompt variants?
- Are some tasks inherently more prompt-fragile than others?

---

## Methodological Framing

This project follows the same guiding principles as other research-oriented CLI projects in this series:

- **Single execution path**
  The system does not branch on task type at runtime.

- **Prompt as the independent variable**
  All task differences are encoded in text, not code.

- **Model and decoding parameters held constant**
  Behavioral differences should be attributable to prompt structure alone.

- **Explicit experiment logging**
  Prompt variants and observations are recorded to support reflection and comparison.

---

## Experimental Setup

### Tasks Under Study

The following task categories are explored in a zero-shot setting:

- Summarization
- Question answering
- Translation

Each task is expressed as a **prompt template**, not a task module. There is no task classifier or router beyond text construction.

---

### Prompt Variants

Experiments focus on controlled manipulation of:

- Task phrasing (e.g. explicit vs implicit instructions)
- Output constraints (concise, verbose, stylistic)
- Prompt structure (instruction placement, delimiters, markers)

These variations are intentionally minimal to isolate their effect on model behavior.

---

## System Design

- **Language:** TypeScript
- **Interface:** Command-line (CLI)
- **Execution model:** One prompt → one completion
- **Model interaction:** Abstracted client interface

The CLI exists to enforce repeatability and clarity in experiments, not to provide a user-friendly abstraction.

---

## Phase 2 CLI Usage

Render a prompt template with an input string and print the exact prompt text (replace the placeholder with real text):

```bash
npm run dev -- --template raw --input "<your input text here>"
```

The output is the prompt text only, with no additional labels or markers added by the system.

Baseline summarization template (replace the placeholder with real text):

```bash
npm run dev -- --template summarize-minimal --input "<your input text here>"
```

---

## Phase 4 Completion Mode

Configure the OpenAI API key:

```bash
export OPENAI_API_KEY="your-api-key"
```

Optional base URL override:

```bash
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

Run a completion with fixed decoding parameters (replace the placeholder with real text):

```bash
npm run dev -- --template summarize-minimal --input "<your input text here>" --complete
```

---

## Expected Observations

Based on prior analysis of zero-shot behavior, this project anticipates that:

- Small changes in prompt wording can induce large behavioral shifts
- Some tasks degrade sharply when explicit task hints are removed
- Zero-shot task induction is uneven across task categories

Observed behavior is treated as **descriptive evidence**, not benchmark performance.

---

## Scope and Limitations

This project intentionally avoids:

- Fine-tuning
- Learned task routing
- Few-shot prompting (unless explicitly tested)
- Benchmark optimization

The aim is understanding model behavior, not improving it.

---

## Relationship to Prior Work

This project is directly inspired by the analysis presented in [_Language Models are Unsupervised Multitask Learners_](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), which demonstrates that language models can perform diverse tasks when tasks are specified as part of the input sequence rather than as external supervision .

---

## Educational Objective

The primary objective of this work is to develop practical intuition for:

- Prompt design as an interface
- Zero-shot task induction
- Experimental evaluation of generative models

Code simplicity is treated as a feature, not a limitation.
