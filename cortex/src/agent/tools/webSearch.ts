import { openai } from "@ai-sdk/openai";

/**
 * OpenAI native web search tool
 *
 * This is a provider tool - execution is handled by OpenAI, not our tool executor.
 * Results are returned directly in the model's response stream.
 */
export const webSearch = openai.tools.webSearch({});
