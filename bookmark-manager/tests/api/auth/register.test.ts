import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Helper to make API requests
async function registerUser(email?: string, password?: string) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return { response, data };
}

// Integration tests - require running dev server (npm run dev)
// Skip in CI/normal test runs, run manually for integration testing
describe.skip('POST /api/auth/register', () => {
  beforeEach(async () => {
    // Clean up test users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
  });

  it('should successfully register with valid email and password', async () => {
    const { response, data } = await registerUser(
      'test@example.com',
      'ValidPassword123'
    );

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.password).toBeUndefined(); // Password should not be returned

    // Verify user was created in database
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(user).toBeDefined();
    expect(user?.password).toMatch(/^\$2[aby]\$/); // Password should be hashed
  });

  it('should reject duplicate email', async () => {
    // Create first user
    await registerUser('duplicate@example.com', 'Password123');

    // Try to create duplicate
    const { response, data } = await registerUser(
      'duplicate@example.com',
      'DifferentPassword'
    );

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email already registered');
  });

  it('should reject invalid email format', async () => {
    const { response, data } = await registerUser(
      'notanemail',
      'ValidPassword'
    );

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email format');
  });

  it('should reject short password (< 8 chars)', async () => {
    const { response, data } = await registerUser('test@example.com', 'Short1');

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Password must be at least 8 characters');
  });

  it('should reject missing email', async () => {
    const { response, data } = await registerUser(undefined, 'ValidPassword');

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email is required');
  });

  it('should reject missing password', async () => {
    const { response, data } = await registerUser('test@example.com', undefined);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Password is required');
  });

  it('should reject non-POST requests', async () => {
    const getResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'GET',
    });

    expect(getResponse.status).toBe(405);

    const putResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });

    expect(putResponse.status).toBe(405);
  });
});
