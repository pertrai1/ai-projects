import Anthropic from "@anthropic-ai/sdk";
import type { AgentSpec } from "../types/spec.js";

export interface ExecutionContext {
  input: Record<string, any>;
  verbose?: boolean;
}

export interface ExecutionResult {
  output: any;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

export class SpecExecutor {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY is required. Please set it in your .env file or pass it to the constructor.",
      );
    }

    this.anthropic = new Anthropic({
      apiKey: key,
    });
  }

  /**
   * Execute an agent spec with given input
   */
  async executeAgent(
    spec: AgentSpec,
    context: ExecutionContext,
  ): Promise<ExecutionResult> {
    const { input, verbose } = context;

    if (verbose) {
      console.log("Executing agent:", spec.metadata.name);
      console.log("Input:", JSON.stringify(input, null, 2));
    }

    // Prepare the user message from input
    const userMessage = this.prepareUserMessage(input);

    // Call Anthropic API
    const response = await this.anthropic.messages.create({
      model: spec.config.model,
      max_tokens: spec.config.maxTokens || 4096,
      temperature: spec.config.temperature,
      system: spec.systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from model");
    }

    // Parse output if JSON schema is defined
    let output: any;
    if (spec.outputSchema) {
      try {
        output = JSON.parse(textContent.text);
      } catch (error) {
        // If parsing fails, return raw text
        output = { text: textContent.text };
      }
    } else {
      output = { text: textContent.text };
    }

    return {
      output,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
    };
  }

  /**
   * Prepare user message from input context
   */
  private prepareUserMessage(input: Record<string, any>): string {
    // If there's a 'question' or 'prompt' field, use it directly
    if (input.question) return input.question;
    if (input.prompt) return input.prompt;

    // Otherwise, serialize the entire input as JSON
    return JSON.stringify(input, null, 2);
  }
}

let _specExecutor: SpecExecutor | null = null;

export const specExecutor = {
  executeAgent: (spec: AgentSpec, context: ExecutionContext) => {
    if (!_specExecutor) {
      _specExecutor = new SpecExecutor();
    }
    return _specExecutor.executeAgent(spec, context);
  },
};
