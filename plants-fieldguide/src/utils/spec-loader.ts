import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import {
  AgentSpec,
  AgentSpecSchema,
  ToolSpec,
  ToolSpecSchema,
  WorkflowSpec,
  WorkflowSpecSchema,
  type Spec,
} from "../types/spec.js";

export class SpecLoader {
  private specsPath: string;
  private cache: Map<string, Spec> = new Map();

  constructor(specsPath: string = "./specs") {
    this.specsPath = specsPath;
  }

  /**
   * Load a specific spec by name and kind
   */
  async loadSpec(
    kind: "agents" | "tools" | "workflows",
    name: string,
  ): Promise<Spec> {
    const cacheKey = `${kind}/${name}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Load from file
    const filePath = join(this.specsPath, kind, `${name}.spec.yaml`);
    const content = await readFile(filePath, "utf-8");
    const parsed = parseYaml(content);

    // Validate and type the spec
    const spec = this.validateSpec(parsed);

    // Cache it
    this.cache.set(cacheKey, spec);

    return spec;
  }

  /**
   * Load all specs of a specific kind
   */
  async loadAllSpecs(kind: "agents" | "tools" | "workflows"): Promise<Spec[]> {
    const dirPath = join(this.specsPath, kind);
    const files = await readdir(dirPath);

    const specFiles = files.filter(
      (f) => f.endsWith(".spec.yaml") || f.endsWith(".spec.yml"),
    );

    const specs = await Promise.all(
      specFiles.map(async (file) => {
        const name = file.replace(/\.spec\.ya?ml$/, "");
        return this.loadSpec(kind, name);
      }),
    );

    return specs;
  }

  /**
   * Load an agent spec specifically
   */
  async loadAgent(name: string): Promise<AgentSpec> {
    const spec = await this.loadSpec("agents", name);
    if (spec.kind !== "Agent") {
      throw new Error(`Expected Agent spec, got ${spec.kind}`);
    }
    return spec;
  }

  /**
   * Load a tool specifically
   */
  async loadTool(name: string): Promise<ToolSpec> {
    const spec = await this.loadSpec("tools", name);
    if (spec.kind !== "Tool") {
      throw new Error(`Expected Tool spec, got ${spec.kind}`);
    }
    return spec;
  }

  /**
   * Load a workflow spec specfically
   */
  async loadWorkflow(name: string): Promise<WorkflowSpec> {
    const spec = await this.loadSpec("workflows", name);
    if (spec.kind !== "Workflow") {
      throw new Error(`Exprected Workflow spec, got ${spec.kind}`);
    }
    return spec;
  }

  /**
   * Validate spec against Zod schema
   */
  private validateSpec(data: any): Spec {
    // Determine which schema to use based on 'kind'
    switch (data.kind) {
      case "Agent":
        return AgentSpecSchema.parse(data);
      case "Tool":
        return ToolSpecSchema.parse(data);
      case "Workflow":
        return WorkflowSpecSchema.parse(data);
      default:
        throw new Error(`Unknown spec kind: ${data.kind}`);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * List all available specs
   */
  async listSpecs(): Promise<{
    agents: string[];
    tools: string[];
    workflows: string[];
  }> {
    const listFiles = async (kind: string) => {
      try {
        const dirPath = join(this.specsPath, kind);
        const files = await readdir(dirPath);
        return files
          .filter((f) => f.endsWith(".spec.yaml") || f.endsWith(".spec.yml"))
          .map((f) => f.replace(/\.spec\.ya?ml$/, ""));
      } catch (error) {
        return [];
      }
    };

    const [agents, tools, workflows] = await Promise.all([
      listFiles("agents"),
      listFiles("tools"),
      listFiles("workflows"),
    ]);

    return { agents, tools, workflows };
  }
}

export const specLoader = new SpecLoader();
