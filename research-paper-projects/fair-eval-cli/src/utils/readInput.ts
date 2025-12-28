import * as fs from "node:fs/promises";

/**
 * Reads text from:
 *  - an inline value (highest precedence), OR
 *  - a file path, OR
 *  - stdin when filePath === "-"
 *
 *  Returns trimmed text, or an empty string if nothing provided.
 */

export async function readInputMaybeFileOrStdin(
  inlineValue?: string,
  filePath?: string,
): Promise<string> {
  if (inlineValue && inlineValue.trim().length > 0) {
    return inlineValue.trim();
  }

  if (!filePath || filePath.trim().length === 0) {
    return "";
  }

  const fp = filePath.trim();
  if (fp === "-") {
    return (await readStdin()).trim();
  }

  const buf = await fs.readFile(fp);
  return buf.toString("utf-8").trim();
}

async function readStdin(): Promise<string> {
  // Node reads stdin as a stream; accumulate chunks until 'end'
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    process.stdin.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    process.stdin.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });

    process.stdin.on("error", (err) => {
      reject(err);
    });

    // Ensure the stream is flowing
    process.stdin.resume();
  });
}
