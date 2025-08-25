import { createEnhancedRegisterEndpoint } from '@codai/api-utils/auth';
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Kodex Registration API
 * Migrated to use @codai/api-utils standardized auth utilities with Prisma integration
 */

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Create standardized register endpoint with Prisma database integration
const registerEndpoint = createEnhancedRegisterEndpoint({
  service: 'Kodex',
  version: '1.0.0',
  cookieName: 'kodex_auth_token',
  onSuccess: async (user, request) => {
    console.log(`[Kodex] User registered successfully: ${user.email} (${user.name})`);

    try {
      // Enhanced registration flow with actual database integration
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

      // Create user in Prisma with preferences
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

      console.log(`[Kodex] User created in database:`, createdUser);

    } catch (error: any) {
      console.error(`[Kodex] Database integration error:`, error.message);

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
    console.error(`[Kodex] Registration failed:`, error.message);
  },
  customValidator: async (request) => {
    try {
      // Pre-validate with Zod schema
      const body = await request.json();
      const validatedData = registerSchema.parse(body);
      return true;
    } catch (error: any) {
      console.error(`[Kodex] Pre-validation failed:`, error.message);
      return false;
    }
  }
});

export const { POST } = registerEndpoint;
