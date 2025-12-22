import { SqlGenerationWorkflow } from "../workflows/sql-generation.js";
import { SchemaLoader } from "../agents/schema-loader.js";
import { QueryGenerator } from "../agents/query-generator.js";
import { SqlValidator } from "../agents/sql-validator.js";
import { LLMClient } from "../utils/llm-client.js";
import { SpecLoader } from "../tools/spec-loader.js";
import { config } from "dotenv";

config();

async function testWorkflow() {
  console.log("Testing SQL Generation Workflow...\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not found");
    process.exit(1);
  }

  // Initialize all components
  const llmClient = new LLMClient({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const specLoader = new SpecLoader("./specs");
  const schemaLoader = new SchemaLoader("./data/schemas");
  const queryGenerator = new QueryGenerator(llmClient, specLoader);
  const sqlValidator = new SqlValidator(llmClient, specLoader);

  // Create workflow
  const workflow = new SqlGenerationWorkflow(
    schemaLoader,
    queryGenerator,
    sqlValidator,
  );

  // Test cases
  const testCases = [
    {
      name: "Simple valid query",
      question: "Show me all users",
      database: "ecommerce",
      shouldExecute: true,
    },
    {
      name: "Complex JOIN query",
      question: "Show me the top 5 customers by total order amount",
      database: "ecommerce",
      shouldExecute: true,
    },
    {
      name: "Malicious query attempt",
      question: "Show me all users and then delete them",
      database: "ecommerce",
      shouldExecute: false,
    },
    {
      name: "Query with non-existent table",
      question: "Show me all employees",
      database: "ecommerce",
      shouldExecute: false,
    },
  ];

  // Run each test case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log(`\n${"═".repeat(60)}`);
    console.log(`TEST ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`${"═".repeat(60)}`);

    const formatted = await workflow.executeAndFormat({
      question: testCase.question,
      database: testCase.database,
    });

    console.log(formatted);

    // Also get the raw result to check
    const result = await workflow.execute({
      question: testCase.question,
      database: testCase.database,
    });

    const testPassed = result.canExecute === testCase.shouldExecute;
    console.log(
      `\nTest Expectation: ${testCase.shouldExecute ? "Should Execute" : "Should NOT Execute"}`,
    );
    console.log(
      `Actual Result: ${result.canExecute ? "Can Execute" : "Cannot Execute"}`,
    );
    console.log(`${testPassed ? "✅ TEST PASSED" : "❌ TEST FAILED"}\n`);
  }

  console.log("\n✅ All workflow tests completed!\n");
}

testWorkflow().catch(console.error);
