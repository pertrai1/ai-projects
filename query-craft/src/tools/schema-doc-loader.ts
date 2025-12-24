import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { DocumentChunk, ChunkType } from "../types/index.js";

/**
 * Loads and chunks schema documentation from markdown files
 */
export class SchemaDocLoader {
  private docsBaseDir: string;
  private cache: Map<string, DocumentChunk[]> = new Map();

  constructor(docsBaseDir: string = "./data/schemas") {
    this.docsBaseDir = docsBaseDir;
  }

  /**
   * Load and chunk documentation for a database
   */
  async loadDocumentation(database: string): Promise<DocumentChunk[]> {
    // Check cache first
    const cacheKey = database;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const docsDir = join(this.docsBaseDir, database, "docs");

    // Handle missing documentation directory gracefully
    if (!existsSync(docsDir)) {
      console.info(
        `No documentation directory found for database '${database}' at ${docsDir}`,
      );
      return [];
    }

    try {
      const files = await readdir(docsDir);
      const mdFiles = files.filter((f) => f.endsWith(".md") && !f.startsWith("_"));

      const allChunks: DocumentChunk[] = [];

      for (const file of mdFiles) {
        try {
          const filePath = join(docsDir, file);
          const content = await readFile(filePath, "utf-8");
          const chunks = this.chunkDocument(content, file);
          allChunks.push(...chunks);
        } catch (error) {
          console.warn(
            `Failed to load documentation file ${file}: ${error}`,
          );
          // Continue with other files
        }
      }

      // Cache the results
      this.cache.set(cacheKey, allChunks);

      return allChunks;
    } catch (error) {
      console.error(
        `Error loading documentation for ${database}: ${error}`,
      );
      return [];
    }
  }

  /**
   * Parse markdown content and create chunks
   */
  private chunkDocument(content: string, filename: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    // Extract table name from first heading or filename
    const tableName = this.extractTableName(content, filename);

    // Split by markdown headers (## level)
    const sections = this.splitIntoSections(content);

    for (const section of sections) {
      const { header, content: sectionContent } = section;

      if (!sectionContent.trim()) continue;

      // Determine chunk type from section header
      const chunkType = this.determineChunkType(header);

      // Extract related tables and keywords
      const relatedTables = this.extractRelatedTables(sectionContent);
      const keywords = this.extractKeywords(header, sectionContent);

      // For "Columns" section, create individual column chunks
      if (chunkType === "column") {
        const columnChunks = this.extractColumnChunks(
          sectionContent,
          tableName
        );
        chunks.push(...columnChunks);
      } else if (chunkType === "query") {
        // For "Common Queries" section, create chunks per query pattern
        const queryChunks = this.extractQueryChunks(
          sectionContent,
          tableName
        );
        chunks.push(...queryChunks);
      } else {
        // Create single chunk for other sections
        chunks.push({
          content: sectionContent.trim(),
          table: tableName,
          chunkType,
          relatedTables,
          keywords,
          tokens: this.estimateTokens(sectionContent),
        });
      }
    }

    return chunks;
  }

  /**
   * Extract table name from document
   */
  private extractTableName(content: string, filename: string): string {
    // Look for "# Table: <name>" pattern
    const match = content.match(/^#\s+Table:\s+(\w+)/m);
    if (match) {
      return match[1];
    }

    // Fall back to filename without extension
    return filename.replace(/\.md$/, "");
  }

  /**
   * Split markdown into sections by ## headers
   */
  private splitIntoSections(content: string): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = [];
    const lines = content.split("\n");

    let currentHeader = "";
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check if this is a ## level header
      const headerMatch = line.match(/^##\s+(.+)/);

      if (headerMatch) {
        // Save previous section if exists
        if (currentHeader || currentContent.length > 0) {
          sections.push({
            header: currentHeader,
            content: currentContent.join("\n"),
          });
        }

        // Start new section
        currentHeader = headerMatch[1].trim();
        currentContent = [];
      } else {
        // Add line to current section
        currentContent.push(line);
      }
    }

    // Add last section
    if (currentHeader || currentContent.length > 0) {
      sections.push({
        header: currentHeader,
        content: currentContent.join("\n"),
      });
    }

    return sections;
  }

