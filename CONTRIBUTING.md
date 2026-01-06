# Contributing to AI Projects

Thank you for your interest in contributing to these AI learning projects. These projects are designed as hands-on learning exercises for developing practical understanding of modern AI systems through building real, working implementations.

## Philosophy

These projects emphasize **learning through building** rather than producing polished end-user products. Each project explores specific technical questions around RAG, agent design, evaluation frameworks, governance, and safety through hands-on experimentation, spec-driven development, and systematic evaluation.

Contributions that deepen understanding, improve architectural patterns, add evaluation capabilities, or enhance educational value are especially welcome.

## Getting Started

### Best Projects for New Contributors

The **Upcoming Projects** section offers the best entry points as they have roadmaps and concepts defined but are earlier in development:

#### [A11y Remediation Assistant](./a11y-remediation-assistant)
An AI-powered accessibility remediation assistant focusing on WCAG/Section 508 compliance.

**Good for learning:**
- Multi-agent architecture with specialized roles (Analyzer, Strategist, Coder, Validator)
- Integration with deterministic validation tools (axe-core, Lighthouse)
- Human-in-the-loop patterns for subjective validation
- Audit trail generation and compliance documentation

**Contribution opportunities:**
- Implementing specialized agents with YAML specifications
- Designing context-aware remediation strategies
- Building deterministic validation loops
- Creating audit artifact generators

#### [Veridex](./veridex)
A governance-first RAG system emphasizing auditability and evaluation.

**Good for learning:**
- Document ingestion and chunking strategies
- Provenance tracking and audit logging
- Retrieval evaluation frameworks
- Refusal semantics and epistemic constraints
- Spec-driven development with OpenSpec

**Contribution opportunities:**
- Implementing chunking experiments and comparisons
- Building evaluation harnesses for retrieval quality
- Designing governance-focused audit logs
- Experimenting with embedding and retrieval strategies

#### [Soil Guard CLI](./soil-guard-cli)
An assistant demonstrating parallel input and output validation using LLM guardrails.

**Good for learning:**
- LLM guardrail patterns and safety constraints
- Input validation and sanitization
- Output validation before user delivery
- Security-focused AI system design

**Contribution opportunities:**
- Implementing guardrail validation layers
- Designing safety constraint specifications
- Building parallel validation pipelines
- Creating test suites for security scenarios

### Improving Existing Projects

All existing projects welcome improvements and enhancements:

- **Evaluation frameworks**: Add systematic testing, LLM-as-judge metrics, regression detection
- **Agent specifications**: Convert existing agents to YAML specs, improve prompt templates
- **Documentation**: Add architecture diagrams, decision logs, usage examples
- **Retrieval improvements**: Experiment with chunking strategies, hybrid search, reranking
- **Security enhancements**: Add input validation, safety guardrails, audit logging
- **Performance optimization**: Improve response times, reduce token usage, optimize vector searches

## How to Contribute

### 1. Pick a Project

Review the [README.md](./README.md) to understand available projects. For first contributions, start with the Upcoming Projects or choose an existing project that matches your interests.

### 2. Understand the Project

Before contributing, read:
- Project README and documentation
- Existing code to understand patterns and architecture
- Any YAML agent specifications in the project
- OpenSpec specifications (if the project uses spec-driven development)

### 3. Choose Your Contribution

**For Upcoming Projects:**
- Review the roadmap/concept documentation
- Choose an area to implement (agent, evaluation, ingestion, etc.)
- Start with a small, well-defined piece rather than the entire system

**For Existing Projects:**
- Look for TODOs or enhancement opportunities in the code
- Consider adding evaluation capabilities if missing
- Improve documentation or add usage examples
- Propose architectural improvements based on learnings

### 4. Development Process

#### Spec-Driven Development (if applicable)

Many projects use **OpenSpec** for spec-driven development. For these projects:

1. Write specifications first (YAML agent specs, API specs, etc.)
2. Get feedback on specifications before implementation
3. Implement code to match specifications
4. Keep specs and code synchronized

