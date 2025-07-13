// Mock Next.js Auth types for development
declare module 'next-auth' {
    export interface Session {
        user: {
            id: string;
            email: string;
            name?: string;
            image?: string;
        };
        expires: string;
    }

    export interface NextAuthOptions {
        providers: any[];
        adapter?: any;
        secret?: string;
        pages?: {
            signIn?: string;
            signUp?: string;
            error?: string;
        };
        callbacks?: {
            session?: (params: any) => any;
            jwt?: (params: any) => any;
        };
    }

    export default function NextAuth(options: NextAuthOptions): any;
    export function getServerSession(options?: any): Promise<Session | null>;
}

declare module 'next-auth/react' {
    export function useSession(): {
        data: Session | null;
        status: 'loading' | 'authenticated' | 'unauthenticated';
    };
    export function signIn(provider?: string, options?: any): Promise<any>;
    export function signOut(options?: any): Promise<any>;
    export function getProviders(): Promise<any>;
    export function getSession(): Promise<Session | null>;
}

declare module 'next-auth/middleware' {
    export function withAuth(middleware: any, options?: any): any;
}

declare module 'next-auth/providers/google' {
    export default function GoogleProvider(options: any): any;
}

declare module 'next-auth/providers/github' {
    export default function GithubProvider(options: any): any;
}

declare module 'next-auth/providers/credentials' {
    export default function CredentialsProvider(options: any): any;
}

declare module 'next-auth/jwt' {
    export interface JWT {
        sub?: string;
        email?: string;
        name?: string;
    }
}

declare module '@auth/prisma-adapter' {
    export function PrismaAdapter(prisma: any): any;
}
