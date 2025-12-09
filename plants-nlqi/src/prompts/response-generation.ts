/**
 * Prompt Templates
 * Templates for generating responses with Claude
 */

import { PlantRecord } from '../models';

/**
 * Format plant data for inclusion in prompt context
 */
export function formatPlantsForContext(plants: PlantRecord[]): string {
  return plants
    .map((plant, index) => {
      const commonNamesStr = plant.commonNames.join(', ');
      const statesStr = plant.distribution.states.slice(0, 10).join(', ');
      const bloomInfo = plant.characteristics.bloomPeriod
        ? `Blooms: ${plant.characteristics.bloomPeriod}`
        : '';
      const waterInfo = plant.characteristics.waterNeeds
        ? `Water needs: ${plant.characteristics.waterNeeds}`
        : '';
      const sunInfo = plant.characteristics.sunRequirements
        ? `Sun: ${plant.characteristics.sunRequirements.join(', ')}`
        : '';
      const wildlifeInfo = plant.characteristics.wildlifeValue
        ? `Wildlife: ${plant.characteristics.wildlifeValue.join(', ')}`
        : '';

      return `${index + 1}. ${plant.scientificName} (${commonNamesStr})
   Family: ${plant.family}
   Type: ${plant.duration} ${plant.growthHabit.join(', ')}
   States: ${statesStr}
   ${bloomInfo}
   ${sunInfo}
   ${waterInfo}
   ${wildlifeInfo}
   Description: ${plant.description || 'N/A'}`;
    })
    .join('\n\n');
}

/**
 * Generate the system prompt for the botanist assistant
 */
export function getSystemPrompt(): string {
  return `You are a knowledgeable botanist assistant with expertise in native plants from the USDA PLANTS Database.

Your role is to:
- Provide helpful, accurate information about plants
- Answer questions in a friendly, conversational tone
- Highlight the most relevant plants based on the user's query
- Include specific details like scientific names, characteristics, and growing conditions
- Mention wildlife benefits when relevant
- Be enthusiastic about native plants and their ecological importance

When answering:
- Start with a direct answer to their question
- Mention 2-4 of the most relevant plants
- Include key characteristics they care about (bloom time, sun/water needs, wildlife value, etc.)
- Keep responses concise but informative (2-4 paragraphs)
- Use scientific names with common names in parentheses
- Be encouraging about native plant gardening`;
}

/**
 * Generate the user prompt with query and context
 */
export function generateResponsePrompt(userQuery: string, plants: PlantRecord[]): string {
  const plantsContext = formatPlantsForContext(plants);

  return `User Question: "${userQuery}"

Here are relevant plants from the USDA PLANTS Database:

${plantsContext}

Please provide a helpful, natural answer that:
1. Directly addresses their question
2. Highlights the most relevant 2-4 plants from the list above
3. Includes key characteristics they would care about
4. Is conversational and encouraging

Your response:`;
}

/**
 * Simple prompt for queries with no results
 */
export function generateNoResultsPrompt(userQuery: string): string {
  return `The user asked: "${userQuery}"

No matching plants were found in the database for this query.

Please provide a helpful response that:
1. Acknowledges that we couldn't find specific matches
2. Suggests they try:
   - Broader search terms
   - Different characteristics
   - Specific plant names or families
3. Remains encouraging and helpful

Keep it brief and friendly.`;
}
