import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { createKeycloakProvider, createCodaiSSOConfig } from '@codai/sso-sdk';
import prisma from "@/lib/prisma";

// Create SSO configuration for MEMORAI application
const ssoConfig = createCodaiSSOConfig({
  appName: 'memorai',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'memorai-client',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  port: 4002, // MEMORAI enterprise port
  customConfig: {
    // MEMORAI-specific configuration
    scopes: ['openid', 'profile', 'email', 'roles', 'memory'],
    sessionTimeout: 7200, // 2 hours for memory research work
    enableZeroTrust: true,
    enableAuditLogging: true,
    refreshTokenRotation: true
  }
});

// Get the CODAI enterprise auth configuration and merge with MEMORAI-specific settings
const codaiAuthOptions = createKeycloakProvider(ssoConfig);

export const authOptions: NextAuthOptions = {
  ...codaiAuthOptions,
  // Add Prisma adapter for MEMORAI's existing database
  adapter: PrismaAdapter(prisma) as any,

  // Merge callbacks to preserve existing functionality
  callbacks: {
    ...codaiAuthOptions.callbacks,
    async session({ session, token }) {
      // Call the CODAI callback first
      if (codaiAuthOptions.callbacks?.session) {
        session = await codaiAuthOptions.callbacks.session({ session, token });
      }

      // Add MEMORAI-specific session data
      if (session?.user) {
        session.user.id = token.sub!;
        // Preserve any existing role information
        if (!session.user.role && token.role) {
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
};
