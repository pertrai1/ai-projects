import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from './password';

export const authOptions: NextAuthOptions = {
  // Configure Prisma Adapter (for OAuth providers, Account, VerificationToken models)
  // Note: Not used with CredentialsProvider, but ready for future OAuth integration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  // Configure session strategy to use JWT (required for CredentialsProvider)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Configure providers
  providers: [
    // Credentials Provider for email/password authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return null;
        }

        // Verify password using bcrypt.compare
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  // Configure callbacks
  callbacks: {
    async session({ session, token }) {
      // Add user id to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user id to JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },

  // Configure pages (using default NextAuth pages for now)
  pages: {
    signIn: '/auth/signin',
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};
