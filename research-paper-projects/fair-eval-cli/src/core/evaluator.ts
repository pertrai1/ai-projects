import { parseStrictEvalJson } from "./parser.js";

export type EvaluateOnceArgs = {
  model: string;
  prompt: string;
  temperature: number;
  timeoutMs?: number;
};

export type EvalSample = {
  evidence: string;
  scoreA: number;
  scoreB: number;
};

function getEnv(name: string, required = true): string {
  const v = process.env[name];
  if (!v && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v ?? "";
}

export async function evaluateOnce(
  args: EvaluateOnceArgs,
): Promise<EvalSample> {
  const apiKey = getEnv("OPENAI_API_KEY", true);
  const baseUrl = (
    process.env["OPENAI_API_BASE_URL"] || "https://api.openai.com/v1"
  ).replace(/\/+$/, "");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), args.timeoutMs ?? 60000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: args.model,
        temperature: args.temperature,
        messages: [
          {
            role: "system",
            content:
              "You are a careful evaluator that follows output-format requirements exactly.",
          },
          {
            role: "user",
            content: args.prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `LLM request failed: ${res.status} ${res.statusText}\n${text}`,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM response is missing content");
    }

    return parseStrictEvalJson(content);
  } finally {
    clearTimeout(t);
  }
}
