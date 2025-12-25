# Veridex

Veridex is a Retrieval-Augmented Generation (RAG) system with a strong focus on governance, document ingestion, chunking experiments, and a comprehensive evaluation harness.

---

## What Will Be Learned by Building This Project

- How to design a document ingestion pipeline with traceable metadata and versioning
- Practical chunking strategies (fixed, semantic, hybrid) and how they affect retrieval quality
- Embedding-based retrieval and relevance ranking for document corpora
- How to constrain LLM generation to retrieved evidence only
- How to design a RAG system that can explicitly refuse to answer
- Building an evaluation harness for retrieval accuracy and answer grounding
- Detecting and measuring hallucinations and unsupported claims
- Implementing governance features such as audit logs, provenance tracking, and reproducibility
- Designing AI systems for compliance, explainability, and long-term trust
- Thinking like an AI engineer instead of a prompt engineer

---

## Roadmap

The development of Veridex is planned in several phases, starting with the foundational setup and progressively adding more advanced capabilities.

### Phase 0: Epistemic Constraints & Design Principles

- [ ] Define what the system is allowed to claim vs. must refuse
- [ ] Define what constitutes “evidence”
- [ ] Document non-goals and out-of-scope behavior

### Phase 1: Project Setup

- [ ] OpenSpec Setup - Initialize the `openspec/` directory with `project.md`, `specs/`, and `changes/` for spec-driven development.
- [ ] Set up `npm` with TypeScript, a base `package.json`, and a `.gitignore` file.
- [ ] Configure Prettier and ESLint for consistent code formatting and quality checks.
- [ ] Implement a basic CLI entry point using Commander.js.
- [ ] Define a configuration schema for prompts, retrieval, and chunking
- [ ] Add deterministic run identifiers for reproducibility

### Phase 2: Document Ingestion & Processing

- [ ] Implement a document loading service for various formats (PDF, MD, TXT).
- [ ] Develop initial text chunking strategies (e.g., fixed-size, recursive character).
- [ ] Set up an interface for a vector database (e.g., ChromaDB, Pinecone).
- [ ] Create a pipeline for generating and storing embeddings from document chunks.
- [ ] Build a command to orchestrate the ingestion process.
- [ ] Implement document versioning and immutability checks (hashing)
- [ ] Define a required metadata schema for every chunk (source, section, version)
- [ ] Add an ingestion validation step to reject malformed documents

### Phase 3: Core RAG Pipeline

- [ ] Build the retrieval component to fetch relevant document chunks based on a query.
- [ ] Integrate an LLM for the generation step, combining context and the user's query.
- [ ] Create a basic end-to-end `ask` command that returns a generated answer.
- [ ] Add source attribution to the generated answers.
- [ ] Implement an explicit “insufficient evidence” refusal mechanism
- [ ] Prevent generation when retrieved context is empty or below confidence threshold

### Phase 4: Evaluation Harness & Experimentation

- [ ] Design and build an evaluation framework for assessing RAG quality.
- [ ] Define core metrics (e.g., context precision, faithfulness, answer relevance).
- [ ] Create an experimentation suite to compare different chunking strategies, embedding models, and LLMs.
- [ ] Implement automated reporting for evaluation results.
- [ ] Develop a test dataset of questions and expected outcomes.
- [ ] Add unanswerable and adversarial queries to the evaluation dataset
- [ ] Track confidence vs. correctness (overconfidence metrics)
- [ ] Separate retrieval evaluation from generation evaluation

### Phase 5: Governance Layer

- [ ] Implement content moderation and sensitive data filtering for inputs and outputs.
- [ ] Develop basic access control mechanisms for different document sets.
- [ ] Add logging and auditing capabilities for all queries and system responses.
- [ ] Implement a safety validator to check for harmful or disallowed queries.
- [ ] Encode governance rules as explicit, testable policies
- [ ] Implement audit replay to reproduce a historical answer end-to-end
- [ ] Capture prompt, model, retrieval config, and corpus version per query

### Phase 6: Advanced Features & Refinement

- [ ] Explore and implement advanced chunking techniques (e.g., content-aware, agentic).
- [ ] Implement query transformation and expansion to improve retrieval accuracy.
- [ ] Build a simple interactive chat mode for conversational Q&A.
- [ ] Add support for hybrid search (keyword + vector).
- [ ] Implement regression tests to detect quality drops across changes
- [ ] Track longitudinal performance trends across versions

## Acceptance Criteria Checklist

Each phase is considered complete only when **all items in its checklist are satisfied**. These criteria are designed to ensure Veridex remains reproducible, governed, and auditable as the system evolves.

---

### Phase 0 — Epistemic Constraints & Design Principles

- [ ] A written document defines what the system is allowed to claim
- [ ] Explicit refusal conditions are documented
- [ ] The definition of admissible “evidence” is documented
- [ ] At least three concrete refusal scenarios are specified
- [ ] Non-goals and out-of-scope behaviors are explicitly stated
- [ ] A reviewer can predict system behavior without seeing the code

---

### Phase 1 — Project Setup

- [ ] Project builds and runs from a clean checkout
- [ ] CLI can be executed using documented commands
- [ ] Identical inputs produce deterministic outputs
- [ ] Prompts, retrieval settings, and chunking configs are externally defined and versioned
- [ ] Every run produces a unique, reusable run identifier
- [ ] Results can be reproduced using recorded configuration and run ID

