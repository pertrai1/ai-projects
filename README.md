# AI Projects

A collection of machine learning and artificial intelligence projects demonstrating various AI techniques and applications.

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
