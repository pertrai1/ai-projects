/**
 * File discovery and reading utilities
 *
 * Learning focus (Phase 0):
 * - How to systematically discover and read code files
 * - Handling file system operations efficiently
 * - Building a codebase inventory
 */
export interface FileInfo {
    path: string;
    name: string;
    extension: string;
    size: number;
    language: string;
}
/**
 * Discover all code files in a directory
 */
export declare function discoverCodeFiles(dirPath: string, options?: {
    extensions?: string[];
    excludeDirs?: string[];
    maxDepth?: number;
}): FileInfo[];
/**
 * Read a file's content
 */
export declare function readFile(filePath: string): string;
/**
 * Read multiple files efficiently
 */
export declare function readFiles(filePaths: string[]): Map<string, string>;
/**
 * Get summary statistics about discovered files
 */
export declare function getFileStats(files: FileInfo[]): {
    totalFiles: number;
    totalSize: number;
    byLanguage: Record<string, number>;
};
//# sourceMappingURL=file-discovery.d.ts.map