#!/usr/bin/env tsx

/**
 * Test schema documentation retriever
 */

import { SchemaDocRetriever } from "../tools/schema-doc-retriever.js";
import { SchemaDocLoader } from "../tools/schema-doc-loader.js";

console.log("=".repeat(60));
console.log("Schema Documentation Retriever Test");
console.log("=".repeat(60));
console.log("");

async function testDocumentationLoader() {
  console.log("Test 1: Document Loading and Chunking");
  console.log("-".repeat(60));

  const loader = new SchemaDocLoader("./data/schemas");
  const chunks = await loader.loadDocumentation("ecommerce");

  console.log(`✓ Loaded ${chunks.length} documentation chunks`);
  console.log(
    `✓ Tables documented: ${[...new Set(chunks.map((c) => c.table))].join(
      ", "
    )}`
  );

  // Verify chunk types
  const chunkTypes = [...new Set(chunks.map((c) => c.chunkType))];
  console.log(`✓ Chunk types: ${chunkTypes.join(", ")}`);

  // Show sample chunks
  console.log("\nSample chunks:");
  const sample = chunks.slice(0, 3);
  for (const chunk of sample) {
    console.log(
      `  - ${chunk.table} (${chunk.chunkType}): ${chunk.content.substring(
        0,
        80
      )}...`
    );
  }

  console.log("");
  return chunks.length > 0;
}

async function testBasicRetrieval() {
  console.log("Test 2: Basic Retrieval");
  console.log("-".repeat(60));

  const retriever = new SchemaDocRetriever("./data/schemas", 5, 0.1);

  const testQueries = [
    "Show me all users who signed up last month",
    "What are the total sales by product?",
    "Find all orders for a specific customer",
    "Show recent product inventory",
  ];

  let totalSuccess = 0;

  for (const question of testQueries) {
    const results = await retriever.retrieve(question, "ecommerce");

    console.log(`\nQuery: "${question}"`);
    console.log(`  Retrieved: ${results.length} chunks`);

    if (results.length > 0) {
      const tables = [...new Set(results.map((r) => r.chunk.table))];
      console.log(`  Tables: ${tables.join(", ")}`);
      console.log(`  Top score: ${results[0].score.toFixed(3)}`);
      console.log(
        `  Avg score: ${(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        ).toFixed(3)}`
      );

      totalSuccess++;
    } else {
      console.log("  ⚠ No chunks retrieved");
    }
  }

  const successRate = (totalSuccess / testQueries.length) * 100;
  console.log(
    `\n✓ Success rate: ${successRate}% (${totalSuccess}/${testQueries.length} queries)`
  );
  console.log("");

  return successRate >= 75; // Expect at least 75% success rate
}

async function testRelevanceScoring() {
  console.log("Test 3: Relevance Scoring");
  console.log("-".repeat(60));

  const retriever = new SchemaDocRetriever("./data/schemas", 10, 0.0);

  // Test that user-related query retrieves user docs
  const userQuery = "Show me all users who registered last week";
  const userResults = await retriever.retrieve(userQuery, "ecommerce");

  const userChunks = userResults.filter((r) => r.chunk.table === "users");
  const hasUserDocs = userChunks.length > 0;

  console.log(`Query about users: "${userQuery}"`);
  console.log(`  User chunks retrieved: ${userChunks.length}`);
  console.log(`  ${hasUserDocs ? "✓" : "✗"} User documentation was retrieved`);

  // Test that product-related query retrieves product docs
  const productQuery = "What products are in stock?";
  const productResults = await retriever.retrieve(productQuery, "ecommerce");

  const productChunks = productResults.filter(
    (r) => r.chunk.table === "products"
  );
  const hasProductDocs = productChunks.length > 0;

  console.log(`\nQuery about products: "${productQuery}"`);
  console.log(`  Product chunks retrieved: ${productChunks.length}`);
  console.log(
    `  ${hasProductDocs ? "✓" : "✗"} Product documentation was retrieved`
  );

  console.log("");
  return hasUserDocs && hasProductDocs;
}

async function testRelationshipExpansion() {
  console.log("Test 4: Relationship Expansion");
  console.log("-".repeat(60));

  const retriever = new SchemaDocRetriever("./data/schemas", 5, 0.1);

  // Query that should trigger relationship expansion
  const query = "Show user orders with product details";
  const results = await retriever.retrieve(query, "ecommerce");

  const tables = [...new Set(results.map((r) => r.chunk.table))];

  console.log(`Query: "${query}"`);
  console.log(`  Tables retrieved: ${tables.join(", ")}`);

  // Should include related tables (users, orders, products)
  const expectedTables = ["users", "orders", "products"];
  const coverage = expectedTables.filter((t) => tables.includes(t)).length;

  console.log(
    `  Coverage: ${coverage}/${expectedTables.length} expected tables`
  );
  console.log(`  ${coverage >= 2 ? "✓" : "✗"} Relationship expansion working`);

  console.log("");
  return coverage >= 2;
}

async function runAllTests() {
  const results: boolean[] = [];

  try {
    results.push(await testDocumentationLoader());
  } catch (error) {
    console.error("Test 1 failed:", error);
    results.push(false);
  }

  try {
    results.push(await testBasicRetrieval());
  } catch (error) {
    console.error("Test 2 failed:", error);
    results.push(false);
  }

  try {
    results.push(await testRelevanceScoring());
  } catch (error) {
    console.error("Test 3 failed:", error);
    results.push(false);
  }

  try {
    results.push(await testRelationshipExpansion());
  } catch (error) {
    console.error("Test 4 failed:", error);
    results.push(false);
  }

  console.log("=".repeat(60));
  console.log("Test Summary");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("\n✅ All tests passed!\n");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed\n");
    process.exit(1);
  }
}

runAllTests();
