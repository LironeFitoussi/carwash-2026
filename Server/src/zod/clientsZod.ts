import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    notes: z.string().optional(),
    carType: z.enum(['small', 'medium', 'large', 'motorcycle']),
    isActive: z.boolean().optional().default(true),
});

export const updateClientSchema = createClientSchema.partial();
