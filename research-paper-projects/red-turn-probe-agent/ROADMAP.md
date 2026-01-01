# ROADMAP

This roadmap defines **incremental, scope-controlled milestones** for building **RedTurn**, a small red-teaming application for eliciting multi-turn conversational failures in large language models.

The primary goal is **learning**, not performance or completeness.

---

## Milestone 0 — Define the Objective (½ day)

**Goal**
Lock the project’s purpose before writing code.

**Deliverables**

* One-paragraph project description in `README.md`
* Explicit decisions (non-negotiable):

  * One target model
  * One behavioral objective
  * Maximum of **2 turns**

**Recommended Default**

* Behavior: self-contradiction / self-affirmation
* Turns: 2
* Target: one API-accessible LLM

**Stop Condition**
You can describe the behavior being tested in **one sentence**.

---

## Milestone 1 — Static Baseline (1 day)

**Goal**
Establish a non-adaptive baseline to expose the limits of static prompts.

**Deliverables**

* Script that:

  * Sends a fixed, multi-turn prompt sequence
  * Logs full conversations
  * Applies a simple automated success check (e.g., keyword or regex)

**Constraints**

* No loops
* No adaptation
* No learning

**Stop Condition**
Repeated runs produce nearly identical outcomes.

---

## Milestone 2 — Explicit Test Rubric (1 day)

**Goal**
Make “failure” precise and machine-verifiable.

**Deliverables**

* `rubric(conversation) -> bool`
* At least 5 manually validated positive and negative examples

**Rules**

* Rubric must be fully automatic
* No human judgment during execution

**Stop Condition**
You trust the rubric to decide success without manual inspection.

---

## Milestone 3 — Heuristic Adaptive Loop (1–2 days)

**Goal**
Introduce adaptation without learning algorithms.

**Deliverables**

* Multi-turn loop where:

  * Turn 1 is fixed
  * Turn 2 is chosen based on model response category
    (e.g., confident → escalate, hesitant → accuse)

**Explicit Exclusions**

* No gradients
* No optimization
* No generative strategy synthesis

**Stop Condition**
The adaptive loop finds failures missed by the static baseline.

---

## Milestone 4 — Strategy–Content Separation (1 day)

**Goal**
Implement strategy factorization to improve exploration.

**Deliverables**

* Prompts structured as:

  ```
  Strategy: <high-level intent>
  Content: <natural language message>
  ```

**Rationale**
Separating intent from surface form prevents repetition and mirrors the paper’s most impactful design choice.

**Stop Condition**
Strategies can be swapped without changing content-generation logic.

---

## Milestone 5 — Scored Strategy Selection (1–2 days)

**Goal**
Add lightweight reward-driven behavior without full RL.

**Deliverables**

* Maintain a running score per strategy
* Prefer higher-scoring strategies over time (bandit-style)

**Constraints**

* No PPO / GRPO / policy gradients
* No model fine-tuning

**Stop Condition**
Logs show strategy preferences shifting based on outcomes.

---

## Milestone 6 — Evaluation & Comparison (1 day)

**Goal**
Turn the project into a measurable experiment.

**Deliverables**

* Metrics:

  * Success rate
  * Queries per successful failure
* Comparison:

  * Static baseline vs. adaptive heuristic system

**Stop Condition**
You can produce a small results table or plot.

---

## Milestone 7 — Retrospective Analysis (½ day)

**Goal**
Extract understanding, not features.

**Deliverables**

* Short write-up answering:

  1. Which failure patterns emerged?
  2. Which adaptations mattered most?
  3. Where did diminishing returns begin?

**Hard Rule**
No new code during this phase.

**Stop Condition**
Clear articulation of lessons learned.

---

## Explicit Non-Goals (Anti-Scope-Creep)

Do **not**:

* Add more behaviors
* Increase turn count
* Fine-tune models
* Add RL training
* Build UI or dashboards

Each item above is a *separate project*.

---

## Completion Criteria

The project is complete when:

* There is a CLI terminal user interface that is used
* All milestones are finished
* Results are reproducible
* The retrospective is written

At that point, **stop**.
