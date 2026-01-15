#!/usr/bin/env node

/**
 * Download and summarize research paper from arXiv PDF
 *
 * Usage:
 *   node scripts/summarize-paper.js <paper_url>
 *
 * Example:
 *   node scripts/summarize-paper.js http://arxiv.org/abs/2601.00698v1
 *
 * Output:
 *   Markdown formatted summary of the paper
 */

import https from 'https';
import http from 'http';
import OpenAI from 'openai';

const SUMMARY_MAX_TOKENS = 1000;
const MAX_PDF_TEXT_LENGTH = 50000; // Limit text to avoid token limits
const MAX_REDIRECTS = 5; // Prevent infinite redirect loops
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Convert arXiv abstract URL to PDF URL
 */
function convertToPdfUrl(url) {
  return url.replace('/abs/', '/pdf/');
}

/**
 * Download PDF from URL with redirect handling
 */
async function downloadPdf(url, redirectCount = 0) {
  if (redirectCount >= MAX_REDIRECTS) {
    throw new Error('Too many redirects');
  }

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, { timeout: REQUEST_TIMEOUT }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadPdf(res.headers.location, redirectCount + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download PDF: HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract text from PDF buffer
 * Uses dynamic import for CommonJS pdf-parse module
 */
let pdfParseModule = null;

async function extractTextFromPdf(pdfBuffer) {
  try {
    // Cache the pdf-parse module after first import
    if (!pdfParseModule) {
      pdfParseModule = (await import('pdf-parse')).default;
    }
    const data = await pdfParseModule(pdfBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Clean and truncate PDF text
 */
function cleanPdfText(text) {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();

  // Truncate if too long
  if (cleaned.length > MAX_PDF_TEXT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_PDF_TEXT_LENGTH);
    // Try to cut at a sentence boundary
    const lastPeriod = cleaned.lastIndexOf('. ');
    if (lastPeriod > MAX_PDF_TEXT_LENGTH * 0.9) {
      cleaned = cleaned.substring(0, lastPeriod + 1);
    }
  }

  return cleaned;
}

/**
 * Generate summary using OpenAI API
 */
async function generateSummary(paperText, paperUrl) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set.');
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `
You are a research assistant helping someone learn about AI/ML research papers.

Your task is to provide a high-level summary of the following research paper that includes:
1. The main research question or problem being addressed
2. The key approach or methodology proposed
3. The main findings or contributions (3-5 key points)
4. The significance and potential impact of the work
5. Any important limitations or future work mentioned

Please format your response in clear, structured markdown with appropriate headers.
Keep the summary concise but comprehensive (aim for 300-500 words).
Focus on the most important insights that would help someone understand what this paper is about and why it matters.

Paper content:
${paperText}
`.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: SUMMARY_MAX_TOKENS,
      temperature: 0.3
    });

    const summaryText = response.choices[0]?.message?.content?.trim();

    if (!summaryText) {
      throw new Error('LLM returned empty response.');
    }

    return summaryText;
  } catch (err) {
    if (err.status === 429) {
      throw new Error('Rate limit exceeded. Try again later.');
    } else if (err.status === 401) {
      throw new Error('Invalid API key.');
    }
    throw new Error(`LLM request failed: ${err.message || err}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    if (process.argv.length < 3) {
      console.error('Usage: node summarize-paper.js <paper_url>');
      console.error(
        'Example: node summarize-paper.js http://arxiv.org/abs/2601.00698v1'
      );
      process.exit(1);
    }

    const paperUrl = process.argv[2];
    console.error(`Processing paper: ${paperUrl}`);

    // Convert to PDF URL
    const pdfUrl = convertToPdfUrl(paperUrl);
    console.error(`PDF URL: ${pdfUrl}`);

    // Download PDF
    console.error('Downloading PDF...');
    const pdfBuffer = await downloadPdf(pdfUrl);
    console.error(`Downloaded ${pdfBuffer.length} bytes`);

    // Extract text
    console.error('Extracting text from PDF...');
    const rawText = await extractTextFromPdf(pdfBuffer);
    console.error(`Extracted ${rawText.length} characters`);

    // Clean and truncate text
    const cleanedText = cleanPdfText(rawText);
    console.error(`Cleaned text: ${cleanedText.length} characters`);

    // Generate summary
    console.error('Generating summary...');
    const summary = await generateSummary(cleanedText, paperUrl);

    // Output formatted result
    const output = `
## Paper Summary

**Source:** ${paperUrl}

${summary}

---

*This summary was automatically generated by reviewing the paper PDF.*
`.trim();

    console.log(output);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
