import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import type { DocumentChunk, ProcessingOptions } from "../types/document.js";

export class PDFProcessor {
  /**
   * Extract text and metadata from PDF
   */
  async extractText(pdfPath: string): Promise<{
    text: string;
    numPages: number;
    pages: Array<{ pageNumber: number; text: string }>;
  }> {
    const dataBuffer = await fs.readFile(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const data = {
      text: result.text,
      numpages: result.total,
    };

    // Extract page-by-page text
    const pages: Array<{ pageNumber: number; text: string }> = [];

    // pdf-parse doesn't give page-by-page by default,
    // need to split by page breaks or process differently
    // For now, split the text into roughly equal pages
    const textPerPage = Math.ceil(data.text.length / data.numpages);

    for (let i = 0; i < data.numpages; i++) {
      const start = i * textPerPage;
      const end = Math.min((i + 1) * textPerPage, data.text.length);
      pages.push({
        pageNumber: i + 1,
        text: data.text.substring(start, end),
      });
    }

    return {
      text: data.text,
      numPages: data.numpages,
      pages,
    };
  }

  /**
   * Detect sections in the document based on headings
   */
  detectSections(text: string): Array<{
    title: string;
    startIndex: number;
    endIndex?: number;
  }> {
    const sections: Array<{
      title: string;
      startIndex: number;
      endIndex?: number;
    }> = [];

    // PLANTS doc has sections like "Introduction", "Culturally Significant Plants", etc.
    // We'll look for lines that are all caps or title case followed by newlines
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect section headers (all caps, or title case with no punctuation at end)
      if (
        line.length > 0 &&
        line.length < 100 && // Headers are usually short
        (line === line.toUpperCase() || // All caps
          (line[0] === line[0].toUpperCase() && !line.endsWith("."))) && // Title case, no period
        !line.match(/^\d/) // Doesn't start with a number
      ) {
        const startIndex = text.indexOf(line);
        if (startIndex !== -1) {
          // Set end index of previous section
          if (sections.length > 0) {
            sections[sections.length - 1].endIndex = startIndex;
          }

          sections.push({
            title: line,
            startIndex,
          });
        }
      }
    }

    // Set end of last section
    if (sections.length > 0) {
      sections[sections.length - 1].endIndex = text.length;
    }

    return sections;
  }

  /**
   * Create chunks from text with overlap
   */
  createChunks(
    text: string,
    sourcePath: string,
    options: ProcessingOptions = {},
  ): DocumentChunk[] {
    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      respectSections = true,
    } = options;

    const chunks: DocumentChunk[] = [];

    if (respectSections) {
      // Detect sections first
      const sections = this.detectSections(text);

      for (const section of sections) {
        const sectionText = text.substring(
          section.startIndex,
          section.endIndex || text.length,
        );

        // Chunk each section separately
        const sectionChunks = this.chunkText(
          sectionText,
          chunkSize,
          chunkOverlap,
        );

        sectionChunks.forEach((content, index) => {
          chunks.push({
            id: uuidv4(),
            content,
            metadata: {
              source: sourcePath,
              page: 0, // update this later with actual page numbers
              section: section.title,
              chunkIndex: index,
              totalChunks: sectionChunks.length,
            },
          });
        });
      }
    } else {
      // Simple chunking without section awareness
      const textChunks = this.chunkText(text, chunkSize, chunkOverlap);

      textChunks.forEach((content, index) => {
        chunks.push({
          id: uuidv4(),
          content,
          metadata: {
            source: sourcePath,
            page: 0,
            chunkIndex: index,
            totalChunks: textChunks.length,
          },
        });
      });
    }

    return chunks;
  }

  /**
   * Split text into chunks with overlap
   */
  private chunkText(
    text: string,
    chunkSize: number,
    overlap: number,
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);

      // Try to break at a sentence or paragraph boundary
      if (end < text.length) {
        // Look for period, newline, or other natural break
        const breakPoints = ["\n\n", "\n", ". ", "! ", "? "];
        let bestBreak = end;

        for (const breakPoint of breakPoints) {
          const breakIndex = text.lastIndexOf(breakPoint, end);
          if (breakIndex > start && breakIndex < end) {
            bestBreak = breakIndex + breakPoint.length;
            break;
          }
        }

        end = bestBreak;
      }

      const chunkText = text.substring(start, end).trim();
      if (chunkText.length > 0) {
        chunks.push(chunkText);
      }

      // Move start position, ensuring we always make progress
      const nextStart = Math.max(start + 1, end - overlap);

      // Prevent infinite loop: if we're not making progress, jump ahead
      if (nextStart <= start) {
        start = end;
      } else {
        start = nextStart;
      }
    }

    return chunks;
  }

  /**
   * Assign page numbers to chunks based on page text
   */
  assignPageNumbers(
    chunks: DocumentChunk[],
    pages: Array<{ pageNumber: number; text: string }>,
  ): DocumentChunk[] {
    return chunks.map((chunk) => {
      // Find which page this chunk belongs to
      for (const page of pages) {
        if (page.text.includes(chunk.content.substring(0, 100))) {
          return {
            ...chunk,
            metadata: {
              ...chunk.metadata,
              page: page.pageNumber,
            },
          };
        }
      }
      return chunk;
    });
  }
}

export const pdfProcessor = new PDFProcessor();
