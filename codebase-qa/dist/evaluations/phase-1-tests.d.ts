/**
 * Phase 1 Test Cases and Experiments
 *
 * Learning focus:
 * - Run chunking strategies on real code
 * - Compare retrieval quality (precision, recall)
 * - Measure token efficiency
 * - Understand trade-offs
 *
 * This module sets up the experiments to learn about chunking
 */
/**
 * Test query for evaluation
 */
export interface TestQuery {
    query: string;
    intent: string;
    expectedFunctions: string[];
    expectedFiles: string[];
}
/**
 * Retrieval quality metrics
 */
export interface RetrievalMetrics {
    precision: number;
    recall: number;
    mrr: number;
    avgRelevanceScore: number;
}
/**
 * Chunking experiment result
 */
export interface ChunkingExperiment {
    strategy: string;
    timestamp: string;
    statistics: {
        totalChunks: number;
        avgChunkSize: number;
        tokenEfficiency: number;
    };
    retrieval: {
        avgSearchTime: number;
        metrics: RetrievalMetrics;
    };
    tradeoffs: {
        speedVsQuality: string;
        tokenVsRecall: string;
        complexity: string;
    };
}
/**
 * Run Phase 1 chunking experiments
 */
export declare function runChunkingExperiments(codebaseDir: string, testQueries: TestQuery[]): Promise<ChunkingExperiment[]>;
/**
 * Example test queries for Phase 1
 * These would be drawn from actual codebase
 */
export declare function getExampleTestQueries(): TestQuery[];
//# sourceMappingURL=phase-1-tests.d.ts.map