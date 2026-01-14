---
name: Daily Learning Recall (LLM/Agents)
about: Active recall with expert evaluation — dynamically sourced from recent arXiv research
title: 'Active Recall Session: {{ env.BUCKET }} — {{ env.FOCUS }}'
labels: ['daily-learning', 'llm', 'agents']
assignees: ['pertrai1']
---

<!--
DYNAMIC SOURCING: Topics generated from recent arXiv papers in:
- cs.CL (Computation and Language)
- cs.AI (Artificial Intelligence)
- cs.LG (Machine Learning)
Search terms: LLM, agents, prompt engineering, retrieval, reasoning, alignment

topic: {{ env.TOPIC }}
paper_title: {{ env.PAPER_TITLE }}
paper_url: {{ env.PAPER_URL }}
paper_date: {{ env.PAPER_DATE }}
system_type: {{ env.SYSTEM_TYPE }}
confidence_initial: {{ env.CONFIDENCE }}
date: {{ env.DATE }}
-->

## Learning Objective

**Bucket:** {{ env.BUCKET }}  
**Focus:** {{ env.FOCUS }}  
**Source Paper:** [{{ env.PAPER_TITLE }}]({{ env.PAPER_URL }})  
**Published:** {{ env.PAPER_DATE }}  
**Date:** {{ env.DATE }}

**Core Research Question from Paper:**
{{ env.RESEARCH_QUESTION }}

---

## Active Recall (NO NOTES)

### 1. Definition + Boundary

**{{ env.CONCEPT }} is **_; it is not _**.**

(Define the concept from the paper in your own words without looking at the source)

---

### 2. Failure Statement

**The system/approach fails when **_ because _**.**

(What are the known limitations or failure modes discussed in the paper?)

---

### 3. Mental Model

(Reconstruct the system architecture, data flow, or conceptual framework from memory)

(Include: components, interactions, feedback loops, uncertainty points)

#### Option 1: Mermaid Diagram

```mermaid
graph TD
    A[Component A] --> B[Component B]
    B --> C[Component C]
```

#### Option 2: ASCII Diagram

```text
[Input] --> [Process] --> [Output]
            ^      |
            |      v
         [Feedback]
```

---

### 4. Mechanism (Causal Chain)

(Write 3–5 linked causal statements explaining _why_ this approach works)

1. **Input/Trigger →**
2. **Process/Transform →**
3. **Intermediate Effect →**
4. **Feedback/Constraint →**
5. **Output/Result**

---

### 5. Constraints & Trade-offs

- **Computational Constraints:**

- **Architectural Constraints:**

- **Alignment/Safety Constraints:**

- **Chosen trade-off and justification:**

---

### 6. Transfer Test

**Scenario:** How would this approach perform in:

- Different modality (code → images, text → audio)?
- Different scale (10x parameters, 100x data)?
- Different domain (medical, legal, scientific)?

**Prediction:**

**Failure hypothesis:**

---

## Self-Assessment (Rubric)

| Dimension              | Score (0–4) | Notes |
| ---------------------- | ----------- | ----- |
| Conceptual Clarity     |             |       |
| Mental Model Integrity |             |       |
| Causal Understanding   |             |       |
| Failure Awareness      |             |       |
| Trade-off Judgment     |             |       |
| Transfer Ability       |             |       |
| Calibration & Honesty  |             |       |

**Initial Confidence (0–100%):** {{ env.CONFIDENCE }}

---

### Falsification Plan

**Experiment design:**
(One experiment or eval that could prove the paper's claims wrong or reveal hidden assumptions)

**Expected result if correct:**

**Expected result if wrong:**

---

### Research Context

**Related work mentioned in paper:**

-
- **Open questions from the paper:**

-

### Carry-Forward Insight

(One sentence for Future Me about what matters most from this concept)

---

### Delayed Recall (Fill 24-72 hours later)

- What did I forget?
- What was oversimplified?
- What was wrong?
- What surprised me when I re-read?

---

### Completion Checklist

- [ ] Explained aloud without notes
- [ ] Identified ≥1 real failure mode from the paper
- [ ] Made a falsifiable claim about the approach
- [ ] Drew architecture/flow from memory
- [ ] Scored honestly
- [ ] Linked to ≥1 related paper or technique

### Confidence Delta Reflection (Fill After Review)

- Initial confidence: {{ env.CONFIDENCE }}%
- Reviewer signal (over / under / calibrated):
- My assessment:
- What I will adjust next time:
- Calibration error: ±\_\_\_\_%

---

## Implementation Notes (Optional)

**Code experiment to try:**

```javascript
// Minimal reproduction or test of the core mechanism
```

**Eval to run:**

- Dataset:
- Metric:
- Baseline:
