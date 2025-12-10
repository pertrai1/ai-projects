/**
 * Enhanced Response Agent
 * Generates context-aware responses using conversation memory
 */

import Anthropic from '@anthropic-ai/sdk';
import { PlantRecord, ConversationMemory } from '../models';
import {
  getContextAwareSystemPrompt,
  generateContextAwarePrompt,
  generateInitialResponsePrompt,
  generateFollowUpWithPlantsPrompt,
} from '../prompts/context-aware-prompts';
import { logger } from '../utils/logger';

export interface ResponseAgentConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class ResponseAgent {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor(config: ResponseAgentConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 2000;

    logger.info('Response agent initialized', { model: this.model });
  }

  /**
   * Generate context-aware response
   */
  async generateResponse(
    userQuery: string,
    plants: PlantRecord[],
    memory?: ConversationMemory,
    isFollowUp: boolean = false
  ): Promise<string> {
    try {
      logger.info('Generating context-aware response', {
        query: userQuery,
        plantCount: plants.length,
        hasMemory: !!memory,
        isFollowUp,
      });

      // Handle no results case
      if (plants.length === 0) {
        return this.generateNoResultsResponse(userQuery, memory);
      }

      // Choose appropriate prompt strategy
      let systemPrompt: string;
      let userPrompt: string;

      if (!memory || memory.recentTurns.length === 0) {
        // First turn in conversation
        systemPrompt = getContextAwareSystemPrompt();
        userPrompt = generateInitialResponsePrompt(userQuery, plants);
      } else if (isFollowUp && memory.mentionedPlants.size > 0) {
        // Follow-up with plant references
        const previousPlantIds = Array.from(memory.mentionedPlants);
        systemPrompt = getContextAwareSystemPrompt();
        userPrompt = generateFollowUpWithPlantsPrompt(userQuery, plants, previousPlantIds);
      } else {
        // Regular context-aware response
        systemPrompt = getContextAwareSystemPrompt();
        userPrompt = generateContextAwarePrompt(userQuery, plants, memory, isFollowUp);
      }

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

      logger.info('Context-aware response generated', {
        duration,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });

      return textContent.text;
    } catch (error) {
      logger.error('Error generating context-aware response', { error });
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  /**
   * Generate response when no plants match
   */
  private async generateNoResultsResponse(
    userQuery: string,
    memory?: ConversationMemory
  ): Promise<string> {
    try {
      let prompt = `The user asked: "${userQuery}"

No matching plants were found in the database for this query.`;

      if (memory && memory.recentTurns.length > 0) {
        prompt += `

This is part of an ongoing conversation. Previous topics discussed: ${Array.from(memory.discussedTopics).slice(0, 3).join(', ')}`;
      }

      prompt += `

Please provide a helpful response that:
1. Acknowledges that we couldn't find specific matches
2. ${memory && memory.recentTurns.length > 0 ? 'References the conversation context if relevant' : 'Suggests they try different search terms'}
3. Remains encouraging and helpful

Keep it brief and friendly.`;

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
      logger.info('Testing response agent connection');

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
