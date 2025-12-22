import { QueryGenerator } from "../agents/query-generator.js";
import { SchemaLoader } from "../agents/schema-loader.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";
import { config } from "dotenv";

config();

async function testQueryGenerator() {
  console.log("Testing Query Generator...\n");

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not found in environment");
    console.error("Please create a .env file with your API key");
    process.exit(1);
  }

  // Initialize dependencies
  const llmClient = new LLMClient({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const specLoader = new SpecLoader("./specs");
  const schemaLoader = new SchemaLoader("./data/schemas");
  const queryGenerator = new QueryGenerator(llmClient, specLoader);

  // Load the ecommerce schema
  console.log("Loading ecommerce schema...");
  const schemaResult = await schemaLoader.execute({ database: "ecommerce" });

  if (schemaResult.validationStatus !== "valid") {
    console.error("❌ Schema validation failed");
    process.exit(1);
  }

  console.log("Schema loaded successfully\n");
  console.log("Available tables:", schemaResult.tables.join(", "));
  console.log("\n" + "=".repeat(60) + "\n");

  // Test cases
  const testCases = [
    {
      name: "Simple SELECT",
      question: "Show me all users",
    },
    {
      name: "Filtered SELECT",
      question: "Find all products that cost more than $50",
    },
    {
      name: "JOIN query",
      question: "Show me all customers who placed orders in the last 7 days",
    },
    {
      name: "Aggregation",
      question: "What is the total revenue from all orders?",
    },
    {
      name: "Complex JOIN with aggregation",
      question: "Show me the top 5 customers by total order amount",
    },
  ];

  // Run each test case
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Question: "${testCase.question}"\n`);

    try {
      const result = await queryGenerator.execute({
        question: testCase.question,
        schema: schemaResult.schema,
      });

      console.log("Generated Query:");
      console.log("```sql");
      console.log(result.query);
      console.log("```\n");

      console.log("Explanation:", result.explanation);
      console.log("Confidence:", result.confidence);
      console.log("Tables Used:", result.tablesUsed.join(", "));

      if (result.assumptions && result.assumptions.length > 0) {
        console.log("Assumptions:", result.assumptions.join("; "));
      }

      console.log("\n" + "=".repeat(60) + "\n");
    } catch (error) {
      console.error("❌ Test failed:", error);
      console.log("\n" + "=".repeat(60) + "\n");
    }
  }

  console.log("All tests completed!");
}

testQueryGenerator().catch(console.error);
