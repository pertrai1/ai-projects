/**
 * Response Synthesizer (Phase 4 + Stage 2 + Stage 3)
 *
 * Role: Take a user query, intent, and retrieved chunks, then produce a
 * citation-backed answer WITH validation.
 *
 * STAGE 2: CitationValidator detects hallucinations
 * STAGE 3: Intent-specific prompt templates PREVENT hallucinations
 *
 * The best defense is a good offense - good prompts reduce validation failures!
 */
import { CodeQAResponse, RetrievedChunk, QueryIntent } from '../types/index.js';
import { LLMClient, getLLMClient } from '../utils/llm-client.js';
import { CitationValidator } from '../validation/citation-validator.js';
import { PromptTemplateManager } from '../prompts/prompt-templates.js';

interface SynthesizeOptions {
  maxCitations?: number;
}

export class ResponseSynthesizer {
  private llm: LLMClient;
  private maxCitations: number;
  private validator: CitationValidator;
  private promptManager: PromptTemplateManager;

  constructor(llmClient?: LLMClient, options: SynthesizeOptions = {}) {
    // Use environment-configured LLM or fallback to mock
    const provider = (process.env.LLM_PROVIDER as any) || 'mock';
    const apiKey = provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY :
                   provider === 'openai' ? process.env.OPENAI_API_KEY : undefined;
    const model = process.env.LLM_MODEL;

    this.llm = llmClient || getLLMClient({ provider, apiKey, model });
    this.maxCitations = options.maxCitations ?? 4;
    this.validator = new CitationValidator();
    this.promptManager = new PromptTemplateManager(); // Stage 3: Intent-specific prompts!
  }

  /**
   * Generate an answer with citations AND validate it!
   *
   * STAGE 2 INTEGRATION: Now validates every answer for hallucinations
   * before returning it to the user.
   */
  async synthesize(query: string, intent: QueryIntent, chunks: RetrievedChunk[]): Promise<CodeQAResponse> {
    if (!chunks.length) {
      return {
        content: `I could not find relevant code for "${query}". Please try a narrower or different query.`,
        citations: [],
        confidence: 0.2,
        reasoning: 'No retrieved chunks available; refusing to speculate.',
        validation: {
          faithfulnessScore: 1.0, // Explicit refusal is perfectly faithful!
          passed: true,
          recommendation: 'accept',
          issues: [],
        },
      };
    }

    const evidence = chunks.slice(0, this.maxCitations);

    // STAGE 3: Use intent-specific prompt templates!
    const template = this.promptManager.getTemplate(intent.type);
    const userPrompt = template.userPromptBuilder(query, evidence);

    // Generate answer with optimized prompts
    const completion = await this.llm.complete(userPrompt, {
      systemPrompt: template.systemPrompt,
      maxTokens: 800,
      temperature: 0.3,
    });

    // Build citations
    const citations = evidence.map((chunk, idx) => ({
      id: `cite-${idx}`,
      chunkId: chunk.id,
      filePath: chunk.metadata.filePath,
      startLine: chunk.metadata.startLine,
      endLine: chunk.metadata.endLine,
      snippet: this.extractSnippet(chunk),
      relevance: chunk.relevanceScore ?? 0.5,
    }));

    // STAGE 2: Validate the answer for hallucinations!
    const faithfulness = this.validator.calculateFaithfulness(completion, citations);

    return {
      content: completion,
      citations,
      confidence: this.estimateConfidence(chunks, completion),
      reasoning: `Used ${evidence.length} chunks; top score ${chunks[0].relevanceScore?.toFixed(2) ?? 'n/a'}.`,
      retrievalMetrics: {
        chunksRetrieved: chunks.length,
        chunksUsed: evidence.length,
      },
      validation: {
        faithfulnessScore: faithfulness.overallScore,
        passed: faithfulness.recommendation !== 'reject',
        recommendation: faithfulness.recommendation,
        issues: faithfulness.issues.map(issue => ({
          type: issue.type,
          severity: issue.severity,
          message: issue.message,
        })),
      },
    };
  }

  /**
   * Estimate confidence based on retrieval scores and response characteristics
   * LEARNING NOTE: This is simplistic - Stage 2 will add real validation!
   */
  private estimateConfidence(chunks: RetrievedChunk[], response: string): number {
    const topScore = chunks[0]?.relevanceScore ?? 0.5;
    const avgScore = chunks.reduce((sum, c) => sum + (c.relevanceScore ?? 0.5), 0) / chunks.length;

    // Penalize if response is very short (likely insufficient evidence)
    const lengthPenalty = response.length < 100 ? 0.2 : 0;

    // Simple heuristic: combine retrieval quality with response characteristics
    return Math.max(0.1, Math.min(0.95, (topScore * 0.5 + avgScore * 0.3 + 0.2) - lengthPenalty));
  }

  private extractSnippet(chunk: RetrievedChunk): string {
    const lines = chunk.content.split('\n');
    return lines.slice(0, 6).join('\n'); // short preview to avoid huge payloads
  }
}
