/**
 * Query Router Agent
 * 
 * Responsible for analyzing user queries and determining the intent.
 * This is the "brain" of Phase 2 that decides HOW to search.
 */

import { LLMClient, getLLMClient } from '../utils/llm-client.js';
import { QueryIntent, QueryIntentType } from '../types/index.js';

export class QueryRouter {
  private llm: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llm = llmClient || getLLMClient({ provider: 'mock' });
  }

  /**
   * Route a user query to a specific intent
   */
  async routeQuery(query: string): Promise<QueryIntent> {
    console.log(`Analyzing query intent: "${query}"`);
    
    // In a real implementation with a live LLM, we would build a system prompt here
    // const systemPrompt = `You are an expert code understanding assistant. Classify the following query...`
    
    // For Phase 2 (simulated), the logic is encapsulated in the MockLLMClient
    const intent = await this.llm.classifyQuery(query, [
      'ARCHITECTURE',
      'IMPLEMENTATION',
      'DEPENDENCY',
      'USAGE',
      'DEBUGGING',
      'COMPARISON',
      'LOCATION',
      'GENERAL'
    ]);

    console.log(`Detected Intent: ${intent.type} (Confidence: ${intent.confidence})`);
    console.log(`Reasoning: ${intent.reasoning}`);
    
    return intent;
  }

  /**
   * Get retrieval strategy suggestion based on intent
   * (Phase 3 will implement the actual logic, this is a helper)
   */
  getStrategyForIntent(intent: QueryIntentType): string {
    switch (intent) {
      case 'LOCATION':
        return 'Precision search (High match threshold, low K)';
      case 'ARCHITECTURE':
        return 'Broad semantic search (High K, re-ranking)';
      case 'IMPLEMENTATION':
        return 'Hybrid search (Semantic + Keyword)';
      case 'DEBUGGING':
        return 'Error-focused search (Include error handling blocks)';
      default:
        return 'Standard semantic search';
    }
  }
}
