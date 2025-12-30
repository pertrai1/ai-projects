## 1. Implementation
- [x] 1.1 Add OpenAI SDK dependency and implement a model client that reads `OPENAI_API_KEY`.
- [x] 1.2 Centralize fixed decoding parameters (model, temperature, top_p, max_tokens).
- [x] 1.3 Extend the CLI with a completion option that calls the OpenAI client and prints the completion.
- [x] 1.4 Update README with OpenAI setup and completion usage.

## 2. Validation
- [x] 2.1 Run `npm run type-check`.
- [x] 2.2 Run the CLI in completion mode with a sample prompt (requires `OPENAI_API_KEY`).
