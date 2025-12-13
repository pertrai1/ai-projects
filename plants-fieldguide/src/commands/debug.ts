import chalk from "chalk";
import { pdfProcessor } from "../utils/pdf-processor";

export async function debugCommand(file?: string): Promise<void> {
  const pdfPath = file || "./PLANTS_Help_Document_2022.pdf";

  console.log(chalk.blue("Analyzing PDF...\n"));

  try {
    // Extract text
    console.log(chalk.dim("Extracting PDF..."));
    const { text, numPages } = await pdfProcessor.extractText(pdfPath);

    console.log(chalk.bold("PDF Information:"));
    console.log(chalk.dim(`  Pages: ${numPages}`));
    console.log(
      chalk.dim(`  Total characters: ${text.length.toLocaleString()}`),
    );
    console.log(
      chalk.dim(
        `  Avg chars/page: ${Math.round(text.length / numPages).toLocaleString()}`,
      ),
    );

    // Test different chunk sizes
    const testConfigs = [
      { size: 500, overlap: 100 },
      { size: 1000, overlap: 200 },
      { size: 2000, overlap: 400 },
    ];

    console.log(chalk.bold("\nChunking Tests:"));

    for (const config of testConfigs) {
      console.log(
        chalk.dim(`\nTesting size=${config.size}, overlap=${config.overlap}`),
      );

      try {
        const chunks = pdfProcessor.createChunks(text, pdfPath, {
          chunkSize: config.size,
          chunkOverlap: config.overlap,
          respectSections: true,
        });

        const avgSize = Math.round(
          chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length,
        );

        console.log(chalk.green(`  Created ${chunks.length} chunks`));
        console.log(chalk.dim(`    Average size: ${avgSize} chars`));

        // Show sections
        const sections = new Set(
          chunks.map((c) => c.metadata.section).filter(Boolean),
        );
        console.log(chalk.dim(`    Sections: ${sections.size}`));

        // Estimate embedding time
        const batchSize = 100;
        const batches = Math.ceil(chunks.length / batchSize);
        const estimatedSeconds = batches * 15;

        console.log(chalk.dim(`    Embedding batches: ${batches}`));
        console.log(
          chalk.dim(
            `    Estimated time: ~${estimatedSeconds}s (${Math.round(estimatedSeconds / 60)}m)`,
          ),
        );
      } catch (error) {
        console.log(
          chalk.red(
            `  Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    }

    console.log();
  } catch (error) {
    console.error(chalk.red("Error:"), error);
  }
}