---

### Phase 2 — Document Ingestion & Processing

- [ ] Ingesting the same document twice does not duplicate stored data
- [ ] All documents are hashed and versioned
- [ ] Every chunk includes required metadata (source, section, version)
- [ ] Invalid or malformed documents are rejected with clear errors
- [ ] Every chunk can be traced back to its exact document and version
- [ ] Corpus integrity can be verified independently of the LLM

---

### Phase 3 — Core RAG Pipeline

- [ ] The `ask` command retrieves context before generation
- [ ] Answers are produced only when supporting evidence is retrieved
- [ ] Source attribution is included in every generated answer
- [ ] The system explicitly refuses when evidence is missing or insufficient
- [ ] Generation is prevented when retrieval returns empty results
- [ ] Refusal behavior can be intentionally triggered and verified

---

### Phase 4 — Evaluation Harness & Experimentation

- [ ] A fixed evaluation dataset exists and is versioned
- [ ] Dataset includes answerable, unanswerable, and adversarial queries
- [ ] Retrieval performance is evaluated independently from generation
- [ ] Faithfulness and answer correctness are explicitly measured
- [ ] Confidence vs. correctness metrics are captured
- [ ] Evaluation runs are deterministic and reproducible
- [ ] Competing configurations can be compared with explainable results

---

### Phase 5 — Governance Layer

- [ ] All queries and responses are fully logged with structured metadata
- [ ] Governance rules are encoded as explicit, testable policies
- [ ] Prompt versions, models, and corpus versions are captured per query
- [ ] Audit logs are immutable and queryable
- [ ] Historical answers can be replayed end-to-end
- [ ] Disallowed or sensitive queries are blocked consistently and explainably

---

### Phase 6 — Advanced Features & Refinement

- [ ] Regression tests detect quality degradation across changes
- [ ] Longitudinal performance metrics are tracked across versions
- [ ] Improvements are justified by measured gains, not anecdotes
- [ ] Previously passing evaluations remain stable after new features
- [ ] A known-good configuration can be restored confidently

---

### Completion Standard

A phase is only considered complete when:

- All checklist items are satisfied
- Behavior can be explained without appealing to LLM intuition
- At least one unexpected failure or insight has been documented

Progress without surprise indicates insufficient rigor.

## Phase Exit-Review Questions

Each phase may advance only if all exit-review questions can be answered clearly, without hand-waving or appeals to “the model probably knows.”

---

### Phase 0 — Epistemic Constraints & Design Principles

1. Under what exact conditions must the system refuse to answer?
2. What qualifies as admissible evidence, and what does not?
3. Can the system ever rely on model background knowledge alone?
4. Can a third party predict system refusals without reading the code?
5. Are the system’s non-goals explicit enough to prevent scope creep?

If any answer requires “it depends,” this phase is not complete.

---

### Phase 1 — Project Setup

1. Can another engineer reproduce the same output from a clean checkout?
2. Are all prompts, retrieval parameters, and chunking configs externally defined?
3. Can you identify which configuration produced a given output?
4. Is there any behavior that cannot be reproduced due to hidden state?
5. If something breaks, do you know where to look first?

If behavior cannot be replayed, governance has already failed.

---

### Phase 2 — Document Ingestion & Processing

1. Can you trace any chunk back to its original document and version?
2. What prevents duplicate or conflicting document ingestion?
3. What happens if a document changes after ingestion?
4. How does the system reject malformed or low-quality documents?
5. Could an invalid document silently corrupt the corpus?

If you do not trust the corpus, you cannot trust any answer.

---

### Phase 3 — Core RAG Pipeline

1. What _must_ be true before the system is allowed to generate an answer?
2. How does the system behave when retrieval returns no results?
3. Can the system explicitly say “I don’t know” — and prove why?
4. Are citations guaranteed to correspond to retrieved chunks?
5. Can you intentionally force a refusal and explain the reason?

If the system always answers, it is not governed.

---

### Phase 4 — Evaluation Harness & Experimentation

1. How do you know retrieval is working independently of generation?
2. What metrics detect hallucinations or unsupported claims?
3. How does the system perform on unanswerable or adversarial queries?
4. Can you explain why one configuration outperforms another?
5. Would a regression be obvious before deployment?

If improvement cannot be measured, it is accidental.

---

### Phase 5 — Governance Layer

1. Can you fully reconstruct an answer months later?
2. What exact inputs contributed to a specific output?
3. Which governance rules blocked or allowed a response?
4. Can an auditor independently verify system behavior?
5. What prevents silent policy violations?

If trust depends on memory or intent, governance is incomplete.

---

### Phase 6 — Advanced Features & Refinement

1. Did this feature measurably improve system quality?
2. Did anything regress — and how would you know?
3. Can you roll back safely if quality drops?
4. Are trends improving over time, or just fluctuating?
5. Would you ship this change to a regulated environment?

If the answer is “probably,” the phase is not done.

---

### Final Gate Question (All Phases)

If an auditor asked:

> “Why should we trust this system more than a generic LLM?”

Could you answer using **evidence**, not confidence?
