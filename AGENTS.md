# Agent Instructions

## Mandatory Workflow & Branch Protection

* **NEVER commit directly to the `main` or `master` branch. No exceptions.**
* Always create a feature branch, commit changes there, push, and open a pull request (PR) for review.
* **When starting work on a GitHub Issue, always add the `in-progress` label to the issue immediately so everyone knows it is actively being worked on.**
* This repository has an active `pre-commit` hook installed that programmatically blocks direct commits to `main` and `master`.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
