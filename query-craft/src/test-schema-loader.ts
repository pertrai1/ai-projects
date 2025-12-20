import { SchemaLoader } from "./agents/schema-loader.js";

async function testSchemaLoader() {
  console.log("Testing Schema Loader...\n");

  const loader = new SchemaLoader("./data/schemas");

  // Test 1: Load valid schema
  console.log("Test 1: Loading ecommerce schema...");
  const result = await loader.execute({ database: "ecommerce" });

  console.log("Schema Name:", result.schemaName);
  console.log("Validation Status:", result.validationStatus);
  console.log("Tables:", result.tables);
  console.log("Relationships:", result.relationships.length);

  if (result.validationStatus === "valid") {
    console.log("\nSchema loaded successfully!\n");

    // Show formatted schema (what will be sent to LLM)
    console.log("Formatted Schema for LLM:");
    console.log("=".repeat(60));
    console.log(loader.getFormattedSchema(result.schema));
    console.log("=".repeat(60));
  } else {
    console.log("\n❌ Schema validation failed!\n");
  }

  // Test 2: Try to load non-existent schema
  console.log("\nTest 2: Loading non-existent schema...");
  const invalidResult = await loader.execute({ database: "nonexistent" });
  console.log("Validation Status:", invalidResult.validationStatus);

  if (invalidResult.validationStatus === "invalid") {
    console.log("Correctly rejected invalid schema\n");
  }
}

testSchemaLoader().catch(console.error);
