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
import { readFile, discoverCodeFiles } from "../utils/file-discovery.js";
import { chunkCodebase } from "../retrieval/code-chunker.js";
import { Embedder } from "../vector-store/embedding.js";
import { VectorStore } from "../vector-store/vector-store.js";
import { globalLogger } from "../utils/logger.js";
/**
 * Run Phase 1 chunking experiments
 */
export async function runChunkingExperiments(codebaseDir, testQueries) {
    globalLogger.info("Starting Phase 1 chunking experiments...");
    // Discover code files
    const files = discoverCodeFiles(codebaseDir, {
        extensions: [".ts", ".tsx", ".js"],
    });
    globalLogger.info(`Discovered ${files.length} files`, {
        files: files.map((f) => f.path),
    });
    // Read file contents
    const fileContents = new Map();
    for (const file of files) {
        try {
            const content = readFile(file.path);
            fileContents.set(file.path, content);
        }
        catch (error) {
            globalLogger.warn(`Failed to read ${file.path}`, {
                error: String(error),
            });
        }
    }
    const embedder = new Embedder({ dimension: 384, model: "mock" });
    const experiments = [];
    // Test each strategy
    const strategies = [
        { name: "fixed", config: { strategy: "fixed", maxChars: 500 } },
        {
            name: "semantic",
            config: { strategy: "semantic", maxTokens: 1000 },
        },
        {
            name: "semantic-lookahead",
            config: { strategy: "semantic-with-lookahead", maxTokens: 1000 },
        },
    ];
    for (const { name, config } of strategies) {
        globalLogger.info(`Testing ${name} chunking strategy...`);
        try {
            // Chunk the codebase
            const chunkResult = await chunkCodebase(fileContents, config);
            // Index chunks
            const vectorStore = new VectorStore(embedder, false);
            await vectorStore.indexBatch(chunkResult.chunks);
            // Run test queries
            let totalSearchTime = 0;
            const queryResults = [];
            for (const testQuery of testQueries) {
                const searchResult = await vectorStore.search(testQuery.query, 10);
                totalSearchTime += searchResult.searchTime;
                // Calculate metrics for this query
                const metrics = calculateQueryMetrics(searchResult.results, testQuery);
                queryResults.push(metrics);
            }
            // Aggregate metrics
            const avgMetrics = {
                precision: queryResults.reduce((sum, m) => sum + m.precision, 0) /
                    queryResults.length,
                recall: queryResults.reduce((sum, m) => sum + m.recall, 0) /
                    queryResults.length,
                mrr: queryResults.reduce((sum, m) => sum + m.mrr, 0) / queryResults.length,
                avgRelevanceScore: queryResults.reduce((sum, m) => sum + m.avgRelevanceScore, 0) /
                    queryResults.length,
            };
            // Token efficiency
            const tokenEfficiency = (chunkResult.chunks.length * 1000) /
                (chunkResult.statistics.totalTokens || 1);
            // Create tradeoff analysis
            const tradeoffs = analyzeTradeoffs(name, chunkResult.statistics, avgMetrics, totalSearchTime / testQueries.length);
            experiments.push({
                strategy: name,
                timestamp: new Date().toISOString(),
                statistics: {
                    totalChunks: chunkResult.statistics.totalChunks,
                    avgChunkSize: chunkResult.statistics.avgChunkSize,
                    tokenEfficiency,
                },
                retrieval: {
                    avgSearchTime: totalSearchTime / testQueries.length,
                    metrics: avgMetrics,
                },
                tradeoffs,
            });
            globalLogger.info(`${name} experiment complete`, {
                chunks: chunkResult.statistics.totalChunks,
                precision: avgMetrics.precision.toFixed(2),
                recall: avgMetrics.recall.toFixed(2),
            });
        }
        catch (error) {
            globalLogger.error(`Experiment failed for ${name}`, {
                error: String(error),
            });
        }
    }
    return experiments;
}
/**
 * Calculate retrieval metrics for a single query
 */
