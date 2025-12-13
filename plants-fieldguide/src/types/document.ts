export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    page: number;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
  embedding?: number[];
}

export interface ProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  respectSections?: boolean;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  rank: number;
}
