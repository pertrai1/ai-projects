import { QueryExecutor } from "../agents/query-executor.js";

async function testExecutor() {
  console.log("Testing Query Executor...\n");

  const executor = new QueryExecutor({
    dbPath: "./data/databases",
    maxResultRows: 10,
  });

  const testCases = [
    {
      name: "Simple SELECT",
      query: "SELECT * FROM users LIMIT 5;",
      validation: { isValid: true, safetyValid: true },
    },
    {
      name: "JOIN query",
      query: `
        SELECT u.name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.name
        ORDER BY order_count DESC;
      `,
      validation: { isValid: true, safetyValid: true },
    },
    {
      name: "Failed validation",
      query: "SELECT * FROM users;",
      validation: { isValid: false, safetyValid: false },
    },
    {
      name: "Mutation attempt",
      query: "DELETE FROM users;",
      validation: { isValid: true, safetyValid: true }, // Will be caught by executor
    },
  ];

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Query: ${testCase.query.trim()}\n`);

    const result = await executor.execute({
      query: testCase.query,
      validationResult: testCase.validation,
      database: "ecommerce",
    });

    console.log("Result:");
    console.log(`  Success: ${result.success}`);
    console.log(`  Execution Time: ${result.executionTime}ms`);
    console.log(`  Row Count: ${result.rowCount}`);

    if (result.success && result.data) {
      console.log(
        `  Columns: ${result.columns?.map((c) => c.name).join(", ")}`,
      );
      console.log(`  Sample Data:`);
      console.log(result.data.slice(0, 3));
      if (result.truncated) {
        console.log(`   Results truncated`);
      }
    }

    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }

  console.log("Executor tests completed!");
}

testExecutor().catch(console.error);
