/**
 * Test dataset for Query Router evaluation
 *
 * Each test case includes:
 * - input: The user's question
 * - expected: The expected routing decision
 * - metadata: Additional context for analysis
 */

export interface RoutingTestCase {
  input: string;
  expected: {
    agentType: "DEFINITION_LOOKUP" | "HOW_TO_GUIDE" | "COMPARISON" | "DATA_RETRIEVAL" | "GENERAL_QA";
    confidence: "high" | "medium" | "low";
    searchStrategy: "focused" | "broad" | "multi-step";
  };
  metadata: {
    category: string;
    difficulty: "easy" | "medium" | "hard";
    notes?: string;
  };
}

export const routingTestCases: RoutingTestCase[] = [
  // DEFINITION_LOOKUP cases - "What is..." questions
  {
    input: "What does FACW mean?",
    expected: {
      agentType: "DEFINITION_LOOKUP",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "easy",
      notes: "Clear definition question for wetland indicator acronym"
    }
  },
  {
    input: "What is a wetland indicator status?",
    expected: {
      agentType: "DEFINITION_LOOKUP",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "easy"
    }
  },
  {
    input: "Define growth habit",
    expected: {
      agentType: "DEFINITION_LOOKUP",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "plant-characteristics",
      difficulty: "easy"
    }
  },
  {
    input: "Explain what a PLANTS symbol is",
    expected: {
      agentType: "DEFINITION_LOOKUP",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "taxonomy",
      difficulty: "easy"
    }
  },
  {
    input: "What is native status?",
    expected: {
      agentType: "DEFINITION_LOOKUP",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "plant-status",
      difficulty: "easy"
    }
  },

  // HOW_TO_GUIDE cases - "How do I..." questions
  {
    input: "How do I search for plants by state?",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "search-procedures",
      difficulty: "easy"
    }
  },
  {
    input: "How can I filter plants by wetland status?",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "search-procedures",
      difficulty: "easy"
    }
  },
  {
    input: "Steps to find native plants in California",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "search-procedures",
      difficulty: "medium"
    }
  },
  {
    input: "Guide me through searching the PLANTS database",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "high",
      searchStrategy: "broad"
    },
    metadata: {
      category: "general-usage",
      difficulty: "medium"
    }
  },
  {
    input: "How do I interpret wetland indicator codes?",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium"
    }
  },

  // COMPARISON cases - "Compare..." or "What's the difference..."
  {
    input: "What's the difference between native and introduced plants?",
    expected: {
      agentType: "COMPARISON",
      confidence: "high",
      searchStrategy: "multi-step"
    },
    metadata: {
      category: "plant-status",
      difficulty: "medium"
    }
  },
  {
    input: "Compare FACW and FAC wetland indicators",
    expected: {
      agentType: "COMPARISON",
      confidence: "high",
      searchStrategy: "multi-step"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium"
    }
  },
  {
    input: "Difference between obligate and facultative wetland plants",
    expected: {
      agentType: "COMPARISON",
      confidence: "high",
      searchStrategy: "multi-step"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "medium"
    }
  },
  {
    input: "Native vs introduced species - what's the difference?",
    expected: {
      agentType: "COMPARISON",
      confidence: "high",
      searchStrategy: "multi-step"
    },
    metadata: {
      category: "plant-status",
      difficulty: "medium"
    }
  },
  {
    input: "How do trees and shrubs differ in the database?",
    expected: {
      agentType: "COMPARISON",
      confidence: "medium",
      searchStrategy: "multi-step"
    },
    metadata: {
      category: "growth-habits",
      difficulty: "medium"
    }
  },

  // DATA_RETRIEVAL cases - "Show me..." or "List..."
  {
    input: "Show me all wetland plants in California",
    expected: {
      agentType: "DATA_RETRIEVAL",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "data-queries",
      difficulty: "medium"
    }
  },
  {
    input: "List all obligate wetland plants",
    expected: {
      agentType: "DATA_RETRIEVAL",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "data-queries",
      difficulty: "medium"
    }
  },
  {
    input: "Find native trees in Oregon",
    expected: {
      agentType: "DATA_RETRIEVAL",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "data-queries",
      difficulty: "medium"
    }
  },
  {
    input: "Give me plants with FACW status",
    expected: {
      agentType: "DATA_RETRIEVAL",
      confidence: "high",
      searchStrategy: "focused"
    },
    metadata: {
      category: "data-queries",
      difficulty: "easy"
    }
  },

  // GENERAL_QA cases - Broad, exploratory questions
  {
    input: "Tell me about the PLANTS database",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "high",
      searchStrategy: "broad"
    },
    metadata: {
      category: "general-info",
      difficulty: "easy"
    }
  },
  {
    input: "Explain plant characteristics in the database",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "high",
      searchStrategy: "broad"
    },
    metadata: {
      category: "general-info",
      difficulty: "medium"
    }
  },
  {
    input: "What kind of information does PLANTS track?",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "high",
      searchStrategy: "broad"
    },
    metadata: {
      category: "general-info",
      difficulty: "easy"
    }
  },
  {
    input: "How are wetland indicators determined?",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "medium",
      searchStrategy: "broad"
    },
    metadata: {
      category: "wetland-indicators",
      difficulty: "hard",
      notes: "Could be HOW_TO or GENERAL_QA depending on user intent"
    }
  },

  // Edge cases - Ambiguous or challenging routing decisions
  {
    input: "FACW plants",
    expected: {
      agentType: "DATA_RETRIEVAL",
      confidence: "medium",
      searchStrategy: "focused"
    },
    metadata: {
      category: "edge-cases",
      difficulty: "hard",
      notes: "Very short query, could be definition or data retrieval"
    }
  },
  {
    input: "Tell me everything about native status jurisdictions",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "medium",
      searchStrategy: "broad"
    },
    metadata: {
      category: "edge-cases",
      difficulty: "medium",
      notes: "Broad scope with 'everything' keyword"
    }
  },
  {
    input: "Why do we use wetland indicators?",
    expected: {
      agentType: "GENERAL_QA",
      confidence: "medium",
      searchStrategy: "broad"
    },
    metadata: {
      category: "edge-cases",
      difficulty: "medium",
      notes: "'Why' questions typically need broader context"
    }
  },
  {
    input: "Best way to search for rare plants?",
    expected: {
      agentType: "HOW_TO_GUIDE",
      confidence: "medium",
      searchStrategy: "focused"
    },
    metadata: {
      category: "edge-cases",
      difficulty: "hard",
      notes: "Asking for best practices/recommendations"
    }
  }
];

// Export a simplified version for quick testing
export const quickRoutingTests = routingTestCases.slice(0, 10);

// Export by category for targeted testing
export const testsByCategory = routingTestCases.reduce((acc, test) => {
  const category = test.metadata.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(test);
  return acc;
}, {} as Record<string, RoutingTestCase[]>);
