## 1. Implementation
- [x] 1.1 Create the CLI entrypoint using Commander + Chalk with flags for template selection and input text.
- [x] 1.2 Define a PromptTemplate abstraction and implement a prompt construction pipeline that produces unadorned prompt text.
- [x] 1.3 Add a stub language model client interface for future integration (no real model calls).
- [x] 1.4 Wire the CLI to the prompt pipeline so running the command prints the exact prompt text.
- [x] 1.5 Add minimal usage documentation in README for Phase 2 CLI usage.

## 2. Validation
- [x] 2.1 Run `npm run type-check`.
- [x] 2.2 Run the CLI with a sample input and confirm the output matches the constructed prompt exactly.
