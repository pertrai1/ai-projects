/**
 * Code-aware chunking strategies
 *
 * Learning focus (Phase 1):
 * - Chunking strategies have different trade-offs
 * - Semantic chunking preserves meaning but is slower
 * - Fixed chunking is fast but may split related code
 * - Token budgets constrain chunk size
 *
 * This module implements 3 strategies to compare:
 * 1. Fixed-size chunking (baseline)
 * 2. Semantic chunking (by function/class)
 * 3. Semantic with lookahead (preserve imports)
 */

import { CodeChunk, CodeChunkMetadata } from '../types/index.js';
import { ASTParser } from '../parser/ast-parser.js';

/**
 * Token estimator - rough approximation
 * More accurate would use actual tokenizer from embedding model
 */
export function estimateTokenCount(text: string): number {
  // Rule of thumb: ~1 token per 4 characters for English
  // Code might be different, but this is a reasonable estimate
  return Math.ceil(text.length / 4);
}

/**
 * Chunk configuration
 */
export interface ChunkingConfig {
  strategy: 'fixed' | 'semantic' | 'semantic-with-lookahead';
  maxTokens?: number;
  maxChars?: number;
  overlapTokens?: number;  // For overlapping windows
}

/**
 * Chunking result with metadata
 */
export interface ChunkingResult {
  chunks: CodeChunk[];
  strategy: string;
  statistics: {
    totalChunks: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    totalTokens: number;
    avgTokensPerChunk: number;
  };
}

/**
 * Semantic Chunking Strategy
 * Chunks by functions/classes/interfaces
 * Preserves complete code units
 *
 * Pros: Semantically meaningful chunks, respects code boundaries
 * Cons: Variable size, may exceed token limits, slower parsing
 */
export class SemanticChunker {
  private parser: ASTParser;
  private maxTokens: number;

  constructor(maxTokens: number = 1000) {
    this.parser = new ASTParser();
    this.maxTokens = maxTokens;
  }

  chunkFile(filePath: string, content: string): CodeChunk[] {
    const lines = content.split('\n');
    const structure = this.parser.parseFile(filePath, content);
    const chunks: CodeChunk[] = [];
    let chunkId = 0;

    // Extract imports (these should be at the top of many chunks)
    const importsEnd = this.findImportsEnd(lines);
    const importLines = lines.slice(0, importsEnd);
    const importText = importLines.join('\n');

    // Process each code node (function, class, interface)
    for (const node of structure.nodes) {
      // Include imports with each chunk for context
      const nodeLines = lines.slice(node.startLine - 1, node.endLine);
      let chunkContent = importText + '\n\n' + nodeLines.join('\n');

      // If chunk is too large, split it
      if (estimateTokenCount(chunkContent) > this.maxTokens) {
        // Split large functions/classes at logical boundaries
        const subChunks = this.splitLargeNode(
          filePath,
          nodeLines,
          node.startLine,
          importText
        );
        chunks.push(...subChunks.map((sub, idx) => ({
          ...sub,
          metadata: { ...sub.metadata, chunkIndex: chunks.length + idx }
        })));
      } else {
        const metadata: CodeChunkMetadata = {
          filePath,
          fileName: filePath.split('/').pop() || filePath,
          startLine: node.startLine,
          endLine: node.endLine,
          scopeName: node.name,
          scopeType: node.type as any,
          functionSignature: node.signature,
          imports: structure.imports,
          dependencies: structure.dependencies,
          isExported: structure.exports.includes(node.name),
          chunkIndex: chunks.length,
        };

        chunks.push({
          id: `${filePath}#${node.name}#${chunkId++}`,
          content: chunkContent,
          metadata,
          tokenCount: estimateTokenCount(chunkContent),
        });
      }
    }

    return chunks;
  }

  /**
   * Find where imports end in a file
   */
  private findImportsEnd(lines: string[]): number {
    let lastImportIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('export ')) {
        lastImportIndex = i;
      } else if (line !== '' && !line.startsWith('//')) {
        // Stop at first non-import, non-comment, non-empty line
        break;
      }
    }

    return lastImportIndex + 1;
  }

  /**
   * Split large code nodes at logical boundaries
   */
  private splitLargeNode(
    filePath: string,
    nodeLines: string[],
    nodeStartLine: number,
    importText: string
  ): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    let currentChunk: string[] = [];
    let currentTokens = estimateTokenCount(importText);

    for (const line of nodeLines) {
      const lineTokens = estimateTokenCount(line);

      // Start new chunk if adding this line would exceed limit
      if (currentTokens + lineTokens > this.maxTokens && currentChunk.length > 0) {
        const chunkContent = importText + '\n\n' + currentChunk.join('\n');
        chunks.push({
          id: `${filePath}#chunk#${chunks.length}`,
          content: chunkContent,
          metadata: {
            filePath,
            fileName: filePath.split('/').pop() || filePath,
            startLine: nodeStartLine + (nodeLines.length - currentChunk.length),
            endLine: nodeStartLine + nodeLines.length,
            imports: [],
            dependencies: [],
            isExported: false,
            chunkIndex: chunks.length,
          },
          tokenCount: estimateTokenCount(chunkContent),
        });

        currentChunk = [];
        currentTokens = estimateTokenCount(importText);
      }

      currentChunk.push(line);
      currentTokens += lineTokens;
    }

    // Add remaining lines
    if (currentChunk.length > 0) {
      const chunkContent = importText + '\n\n' + currentChunk.join('\n');
      chunks.push({
        id: `${filePath}#chunk#${chunks.length}`,
        content: chunkContent,
        metadata: {
          filePath,
          fileName: filePath.split('/').pop() || filePath,
          startLine: nodeStartLine,
          endLine: nodeStartLine + nodeLines.length,
          imports: [],
          dependencies: [],
          isExported: false,
          chunkIndex: chunks.length,
        },
        tokenCount: estimateTokenCount(chunkContent),
      });
    }

    return chunks;
  }
}

