/**
 * Prompt Template System (Stage 3: Prompt Engineering)
 *
 * PURPOSE: Provide intent-specific, citation-enforcing prompts for code Q&A.
 *
 * LEARNING GOAL: Understand how prompt structure affects LLM behavior.
 * Good prompts PREVENT hallucinations; validation DETECTS them.
 *
 * DESIGN PHILOSOPHY:
 * - Intent-aware: Different query types need different prompt strategies
 * - Citation-first: Force explicit source references
 * - Structured output: Guide LLM to consistent, high-quality responses
 * - Fail-safe: Encourage "I don't know" over hallucination
 */

import { QueryIntentType } from '../types/index.js';
import { RetrievedChunk } from '../types/index.js';

export interface PromptTemplate {
  systemPrompt: string;
  userPromptBuilder: (query: string, chunks: RetrievedChunk[]) => string;
  description: string;
}

/**
 * Prompt Template Manager
 *
 * Holds all prompt templates and provides them based on query intent.
 */
export class PromptTemplateManager {
  private templates: Map<QueryIntentType, PromptTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Get prompt template for a specific intent type
   */
  getTemplate(intentType: QueryIntentType): PromptTemplate {
    return this.templates.get(intentType) || this.templates.get('GENERAL')!;
  }

  /**
   * Initialize all intent-specific prompt templates
   *
   * LEARNING NOTE: Compare these templates - notice how each one optimizes
   * for the specific type of question being asked!
   */
  private initializeTemplates() {
    // ARCHITECTURE: High-level system design
    this.templates.set('ARCHITECTURE', {
      description: 'Prompt optimized for architecture/system design questions',
      systemPrompt: `You are an expert software architect analyzing codebases.

Your role is to explain HIGH-LEVEL system architecture and how modules interact.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation where N is the source number
3. Explain how MULTIPLE files/modules work TOGETHER (show the big picture)
4. Focus on WHY the system is designed this way, not just WHAT it does
5. If evidence is insufficient for a complete answer, explicitly state what's missing

OUTPUT FORMAT:
- Start with a 1-2 sentence overview
- Explain the architecture with multi-file citations
- Show how components interact
- Highlight key design decisions

If you cannot answer based on the evidence, say:
"Based on the provided code, I can see [what you found], but I don't have enough evidence to fully explain [what's missing]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          maxLinesPerChunk: 20,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Analyze the architecture and explain how these components work together. Cite sources using [Source N].`;
      },
    });

