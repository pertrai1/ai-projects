import { buildEvidenceFirstPrompt, swapAB } from "./prompts.js";
import { evaluateOnce, type EvalSample } from "./evaluator.js";
import { mean, variance } from "../utils/math.js";

export type Confidence = "high" | "medium" | "low";

export type PairwiseEvalConfig = {
  prompt: string;
  responseA: string;
  responseB: string;

  // Evidence-first criteria, e.g. helpfulness, honesty, harmlessness
  criteria: string[];

  // MEC: number of evidence pieces to consider per position
  k: number;

  // Sampling temperature for LLM
  temperature: number;

  // Evaluator model identifier
  model: string;

  // Include diagnostic information in the output
  verbose?: boolean;
};

export type EvalResult = {
  winner: "A" | "B" | "TIE";
  scoreA: number;
  scoreB: number;
  confidence: Confidence;
  meta?: {
    k: number;
    temperature: number;
    criteria: string[];
    model: string;
    disagreement?: number;
    samples?: {
      order: "A_FIRST" | "B_FIRST";
      raw: EvalSample[];
    }[];
  };
};

/**
 * Behavior:
 *  1) Build evidence-first prompt for (A,B)
 *  2) Sample k times -> scores (MEC)
 *  3) Build evidence-first prompt for (B,A)
 *  4) Sample k times -> scores (MEC)
 *  5) Aggregate across both orders (BPC) by averaging 2k scores per response
 *  6) Compute confidence from disagreement / variance across runs
 */
export async function runPairwiseEval(
  config: PairwiseEvalConfig,
): Promise<EvalResult> {
  const baseInput = {
    prompt: config.prompt,
    responseA: config.responseA,
    responseB: config.responseB,
    criteria: config.criteria,
  };

  // A first
  const promptAB = buildEvidenceFirstPrompt(baseInput);

  // B first (swap A/B)
  const swapped = swapAB(baseInput);
  const promptBA = buildEvidenceFirstPrompt(swapped);

  // MEC sampling: k samples per order
  const samplesAB = await sampleK({
    k: config.k,
    model: config.model,
    temperature: config.temperature,
    prompt: promptAB,
  });

  const samplesBA = await sampleK({
    k: config.k,
    model: config.model,
    temperature: config.temperature,
    prompt: promptBA,
  });

  // BPC aggregation:
  // - samplesAB scores are for (A,B)
  // - samples BA scores are for (B,A), so swap them back
  //    scoreA_from_BA = scoreB (because A is in "B" slot in swapped prompt)
  //    scoreB_from_BA = scoreA
  const aScores = [
    ...samplesAB.map((s: any) => s.scoreA),
    ...samplesBA.map((s: any) => s.scoreB),
  ];
  const bScores = [
    ...samplesAB.map((s: any) => s.scoreB),
    ...samplesBA.map((s: any) => s.scoreA),
  ];

  const scoreA = mean(aScores);
  const scoreB = mean(bScores);

  const deltaPerSample = aScores.map((a, i) => a - bScores[i]);
  const disagreement = variance(deltaPerSample);

  const winner: EvalResult["winner"] =
    scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "TIE";

  const confidence = confidenceFromDisagreement(disagreement);

  const result: EvalResult = {
    winner,
    scoreA,
    scoreB,
    confidence,
  };

  if (config.verbose) {
    result.meta = {
      k: config.k,
      temperature: config.temperature,
      criteria: config.criteria,
      model: config.model,
      disagreement,
      samples: [
        {
          order: "A_FIRST",
          raw: samplesAB,
        },
        {
          order: "B_FIRST",
          raw: samplesBA,
        },
      ],
    };
  }

  return result;
}

async function sampleK(args: {
  k: number;
  model: string;
  temperature: number;
  prompt: string;
}): Promise<EvalSample[]> {
  const out: EvalSample[] = [];
  for (let i = 0; i < args.k; i++) {
    out.push(
      await evaluateOnce({
        model: args.model,
        temperature: args.temperature,
        prompt: args.prompt,
      }),
    );
  }
  return out;
}

function confidenceFromDisagreement(disagreement: number): Confidence {
  // Heuristic thresholds for confidence levels based on disagreement
  // Lower variance in per-sample deltas -> higher confidence
  if (disagreement < 0.25) {
    return "high";
  }
  if (disagreement < 1.0) {
    return "medium";
  }
  return "low";
}
