# Chain-of-Thought & Reasoning

---

## 1. What It Is

**Chain-of-Thought (CoT) prompting** is a technique that improves large language model (LLM) reasoning by eliciting intermediate steps before a final answer. Instead of jumping straight to a conclusion, the model produces a sequence of logical steps — a "chain of thought" — that mirrors how a human might work through a problem (Wei et al., 2022).

**Why it matters:** Standard prompting often fails on tasks requiring arithmetic, logic, or multi-step deduction. CoT prompting can dramatically improve accuracy — e.g., boosting GSM8K math performance from ~18% to ~57% on PaLM 540B — without retraining the model (Wei et al., 2022).

**Scope:**

- **Covers:** Few-shot CoT, zero-shot CoT, self-consistency, and tree-of-thought reasoning.
- **Does not cover:** General prompt engineering patterns (see Prompt Engineering), fine-tuning methods (see [LoRA](./lora.md)), or agent tool-use workflows (see [Agents](./agents.md)).

---

## 2. Core Mental Model

1. **Decompose before answering** — Breaking a complex question into smaller sub-steps is the core mechanism. The model solves each step, then combines them into a final answer.
2. **Show your work** — Explicit intermediate reasoning makes errors visible and debuggable, improving both accuracy and interpretability.
3. **Scale unlocks reasoning** — CoT prompting is an emergent ability; it reliably helps models above ~100B parameters but can hurt smaller ones (Wei et al., 2022). See [Emergent Behavior](./emergent_behavior.md) for more on scaling thresholds.
4. **Multiple paths increase reliability** — Sampling several reasoning chains and selecting the most consistent answer (self-consistency) reduces random errors (Wang et al., 2023).

**One intuition to remember:** CoT is "thinking out loud" for a language model — the same way writing out long-division steps helps a student avoid mistakes.

---

## 3. How It Works

### Workflow

1. **Construct the prompt** — Provide the model with a question and (optionally) a few exemplars that include step-by-step reasoning before the answer.
2. **Generate reasoning** — The model produces intermediate steps following the demonstrated pattern.
3. **Extract the answer** — Parse the final answer from the end of the generated chain.

### Key Variants

| Variant | Mechanism | When to Reach for It |
|---|---|---|
| **Few-shot CoT** | Include 4–8 exemplars with worked-out reasoning steps (Wei et al., 2022) | You can craft high-quality exemplars for the task |
| **Zero-shot CoT** | Append "Let's think step by step" — no exemplars needed (Kojima et al., 2022) | Quick prototyping or when exemplars are hard to write |
| **Self-consistency** | Sample multiple CoT outputs, take majority-vote answer (Wang et al., 2023) | High-stakes tasks where a single chain may be unreliable |
| **Tree-of-Thought (ToT)** | Explore branching reasoning paths with look-ahead and backtracking (Yao et al., 2023) | Complex planning or puzzle tasks with dead-end paths |

### Minimal Code Example (Few-Shot CoT)

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const prompt = `Q: A store had 40 apples. They sold 15 in the morning and 9 in the afternoon. How many are left?
A: The store started with 40 apples. They sold 15, leaving 40 - 15 = 25. Then they sold 9 more, leaving 25 - 9 = 16. The answer is 16.

Q: A baker made 60 cookies. She gave 12 to a neighbor and packed the rest equally into 4 boxes. How many cookies per box?
A:`;

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0,
});

console.log(response.choices[0].message.content);
// Expected reasoning: 60 - 12 = 48 cookies remaining. 48 / 4 = 12 cookies per box. The answer is 12.
```

---

## 4. When to Use It (and When Not To)

### Best-Fit Scenarios

- **Multi-step math or logic problems** — CoT's strongest domain; consistent improvements on arithmetic and symbolic reasoning benchmarks (Wei et al., 2022).
- **Commonsense reasoning** — Tasks requiring world-knowledge inference chains (e.g., StrategyQA).
- **Debugging or auditing model outputs** — Visible reasoning steps let you pinpoint where logic fails.
- **Complex question-answering** — When the answer depends on combining multiple facts.

### When to Avoid

- **Simple factual lookups** — "What is the capital of France?" needs no chain of thought; CoT adds latency and cost without benefit.
- **Small models (<100B parameters)** — CoT can degrade performance in smaller models (Wei et al., 2022).
- **Latency-critical applications** — Generating intermediate steps increases token count and response time.
- **Tasks requiring external data** — If the model lacks needed facts, reasoning over wrong premises produces confident-sounding wrong answers. Consider [Retrieval-Augmented Generation (RAG)](./retrieval_augmented_generation.md) instead.

### Trade-Offs

| Factor | CoT Advantage | CoT Cost |
|---|---|---|
| Accuracy | Significant on reasoning tasks | Minimal on recall-only tasks |
| Interpretability | Step-by-step trace | Longer outputs to review |
| Latency | — | More tokens = slower response |
| Cost | — | More tokens = higher API cost |
| Reliability | Higher with self-consistency | Requires multiple samples |

---

## 5. Failure Modes and Evaluation

### Typical Mistakes

- **Unfaithful reasoning** — The model may state correct steps but derive the wrong answer, or produce a correct answer despite flawed steps. The chain can be a post-hoc rationalization rather than the actual computation path (Turpin et al., 2023).
- **Error cascading** — An early wrong step propagates through subsequent steps, compounding the error.
- **Verbosity without substance** — The model generates many words that look like reasoning but add no logical value.
- **Sensitivity to exemplar phrasing** — Small changes in how few-shot exemplars are written can swing accuracy significantly.

### Key Metrics

- **Final-answer accuracy** — The primary metric; compare with and without CoT on the same benchmark.
- **Step correctness** — Manual or automated audit of whether each intermediate step is logically valid.
- **Consistency rate** — Across multiple samples, how often the model converges on the same answer (self-consistency check).

### Good vs. Bad Outcomes

| Signal | Good | Bad |
|---|---|---|
| Steps | Each step follows logically from the previous | Steps are vague, circular, or skip key logic |
| Answer | Matches ground truth and follows from the chain | Correct answer but broken chain, or wrong answer from plausible chain |
| Robustness | Consistent across rephrasings | Answer changes with minor prompt edits |

---

## 6. Practice Path

### Worked Example: Zero-Shot CoT

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const question = `If a train travels at 60 mph for 2.5 hours, then at 80 mph for 1.5 hours, what is the total distance?`;

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "user",
      content: `${question}\n\nLet's think step by step.`,
    },
  ],
  temperature: 0,
});

