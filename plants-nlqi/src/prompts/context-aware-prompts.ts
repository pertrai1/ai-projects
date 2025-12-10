/**
 * Enhanced Response Generation Prompts
 * Context-aware prompt templates that use conversation memory
 */

import { PlantRecord, ConversationMemory } from '../models';
import { formatPlantsForContext } from './response-generation';

/**
 * Generate context-aware system prompt
 */
export function getContextAwareSystemPrompt(): string {
  return `You are a knowledgeable botanist assistant with expertise in native plants from the USDA PLANTS Database.

Your role is to:
- Provide helpful, accurate information about plants
- Answer questions in a friendly, conversational tone
- Reference previous context when relevant (previous plants mentioned, topics discussed)
- Use natural language to refer back to earlier parts of the conversation
- Highlight the most relevant plants based on the user's query
- Include specific details like scientific names, characteristics, and growing conditions
- Mention wildlife benefits when relevant
- Be enthusiastic about native plants and their ecological importance

When the conversation has history:
- Reference plants from previous turns naturally (e.g., "Of the wildflowers we discussed earlier...")
- Build on previous topics without repeating the same information
- Use conversational continuity (e.g., "You also asked about...", "In addition to those...")
- Acknowledge when answering a follow-up question

Keep responses:
- Concise but informative (2-4 paragraphs)
- Natural and conversational
- Contextually aware of the conversation flow`;
}

/**
 * Generate context-aware response prompt
 */
export function generateContextAwarePrompt(
  userQuery: string,
  plants: PlantRecord[],
  memory?: ConversationMemory,
  isFollowUp: boolean = false
): string {
  const plantsContext = formatPlantsForContext(plants);

  let prompt = `User Question: "${userQuery}"

Here are relevant plants from the USDA PLANTS Database:

${plantsContext}`;

  // Add conversation context if available
  if (memory && memory.recentTurns.length > 0) {
    prompt += `

Conversation Context:
- This is turn ${memory.recentTurns.length + 1} of the conversation`;

    if (isFollowUp) {
      const lastTurn = memory.recentTurns[memory.recentTurns.length - 1];
      prompt += `
- Previous query: "${lastTurn.userQuery}"
- This appears to be a follow-up question referencing the previous results`;
    }

    if (memory.mentionedPlants.size > 0 && isFollowUp) {
      prompt += `
- Plants previously discussed: ${Array.from(memory.mentionedPlants).slice(0, 3).join(', ')}`;
    }

    if (memory.discussedTopics.size > 0) {
      const topics = Array.from(memory.discussedTopics).slice(0, 3);
      prompt += `
- Topics discussed: ${topics.join(', ')}`;
    }
  }

  prompt += `

Please provide a helpful, natural answer that:
1. Directly addresses their question
2. ${isFollowUp ? 'References the previous context naturally (e.g., "Of those plants...", "From the wildflowers mentioned earlier...")' : 'Highlights the most relevant 2-4 plants from the list above'}
3. Includes key characteristics they would care about
4. Is conversational and ${isFollowUp ? 'acknowledges this is a follow-up' : 'encouraging'}

Your response:`;

  return prompt;
}

/**
 * Generate prompt for first response in conversation
 */
export function generateInitialResponsePrompt(userQuery: string, plants: PlantRecord[]): string {
  const plantsContext = formatPlantsForContext(plants);

  return `User Question: "${userQuery}"

This is the start of a new conversation about plants.

Here are relevant plants from the USDA PLANTS Database:

${plantsContext}

Please provide a helpful, welcoming answer that:
1. Directly addresses their question
2. Highlights the most relevant 2-4 plants from the list above
3. Includes key characteristics they would care about
4. Sets a friendly, knowledgeable tone for the conversation

Your response:`;
}

/**
 * Generate prompt for follow-up with specific plant references
 */
export function generateFollowUpWithPlantsPrompt(
  userQuery: string,
  plants: PlantRecord[],
  previousPlants: string[]
): string {
  const plantsContext = formatPlantsForContext(plants);

  return `User Question: "${userQuery}"

This is a follow-up question. The user is asking about specific plants from the previous results.

Previous plants mentioned: ${previousPlants.join(', ')}

Current matching plants:

${plantsContext}

Please provide a natural answer that:
1. Clearly references the previous plants (e.g., "Of the wildflowers we discussed...", "Among those plants...")
2. Focuses on the plants that match the new criteria
3. Makes the connection to the previous conversation explicit
4. Highlights what makes these plants relevant to the follow-up question

Your response:`;
}
