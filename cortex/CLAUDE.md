<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Course Development Workflow

This repo contains a finished AI agent app. Course content is developed by working **backwards** from the complete app to a starter template.

## Branch Strategy

- `done` - The complete, finished app (current state)
- Each lesson branch contains the **solution for the previous lesson**
- Work backwards: `done` → `09-hitl` → `08-shell-tool` → ... → `01-intro-to-agents` → starter template

## Process for Each Lesson

Starting from the current branch (which has the complete code for that lesson):

1. **Create the "done" branch first** (only once at the start)
   ```bash
   git checkout -b done
   git push -u origin done
   git checkout main
   ```

2. **For each lesson (working backwards from 09 to 01):**

   a. **Identify the code** related to the current lesson topic

   b. **Copy ALL the code** that will be removed into the corresponding notes file in `notes/XX-Lesson-Name.md`
      - Include complete code blocks with file paths
      - Format for easy copy/paste during live coding
      - Add lecture notes and explanations

   c. **Remove the code** from the app

   d. **Verify the app still works** (or gracefully handles the missing feature)

   e. **Commit the changes** with a clear message

   f. **Create and push a new branch** for the lesson:
      ```bash
      git checkout -b XX-lesson-name
      git push -u origin XX-lesson-name
      git checkout main
      ```

3. **Continue backwards** to the next lesson until you reach a starter template

## Notes File Format

Each notes file in `notes/` should contain:

```markdown
# Lesson Title

## Overview
Brief explanation of what this lesson covers

## Key Concepts
- Concept 1
- Concept 2

## Code

### filename.ts
\`\`\`typescript
// Complete code that was removed
// Students can copy/paste this
\`\`\`

### another-file.ts
\`\`\`typescript
// More code
\`\`\`

## Exercises
Any exercises or challenges for students
```

## Lesson Order (backwards)

| Branch | Lesson | Code to Remove |
|--------|--------|----------------|
| `done` | Complete app | - |
| `09-hitl` | HITL | Human-in-the-loop approval system |
| `08-shell-tool` | Shell Tool | Shell/command execution tool |
| `07-web-search-context-management` | Web Search + Context | Web search tool, context/summarization |
| `06-file-system-tools` | File System Tools | File read/write/list tools |
| `05-multi-turn-evals` | Multi-turn Evals | Multi-turn evaluation code |
| `04-the-agent-loop` | The Agent Loop | Core agent loop implementation |
| `03-single-turn-evals` | Single Turn Evals | Single-turn evaluation code |
| `02-tool-calling` | Tool Calling | Tool definitions and calling logic |
| `01-intro-to-agents` | Intro to Agents | Basic agent structure |
| starter | Starter template | What students begin with |