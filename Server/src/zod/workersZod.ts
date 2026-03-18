import { z } from "zod";

export const createWorkerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    specialties: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
});

export const updateWorkerSchema = createWorkerSchema.partial();
