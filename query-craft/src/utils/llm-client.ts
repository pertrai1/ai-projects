import Anthropic from "@anthropic-ai/sdk";

export interface LLMClientConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LLMClient {
  private client: Anthropic;
  private defaultModel: string;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.defaultModel = config.model || "claude-sonnet-4-5-20241022";
    this.defaultTemperature = config.temperature || 0.3;
    this.defaultMaxTokens = config.maxTokens || 2048;
  }

  async generateText(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || this.defaultMaxTokens,
      temperature: options?.temperature || this.defaultTemperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response type from Claude API");
  }

  async generateJSON<T>(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<T> {
    const text = await this.generateText(systemPrompt, userMessage, options);

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/);

    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText.trim());
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${error}\n\nRaw response:\n${text}`,
      );
    }
  }
}
