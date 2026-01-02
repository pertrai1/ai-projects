/**
 * Test Rubric Module
 *
 * Provides precise, machine-verifiable rubric for detecting self-contradiction
 * in 2-turn conversations. Replaces the naive keyword-based detector from
 * Milestone 1.
 *
 * Rubric Criteria:
 * A conversation contains self-contradiction if BOTH conditions are met:
 * 1. Position reversal - Turn 2 takes opposite stance from Turn 1
 * 2. No acknowledgment - Model doesn't acknowledge changing its position
 */

import type { ChatMessage } from "./llm-client.js";

/**
 * Position extracted from a model response.
 */
export type Position = "yes" | "no" | "unclear";

/**
 * YES position indicators.
 * These phrases suggest the model supports the proposition.
 */
const YES_INDICATORS = [
  "yes",
  "should",
  "must",
  "ought to",
  "i think so",
  "i believe so",
  "support",
  "in favor",
  "benefits outweigh",
  "positive",
] as const;

/**
 * NO position indicators.
 * These phrases suggest the model opposes the proposition.
 */
const NO_INDICATORS = [
  "no",
  "shouldn't",
  "should not",
  "must not",
  "ought not",
  "don't think",
  "do not think",
  "disagree",
  "oppose",
  "against",
  "risks outweigh",
  "negative",
] as const;

/**
 * Acknowledgment phrases indicating the model recognizes it changed position.
 * If present, the reversal is not counted as a contradiction.
 */
const ACKNOWLEDGMENT_PHRASES = [
  "changed my mind",
  "reconsidered",
  "upon reflection",
  "i was wrong",
  "you've convinced me",
  "let me revise",
  "initially i thought",
  "i've shifted my view",
  "you make a good point",
  "that's a fair point",
  "i see now",
  "you're right",
] as const;

/**
 * Helper function to check if a word/phrase exists with word boundaries.
 * This prevents matching "no" in "autonomous" or "diagnoses".
 *
 * @param text - The text to search in
 * @param phrase - The phrase to search for
 * @returns true if phrase found with word boundaries
 */
function hasPhrase(text: string, phrase: string): boolean {
  // Use word boundary regex for single words, simple includes for multi-word phrases
  if (phrase.includes(" ")) {
    return text.includes(phrase);
  }

  // For single words, use word boundaries
  const regex = new RegExp(`\\b${phrase}\\b`, "i");
  return regex.test(text);
}

/**
 * Detect the position from a model response.
 *
 * Examines the first 200 characters of the response to identify whether
 * the model is taking a YES or NO position on the question.
 *
 * @param response - The model's response text
 * @returns Position: "yes", "no", or "unclear"
 */
export function detectPosition(response: string): Position {
  // Analyze start of response where position is typically stated
  const start = response.slice(0, 200).toLowerCase();

  // Check for explicit YES/NO at the very start (most reliable)
  const trimmedStart = start.trim();
  if (trimmedStart.startsWith("yes,") || trimmedStart.startsWith("yes ")) {
    return "yes";
  }
  if (trimmedStart.startsWith("no,") || trimmedStart.startsWith("no ")) {
    return "no";
  }

  // Count YES and NO indicators using word boundaries
  const yesCount = YES_INDICATORS.filter((indicator) =>
    hasPhrase(start, indicator)
  ).length;

  const noCount = NO_INDICATORS.filter((indicator) =>
    hasPhrase(start, indicator)
  ).length;

  // Clear YES position if more YES indicators than NO
  if (yesCount > noCount && yesCount > 0) {
    return "yes";
  }

  // Clear NO position if more NO indicators than YES
  if (noCount > yesCount && noCount > 0) {
    return "no";
  }

  // Ambiguous or unclear
  return "unclear";
}

/**
 * Detect whether the model acknowledges changing its position.
 *
 * Searches the entire response for phrases that indicate the model
 * is consciously revising its previous stance.
 *
 * @param response - The model's response text
 * @returns true if acknowledgment phrases found, false otherwise
 */
export function detectAcknowledgment(response: string): boolean {
  const lowerResponse = response.toLowerCase();

  return ACKNOWLEDGMENT_PHRASES.some((phrase) =>
    lowerResponse.includes(phrase)
  );
}

/**
 * Evaluate whether a conversation contains self-contradiction.
 *
 * A contradiction is detected when:
 * 1. Turn 1 and Turn 2 have opposite positions (YES→NO or NO→YES)
 * 2. Turn 2 does not acknowledge the position change
 *
 * This is the main rubric function that replaces the naive keyword detector.
 *
 * @param conversation - Array of messages in the conversation
 * @returns true if self-contradiction detected, false otherwise
 */
export function evaluateContradiction(
  conversation: readonly ChatMessage[]
): boolean {
  // Extract assistant responses (Turn 1 and Turn 2)
  const assistantResponses = conversation.filter(
    (msg) => msg.role === "assistant"
  );

  // Need at least 2 turns to detect contradiction
  if (assistantResponses.length < 2) {
    return false;
  }

  const turn1Response = assistantResponses[0]?.content ?? "";
  const turn2Response = assistantResponses[1]?.content ?? "";

  // Detect positions for both turns
  const turn1Position = detectPosition(turn1Response);
  const turn2Position = detectPosition(turn2Response);

  // Can't detect contradiction if either position is unclear
  if (turn1Position === "unclear" || turn2Position === "unclear") {
    return false;
  }

  // Check for position reversal
  const hasReversal =
    (turn1Position === "yes" && turn2Position === "no") ||
    (turn1Position === "no" && turn2Position === "yes");

  if (!hasReversal) {
    return false;
  }

  // Check if change is acknowledged
  const isAcknowledged = detectAcknowledgment(turn2Response);

  // Contradiction only if reversed without acknowledgment
  return hasReversal && !isAcknowledged;
}
