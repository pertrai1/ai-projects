/**
 * Interactive Chat Command
 * This command creates a REPL (Read-Eval-Print Loop) for conversational Q&A.
 *
 * - Multi-turn conversations with memory
 * - Follow-up question understanding
 * - Context tracking across questions
 * - Full Phase 2 pipeline per question
 * - Session statistics
 */

import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { ConversationManager } from "../utils/conversation-manager.js";
import { agentRouter } from "../utils/agent-router.js";
import { adaptiveRetrieval } from "../utils/adaptive-retrieval.js";
import { multiSourceRetrieval } from "../utils/multi-source-retrieval.js";
import { specLoader } from "../utils/spec-loader.js";
import { specExecutor } from "../agents/spec-executor.js";

export interface ChatOptions {
  verbose?: boolean;
  showContext?: boolean; // Show conversation context
}

/**
 * Interactive Chat Command
 * 1. Reads user input
 * 2. Evaluates/processes it
 * 3. Prints the result
 * 4. Loops back to step 1
 *
 */
export async function chatCommand(options: ChatOptions = {}): Promise<void> {
  console.log(chalk.blue.bold("\nPLANTS FieldGuide - Interactive Chat\n"));
  console.log(chalk.gray("Ask questions about the PLANTS database."));
  console.log(
    chalk.gray('Type "exit", "quit", or press Ctrl+C to end the session.'),
  );
  console.log(chalk.gray('Type "clear" to start a new conversation.'));
  console.log(chalk.gray('Type "stats" to see session statistics.\n'));

  // Create conversation manager
  const conversation = new ConversationManager();

  // Main conversation loop
  while (true) {
    try {
      // Prompt for question
      const { question } = await inquirer.prompt([
        {
          type: "input",
          name: "question",
          message: chalk.cyan("You:"),
          validate: (input: string) => {
            if (!input.trim()) {
              return "Please enter a question";
            }
            return true;
          },
        },
      ]);

      const trimmedQuestion = question.trim();

      // Handle special commands
      if (
        trimmedQuestion.toLowerCase() === "exit" ||
        trimmedQuestion.toLowerCase() === "quit"
      ) {
        await handleExit(conversation);
        break;
      }

      if (trimmedQuestion.toLowerCase() === "clear") {
        conversation.clear();
        console.log(chalk.yellow("\nConversation cleared. Starting fresh!\n"));
        continue;
      }

      if (trimmedQuestion.toLowerCase() === "stats") {
        showStats(conversation);
        continue;
      }

      if (trimmedQuestion.toLowerCase() === "help") {
        showHelp();
        continue;
      }

      // Process the question
      await processQuestion(trimmedQuestion, conversation, options);
    } catch (error) {
      if ((error as any).isTtyError) {
        console.error(
          chalk.red("\nPrompt couldn't be rendered in this environment"),
        );
        break;
      } else {
        console.error(
          chalk.red("\nAn error occurred:"),
          (error as Error).message,
        );
        if (options.verbose) {
          console.error(chalk.dim((error as Error).stack));
        }
      }
    }
  }
}

/**
 * Process a single question in the conversation
 * Context-Aware Processing

 * For each question:
 * 1. Check if it's a follow-up
 * 2. Enrich with conversation context
 * 3. Run through pipeline
 * 4. Store in conversation memory
 */
