# AI Projects

A collection of machine learning and artificial intelligence projects demonstrating various AI techniques and applications.

## Project Intent

These projects are intentionally designed as **learning-through-building exercises** focused on developing a deep, practical understanding of modern AI systems rather than producing polished end-user products.

Each project explores a specific set of technical and architectural questions—such as retrieval-augmented generation, agent design, evaluation frameworks, governance, and safety—by implementing real, working systems with increasing rigor. The emphasis is on understanding trade-offs, failure modes, and best practices through hands-on experimentation, spec-driven development, and systematic evaluation.

While many of these projects are production-inspired and follow real-world engineering patterns, their primary purpose is **skill development, exploration, and knowledge consolidation**.

---

## Table of Contents

- [Flower Recognition](#flower-recognition) - CNN-based flower classification with TensorFlow.js
- [PLANTS Natural Language Query Interface](#plants-natural-language-query-interface) - RAG-based natural language interface for USDA PLANTS Database
- [Cortex](#cortex) - Autonomous AI agent CLI with tool chaining and task execution
- [Plants FieldGuide](#plants-fieldguide) - Advanced RAG system with intent routing and adaptive retrieval
- [QueryCraft](#querycraft) - Natural language to SQL with security guardrails and validation
- [A11y Remediation Assistant](#a11y-remediation-assistant) - AI-powered accessibility remediation with audit trails
- [Veridex](#veridex) - Governance-first RAG system with auditability and evaluation

### Research Paper Projects

- [FairEval-CLI](#faireval-cli) - Calibrated pairwise LLM evaluation mitigating positional bias
- [Zero-Shot Task Router](#zero-shot-task-router) - Prompt-conditioned zero-shot task induction experiments
- [Chain-of-Thought Prompt Comparator](#chain-of-thought-prompt-comparator) - A CLI tool for comparing Chain-of-Thought (CoT) prompting strategies

---

## Projects

### [Flower Recognition](./flower-recognition)

A TypeScript implementation of a CNN-based flower classification system using TensorFlow.js.

**Technology**: TensorFlow.js, TypeScript, Convolutional Neural Networks

**Description**: This supervised learning project trains a deep learning model to identify 5 different types of flowers (Daisy, Dandelion, Rose, Sunflower, and Tulip) from images. The model uses a Convolutional Neural Network architecture with multiple convolutional and pooling layers to extract visual features and classify flower images with high accuracy.

**Key Features**:

- Image classification for 5 flower species
- Data augmentation for improved model generalization
- Type-safe implementation with full TypeScript support
- Real-time training metrics and validation accuracy
- Modular architecture with clean separation of concerns

**Use Cases**: Gardening apps, educational tools, photography/social media auto-tagging, agriculture research

---

### [PLANTS Natural Language Query Interface](./plants-nlqi)

A TypeScript-based Natural Language Query Interface for the USDA PLANTS Database, powered by Claude AI and RAG (Retrieval Augmented Generation) architecture.

**Technology**: Anthropic Claude (Sonnet 4), Pinecone Vector Database, Voyage AI Embeddings, TypeScript, Express.js

**Description**: This RAG-based project enables users to query the USDA PLANTS Database using natural language instead of complex search forms. Ask questions like "What native wildflowers bloom in spring in North Carolina?" and receive intelligent, contextual answers powered by semantic search and AI-generated responses. The system combines vector embeddings for semantic understanding with structured data retrieval to provide accurate, informative answers about native plants.

**Key Features**:

- Natural language plant queries with semantic search
- Hybrid search combining vector similarity and structured filters
- AI-powered conversational responses using Claude
- Multi-phase implementation from basic RAG to multi-agent architecture
- CLI and API interfaces for flexible usage
- Real-time query processing with comprehensive logging

**Use Cases**: Gardening and landscaping planning, native plant identification, ecological restoration projects, educational resources, pollinator garden design

---

### [Cortex](./cortex)

An autonomous AI agent CLI that intelligently executes tasks through natural language conversations.

**Technology**: Vercel AI SDK, OpenAI, TypeScript, Ink (React for CLI), Laminar, OpenSpec

**Description**: Cortex is a production-ready AI agent that combines file operations, shell commands, code execution, and web search into a conversational terminal interface. Built with a manual agent loop using `streamText`, Cortex demonstrates advanced agent architecture patterns including tool chaining, autonomous task execution, and systematic agent evaluation. The project showcases spec-driven development with OpenSpec for managing change proposals and maintaining alignment between documentation and implementation.

**Key Features**:

- Manual agent loop with full control over conversation flow and tool execution
- Autonomous multi-step task execution with intelligent tool chaining
- Interactive terminal UI built with React components (Ink)
- Systematic agent evaluation and testing with Laminar
- Spec-driven development workflow using OpenSpec
- Tool design with Zod schemas, parallel execution, and error handling
- Conversation memory management across multi-turn interactions

**Use Cases**: Code refactoring and analysis, workflow automation, technical research, data analysis, development task assistance

---

### [Plants FieldGuide](./plants-fieldguide)

An AI-powered CLI assistant for the USDA PLANTS Help documentation using intelligent query routing, adaptive retrieval strategies, and multi-agent orchestration.

**Technology**: Anthropic Claude (Sonnet 4.5), OpenAI Embeddings, HNSWLib Vector Store, TypeScript, Commander.js, YAML Agent Specs

**Description**: Plants FieldGuide demonstrates advanced RAG (Retrieval Augmented Generation) concepts through a sophisticated query system for USDA PLANTS documentation. The project implements intent classification to route queries to specialized agents, adaptive retrieval that dynamically optimizes search parameters, multi-source retrieval with result fusion (RRF algorithm), and conversational memory for multi-turn interactions. Built with spec-driven agent design using YAML specifications, the system intelligently processes PDFs, generates vector embeddings, and orchestrates specialized agents for definitions, procedures, and comparisons.

**Key Features**:

- Intent classification routing queries to specialized agents
- Adaptive retrieval with dynamic search parameter optimization
- Multi-source retrieval combining vector, keyword, and filtered searches
- Result fusion using Reciprocal Rank Fusion (RRF) algorithm
- Response synthesis from multiple sources with confidence scoring
- Conversational memory for multi-turn context tracking
- YAML-based agent specifications for modular AI behavior
- PDF processing with section detection and intelligent chunking
- HNSW vector indexes for efficient similarity search

**Use Cases**: Technical documentation assistance, plant database research, educational tools for botany, USDA database navigation, conversational knowledge retrieval

---

### [QueryCraft](./query-craft)

A natural language to SQL query generator with built-in validation, security guardrails, and evaluation framework using spec-driven development.

**Technology**: Anthropic Claude (Sonnet 4), TypeScript, Commander.js, Braintrust, Zod, YAML Agent Specs

**Description**: QueryCraft demonstrates spec-driven, multi-agent architecture for converting natural language questions into safe, validated SQL queries. The system implements a three-agent pipeline: a deterministic schema loader that validates database structure, an LLM-powered query generator using Claude Sonnet 4, and a hybrid validator combining deterministic safety checks with semantic validation. All agents are defined in YAML specifications before implementation, enabling executable documentation and clear separation of concerns. The project showcases production patterns including multi-layer security guardrails, confidence scoring, and automated evaluation frameworks.

**Key Features**:

- Natural language to PostgreSQL query generation with confidence scoring
- Multi-layer security guardrails preventing SQL injection and dangerous operations
- Deterministic safety validation blocking mutations, system table access, and file operations
- Schema-aware validation ensuring correct tables, columns, and JOIN conditions
- YAML-based agent specifications for modular, testable AI behavior
- Automated evaluation framework using Braintrust with LLM-as-Judge metrics
- Interactive CLI and single-shot query modes with detailed workflow visibility
- Spec-driven development workflow separating prompt engineering from code
- Progressive complexity analysis and query optimization suggestions

**Use Cases**: Database query assistance, SQL learning tools, natural language database interfaces, safe query generation for analytics, educational SQL resources

---

### [A11y Remediation Assistant](./a11y-remediation-assistant)

An AI-powered accessibility remediation assistant that bridges the gap between identifying WCAG/Section 508 violations and safely fixing them with audit-ready evidence.

**Technology**: TBD

**Description**: A11y Remediation Assistant (ARA) operates as a layer above traditional accessibility scanning tools (axe-core, Lighthouse), acting as a senior accessibility engineer who explains issues in plain language, proposes context-aware fixes, validates outcomes with deterministic tools, and produces audit-ready artifacts. Unlike detection tools, ARA focuses on remediation assistance while maintaining strict boundaries between AI reasoning and deterministic verification—AI explains and proposes, but never certifies compliance.

**Key Features**:

- Jargon-to-English translation explaining violations in plain language with user impact context
- Context-aware code repair analyzing component structure, frameworks, and interaction patterns
- Multi-strategy fix proposals ranked by effort and impact (semantic HTML prioritized over ARIA patches)
- Deterministic validation loop re-running scanners to verify fixes and detect regressions
- Human-in-the-loop flags for subjective criteria requiring manual validation (alt text, reading order)
- Priority classification system based on user impact (Critical, High, Medium, Low)
- Audit trace generation mapping fixes to WCAG/Section 508 criteria with compliance evidence
- Regression test generation to prevent future accessibility violations
- Multi-agent architecture with specialized agents (Analyzer, Strategist, Coder, Validator, Educator)

**Use Cases**: Web accessibility compliance, WCAG remediation, inclusive design implementation, accessibility auditing, Section 508 compliance documentation

---

### [Veridex](./veridex/)

A Retrieval-Augmented Generation (RAG) system with a strong focus on governance, document ingestion, chunking experiments, and a comprehensive evaluation harness.

**Technology**: TypeScript, OpenAI / Anthropic Claude, Vector Databases, OpenSpec, Zod, YAML Agent Specs

**Description**: Veridex is a governance-first Retrieval-Augmented Generation (RAG) system that answers questions strictly from an approved document corpus, prioritizing provenance, auditability, and refusal over fluent but unverifiable responses. The project treats epistemic constraints as first-class design artifacts, emphasizing document versioning, chunk lineage, retrieval evaluation, and reproducible system behavior. Built using spec-driven development with OpenSpec, Veridex serves as a reference architecture for trustworthy, document-bound AI systems in regulated or high-trust environments.

**Key Features**:

- Governance-first RAG architecture with document-bounded answer generation
- Explicit refusal semantics when evidence is missing or insufficient
- End-to-end provenance tracking from document ingestion to answer output
- Retrieval- and generation-level evaluation harness with regression detection
- Experimentation framework for comparing chunking, embeddings, and retrieval strategies
- Structured audit logs with replayable system state (corpus, prompt, model, config)
- Spec-driven development with OpenSpec to enforce system invariants

**Use Cases**: Governance-first RAG reference implementations, audit-ready document question answering, evaluation and benchmarking of retrieval and chunking strategies, research on hallucination boundaries and refusal behavior in document-grounded AI systems.

---

## Research Paper Projects

These are small projects that are used to understand the research paper.

### [FairEval-CLI](./research-paper-projects/fair-eval-cli)

A CLI tool for pairwise evaluation of LLM responses that mitigates positional bias using calibrated evaluation procedures from the research paper "Large Language Models are not Fair Evaluators" (Wang et al., 2023).

**Technology**: Anthropic Claude / OpenAI, TypeScript, Commander.js

**Description**: FairEval-CLI implements Multiple Evidence Calibration (MEC) and Balanced Position Calibration (BPC) strategies to address the systematic positional bias in LLM-as-judge systems. Instead of treating evaluation as a single API call, the system performs statistical calibration: forcing evidence-first reasoning with multiple sampling iterations, evaluating both (A,B) and (B,A) orderings, and aggregating scores across positions to cancel bias. The tool produces calibrated win/lose/tie decisions with confidence estimates based on cross-sample variance, making LLM evaluation more reliable and trustworthy.

**Key Features**:

- Multiple Evidence Calibration (MEC) requiring evidence generation before scoring
- Balanced Position Calibration (BPC) evaluating both response orderings
- Configurable sampling iterations (k) to reduce variance
- Confidence estimation from cross-sample disagreement metrics
- Evidence-first prompt templates preventing verdict-first bias
- Support for file input, inline text, and stdin for flexible workflows
- Human-readable and JSON output modes for automation
- OpenAI-compatible API support (works with gateways and proxies)

**Research Reference**: [Large Language Models are not Fair Evaluators (arXiv:2305.17926)](https://arxiv.org/abs/2305.17926) - Wang et al., ACL 2024

**Use Cases**: LLM response comparison and ranking, evaluation benchmarking, model quality assessment, prompt engineering validation, automated testing of AI outputs

---

### [Zero-Shot Task Router](./research-paper-projects/zero-shot-task-router)

A prompt-conditioned CLI research harness for studying zero-shot task induction via natural language task specification.

**Technology**: OpenAI, TypeScript, Commander.js

**Description**: Zero-Shot Task Router investigates how a single language model can switch between tasks based only on prompt wording. It provides prompt templates for summarization, QA, and translation, along with ablation tooling to compare prompt variants under fixed decoding parameters. The project emphasizes controlled experiments, reproducible runs, and explicit observation logging.

**Key Features**:

- Prompt template registry with multiple minimal variants
- Multi-template ablation runs with side-by-side outputs
- Fixed model parameters for reproducibility
- CLI support for input files and stdin
- Observation templates for experiment logging

**Use Cases**: Prompt sensitivity studies, zero-shot task induction experiments, reproducible prompt ablations, educational demos of prompt control

---

### [Chain-of-Thought Prompt Comparator](./research-paper-projects/cot-prompt-comparator)

A CLI tool for comparing Chain-of-Thought (CoT) prompting strategies and analyzing their impact on LLM reasoning and output quality.

**Technology**: Google Gemini, TypeScript, Commander.js

**Description**: This project provides a framework for systematically evaluating different Chain-of-Thought prompting techniques. It allows users to define multiple CoT prompts, run them against a set of inputs, and compare the generated outputs based on various metrics suchs as accuracy, coherence, and completeness.

**Key Features**:

- Define and manage multiple Chain-of-Thought prompt templates
- Run comparative evaluations across different CoT strategies
- Analyze LLM outputs for accuracy, coherence, and other custom metrics
- CLI for easy execution and result visualization

**Use Cases**: Research on LLM reasoning, prompt engineering optimization, comparative analysis of CoT techniques, educational tool for understanding advanced prompting


---
