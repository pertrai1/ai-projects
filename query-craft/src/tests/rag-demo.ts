#!/usr/bin/env tsx

/**
 * Demonstrate RAG retrieval in action
 */

import { config } from "dotenv";
import { SchemaLoader } from "../agents/schema-loader.js";
import { QueryGenerator } from "../agents/query-generator.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";
import { SchemaDocRetriever } from "../tools/schema-doc-retriever.js";

config();

console.log("=".repeat(80));
console.log("RAG Retrieval Demonstration");
console.log("=".repeat(80));
console.log("");

async function demonstrateRAG() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set. Please configure .env file.");
    process.exit(1);
  }

  const testQueries = [
    "Show me all users who signed up last month",
    "What are the most expensive products in stock?",
    "Find all pending orders from the last week",
  ];

  // Initialize components
  const llmClient = new LLMClient({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const specLoader = new SpecLoader("./specs");
  const schemaLoader = new SchemaLoader("./data/schemas");
  const retriever = new SchemaDocRetriever("./data/schemas", 5, 0.1);

  // Load schema
  const schemaResult = await schemaLoader.execute({ database: "ecommerce" });

  console.log("Database Schema:");
  console.log(`  Name: ${schemaResult.schemaName}`);
  console.log(`  Tables: ${schemaResult.tables.join(", ")}`);
  console.log("");

  for (const question of testQueries) {
    console.log("─".repeat(80));
    console.log(`Question: "${question}"`);
    console.log("─".repeat(80));

    // Show RAG retrieval
    console.log("\n1. RAG Document Retrieval:");
    const retrievedChunks = await retriever.retrieve(question, "ecommerce", 5);

    console.log(`   Retrieved ${retrievedChunks.length} documentation chunks`);

    if (retrievedChunks.length > 0) {
      const tables = [...new Set(retrievedChunks.map((c) => c.chunk.table))];
      console.log(`   Tables: ${tables.join(", ")}`);

      console.log("\n   Top 3 chunks:");
      for (let i = 0; i < Math.min(3, retrievedChunks.length); i++) {
        const { chunk, score } = retrievedChunks[i];
        console.log(
          `     ${i + 1}. ${chunk.table} (${
            chunk.chunkType
          }) - Score: ${score.toFixed(3)}`
        );
        console.log(
          `        ${chunk.content.substring(0, 100).replace(/\n/g, " ")}...`
        );
      }
    }

    // Now generate query with retrieval metadata
    console.log("\n2. Query Generation with RAG:");

    // Force RAG mode by setting useRetrieval flag
    const queryGenerator = new QueryGenerator(llmClient, specLoader);
    const result = await queryGenerator.execute({
      question,
      schema: schemaResult.schema,
      database: "ecommerce",
      useRetrieval: true, // Force RAG even for small schema
    });

    console.log(`   Generated Query:`);
    console.log(`   ${result.query.split("\n")[0]}...`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Tables Used: ${result.tablesUsed.join(", ")}`);

    if (result.retrievalMetadata) {
      console.log(
        `   Retrieval Strategy: ${result.retrievalMetadata.strategy}`
      );
      if (result.retrievalMetadata.chunksRetrieved) {
        console.log(
          `   Chunks Retrieved: ${result.retrievalMetadata.chunksRetrieved}`
        );
        console.log(
          `   Avg Relevance: ${result.retrievalMetadata.avgRelevanceScore?.toFixed(
            3
          )}`
        );
      }
    }

    console.log("");
  }

  console.log("=".repeat(80));
  console.log("RAG Demonstration Complete");
  console.log("=".repeat(80));
}

demonstrateRAG().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
