import { z } from "zod";

// Agent Speification Schema
export const AgentSpecSchema = z.object({
  version: z.string(),
  kind: z.literal("Agent"),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
  }),
  config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().optional(),
  }),
  systemPrompt: z.string(),
  tools: z.array(z.string()).optional(),
  outputSchema: z.any().optional(),
});

export type AgentSpec = z.infer<typeof AgentSpecSchema>;

// Tool Specification Schema
export const ToolSpecSchema = z.object({
  version: z.string(),
  kind: z.literal("Tool"),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
  }),
  parameters: z.record(z.any()),
  returns: z.any(),
  implementation: z.object({
    runtime: z.enum(["typescript", "python"]),
    handler: z.string(),
  }),
});

export type ToolSpec = z.infer<typeof ToolSpecSchema>;

// Workflow Step Schema
export const WorkflowStepSchema = z.object({
  id: z.string(),
  agent: z.string(),
  input: z.record(z.any()),
  condition: z.string().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// Workflow Specification Schema
export const WorkflowSpecSchema = z.object({
  version: z.string(),
  kind: z.literal("Workflow"),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
  }),
  steps: z.array(WorkflowStepSchema),
  output: z.record(z.any()),
});

export type WorkflowSpec = z.infer<typeof WorkflowSpecSchema>;

// Union type for all specs
export type Spec = AgentSpec | ToolSpec | WorkflowSpec;
