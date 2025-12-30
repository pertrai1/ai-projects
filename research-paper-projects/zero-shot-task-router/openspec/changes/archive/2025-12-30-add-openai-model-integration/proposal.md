# Change: Add OpenAI model integration

## Why
Phase 4 of the roadmap requires a real model backend while keeping experiments reproducible. The research paper motivates holding model and decoding parameters constant so behavioral differences stem from prompt changes.

## What Changes
- Add a single OpenAI backend using `OPENAI_API_KEY` for authentication.
- Centralize and fix decoding parameters (model: `gpt-4o-mini`, temperature: 0, top_p: 1, max_tokens: 256).
- Extend the CLI to optionally execute the prompt through the model and print the completion.

## Impact
- Affected specs: model-integration
- Affected code: model client implementation, CLI execution path, configuration constants.
