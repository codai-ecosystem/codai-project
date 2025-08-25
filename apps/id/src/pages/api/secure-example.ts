/**
 * @fileoverview Secure API Route Example
 * @description Example of a secure API route with comprehensive protection
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAPIProtection } from '../../middleware/api-security-middleware';
import { requireAuth } from '../../utils/auth-utils';
import { validateInput, userRegistrationSchema } from '../../utils/validation-schemas';
import { InputSanitizer } from '../../middleware/sanitization-middleware';

// Example protected API route
async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            case 'PUT':
                return handlePut(req, res);
            case 'DELETE':
                return handleDelete(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    // Example: Get user data with authentication
    const { user } = req as any;
    
    return res.status(200).json({
        success: true,
        data: {
            id: user.sub,
            email: user.email,
            role: user.role
        }
    });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    // Example: Create new resource with validation and sanitization
    try {
        // Sanitize input
        const sanitizedBody = InputSanitizer.sanitizeObject(req.body);
        
        // Validate input
        const validatedData = validateInput(userRegistrationSchema, sanitizedBody);
        
        // Process the validated and sanitized data
        const result = await processSecurelyData(validatedData);
        
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        throw error;
    }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    // Example: Update resource with authorization check
    const { user } = req as any;
    const { id } = req.query;
    
    // Check if user can update this resource
    if (!canUserUpdateResource(user, id as string)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Sanitize and validate input
    const sanitizedBody = InputSanitizer.sanitizeObject(req.body);
    const validatedData = validateInput(profileUpdateSchema, sanitizedBody);
    
    const result = await updateResourceSecurely(id as string, validatedData);
    
    return res.status(200).json({
        success: true,
        data: result
    });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    // Example: Delete resource with strict authorization
    const { user } = req as any;
    const { id } = req.query;
    
    // Only admins or resource owners can delete
    if (user.role !== 'admin' && !isResourceOwner(user.sub, id as string)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await deleteResourceSecurely(id as string);
    
    return res.status(204).end();
}

// Helper functions (implement according to your business logic)
async function processSecurelyData(data: any) {
    // Implement secure data processing
    return { id: 'new-id', ...data };
}

async function updateResourceSecurely(id: string, data: any) {
    // Implement secure resource update
    return { id, ...data };
}

async function deleteResourceSecurely(id: string) {
    // Implement secure resource deletion
}

function canUserUpdateResource(user: any, resourceId: string): boolean {
    // Implement authorization logic
    return user.role === 'admin' || isResourceOwner(user.sub, resourceId);
}

function isResourceOwner(userId: string, resourceId: string): boolean {
    // Implement ownership check
    return true; // Placeholder
}

// Apply security middleware
export default withAPIProtection(
    requireAuth(['read', 'write'])(handler),
    {
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        },
        requireAuth: true,
        enableCSRFProtection: true,
        maxBodySize: 1024 * 1024 // 1MB
    }
);