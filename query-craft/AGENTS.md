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

## Research-Grounded Prompting Policy (Text-to-SQL)

This project’s natural-language-to-SQL prompting strategy is informed by:

Chang, Shuaichen, and Eric Fosler-Lussier (2023).  
_How to Prompt LLMs for Text-to-SQL: A Study in Zero-shot, Single-domain, and Cross-domain Settings_.  
[arXiv:2305.11853](https://arxiv.org/abs/2305.11853)

A local copy of the paper is included in `/docs/references/chang_fosler_lussier_2023_text_to_sql.pdf`.

### Required Prompting Principles

Unless explicitly overridden, agents MUST follow these principles:

1. **Schema Representation**

   - Prefer SQL `CREATE TABLE` format when providing schema context.
   - Explicitly include foreign key relationships when available.

2. **Database Content Exposure**

   - Include representative table content when feasible.
   - Prefer **column-wise distinct values** over full row dumps to maximize value coverage.

3. **Prompt Length Discipline**

   - Do not maximize context window usage.
   - In cross-domain prompting, avoid exceeding ~70% of the model’s context length unless justified.

4. **Few-Shot Strategy**

   - When operating in a single-domain setting, prefer in-domain examples.
   - Do NOT assume demonstrations replace the need for database content.

5. **Normalization**
   - Normalize schema and SQL formatting (case, spacing) for consistency and token efficiency.
   - Preserve original casing for literal values.

Any deviation from these principles MUST be documented with a clear justification.
