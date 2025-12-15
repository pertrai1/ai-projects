/**
 * Test dataset for RAG (Retrieval-Augmented Generation) evaluation
 *
 * Each test case includes:
 * - input: The user's question
 * - expected: The expected answer content and quality criteria
 * - context: Sample relevant context that should be retrieved
 */

export interface RAGTestCase {
  input: string;
  expected: {
    // Key facts that should appear in the answer
    mustInclude?: string[];
    // Facts that should NOT appear (testing hallucination)
    mustNotInclude?: string[];
    // Expected answer type/format
    answerType: "definition" | "explanation" | "procedure" | "comparison" | "list";
    // Should the answer cite sources?
    requiresCitation: boolean;
  };
  // Reference answer for comparison
  referenceAnswer?: string;
  metadata: {
    category: string;
    difficulty: "easy" | "medium" | "hard";
    notes?: string;
  };
}

export const ragTestCases: RAGTestCase[] = [
  // Definition questions
  {
    input: "What does FACW mean?",
    expected: {
      mustInclude: [
        "facultative wetland",
        "occur in wetlands",
        "non-wetland",
      ],
      answerType: "definition",
      requiresCitation: true,
    },
    referenceAnswer:
      "FACW stands for Facultative Wetland. Plants with this indicator usually occur in wetlands (67-99% estimated probability), but are occasionally found in non-wetlands.",
    metadata: {
      category: "wetland-indicators",
      difficulty: "easy",
    },
  },
  {
    input: "What is a wetland indicator status?",
    expected: {
      mustInclude: ["wetland", "frequency", "occur"],
      answerType: "definition",
      requiresCitation: true,
    },
    referenceAnswer:
      "Wetland indicator status is a rating assigned to plants that indicates the estimated probability of the species occurring in wetlands versus non-wetlands. The status categories include OBL (Obligate Wetland), FACW (Facultative Wetland), FAC (Facultative), FACU (Facultative Upland), and UPL (Obligate Upland).",
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium",
    },
  },
  {
    input: "What is a PLANTS symbol?",
    expected: {
      mustInclude: ["unique", "identifier", "species"],
      answerType: "definition",
      requiresCitation: true,
    },
    referenceAnswer:
      "A PLANTS symbol is a unique identifier assigned to each plant species in the USDA PLANTS database. It's typically a short code derived from the scientific name, used for consistent reference across the database.",
    metadata: {
      category: "taxonomy",
      difficulty: "easy",
    },
  },
  {
    input: "Define growth habit",
    expected: {
      mustInclude: ["form", "plant"],
      answerType: "definition",
      requiresCitation: true,
    },
    referenceAnswer:
      "Growth habit refers to the general form or shape a plant takes as it grows, such as tree, shrub, herb, vine, or grass. It describes the overall appearance and structure of the plant.",
    metadata: {
      category: "plant-characteristics",
      difficulty: "easy",
    },
  },

  // Comparison questions
  {
    input: "What's the difference between native and introduced plants?",
    expected: {
      mustInclude: ["native", "introduced", "naturally", "human"],
      answerType: "comparison",
      requiresCitation: true,
    },
    referenceAnswer:
      "Native plants are those that occur naturally in a region without human introduction, having evolved in that ecosystem over time. Introduced plants (also called non-native or exotic) are species that have been brought to a region by human activity, either intentionally or accidentally, and did not historically occur there.",
    metadata: {
      category: "plant-status",
      difficulty: "medium",
    },
  },
  {
    input: "Compare FACW and FAC wetland indicators",
    expected: {
      mustInclude: ["FACW", "FAC", "probability", "wetland"],
      answerType: "comparison",
      requiresCitation: true,
    },
    referenceAnswer:
      "FACW (Facultative Wetland) plants usually occur in wetlands (67-99% probability) but occasionally in non-wetlands. FAC (Facultative) plants are equally likely to occur in wetlands or non-wetlands (34-66% probability in wetlands). FACW species have a stronger association with wetlands than FAC species.",
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium",
    },
  },

  // Procedural questions
  {
    input: "How do I search for plants by state?",
    expected: {
      mustInclude: ["search", "state", "filter"],
      answerType: "procedure",
      requiresCitation: true,
    },
    metadata: {
      category: "search-procedures",
      difficulty: "medium",
      notes: "Should provide step-by-step instructions",
    },
  },

  // General knowledge questions
  {
    input: "Tell me about the PLANTS database",
    expected: {
      mustInclude: ["USDA", "database", "plants"],
      answerType: "explanation",
      requiresCitation: true,
    },
    metadata: {
      category: "general-info",
      difficulty: "easy",
    },
  },

  // Testing for hallucination resistance
  {
    input: "What does XYZ123 wetland indicator mean?",
    expected: {
      mustNotInclude: ["XYZ123 means", "XYZ123 stands for"],
      answerType: "explanation",
      requiresCitation: false,
    },
    metadata: {
      category: "hallucination-test",
      difficulty: "hard",
      notes: "Should not make up an answer for a non-existent indicator",
    },
  },

  // Complex multi-part questions
  {
    input:
      "What are the different wetland indicator categories and what do they mean?",
    expected: {
      mustInclude: ["OBL", "FACW", "FAC", "FACU", "UPL"],
      answerType: "explanation",
      requiresCitation: true,
    },
    referenceAnswer:
      "There are five wetland indicator categories: OBL (Obligate Wetland) - almost always occur in wetlands (>99%); FACW (Facultative Wetland) - usually in wetlands (67-99%); FAC (Facultative) - equally likely in wetlands or non-wetlands (34-66%); FACU (Facultative Upland) - usually in non-wetlands (67-99%); UPL (Obligate Upland) - almost never in wetlands (<1%).",
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium",
    },
  },
];

// Export a simplified version for quick testing
export const quickRAGTests = ragTestCases.slice(0, 5);

// Export by category for targeted testing
export const ragTestsByCategory = ragTestCases.reduce((acc, test) => {
  const category = test.metadata.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(test);
  return acc;
}, {} as Record<string, RAGTestCase[]>);
