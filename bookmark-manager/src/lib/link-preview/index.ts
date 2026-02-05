import { parseHTML } from 'linkedom';
import type { LinkMetadata } from '@/types/bookmark';

const MAX_URL_LENGTH = 2048;
const FETCH_TIMEOUT_MS = 10000;
const MAX_RESPONSE_SIZE = 1024 * 1024; // 1MB

// Private IP ranges (CIDR notation)
const PRIVATE_IP_RANGES = [
  /^127\./,                          // 127.0.0.0/8 (localhost)
  /^10\./,                           // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
];

/**
 * Validates if a URL is safe to fetch
 * - Must use HTTP or HTTPS protocol
 * - Cannot target localhost or private IP addresses (SSRF prevention)
 * - Cannot exceed maximum length
 */
export function validateUrl(urlString: string): { valid: boolean; error?: string } {
  // Check length
  if (urlString.length > MAX_URL_LENGTH) {
    return {
      valid: false,
      error: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters`,
    };
  }

  // Parse URL
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }

  // Check protocol
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Only HTTP and HTTPS protocols are allowed',
    };
  }

  // Check for localhost
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1') {
    return {
      valid: false,
      error: 'Localhost URLs are not allowed',
    };
  }

  // Check for private IP addresses
  for (const pattern of PRIVATE_IP_RANGES) {
    if (pattern.test(url.hostname)) {
      return {
        valid: false,
        error: 'Private IP addresses are not allowed',
      };
    }
  }

  return { valid: true };
}

/**
 * Extracts metadata from HTML content
 * Prioritizes Open Graph tags, falls back to standard HTML meta tags
 */
export function extractMetadata(html: string): LinkMetadata {
  try {
    const { document } = parseHTML(html);

    // Try Open Graph tags first
    let title =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null;
    let description =
      document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;
    let thumbnail =
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;

    // Fallback to standard HTML tags
    if (!title) {
      title = document.querySelector('title')?.textContent || null;
    }
    if (!description) {
      description =
        document.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    }

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      thumbnail: thumbnail?.trim() || null,
    };
  } catch {
    // If HTML parsing fails, return null metadata
    return {
      title: null,
      description: null,
      thumbnail: null,
    };
  }
}

/**
 * Fetches and extracts metadata from a URL
 * - Validates URL before fetching
 * - Enforces 10-second timeout
 * - Limits response size to 1MB
 * - Returns null metadata on any error
 */
export async function fetchMetadata(url: string): Promise<LinkMetadata> {
  // Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    return {
      title: null,
      description: null,
      thumbnail: null,
    };
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    // Fetch with timeout
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkManager/1.0)',
      },
    });

    clearTimeout(timeoutId);

    // Check HTTP status
    if (!response.ok) {
      return {
        title: null,
        description: null,
        thumbnail: null,
      };
    }

    // Read response with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      return {
        title: null,
        description: null,
        thumbnail: null,
      };
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_RESPONSE_SIZE) {
        // Stop reading if size limit exceeded
        reader.cancel();
        break;
      }
      chunks.push(value);
    }

    // Decode HTML
    const decoder = new TextDecoder('utf-8');
    const html = decoder.decode(Buffer.concat(chunks));

    // Extract metadata
    return extractMetadata(html);
  } catch (error) {
    // Handle network errors, timeouts, and other failures
    return {
      title: null,
      description: null,
      thumbnail: null,
    };
  }
}
