/**
 * File discovery and reading utilities
 *
 * Learning focus (Phase 0):
 * - How to systematically discover and read code files
 * - Handling file system operations efficiently
 * - Building a codebase inventory
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
/**
 * Discover all code files in a directory
 */
export function discoverCodeFiles(dirPath, options = {}) {
    const { extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'], excludeDirs = ['node_modules', '.git', 'dist', 'build', '.venv', '__pycache__'], maxDepth = Infinity, } = options;
    const files = [];
    function walkDir(currentPath, depth) {
        if (depth > maxDepth)
            return;
        try {
            const entries = readdirSync(currentPath);
            for (const entry of entries) {
                const fullPath = join(currentPath, entry);
                const stat = statSync(fullPath);
                // Skip excluded directories
                if (stat.isDirectory()) {
                    if (!excludeDirs.includes(entry)) {
                        walkDir(fullPath, depth + 1);
                    }
                }
                else if (stat.isFile()) {
                    const ext = extname(entry);
                    // Only include code files
                    if (extensions.includes(ext)) {
                        files.push({
                            path: fullPath,
                            name: entry,
                            extension: ext,
                            size: stat.size,
                            language: detectLanguage(ext),
                        });
                    }
                }
            }
        }
        catch (error) {
            // Handle permission errors gracefully
            console.warn(`Could not read directory ${currentPath}:`, error);
        }
    }
    walkDir(dirPath, 0);
    return files;
}
/**
 * Read a file's content
 */
export function readFile(filePath) {
    try {
        return readFileSync(filePath, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}
/**
 * Read multiple files efficiently
 */
export function readFiles(filePaths) {
    const contents = new Map();
    for (const filePath of filePaths) {
        contents.set(filePath, readFile(filePath));
    }
    return contents;
}
/**
 * Detect programming language from file extension
 */
function detectLanguage(ext) {
    const languageMap = {
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.py': 'python',
        '.go': 'go',
        '.rs': 'rust',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.rb': 'ruby',
        '.php': 'php',
    };
    return languageMap[ext] || 'unknown';
}
/**
 * Get summary statistics about discovered files
 */
export function getFileStats(files) {
    const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        byLanguage: {},
    };
    for (const file of files) {
        stats.byLanguage[file.language] = (stats.byLanguage[file.language] || 0) + 1;
    }
    return stats;
}
//# sourceMappingURL=file-discovery.js.map