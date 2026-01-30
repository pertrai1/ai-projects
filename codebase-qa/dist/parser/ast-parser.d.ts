/**
 * AST Parser for extracting code structure
 *
 * Learning focus (Phase 0):
 * - Abstract Syntax Trees (ASTs) help us understand code structure programmatically
 * - Metadata preservation ensures we track context (line numbers, scope, relationships)
 * - Code as Data: understanding code semantically, not just as text
 *
 * This uses a simplified parsing approach for demonstration.
 * In production, you'd use typescript compiler API or similar.
 */
import { FileStructure } from '../types/index.js';
export declare class ASTParser {
    /**
     * Parse a TypeScript/JavaScript file and extract its structure
     *
     * Key learning: This demonstrates extracting semantic structure from text
     */
    parseFile(filePath: string, content: string): FileStructure;
    /**
     * Extract function definitions with metadata
     * Learning: Understanding function scope and signatures
     */
    private extractFunctions;
    /**
     * Extract class definitions with metadata
     */
    private extractClasses;
    /**
     * Extract interface definitions
     */
    private extractInterfaces;
    /**
     * Find the end line of a code block (matching braces)
     * Learning: Understanding code structure through brace matching
     */
    private findBlockEnd;
    /**
     * Detect programming language from file extension
     */
    private detectLanguage;
    /**
     * Extract documentation/comments for a node
     * Learning: Comments are metadata that help understand code intent
     */
    getDocumentation(lines: string[], nodeStartLine: number): string | undefined;
}
/**
 * Usage example demonstrating AST parsing
 */
export declare function parseCodebaseStructure(): Promise<Map<string, FileStructure>>;
//# sourceMappingURL=ast-parser.d.ts.map