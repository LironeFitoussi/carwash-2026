import { z } from "zod";

export const updateCarSizeConfigSchema = z.object({
    label: z.object({
        en: z.string().min(1),
        he: z.string().min(1),
    }).optional(),
    durationMinutes: z.number().int().min(15).max(480).optional(),
});