/**
 * Fixed-Size Chunking Strategy
 * Chunks at fixed character/token boundaries
 * Simple sliding window approach
 *
 * Pros: Fast, predictable, simple to implement
 * Cons: May split related code, loses semantic meaning
 */
export class FixedChunker {
  private chunkSize: number;
  private overlapSize: number;

  constructor(chunkSize: number = 500, overlapSize: number = 100) {
    this.chunkSize = chunkSize;
    this.overlapSize = overlapSize;
  }

  chunkFile(filePath: string, content: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    let chunkId = 0;

    // Simple character-based chunking with overlap
    for (let i = 0; i < content.length; i += this.chunkSize - this.overlapSize) {
      const chunkStart = i;
      const chunkEnd = Math.min(i + this.chunkSize, content.length);
      const chunkContent = content.substring(chunkStart, chunkEnd);

      // Calculate line numbers
      const startLineNum = content.substring(0, chunkStart).split('\n').length;
      const endLineNum = content.substring(0, chunkEnd).split('\n').length;

      const metadata: CodeChunkMetadata = {
        filePath,
        fileName: filePath.split('/').pop() || filePath,
        startLine: startLineNum,
        endLine: endLineNum,
        imports: [],
        dependencies: [],
        isExported: false,
        chunkIndex: chunks.length,
      };

      chunks.push({
        id: `${filePath}#fixed#${chunkId++}`,
        content: chunkContent,
        metadata,
        tokenCount: estimateTokenCount(chunkContent),
      });

      // Stop if we've reached the end
      if (chunkEnd === content.length) break;
    }

    return chunks;
  }
}

/**
 * Semantic Chunking with Lookahead
 * Like semantic, but also includes related context
 * - Imports at top of chunk
 * - Next class/function for context
 *
 * Pros: Better context, respects boundaries
 * Cons: Slower, more complex
 */
export class SemanticWithLookaheadChunker extends SemanticChunker {
  /**
   * Override to add lookahead for next code unit
   */
  chunkFile(filePath: string, content: string): CodeChunk[] {
    const baseChunks = super.chunkFile(filePath, content);

    // Add context by including next sibling when possible
    // This is simplified - in practice you'd track relationships better
    return baseChunks.map((chunk, idx) => {
      if (idx < baseChunks.length - 1) {
        // Add next chunk's first few lines as context
        const nextChunk = baseChunks[idx + 1];
        const contextLines = nextChunk.content.split('\n').slice(0, 3);
        const enhancedContent = chunk.content + '\n\n// Related code:\n' + contextLines.join('\n');

        return {
          ...chunk,
          content: enhancedContent,
          tokenCount: estimateTokenCount(enhancedContent),
        };
      }
      return chunk;
    });
  }
}

/**
 * Chunk multiple files using a strategy
 */
export async function chunkCodebase(
  files: Map<string, string>,
  config: ChunkingConfig
): Promise<ChunkingResult> {
  let chunker: SemanticChunker | FixedChunker;

  switch (config.strategy) {
    case 'fixed':
      chunker = new FixedChunker(config.maxChars || 500);
      break;
    case 'semantic':
      chunker = new SemanticChunker(config.maxTokens || 1000);
      break;
    case 'semantic-with-lookahead':
      chunker = new SemanticWithLookaheadChunker(config.maxTokens || 1000);
      break;
    default:
      throw new Error(`Unknown chunking strategy: ${config.strategy}`);
  }

  const allChunks: CodeChunk[] = [];

  for (const [filePath, content] of files.entries()) {
    const fileChunks = chunker.chunkFile(filePath, content);
    allChunks.push(...fileChunks);
  }

  // Calculate statistics
  const tokenCounts = allChunks.map(c => c.tokenCount || 0);
  const statistics = {
    totalChunks: allChunks.length,
    avgChunkSize: Math.round(
      allChunks.reduce((sum, c) => sum + c.content.length, 0) / allChunks.length
    ),
    minChunkSize: Math.min(...allChunks.map(c => c.content.length)),
    maxChunkSize: Math.max(...allChunks.map(c => c.content.length)),
    totalTokens: tokenCounts.reduce((a, b) => a + b, 0),
    avgTokensPerChunk: Math.round(
      tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length
    ),
  };

  return {
    chunks: allChunks,
    strategy: config.strategy,
    statistics,
  };
}
