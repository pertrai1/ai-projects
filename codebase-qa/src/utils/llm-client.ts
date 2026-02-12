/**
 * LLM Client abstraction
 *
 * Handles interaction with Language Models (Claude, OpenAI, etc.)
 * For Phase 2, we implement a Mock client that simulates intelligent classification
 * using rule-based heuristics, allowing learners to test the system without API keys.
 *
 * Phase 4 adds AnthropicClient for real Claude responses with citation discipline.
 */

import Anthropic from '@anthropic-ai/sdk';
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

/**
 * Anthropic Claude Client
 * Uses real Claude API for intent classification and response generation
 */
export class AnthropicClient implements LLMClient {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 'You are a helpful AI assistant analyzing code.';
    const maxTokens = options?.maxTokens || 1024;
    const temperature = options?.temperature ?? 0.3;

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    throw new Error('Unexpected response type from Anthropic API');
  }

  async classifyQuery(query: string, availableIntents: string[]): Promise<QueryIntent> {
    const systemPrompt = `You are a query intent classifier for a code Q&A system.
Classify the user's query into one of these intent types: ${availableIntents.join(', ')}.

Intent definitions:
- ARCHITECTURE: Questions about high-level system design, how modules interact, overall structure
- IMPLEMENTATION: Questions about specific code implementation, how a function works
- DEPENDENCY: Questions about module dependencies, imports, what depends on what
- USAGE: Questions about how to use an API, class, or function (examples needed)
- DEBUGGING: Questions about errors, bugs, why something fails
- COMPARISON: Questions comparing two approaches, functions, or modules
- LOCATION: Questions about where something is defined or located
- GENERAL: General questions about the codebase

Return a JSON object with:
{
  "type": "INTENT_TYPE",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "entities": [{"type": "keyword", "value": "entity_name", "confidence": 0.0-1.0}],
  "searchStrategy": "focused" or "broad"
}`;

    const prompt = `Classify this query: "${query}"`;

    const response = await this.complete(prompt, {
      systemPrompt,
      maxTokens: 300,
      temperature: 0,
    });

    // Parse the JSON response
    try {
      const parsed = JSON.parse(response);
      return {
        type: parsed.type as QueryIntentType,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        entities: parsed.entities || [],
        searchStrategy: parsed.searchStrategy || 'broad',
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        type: 'GENERAL',
        confidence: 0.5,
        reasoning: 'Failed to parse LLM response, using fallback',
        entities: [],
        searchStrategy: 'broad',
      };
    }
  }
}

// Factory to get client
export function getLLMClient(config: LLMClientConfig = { provider: 'mock' }): LLMClient {
  if (config.provider === 'mock') {
    return new MockLLMClient();
  }
  if (config.provider === 'anthropic') {
    if (!config.apiKey) {
      throw new Error('Anthropic API key required. Set ANTHROPIC_API_KEY in .env');
    }
    return new AnthropicClient(config.apiKey, config.model);
  }
  // Real OpenAI implementation would go here
  throw new Error(`Provider ${config.provider} not implemented yet.`);
}
