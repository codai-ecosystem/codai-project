// Next.js types augmentation for enterprise features
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: Array<{
        id: string;
        name: string;
        displayName: string;
      }>;
      permissions: Array<{
        id: string;
        name: string;
        resource: string;
        action: string;
      }>;
      status: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      mfaEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: string; // For compatibility with existing code
    roles?: Array<{
      id: string;
      name: string;
      displayName: string;
    }>;
    permissions?: Array<{
      id: string;
      name: string;
      resource: string;
      action: string;
    }>;
    status?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    mfaEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    roles: Array<{
      id: string;
      name: string;
      displayName: string;
    }>;
    permissions: Array<{
      id: string;
      name: string;
      resource: string;
      action: string;
    }>;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    mfaEnabled: boolean;
  }
}