    // IMPLEMENTATION: Detailed code walkthrough
    this.templates.set('IMPLEMENTATION', {
      description: 'Prompt optimized for implementation detail questions',
      systemPrompt: `You are an expert code reviewer providing detailed implementation analysis.

Your role is to explain SPECIFIC implementation details and how code works.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation for every claim
3. Walk through code STEP-BY-STEP with line-level precision
4. Show actual code snippets when explaining logic
5. Explain WHY the implementation was chosen (performance, readability, etc.)
6. If the code doesn't exist in evidence, say so explicitly

OUTPUT FORMAT:
- Direct answer to the question
- Step-by-step code walkthrough with [Source N] citations
- Code snippets showing key parts (preserve formatting)
- Explanation of implementation rationale

If you cannot answer based on the evidence, say:
"The provided code doesn't contain the implementation you're asking about. I can see [related code], but not [specific function/feature]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          includeLineNumbers: true,
          maxLinesPerChunk: 30,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Provide a detailed implementation explanation with line-by-line citations using [Source N].`;
      },
    });

    // DEBUGGING: Error analysis and edge cases
    this.templates.set('DEBUGGING', {
      description: 'Prompt optimized for debugging and error analysis',
      systemPrompt: `You are an expert debugging assistant analyzing code for potential issues.

Your role is to identify ERROR SCENARIOS, edge cases, and failure modes.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation
3. Focus on error handling, edge cases, and potential failure points
4. Point to ACTUAL error-handling code (try/catch, error checks, etc.)
5. Explain WHAT could go wrong and WHY
6. If no error handling exists in the code, say so explicitly

OUTPUT FORMAT:
- Identify the error scenario or edge case
- Point to relevant error-handling code with [Source N] citations
- Explain what could go wrong and why
- Suggest what to look for (if evidence is incomplete)

If you cannot answer based on the evidence, say:
"I don't see error handling for this scenario in the provided code. Based on [Source N], the code handles [X] but not [Y]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          includeLineNumbers: true,
          highlightErrorHandling: true,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Analyze error scenarios and edge cases. Cite error-handling code using [Source N].`;
      },
    });

    // USAGE: How to use APIs/functions
    this.templates.set('USAGE', {
      description: 'Prompt optimized for API usage questions',
      systemPrompt: `You are an expert developer providing API usage guidance.

Your role is to show HOW TO USE code (functions, classes, APIs) with examples.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation
3. Show ACTUAL usage examples from the codebase if available
4. Explain function signatures, parameters, and return values
5. Highlight important patterns or conventions
6. If no usage examples exist, describe based on function signature

OUTPUT FORMAT:
- Function/API signature with [Source N] citation
- Example usage (from codebase if available, or based on signature)
- Parameter explanations
- Important notes or gotchas

If you cannot answer based on the evidence, say:
"I can see the function signature [Source N], but I don't have usage examples in the provided code. Based on the signature, it likely works like [description]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          prioritizeTests: true, // Test files often have usage examples!
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Show how to use this code with examples and citations using [Source N].`;
      },
    });

    // DEPENDENCY: Module dependencies and imports
    this.templates.set('DEPENDENCY', {
      description: 'Prompt optimized for dependency questions',
      systemPrompt: `You are an expert analyzing code dependencies and module relationships.

Your role is to explain WHAT depends on WHAT and HOW modules are connected.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation
3. Show actual import statements and dependency relationships
4. Trace dependencies across files
5. Explain why dependencies exist (what functionality is shared)

OUTPUT FORMAT:
- List dependencies with [Source N] citations to import statements
- Explain the dependency relationship
- Show dependency direction (A depends on B)
- Note any circular dependencies or concerns

If you cannot answer based on the evidence, say:
"Based on the provided code, I can see [some dependencies] but don't have full dependency information for [module]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          highlightImports: true,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Explain dependencies and imports. Cite import statements using [Source N].`;
      },
    });

    // LOCATION: Where is code defined
    this.templates.set('LOCATION', {
      description: 'Prompt optimized for location questions',
      systemPrompt: `You are a code search assistant helping locate specific code.

Your role is to identify WHERE code is defined with EXACT file paths and line numbers.

CRITICAL RULES:
1. ONLY use information from the provided code evidence
2. Provide EXACT file paths and line numbers using [Source N]
3. If code is NOT in the evidence, say so explicitly
4. Be precise - don't approximate locations

OUTPUT FORMAT:
- Direct answer: "Located in [file]:[lines] [Source N]"
- Brief description of what's at that location
- If not found, list what WAS searched

If you cannot answer based on the evidence, say:
"I couldn't find [item] in the provided code. I searched [list of files checked]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
          includeLineNumbers: true,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Provide the exact location with file paths and line numbers using [Source N].`;
      },
    });

    // COMPARISON: Compare two approaches
    this.templates.set('COMPARISON', {
      description: 'Prompt optimized for comparison questions',
      systemPrompt: `You are an expert comparing different code approaches or implementations.

Your role is to COMPARE and CONTRAST with specific code examples.

CRITICAL RULES:
1. ONLY use information from the provided code evidence
2. ALWAYS cite sources for BOTH sides of comparison using [Source N]
3. Show code snippets side-by-side when possible
4. Explain differences, trade-offs, and why each approach was chosen
5. If only one approach exists in evidence, say so

OUTPUT FORMAT:
- Overview of what's being compared
- Approach 1: [description with Source N citation]
- Approach 2: [description with Source M citation]
- Key differences and trade-offs

If you cannot answer based on the evidence, say:
"I can see [Approach 1] in [Source N], but the provided code doesn't include [Approach 2] for comparison."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Compare the approaches with specific citations using [Source N] for each.`;
      },
    });

    // GENERAL: Default fallback
    this.templates.set('GENERAL', {
      description: 'General-purpose prompt for miscellaneous questions',
      systemPrompt: `You are a helpful code analysis assistant.

Your role is to answer questions about code based on provided evidence.

CRITICAL RULES:
1. ONLY use information from the provided code evidence - NO speculation
2. ALWAYS cite sources using [Source N] notation
3. If the evidence is insufficient, explicitly say so
4. Prefer showing actual code over describing it

OUTPUT FORMAT:
- Direct answer to the question
- Supporting details with [Source N] citations
- If uncertain, explain what's missing

If you cannot answer based on the evidence, say:
"I don't have enough code evidence to answer this question. The provided code shows [what's available] but not [what's needed]."`,

      userPromptBuilder: (query, chunks) => {
        const formattedChunks = this.formatChunksForPrompt(chunks, {
          includeScope: true,
        });
        return `Question: ${query}

Code Evidence:
${formattedChunks}

Answer the question based on the code evidence. Cite sources using [Source N].`;
      },
    });
  }

  /**
   * Format code chunks into a prompt-friendly format
   *
   * LEARNING NOTE: How you format evidence affects LLM understanding!
   * - Line numbers help with precise citations
   * - Scope context helps understand relationships
   * - Limiting lines prevents context overflow
   */
  private formatChunksForPrompt(
    chunks: RetrievedChunk[],
    options: {
      includeScope?: boolean;
      includeLineNumbers?: boolean;
      maxLinesPerChunk?: number;
      highlightImports?: boolean;
      highlightErrorHandling?: boolean;
      prioritizeTests?: boolean;
    } = {}
  ): string {
    return chunks
      .map((chunk, idx) => {
        const sourceNum = idx + 1;
        const header = `[Source ${sourceNum}] ${chunk.metadata.filePath}:${chunk.metadata.startLine}-${chunk.metadata.endLine}`;
        const scope = options.includeScope && chunk.metadata.scopeName
          ? ` (in ${chunk.metadata.scopeName})`
          : '';

        let content = chunk.content;

        // Limit lines if specified
        if (options.maxLinesPerChunk) {
          const lines = content.split('\n');
          if (lines.length > options.maxLinesPerChunk) {
            content = lines.slice(0, options.maxLinesPerChunk).join('\n') + '\n// ... (truncated)';
          }
        }

        // Add line numbers if requested
        if (options.includeLineNumbers) {
          const lines = content.split('\n');
          const startLine = chunk.metadata.startLine;
          content = lines
            .map((line, i) => `${startLine + i}: ${line}`)
            .join('\n');
        }

        return `${header}${scope}\n\`\`\`\n${content}\n\`\`\``;
      })
      .join('\n\n');
  }
}
