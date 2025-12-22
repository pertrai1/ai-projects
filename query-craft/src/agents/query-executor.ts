import Database from "better-sqlite3";
import type {
  QueryExecutorInput,
  QueryExecutorOutput,
} from "../types/index.js";

export class QueryExecutor {
  private maxResultRows: number;
  private queryTimeout: number;
  private dbPath: string;

  constructor(
    config: {
      maxResultRows?: number;
      queryTimeout?: number;
      dbPath?: string;
    } = {},
  ) {
    this.maxResultRows = config.maxResultRows || 100;
    this.queryTimeout = config.queryTimeout || 5000;
    this.dbPath = config.dbPath || "./data/databases";
  }

  /**
   * Execute a validated SQL query safely
   */
  async execute(input: QueryExecutorInput): Promise<QueryExecutorOutput> {
    // GUARDRAIL 1: Check validation passed
    if (
      !input.validationResult.isValid ||
      !input.validationResult.safetyValid
    ) {
      return {
        success: false,
        executionTime: 0,
        rowCount: 0,
        error: "Query failed validation - execution blocked",
        truncated: false,
      };
    }

    // GUARDRAIL 2: Double-check for mutations (paranoid mode)
    if (this.containsMutation(input.query)) {
      return {
        success: false,
        executionTime: 0,
        rowCount: 0,
        error: "SECURITY VIOLATION: Mutation detected at execution time",
        truncated: false,
      };
    }

    try {
      // Open database in readonly mode
      const db = new Database(`${this.dbPath}/${input.database}.db`, {
        readonly: true, // GUARDRAIL 3: Read-only mode
        fileMustExist: true,
      });

      // Set timeout
      db.pragma(`busy_timeout = ${this.queryTimeout}`);

      const startTime = Date.now();

      // Execute query
      const stmt = db.prepare(input.query);
      const rows = stmt.all();

      const executionTime = Date.now() - startTime;

      // Get column info
      const columns = stmt.columns().map((col) => ({
        name: col.name,
        type: col.type || "unknown",
      }));

      // GUARDRAIL 4: Limit result size
      const truncated = rows.length > this.maxResultRows;
      const data = rows.slice(0, this.maxResultRows);

      db.close();

      return {
        success: true,
        executionTime,
        rowCount: rows.length,
        data,
        columns,
        truncated,
      };
    } catch (error: any) {
      return {
        success: false,
        executionTime: 0,
        rowCount: 0,
        error: `Execution error: ${error.message}`,
        truncated: false,
      };
    }
  }

  /**
   * Additional safety check for mutations
   */
  private containsMutation(query: string): boolean {
    const mutations = [
      "INSERT",
      "UPDATE",
      "DELETE",
      "DROP",
      "TRUNCATE",
      "ALTER",
      "CREATE",
      "REPLACE",
    ];

    const queryUpper = query.toUpperCase();
    return mutations.some((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`);
      return regex.test(queryUpper);
    });
  }
}
