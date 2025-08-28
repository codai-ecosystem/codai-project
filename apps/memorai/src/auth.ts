import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { z } from 'zod'

// User authentication schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Mock user store - replace with your actual database
const users = [
  {
    id: '1',
    email: 'admin@memorai.dev',
    password: '$2a$12$Q9Y6oJn4qA7I2kL8sL2nW.uJmq4k5Y5YpYoJn4qA7I2kL8sL2nW.u', // 'password123'
    name: 'MemorAI Admin',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@memorai.dev',
    password: '$2a$12$Q9Y6oJn4qA7I2kL8sL2nW.uJmq4k5Y5YpYoJn4qA7I2kL8sL2nW.u', // 'password123'
    name: 'MemorAI User',
    role: 'user',
  },
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    }),
    
    // Credentials Provider
    Credentials({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email', 
          placeholder: 'your.email@example.com' 
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        },
      },
      async authorize(credentials) {
        try {
          // Validate credentials format
          const validatedFields = loginSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            return null
          }
          
          const { email, password } = validatedFields.data
          
          // Find user - replace with your database query
          const user = users.find(u => u.email === email)
          
          if (!user) {
            return null
          }
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password)
          
          if (!isPasswordValid) {
            return null
          }
          
          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env['NEXTAUTH_SECRET']!,
})