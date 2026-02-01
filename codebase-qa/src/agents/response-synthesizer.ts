/**
 * Response Synthesizer (Phase 4 scaffold)
 *
 * Role: Take a user query, intent, and retrieved chunks, then produce a
 * citation-backed answer. Uses a mock LLM for pedagogy and keeps the
 * citation plumbing explicit to show how hallucination is mitigated.
 */
import { CodeQAResponse, RetrievedChunk, QueryIntent } from '../types/index.js';
import { LLMClient, getLLMClient } from '../utils/llm-client.js';

interface SynthesizeOptions {
  maxCitations?: number;
}

export class ResponseSynthesizer {
  private llm: LLMClient;
  private maxCitations: number;

  constructor(llmClient?: LLMClient, options: SynthesizeOptions = {}) {
    this.llm = llmClient || getLLMClient({ provider: 'mock' });
    this.maxCitations = options.maxCitations ?? 4;
  }

  /**
   * Generate an answer with citations. In this mock scaffold we:
   * 1) Select top N chunks as evidence.
   * 2) Build a structured prompt (for real LLMs later).
   * 3) Compose a deterministic, template-based answer to keep behavior stable.
   */
  async synthesize(query: string, intent: QueryIntent, chunks: RetrievedChunk[]): Promise<CodeQAResponse> {
    if (!chunks.length) {
      return {
        content: `I could not find relevant code for "${query}". Please try a narrower or different query.`,
        citations: [],
        confidence: 0.2,
        reasoning: 'No retrieved chunks available; refusing to speculate.',
      };
    }

    const evidence = chunks.slice(0, this.maxCitations);
    const prompt = this.buildPrompt(query, intent, evidence);

    // Mock completion keeps us deterministic for teaching/testing.
    const completion = await this.llm.complete(prompt, { maxTokens: 200, temperature: 0 });

    return {
      content: this.composeAnswer(query, intent, evidence, completion),
      citations: evidence.map((chunk, idx) => ({
        id: `cite-${idx}`,
        chunkId: chunk.id,
        filePath: chunk.metadata.filePath,
        startLine: chunk.metadata.startLine,
        endLine: chunk.metadata.endLine,
        snippet: this.extractSnippet(chunk),
        relevance: chunk.relevanceScore ?? 0.5,
      })),
      confidence: Math.min(0.95, (chunks[0].relevanceScore ?? 0.6) + 0.2),
      reasoning: `Used ${evidence.length} chunks; top score ${chunks[0].relevanceScore?.toFixed(2) ?? 'n/a'}.`,
      retrievalMetrics: {
        chunksRetrieved: chunks.length,
        chunksUsed: evidence.length,
      },
    };
  }

  private buildPrompt(query: string, intent: QueryIntent, evidence: RetrievedChunk[]): string {
    const bulletEvidence = evidence
      .map(
        (c, i) =>
          `${i + 1}. ${c.metadata.filePath}:${c.metadata.startLine}-${c.metadata.endLine} ` +
          `(${c.metadata.scopeName ?? 'scope'})`
      )
      .join('\n');

    return [
      'You are a code explainer. Answer with citations.',
      `Intent: ${intent.type}`,
      `Question: ${query}`,
      'Evidence:',
      bulletEvidence,
      'Respond concisely with the most relevant details. Cite by file:line range.',
    ].join('\n');
  }

  private composeAnswer(
    _query: string,
    intent: QueryIntent,
    evidence: RetrievedChunk[],
    llmText: string
  ): string {
    // Deterministic template for now; include the mock completion to show where
    // the LLM text would slot in during Phase 4 proper.
    const primary = evidence[0];
    const cite = `${primary.metadata.filePath}:${primary.metadata.startLine}-${primary.metadata.endLine}`;

    return [
      `Answer (intent=${intent.type}):`,
      `Based on ${evidence.length} evidence chunks, the best match is in ${cite}.`,
      `Key scope: ${primary.metadata.scopeName ?? 'unknown scope'}.`,
      `Mock-LLM summary: ${llmText.trim()}`,
    ].join('\n');
  }

  private extractSnippet(chunk: RetrievedChunk): string {
    const lines = chunk.content.split('\n');
    return lines.slice(0, 6).join('\n'); // short preview to avoid huge payloads
  }
}
