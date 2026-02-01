import { describe, it, expect } from 'vitest';
import { authOptions } from '@/lib/auth/config';

describe('NextAuth Configuration', () => {
  it('should have Credentials Provider configured', () => {
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers.length).toBeGreaterThan(0);

    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );
    expect(credentialsProvider).toBeDefined();
  });

  it('should have Prisma Adapter configured', () => {
    expect(authOptions.adapter).toBeDefined();
  });

  it('should use JWT session strategy (required for CredentialsProvider)', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('should have session configuration', () => {
    expect(authOptions.session).toBeDefined();
    expect(authOptions.session?.maxAge).toBeDefined();
  });

  it('should have callbacks configured', () => {
    expect(authOptions.callbacks).toBeDefined();
    expect(authOptions.callbacks?.session).toBeDefined();
  });

  it('should have authorize function in Credentials Provider', () => {
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );

    expect(credentialsProvider).toBeDefined();
    // @ts-expect-error - accessing internal provider structure
    expect(credentialsProvider?.authorize).toBeDefined();
    // @ts-expect-error - accessing internal provider structure
    expect(typeof credentialsProvider?.authorize).toBe('function');
  });
});
