import { z } from "zod";

export const createWorkerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    specialties: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
});

export const updateWorkerSchema = createWorkerSchema.partial();

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

// Bulk assign: date range + hours
export const assignAvailabilitySchema = z.object({
    workerId: z.string().min(1),
    startDate: z.string().min(1), // "YYYY-MM-DD"
    endDate: z.string().min(1),   // "YYYY-MM-DD"
    startTime: z.string().regex(timeRegex, 'Must be HH:mm format'),
    endTime: z.string().regex(timeRegex, 'Must be HH:mm format'),
});

export const deleteAvailabilitySchema = z.object({
    workerId: z.string().min(1),
    dates: z.array(z.string().min(1)).min(1), // Array of "YYYY-MM-DD"
});
