# Project Roadmap — Chain-of-Thought Prompt Comparator

This roadmap defines clear, incremental phases for building a small experimental project that studies and applies **chain-of-thought prompting**, as introduced in *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* .

The intent is to remain scientifically grounded, minimal in scope, and educational in outcome.

---

## Phase 1 — Project Skeleton (TypeScript)

**Goal:** Establish structure with no logic.

**Activities**

* Initialize a TypeScript project
* Create base directories:

  ```text
  src/
    prompts/
    tasks/
    results/
  ```
* Add placeholder files:

  * `index.ts`
  * `runner.ts`
  * `tasks.json`

**Deliverables**

* Project builds and runs successfully

**Exit Criteria**

* `npm run start` executes without error.

---

## Phase 2 — Task Design (Controlled Inputs)

**Goal:** Create a small, interpretable task set.

**Activities**

* Define ~10–15 tasks across categories:

  * Multi-step arithmetic
  * Symbolic reasoning (coin flip, letter concatenation)
  * Commonsense reasoning
  * One-step “control” tasks
* Each task includes:

  * `id`
  * `question`
  * `expectedAnswer`
  * `category`

**Deliverables**

* `tasks.json` populated with human-readable tasks

**Exit Criteria**

* You can predict in advance which tasks *should* benefit from chain-of-thought.

---

## Phase 3 — Prompt Construction

**Goal:** Implement the experimental variable: prompt structure.

**Activities**

* Implement:

  * Standard prompt (question → answer)
  * Chain-of-thought prompt (question → reasoning → answer)
* Keep prompts minimal and consistent.

**Deliverables**

* `standardPrompt.ts`
* `chainOfThoughtPrompt.ts`

**Exit Criteria**

* The only difference between prompts is reasoning structure, not wording complexity.

---

## Phase 4 — Model Execution

**Goal:** Run both prompts under identical conditions.

**Activities**

* For each task:

  * Run standard prompt
  * Run chain-of-thought prompt
* Use identical model parameters (temperature, max tokens, model).

**Deliverables**

* Raw model outputs stored per task and prompt type.

**Exit Criteria**

* Every task produces two comparable outputs.

---

## Phase 5 — Answer Extraction & Evaluation

**Goal:** Quantitatively compare performance.

**Activities**

* Extract final answers conservatively.
* Compare against ground truth.
* Record:

  * Correct / incorrect
  * Prompt type
  * Token usage (optional)

**Deliverables**

* Structured evaluation results (e.g., JSON)

**Exit Criteria**

* Accuracy can be computed per prompt type and per task category.

---

## Phase 6 — Analysis & Reflection

**Goal:** Convert results into understanding.

**Activities**

* Compare:

  * Accuracy: standard vs chain-of-thought
  * Performance by task category
* Manually inspect:

  * Fluent but incorrect reasoning
  * “One-step-missing” errors described in the paper

**Deliverables**

* `results/output.json`
* A brief written summary of findings

**Exit Criteria**

* Your conclusions align with the paper’s empirical findings and limitations.

---

## Phase 7 — Optional Extensions

**Goal:** Explore only after replication.

**Possible Extensions**

* Reasoning-after-answer ablation
* Zero-shot chain-of-thought (“Let’s think step by step”)
* Concise vs verbose reasoning
* Error-type tagging (semantic vs arithmetic vs omission)

**Constraint**

* One hypothesis per extension.

---

## Guiding Principles

* Prefer clarity over scale.
* Treat reasoning text as *behavioral output*, not proof of correctness.
* Avoid prompt over-engineering.
* Replicate findings before extending them.

---

## References

* Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, NeurIPS 2022
