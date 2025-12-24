/**
 * Configuration for Schema Documentation RAG
 */

export interface RAGConfig {
  enabled: boolean;
  topK: number;
  relevanceThreshold: number;
  tableThreshold: number;
  debugMode: boolean;
}

const defaultConfig: RAGConfig = {
  enabled: true,
  topK: 5,
  relevanceThreshold: 0.3,
  tableThreshold: 10,
  debugMode: false,
};

/**
 * Load RAG configuration from environment variables
 */
export function loadRAGConfig(): RAGConfig {
  return {
    enabled: process.env.ENABLE_DOC_RETRIEVAL === "true" ||
             process.env.ENABLE_DOC_RETRIEVAL === undefined,
    topK: parseInt(process.env.DOC_RETRIEVAL_TOP_K || "5", 10),
    relevanceThreshold: parseFloat(
      process.env.DOC_RELEVANCE_THRESHOLD || "0.3"
    ),
    tableThreshold: parseInt(
      process.env.RETRIEVAL_TABLE_THRESHOLD || "10",
      10
    ),
    debugMode: process.env.RAG_DEBUG_MODE === "true",
  };
}

/**
 * Get default RAG configuration
 */
export function getDefaultRAGConfig(): RAGConfig {
  return { ...defaultConfig };
}

/**
 * Determine whether to use retrieval for a given schema
 */
export function shouldUseRetrieval(
  tableCount: number,
  config: RAGConfig = loadRAGConfig()
): boolean {
  return config.enabled && tableCount >= config.tableThreshold;
}
