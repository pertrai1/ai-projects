import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { AgentSpec, WorkflowSpec } from "../types/index.js";

export class SpecLoader {
  private baseDir: string;

  constructor(baseDir: string = "./specs") {
    this.baseDir = baseDir;
  }

  async loadAgentSpec(agentName: string): Promise<AgentSpec> {
    const path = `${this.baseDir}/agents/${agentName}.spec.yaml`;
    const content = await readFile(path, "utf-8");
    const spec = parse(content) as AgentSpec;

    if (spec.kind !== "Agent") {
      throw new Error(`Expected Agent spec, got ${spec.kind}`);
    }

    return spec;
  }

  async loadWorkflowSpec(workflowName: string): Promise<WorkflowSpec> {
    const path = `${this.baseDir}/workflows/${workflowName}.spec.yaml`;
    const content = await readFile(path, "utf-8");
    const spec = parse(content) as WorkflowSpec;

    if (spec.kind !== "Workflow") {
      throw new Error(`Expected Workflow spec, got ${spec.kind}`);
    }

    return spec;
  }
}