function calculateQueryMetrics(retrievedChunks, testQuery) {
    // Extract function names from retrieved chunks
    const retrievedFunctions = new Set();
    const retrievedFiles = new Set();
    for (const chunk of retrievedChunks) {
        if (chunk.metadata.scopeName) {
            retrievedFunctions.add(chunk.metadata.scopeName);
        }
        retrievedFiles.add(chunk.metadata.filePath);
    }
    // Calculate metrics
    const expectedFunctionSet = new Set(testQuery.expectedFunctions);
    const retrievedFunctionSet = retrievedFunctions;
    // Precision: of retrieved, how many are relevant?
    const relevantRetrieved = Array.from(retrievedFunctionSet).filter((f) => expectedFunctionSet.has(f)).length;
    const precision = retrievedFunctionSet.size > 0
        ? relevantRetrieved / retrievedFunctionSet.size
        : 0;
    // Recall: of relevant, how many did we retrieve?
    const recall = expectedFunctionSet.size > 0
        ? relevantRetrieved / expectedFunctionSet.size
        : 0;
    // MRR: rank of first relevant result
    let mrr = 0;
    for (let i = 0; i < retrievedChunks.length; i++) {
        const chunk = retrievedChunks[i];
        if (chunk.metadata.scopeName &&
            expectedFunctionSet.has(chunk.metadata.scopeName)) {
            mrr = 1 / (i + 1);
            break;
        }
    }
    // Average relevance score
    const avgRelevanceScore = retrievedChunks.length > 0
        ? retrievedChunks.reduce((sum, c) => sum + (c.relevanceScore || 0), 0) / retrievedChunks.length
        : 0;
    return {
        precision,
        recall,
        mrr,
        avgRelevanceScore,
    };
}
/**
 * Analyze trade-offs for a chunking strategy
 */
function analyzeTradeoffs(strategy, stats, metrics, searchTime) {
    console.log(metrics);
    let speedVsQuality = "";
    let tokenVsRecall = "";
    let complexity = "";
    if (searchTime < 10) {
        speedVsQuality = "Fast search, quality TBD";
    }
    else if (searchTime < 50) {
        speedVsQuality = "Balanced speed and quality";
    }
    else {
        speedVsQuality = "Slower but potentially better quality";
    }
    if (stats.avgChunkSize < 500) {
        tokenVsRecall = "Small chunks, many results, high recall risk";
    }
    else if (stats.avgChunkSize < 2000) {
        tokenVsRecall = "Moderate chunk size, balanced token usage";
    }
    else {
        tokenVsRecall = "Large chunks, fewer results, may miss relevant code";
    }
    switch (strategy) {
        case "fixed":
            complexity = "Simple, predictable, may split semantic units";
            break;
        case "semantic":
            complexity = "Semantically correct, variable size, slower to compute";
            break;
        case "semantic-lookahead":
            complexity = "Better context, more complex, slowest";
            break;
    }
    return {
        speedVsQuality,
        tokenVsRecall,
        complexity,
    };
}
/**
 * Example test queries for Phase 1
 * These would be drawn from actual codebase
 */
export function getExampleTestQueries() {
    return [
        {
            query: "How does file discovery work?",
            intent: "IMPLEMENTATION",
            expectedFunctions: ["discoverCodeFiles", "walkDir"],
            expectedFiles: ["src/utils/file-discovery.ts"],
        },
        {
            query: "What functions exist for parsing code?",
            intent: "ARCHITECTURE",
            expectedFunctions: ["parseFile", "extractFunctions", "extractClasses"],
            expectedFiles: ["src/parser/ast-parser.ts"],
        },
        {
            query: "Where is the Embedder class defined?",
            intent: "LOCATION",
            expectedFunctions: ["Embedder"],
            expectedFiles: ["src/vector-store/embedding.ts"],
        },
        {
            query: "How are chunks stored and retrieved?",
            intent: "IMPLEMENTATION",
            expectedFunctions: ["index", "search", "indexBatch"],
            expectedFiles: ["src/vector-store/vector-store.ts"],
        },
    ];
}
//# sourceMappingURL=phase-1-tests.js.map