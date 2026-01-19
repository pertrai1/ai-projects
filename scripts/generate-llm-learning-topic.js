#!/usr/bin/env node

/**
 * Generate daily learning topics from recent arXiv and ACL Anthology papers
 *
 * Fetches papers from:
 * - arXiv API in areas: LLMs, agents, prompt engineering (cs.CL, cs.AI, cs.LG)
 * - ACL Anthology recent conference proceedings
 *
 * Usage:
 *   node scripts/generate-llm-learning-topic.js [--source arxiv|acl|random]
 *
 * Output:
 *   JSON object with env variables for the issue template
 */

import https from "https";
import { parseString } from "xml2js";

// Configuration
const ARXIV_API = "https://export.arxiv.org/api/query";
const ACL_ANTHOLOGY_BASE = "https://aclanthology.org";
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

// ACL Anthology volumes to search (recent major conferences)
const ACL_VOLUMES = [
  "2024.acl-long",
  "2024.acl-short",
  "2024.emnlp-main",
  "2024.naacl-long",
  "2024.naacl-short",
  "2024.eacl-long",
  "2024.findings-acl",
  "2024.findings-emnlp",
  "2023.acl-long",
  "2023.emnlp-main",
];

// LLM-related keywords for filtering ACL papers
const LLM_KEYWORDS = [
  "language model",
  "llm",
  "gpt",
  "transformer",
  "prompt",
  "instruction",
  "fine-tun",
  "alignment",
  "rlhf",
  "reasoning",
  "chain-of-thought",
  "in-context",
  "retrieval",
  "rag",
  "agent",
  "tool use",
  "generation",
  "evaluation",
  "benchmark",
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
 * Make an HTTPS GET request
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        // Handle redirects
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return httpsGet(res.headers.location).then(resolve).catch(reject);
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(
              new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`),
            );
          } else {
            resolve(data);
          }
        });
      })
      .on("error", reject);
  });
}

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
function fetchArxivPapers(query, maxResults = 20) {
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
 * Fetch papers with titles and abstracts directly from ACL Anthology volume page
 * This extracts data from the volume page to minimize HTTP requests
 */
async function fetchAclVolumePapers(volume) {
  const url = `${ACL_ANTHOLOGY_BASE}/volumes/${volume}/`;
  const html = await httpsGet(url);

  const papers = [];

  // The HTML structure has paper entries like:
  // <strong><a class=align-middle href=/2024.acl-long.1/>Title Text</a></strong>
  // followed by abstract in: <div class="card-body p-3 small">Abstract</div>

  // Extract paper IDs and titles - note: href has no quotes in minified HTML
  // Pattern matches: href=/2024.acl-long.1/>Title</a>
  const paperPattern =
    /<strong><a[^>]*href=\/([^/]+)\/?>([^<]*(?:<span[^>]*>[^<]*<\/span>[^<]*)*)<\/a><\/strong>/g;
  let paperMatch;
  const paperData = [];

  while ((paperMatch = paperPattern.exec(html)) !== null) {
    const paperId = paperMatch[1];
    // Skip the proceedings entry (ends with .0)
    if (paperId.endsWith(".0")) continue;

    let title = paperMatch[2].trim();
    // Clean up title - remove span tags used for case preservation
    title = title.replace(/<span[^>]*>([^<]*)<\/span>/g, "$1");
    title = title.replace(/<[^>]+>/g, ""); // Remove any remaining tags

    if (title) {
      paperData.push({ id: paperId, title });
    }
  }

  // Extract abstracts - they appear in collapse divs
  // Pattern: <div class="card-body p-3 small">Abstract content</div>
  const abstractPattern = /<div class="card-body p-3 small">([^]*?)<\/div>/g;
  let abstractMatch;
  const abstracts = [];

  while ((abstractMatch = abstractPattern.exec(html)) !== null) {
    let abstract = abstractMatch[1]
      .replace(/<[^>]+>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ")
      .trim();
    abstracts.push(abstract);
  }

  // Combine papers with their abstracts
  for (let i = 0; i < paperData.length; i++) {
    const paper = paperData[i];
    const abstract = abstracts[i] || "";

    // Extract year from paper ID
    const yearMatch = paper.id.match(/^(\d{4})\./);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    papers.push({
      id: paper.id,
      title: paper.title,
      abstract: abstract,
      url: `${ACL_ANTHOLOGY_BASE}/${paper.id}/`,
      pdfUrl: `${ACL_ANTHOLOGY_BASE}/${paper.id}.pdf`,
      published: year,
      source: "ACL Anthology",
    });
  }

  return papers;
}

/**
 * Check if paper is LLM-related based on title and abstract
 */
function isLlmRelated(title, abstract) {
  const text = ((title || "") + " " + (abstract || "")).toLowerCase();
  return LLM_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * Fetch LLM-related papers from ACL Anthology
 */
async function fetchAclPapers(maxPapers = 20) {
  const allPapers = [];

  // Try multiple volumes until we have enough papers
  const shuffledVolumes = [...ACL_VOLUMES].sort(() => Math.random() - 0.5);

  for (const volume of shuffledVolumes) {
    if (allPapers.length >= maxPapers) break;

    try {
      console.error(`Fetching ACL volume: ${volume}`);
      const papers = await fetchAclVolumePapers(volume);

      // Filter for LLM-related papers and add to collection
      for (const paper of papers) {
        if (allPapers.length >= maxPapers) break;

        if (paper.title && isLlmRelated(paper.title, paper.abstract)) {
          allPapers.push(paper);
          console.error(`  Found: ${paper.title.substring(0, 60)}...`);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch volume ${volume}: ${err.message}`);
    }

    // Small delay between volumes to be respectful to the server
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return allPapers;
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
  if (!abstract) return "Core Mechanism";

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
  const text = ((title || "") + " " + (abstract || "")).toLowerCase();

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
  if (!abstract) return "What are the key contributions of this work?";

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
 * Generate topic from arXiv
 */
