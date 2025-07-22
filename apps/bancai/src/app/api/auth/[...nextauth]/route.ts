import { createCodaiAuth } from '@codai/sso-sdk';
import { createCodaiSSOConfig } from '@codai/sso-sdk/config';
import NextAuth from 'next-auth';

const ssoConfig = createCodaiSSOConfig({
    name: 'BANCAI',
    port: 4003,
    sessionMaxAge: 2 * 60 * 60, // 2 hours for banking security
    scopes: ['banking', 'transactions', 'admin'],
    requiredRoles: ['user', 'banker', 'admin'],
    mfaRequired: true, // Enhanced security for banking
    deviceVerificationRequired: true
});

const authOptions = createCodaiAuth(ssoConfig);
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
