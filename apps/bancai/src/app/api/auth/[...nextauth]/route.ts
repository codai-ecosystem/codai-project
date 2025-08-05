import { createCodaiSSOConfig, createKeycloakProvider } from '../../../../lib/sso-sdk';
import NextAuth from 'next-auth';

const ssoConfig = createCodaiSSOConfig({
    appName: 'BANCAI',
    clientId: 'bancai',
    clientSecret: process.env.BANCAI_CLIENT_SECRET || 'dev-secret',
    port: 4005,
    customConfig: {
        sessionTimeout: 2 * 60 * 60, // 2 hours for banking security
        scopes: ['openid', 'profile', 'email', 'roles', 'banking', 'transactions'],
        enableZeroTrust: true,
        enableAuditLogging: true
    }
});

const authOptions = createKeycloakProvider(ssoConfig);
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
