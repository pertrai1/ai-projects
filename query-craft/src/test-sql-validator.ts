import { SqlValidator } from "./agents/sql-validator.js";
import { SchemaLoader } from "./agents/schema-loader.js";
import { LLMClient } from "./utils/llm-client.js";
import { SpecLoader } from "./tools/spec-loader.js";
import { config } from "dotenv";

config();

async function testSqlValidator() {
  console.log("Testing SQL Validator...\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not found");
    process.exit(1);
  }

  // Initialize
  const llmClient = new LLMClient({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const specLoader = new SpecLoader("./specs");
  const schemaLoader = new SchemaLoader("./data/schemas");
  const sqlValidator = new SqlValidator(llmClient, specLoader);

  // Load schema
  const schemaResult = await schemaLoader.execute({ database: "ecommerce" });

  if (schemaResult.validationStatus !== "valid") {
    console.error("❌ Schema validation failed");
    process.exit(1);
  }

  console.log("Schema loaded\n");
  console.log("=".repeat(60) + "\n");

  // Test cases
  const testCases = [
    {
      name: "Valid SELECT query",
      query: "SELECT id, name, email FROM users WHERE id = 1;",
      shouldPass: true,
    },
    {
      name: "Valid JOIN query",
      query: `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;`,
      shouldPass: true,
    },
    {
      name: "SQL Injection attempt",
      query: "SELECT * FROM users WHERE id = 1; DROP TABLE users;",
      shouldPass: false,
    },
    {
      name: "DELETE statement",
      query: 'DELETE FROM orders WHERE status = "cancelled";',
      shouldPass: false,
    },
    {
      name: "Non-existent table",
      query: "SELECT * FROM fake_table;",
      shouldPass: false,
    },
    {
      name: "Non-existent column",
      query: "SELECT fake_column FROM users;",
      shouldPass: false,
    },
    {
      name: "System table access",
      query: "SELECT * FROM pg_user;",
      shouldPass: false,
    },
    {
      name: "UPDATE statement",
      query: 'UPDATE users SET name = "hacker" WHERE id = 1;',
      shouldPass: false,
    },
  ];

  // Run tests
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Query: ${testCase.query}`);
    console.log(`Expected: ${testCase.shouldPass ? "PASS" : "FAIL"}\n`);

    const result = await sqlValidator.execute({
      query: testCase.query,
      schema: schemaResult.schema,
    });

    console.log("Validation Result:");
    console.log(`  Is Valid: ${result.isValid}`);
    console.log(`  Syntax Valid: ${result.syntaxValid}`);
    console.log(`  Schema Valid: ${result.schemaValid}`);
    console.log(`  Safety Valid: ${result.safetyValid}`);
    console.log(`  Complexity: ${result.complexityScore}`);

    if (result.errors.length > 0) {
      console.log("  Errors:");
      result.errors.forEach((err) => console.log(`    - ${err}`));
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log("  Warnings:");
      result.warnings.forEach((warn) => console.log(`    - ${warn}`));
    }

    // Check if result matches expectation
    const testPassed = result.isValid === testCase.shouldPass;
    console.log(
      `\n${testPassed ? "✅" : "❌"} Test ${testPassed ? "PASSED" : "FAILED"}`,
    );

    console.log("\n" + "=".repeat(60) + "\n");
  }

  console.log("All validation tests completed!");
}

testSqlValidator().catch(console.error);
