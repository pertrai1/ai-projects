import chalk from "chalk";
import ora from "ora";
import path from "path";
import { pdfProcessor } from "../utils/pdf-processor";
import { embeddingsGenerator } from "../utils/embeddings";
import { vectorStore } from "../utils/vector-store";

export interface IndexOptions {
  file?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  verbose?: boolean;
}

export async function indexCommand(options: IndexOptions = {}): Promise<void> {
  const pdfPath = options.file || "./PLANTS_Help_Document_2022.pdf";

  console.log(chalk.blue("FieldGuide:"), "Indexing PLANTS documentation\n");

  let spinner = ora("Loading PDF...").start();

  try {
    // Step 1: Extract text from PDF
    spinner.text = "Extracting text from PDF...";
    const startExtract = Date.now();
    const { text, numPages, pages } = await pdfProcessor.extractText(pdfPath);
    const extractTime = ((Date.now() - startExtract) / 1000).toFixed(1);
    spinner.succeed(`Extracted ${numPages} pages (${extractTime}s)`);

    if (options.verbose) {
      console.log(chalk.dim(`Total text length: ${text.length} characters`));
    }

    // Step 2: Create chunks
    spinner = ora("Creating document chunks...").start();
    const startChunk = Date.now();
    let chunks = pdfProcessor.createChunks(text, path.basename(pdfPath), {
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      respectSections: true,
    });

    // Assign page numbers
    chunks = pdfProcessor.assignPageNumbers(chunks, pages);
    const chunkTime = ((Date.now() - startChunk) / 1000).toFixed(1);

    spinner.succeed(`Created ${chunks.length} chunks (${chunkTime}s)`);

    if (options.verbose) {
      const sections = new Set(chunks.map((c) => c.metadata.section));
      console.log(chalk.dim(`Found ${sections.size} sections`));
      console.log(
        chalk.dim(
          `Average chunk size: ${Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length)} characters`,
        ),
      );
    }

    // Step 3: Generate embeddings
    spinner.stop(); // Stop spinner to show detailed progress
    console.log(chalk.blue("\nGenerating embeddings..."));
    const startEmbed = Date.now();

    const embeddings = await embeddingsGenerator.generateEmbeddings(
      chunks.map((c) => c.content),
      (current, total) => {
        // This callback is called after each batch
        const percent = ((current / total) * 100).toFixed(1);
        process.stdout.write(
          `\r${chalk.blue("Progress:")} ${current}/${total} (${percent}%)`,
        );
      },
    );

    const embedTime = ((Date.now() - startEmbed) / 1000).toFixed(1);
    console.log(
      chalk.green(
        `\n✓ Generated ${embeddings.length} embeddings (${embedTime}s)\n`,
      ),
    );

    // Add embeddings to chunks
    chunks.forEach((chunk, i) => {
      chunk.embedding = embeddings[i];
    });

    // Step 4: Build vector index
    spinner = ora("Building vector index...").start();
    const startIndex = Date.now();
    await vectorStore.initialize(chunks.length * 2);
    await vectorStore.addChunks(chunks);
    const indexTime = ((Date.now() - startIndex) / 1000).toFixed(1);
    spinner.succeed(`Vector index built (${indexTime}s)`);

    // Step 5: Save to disk
    spinner = ora("Saving vector store...").start();
    const startSave = Date.now();
    await vectorStore.save("plants-help");
    const saveTime = ((Date.now() - startSave) / 1000).toFixed(1);
    spinner.succeed(`Vector store saved (${saveTime}s)`);

    // Show stats
    const stats = vectorStore.getStats();
    const totalTime = ((Date.now() - startExtract) / 1000).toFixed(1);

    console.log(chalk.green("\n✓ Indexing complete!\n"));
    console.log(chalk.bold("Statistics:"));
    console.log(chalk.dim(`  Total time: ${totalTime}s`));
    console.log(chalk.dim(`  Chunks: ${stats.numChunks}`));
    console.log(chalk.dim(`  Dimensions: ${stats.dimension}`));
    console.log(chalk.dim(`  Sections: ${stats.sections.length}`));

    if (options.verbose) {
      console.log(chalk.dim("\n  Sections found:"));
      stats.sections.forEach((s) => console.log(chalk.dim(`    - ${s}`)));

      console.log(chalk.dim("\n  Timing breakdown:"));
      console.log(chalk.dim(`    PDF extraction: ${extractTime}s`));
      console.log(chalk.dim(`    Chunking: ${chunkTime}s`));
      console.log(chalk.dim(`    Embeddings: ${embedTime}s`));
      console.log(chalk.dim(`    Index building: ${indexTime}s`));
      console.log(chalk.dim(`    Saving: ${saveTime}s`));
    }

    console.log();
  } catch (error) {
    spinner.fail("Indexing failed");

    if (error instanceof Error) {
      console.error(chalk.red("\n❌ Error:"), error.message);

      if (error.message.includes("API key")) {
        console.log(
          chalk.yellow("\nMake sure OPENAI_API_KEY is set in your .env file\n"),
        );
      }

      if (options.verbose) {
        console.error(chalk.dim("\nStack trace:"));
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(1);
  }
}
