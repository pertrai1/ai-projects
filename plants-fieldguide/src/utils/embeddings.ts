import OpenAI from "openai";

export class EmbeddingsGenerator {
  private openai: OpenAI;
  private model: string = "text-embedding-3-small";

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate embeddings for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch with progress callback
   */
  async generateEmbeddings(
    texts: string[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<number[][]> {
    const batchSize = 100;
    const embeddings: number[][] = [];
    const totalBatches = Math.ceil(texts.length / batchSize);

    console.log(
      `Generating embeddings for ${texts.length} chunks in ${totalBatches} batches...`,
    );

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      console.log(
        `Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`,
      );

      try {
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batch,
        });

        embeddings.push(...response.data.map((d) => d.embedding));

        if (onProgress) {
          onProgress(embeddings.length, texts.length);
        }

        console.log(
          `Batch ${batchNum}/${totalBatches} complete (${embeddings.length}/${texts.length} total)`,
        );

        // Rate limiting - only sleep if not the last batch
        if (i + batchSize < texts.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error in batch ${batchNum}:`, error);
        throw error;
      }
    }

    return embeddings;
  }

  /**
   * Get the dimension of embeddings for this model
   */
  getDimension(): number {
    // text-embedding-3-small produces 1536-dimensional vectors
    return 1536;
  }
}

// Lazy singleton to ensure environment variables are loaded first
let _embeddingsGenerator: EmbeddingsGenerator | null = null;

export const embeddingsGenerator = {
  get generateEmbedding() {
    if (!_embeddingsGenerator) {
      _embeddingsGenerator = new EmbeddingsGenerator();
    }
    return _embeddingsGenerator.generateEmbedding.bind(_embeddingsGenerator);
  },
  get generateEmbeddings() {
    if (!_embeddingsGenerator) {
      _embeddingsGenerator = new EmbeddingsGenerator();
    }
    return _embeddingsGenerator.generateEmbeddings.bind(_embeddingsGenerator);
  },
  get getDimension() {
    if (!_embeddingsGenerator) {
      _embeddingsGenerator = new EmbeddingsGenerator();
    }
    return _embeddingsGenerator.getDimension.bind(_embeddingsGenerator);
  },
};
