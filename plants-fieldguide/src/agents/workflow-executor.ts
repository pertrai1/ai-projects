import type { WorkflowSpec } from "../types/spec";
import { specLoader } from "../utils/spec-loader";
import { specExecutor } from "./spec-executor";

export interface WorkflowContext {
  input: Record<string, any>;
  steps: Record<string, { output: any }>;
}

export interface WorkflowResult {
  output: any;
  context: WorkflowContext;
  stepsExecuted: string[];
}

export class WorkflowExecutor {
  /**
   * Execute a workflow spec
   */
  async executeWorkflow(
    spec: WorkflowSpec,
    input: Record<string, any>,
    verbose: boolean = false,
  ): Promise<WorkflowResult> {
    const context: WorkflowContext = {
      input,
      steps: {},
    };

    const stepsExecuted: string[] = [];

    if (verbose) {
      console.log(`Executing workflow: ${spec.metadata.name}`);
      console.log(`Steps: ${spec.steps.length}`);
    }

    // Execute each step in sequence
    for (const step of spec.steps) {
      if (verbose) {
        console.log(`\nExecuting step: ${step.id} (agent: ${step.agent})`);
      }

      // Evaluate condition if present
      if (step.condition) {
        const shouldExecute = this.evaluateCondition(step.condition, context);
        if (!shouldExecute) {
          if (verbose) {
            console.log(`Skipping step ${step.id} (condition not met)`);
          }
          continue;
        }
      }

      // Resolve input from context
      const stepInput = this.resolveInput(step.input, context);

      if (verbose) {
        console.log(`Input: ${JSON.stringify(stepInput, null, 2)}`);
      }

      // Load and execute the agent
      const agentSpec = await specLoader.loadAgent(step.agent);
      const result = await specExecutor.executeAgent(agentSpec, {
        input: stepInput,
        verbose,
      });

      // Store the result in context
      context.steps[step.id] = { output: result.output };
      stepsExecuted.push(step.id);

      if (verbose) {
        console.log(`Step ${step.id} completed`);
      }
    }

    // Resolve final output
    const output = this.resolveInput(spec.output, context);

    return {
      output,
      context,
      stepsExecuted,
    };
  }

  /**
   * Resolve input values from context
   * Supports $input.field and $steps.stepId.output.field syntax
   */
  private resolveInput(
    input: Record<string, any>,
    context: WorkflowContext,
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === "string" && value.startsWith("$")) {
        resolved[key] = this.resolveReference(value, context);
      } else if (typeof value === "object" && value !== null) {
        resolved[key] = this.resolveInput(value, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Resolve a reference like $input.question or $steps.analyze.output
   */
  private resolveReference(ref: string, context: WorkflowContext): any {
    const parts = ref.substring(1).split(".");
    let current: any = context;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Evaluate a condition (simple implementation)
   */
  private evaluateCondition(
    condition: string,
    context: WorkflowContext,
  ): boolean {
    // Simple condition evaluation
    // Format: $steps.analyze.output.queryType != 'navigation'

    // For now, just return true
    // TODO: Implement proper condition evaluation
    return true;
  }
}

export const workflowExecutor = new WorkflowExecutor();
