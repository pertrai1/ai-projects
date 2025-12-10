/**
 * Intent Understanding Prompts
 * Prompt templates for parsing natural language queries into structured intent
 */

import { QueryIntent } from '../models';

export function getIntentParsingSystemPrompt(): string {
  return `You are a query intent parser for a plant database system. Your job is to analyze natural language queries about plants and extract structured information.

Extract the following information from queries:

1. **Query Type**:
   - "identification" - identifying a specific plant
   - "characteristics" - asking about plant properties
   - "location" - asking about plants in specific locations
   - "recommendation" - looking for plant suggestions
   - "comparison" - comparing multiple plants
   - "general" - general questions

2. **Location Filters**:
   - States (as 2-letter codes: NC, VA, GA, etc.)
   - Native status (native, introduced, both)

3. **Plant Type Filters**:
   - Growth habit (Tree, Shrub, Forb/herb, Graminoid, Vine)
   - Duration (Annual, Perennial, Biennial)

4. **Characteristics**:
   - Bloom period (Spring, Summer, Fall, Winter)
   - Sun requirements (Full Sun, Partial Shade, Full Shade)
   - Water needs (Low, Medium, High)
   - Soil texture (Sand, Loam, Clay, Silt)
   - Height range
   - Flower colors
   - Special traits (evergreen, drought-tolerant, shade-tolerant, fire-resistant)

5. **Wildlife Values**:
   - Pollinators, Birds, Mammals, Butterflies, Hummingbirds, Bees

6. **Semantic Query**: A refined version of the query for semantic search (remove stop words, keep key concepts)

Output ONLY valid JSON in this exact format:
{
  "queryType": "recommendation",
  "filters": {
    "states": ["NC"],
    "nativeStatus": "native",
    "growthHabit": ["Forb/herb"],
    "characteristics": {
      "waterNeeds": "Low",
      "bloomPeriod": ["Spring"]
    },
    "wildlifeValue": ["Butterflies"]
  },
  "semanticQuery": "drought tolerant wildflowers",
  "confidence": 0.95
}

Rules:
- Only include filters that are explicitly mentioned or strongly implied
- Convert state names to 2-letter codes (North Carolina → NC, Virginia → VA)
- Map natural language to structured values (drought-tolerant → waterNeeds: Low)
- Confidence: 0-1 based on how clear the query is
- Keep semanticQuery concise (3-6 words)
- If no specific filters mentioned, filters should be an empty object {}`;
}

export function generateIntentParsingPrompt(userQuery: string): string {
  return `Parse this plant database query:

"${userQuery}"

Extract the structured intent as JSON.`;
}

export function generateContextualIntentPrompt(
  currentQuery: string,
  previousIntent?: QueryIntent,
  previousPlants?: string[]
): string {
  let prompt = `Parse this plant database query:

"${currentQuery}"`;

  // Add context if this is a follow-up
  if (previousIntent) {
    prompt += `

Previous query context:
- Previous query type: ${previousIntent.queryType}
- Previous filters applied: ${JSON.stringify(previousIntent.filters)}`;

    if (previousPlants && previousPlants.length > 0) {
      prompt += `
- Plants from previous result: ${previousPlants.join(', ')}`;
    }

    prompt += `

If the current query references the previous context (uses words like "those", "them", "it"), incorporate the previous filters or plant IDs.`;
  }

  prompt += `

Extract the structured intent as JSON.`;

  return prompt;
}

/**
 * Generate a prompt to refine an ambiguous query
 */
export function generateClarificationPrompt(userQuery: string, ambiguity: string): string {
  return `The query "${userQuery}" is ambiguous: ${ambiguity}

What clarifying question should we ask the user? Keep it brief and conversational.`;
}
