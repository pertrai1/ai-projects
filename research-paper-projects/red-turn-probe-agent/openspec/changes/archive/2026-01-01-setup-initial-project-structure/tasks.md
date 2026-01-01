# Implementation Tasks

## 1. TypeScript Configuration
- [x] 1.1 Create `tsconfig.json` with strict compiler options matching sibling projects
- [x] 1.2 Configure module system (ESNext/NodeNext) for modern JavaScript
- [x] 1.3 Set source directory to `./src` and output to `./dist`
- [x] 1.4 Enable source maps and declaration files for debugging
- [x] 1.5 Add strict type-checking options (noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.)

## 2. Package Configuration
- [x] 2.1 Update package.json description to reflect red-teaming probe agent purpose
- [x] 2.2 Add comprehensive keywords for discoverability
- [x] 2.3 Update npm scripts:
  - [x] 2.3.1 Fix `start` script to run compiled code (node dist/index.js)
  - [x] 2.3.2 Ensure `build` script uses tsc
  - [x] 2.3.3 Ensure `type-check` script runs tsc --noEmit
- [x] 2.4 Add engines field requiring Node.js >= 18.0.0
- [x] 2.5 Verify module type is set to "module" for ESM support

## 3. README Documentation
- [x] 3.1 Write project title and description (2-3 paragraphs)
- [x] 3.2 Add Background section explaining multi-turn conversational failures
- [x] 3.3 Create "Why RedTurn?" section highlighting research motivation
- [x] 3.4 Add Getting Started section:
  - [x] 3.4.1 List prerequisites (Node.js, npm, API keys)
  - [x] 3.4.2 Document installation steps (clone, install, env setup)
  - [x] 3.4.3 Explain .env configuration
- [x] 3.5 Document usage:
  - [x] 3.5.1 Explain how to build the project
  - [x] 3.5.2 Explain how to run the project
  - [x] 3.5.3 List available npm commands
- [x] 3.6 Add Project Structure section with directory tree diagram
- [x] 3.7 Add reference to the research paper (PDF in repository)
- [x] 3.8 Include Limitations and Goals sections (learning-focused, not production)
- [x] 3.9 Add License section (MIT)

## 4. Project Context Documentation
- [x] 4.1 Update `openspec/project.md` with:
  - [x] 4.1.1 Project purpose (red-teaming LLMs for multi-turn failures)
  - [x] 4.1.2 Tech stack (TypeScript, Node.js, OpenAI API)
  - [x] 4.1.3 Code style preferences (strict TypeScript, ESM modules)
  - [x] 4.1.4 Testing strategy (TBD in later milestones)
  - [x] 4.1.5 Domain context (LLM evaluation, red-teaming, adversarial testing)

## 5. Verification
- [x] 5.1 Run `npm run type-check` to verify TypeScript configuration
- [x] 5.2 Run `npm run build` to ensure compilation succeeds
- [x] 5.3 Verify dist/ directory is created with compiled files
- [x] 5.4 Check that all README sections are complete and accurate
- [x] 5.5 Validate that project structure matches sibling projects
