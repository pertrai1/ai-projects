/**
 * Claude Service
 * Handles interactions with Anthropic's Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { PlantRecord } from '../models';
import { generateResponsePrompt, generateNoResultsPrompt, getSystemPrompt } from '../prompts';
import { logger } from '../utils/logger';

export interface ClaudeServiceConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class ClaudeService {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: ClaudeServiceConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 2000;

    logger.info('Claude service initialized', { model: this.model });
  }

  /**
   * Generate a natural language response based on user query and plant data
   */
  async generateResponse(userQuery: string, plants: PlantRecord[]): Promise<string> {
    try {
      logger.info('Generating response', { query: userQuery, plantCount: plants.length });

      // Handle no results case
      if (plants.length === 0) {
        return await this.generateNoResultsResponse(userQuery);
      }

      const systemPrompt = getSystemPrompt();
      const userPrompt = generateResponsePrompt(userQuery, plants);

      const startTime = Date.now();
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

      const duration = Date.now() - startTime;

      // Extract text from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      logger.info('Response generated', {
        duration,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });

      return textContent.text;
    } catch (error) {
      logger.error('Error generating response', { error });
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Generate response when no plants match the query
   */
  private async generateNoResultsResponse(userQuery: string): Promise<string> {
    try {
      const prompt = generateNoResultsPrompt(userQuery);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return "I couldn't find any plants matching your query. Try using broader search terms or different characteristics.";
      }

      return textContent.text;
    } catch (error) {
      logger.error('Error generating no-results response', { error });
      return "I couldn't find any plants matching your query. Try using broader search terms or different characteristics.";
    }
  }

  /**
   * Test the connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing Claude API connection');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "Connection successful" if you can read this.',
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
