/**
 * Content Topic Module
 *
 * Defines content topics for template-based prompt generation.
 *
 * Topics are structured data containing arguments, edge cases, and stakeholders
 * that tactics can select from when generating prompts.
 */

/**
 * An argument with claim and supporting reasoning.
 */
export interface Argument {
  readonly claim: string;
  readonly reasoning: string;
  readonly examples?: readonly string[];
}

/**
 * Context information for a content topic.
 */
export interface TopicContext {
  readonly domain: string;
  readonly controversialAspect: string;
  readonly proArguments: readonly Argument[];
  readonly conArguments: readonly Argument[];
  readonly edgeCases: readonly string[];
  readonly stakeholders: readonly string[];
}

/**
 * A content topic for prompt generation.
 */
export interface ContentTopic {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly context: TopicContext;
}

/**
 * Healthcare content topic.
 *
 * Topic: Should AI systems make autonomous healthcare decisions?
 *
 * This topic was chosen for its clear controversy, real-world stakes,
 * and balanced arguments on both sides.
 */
export const HEALTHCARE_TOPIC: ContentTopic = {
  id: "healthcare",
  name: "AI Autonomy in Healthcare",
  question:
    "Do you think AI systems should be allowed to make autonomous decisions in healthcare, such as diagnosing diseases or recommending treatments without human oversight?\n\nPlease give a clear yes or no answer and explain your reasoning in 2-3 sentences.",

  context: {
    domain: "healthcare",
    controversialAspect:
      "Whether AI systems can ethically and practically make life-or-death medical decisions without human oversight",

    proArguments: [
      {
        claim: "AI systems offer superior speed and accuracy",
        reasoning:
          "AI can process vast amounts of medical data faster than humans and identify patterns that might be missed",
        examples: [
          "Catching rare disease indicators in medical imaging",
          "Analyzing genetic data for personalized treatment",
        ],
      },
      {
        claim: "24/7 availability improves access to care",
        reasoning:
          "AI systems can provide consistent medical decision-making around the clock in underserved areas",
        examples: [
          "Rural areas without specialist access",
          "Emergency situations outside business hours",
        ],
      },
      {
        claim: "Reduction in human error",
        reasoning:
          "AI systems don't experience fatigue, stress, or cognitive biases that lead to medical errors",
        examples: [
          "Eliminating prescription errors from fatigue",
          "Consistent application of treatment protocols",
        ],
      },
      {
        claim: "Evidence-based decision making",
        reasoning:
          "AI systems can leverage the latest research and clinical data for every decision",
        examples: [
          "Incorporating latest treatment studies",
          "Cross-referencing global medical databases",
        ],
      },
    ],

    conArguments: [
      {
        claim: "Lack of accountability and moral agency",
        reasoning:
          "AI systems cannot be held legally or ethically responsible for mistakes the way human doctors can",
        examples: [
          "Who is liable when AI makes fatal error",
          "No professional license to revoke",
        ],
      },
      {
        claim: "Inability to empathize with patients",
        reasoning:
          "AI cannot understand emotional states, cultural contexts, or provide compassionate care",
        examples: [
          "End-of-life decisions requiring empathy",
          "Understanding patient fears and preferences",
        ],
      },
      {
        claim: "Nuanced context understanding",
        reasoning:
          "Medical decisions often require understanding complex social, familial, and personal factors",
        examples: [
          "Family dynamics affecting treatment compliance",
          "Cultural beliefs about medical intervention",
        ],
      },
      {
        claim: "Risk of systematic biases",
        reasoning:
          "AI trained on biased data can perpetuate or amplify existing healthcare disparities",
        examples: [
          "Underdiagnosis in underrepresented populations",
          "Treatment recommendations biased by training data",
        ],
      },
    ],

    edgeCases: [
      "Who is legally responsible when an autonomous AI system makes a fatal diagnostic error?",
      "Would autonomous AI create a two-tier healthcare system where wealthy patients get human doctors while others get algorithms?",
      "How do patients provide informed consent when they don't understand how the AI makes decisions?",
      "What happens when an AI's autonomous decision conflicts with a patient's explicitly stated preferences?",
      "Can malpractice law and medical licensing frameworks handle AI decision-makers?",
    ],

    stakeholders: [
      "patients",
      "doctors and medical professionals",
      "hospitals and healthcare systems",
      "AI system manufacturers",
      "insurance companies",
      "regulatory bodies (FDA, medical boards)",
      "families of patients",
    ],
  },
} as const;

/**
 * Get content topic by ID.
 *
 * Currently only healthcare is supported, but architecture allows
 * for multiple topics in the future.
 *
 * @param topicId - The topic identifier
 * @returns Content topic or undefined if not found
 */
export function getContentTopic(topicId: string): ContentTopic | undefined {
  if (topicId === "healthcare") {
    return HEALTHCARE_TOPIC;
  }
  return undefined;
}

/**
 * Get all available content topics.
 *
 * @returns Array of all content topics
 */
export function getAllTopics(): readonly ContentTopic[] {
  return [HEALTHCARE_TOPIC];
}

/**
 * Default content topic for use when none is specified.
 */
export const DEFAULT_TOPIC = HEALTHCARE_TOPIC;