Reference projects using OpenSpec: Cortex, QueryCraft, Veridex

#### Agent Development

For projects with AI agents:

1. Define agent role and responsibilities in YAML
2. Design prompt templates with clear instructions
3. Specify input/output schemas using Zod or similar
4. Implement agent with proper error handling
5. Add evaluation criteria and test cases

Example projects: Plants FieldGuide, QueryCraft, A11y Remediation Assistant

#### RAG System Development

For retrieval-augmented generation projects:

1. Design document ingestion and chunking strategy
2. Implement embedding and vector storage
3. Build retrieval pipeline with ranking
4. Add response synthesis and citation
5. Create evaluation harness for retrieval quality

Example projects: PLANTS NLQI, Plants FieldGuide, Veridex

### 5. Code Quality Standards

- **TypeScript**: Use strict type checking, avoid `any` types
- **Error handling**: Implement comprehensive error handling with clear messages
- **Logging**: Add structured logging for debugging and observability
- **Testing**: Include tests for core functionality, especially evaluation code
- **Documentation**: Update README files and inline comments for complex logic
- **Dependencies**: Minimize dependencies, prefer standard libraries

### 6. Evaluation and Testing

Strong emphasis on evaluation:

- Add automated tests for deterministic components
- Include evaluation datasets and test cases for LLM components
- Implement LLM-as-judge metrics where appropriate
- Document expected behavior and failure modes
- Create regression tests for fixed issues

### 7. Submit Your Work

1. Fork the repository
2. Create a feature branch with a descriptive name
3. Make your changes following the standards above
4. Test thoroughly including edge cases
5. Update documentation to reflect changes
6. Submit a pull request with:
   - Clear description of changes
   - Rationale for design decisions
   - Test results or evaluation outcomes
   - Any architectural trade-offs made

## Contribution Ideas by Interest

### Interested in Agent Design
- Build specialized agents for A11y Remediation Assistant
- Add agent orchestration patterns to Cortex
- Design intent classification for Plants FieldGuide
- Implement multi-agent workflows

### Interested in RAG Systems
- Experiment with chunking strategies in Veridex
- Add hybrid search to PLANTS NLQI
- Implement reranking in Plants FieldGuide
- Design retrieval evaluation frameworks

### Interested in Evaluation
- Build LLM-as-judge metrics for any project
- Create evaluation datasets for testing
- Implement regression detection systems
- Add confidence scoring and uncertainty quantification

### Interested in Security & Governance
- Add guardrails to Soil Guard CLI
- Implement audit trails in Veridex
- Design provenance tracking systems
- Build compliance documentation generators

### Interested in Research
- Implement research papers as small projects (see Research Paper Projects)
- Run ablation studies on existing systems
- Compare different architectural approaches
- Document failure modes and edge cases

## Learning Resources

Each project demonstrates specific AI concepts:

- **RAG Architecture**: PLANTS NLQI, Plants FieldGuide, Veridex
- **Agent Design**: Cortex, QueryCraft, A11y Remediation Assistant
- **Evaluation**: FairEval-CLI, QueryCraft evaluation harness
- **Spec-Driven Development**: Cortex, QueryCraft, Veridex
- **Security & Safety**: QueryCraft (SQL injection prevention), Soil Guard CLI

Study these projects to understand patterns before contributing.

## Questions or Ideas?

If you have questions or want to discuss contribution ideas:

1. Open an issue describing your proposal
2. Reference the specific project and area of interest
3. Explain the learning goals or technical questions you want to explore
4. Discuss architectural approach before implementing large features

## Code of Conduct

- Focus on learning and knowledge sharing
- Provide constructive feedback on code and architecture
- Document your thinking and design decisions
- Respect that these are educational projects, not production systems
- Help others learn by explaining your approaches

## Recognition

All contributors will be recognized for their work. Contributions that demonstrate strong understanding of AI system architecture, thoughtful evaluation design, or innovative approaches to safety and governance are especially valued.

Thank you for helping make these learning projects better for everyone!
