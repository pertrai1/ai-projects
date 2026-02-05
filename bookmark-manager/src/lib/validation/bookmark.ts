import { z } from 'zod';

/**
 * URL validation utilities
 */

const MAX_URL_LENGTH = 2048;

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
 * Zod schema for URL validation with security checks
 */
export const urlSchema = z.string().superRefine((url, ctx) => {
  const result = validateUrl(url);
  if (!result.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error || 'Invalid URL',
    });
  }
});

/**
 * Zod schema for creating a bookmark
 */
export const createBookmarkSchema = z.object({
  url: urlSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

/**
 * Zod schema for updating a bookmark
 */
export const updateBookmarkSchema = z.object({
  url: urlSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

/**
 * Zod schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
