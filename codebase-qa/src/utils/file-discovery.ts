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
export function discoverCodeFiles(
  dirPath: string,
  options: {
    extensions?: string[];
    excludeDirs?: string[];
    maxDepth?: number;
  } = {}
): FileInfo[] {
  const {
    extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'],
    excludeDirs = ['node_modules', '.git', 'dist', 'build', '.venv', '__pycache__'],
    maxDepth = Infinity,
  } = options;

  const files: FileInfo[] = [];

  function walkDir(currentPath: string, depth: number) {
    if (depth > maxDepth) return;

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
        } else if (stat.isFile()) {
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
    } catch (error) {
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
export function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

/**
 * Read multiple files efficiently
 */
export function readFiles(filePaths: string[]): Map<string, string> {
  const contents = new Map<string, string>();

  for (const filePath of filePaths) {
    contents.set(filePath, readFile(filePath));
  }

  return contents;
}

/**
 * Detect programming language from file extension
 */
function detectLanguage(ext: string): string {
  const languageMap: Record<string, string> = {
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
export function getFileStats(files: FileInfo[]): {
  totalFiles: number;
  totalSize: number;
  byLanguage: Record<string, number>;
} {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    byLanguage: {} as Record<string, number>,
  };

  for (const file of files) {
    stats.byLanguage[file.language] = (stats.byLanguage[file.language] || 0) + 1;
  }

  return stats;
}
