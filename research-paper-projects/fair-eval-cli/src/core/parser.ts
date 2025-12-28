import type { EvalSample } from "./evaluator.ts";

function isInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n);
}

function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

export function parseStrictEvalJson(text: string): EvalSample {
  const trimmed = text.trim();

  // First attempt: direct parse
  const direct = tryParse(trimmed);
  if (direct) {
    return validate(direct);
  }

  // Fallback: extract first JSON object substring
  const extracted = extractFirstJsonObject(trimmed);
  const fallback = extracted ? tryParse(extracted) : null;
  if (fallback) {
    return validate(fallback);
  }

  throw new Error(
    `Failed to parse evaluator JSON. Raw output:\n${text.slice(0, 800)}${text.length > 800 ? "..." : ""}`,
  );
}

function tryParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      depth++;
    }
    if (ch === "}") {
      depth--;
    }
    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }
  return null;
}

function validate(obj: any): EvalSample {
  const evidence = obj?.evidence;
  const scoreA = obj?.scoreA;
  const scoreB = obj?.scoreB;

  if (typeof evidence !== "string") {
    throw new Error("Parsed JSON is missing 'evidence' string field.");
  }
  if (!isInt(scoreA) || !inRange(scoreA, 1, 10)) {
    throw new Error("Invalid 'scoreA': must be an integer between 1 and 10.");
  }
  if (!isInt(scoreB) || !inRange(scoreB, 1, 10)) {
    throw new Error("Invalid 'scoreB': must be an integer between 1 and 10.");
  }

  return { evidence, scoreA, scoreB };
}
