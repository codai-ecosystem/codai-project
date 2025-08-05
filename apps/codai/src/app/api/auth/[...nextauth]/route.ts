/**
 * CODAI Application - Basic Authentication
 * NextAuth.js configuration with basic providers
 */

import NextAuth from 'next-auth';

// Export NextAuth configuration - Basic setup for deployment
const handler = NextAuth({
  providers: [
    // Basic provider setup - can be enhanced later
  ],
  session: {
    strategy: 'jwt',
    maxAge: 3600, // 1 hour
  },
  callbacks: {
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
