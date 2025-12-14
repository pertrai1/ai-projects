/**
 * Agent Router - Dynamic Agent Selection
 *
 * This implements the "smart routing" logic that connects the query-router
 * agent's decision to the actual execution of specialized agents.
 *
 * FLOW:
 * 1. User asks a question
 * 2. query-router agent analyzes it and returns an agentType
 * 3. This router maps agentType → actual agent spec name
 * 4. The workflow executor runs the selected agent
 */

import { specLoader } from "./spec-loader.js";
import { specExecutor } from "../agents/spec-executor.js";
import type { AgentSpec } from "../types/spec.js";

// The different types of queries our router can identify
export type AgentType =
  | "DEFINITION_LOOKUP"
  | "HOW_TO_GUIDE"
  | "COMPARISON"
  | "DATA_RETRIEVAL"
  | "GENERAL_QA";

// What the query-router returns
export interface RoutingDecision {
  agentType: AgentType;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  keywords: string[];
  searchStrategy: "focused" | "broad" | "multi-step";
}

// The result after routing and executing the specialized agent
export interface RoutedExecutionResult {
  answer: string;
  routedTo: AgentType;
  routingConfidence: string;
  reasoning: string;
  citations?: any[];
  searchStrategy: string;
  keywords: string[];
  // Additional fields from specialized agents
  [key: string]: any;
}

/**
 * This maps abstract agent types (from the router) to actual agent spec files.
 */
const AGENT_TYPE_TO_SPEC: Record<AgentType, string> = {
  DEFINITION_LOOKUP: "definition-lookup",
  HOW_TO_GUIDE: "how-to-guide",
  COMPARISON: "comparison",
  DATA_RETRIEVAL: "document-retriever", // Reuse existing retriever for now
  GENERAL_QA: "document-retriever", // Fallback to general retriever
};

/**
 * AgentRouter Class
 */
export class AgentRouter {
  // Cache loaded agent specs to avoid reloading from disk
  private agentSpecCache: Map<string, AgentSpec> = new Map();

  /**
   * Route a question to the appropriate agent and execute it
   * This is the main entry point. It:
   * 1. Gets routing decision from query-router
   * 2. Loads the appropriate specialized agent
   * 3. Executes that agent
   * 4. Returns the result with routing metadata
   *
   * @param question - The user's question
   * @param verbose - Whether to show detailed output
   * @returns The answer with routing information
   */
  async routeAndExecute(
    question: string,
    verbose: boolean = false,
  ): Promise<RoutedExecutionResult> {
    // Get routing decision
    if (verbose) {
      console.log("\n[Router] Analyzing query...");
    }

    const routingDecision = await this.getRoutingDecision(question, verbose);

    if (verbose) {
      console.log(
        `[Router] Decision: Route to ${routingDecision.agentType} (confidence: ${routingDecision.confidence})`,
      );
      console.log(`[Router] Reasoning: ${routingDecision.reasoning}`);
      console.log(`[Router] Keywords: ${routingDecision.keywords.join(", ")}`);
      console.log(
        `[Router] Search strategy: ${routingDecision.searchStrategy}`,
      );
    }

    // Load the appropriate specialized agent
    if (verbose) {
      console.log(`\n[Router] Loading ${routingDecision.agentType} agent...`);
    }

    const specializedAgent = await this.loadSpecializedAgent(
      routingDecision.agentType,
    );

    // Execute the specialized agent
    if (verbose) {
      console.log(`\n[Router] Executing specialized agent...`);
    }

    const result = await specExecutor.executeAgent(specializedAgent, {
      input: {
        question,
        // Pass routing context to help the agent
        routingContext: routingDecision,
      },
      verbose,
    });

    // Combine routing metadata with agent result
    return {
      answer: result.output.answer || result.output.text || "",
      routedTo: routingDecision.agentType,
      routingConfidence: routingDecision.confidence,
      reasoning: routingDecision.reasoning,
      searchStrategy: routingDecision.searchStrategy,
      keywords: routingDecision.keywords,
      // Include any additional fields from the specialized agent
      ...result.output,
    };
  }

  /**
   * Get routing decision from the query-router agent
   *
   * @param question - The user's question
   * @param verbose - Whether to show detailed output
   * @returns The routing decision
   */
  private async getRoutingDecision(
    question: string,
    verbose: boolean = false,
  ): Promise<RoutingDecision> {
    // Load the query-router agent spec
    const routerSpec = await specLoader.loadAgent("query-router");

    // Execute the router to get a classification
    const result = await specExecutor.executeAgent(routerSpec, {
      input: { question },
      verbose,
    });

    // The router should return structured data matching RoutingDecision
    return result.output as RoutingDecision;
  }

  /**
   * Load a specialized agent based on the routing decision
   *
   * Cache loaded agent specs to avoid reloading the same YAML file
   * multiple times.
   *
   * @param agentType - The type of agent to load
   * @returns The loaded agent specification
   */
  private async loadSpecializedAgent(agentType: AgentType): Promise<AgentSpec> {
    const specName = AGENT_TYPE_TO_SPEC[agentType];

    // Check cache first
    if (this.agentSpecCache.has(specName)) {
      return this.agentSpecCache.get(specName)!;
    }

    // Cache miss - load from disk
    const spec = await specLoader.loadAgent(specName);

    // Store in cache for next time
    this.agentSpecCache.set(specName, spec);

    return spec;
  }

  /**
   * Get routing decision without executing
   * Sometimes you want to see the routing decision without executing.
   */
  async getRouting(question: string): Promise<RoutingDecision> {
    return this.getRoutingDecision(question, false);
  }
}

export const agentRouter = new AgentRouter();
