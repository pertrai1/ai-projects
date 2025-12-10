/**
 * Intent Understanding Agent
 * Uses Claude to parse natural language queries into structured intent
 */

import Anthropic from '@anthropic-ai/sdk';
import { QueryIntent, IntentParseResult } from '../models';
import {
  getIntentParsingSystemPrompt,
  generateIntentParsingPrompt,
  generateContextualIntentPrompt,
} from '../prompts/intent-prompts';
import { normalizeStateName } from '../utils/intent-mappings';
import { logger } from '../utils/logger';

export interface IntentAgentConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class IntentAgent {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: IntentAgentConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 1000;

    logger.info('Intent agent initialized', { model: this.model });
  }

  /**
   * Parse a user query into structured intent
   */
  async parseIntent(userQuery: string): Promise<IntentParseResult> {
    const startTime = Date.now();

    try {
      logger.info('Parsing intent', { query: userQuery });

      const systemPrompt = getIntentParsingSystemPrompt();
      const userPrompt = generateIntentParsingPrompt(userQuery);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      const rawResponse = textContent.text;

      // Extract JSON from response (Claude might include explanation)
      const intent = this.extractAndValidateIntent(rawResponse, userQuery);

      // Post-process and normalize
      const normalizedIntent = this.normalizeIntent(intent);

      const parsingTime = Date.now() - startTime;

      logger.info('Intent parsed successfully', {
        queryType: normalizedIntent.queryType,
        confidence: normalizedIntent.confidence,
        duration: parsingTime,
      });

      return {
        intent: normalizedIntent,
        parsingTime,
        rawResponse,
      };
    } catch (error) {
      logger.error('Error parsing intent', { error, query: userQuery });

      // Fallback to basic intent
      const parsingTime = Date.now() - startTime;
      return {
        intent: this.createFallbackIntent(userQuery),
        parsingTime,
        warnings: [`Failed to parse intent: ${error}`],
      };
    }
  }

  /**
   * Parse intent with conversation context
   */
  async parseIntentWithContext(
    currentQuery: string,
    previousIntent?: QueryIntent,
    previousPlants?: string[]
  ): Promise<IntentParseResult> {
    const startTime = Date.now();

    try {
      logger.info('Parsing contextual intent', { query: currentQuery });

      const systemPrompt = getIntentParsingSystemPrompt();
      const userPrompt = generateContextualIntentPrompt(
        currentQuery,
        previousIntent,
        previousPlants
      );

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      const rawResponse = textContent.text;
      const intent = this.extractAndValidateIntent(rawResponse, currentQuery);
      const normalizedIntent = this.normalizeIntent(intent);

      const parsingTime = Date.now() - startTime;

      logger.info('Contextual intent parsed', {
        queryType: normalizedIntent.queryType,
        confidence: normalizedIntent.confidence,
        duration: parsingTime,
      });

      return {
        intent: normalizedIntent,
        parsingTime,
        rawResponse,
      };
    } catch (error) {
      logger.error('Error parsing contextual intent', { error, query: currentQuery });

      const parsingTime = Date.now() - startTime;
      return {
        intent: this.createFallbackIntent(currentQuery),
        parsingTime,
        warnings: [`Failed to parse contextual intent: ${error}`],
      };
    }
  }

  /**
   * Extract JSON from Claude's response and validate structure
   */
  private extractAndValidateIntent(rawResponse: string, originalQuery: string): QueryIntent {
    // Try to find JSON in the response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.queryType) {
      parsed.queryType = 'general';
    }

    if (!parsed.filters) {
      parsed.filters = {};
    }

    if (!parsed.semanticQuery) {
      parsed.semanticQuery = originalQuery;
    }

    if (parsed.confidence === undefined) {
      parsed.confidence = 0.8;
    }

    parsed.originalQuery = originalQuery;

    return parsed as QueryIntent;
  }

  /**
   * Normalize and validate intent values
   */
  private normalizeIntent(intent: QueryIntent): QueryIntent {
    const normalized = { ...intent };

    // Normalize state names to abbreviations
    if (normalized.filters.states) {
      normalized.filters.states = normalized.filters.states
        .map((state) => {
          const abbr = normalizeStateName(state);
          if (!abbr) {
            logger.warn('Could not normalize state', { state });
            return state.toUpperCase().substring(0, 2); // Best effort
          }
          return abbr;
        })
        .filter(Boolean);
    }

    // Ensure confidence is in valid range
    if (normalized.confidence < 0) normalized.confidence = 0;
    if (normalized.confidence > 1) normalized.confidence = 1;

    return normalized;
  }

  /**
   * Create a fallback intent when parsing fails
   */
  private createFallbackIntent(query: string): QueryIntent {
    return {
      queryType: 'general',
      filters: {},
      semanticQuery: query,
      confidence: 0.5,
      originalQuery: query,
    };
  }

  /**
   * Test the connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing intent agent connection');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "OK" if you can read this.',
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      const success = textContent && textContent.type === 'text';

      logger.info('Connection test result', { success });
      return !!success;
    } catch (error) {
      logger.error('Connection test failed', { error });
      return false;
    }
  }
}
