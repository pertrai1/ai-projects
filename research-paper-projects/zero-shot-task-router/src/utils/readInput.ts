import { readFile } from "node:fs/promises";

const readStdin = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: string[] = [];

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) =>
      chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8")),
    );
    process.stdin.on("end", () => resolve(chunks.join("")));
    process.stdin.on("error", (error) => reject(error));
  });

export const resolveInput = async (
  inputText: string | undefined,
  inputFile: string | undefined,
): Promise<string | undefined> => {
  if (inputText) {
    return inputText;
  }

  if (!inputFile) {
    return undefined;
  }

  if (inputFile === "-") {
    return readStdin();
  }

  return readFile(inputFile, "utf8");
};
