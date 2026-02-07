import { describe, it, expect } from 'vitest';
import { validateUrl, fetchMetadata, extractMetadata } from '@/lib/link-preview';

describe('Link Preview - URL Validation', () => {
  it('accepts valid HTTP URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
  });

  it('accepts valid HTTPS URLs', () => {
    const result = validateUrl('https://example.com');
    expect(result.valid).toBe(true);
  });

  it('rejects FTP protocol', () => {
    const result = validateUrl('ftp://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTP');
  });

  it('rejects file protocol', () => {
    const result = validateUrl('file:///etc/passwd');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTP');
  });

  it('rejects javascript protocol', () => {
    const result = validateUrl('javascript:alert(1)');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTP');
  });

  it('rejects localhost', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Localhost');
  });

  it('rejects 127.0.0.1', () => {
    const result = validateUrl('http://127.0.0.1:8080');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Localhost');
  });

  it('rejects private IP 10.x.x.x', () => {
    const result = validateUrl('http://10.0.0.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects private IP 172.16.x.x', () => {
    const result = validateUrl('http://172.16.0.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects private IP 192.168.x.x', () => {
    const result = validateUrl('http://192.168.1.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects link-local IP 169.254.x.x', () => {
    const result = validateUrl('http://169.254.169.254/latest/meta-data/');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects carrier-grade NAT IP 100.64.x.x', () => {
    const result = validateUrl('http://100.64.0.1');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects IPv6 link-local addresses', () => {
    const result = validateUrl('http://[fe80::1]');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects IPv6 unique local addresses', () => {
    const result = validateUrl('http://[fc00::1]');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Private IP');
  });

  it('rejects URLs exceeding 2048 characters', () => {
    const longUrl = 'http://example.com/' + 'a'.repeat(2100);
    const result = validateUrl(longUrl);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum length');
  });

  it('accepts URLs under 2048 characters', () => {
    const url = 'http://example.com/' + 'a'.repeat(2000);
    const result = validateUrl(url);
    expect(result.valid).toBe(true);
  });
});

describe('Link Preview - Metadata Extraction', () => {
  it('extracts Open Graph title', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Example Page Title" />
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.title).toBe('Example Page Title');
  });

  it('extracts Open Graph description', () => {
    const html = `
      <html>
        <head>
          <meta property="og:description" content="Example description" />
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.description).toBe('Example description');
  });

  it('extracts Open Graph image', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="https://example.com/image.jpg" />
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.thumbnail).toBe('https://example.com/image.jpg');
  });

  it('falls back to HTML title tag', () => {
    const html = `
      <html>
        <head>
          <title>Fallback Title</title>
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.title).toBe('Fallback Title');
  });

  it('falls back to meta description tag', () => {
    const html = `
      <html>
        <head>
          <meta name="description" content="Fallback description" />
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.description).toBe('Fallback description');
  });

  it('prefers Open Graph over HTML tags', () => {
    const html = `
      <html>
        <head>
          <title>HTML Title</title>
          <meta property="og:title" content="OG Title" />
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.title).toBe('OG Title');
  });

  it('returns null for missing fields', () => {
    const html = `
      <html>
        <head>
          <title>Only Title</title>
        </head>
      </html>
    `;
    const metadata = extractMetadata(html);
    expect(metadata.title).toBe('Only Title');
    expect(metadata.description).toBeNull();
    expect(metadata.thumbnail).toBeNull();
  });

  it('handles malformed HTML without crashing', () => {
    const html = '<html><head><title>Broken<';
    const metadata = extractMetadata(html);
    expect(metadata.title).toBe('Broken<');
  });

  it('handles empty HTML', () => {
    const html = '';
    const metadata = extractMetadata(html);
    expect(metadata.title).toBeNull();
    expect(metadata.description).toBeNull();
    expect(metadata.thumbnail).toBeNull();
  });

  it('handles HTML with no metadata', () => {
    const html = '<html><body>Content</body></html>';
    const metadata = extractMetadata(html);
    expect(metadata.title).toBeNull();
    expect(metadata.description).toBeNull();
    expect(metadata.thumbnail).toBeNull();
  });
});

describe('Link Preview - Fetch Metadata (integration)', () => {
  it('handles network errors gracefully', async () => {
    const result = await fetchMetadata('http://this-domain-does-not-exist-12345.com');
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.thumbnail).toBeNull();
  });

  it('handles HTTP 404 errors', async () => {
    const result = await fetchMetadata('https://httpstat.us/404');
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.thumbnail).toBeNull();
  });
});
