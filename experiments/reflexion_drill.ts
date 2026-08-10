import * as crypto from "crypto";

// --- 📋 DEFINE CONTRACTS ---

interface ExecutionResult {
  success: boolean;
  errorLog?: string;
  output?: number;
}

interface ReflectionEntry {
  trial: number;
  code: string;
  critique: string;
}

// --- 🏈 THE ENVIRONMENT (The Playing Field & Defensive Scheme) ---

class YardageValidator {
  /**
   * Executes the generated code and tests it against defensive scenarios.
   * In production, this would run inside an isolated vm2/worker_thread sandbox.
   */
  public checkPlay(code: string): ExecutionResult {
    try {
      // Create a safe runner function wrapping the generated code string
      const runner = new Function(
        "completions",
        "attempts",
        "yards",
        `
                ${code}
                return calculatePasserRating(completions, attempts, yards);
            `,
      );

      // Test Case 1: Standard play
      const result1 = runner(10, 20, 150);
      if (typeof result1 !== "number" || isNaN(result1)) {
        return {
          success: false,
          errorLog:
            "Test Case 1 Failed: calculatePasserRating(10, 20, 150) returned NaN or non-number.",
        };
      }

      // Test Case 2: Extreme defensive sack (Zero passing attempts!)
      // Buggy implementations usually divide by 'attempts', causing a Division-by-Zero crash or NaN.
      const result2 = runner(0, 0, 0);
      if (result2 !== 0) {
        return {
          success: false,
          errorLog: `Test Case 2 Failed: Expected 0 rating for 0 attempts, but got ${result2}.`,
        };
      }

      return { success: true, output: result1 };
    } catch (error: any) {
      return {
        success: false,
        errorLog: `Compiler/Runtime Crash: ${error.message}`,
      };
    }
  }
}

// --- 🧠 THE SELF-REFLECTING AGENT (The Self-Coaching QB) ---

class ReflexionEngine {
  private episodicMemory: ReflectionEntry[] = [];
  private validator = new YardageValidator();

  // Simulating our frozen model (LLM) using deterministic agent heuristics
  private mockGenerator(attempts: number, memory: ReflectionEntry[]): string {
    if (attempts === 1) {
      // Initial broken code generation (The QB throws an interception due to naive division)
      return `
function calculatePasserRating(completions: number, attempts: number, yards: number): number {
    const completionRate = (completions / attempts) * 100;
    const yardsPerAttempt = yards / attempts;
    return (completionRate + yardsPerAttempt) * 0.5;
}`;
    }

    // QB reviews memory of the fumble
    const lastFumble = memory[memory.length - 1];
    if (
      lastFumble.critique.includes("attempts === 0") ||
      lastFumble.critique.includes("Division-by-Zero")
    ) {
      // The QB reads their visor replay note and applies a guard rail!
      return `
function calculatePasserRating(completions: number, attempts: number, yards: number): number {
    if (attempts === 0) {
        return 0; // Guard rail added from reflection!
    }
    const completionRate = (completions / attempts) * 100;
    const yardsPerAttempt = yards / attempts;
    return (completionRate + yardsPerAttempt) * 0.5;
}`;
    }

    return lastFumble.code;
  }

  private mockCritic(failedCode: string, errorLog: string): string {
    // Simulates the Critic analyzing the compiler game tape
    if (
      errorLog.includes("attempts, but got NaN") ||
      errorLog.includes("Division-by-Zero") ||
      errorLog.includes("0 attempts")
    ) {
      return "CRITIQUE: The calculation crashes when attempts is 0 because of a division-by-zero math error. I must intercept this scenario at the top of the function and return 0 immediately.";
    }
    return "CRITIQUE: High level logic failed. Code must be checked for type conformity.";
  }

  public runCamp(maxTrials: number = 3): void {
    console.log("🎬 Starting quarterback training camp...\n");

    for (let trial = 1; trial <= maxTrials; trial++) {
      console.log(`🏈 --- TRIAL ${trial} ---`);

      // 1. Generate code (The QB plans the play)
      const currentCode = this.mockGenerator(trial, this.episodicMemory);
      console.log("⚡ [QB] Executing play formation...");

      // 2. Evaluate code in Sandbox (Run the play)
      const result = this.validator.checkPlay(currentCode);

      if (result.success) {
        console.log(
          `✅ [SCOREBOARD] Touchdown! Tests passed successfully. Final Rating: ${result.output}`,
        );
        console.log("🏆 Training Camp Successful!");
        return;
      }

      console.log(
        `❌ [REF] Flag Thrown! Fumble detected: "${result.errorLog}"`,
      );

      // 3. Critique the failure (Review the tape)
      const critique = this.mockCritic(currentCode, result.errorLog || "");
      console.log(`📝 [VISOR REPLAY]
${critique}`);

      // 4. Store the critique in Episodic Memory
      this.episodicMemory.push({
        trial,
        code: currentCode,
        critique,
      });

      console.log("📥 Added critique to visor memory card.\n");
    }

    console.log(
      "❌ Training Camp failed to resolve the bug within trial limits.",
    );
  }
}

// Run the engine
const coach = new ReflexionEngine();
coach.runCamp();
