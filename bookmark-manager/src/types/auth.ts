/**
 * User type (excludes password field for security)
 */
export interface User {
  id: string;
  email: string;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Registration API request body
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Registration API response (success)
 */
export interface RegisterResponse {
  success: true;
  user: Omit<User, 'updatedAt'>;
}

/**
 * Error response for auth APIs
 */
export interface AuthErrorResponse {
  success: false;
  error: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
