import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt with cost factor of 10
 * @param password - Plain text password to hash
 * @returns Promise that resolves to the bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash using constant-time comparison
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise that resolves to true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password meets minimum security requirements
 * @param password - Password to validate
 * @returns Object with valid boolean and optional error message
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  // Check if password is empty or whitespace-only
  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      error: 'Password is required',
    };
  }

  // Check minimum length
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  return { valid: true };
}
