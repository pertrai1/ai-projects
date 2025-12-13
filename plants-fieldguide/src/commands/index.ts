import chalk from "chalk";
import ora from "ora";
import path from "path";
import { pdfProcessor } from "../utils/pdf-processor.js";
import { getEmbeddingsGenerator } from "../utils/embeddings.js";
import { vectorStore } from "../utils/vector-store.js";

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
    const { text, numPages, pages } = await pdfProcessor.extractText(pdfPath);
    spinner.succeed(`Extracted ${numPages} pages`);

    if (options.verbose) {
      console.log(chalk.dim(`Total text length: ${text.length} characters`));
    }

    // Step 2: Create chunks
    spinner = ora("Creating document chunks...").start();
    let chunks = pdfProcessor.createChunks(text, path.basename(pdfPath), {
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      respectSections: true,
    });

    // Assign page numbers
    chunks = pdfProcessor.assignPageNumbers(chunks, pages);

    spinner.succeed(`Created ${chunks.length} chunks`);

    if (options.verbose) {
      const sections = new Set(chunks.map((c) => c.metadata.section));
      console.log(chalk.dim(`Found ${sections.size} sections`));
      console.log(chalk.dim(`Sections: ${Array.from(sections).join(", ")}`));
    }

    // Step 3: Generate embeddings
    spinner = ora("Generating embeddings (this may take a minute)...").start();
    const embeddingsGenerator = getEmbeddingsGenerator();
    const embeddings = await embeddingsGenerator.generateEmbeddings(
      chunks.map((c) => c.content),
    );

    // Add embeddings to chunks
    chunks.forEach((chunk, i) => {
      chunk.embedding = embeddings[i];
    });

    spinner.succeed(`Generated ${embeddings.length} embeddings`);

    // Step 4: Build vector index
    spinner = ora("Building vector index...").start();
    await vectorStore.initialize(chunks.length * 2); // Allow room for growth
    await vectorStore.addChunks(chunks);
    spinner.succeed("Vector index built");

    // Step 5: Save to disk
    spinner = ora("Saving vector store...").start();
    await vectorStore.save("plants-help");
    spinner.succeed("Vector store saved");

    // Show stats
    const stats = vectorStore.getStats();
    console.log(chalk.green("\nIndexing complete!\n"));
    console.log(chalk.bold("Statistics:"));
    console.log(chalk.dim(`  Chunks: ${stats.numChunks}`));
    console.log(chalk.dim(`  Dimensions: ${stats.dimension}`));
    console.log(chalk.dim(`  Sections: ${stats.sections.length}`));

    if (options.verbose) {
      console.log(chalk.dim("\n  Sections found:"));
      stats.sections.forEach((s) => console.log(chalk.dim(`    - ${s}`)));
    }

    console.log();
  } catch (error) {
    spinner.fail("Indexing failed");

    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message);

      if (options.verbose) {
        console.error(chalk.dim("\nStack trace:"));
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(1);
  }
}
