import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extended User type (excludes password for security)
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    emailVerified?: Date | null;
  }

  /**
   * Extended Session type
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      emailVerified?: Date | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT type
   */
  interface JWT extends DefaultJWT {
    id?: string;
  }
}
