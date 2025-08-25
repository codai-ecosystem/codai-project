import { createEnhancedRegisterEndpoint } from '@codai/api-utils/auth';
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * StudiAI Registration API
 * Migrated to use @codai/api-utils standardized auth utilities with Prisma integration
 */

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Create standardized register endpoint with StudiAI-specific Prisma integration
const registerEndpoint = createEnhancedRegisterEndpoint({
  service: 'StudiAI',
  version: '1.0.0',
  cookieName: 'studiai_auth_token',
  onSuccess: async (user, request) => {
    console.log(`[StudiAI] User registered successfully: ${user.email} (${user.name})`);

    try {
      // Enhanced registration flow with StudiAI Prisma database integration
      const body = await request.json();
      const validatedData = registerSchema.parse(body);
      const { name, email, password } = validatedData;

      // Check if user already exists in Prisma
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Prisma with StudiAI preferences
      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
          preferences: {
            create: {
              theme: "light",
              language: "en",
              emailNotifications: true,
              pushNotifications: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      console.log(`[StudiAI] User created in database:`, createdUser);

    } catch (error: any) {
      console.error(`[StudiAI] Database integration error:`, error.message);

      // Handle Zod validation errors
      if (error.name === "ZodError") {
        throw new Error(error.errors[0].message);
      }

      // Handle Prisma constraint errors
      if (error.code === 'P2002') {
        throw new Error('User with this email already exists');
      }

      throw error;
    }
  },
  onFailure: async (error, request) => {
    console.error(`[StudiAI] Registration failed:`, error.message);
  },
  customValidator: async (request) => {
    try {
      // Pre-validate with Zod schema for StudiAI
      const body = await request.json();
      const validatedData = registerSchema.parse(body);
      return true;
    } catch (error: any) {
      console.error(`[StudiAI] Pre-validation failed:`, error.message);
      return false;
    }
  }
});

export const { POST } = registerEndpoint;
