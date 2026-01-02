/**
 * LLM Client Module
 *
 * Handles communication with the OpenAI API for Milestone 1 static baseline.
 * Configured for deterministic responses (temperature=0) to support the
 * "repeated runs produce nearly identical outcomes" stop condition.
 */

import OpenAI from "openai";
import { TARGET_MODEL } from "./config.js";

/**
 * Message structure for OpenAI API conversations.
 */
export interface ChatMessage {
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
}

/**
 * Initialize OpenAI client with API key from environment variables.
 *
 * @throws {Error} If OPENAI_API_KEY is not set in environment
 */
export function createLLMClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is required. " +
        "Please set it in your .env file."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env["OPENAI_BASE_URL"],
  });
}

/**
 * Send messages to the LLM and get a response.
 *
 * Configured for deterministic output:
 * - temperature: 0 (no randomness)
 * - max_tokens: 500 (reasonable limit for 2-turn conversations)
 *
 * @param client - Initialized OpenAI client
 * @param messages - Conversation history including current prompt
 * @returns The model's response content
 */
export async function sendMessage(
  client: OpenAI,
  messages: readonly ChatMessage[]
): Promise<string> {
  const response = await client.chat.completions.create({
    model: TARGET_MODEL,
    messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature: 0, // Deterministic responses for baseline
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response content received from LLM");
  }

  return content;
}
