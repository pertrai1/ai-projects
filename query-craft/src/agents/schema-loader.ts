import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type {
  SchemaLoaderInput,
  SchemaLoaderOutput,
  DatabaseSchema,
} from "../types/index.js";

export class SchemaLoader {
  private schemasDir: string;

  constructor(schemasDir: string = "./data/schemas") {
    this.schemasDir = schemasDir;
  }

  /**
   * Load and validate a database schema
   * This is a deterministic agent - no LLM needed
   */
  async execute(input: SchemaLoaderInput): Promise<SchemaLoaderOutput> {
    const schemaPath = `${this.schemasDir}/${input.database}.json`;

    // Validation 1: Schema file must exist
    if (!existsSync(schemaPath)) {
      return {
        schemaName: input.database,
        schema: {} as DatabaseSchema,
        tables: [],
        relationships: [],
        validationStatus: "invalid",
      };
    }

    try {
      // Load schema file
      const content = await readFile(schemaPath, "utf-8");

      // Validation 2: Must be valid JSON
      let schema: DatabaseSchema;
      try {
        schema = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Invalid JSON in schema file: ${parseError}`);
      }

      // Validation 3: Required fields must be present
      this.validateSchemaStructure(schema);

      // Validation 4: Column types must be valid SQL types
      this.validateColumnTypes(schema);

      // Validation 5: No dangerous mutations allowed
      this.validateNoMutations(schema);

      // Extract table names and relationships
      const tables = schema.tables.map((t) => t.name);
      const relationships = schema.relationships || [];

      return {
        schemaName: schema.name,
        schema,
        tables,
        relationships,
        validationStatus: "valid",
      };
    } catch (error) {
      console.error(`Schema validation failed: ${error}`);

      return {
        schemaName: input.database,
        schema: {} as DatabaseSchema,
        tables: [],
        relationships: [],
        validationStatus: "invalid",
      };
    }
  }

  /**
   * Validate schema has required structure
   */
  private validateSchemaStructure(schema: DatabaseSchema): void {
    if (!schema.name) {
      throw new Error("Schema must have a name");
    }

    if (!schema.tables || !Array.isArray(schema.tables)) {
      throw new Error("Schema must have a tables array");
    }

    if (schema.tables.length === 0) {
      throw new Error("Schema must have at least one table");
    }

    // Validate each table
    for (const table of schema.tables) {
      if (!table.name) {
        throw new Error("Table must have a name");
      }

      if (!table.columns || !Array.isArray(table.columns)) {
        throw new Error(`Table ${table.name} must have a columns array`);
      }

      if (table.columns.length === 0) {
        throw new Error(`Table ${table.name} must have at least one column`);
      }

      // Validate each column
      for (const column of table.columns) {
        if (!column.name) {
          throw new Error(`Column in table ${table.name} must have a name`);
        }

        if (!column.type) {
          throw new Error(
            `Column ${column.name} in table ${table.name} must have a type`,
          );
        }
      }
    }
  }

  /**
   * Validate column types are valid SQL types
   */
  private validateColumnTypes(schema: DatabaseSchema): void {
    const validTypes = [
      "integer",
      "bigint",
      "smallint",
      "varchar",
      "text",
      "char",
      "decimal",
      "numeric",
      "real",
      "double precision",
      "boolean",
      "bool",
      "date",
      "timestamp",
      "timestamptz",
      "time",
      "timetz",
      "json",
      "jsonb",
      "uuid",
      "bytea",
    ];

    for (const table of schema.tables) {
      for (const column of table.columns) {
        // Extract base type (e.g., "varchar(255)" -> "varchar")
        const baseType = column.type.split("(")[0].toLowerCase().trim();

        if (!validTypes.includes(baseType)) {
          throw new Error(
            `Invalid column type "${column.type}" for ${table.name}.${column.name}. ` +
              `Valid types: ${validTypes.join(", ")}`,
          );
        }
      }
    }
  }

  /**
   * Validate schema doesn't include dangerous mutation operations
   */
  private validateNoMutations(schema: DatabaseSchema): void {
    const schemaJson = JSON.stringify(schema).toLowerCase();

    const dangerousKeywords = [
      "trigger",
      "procedure",
      "function",
      "drop",
      "truncate",
      "delete",
      "update",
      "insert",
    ];

    for (const keyword of dangerousKeywords) {
      if (schemaJson.includes(keyword)) {
        throw new Error(
          `Schema contains dangerous keyword "${keyword}". ` +
            `Schemas should only define structure, not mutations.`,
        );
      }
    }
  }

  /**
   * Get formatted schema for LLM context
   * Returns a human-readable string representation
   */
  getFormattedSchema(schema: DatabaseSchema): string {
    let formatted = `Database: ${schema.name}\n`;

    if (schema.description) {
      formatted += `Description: ${schema.description}\n`;
    }

    formatted += "\nTables:\n\n";

    for (const table of schema.tables) {
      formatted += `${table.name}:\n`;

      if (table.description) {
        formatted += `  Description: ${table.description}\n`;
      }

      formatted += "  Columns:\n";

      for (const column of table.columns) {
        let colLine = `    - ${column.name}: ${column.type}`;

        if (column.primaryKey) colLine += " [PRIMARY KEY]";
        if (column.unique) colLine += " [UNIQUE]";
        if (column.nullable === false) colLine += " [NOT NULL]";
        if (column.default) colLine += ` [DEFAULT: ${column.default}]`;
        if (column.foreignKey) {
          colLine += ` [FK -> ${column.foreignKey.table}.${column.foreignKey.column}]`;
        }

        formatted += colLine + "\n";

        if (column.description) {
          formatted += `      # ${column.description}\n`;
        }
      }

      formatted += "\n";
    }

    // Add relationships if present
    if (schema.relationships && schema.relationships.length > 0) {
      formatted += "Relationships:\n";
      for (const rel of schema.relationships) {
        formatted += `  - ${rel.fromTable}.${rel.fromColumn} -> ${rel.toTable}.${rel.toColumn} (${rel.type})\n`;
        if (rel.description) {
          formatted += `    # ${rel.description}\n`;
        }
      }
    }

    return formatted;
  }
}
