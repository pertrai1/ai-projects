import { tool } from "ai";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

/**
 * Read file contents
 */
export const readFile = tool({
  description:
    "Read the contents of a file at the specified path. Use this to examine file contents.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to read"),
  }),
  execute: async ({ path: filePath }: { path: string }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        return `Error: File not found: ${filePath}`;
      }
      return `Error reading file: ${err.message}`;
    }
  },
});

/**
 * Write content to a file
 */
export const writeFile = tool({
  description:
    "Write content to a file at the specified path. Creates the file if it doesn't exist, overwrites if it does.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file"),
  }),
  execute: async ({
    path: filePath,
    content,
  }: {
    path: string;
    content: string;
  }) => {
    try {
      // Create parent directories if they don't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, content, "utf-8");
      return `Successfully wrote ${content.length} characters to ${filePath}`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      return `Error writing file: ${err.message}`;
    }
  },
});

/**
 * List files in a directory
 */
export const listFiles = tool({
  description:
    "List all files and directories in the specified directory path.",
  inputSchema: z.object({
    directory: z
      .string()
      .describe("The directory path to list contents of")
      .default("."),
  }),
  execute: async ({ directory }: { directory: string }) => {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      const items = entries.map((entry) => {
        const type = entry.isDirectory() ? "[dir]" : "[file]";
        return `${type} ${entry.name}`;
      });
      return items.length > 0
        ? items.join("\n")
        : `Directory ${directory} is empty`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        return `Error: Directory not found: ${directory}`;
      }
      return `Error listing directory: ${err.message}`;
    }
  },
});

/**
 * Delete a file
 */
export const deleteFile = tool({
  description:
    "Delete a file at the specified path. Use with caution as this is irreversible.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to delete"),
  }),
  execute: async ({ path: filePath }: { path: string }) => {
    try {
      await fs.unlink(filePath);
      return `Successfully deleted ${filePath}`;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        return `Error: File not found: ${filePath}`;
      }
      return `Error deleting file: ${err.message}`;
    }
  },
});
