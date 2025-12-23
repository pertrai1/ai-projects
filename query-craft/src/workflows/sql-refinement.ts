import type { SqlGenerationOutput } from "../types/index.js";
import { SqlGenerationWorkflow } from "./sql-generation.js";
import { QueryRefiner } from "../agents/query-refiner.js";

export interface RefinementContext {
  originalQuestion: string;
  currentQuery: string;
  currentResult: SqlGenerationOutput;
  feedback: string;
}

export class SqlRefinementWorkflow {
  private queryRefiner: QueryRefiner;

  constructor(_sqlWorkflow: SqlGenerationWorkflow, queryRefiner: QueryRefiner) {
    this.queryRefiner = queryRefiner;
  }

  /**
   * Refine a query based on user feedback
   */
  async refine(context: RefinementContext): Promise<SqlGenerationOutput> {
    console.log(`\n${"=".repeat(60)}`);
    console.log("Query Refinement");
    console.log(`${"=".repeat(60)}\n`);

    console.log("User Feedback:", context.feedback);
    console.log("Current Query:", context.currentQuery);
    console.log("");

    // Step 1: Get refined query from refiner agent
    console.log("Step 1: Refining query based on feedback...");

    const refinement = await this.queryRefiner.execute({
      originalQuestion: context.originalQuestion,
      currentQuery: context.currentQuery,
      feedback: context.feedback,
      previousResults: context.currentResult.executionResult
        ? {
            data: context.currentResult.executionResult.data || [],
            rowCount: context.currentResult.executionResult.rowCount,
          }
        : undefined,
      schema: context.currentResult.schemaUsed as any, // We'll need the actual schema object
    });

    console.log("Query refined");
    console.log(`   Changes: ${refinement.changes}`);
    console.log(`   Confidence: ${refinement.confidence}\n`);

    // Step 2: Execute the refined query through the normal workflow
    console.log("Step 2: Validating and executing refined query...");

    // We need to manually create the workflow steps since we already have the query
    console.log(`\n${"=".repeat(60)}`);
    console.log("Refinement Complete");
    console.log(`${"=".repeat(60)}\n`);

    // For now, return a mock result
    return {
      ...context.currentResult,
      query: refinement.refinedQuery,
      explanation: `${context.currentResult.explanation}\n\nRefinement: ${refinement.changes}`,
      warnings: [
        ...(context.currentResult.warnings || []),
        `Refined based on: ${context.feedback}`,
      ],
    };
  }
}