  /**
   * Determine chunk type from section header
   */
  private determineChunkType(header: string): ChunkType {
    const headerLower = header.toLowerCase();

    if (
      headerLower.includes("purpose") ||
      headerLower.includes("business context")
    ) {
      return "overview";
    }

    if (headerLower.includes("column")) {
      return "column";
    }

    if (headerLower.includes("query") || headerLower.includes("queries")) {
      return "query";
    }

    if (headerLower.includes("relationship")) {
      return "relationship";
    }

    if (
      headerLower.includes("example") ||
      headerLower.includes("note")
    ) {
      return "example";
    }

    return "overview"; // Default
  }

  /**
   * Extract individual column chunks from Columns section
   */
  private extractColumnChunks(
    content: string,
    tableName: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = content.split("\n");

    let currentColumn: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for ### column_name pattern
      const columnMatch = line.match(/^###\s+(\w+)/);

      if (columnMatch) {
        // Save previous column chunk
        if (currentColumn && currentContent.length > 0) {
          const columnContent = currentContent.join("\n").trim();
          chunks.push({
            content: columnContent,
            table: tableName,
            chunkType: "column",
            column: currentColumn,
            relatedTables: this.extractRelatedTables(columnContent),
            keywords: this.extractKeywords(currentColumn, columnContent),
            tokens: this.estimateTokens(columnContent),
          });
        }

        // Start new column
        currentColumn = columnMatch[1];
        currentContent = [];
      } else if (currentColumn) {
        currentContent.push(line);
      }
    }

    // Add last column
    if (currentColumn && currentContent.length > 0) {
      const columnContent = currentContent.join("\n").trim();
      chunks.push({
        content: columnContent,
        table: tableName,
        chunkType: "column",
        column: currentColumn,
        relatedTables: this.extractRelatedTables(columnContent),
        keywords: this.extractKeywords(currentColumn, columnContent),
        tokens: this.estimateTokens(columnContent),
      });
    }

    return chunks;
  }

  /**
   * Extract individual query pattern chunks from Common Queries section
   */
  private extractQueryChunks(
    content: string,
    tableName: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    // Split by ### Query Pattern: headers
    const patterns = content.split(/###\s+Query Pattern:/);

    for (let i = 1; i < patterns.length; i++) {
      const pattern = patterns[i].trim();
      if (!pattern) continue;

      chunks.push({
        content: pattern,
        table: tableName,
        chunkType: "query",
        relatedTables: this.extractRelatedTables(pattern),
        keywords: this.extractKeywords("query", pattern),
        tokens: this.estimateTokens(pattern),
      });
    }

    return chunks;
  }

  /**
   * Extract table names mentioned in content
   */
  private extractRelatedTables(content: string): string[] {
    const tables = new Set<string>();

    // Look for common patterns:
    // - FROM tablename
    // - JOIN tablename
    // - tablename.column
    // - references to tables in text

    const patterns = [
      /FROM\s+(\w+)/gi,
      /JOIN\s+(\w+)/gi,
      /(\w+)\.(\w+)/g, // table.column pattern
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          tables.add(match[1].toLowerCase());
        }
      }
    }

    // Also look for explicit table mentions in relationship descriptions
    const relationshipPatterns = [
      /table[s]?:\s*(\w+)/gi,
      /references?\s+(\w+)/gi,
    ];

    for (const pattern of relationshipPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          tables.add(match[1].toLowerCase());
        }
      }
    }

    return Array.from(tables);
  }

  /**
   * Extract keywords from header and content
   */
  private extractKeywords(header: string, content: string): string[] {
    const keywords = new Set<string>();

    // Add words from header
    const headerWords = header
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    headerWords.forEach((w) => keywords.add(w));

    // Extract important terms from content
    // Look for bolded terms, field names, SQL keywords
    const boldMatches = content.matchAll(/\*\*([^*]+)\*\*/g);
    for (const match of boldMatches) {
      if (match[1]) {
        keywords.add(match[1].toLowerCase());
      }
    }

    // SQL keywords and common terms
    const sqlKeywords = [
      "select",
      "from",
      "where",
      "join",
      "order",
      "group",
      "count",
      "sum",
      "avg",
    ];
    for (const keyword of sqlKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        keywords.add(keyword);
      }
    }

    return Array.from(keywords).slice(0, 10); // Limit to top 10
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 chars)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