async function processQuestion(
  question: string,
  conversation: ConversationManager,
  options: ChatOptions,
): Promise<void> {
  const spinner = ora("Thinking...").start();

  try {
    // Check for follow-up and enrich query
    const isFollowUp = conversation.isFollowUp(question);
    const enrichedQuery = conversation.enrichQuery(question);

    if (isFollowUp && options.verbose) {
      console.log(
        chalk.dim(`\n[Follow-up detected] Enriched: ${enrichedQuery}`),
      );
    }

    // Use enriched query for processing, but show original to user
    const queryToProcess = isFollowUp ? enrichedQuery : question;

    // Route the query
    spinner.text = "Analyzing question...";
    const routing = await agentRouter.getRouting(queryToProcess);

    // Get adaptive strategy
    spinner.text = "Planning retrieval...";
    const strategy = await adaptiveRetrieval.getStrategy(
      queryToProcess,
      routing,
      false,
    );

    // Multi-source retrieval
    spinner.text = "Searching documentation...";
    const multiSourceResults = await multiSourceRetrieval.search({
      query: queryToProcess,
      primaryStrategy: strategy,
      useKeywordBoost: true,
      useSectionFilter: !!(strategy.sections && strategy.sections.length > 0),
      useQueryExpansion: strategy.expandQuery,
      fusionMethod: "RRF",
      verbose: false,
    });

    // Synthesize answer with conversation context
    spinner.text = "Synthesizing answer...";
    const synthesizerSpec = await specLoader.loadAgent("response-synthesizer");

    const synthesizerInput = {
      question: queryToProcess,
      primaryResults: multiSourceResults.results.filter(
        (r) => r.source === "primary",
      ),
      alternativeResults: multiSourceResults.results.filter(
        (r) => r.source !== "primary",
      ),
      strategies: multiSourceResults.strategies,
      fusionMethod: multiSourceResults.fusionMethod,
      // Add conversation context
      conversationHistory: conversation.getRecentHistory(2),
      conversationContext: conversation.getContextSummary(),
    };

    const synthesisResult = await specExecutor.executeAgent(synthesizerSpec, {
      input: synthesizerInput,
      verbose: false,
    });

    spinner.succeed("Answer ready");

    // Display answer
    console.log();
    console.log(chalk.blue.bold("FieldGuide:"));
    console.log(synthesisResult.output.answer);
    console.log();

    // Show confidence
    if (synthesisResult.output.confidence) {
      const confidenceIcon =
        synthesisResult.output.confidence === "high"
          ? "🟢"
          : synthesisResult.output.confidence === "medium"
            ? "🟡"
            : "🔴";

      console.log(
        chalk.dim(
          `${confidenceIcon} Confidence: ${synthesisResult.output.confidence}`,
        ),
      );
    }

    // Show context info if requested
    if (options.showContext && conversation.getStats().turns > 0) {
      console.log(chalk.dim(`${conversation.getContextSummary()}`));
    }

    console.log();

    // Store in conversation memory
    conversation.addTurn({
      question,
      answer: synthesisResult.output.answer,
      routing,
      strategy,
      confidence: synthesisResult.output.confidence,
      sourcesUsed: synthesisResult.output.sourcesUsed?.total,
    });
  } catch (error) {
    spinner.fail("Failed to answer");
    console.error(chalk.red("\nError:"), (error as Error).message);

    if ((error as Error).message.includes("Vector store not found")) {
      console.log(
        chalk.yellow(
          '\nTip: Run "fieldguide index" first to index the documentation\n',
        ),
      );
    }

    if (options.verbose) {
      console.error(chalk.dim((error as Error).stack));
    }
    console.log();
  }
}

/**
 * Handle exit gracefully
 */
async function handleExit(conversation: ConversationManager): Promise<void> {
  const stats = conversation.getStats();

  console.log(chalk.blue("\nThanks for using PLANTS FieldGuide!"));

  if (stats.turns > 0) {
    console.log(chalk.dim("\nSession summary:"));
    console.log(chalk.dim(`  Questions asked: ${stats.turns}`));
    console.log(
      chalk.dim(
        `  Duration: ${Math.round(stats.duration / 1000 / 60)} minutes`,
      ),
    );
    console.log(chalk.dim(`  Topics discussed: ${stats.topics}`));
  }

  console.log();
}

/**
 * Show session statistics
 */
function showStats(conversation: ConversationManager): void {
  const stats = conversation.getStats();
  const session = conversation.getSession();

  console.log(chalk.blue("\nSession Statistics\n"));
  console.log(chalk.dim("Questions asked:"), stats.turns);
  console.log(
    chalk.dim("Session duration:"),
    `${Math.round(stats.duration / 1000 / 60)} minutes`,
  );
  console.log(chalk.dim("Topics discussed:"), stats.topics);
  console.log(chalk.dim("Entities mentioned:"), stats.entities);

  if (session.context.topics.length > 0) {
    console.log(
      chalk.dim("\nTopics:"),
      session.context.topics.slice(-5).join(", "),
    );
  }

  if (session.context.entities.length > 0) {
    console.log(
      chalk.dim("Entities:"),
      session.context.entities.slice(-5).join(", "),
    );
  }

  console.log();
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(chalk.blue("\nChat Commands\n"));
  console.log(chalk.dim("exit, quit"), "  - End the chat session");
  console.log(chalk.dim("clear"), "      - Clear conversation history");
  console.log(chalk.dim("stats"), "      - Show session statistics");
  console.log(chalk.dim("help"), "       - Show this help message");
  console.log();
  console.log(chalk.blue("Tips\n"));
  console.log(
    chalk.dim("• You can ask follow-up questions (e.g., 'What about OBL?')"),
  );
  console.log(
    chalk.dim("• The system remembers context from previous questions"),
  );
  console.log(
    chalk.dim("• Use specific terms for better results (e.g., 'FACW code')"),
  );
  console.log();
}
