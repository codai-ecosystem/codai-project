"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSchema = exports.MessageSchema = void 0;
const zod_1 = require("zod");
// Message Types
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    payload: zod_1.z.any(),
    timestamp: zod_1.z.number(),
    sender: zod_1.z.string(),
    target: zod_1.z.string().optional(),
    channel: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});
// Event Types
exports.EventSchema = zod_1.z.object({
    type: zod_1.z.string(),
    data: zod_1.z.any(),
    source: zod_1.z.string(),
    timestamp: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
