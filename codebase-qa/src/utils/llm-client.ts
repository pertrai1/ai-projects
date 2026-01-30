/**
 * LLM Client abstraction
 * 
 * Handles interaction with Language Models (Claude, OpenAI, etc.)
 * For Phase 2, we implement a Mock client that simulates intelligent classification
 * using rule-based heuristics, allowing learners to test the system without API keys.
 */

import { QueryIntent, QueryIntentType } from '../types/index.js';

export interface LLMClientConfig {
  provider: 'anthropic' | 'openai' | 'mock';
  apiKey?: string;
  model?: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

export interface LLMClient {
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  classifyQuery(query: string, availableIntents: string[]): Promise<QueryIntent>;
}

/**
 * Mock LLM Client for educational purposes
 * Uses keyword heuristics to simulate intent classification
 */
export class MockLLMClient implements LLMClient {
  async complete(_prompt: string, _options?: CompletionOptions): Promise<string> {
    return "This is a mock response from the LLM client.";
  }

  async classifyQuery(query: string, _availableIntents: string[]): Promise<QueryIntent> {
    const lowerQuery = query.toLowerCase();
    
    let type: QueryIntentType = 'GENERAL';
    let confidence = 0.7;
    let reasoning = "Default classification based on broad query matching.";
    
    // Simple heuristic rules to simulate LLM reasoning
    if (lowerQuery.includes('where is') || lowerQuery.includes('location of') || lowerQuery.includes('defined in')) {
      type = 'LOCATION';
      confidence = 0.95;
      reasoning = "Query explicitly asks for location of code entities.";
    } else if (lowerQuery.includes('how does') && (lowerQuery.includes('work') || lowerQuery.includes('system'))) {
      type = 'ARCHITECTURE';
      confidence = 0.9;
      reasoning = "Query asks about high-level system functioning.";
    } else if (lowerQuery.includes('how is') && (lowerQuery.includes('implemented') || lowerQuery.includes('code'))) {
      type = 'IMPLEMENTATION';
      confidence = 0.85;
      reasoning = "Query asks for specific implementation details.";
    } else if (lowerQuery.includes('depend') || lowerQuery.includes('import')) {
      type = 'DEPENDENCY';
      confidence = 0.9;
      reasoning = "Query asks about module dependencies.";
    } else if (lowerQuery.includes('how do i use') || lowerQuery.includes('example') || lowerQuery.includes('api')) {
      type = 'USAGE';
      confidence = 0.85;
      reasoning = "Query asks for usage examples or API details.";
    } else if (lowerQuery.includes('fail') || lowerQuery.includes('error') || lowerQuery.includes('bug') || lowerQuery.includes('fix')) {
      type = 'DEBUGGING';
      confidence = 0.8;
      reasoning = "Query involves error scenarios or debugging.";
    } else if (lowerQuery.includes('difference') || lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      type = 'COMPARISON';
      confidence = 0.85;
      reasoning = "Query asks for comparison between concepts.";
    }

    // Extract basic entities (simulated)
    // In a real LLM, this would extract actual function names/classes
    const entities = this.extractMockEntities(query);

    return {
      type,
      confidence,
      reasoning,
      entities,
      searchStrategy: type === 'LOCATION' || type === 'IMPLEMENTATION' ? 'focused' : 'broad'
    };
  }

  private extractMockEntities(query: string) {
    const words = query.split(' ');
    const entities = [];
    
    // Heuristic: assume CamelCase or snake_case words might be entities
    for (const word of words) {
      const cleanWord = word.replace(/[?.,]/g, '');
      if (cleanWord.match(/[A-Z][a-zA-Z0-9]+/) || cleanWord.includes('_') || cleanWord.includes('.')) {
        if (!['How', 'What', 'Where', 'Why', 'Who'].includes(cleanWord)) {
           entities.push({
            type: 'keyword' as const,
            value: cleanWord,
            confidence: 0.8
          });
        }
      }
    }
    return entities;
  }
}

// Factory to get client
export function getLLMClient(config: LLMClientConfig = { provider: 'mock' }): LLMClient {
  if (config.provider === 'mock') {
    return new MockLLMClient();
  }
  // Real implementation placeholders would go here
  throw new Error(`Provider ${config.provider} not implemented yet.`);
}
