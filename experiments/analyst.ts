import * as crypto from "crypto";

// --- 📋 Type Definitions for our Playbook ---

export interface AgentStep {
  timestamp: number;
  thought: string;
  action: {
    toolName: string;
    args: Record<string, any>;
  };
  observation: {
    output: string;
    exitCode?: number;
  };
}

export interface TrajectoryTrace {
  sessionId: string;
  steps: AgentStep[];
}

export interface EvaluationReport {
  totalSteps: number;
  redundantSteps: number;
  efficiencyScore: number; // 0.0 to 100.0 (Our "Offensive Spacing Score")
  flagsThrown: string[];
  isSafeToPromote: boolean;
}

// --- 🎥 The Game Tape Analyst Class ---

export class GameTapeAnalyst {
  private readonly maxAllowedRedundancy = 2;

  /**
   * Analyzes an agent's trajectory trace.
   * Evaluates if the team executed the playbook efficiently, or ran around in circles.
   */
  public analyzeTrajectory(trace: TrajectoryTrace): EvaluationReport {
    const steps = trace.steps;
    const totalSteps = steps.length;
    const flagsThrown: string[] = [];

    if (totalSteps === 0) {
      return {
        totalSteps: 0,
        redundantSteps: 0,
        efficiencyScore: 0,
        flagsThrown: [
          "🚨 FORFEIT: Agent took 0 steps. No game tape to analyze!",
        ],
        isSafeToPromote: false,
      };
    }

    let redundantSteps = 0;
    const actionHashes: string[] = [];

    // Track seen actions to calculate the "Spinning in Circles" metric
    for (const step of steps) {
      const actionString = `${step.action.toolName}:${JSON.stringify(step.action.args)}`;
      const actionHash = crypto
        .createHash("sha256")
        .update(actionString)
        .digest("hex");

      if (actionHashes.includes(actionHash)) {
        redundantSteps++;
      }
      actionHashes.push(actionHash);
    }

    // Rule 1: Flag repetitive actions (Delay of Game)
    if (redundantSteps > this.maxAllowedRedundancy) {
      flagsThrown.push(
        `🟨 DELAY OF GAME: Agent repeated actions ${redundantSteps} times. Spinning in circles!`,
      );
    }

    // Rule 2: Flag massive step-count spirals (Shot Clock Violation)
    if (totalSteps > 15) {
      flagsThrown.push(
        "🟨 SHOT CLOCK VIOLATION: Agent took over 15 steps to complete a single task.",
      );
    }

    // Rule 3: Flag unhandled tool errors (Fumble)
    const fumbles = steps.filter(
      (s) => s.observation.exitCode && s.observation.exitCode !== 0,
    ).length;
    if (fumbles > 0) {
      flagsThrown.push(
        `🟨 FUMBLE: Agent executed ${fumbles} tool calls that crashed with a non-zero exit code.`,
      );
    }

    // Calculate Play-Calling Efficiency (Offensive Spacing Score)
    // Highly redundant runs drag this score down aggressively
    const efficiencyFactor =
      totalSteps > 0 ? (totalSteps - redundantSteps) / totalSteps : 0;
    const efficiencyScore = Math.max(
      0,
      Math.min(100, Math.round(efficiencyFactor * 100)),
    );

    // An agent's run is only safe to promote if they won the game AND played disciplined
    const isSafeToPromote =
      efficiencyScore >= 80 && fumbles === 0 && totalSteps <= 15;

    return {
      totalSteps,
      redundantSteps,
      efficiencyScore,
      flagsThrown,
      isSafeToPromote,
    };
  }
}

// --- 🎮 Running the Simulation on the Court ---

const analyst = new GameTapeAnalyst();

// Game Tape 1: A chaotic, circular run (Terrible Trajectory)
const sloppyTrace: TrajectoryTrace = {
  sessionId: "session_abc_123",
  steps: [
    {
      timestamp: 1786010000,
      thought: "I need to check the folder contents.",
      action: { toolName: "list_dir", args: { path: "." } },
      observation: { output: "index.ts, package.json" },
    },
    {
      timestamp: 1786010010,
      thought: "Let me check directory contents again, just to be sure.",
      action: { toolName: "list_dir", args: { path: "." } }, // Duplicate!
      observation: { output: "index.ts, package.json" },
    },
    {
      timestamp: 1786010020,
      thought: "Maybe the directory has changed? Let me check one more time.",
      action: { toolName: "list_dir", args: { path: "." } }, // Triplicate!
      observation: { output: "index.ts, package.json" },
    },
  ],
};

const cleanTrace: TrajectoryTrace = {
  sessionId: "session_def_456",
  steps: [
    {
      timestamp: 1786010022,
      thought: "Let me list the directory contents",
      action: { toolName: "list_dir", args: { path: "." } },
      observation: { output: "style.css" },
    },
    {
      timestamp: 1786010024,
      thought: "Let me list the directory parent contents",
      action: { toolName: "list_dir_parent", args: { path: "../" } },
      observation: { output: "index.html" },
    },
    {
      timestamp: 1786010026,
      thought: "Let me list the directory parent contents all",
      action: { toolName: "list_dir_all", args: { path: "." } },
      observation: { output: "style.css, index.html, script.js" },
    },
  ],
};
const report = analyst.analyzeTrajectory(cleanTrace);
console.log(`=== 📊 GAME TAPE ANALYSIS REPORT ===`);
console.log(`Total Steps Taken: ${report.totalSteps}`);
console.log(`Redundant Tool Calls: ${report.redundantSteps}`);
console.log(`Offensive Spacing Score: ${report.efficiencyScore}/100`);
console.log(`Flags Thrown on the Play:`, report.flagsThrown);
console.log(
  `Clear to Promote to Production? ${report.isSafeToPromote ? "💚 YES" : "❤️ NO - BENCHED!"}`,
);
