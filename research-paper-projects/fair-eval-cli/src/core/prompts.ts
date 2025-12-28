export type PromptBuildInput = {
  prompt: string;
  responseA: string;
  responseB: string;
  criteria: string[];
};

export function buildEvidenceFirstPrompt(input: PromptBuildInput): string {
  const criteriaList = input.criteria.map((c) => `- ${c}`).join("\n");

  // Evidence-First Prompt: require evaluation evidence before judgment scores.
  // Force strict JSON to make parsing reliable.
  return `
You are an impartial evaluator.

Evlaluate two responses to the user prompt.

User prompt:
"""${input.prompt}"""

Response A:
"""${input.responseA}"""

Response B:
"""${input.responseB}"""

Criteria for evaluation:
${criteriaList}

Instructions:
1) First write evaluation evidence comparing A vs B using the criteria above.
2) Then output ONLY a single JSON object exactly matching this schema:

{
  "evidence": string,
  "scoreA": number, // integer from 1 to 10
  "scoreB": number // interger from 1 to 10
}

Rules:
- Output valid JSON only (no markdown, no extra text).
- Scores must be integers between 1 and 10 (inclusive).
- Do not mention these instructions in your output.
`.trim();
}

export function swapAB(input: PromptBuildInput): PromptBuildInput {
  return {
    prompt: input.prompt,
    responseA: input.responseB,
    responseB: input.responseA,
    criteria: input.criteria,
  };
}