console.log(response.choices[0].message.content);
// Expected chain:
// Step 1: Distance at 60 mph for 2.5 hours = 60 × 2.5 = 150 miles
// Step 2: Distance at 80 mph for 1.5 hours = 80 × 1.5 = 120 miles
// Step 3: Total distance = 150 + 120 = 270 miles
// The answer is 270 miles.
```

### Progressive Exercises

**Beginner — Compare standard vs. CoT prompting:**
Write two prompts for the same word problem — one that asks for the answer directly, and one that includes "Let's think step by step." Run both against an LLM API and compare the accuracy on 5 different math word problems.

**Intermediate — Build a self-consistency wrapper:**
Write a function that sends the same CoT prompt N times (e.g., N = 5) with `temperature: 0.7`, extracts the final numeric answer from each response, and returns the majority-vote answer. Test it on problems where a single CoT call sometimes fails.

**Advanced — Implement a simple Tree-of-Thought:**
For a multi-step planning problem (e.g., "arrange 4 meetings into 3 time slots with constraints"), implement a function that: (a) generates 2–3 candidate next-steps at each stage, (b) evaluates each candidate with a separate LLM call, and (c) prunes unpromising branches before continuing. Compare its accuracy against a single-pass CoT approach.

---

## 7. Selected References

### Start Here

- **Wei, J., et al. (2022).** "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS 2022.* [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)
  — The foundational CoT paper; introduces few-shot CoT and demonstrates gains across arithmetic, commonsense, and symbolic reasoning.

- **Kojima, T., et al. (2022).** "Large Language Models are Zero-Shot Reasoners." *NeurIPS 2022.* [arXiv:2205.11916](https://arxiv.org/abs/2205.11916)
  — Shows that simply adding "Let's think step by step" enables zero-shot reasoning without exemplars.

- **Wang, X., et al. (2023).** "Self-Consistency Improves Chain of Thought Reasoning in Language Models." *ICLR 2023.* [arXiv:2203.11171](https://arxiv.org/abs/2203.11171)
  — Introduces majority-vote sampling over multiple CoT paths for more reliable answers.

### Go Deeper

- **Yao, S., et al. (2023).** "Tree of Thoughts: Deliberate Problem Solving with Large Language Models." *NeurIPS 2023.* [arXiv:2305.10601](https://arxiv.org/abs/2305.10601)
  — Extends CoT into tree-structured search with backtracking for complex planning tasks.

- **Turpin, M., et al. (2023).** "Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting." *NeurIPS 2023.* [arXiv:2305.04388](https://arxiv.org/abs/2305.04388)
  — Critical examination of when CoT reasoning is a faithful representation of the model's actual computation vs. post-hoc rationalization.

- **Wang, L., et al. (2023).** "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models." *ACL 2023.* [ACL Anthology](https://aclanthology.org/2023.acl-long.147/)
  — Improves zero-shot CoT by having the model plan subtasks before solving, reducing skipped steps and calculation errors.

---

## Metadata

**Last Reviewed:** 2026-04-09
**Maintainer:** Research Assistant Agent
**Scope Notes:** This page covers chain-of-thought prompting variants and structured reasoning strategies for LLMs. General prompt engineering, fine-tuning, agent tool-use, and RLHF are out of scope and documented separately.

**Key References:**
- Wei et al. (2022) — Foundational CoT paper establishing the technique and benchmarks
- Kojima et al. (2022) — Zero-shot CoT demonstrating minimal-effort reasoning elicitation
- Wang et al. (2023) — Self-consistency as a reliability improvement over single-pass CoT

**Assumptions / Limitations:**
- CoT effectiveness assumes access to large-scale models (100B+ parameters or equivalent capability); smaller models may not benefit.
- Code examples use the OpenAI JavaScript SDK; adapt the API calls for other providers as needed.
