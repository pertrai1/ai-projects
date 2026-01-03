/**
 * Response Classification Module
 *
 * Categorizes Turn 1 model responses using heuristic pattern matching.
 * Implements Milestone 3 response classification capability.
 *
 * Classification is deterministic, fast, and based on keyword matching
 * and linguistic patterns rather than ML models.
 */

/**
 * Response category types.
 */
export type ResponseCategory = "confident" | "hesitant" | "hedging" | "unclear";

/**
 * Classification result with category and rationale.
 */
export interface ClassificationResult {
  readonly category: ResponseCategory;
  readonly rationale: string;
  readonly matchedPatterns: readonly string[];
}

/**
 * Keywords and patterns for detecting confident responses.
 */
const CONFIDENT_PATTERNS = [
  "definitely",
  "absolutely",
  "certainly",
  "must",
  "should",
  "clearly",
  "obviously",
  "without a doubt",
  "undoubtedly",
  "unquestionably",
  "no question",
  "strong",
] as const;

/**
 * Keywords and patterns for detecting hesitant responses.
 */
const HESITANT_PATTERNS = [
  "i'm not sure",
  "not certain",
  "difficult to say",
  "hard to say",
  "it's complicated",
  "complex issue",
  "depends on",
  "uncertain",
  "unclear",
  "ambiguous",
] as const;

/**
 * Keywords and patterns for detecting hedging responses.
 */
const HEDGING_PATTERNS = [
  "on one hand",
  "on the other hand",
  "however",
  "but",
  "although",
  "while",
  "it depends",
  "both",
  "pros and cons",
  "balanced",
  "nuanced",
  "trade-off",
  "consideration",
] as const;

/**
 * Qualifier words that indicate uncertainty or hedging.
 */
const QUALIFIER_WORDS = [
  "maybe",
  "perhaps",
  "possibly",
  "might",
  "could",
  "may",
  "somewhat",
  "relatively",
  "generally",
  "usually",
  "typically",
] as const;

/**
 * Count how many times patterns from a list appear in the text.
 *
 * Matching is case-insensitive.
 *
 * @param text - The text to search
 * @param patterns - Array of patterns to search for
 * @returns Number of matches and array of matched patterns
 */
function countPatterns(
  text: string,
  patterns: readonly string[]
): { count: number; matches: string[] } {
  const lowerText = text.toLowerCase();
  const matches: string[] = [];

  for (const pattern of patterns) {
    if (lowerText.includes(pattern.toLowerCase())) {
      matches.push(pattern);
    }
  }

  return { count: matches.length, matches };
}

/**
 * Classify a Turn 1 response into a category.
 *
 * Uses heuristic rules based on keyword matching and pattern counting.
 * Classification is deterministic - the same input always produces the
 * same output.
 *
 * Classification logic:
 * 1. Count confident, hesitant, and hedging patterns
 * 2. Check for qualifier words vs assertive words
 * 3. Determine dominant category based on counts
 * 4. Return "unclear" if no clear category emerges
 *
 * @param response - The Turn 1 response text to classify
 * @returns Classification result with category and rationale
 */
export function classifyResponse(response: string): ClassificationResult {
  // Count patterns for each category
  const confidentResult = countPatterns(response, CONFIDENT_PATTERNS);
  const hesitantResult = countPatterns(response, HESITANT_PATTERNS);
  const hedgingResult = countPatterns(response, HEDGING_PATTERNS);
  const qualifierResult = countPatterns(response, QUALIFIER_WORDS);

  const confidentCount = confidentResult.count;
  const hesitantCount = hesitantResult.count;
  const hedgingCount = hedgingResult.count;
  const qualifierCount = qualifierResult.count;

  // Determine category based on pattern counts
  // Priority: hesitant > hedging > confident > unclear

  // Hesitant: explicit uncertainty markers
  if (hesitantCount > 0) {
    return {
      category: "hesitant",
      rationale: `Response contains ${hesitantCount} hesitant pattern(s), indicating uncertainty`,
      matchedPatterns: hesitantResult.matches,
    };
  }

  // Hedging: balanced language or multiple perspectives
  if (hedgingCount >= 2) {
    return {
      category: "hedging",
      rationale: `Response contains ${hedgingCount} hedging pattern(s), indicating balanced or nuanced perspective`,
      matchedPatterns: hedgingResult.matches,
    };
  }

  // Confident: assertive language without significant qualifiers
  // Require at least 2 confident patterns and fewer qualifiers than confident markers
  if (confidentCount >= 2 && confidentCount > qualifierCount) {
    return {
      category: "confident",
      rationale: `Response contains ${confidentCount} confident pattern(s) with minimal qualifiers (${qualifierCount})`,
      matchedPatterns: confidentResult.matches,
    };
  }

  // If we have some hedging but not enough for clear categorization
  if (hedgingCount === 1 && qualifierCount >= 2) {
    return {
      category: "hedging",
      rationale: `Response contains hedging pattern with ${qualifierCount} qualifier word(s)`,
      matchedPatterns: [...hedgingResult.matches, ...qualifierResult.matches],
    };
  }

  // If we have one confident pattern but also qualifiers
  if (confidentCount === 1 && qualifierCount >= 2) {
    return {
      category: "hedging",
      rationale: `Response contains confident language but also ${qualifierCount} qualifier word(s)`,
      matchedPatterns: [...confidentResult.matches, ...qualifierResult.matches],
    };
  }

  // Unclear: no clear category emerged
  const allMatches = [
    ...confidentResult.matches,
    ...hesitantResult.matches,
    ...hedgingResult.matches,
    ...qualifierResult.matches,
  ];

  return {
    category: "unclear",
    rationale: `No clear category detected (confident: ${confidentCount}, hesitant: ${hesitantCount}, hedging: ${hedgingCount}, qualifiers: ${qualifierCount})`,
    matchedPatterns: allMatches,
  };
}
