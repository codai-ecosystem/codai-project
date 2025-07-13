import { z } from 'zod';
// Message Types
export const MessageSchema = z.object({
    id: z.string(),
    type: z.string(),
    payload: z.any(),
    timestamp: z.number(),
    sender: z.string(),
    target: z.string().optional(),
    channel: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});
// Event Types
export const EventSchema = z.object({
    type: z.string(),
    data: z.any(),
    source: z.string(),
    timestamp: z.number(),
    metadata: z.record(z.string(), z.any()).optional(),
});
