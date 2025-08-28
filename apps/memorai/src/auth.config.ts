import type { DefaultSession } from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub
      }
      if (token.role) {
        session.user.role = token.role
      }
      return session
    },
    jwt: ({ user, token }) => {
      if (user) {
        token.sub = user.id
        if (user.role) {
          token.role = user.role
        }
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
}