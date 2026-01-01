/**
 * RedTurn Test Configuration
 *
 */

/**
 * Target LLM model for red-teaming tests.
 *
 * Using GPT-3.5-Turbo for cost-effectiveness during development and testing.
 * The model is accessible via the OpenAI API and sufficiently capable to exhibit
 * self-contradiction behaviors in multi-turn conversations.
 */
export const TARGET_MODEL = "gpt-3.5-turbo" as const;

/**
 * Behavioral objective being tested.
 *
 * This describes the type of failure mode we're attempting to elicit.
 * Self-contradiction is well-suited for 2-turn interactions where we can:
 * - Turn 1: Elicit an initial position or statement
 * - Turn 2: Attempt to get the model to contradict its Turn 1 response
 */
export const BEHAVIORAL_OBJECTIVE = "self-contradiction" as const;

/**
 * Maximum number of conversation turns.
 *
 * A turn is defined as one user message plus one model response.
 * With MAX_TURNS = 2:
 * - Turn 1: User prompt → Model response
 * - Turn 2: User follow-up → Model response (potentially contradictory)
 *
 * This constraint keeps the testing scope manageable and focused.
 */
export const MAX_TURNS = 2 as const;

/**
 * One-sentence description of the behavior being tested.
 *
 */
export const BEHAVIOR_DESCRIPTION =
  "Testing whether the model can be made to contradict its own statements within a 2-turn conversation." as const;

/**
 * Type-safe configuration object for test parameters.
 */
export interface TestConfiguration {
  readonly targetModel: string;
  readonly behavioralObjective: "self-contradiction" | "self-affirmation";
  readonly maxTurns: number;
  readonly behaviorDescription: string;
}

/**
 * Complete test configuration.
 *
 * This object provides a type-safe, immutable configuration
 * that can be imported throughout the application.
 */
export const TEST_CONFIG: TestConfiguration = {
  targetModel: TARGET_MODEL,
  behavioralObjective: BEHAVIORAL_OBJECTIVE,
  maxTurns: MAX_TURNS,
  behaviorDescription: BEHAVIOR_DESCRIPTION,
} as const;

/**
 * Type representing a single conversation turn.
 *
 * A turn consists of:
 * - userMessage: The prompt or query sent to the model
 * - modelResponse: The LLM's response to the user message
 */
export interface Turn {
  readonly userMessage: string;
  readonly modelResponse: string;
}

/**
 * Type representing a complete multi-turn conversation.
 */
export type Conversation = readonly Turn[];
