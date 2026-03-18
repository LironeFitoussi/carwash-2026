import { z } from "zod";

export const createAppointmentSchema = z.object({
    clientId: z.string().min(1),
    workerId: z.string().min(1),
    serviceType: z.enum(['basic', 'premium', 'deluxe']),
    startTime: z.string().min(1),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional().default('pending'),
    notes: z.string().optional(),
    isPickedUp: z.boolean().optional().default(false),
    pickupLocation: z.string().optional(),
    vehicleType: z.enum(['small', 'regular', 'big']),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();
