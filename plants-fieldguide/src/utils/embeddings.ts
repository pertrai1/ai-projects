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
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // OpenAI allows up to 2048 inputs per request for embeddings
    const batchSize = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await this.openai.embeddings.create({
        model: this.model,
        input: batch,
      });

      embeddings.push(...response.data.map((d) => d.embedding));

      // Simple rate limiting
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

let _embeddingsGenerator: EmbeddingsGenerator | null = null;

export function getEmbeddingsGenerator(): EmbeddingsGenerator {
  if (!_embeddingsGenerator) {
    _embeddingsGenerator = new EmbeddingsGenerator();
  }
  return _embeddingsGenerator;
}
