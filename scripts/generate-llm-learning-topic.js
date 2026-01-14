#!/usr/bin/env node

/**
 * Generate daily learning topics from recent arXiv papers
 *
 * Fetches papers from arXiv API in areas: LLMs, agents, prompt engineering
 * Categories: cs.CL, cs.AI, cs.LG
 *
 * Usage:
 *   node scripts/generate-llm-learning-topic.js
 *
 * Output:
 *   JSON object with env variables for the issue template
 */

import https from "https";
import { parseString } from "xml2js";

// Configuration
const ARXIV_API = "https://export.arxiv.org/api/query";
const CATEGORIES = ["cs.CL", "cs.AI", "cs.LG"];
const SEARCH_TERMS = [
  'LLM OR "large language model"',
  'agents OR "autonomous agents"',
  '"prompt engineering" OR prompting',
  'RAG OR "retrieval augmented"',
  'reasoning OR "chain of thought"',
  "alignment OR RLHF",
  '"in-context learning"',
  'tool use OR "function calling"',
];

const BUCKETS = [
  "Architecture",
  "Training & Optimization",
  "Prompting & Control",
  "Evaluation & Benchmarking",
  "Safety & Alignment",
  "Multi-Agent Systems",
  "Retrieval & Knowledge",
  "Reasoning & Planning",
];

/**
 * Build arXiv query string
 */
function buildQuery() {
  const randomTerm =
    SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const categoryFilter = CATEGORIES.map((cat) => `cat:${cat}`).join(" OR ");

  return `(${randomTerm}) AND (${categoryFilter})`;
}

/**
 * Fetch papers from arXiv API
 */
function fetchPapers(query, maxResults = 20) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      search_query: query,
      start: 0,
      max_results: maxResults,
      sortBy: "submittedDate",
      sortOrder: "descending",
    });

    const url = `${ARXIV_API}?${params}`;

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          // Check HTTP status
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `arXiv API returned status ${res.statusCode}: ${data.substring(0, 200)}`,
              ),
            );
            return;
          }

          // Check if response looks like XML
          const trimmedData = data.trim();
          if (
            !trimmedData.startsWith("<?xml") &&
            !trimmedData.startsWith("<")
          ) {
            reject(
              new Error(
                `arXiv API returned non-XML response: ${trimmedData.substring(0, 200)}`,
              ),
            );
            return;
          }

          parseString(data, (err, result) => {
            if (err) {
              reject(new Error(`XML parsing failed: ${err.message}`));
            } else {
              resolve(result);
            }
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Strip LaTeX formatting from text
 */
function stripLatex(text) {
  return text
    .replace(/\\textit\{([^}]+)\}/g, "$1")
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\\emph\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .trim();
}

/**
 * Extract key concept from paper abstract
 */
function extractConcept(abstract) {
  // Strip LaTeX first
  const cleanAbstract = stripLatex(abstract);

  // Simple extraction heuristics
  const patterns = [
    /we (propose|present|introduce) ([^,.]+)/i,
    /([A-Z][A-Za-z-]+) (?:is|are) (?:a|an) (?:novel|new) (method|approach|technique|framework)/i,
    /(method|approach|technique|framework) (?:called|named) ([A-Z][A-Za-z-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanAbstract.match(pattern);
    if (match) {
      return stripLatex(match[2] || match[1]);
    }
  }

  // Fallback: extract first capitalized technical term
  const technicalTerms =
    cleanAbstract.match(/\b[A-Z][a-z]+(?:-[A-Z][a-z]+)*\b/g) || [];
  return technicalTerms[0] || "Core Mechanism";
}

/**
 * Classify paper into bucket
 */
function classifyBucket(title, abstract) {
  const text = (title + " " + abstract).toLowerCase();

  if (text.match(/architecture|model|transformer|attention/))
    return "Architecture";
  if (text.match(/training|optimization|fine-tun|gradient/))
    return "Training & Optimization";
  if (text.match(/prompt|instruction|control|steer/))
    return "Prompting & Control";
  if (text.match(/benchmark|evaluat|metric|test/))
    return "Evaluation & Benchmarking";
  if (text.match(/safety|alignment|rlhf|harmful|honest/))
    return "Safety & Alignment";
  if (text.match(/multi-agent|agent|tool|action/)) return "Multi-Agent Systems";
  if (text.match(/retrieval|rag|knowledge|memory/))
    return "Retrieval & Knowledge";
  if (text.match(/reasoning|thought|planning|strategy/))
    return "Reasoning & Planning";

  return BUCKETS[Math.floor(Math.random() * BUCKETS.length)];
}

/**
 * Extract research question from abstract
 */
function extractResearchQuestion(abstract) {
  // Strip LaTeX first
  const cleanAbstract = stripLatex(abstract);

  // Look for question patterns
  const questionMatch = cleanAbstract.match(
    /(?:How|What|Why|Can|Does) [^.?]+\?/,
  );
  if (questionMatch) return questionMatch[0];

  // Look for problem statements
  const problemMatch = cleanAbstract.match(
    /(?:challenge|problem|question) (?:is|of) ([^.]+)/i,
  );
  if (problemMatch) return `How to address: ${problemMatch[1].trim()}?`;

  // Fallback: extract first sentence as implicit question
  const firstSentence = cleanAbstract.split(/[.!?]/)[0];
  return `${firstSentence.trim()}?`;
}

/**
 * Select a paper and generate topic metadata
 */
async function generateTopic() {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const query = buildQuery();
      console.error(
        `Searching arXiv (attempt ${attempt}/${maxRetries}): ${query}`,
      );

      const result = await fetchPapers(query);

      if (!result.feed || !result.feed.entry) {
        throw new Error("No papers found in arXiv response");
      }

      const papers = Array.isArray(result.feed.entry)
        ? result.feed.entry
        : [result.feed.entry];

      // Select a random recent paper
      const paper =
        papers[Math.floor(Math.random() * Math.min(papers.length, 10))];

      const rawTitle = paper.title[0].replace(/\s+/g, " ").trim();
      const title = stripLatex(rawTitle);
      const abstract = paper.summary[0].replace(/\s+/g, " ").trim();
      const url = paper.id[0];
      const published = paper.published[0].split("T")[0];

      const concept = extractConcept(abstract);
      const bucket = classifyBucket(title, abstract);
      const researchQuestion = extractResearchQuestion(abstract);

      // Determine system type
      const systemTypes = [
        "Agent System",
        "Training Pipeline",
        "Inference System",
        "Evaluation Framework",
      ];
      const systemType =
        systemTypes[Math.floor(Math.random() * systemTypes.length)];

      // Generate output
      const output = {
        TOPIC: title.substring(0, 100),
        PAPER_TITLE: title,
        PAPER_URL: url,
        PAPER_DATE: published,
        BUCKET: bucket,
        FOCUS: concept,
        CONCEPT: concept,
        RESEARCH_QUESTION: researchQuestion,
        SYSTEM_TYPE: systemType,
        CONFIDENCE: "50",
        DATE: new Date().toISOString().split("T")[0],
      };

      console.log(JSON.stringify(output, null, 2));

      // Also output as env format for GitHub Actions
      console.error("\n--- GitHub Actions format ---");
      for (const [key, value] of Object.entries(output)) {
        console.error(`${key}=${value}`);
      }

      // Success - exit the retry loop
      return;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s
        console.error(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error(`\nAll ${maxRetries} attempts failed.`);
  console.error("Last error:", lastError.message);
  process.exit(1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTopic();
}

export { generateTopic, fetchPapers };
