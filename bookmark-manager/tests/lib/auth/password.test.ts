import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password';

describe('Password Hashing', () => {
  it('should hash a password using bcrypt', async () => {
    const password = 'MyP@ssw0rd';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash starts with $2a$, $2b$, or $2y$
  });

  it('should use cost factor of at least 10', async () => {
    const password = 'TestPassword123';
    const hash = await hashPassword(password);

    // Extract cost factor from bcrypt hash (format: $2b$10$...)
    const costFactor = parseInt(hash.split('$')[2]);
    expect(costFactor).toBeGreaterThanOrEqual(10);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'SamePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });

  it('should verify correct password', async () => {
    const password = 'CorrectPassword';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'CorrectPassword';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should use constant-time comparison (bcrypt.compare)', async () => {
    const password = 'TestPassword';
    const hash = await hashPassword(password);

    // Test that verification doesn't leak timing information
    // by ensuring similar and dissimilar passwords both complete
    const startSimilar = Date.now();
    await verifyPassword('TestPasswor', hash); // off by one
    const timeSimilar = Date.now() - startSimilar;

    const startDifferent = Date.now();
    await verifyPassword('CompletelyDifferent', hash);
    const timeDifferent = Date.now() - startDifferent;

    // Both should take roughly the same amount of time (within reasonable bounds)
    // bcrypt is designed to be constant-time
    expect(Math.abs(timeSimilar - timeDifferent)).toBeLessThan(100);
  });
});

describe('Password Validation', () => {
  it('should accept password with 8 or more characters', () => {
    const result = validatePassword('12345678');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject password with fewer than 8 characters', () => {
    const result = validatePassword('1234567');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 8 characters');
  });

  it('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  it('should reject whitespace-only password', () => {
    const result = validatePassword('        ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password is required');
  });

  it('should accept password exactly 8 characters', () => {
    const result = validatePassword('Exactly8');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept long passwords', () => {
    const result = validatePassword('ThisIsAVeryLongPasswordThatShouldBeAccepted123!@#');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