async function generateFromArxiv() {
  const query = buildQuery();
  console.error(`Searching arXiv: ${query}`);

  const result = await fetchArxivPapers(query);

  if (!result.feed || !result.feed.entry) {
    throw new Error("No papers found in arXiv response");
  }

  const papers = Array.isArray(result.feed.entry)
    ? result.feed.entry
    : [result.feed.entry];

  // Select a random recent paper
  const paper = papers[Math.floor(Math.random() * Math.min(papers.length, 10))];

  const rawTitle = paper.title[0].replace(/\s+/g, " ").trim();
  const title = stripLatex(rawTitle);
  const abstract = paper.summary[0].replace(/\s+/g, " ").trim();
  const url = paper.id[0];
  const published = paper.published[0].split("T")[0];

  return {
    title,
    abstract,
    url,
    published,
    source: "arXiv",
  };
}

/**
 * Generate topic from ACL Anthology
 */
async function generateFromAcl() {
  console.error("Searching ACL Anthology...");

  const papers = await fetchAclPapers(10);

  if (papers.length === 0) {
    throw new Error("No LLM-related papers found in ACL Anthology");
  }

  // Select a random paper
  const paper = papers[Math.floor(Math.random() * papers.length)];

  return {
    title: paper.title,
    abstract: paper.abstract,
    url: paper.url,
    published: paper.published,
    source: "ACL Anthology",
  };
}

/**
 * Select a paper and generate topic metadata
 */
async function generateTopic(preferredSource = "random") {
  const maxRetries = 3;
  let lastError;

  // Determine which source to use
  let sources;
  if (preferredSource === "arxiv") {
    sources = ["arxiv"];
  } else if (preferredSource === "acl") {
    sources = ["acl"];
  } else {
    // Random: 60% arXiv (more papers), 40% ACL
    sources = Math.random() < 0.6 ? ["arxiv", "acl"] : ["acl", "arxiv"];
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const source of sources) {
      try {
        console.error(`Attempt ${attempt}/${maxRetries} using ${source}...`);

        let paper;
        if (source === "arxiv") {
          paper = await generateFromArxiv();
        } else {
          paper = await generateFromAcl();
        }

        const concept = extractConcept(paper.abstract);
        const bucket = classifyBucket(paper.title, paper.abstract);
        const researchQuestion = extractResearchQuestion(paper.abstract);

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
          TOPIC: paper.title.substring(0, 100),
          PAPER_TITLE: paper.title,
          PAPER_URL: paper.url,
          PAPER_DATE: paper.published,
          PAPER_SOURCE: paper.source,
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

        // Success - exit
        return;
      } catch (error) {
        lastError = error;
        console.error(`${source} failed: ${error.message}`);
      }
    }

    if (attempt < maxRetries) {
      const delay = attempt * 2000; // Exponential backoff: 2s, 4s
      console.error(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  console.error(`\nAll ${maxRetries} attempts failed.`);
  console.error("Last error:", lastError.message);
  process.exit(1);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let source = "random";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source" && args[i + 1]) {
      source = args[i + 1].toLowerCase();
      if (!["arxiv", "acl", "random"].includes(source)) {
        console.error(`Invalid source: ${source}. Using 'random'.`);
        source = "random";
      }
    }
  }

  return { source };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const { source } = parseArgs();
  generateTopic(source);
}

export { generateTopic, fetchArxivPapers as fetchPapers, fetchAclPapers };
