# Zero-Shot Task Router — Project Roadmap

This roadmap defines the sequence of research and implementation milestones required to complete the project. Each phase has a clear **goal**, **scope**, and **completion signal**, ensuring that progress reflects understanding rather than accumulation of features.

---

## Phase 1 — Research Setup & Framing

**Goal:**
Establish the project as a coherent research artifact before writing substantive code.

**Scope:**

- Project initialization in TypeScript
- Research philosophy and terminology alignment
- Clear statement of the research question and constraints

**Milestones:**

- TypeScript project initialized with strict settings
- Research-paper–style README written
- Shared _Research Philosophy_ added
- Explicit non-goals documented (no fine-tuning, no task routing logic)

**Exit Criteria:**
A new reader can understand _what is being studied and why_ without running the code.

---

## Phase 2 — Experimental Skeleton

**Goal:**
Create a minimal system that exposes prompts as first-class experimental objects.

**Scope:**

- Core abstractions only
- No real model calls
- No task optimization

**Milestones:**

- `PromptTemplate` abstraction defined
- Prompt construction pipeline implemented
- CLI wired end-to-end
- Stub language model client in place

**Exit Criteria:**
Running the CLI outputs the _exact prompt text_ that defines the experiment.

---

## Phase 3 — Baseline Task (Deliberate Weakness)

**Goal:**
Establish a weak baseline to make task emergence (or failure) visible.

**Scope:**

- Single task: summarization
- Minimal prompt wording
- No hints, examples, or optimizations

**Milestones:**

- Summarization prompt template implemented
- Prompt recorded verbatim in experiment logs
- Expected failure modes documented _before_ execution

**Exit Criteria:**
The baseline behavior is clearly poor or unstable, with understood reasons.

---

## Phase 4 — Real Model Integration

**Goal:**
Replace scaffolding with a real language model while preserving experimental control.

**Scope:**

- One model backend
- Fixed decoding parameters
- No new task logic

**Milestones:**

- Model client implementation added
- Configuration centralized and frozen
- Reproducible runs verified

**Exit Criteria:**
Behavioral differences can be attributed to prompt changes alone.

---

## Phase 5 — Prompt Ablation Studies (Core Research Phase)

**Goal:**
Directly test the hypothesis that task behavior depends on prompt structure.

**Scope:**

- Controlled prompt variants
- Same inputs, same model, same parameters

**Milestones:**

- Multiple summarization prompt variants defined
- Side-by-side outputs collected
- Observations documented (including failures)

**Exit Criteria:**
You observe prompt sensitivity consistent with zero-shot task induction claims.

---

## Phase 6 — Task Expansion (No New Architecture)

**Goal:**
Test whether the same system generalizes across task categories.

**Scope:**

- Add QA and translation
- Reuse the same execution path

**Milestones:**

- QA prompt template added
- Translation prompt template added
- Zero task-specific routing introduced

**Exit Criteria:**
All tasks run through identical code, differing only by prompt text.

---

## Phase 7 — Cross-Task Analysis

**Goal:**
Compare robustness and brittleness across tasks.

**Scope:**

- Qualitative analysis
- Failure-focused evaluation

**Milestones:**

- Task-by-task comparison notes written
- Prompt sensitivity patterns identified
- Clear articulation of where zero-shot breaks down

**Exit Criteria:**
You can explain _why_ some tasks degrade faster than others.

---

## Phase 8 — Optional Evaluation Refinement

**Goal:**
Support observations with lightweight evidence without over-optimizing.

**Scope:**

- Simple qualitative or proxy metrics
- No benchmark chasing

**Milestones:**

- Optional metrics added where informative
- Metrics interpreted cautiously

**Exit Criteria:**
Metrics clarify observations without driving conclusions.

---

## Phase 9 — Synthesis & Closure

**Goal:**
Finalize the project as a complete research artifact.

**Scope:**

- Documentation alignment
- Honest limitation statements

**Milestones:**

- README reflects actual experiments performed
- Limitations section completed
- Relationship to prior work clearly stated
- No dead or unused abstractions remain

**Final Completion Definition:**
The project demonstrates, through controlled experiments, how multiple tasks emerge—or fail to emerge—purely from prompt conditioning in a single language model.

---

## Completion Does NOT Require

- Fine-tuning
- Few-shot prompting (unless explicitly studied)
- Performance optimization
- Production-ready UX
- Benchmark competitiveness
