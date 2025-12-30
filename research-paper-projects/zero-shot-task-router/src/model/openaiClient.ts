import OpenAI from "openai";
import type { LanguageModelClient } from "./languageModelClient.js";
import {
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL,
  OPENAI_TEMPERATURE,
  OPENAI_TOP_P,
} from "./openaiConfig.js";

export class OpenAiLanguageModelClient implements LanguageModelClient {
  private client: OpenAI;

  constructor(apiKey: string | undefined, baseUrl?: string) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required to run completions.");
    }

    this.client = new OpenAI({ apiKey, baseURL: baseUrl });
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: OPENAI_TEMPERATURE,
      top_p: OPENAI_TOP_P,
      max_tokens: OPENAI_MAX_TOKENS,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
