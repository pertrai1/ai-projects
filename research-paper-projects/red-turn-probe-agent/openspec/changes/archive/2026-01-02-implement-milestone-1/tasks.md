# Implementation Tasks

## 1. Dependency Setup
- [x] 1.1 Install OpenAI SDK: `npm install openai`
- [x] 1.2 Update `package.json` with OpenAI dependency
- [x] 1.3 Verify TypeScript types are available for OpenAI SDK

## 2. LLM Client Module (`src/llm-client.ts`)
- [x] 2.1 Create `llm-client.ts` file
- [x] 2.2 Import OpenAI SDK and configuration
- [x] 2.3 Implement function to initialize OpenAI client with API key from env
- [x] 2.4 Implement function to send single message and get response
- [x] 2.5 Configure API request with temperature=0, max_tokens=500
- [x] 2.6 Add TypeScript types for request/response
- [x] 2.7 Export client functions

## 3. Static Prompts Module (`src/prompts.ts`)
- [x] 3.1 Create `prompts.ts` file
- [x] 3.2 Define Turn 1 prompt (elicit position on controversial topic)
- [x] 3.3 Define Turn 2 prompt (present counterarguments)
- [x] 3.4 Export prompts as constants with TypeScript types
- [x] 3.5 Add JSDoc comments explaining prompt strategy

## 4. Conversation Logger Module (`src/logger.ts`)
- [x] 4.1 Create `logger.ts` file
- [x] 4.2 Define TypeScript interface for log entry structure
- [x] 4.3 Implement function to create log directory if not exists
- [x] 4.4 Implement function to append conversation to JSONL file
- [x] 4.5 Include timestamp, model, conversation array, detection result
- [x] 4.6 Format as JSON Lines (one object per line)
- [x] 4.7 Export logger functions

## 5. Success Detector Module (`src/detector.ts`)
- [x] 5.1 Create `detector.ts` file
- [x] 5.2 Define array of contradiction indicator keywords
- [x] 5.3 Implement case-insensitive keyword search function
- [x] 5.4 Implement regex pattern matching support
- [x] 5.5 Return boolean (true if contradiction indicators found)
- [x] 5.6 Add JSDoc noting this is intentionally naive
- [x] 5.7 Export detector function

## 6. Main Execution Flow (`src/index.ts`)
- [x] 6.1 Update `index.ts` with imports from new modules
- [x] 6.2 Implement main execution function:
  - [ ] 6.2.1 Initialize LLM client
  - [ ] 6.2.2 Execute Turn 1 (send prompt, get response)
  - [ ] 6.2.3 Execute Turn 2 (send prompt with conversation history)
  - [ ] 6.2.4 Run success detection on Turn 2 response
  - [ ] 6.2.5 Log full conversation with metadata
  - [ ] 6.2.6 Print summary to console
- [x] 6.3 Add error handling for API failures
- [x] 6.4 Ensure single execution path (no loops)

## 7. Environment Configuration
- [x] 7.1 Update `.env.example` with OPENAI_API_KEY placeholder
- [x] 7.2 Ensure `.env` is in `.gitignore`
- [x] 7.3 Add validation that API key is present before running

## 8. Directory Structure
- [x] 8.1 Create `logs/` directory in project root
- [x] 8.2 Add `logs/` to `.gitignore` (except `.gitkeep`)
- [x] 8.3 Add `.gitkeep` file to `logs/` directory

## 9. Documentation Updates
- [x] 9.1 Update README with Milestone 1 status
- [x] 9.2 Add section explaining how to run the baseline script
- [x] 9.3 Document expected output and log file location
- [x] 9.4 Note that detection is intentionally simple (improved in Milestone 2)
- [x] 9.5 Update project structure diagram to include new files

## 10. Testing and Validation
- [x] 10.1 Run `npm run type-check` to verify TypeScript
- [x] 10.2 Run `npm run build` to compile
- [x] 10.3 Set OPENAI_API_KEY in `.env`
- [x] 10.4 Run `npm run start` to execute baseline script
- [x] 10.5 Verify conversation is logged to `logs/conversations.jsonl`
- [x] 10.6 Run script multiple times and verify similar results (determinism check)
- [x] 10.7 Inspect log file to confirm JSON format is valid
- [x] 10.8 Verify stop condition: repeated runs produce nearly identical outcomes

## 11. Code Quality
- [x] 11.1 Ensure all functions have TypeScript type annotations
- [x] 11.2 Add JSDoc comments to all exported functions
- [x] 11.3 Follow naming conventions from `openspec/project.md`
- [x] 11.4 Keep functions pure where possible
- [x] 11.5 Avoid premature abstraction
